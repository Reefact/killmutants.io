// Stamp the build with what it is: version.json.
//
// It answers "which release is live" — a release/* tag is the unit of publication
// (same convention as justdummies.io). Written by the build, from git, before the
// site is built, into src/generated/ so the /version page can import it. Not
// committed: it changes on every build by construction (see .gitignore).
//
// A Node script rather than a shell one so it runs the same way on Windows, macOS,
// and Linux without requiring Git Bash or WSL.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const generated = join(root, 'apps', 'web', 'src', 'generated');
mkdirSync(generated, { recursive: true });

function git(args) {
  try {
    return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

// --points-at rather than `git describe`: a release is the tag on THIS commit,
// never the nearest one behind it.
const release =
  git(['tag', '--points-at', 'HEAD'])
    .split('\n')
    .find((tag) => tag.startsWith('release/')) || '';
const commit = git(['rev-parse', 'HEAD']);

// CI checks out a tag as a detached HEAD, which does not always leave a local tag
// ref behind — GITHUB_REF_NAME is the second source for the same fact.
let finalRelease = release;
const { GITHUB_REF_TYPE, GITHUB_REF_NAME } = process.env;
const ciRelease = GITHUB_REF_TYPE === 'tag' && GITHUB_REF_NAME?.startsWith('release/') ? GITHUB_REF_NAME : '';

if (!release && ciRelease) {
  finalRelease = ciRelease;
  console.error('  ! no local tag ref, so the release name comes from GITHUB_REF_NAME');
} else if (release && ciRelease && release !== ciRelease) {
  console.error(`generate-version: HEAD carries ${release}, but this run is for ${ciRelease}.`);
  console.error('  Refusing to guess which one is being published.');
  process.exit(1);
}

if (!commit) {
  console.error('  ! no git metadata here, so version.json cannot name a commit');
}

const document = {
  release: finalRelease || null,
  commit: commit || null,
  built: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
};

writeFileSync(join(generated, 'version.json'), JSON.stringify(document, null, 2) + '\n');

console.log(
  `  apps/web/src/generated/version.json  (release: ${finalRelease || 'none'}, commit: ${commit ? commit.slice(0, 7) : 'none'})`,
);
