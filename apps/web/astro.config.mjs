// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://killmutants.io',

  // The whole deployment is one static directory at the repository root,
  // matching the "assets.directory" path in the root wrangler.jsonc.
  outDir: '../../dist',

  build: {
    format: 'directory',
  },
});
