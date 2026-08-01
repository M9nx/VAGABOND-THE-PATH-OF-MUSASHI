import { defineConfig } from 'astro/config';

// Project Pages site:
// https://M9nx.github.io/VAGABOND-THE-PATH-OF-MUSASHI/
export default defineConfig({
  site: 'https://M9nx.github.io',
  base: '/VAGABOND-THE-PATH-OF-MUSASHI',
  output: 'static',
  compressHTML: true,
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
