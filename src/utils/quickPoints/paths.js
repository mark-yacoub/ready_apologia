/**
 * Isomorphic Quick Points path & hash helpers (zero Node imports; shared by build loader and client).
 */

export const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');

export function normalizeBase(base = BASE) {
  if (!base || base === '/') return '';
  return String(base).replace(/\/$/, '');
}

/**
 * Normalise a URL pathname to a canonical `pageKey` (leading `/`, no trailing `/`, `BASE` stripped).
 * Both `validateQuickPoints` (`pt.pageKey`) and the browser (`toPageKey(window.location.pathname)`)
 * produce this exact representation so same-page detection has zero `BASE` or trailing-slash ambiguity.
 *
 * @param {string} pathname
 * @param {string} [base]
 */
export function toPageKey(pathname, base = BASE) {
  if (!pathname) return '/';
  const b = normalizeBase(base);
  let p = String(pathname);
  if (b && (p === b || p.startsWith(`${b}/`))) {
    p = p.slice(b.length) || '/';
  }
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p;
}

/**
 * True when a hash or full URL (`"#quick"`, `"#quick:id"`, `"https://...#quick:id"`) belongs to Quick Points.
 * @param {string | undefined | null} hashOrUrl
 */
export function isQuickHash(hashOrUrl) {
  if (!hashOrUrl) return false;
  const s = String(hashOrUrl);
  const hashIdx = s.indexOf('#');
  const raw = hashIdx >= 0 ? s.slice(hashIdx + 1) : s.startsWith('quick') ? s : '';
  if (!raw) return false;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // ignore malformed encoding
  }
  return decoded === 'quick' || decoded.startsWith('quick:');
}

/**
 * True when a `HashChangeEvent` transitions into or out of `#quick` / `#quick:*`.
 * Discover article `hashchange` handlers call this to avoid re-scrolling when the sheet opens,
 * closes via Back, or navigates to an in-page target (which `sheet-nav.js` already reveals once).
 *
 * @param {HashChangeEvent | undefined} ev
 */
export function isQuickHashTransition(ev) {
  if (!ev) return isQuickHash(typeof location !== 'undefined' ? location.hash : '');
  return isQuickHash(ev.oldURL) || isQuickHash(ev.newURL);
}
