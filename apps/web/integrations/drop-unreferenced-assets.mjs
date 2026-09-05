import { readFile, readdir, stat, unlink } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Importing an image is what puts it through `astro:assets` — and Astro then
 * copies the *original* into `dist/_astro/` as well, unconditionally and with
 * no option to say otherwise, even when every `<Picture>` on the site links
 * only the derived variants. For the brand key art that is 5.7 MB of PNG
 * nothing ever requests: more than half the deployed site, downloadable at a
 * guessable URL, re-uploaded on every deploy.
 *
 * So: once the build has written everything and every reference is final,
 * delete the image files whose names appear nowhere in the built output. An
 * asset that nothing names is an asset nothing can fetch — which is why the
 * check is "is it referenced", not "is it one of the brand originals": it
 * stays correct as pages come and go, and it removes nothing that is in use.
 *
 * Only raster images are ever considered. They are leaves — a `.png` cannot
 * reference another file, so nothing is lost by not reading one. Text output
 * (HTML, CSS, JS, JSON, …) is all haystack and never a candidate, and SVG,
 * which is both at once, is deliberately left out of the candidates.
 */
const PRUNABLE = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.tiff']);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(path) : [path];
    }),
  );
  return files.flat();
}

export default function dropUnreferencedAssets() {
  return {
    name: 'killmutants:drop-unreferenced-assets',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const files = await filesUnder(fileURLToPath(dir));
        const candidates = files.filter((file) => PRUNABLE.has(extname(file).toLowerCase()));
        const haystack = files.filter((file) => !PRUNABLE.has(extname(file).toLowerCase()));

        const referenced = (await Promise.all(haystack.map((file) => readFile(file, 'utf8').catch(() => '')))).join('\n');

        let freed = 0;
        for (const candidate of candidates) {
          if (referenced.includes(basename(candidate))) continue;
          freed += (await stat(candidate)).size;
          await unlink(candidate);
        }

        if (freed > 0) logger.info(`Dropped ${(freed / 1024 / 1024).toFixed(1)} MB of unreferenced images`);
      },
    },
  };
}
