import { defineConfig } from 'astro/config';

// Project Pages site:
// https://M9nx.github.io/Vagabond-Landing-Page/
export default defineConfig({
  site: 'https://M9nx.github.io',
  base: '/Vagabond-Landing-Page',
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
