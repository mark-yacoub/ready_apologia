import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  // Set the base path to match the GitHub repository name
  site: 'https://mark-yacoub.github.io',
  base: '/ready_apologia',
  // Since we are doing Scenario A (Static Site), we want 'static' output (default)
  output: 'static',
});
