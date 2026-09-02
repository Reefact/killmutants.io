// Build the site and stamp it: generate what the /version page needs, build, then
// copy version.json beside the built site so it is also servable on its own at
// /version.json (same approach as justdummies.io).
import { execFileSync } from 'node:child_process';
import { copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
}

run(process.execPath, [join(root, 'scripts', 'generate-version.mjs')]);
run(process.execPath, [join(root, 'scripts', 'generate-release-note.mjs')]);
run('pnpm', ['--filter', '@killmutants/web', 'build']);

copyFileSync(join(root, 'apps', 'web', 'src', 'generated', 'version.json'), join(root, 'dist', 'version.json'));
