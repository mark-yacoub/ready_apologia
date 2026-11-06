/**
 * Back/Forward scroll restoration for `.main-content`.
 *
 * Astro's ClientRouter saves and restores WINDOW scroll only. In this layout the window never scrolls
 * (body and .app-container are overflow:hidden); `<main class="main-content">` is the sole scroller on
 * mobile and desktop. Without this, Back always lands at the top of the previous page.
 *
 * Positions are tracked in memory per history entry (keyed by the router's `history.state.index`), so
 * scrolling never calls the History API (Safari throttles replaceState). They are also written onto the
 * entry itself (`mainScrollY`) when it is left by a push or the tab is hidden, so a reload or a return
 * from another site restores too. Fresh (push) navigations start at the top.
 *
 * Import once, from Layout.astro.
 */
import { mergeHistoryState } from './url_history.js';

const KEY = 'mainScrollY';

/** @type {Map<number, number>} router history index -> .main-content scrollTop */
const positions = new Map();

const scroller = () => document.querySelector('.main-content');
const currentIndex = () => history.state?.index;
const pageKey = () => location.pathname + location.search;

/** Page whose DOM is on screen (the URL changes before the swap during a Back/Forward fetch). */
let renderedPage = pageKey();
/** True from a Back/Forward (or a reload with a saved position) until that page has loaded. */
let restoring = typeof history.state?.[KEY] === 'number';

function savedPosition() {
  const i = currentIndex();
  return positions.has(i) ? positions.get(i) : history.state?.[KEY];
}

/** True when this entry will be put back where the reader left it, so callers should not auto-scroll. */
export function hasSavedScroll() {
  return typeof savedPosition() === 'number';
}

function restore() {
  const y = savedPosition();
  const el = scroller();
  if (el && typeof y === 'number') el.scrollTop = y;
}

function persistToEntry() {
  const el = scroller();
  if (el && pageKey() === renderedPage) mergeHistoryState({ [KEY]: el.scrollTop });
}

// `scroll` doesn't bubble, so listen in the capture phase. Cheap: a Map write, no History API call.
document.addEventListener('scroll', (e) => {
  const el = e.target;
  if (!(el instanceof Element) || !el.classList.contains('main-content')) return;
  // During a Back/Forward fetch the URL/state already belong to the destination while the old page is
  // still on screen; don't record the old page's position under the destination's index.
  if (pageKey() !== renderedPage) return;
  // While restoring, scrolls come from page scripts settling (e.g. a tab rail scrollIntoView), not
  // the reader; recording them would overwrite the position we are about to put back.
  if (restoring) return;
  const i = currentIndex();
  if (typeof i === 'number') positions.set(i, el.scrollTop);
}, { capture: true, passive: true });

// Same-page traversal (#hash entries): the router does not swap and only scrolls the window. Restore
// after the page's own hashchange handlers have queued their scroll work.
window.addEventListener('popstate', () => {
  if (pageKey() === renderedPage) requestAnimationFrame(restore);
});

// Reload / leaving the site: keep the position on the entry so it survives the in-memory map.
window.addEventListener('pagehide', persistToEntry);

document.addEventListener('astro:before-preparation', (e) => {
  restoring = e.navigationType === 'traverse';
  if (!restoring) persistToEntry(); // the entry being left is still current for push/replace
});

document.addEventListener('astro:after-swap', () => {
  renderedPage = pageKey();
  if (restoring) {
    restore();
  } else {
    // A push discards every forward entry; their indices get reused, so forget their positions.
    const i = currentIndex();
    for (const k of positions.keys()) if (k >= i) positions.delete(k);
  }
});

document.addEventListener('astro:page-load', () => {
  if (!restoring) return;
  // Again after page scripts and islands have run: they can change the layout height, and CSS scroll
  // anchoring then shifts scrollTop. Keep `restoring` set until this final pass, so those settling
  // scrolls are not recorded as the reader's position.
  requestAnimationFrame(() => {
    restore();
    restoring = false;
  });
});
