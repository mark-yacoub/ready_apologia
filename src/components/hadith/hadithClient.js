/**
 * Client-side helpers shared by the Sahih Hadith islands:
 * lazy JSON fetching (memoised per page), language preference, sharing and in-page navigation.
 */
import { useCallback, useEffect, useState } from 'react';

const jsonCache = new Map(); // url → Promise (in flight or settled)
const jsonValues = new Map(); // url → resolved value, for synchronous reads (no skeleton flash on re-open)

/** Fetches a static JSON file once per page load; concurrent callers share the same promise. */
export function fetchJsonOnce(url) {
  if (!jsonCache.has(url)) {
    const p = fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
        return r.json();
      })
      .then(value => {
        jsonValues.set(url, value);
        return value;
      });
    p.catch(() => jsonCache.delete(url)); // allow retry after failure
    jsonCache.set(url, p);
  }
  return jsonCache.get(url);
}

/** Fire-and-forget cache warm-up (hover / focus intent). */
export function prefetchJson(url) {
  fetchJsonOnce(url).catch(() => {});
}

export function hadithJsonUrl(base, slug) {
  return `${base}/hadith/data/${slug}.json`;
}

/**
 * Hook: loads `url` when `enabled` turns true. State is keyed by URL, so switching URLs
 * (e.g. between parallel narrations) never shows the previous URL's data.
 * @returns {{ data: any, error: Error|null, loading: boolean, retry: () => void }}
 */
export function useLazyJson(url, enabled) {
  const [state, setState] = useState({ url: null, data: null, error: null });
  const [attempt, setAttempt] = useState(0);
  const own = state.url === url;
  const data = (own && state.data) || (url && jsonValues.get(url)) || null;
  const error = own ? state.error : null;

  useEffect(() => {
    if (!enabled || !url || data) return undefined;
    let alive = true;
    fetchJsonOnce(url).then(
      value => { if (alive) setState({ url, data: value, error: null }); },
      err => {
        console.warn('[hadith] Failed to load', url, err);
        if (alive) setState({ url, data: null, error: err });
      },
    );
    return () => { alive = false; };
  }, [url, enabled, attempt, Boolean(data)]);

  const retry = useCallback(() => {
    setState({ url, data: null, error: null });
    setAttempt(a => a + 1);
  }, [url]);

  return { data, error, loading: Boolean(enabled && url && !data && !error), retry };
}

// ---------- Language preference ----------
// Shares the 'quranLanguage' key with the Quran reader ('arabic' | 'english'); 'parallel' is hadith-only.
const LANG_KEY = 'quranLanguage';
const STORE_TO_LANG = { english: 'en', arabic: 'ar', parallel: 'both' };
const LANG_TO_STORE = { en: 'english', ar: 'arabic', both: 'parallel' };

export function useHadithLanguage() {
  const [lang, setLangState] = useState('en');
  useEffect(() => {
    try {
      const saved = STORE_TO_LANG[localStorage.getItem(LANG_KEY)];
      if (saved) setLangState(saved);
    } catch { /* storage unavailable */ }
  }, []);
  const setLang = useCallback(next => {
    setLangState(next);
    try { localStorage.setItem(LANG_KEY, LANG_TO_STORE[next] || 'english'); } catch { /* ignore */ }
  }, []);
  return [lang, setLang];
}

// ---------- Sharing ----------
export function absoluteUrl(href) {
  try { return new URL(href, window.location.origin).toString(); } catch { return href; }
}

/**
 * Shares via the Web Share API when available (mobile), else copies to the clipboard.
 * @returns {Promise<'shared'|'copied'|'cancelled'|'failed'>}
 */
export async function shareLink({ url, title, text }) {
  const full = absoluteUrl(url);
  if (navigator.share && window.matchMedia?.('(pointer: coarse)').matches) {
    try {
      await navigator.share({ url: full, title, text });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(full);
    return 'copied';
  } catch {
    return 'failed';
  }
}

// ---------- In-page navigation ----------
/** Bottom edge of the sticky section header (0 when absent), for "is this under the header?" checks. */
export function stickyHeaderBottom() {
  return document.querySelector('.hx-sticky')?.getBoundingClientRect().bottom || 0;
}

const flashTimers = new WeakMap();
/** Briefly highlights an element (restartable). */
export function flash(el) {
  clearTimeout(flashTimers.get(el)); // a re-flash must not be cut short by the previous timer
  el.classList.remove('is-flash');
  void el.offsetWidth; // restart animation
  el.classList.add('is-flash');
  flashTimers.set(el, setTimeout(() => el.classList.remove('is-flash'), 1700));
}

/** Scrolls to an element (opening an enclosing <details> drawer first) and flashes it. */
export function revealElement(el, { smooth = true } = {}) {
  const drawer = el.closest('details');
  if (drawer && !drawer.open) drawer.open = true;
  requestAnimationFrame(() => {
    el.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
    flash(el);
  });
}

export function scrollToAnchor(id, options) {
  const el = id ? document.getElementById(id) : null;
  if (!el) return false;
  revealElement(el, options);
  return true;
}
