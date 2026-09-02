// Build the site and stamp it: generate what the /version page needs, build, then
// copy version.json beside the built site so it is also servable on its own at
// /version.json (same approach as justdummies.io).
import { execFileSync, execSync } from 'node:child_process';
import { copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// node itself never needs a shell — process.execPath is an absolute path to the
// binary, invoked directly, so a space in "C:\Program Files\nodejs\node.exe" is
// never re-parsed as a command separator.
function runNode(script) {
  execFileSync(process.execPath, [join(root, 'scripts', script)], { cwd: root, stdio: 'inherit' });
}

runNode('generate-version.mjs');
runNode('generate-release-note.mjs');

// pnpm is a .cmd shim on Windows, which only a shell knows how to run — execSync
// is built for exactly that (one command string, always through a shell), unlike
// execFileSync's { shell: true }, which Node warns is unsafe once args are involved.
execSync('pnpm --filter @killmutants/web build', { cwd: root, stdio: 'inherit' });

copyFileSync(join(root, 'apps', 'web', 'src', 'generated', 'version.json'), join(root, 'dist', 'version.json'));
