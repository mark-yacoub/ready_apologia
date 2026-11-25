/**
 * Shared in-page anchor reveal utility (`revealTarget`) for Discover articles and Quick Points.
 *
 * Single reveal path across the site:
 *   1. Opens every closed `<details>` ancestor of `#id` (including `#id` itself when it is `<details>`),
 *      plus any companion disclosure named via `data-reveal-with="<id>"` on the target or an ancestor.
 *   2. Scrolls with a single `target.scrollIntoView({ block: 'start', behavior })`, relying on CSS
 *      `scroll-margin-top` to clear sticky bars and respecting `prefers-reduced-motion`.
 *   3. Optionally applies `.qk-flash` for 1.2s (cleaned up automatically on `astro:before-swap`).
 *
 * Discover articles that run their own cold-anchor `<details>` reveal handler mark their root with
 * `data-reveal-own` so `sheet-nav.js`'s site-wide cold-arrival fallback stays a no-op there.
 */

import { isQuickHash, isQuickHashTransition } from './quickPoints/paths.js';

export { isQuickHash, isQuickHashTransition };

const FLASH_MS = 1200;
const MIN_VISIBLE_FLASH_HEIGHT_PX = 4;

/** Active flash timeout handles, cleared on `astro:before-swap`. */
const timers = new Set();

export function clearRevealTimers() {
  for (const t of timers) clearTimeout(t);
  timers.clear();
}

/**
 * True when the user prefers reduced motion.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Open every closed `<details>` ancestor of `node` (including `node` itself if it is `<details>`).
 * @param {Element} node
 * @returns {boolean} True when at least one closed `<details>` was opened.
 */
function openAncestorDetails(node) {
  let opened = false;
  for (let d = node.closest('details'); d; d = d.parentElement?.closest('details')) {
    if (!d.open) {
      d.open = true;
      opened = true;
    }
  }
  return opened;
}

/**
 * Flash `.qk-flash` on `node` (or its visible sibling/parent if `node` is a 0-height alias span).
 * @param {Element | null | undefined} node
 */
export function flashNode(node) {
  if (!(node instanceof HTMLElement)) return;
  let visual = node;
  if (visual.getBoundingClientRect().height < MIN_VISIBLE_FLASH_HEIGHT_PX) {
    const sib = visual.nextElementSibling;
    visual =
      sib instanceof HTMLElement && sib.getBoundingClientRect().height >= MIN_VISIBLE_FLASH_HEIGHT_PX
        ? sib
        : visual.parentElement || visual;
  }
  visual.classList.remove('qk-flash');
  if (!prefersReducedMotion()) {
    void visual.offsetWidth;
  }
  visual.classList.add('qk-flash');
  const handle = window.setTimeout(() => {
    visual.classList.remove('qk-flash');
    timers.delete(handle);
  }, FLASH_MS);
  timers.add(handle);
}

/**
 * Open closed `<details>` ancestors (and any `data-reveal-with` companion), scroll `target` to
 * `block: 'start'`, and optionally flash `.qk-flash`.
 *
 * @param {string} id - Element id (with or without leading `#`).
 * @param {{ flash?: boolean, behavior?: ScrollBehavior, onlyIfClosedDetails?: boolean, root?: Element | null }} [options]
 * @returns {boolean} True when the target element existed (inside `root` if provided).
 */
export function revealTarget(id, options = {}) {
  if (typeof document === 'undefined' || !id) return false;
  let cleanId = String(id).replace(/^#/, '');
  try {
    cleanId = decodeURIComponent(cleanId);
  } catch {
    return false;
  }
  if (!cleanId) return false;

  const target = document.getElementById(cleanId);
  if (!target) return false;
  if (options.root && !options.root.contains(target)) return false;

  let openedAny = openAncestorDetails(target);

  const companionId =
    target.dataset?.revealWith || target.closest('[data-reveal-with]')?.dataset?.revealWith;
  const companion = companionId ? document.getElementById(companionId) : null;
  if (companion && openAncestorDetails(companion)) {
    openedAny = true;
  }

  if (options.onlyIfClosedDetails && !openedAny) {
    if (options.flash) flashNode(target);
    return true;
  }

  const scrollBehavior = prefersReducedMotion() ? 'auto' : (options.behavior ?? 'smooth');
  target.scrollIntoView({ block: 'start', behavior: scrollBehavior });

  if (options.flash !== false) {
    flashNode(target);
  }
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined' && !window.__raRevealBound) {
  window.__raRevealBound = true;
  document.addEventListener('astro:before-swap', clearRevealTimers);
}
