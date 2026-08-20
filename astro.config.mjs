import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

/**
 * L6 O(1) Path-Segment Router for 77,000+ SSG pages.
 * Determines sitemap crawl priority and change frequency without regex execution.
 */
function resolveSitemapMetadata(pathname) {
  const cleanPath = pathname.replace(/\/$/, '') || '/';
  if (cleanPath === '/') {
    return { changefreq: 'weekly', priority: 1.0 };
  }

  const segments = cleanPath.split('/').filter(Boolean);
  const rootSection = segments[0]; // e.g., 'bible', 'quran', 'discover'

  // Top-level hub pages (/bible, /quran, /discover, /evidence)
  if (segments.length === 1) {
    return { changefreq: 'weekly', priority: 1.0 };
  }

  // Apologetics Evidence Topics (/evidence/*)
  if (rootSection === 'evidence') {
    return { changefreq: 'monthly', priority: 0.9 };
  }

  // Discover deep-dive articles & Quran Codices / Variants
  if (rootSection === 'discover' || (rootSection === 'quran' && (segments[1] === 'codex' || segments[1] === 'variant'))) {
    return { changefreq: 'monthly', priority: 0.8 };
  }

  // Bible / Quran Scripture hierarchy
  switch (segments.length) {
    case 2: // Book or Surah index (e.g., /bible/jn, /quran/1)
      return { changefreq: 'monthly', priority: 0.9 };
    case 3: // Chapter or Ayah index (e.g., /bible/jn/1, /quran/1/1)
      return { changefreq: 'monthly', priority: 0.8 };
    case 4: // Main Verse / Ayah page (e.g., /bible/jn/1/1)
      return { changefreq: 'monthly', priority: 0.7 };
    case 5: // Evidence Drawer Tab (e.g., /bible/jn/1/1/contradictions)
    default: {
      const tabName = segments[segments.length - 1];
      const isVideoTab = tabName === 'videos';
      return { changefreq: 'monthly', priority: isVideoTab ? 0.4 : 0.5 };
    }
  }
}

export default defineConfig({
  devToolbar: { enabled: false },
  integrations: [
    react(),
    sitemap({
      entryLimit: 10000,
      filter: (page) => {
        const url = new URL(page);
        const path = url.pathname.replace(/\/$/, '');
        return !path.includes('/404');
      },
      serialize: (item) => {
        const url = new URL(item.url);
        const metadata = resolveSitemapMetadata(url.pathname);
        item.changefreq = metadata.changefreq;
        item.priority = metadata.priority;
        return item;
      }
    })
  ],
  site: process.env.SITE_URL || 'https://readyapologia.com',
  base: '/',
  output: 'static',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});
