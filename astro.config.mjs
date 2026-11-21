import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  site: 'https://www.onsimplicity.net', output: 'static', trailingSlash: 'always',
  build: { format: 'directory' }, integrations: [sitemap({filter: (page) => !page.endsWith('/404/')})],
  vite: {plugins: [tailwindcss()]}
});
