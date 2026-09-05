// @ts-check
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'astro/config';

import dropUnreferencedAssets from './integrations/drop-unreferenced-assets.mjs';

export default defineConfig({
  site: 'https://killmutants.io',

  integrations: [dropUnreferencedAssets()],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      // English is served at the root, unprefixed. `/fr/` carries the French.
      prefixDefaultLocale: false,
      // No automatic redirection: it breaks shared links and previews, and it stops
      // a French reader from deliberately reading the English page. The language
      // selector is explicit, and it is the only thing that moves a visitor
      // between locales.
      redirectToDefaultLocale: false,
    },
  },

  image: {
    // Encoder settings belong here rather than on each `<Picture>`: the
    // component's own `quality` prop is a single number handed to every format
    // at once, and "good AVIF" and "good JPEG" are nowhere near the same
    // number. Set per format, the site's dark, grainy key art keeps the grain
    // that is the whole point of its art direction, instead of dissolving into
    // the flat patches one shared quality gives it.
    //
    // The numbers are measured, not guessed — PSNR of assets/brand/banner.png
    // against the size a 2560x1440 screen actually paints the hero at (3361px
    // wide; see HeroBackground.astro on why that is not 2560):
    //
    //   the old hand-made 1440px JPEG   224 kB   28.0 dB
    //   avif  q50 / q55 / q62           176 / 206 / 259 kB   32.5 / 33.6 / 35.1 dB
    //   webp  q80                       373 kB   35.2 dB
    //   jpeg  q84 (mozjpeg)             411 kB   33.9 dB
    //
    // AVIF q62 is the tier a modern browser gets: +7 dB on the file it
    // replaces for 35 kB more. WebP q80 is set to *match* that 35 dB rather
    // than to some round number of its own, so a browser without AVIF sees the
    // same picture and only pays more for it. The JPEG is the fallback almost
    // nobody is served, and chasing the other two there costs 70 kB for
    // browsers that are not the reason this artwork was reworked, so it stops
    // at q84 with mozjpeg's trellis quantisation and a progressive scan.
    //
    // `effort` is likewise measured: on grain this dense, AVIF effort 6 spends
    // 29s per image to land within 2% of what effort 3 finds in 2s (264 kB vs
    // 259 kB) — twelve times the build for nothing. WebP's effort is cheap
    // enough (under a second) to just max out.
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        avif: { quality: 62, effort: 3 },
        webp: { quality: 80, effort: 6, smartSubsample: true },
        jpeg: { quality: 84, progressive: true, mozjpeg: true },
      },
    },
  },

  // The whole deployment is one static directory at the repository root,
  // matching the "assets.directory" path in the root wrangler.jsonc.
  outDir: '../../dist',

  build: {
    format: 'directory',
  },

  vite: {
    resolve: {
      alias: {
        // The brand originals are repository-level, not app-level (`assets/brand/`
        // — see design/landing-mockup/README.md), so a component reaches them
        // through this alias rather than a `../../../../` climb out of `src/`.
        // They are imported, never copied into `public/`: an import is what puts
        // them through `astro:assets`, which is where every derived size and
        // format comes from.
        '@brand': fileURLToPath(new URL('../../assets/brand', import.meta.url)),
      },
    },
  },
});
