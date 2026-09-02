// Read this site's own newest release notes, in both locales, into
// apps/web/src/generated/site-release.json.
//
// WHAT IT READS is RELEASE_NOTES-en.md and RELEASE_NOTES-fr.md at the root of this
// repository — what changed on killmutants.io, one section per `release/*` tag, written
// by hand before the tag that names it is pushed. Only the newest RELEASED section, never
// `## Unreleased`: that section is the drafting surface, and /version shows what shipped.
//
// THE TWO FILES ARE ONE DOCUMENT IN TWO LANGUAGES, checked here: the newest release (and
// each of the "previous" ones actually present) must name the same tag and carry the same
// number of rubrics, each with the same number of bullets — a half-translated release
// would otherwise render on /version with English and French silently out of step.
//
// UNLIKE justdummies.io's generator, THIS ONE DOES NOT REFUSE WHEN NOTHING HAS SHIPPED
// YET. A brand-new site legitimately has zero releases, and refusing to build over that
// would make this script impossible to introduce before the first tag exists. When no
// released section is found (in either language), it writes
// { latest: null, previous: [], moreTag: null } instead, and the /version page shows a
// "no releases yet" state.
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
const LOCALES = ['en', 'fr'];
const PREVIOUS_COUNT = 5;

function fileOf(locale) {
  return `RELEASE_NOTES-${locale}.md`;
}

function refuse(message) {
  throw new Error(`generate-release-note: ${message}`);
}

const resolveLink = githubHrefResolver({ repositoryUrl: REPOSITORY_URL, siteOrigin: SITE_ORIGIN });
const { releasesOf, isoDateOf } = releaseNotesReader({ refuse, resolveLink });

const markdowns = Object.fromEntries(LOCALES.map((locale) => [locale, readFileSync(join(root, fileOf(locale)), 'utf8')]));

const releases = Object.fromEntries(
  LOCALES.map((locale) => [locale, releasesOf(markdowns[locale], fileOf(locale), { skip: (heading) => heading === 'Unreleased' })]),
);

mkdirSync(destinationDir, { recursive: true });

if (releases.en.length === 0 && releases.fr.length === 0) {
  writeFileSync(destination, JSON.stringify({ latest: null, previous: [], moreTag: null }, null, 2) + '\n');
  console.log('  apps/web/src/generated/site-release.json  (no releases yet)');
  process.exit(0);
}

if (releases.en.length !== releases.fr.length) {
  refuse(`${fileOf('en')} has ${releases.en.length} release(s) but ${fileOf('fr')} has ${releases.fr.length}`);
}

/** The two languages are one document in two spellings, joined by position — a rubric
 *  count match is not enough, since a rubric with three bullets in English and one in
 *  French would still pass it and then render a half-translated card. */
function checkAgree(en, fr, index) {
  if (fr.version !== en.version) {
    refuse(`${fileOf('en')} names release #${index + 1} "${en.version}" but ${fileOf('fr')} names it "${fr.version}"`);
  }
  if (fr.sections.length !== en.sections.length) {
    refuse(
      `${fileOf('en')} and ${fileOf('fr')} disagree on ${en.version}: ${en.sections.length} rubric(s) against ${fr.sections.length}`,
    );
  }

  en.sections.forEach((section, sectionIndex) => {
    const twin = fr.sections[sectionIndex];

    if (twin.items.length !== section.items.length) {
      refuse(
        `${fileOf('en')} and ${fileOf('fr')} disagree on ${en.version}, rubric ${sectionIndex + 1} ` +
          `("${section.label}" against "${twin.label}"): ${section.items.length} bullet(s) against ${twin.items.length}`,
      );
    }
  });
}

function releaseDocumentAt(index) {
  const en = releases.en[index];
  const fr = releases.fr[index];

  checkAgree(en, fr, index);

  return {
    tag: en.version,
    // One ISO date for both languages, read from the English file: the French twin
    // spells the same day differently, which is a spelling and not a second fact.
    date: isoDateOf(en.date, fileOf('en')),
    locales: {
      en: { summaryHtml: en.summaryHtml, sections: en.sections },
      fr: { summaryHtml: fr.summaryHtml, sections: fr.sections },
    },
  };
}

const latest = releaseDocumentAt(0);
const previousCount = Math.min(PREVIOUS_COUNT, releases.en.length - 1);
const previous = Array.from({ length: previousCount }, (_unused, offset) => releaseDocumentAt(offset + 1));

// The tag right past `previous`'s last entry, for the "view more on GitHub" link — null
// once the files' whole history fits in latest + previous.
const moreIndex = previousCount + 1;
const moreTag = moreIndex < releases.en.length ? releases.en[moreIndex].version : null;

if (moreTag !== null && releases.fr[moreIndex].version !== moreTag) {
  refuse(`${fileOf('en')} names its release #${moreIndex + 1} "${moreTag}" but ${fileOf('fr')} names it "${releases.fr[moreIndex].version}"`);
}

const document = { latest, previous, moreTag };

writeFileSync(destination, JSON.stringify(document, null, 2) + '\n');
console.log(`  apps/web/src/generated/site-release.json  (latest: ${latest.tag}, + ${previous.length} previous)`);
