import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap({ entryLimit: 10000 })],
  // Set site URL from environment or default to production domain
  site: process.env.SITE_URL || 'https://readyapologia.com',
  base: '/',
  // Since we are doing Scenario A (Static Site), we want 'static' output (default)
  output: 'static',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});
