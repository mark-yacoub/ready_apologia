import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap()],
  // Set the base path to match the GitHub repository name
  site: process.env.GITHUB_ACTIONS ? 'https://mark-yacoub.github.io' : 'http://localhost:8080',
  base: '/ready_apologia',
  // Since we are doing Scenario A (Static Site), we want 'static' output (default)
  output: 'static',
});
