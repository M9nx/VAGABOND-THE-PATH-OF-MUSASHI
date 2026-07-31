import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://vagabond-tribute.example.com',
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
