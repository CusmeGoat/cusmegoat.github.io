import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://cusmegoat.github.io',
  output: 'static',
  cacheDir: fileURLToPath(new URL('./tmp/astro-cache/', import.meta.url)),
});
