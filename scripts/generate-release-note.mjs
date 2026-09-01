// Read this site's own newest release notes into apps/web/src/generated/site-release.json.
//
// WHAT IT READS is RELEASE_NOTES.md at the root of this repository — what changed on
// killmutants.io, one section per `release/*` tag, written by hand before the tag that
// names it is pushed. Only the newest RELEASED section, never `## Unreleased`: that
// section is the drafting surface, and /version shows what shipped, not what will.
//
// UNLIKE justdummies.io's generator, THIS ONE DOES NOT REFUSE WHEN NOTHING HAS SHIPPED
// YET. A brand-new site legitimately has zero releases, and refusing to build over that
// would make this script impossible to introduce before the first tag exists. When no
// released section is found, it writes { latest: null, previous: [] } instead, and the
// /version page shows a "no releases yet" state.
//
//   node scripts/generate-release-note.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { githubHrefResolver, releaseNotesReader } from './lib/release-notes-markdown.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const destinationDir = join(root, 'apps', 'web', 'src', 'generated');
const destination = join(destinationDir, 'site-release.json');

const REPOSITORY_URL = 'https://github.com/Reefact/killmutants.io';
const SITE_ORIGIN = 'https://killmutants.io';
const FILE = 'RELEASE_NOTES.md';
const PREVIOUS_COUNT = 5;

function refuse(message) {
  throw new Error(`generate-release-note: ${message}`);
}

const resolveLink = githubHrefResolver({ repositoryUrl: REPOSITORY_URL, siteOrigin: SITE_ORIGIN });
const { releasesOf, isoDateOf } = releaseNotesReader({ refuse, resolveLink });

const markdown = readFileSync(join(root, FILE), 'utf8');
const releases = releasesOf(markdown, FILE, { skip: (heading) => heading === 'Unreleased' });

mkdirSync(destinationDir, { recursive: true });

if (releases.length === 0) {
  writeFileSync(destination, JSON.stringify({ latest: null, previous: [], moreTag: null }, null, 2) + '\n');
  console.log('  apps/web/src/generated/site-release.json  (no releases yet)');
  process.exit(0);
}

const [latest, ...rest] = releases;
const previous = rest.slice(0, PREVIOUS_COUNT);

const document = {
  latest: {
    tag: latest.version,
    date: isoDateOf(latest.date, FILE),
    summaryHtml: latest.summaryHtml,
    sections: latest.sections,
  },
  previous: previous.map((release) => ({
    tag: release.version,
    date: isoDateOf(release.date, FILE),
    summaryHtml: release.summaryHtml,
    sections: release.sections,
  })),
  /** The tag right past the last one shown, for the "view more on GitHub" link — null
   *  once the file's whole history fits in latest + previous. */
  moreTag: rest.length > PREVIOUS_COUNT ? rest[PREVIOUS_COUNT].version : null,
};

writeFileSync(destination, JSON.stringify(document, null, 2) + '\n');
console.log(`  apps/web/src/generated/site-release.json  (latest: ${latest.version})`);
