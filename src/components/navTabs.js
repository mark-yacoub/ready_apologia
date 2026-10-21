/**
 * Shared app-level navigation (bottom tab bar on mobile, vertical tabs in the desktop sidebar).
 * One definition of the three tabs and one hook for "which tab is active" and "where does the
 * Scriptures tab go", so BottomNav.jsx and ScriptureNav.jsx cannot drift apart.
 */
import { useEffect, useState } from 'react';
import { DEFAULT_SCRIPTURE_PATH } from '../utils/routes.js';

const getBase = () => (import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL);

/** `icon` is the SVG path for a 24×24, stroke-only icon; each component draws it at its own size. */
export const NAV_TABS = [
  {
    id: 'scripture',
    label: 'Scriptures',
    path: null, // resolved per reader: last Bible/Quran page, else DEFAULT_SCRIPTURE_PATH
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    id: 'evidence',
    label: 'Evidence',
    path: '/evidence',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    id: 'discover',
    label: 'Discover',
    path: '/discover',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
];

/** "/evidence/…" → 'evidence', "/discover/…" → 'discover', everything else → 'scripture'. */
export function activeTabFor(pathname) {
  const base = getBase();
  const path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const tab = NAV_TABS.find(t => t.path && (path === t.path || path.startsWith(`${t.path}/`)));
  return tab ? tab.id : 'scripture';
}

/** Last Bible/Quran page the reader opened (Layout.astro records it), else the default chapter. */
function scriptureUrlFromStorage() {
  const fallback = `${getBase()}${DEFAULT_SCRIPTURE_PATH}`;
  try {
    return localStorage.getItem('lastVisitedUrl') || fallback;
  } catch {
    return fallback; // private browsing / storage disabled
  }
}

/**
 * Active tab + the href for each tab, kept in sync across Astro ClientRouter navigations.
 * Never sends the Scriptures tab to "/": the root restores the last *app* page, which may be a
 * Discover or Evidence page, so the tab would bounce the reader back where they were.
 */
export function useNavTabs() {
  const [activeTab, setActiveTab] = useState('scripture');
  const [scriptureUrl, setScriptureUrl] = useState(`${getBase()}${DEFAULT_SCRIPTURE_PATH}`);

  useEffect(() => {
    const sync = () => {
      setActiveTab(activeTabFor(window.location.pathname));
      setScriptureUrl(scriptureUrlFromStorage());
    };
    sync();
    document.addEventListener('astro:after-swap', sync);
    return () => document.removeEventListener('astro:after-swap', sync);
  }, []);

  const hrefFor = tab => (tab.id === 'scripture' ? scriptureUrl : `${getBase()}${tab.path}`);
  return { activeTab, hrefFor };
}
