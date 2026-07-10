import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap()],
  // Set site URL from environment or default to localhost for development
  site: process.env.SITE_URL || 'http://localhost:8080',
  base: '/',
  // Since we are doing Scenario A (Static Site), we want 'static' output (default)
  output: 'static',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});
