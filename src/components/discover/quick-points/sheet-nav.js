/**
 * Quick Points navigation, URL-hash & History controller (`sheet-nav.js`).
 *
 * Responsibilities:
 *   1. Quick Points `<dialog>` lifecycle:
 *      - Uses ONLY `pushHash`, `replaceUrl`, and `mergeHistoryState` from `src/utils/url_history.js`.
 *      - Listens to `hashchange` (same-page Back/Forward, guarded by `renderedPageKey`) and
 *        `astro:page-load` (cross-page entry), cleaning up on `astro:before-swap`. Deliberately
 *        omits `popstate` so outgoing pages never open their dialog during cross-page Back.
 *      - Delegates in-page target opening, scrolling (`scroll-margin-top`), and flashing to
 *        `revealTarget` (`src/utils/reveal_target.js`).
 *   2. Site-wide cold `#anchor` arrival helper for Discover articles:
 *      - On initial load / `astro:page-load` (when there is no `#quick` hash and no saved Back/Forward
 *        scroll position), calls `revealTarget(hash, { flash: false, behavior: 'auto', onlyIfClosedDetails: true })`
 *        so links into collapsed `<details>` disclosures open automatically on articles without a dedicated
 *        reveal script.
 *      - Skipped whenever `[data-reveal-own]` is present on the page (the 5 Discover articles whose own
 *        `client.js` handles initial `#anchor` reveal), avoiding duplicate scroll calls.
 */

import { pushHash, replaceUrl, mergeHistoryState } from '../../../utils/url_history.js';
import { hasSavedScroll } from '../../../utils/scroll_restoration.js';
import { trackEvent } from '../../../utils/analytics.js';
import { parseQuickHash, toPageKey } from '../../../utils/quickPoints/paths.js';
import { revealTarget, clearRevealTimers, prefersReducedMotion } from '../../../utils/reveal_target.js';
import { createSheetView } from './sheet-view.js';

function currentPageKey() {
  return toPageKey(window.location.pathname);
}

function getCurrentQuickHash() {
  return parseQuickHash(window.location.hash);
}

function getCurrentRoot() {
  const root = document.querySelector('[data-qk-root]');
  if (!(root instanceof HTMLElement)) return null;
  const openBtn = root.querySelector('[data-qk-open]');
  const dialog = root.querySelector('[data-qk-dialog]');
  const dataEl = root.querySelector('[data-qk-data]');
  if (!(openBtn instanceof HTMLButtonElement) || !(dialog instanceof HTMLDialogElement) || !dataEl) {
    return null;
  }
  return { root, openBtn, dialog, dataEl };
}

/** WeakMap storing built `sheet-view` controller per `<dialog>` element. */
const viewByDialog = new WeakMap();

/** Page key of the currently rendered DOM (guards `hashchange` during cross-page transitions). */
let renderedPageKey = typeof window !== 'undefined' ? currentPageKey() : '/';

/** True while our own code is calling `dialog.close()`, distinguishing from native Escape/CloseWatcher. */
let internalClose = false;

function closeDialogSilently(dialog) {
  if (!dialog.open) return;
  internalClose = true;
  try {
    dialog.close();
  } finally {
    internalClose = false;
  }
}

/**
 * Exit a `#quick` / `#quick:*` URL state: pops the entry via `history.back()` when we pushed `#quick`
 * (`history.state.qkPushed`), otherwise strips the hash in place with `replaceUrl`.
 *
 * @returns {boolean} True when `history.back()` was triggered (caller should wait for `hashchange`).
 */
function leaveQuickHash() {
  if (!getCurrentQuickHash()) return false;
  if (history.state?.qkPushed) {
    history.back();
    return true;
  }
  replaceUrl(window.location.pathname + window.location.search);
  return false;
}

function ensureView(ctx) {
  const existing = viewByDialog.get(ctx.dialog);
  if (existing) {
    existing.refreshChevrons(currentPageKey());
    return existing;
  }

  const data = JSON.parse(ctx.dataEl.textContent || '{}');
  const view = createSheetView(ctx.dialog, data, {
    getPageKey: currentPageKey,
    onRequestClose: () => requestCloseSheet(ctx),
    onDialogClosed: () => handleExternalDialogClosed(ctx),
    onSelectPoint: (pt, ev) => handleSelectPoint(ctx, data, pt, ev),
  });
  viewByDialog.set(ctx.dialog, view);
  return view;
}

function handleSelectPoint(ctx, data, pt, ev) {
  if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;

  const samePage = pt.pageKey === currentPageKey();
  trackEvent('quick_point_tap', {
    article_slug: data.slug,
    point_id: pt.id,
    point_number: pt.n,
    same_page: samePage,
  });

  // Rewrite the sheet's own history entry to `#quick:<id>` so Back restores this exact row.
  replaceUrl(`#quick:${encodeURIComponent(pt.id)}`);

  if (!samePage) {
    // Cross-page link: let Astro's <ClientRouter /> navigate; `astro:before-swap` closes the dialog.
    return;
  }

  ev.preventDefault();
  closeDialogSilently(ctx.dialog);

  if (pt.hash) {
    pushHash(pt.hash);
    revealTarget(pt.hash, { flash: true });
  } else {
    const topEl = document.getElementById('top') || document.getElementById('intro');
    if (topEl?.id) pushHash(topEl.id);
    const main = document.querySelector('.main-content');
    if (main) {
      main.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  }
}

function openSheet(ctx, { pointId = null, fromToggle = false } = {}) {
  const view = ensureView(ctx);
  const { dialog } = ctx;

  if (!dialog.open) {
    dialog.showModal();
    trackEvent('quick_points_open', {
      article_slug: view.data.slug,
      total_points: view.data.total,
      source: fromToggle ? 'toggle' : 'hash',
    });
  }

  if (fromToggle && !getCurrentQuickHash()) {
    pushHash('quick');
    mergeHistoryState({ qkPushed: true });
  }

  if (pointId) {
    requestAnimationFrame(() => view.revealRow(pointId, { flash: true }));
  }
}

function closeSheetDom(ctx, { restoreFocus = true } = {}) {
  closeDialogSilently(ctx.dialog);
  if (restoreFocus && ctx.openBtn.isConnected) {
    ctx.openBtn.focus({ preventScroll: true });
  }
}

function requestCloseSheet(ctx) {
  if (!ctx.dialog.open) return;
  if (leaveQuickHash()) return;
  closeSheetDom(ctx);
}

function handleExternalDialogClosed(ctx) {
  if (internalClose) return;
  if (ctx.openBtn.isConnected) {
    ctx.openBtn.focus({ preventScroll: true });
  }
  if (currentPageKey() === renderedPageKey) {
    leaveQuickHash();
  }
}

function onHashChange() {
  if (currentPageKey() !== renderedPageKey) return;
  const ctx = getCurrentRoot();
  if (!ctx) return;

  const qk = getCurrentQuickHash();
  if (qk) {
    openSheet(ctx, { pointId: qk.pointId, fromToggle: false });
  } else if (ctx.dialog.open) {
    closeSheetDom(ctx);
  }
}

function initPage() {
  renderedPageKey = currentPageKey();
  const ctx = getCurrentRoot();
  if (!ctx) return;

  if (!ctx.openBtn.dataset.qkBound) {
    ctx.openBtn.dataset.qkBound = '1';
    ctx.openBtn.addEventListener('click', () => {
      openSheet(ctx, { fromToggle: true });
    });
  }

  const qk = getCurrentQuickHash();
  if (qk) {
    openSheet(ctx, { pointId: qk.pointId, fromToggle: false });
  } else if (
    window.location.hash.length > 1 &&
    !hasSavedScroll() &&
    !ctx.root.hasAttribute('data-reveal-own')
  ) {
    revealTarget(window.location.hash.slice(1), {
      flash: false,
      behavior: 'auto',
      onlyIfClosedDetails: true,
    });
  }
}

export function bindQuickPointsNavigation() {
  if (typeof window === 'undefined' || window.__qkNavBound) return;
  window.__qkNavBound = true;

  window.addEventListener('hashchange', onHashChange);

  document.addEventListener('astro:before-swap', () => {
    clearRevealTimers();
    const ctx = getCurrentRoot();
    if (ctx?.dialog.open) {
      closeDialogSilently(ctx.dialog);
    }
  });

  document.addEventListener('astro:page-load', initPage);

  if (document.readyState !== 'loading') initPage();
  else document.addEventListener('DOMContentLoaded', initPage, { once: true });
}
