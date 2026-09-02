// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://killmutants.io',

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

  // The whole deployment is one static directory at the repository root,
  // matching the "assets.directory" path in the root wrangler.jsonc.
  outDir: '../../dist',

  build: {
    format: 'directory',
  },
});
