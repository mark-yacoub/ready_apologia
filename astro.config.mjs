import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  // Since we are doing Scenario A (Static Site), we want 'static' output (default)
  output: 'static',
});
