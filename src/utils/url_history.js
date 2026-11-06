/**
 * The only sanctioned way for client code to change the URL without leaving the page.
 *
 * The site runs Astro's <ClientRouter />, which stores `{ index, scrollX, scrollY }` on every history
 * entry and IGNORES any popstate whose entry has a null state (it assumes a browser-handled hash jump).
 * So a raw `history.replaceState(null, …)` / `pushState(null, …)` silently breaks Back/Forward: when
 * the user returns to that entry from another page, the URL changes but the page is never rendered.
 *
 * Never call `history.pushState` / `history.replaceState` directly — `npm run test:history` fails the
 * build on any call outside this file.
 */
import { navigate } from 'astro:transitions/client';

/**
 * Rewrite the current entry's URL (e.g. to reflect a tab/filter) without adding a Back step.
 * Keeps the router's state so this entry still renders when returned to.
 * @param {string} url - Absolute, relative, or `#hash` URL on the current page.
 */
export function replaceUrl(url) {
  history.replaceState(history.state, '', url);
}

/**
 * Merge extra keys into the current entry's state (URL unchanged), keeping the router's keys.
 * No-op before the router has initialised the entry.
 * @param {Record<string, unknown>} patch
 */
export function mergeHistoryState(patch) {
  if (!history.state) return;
  history.replaceState({ ...history.state, ...patch }, '');
}

/**
 * Add a Back step to an in-page `#id`. Goes through the router so the new entry gets its own history
 * index (copying the current state would duplicate the index and make Forward re-fetch the page).
 * @param {string} id - Element id, without the leading `#`.
 */
export function pushHash(id) {
  navigate(`#${id}`);
}
