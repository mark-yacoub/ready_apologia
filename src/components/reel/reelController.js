/**
 * Opens/closes the full-screen reel ("Play all") from any page or island.
 *
 *   openReel(items, startIndex?, { opener?, findCard? })
 *
 * - Lazy: the ReelPlayer chunk and the YouTube IFrame API load only when a reader presses Play.
 * - One reel at a time. The rest of the page is made `inert` while it is open.
 * - Back closes it: opening adds a `#play=N` entry (via url_history.js; N follows the current clip
 *   with replaceUrl), and closing with ✕/Esc goes back over that entry.
 * - On close, the last-played card is scrolled into view and focused. By default the card is
 *   `[data-video-id="<id>"]`, else the card holding `iframe[src*="/embed/<id>"]`; pass
 *   `findCard(videoId) => Element|null` to override.
 * - ClientRouter: the reel is torn down on `astro:before-swap`, and a stale `#play=N` (Back/Forward
 *   onto that entry, or a shared URL) is stripped instead of auto-playing.
 */
import { pushHash, replaceUrl } from '../../utils/url_history.js';

const PLAY_HASH = /^#play=\d+$/;
const isPlayHash = () => PLAY_HASH.test(location.hash);

/**
 * @typedef {{ videoId: string, apologistName?: string, verseLabel?: string, verseHref?: string, originalUrl?: string }} ReelItem
 * @typedef {{ opener?: Element | null, findCard?: (videoId: string) => Element | null }} ReelOptions
 */

/** @type {null | { container: HTMLElement, root: any, items: ReelItem[], index: number, opener: Element | null, findCard?: ReelOptions['findCard'], pushed: boolean, inerted: Element[], closeTimer?: number }} */
let session = null;

/** Starts fetching everything the reel needs (call on pointerdown of a Play button). */
export function preloadReel() {
  return Promise.all([
    import('./ReelPlayer.jsx'),
    import('react-dom/client'),
    import('../../utils/youtubeIframeApi.js').then((m) => m.loadYouTubeIframeApi()),
  ]).catch(() => { /* ReelPlayer shows the error and a YouTube link */ });
}

/** @returns {boolean} */
export function isReelOpen() {
  return session !== null;
}

/**
 * @param {ReelItem[]} items - Queue in play order.
 * @param {number} [startIndex]
 * @param {ReelOptions} [options]
 */
export async function openReel(items, startIndex = 0, { opener, findCard } = {}) {
  if (typeof window === 'undefined' || session) return;
  const queue = (items || []).filter((it) => it && typeof it.videoId === 'string' && it.videoId);
  if (!queue.length) return;
  const start = Math.min(Math.max(0, Math.trunc(Number(startIndex) || 0)), queue.length - 1);

  const container = document.createElement('div');
  container.className = 'reel-root';
  container.innerHTML =
    '<div class="reel-overlay reel-overlay--loading" role="dialog" aria-modal="true" aria-label="Video player" tabindex="-1">' +
    '<p class="reel-status" role="status">Loading video…</p></div>';
  document.body.appendChild(container);
  /** @type {HTMLElement | null} */ (container.firstElementChild)?.focus();

  session = {
    container,
    root: null,
    items: queue,
    index: start,
    opener: opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null),
    findCard,
    pushed: false,
    inerted: [],
  };
  const current = session;
  setPageInert(current, true);

  if (!isPlayHash()) {
    current.pushed = true;
    pushHash(`play=${start + 1}`);
  }

  let mod;
  try {
    mod = await Promise.all([import('./ReelPlayer.jsx'), import('react-dom/client'), import('react')]);
  } catch {
    if (session === current) {
      container.querySelector('.reel-status').textContent = 'The video player could not load. Check your connection and try again.';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'reel-text-btn';
      close.textContent = 'Close';
      close.addEventListener('click', requestCloseReel);
      container.firstElementChild.appendChild(close);
      container.firstElementChild.addEventListener('keydown', (e) => { if (e.key === 'Escape') requestCloseReel(); });
      close.focus();
    }
    return;
  }
  if (session !== current) return; // closed while loading

  const [{ default: ReelPlayer }, { createRoot }, React] = mod;
  container.textContent = '';
  current.root = createRoot(container);
  current.root.render(
    React.createElement(ReelPlayer, {
      items: queue,
      startIndex: start,
      onIndexChange: (i) => {
        if (session !== current) return;
        current.index = i;
        if (isPlayHash()) replaceUrl(`#play=${i + 1}`);
      },
      onRequestClose: requestCloseReel,
    }),
  );
}

/** Closes the reel: steps Back over its `#play` entry when it added one, else closes directly. */
export function requestCloseReel() {
  const s = session;
  if (!s) return;
  if (s.pushed && isPlayHash()) {
    history.back(); // popstate -> teardown
    // Safety net if the traversal never arrives (e.g. the entry was replaced by another script).
    clearTimeout(s.closeTimer);
    s.closeTimer = window.setTimeout(() => { if (session === s) teardown({ reveal: true }); }, 600);
    return;
  }
  teardown({ reveal: true });
}

/** @param {{ reveal: boolean }} opts */
function teardown({ reveal }) {
  const s = session;
  if (!s) return;
  session = null;
  clearTimeout(s.closeTimer);
  try { s.root?.unmount(); } catch { /* already gone with a body swap */ }
  s.container.remove();
  setPageInert(s, false);
  if (reveal) {
    // After scroll_restoration.js puts .main-content back (it restores on popstate, in a frame).
    requestAnimationFrame(() => requestAnimationFrame(() => revealLastCard(s)));
  }
}

function setPageInert(s, on) {
  if (on) {
    for (const el of Array.from(document.body.children)) {
      if (el === s.container || el.hasAttribute('inert') || el.tagName === 'SCRIPT') continue;
      el.setAttribute('inert', '');
      s.inerted.push(el);
    }
    document.documentElement.classList.add('reel-open');
  } else {
    for (const el of s.inerted) el.removeAttribute('inert');
    s.inerted = [];
    document.documentElement.classList.remove('reel-open');
  }
}

function defaultFindCard(videoId) {
  const esc = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(videoId) : videoId;
  const tagged = document.querySelector(`[data-video-id="${esc}"]`);
  if (tagged) return tagged;
  const frame = document.querySelector(`iframe[src*="/embed/${esc}"]`);
  return frame ? frame.closest('.video-card, article, li') || frame : null;
}

function revealLastCard(s) {
  const item = s.items[s.index];
  const card = item ? (s.findCard?.(item.videoId) ?? defaultFindCard(item.videoId)) : null;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (card && card.isConnected) {
    // Centre it, unless it is taller than the visible area: then show its top.
    const viewport = document.querySelector('.main-content')?.clientHeight || window.innerHeight;
    const block = card.getBoundingClientRect().height > viewport ? 'start' : 'center';
    card.scrollIntoView({ block, behavior: reduce ? 'auto' : 'smooth' });
    const focusable = card.matches('a[href], button, summary, [tabindex]')
      ? card
      : card.querySelector('a[href], button:not([disabled]), summary');
    if (focusable instanceof HTMLElement) focusable.focus({ preventScroll: true });
    return;
  }
  if (s.opener instanceof HTMLElement && s.opener.isConnected) s.opener.focus({ preventScroll: true });
}

if (typeof window !== 'undefined' && !window.__reelControllerBound) {
  window.__reelControllerBound = true;

  // Back (or Forward) off the #play entry closes the reel; landing on a #play entry with no reel
  // open (Back from another page, Forward after closing) just tidies the URL — nothing autoplays.
  window.addEventListener('popstate', () => {
    if (session && !isPlayHash()) teardown({ reveal: true });
    else if (!session && isPlayHash()) replaceUrl(location.pathname + location.search);
  });

  document.addEventListener('astro:before-swap', () => teardown({ reveal: false }));

  const stripStaleHash = () => {
    if (!session && isPlayHash()) replaceUrl(location.pathname + location.search);
  };
  document.addEventListener('astro:page-load', stripStaleHash);
}
