/**
 * Quick Points navigation, URL hash & History controller (`sheet-nav.js`).
 *
 * Lifecycle & URL rules:
 *   - Uses ONLY `pushHash`, `replaceUrl`, and `mergeHistoryState` from `src/utils/url_history.js`.
 *   - Listens to `hashchange` (same-page Back/Forward) and `astro:page-load` (cross-page entry),
 *     and cleans up on `astro:before-swap`. Deliberately does NOT listen to `popstate`, avoiding
 *     spurious opens on outgoing pages during cross-page Back transitions and duplicate triggers
 *     on same-page Back.
 *   - Delegates all in-page target opening, scrolling, and flashing to `revealTarget`
 *     (`src/utils/reveal_target.js`), relying on CSS `scroll-margin-top` to clear sticky bars.
 */

import { pushHash, replaceUrl, mergeHistoryState } from '../../../utils/url_history.js';
import { hasSavedScroll } from '../../../utils/scroll_restoration.js';
import { trackEvent } from '../../../utils/analytics.js';
import { toPageKey } from '../../../utils/quickPoints/paths.js';
import { revealTarget, clearRevealTimers, prefersReducedMotion } from '../../../utils/reveal_target.js';
import { createSheetView } from './sheet-view.js';

function currentPageKey() {
  return toPageKey(window.location.pathname);
}

function parseQuickHash(hashStr = window.location.hash) {
  if (!hashStr) return null;
  let raw = hashStr.slice(1);
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // ignore malformed encoding
  }
  if (raw === 'quick') return { pointId: null };
  if (raw.startsWith('quick:')) {
    const pointId = raw.slice(6).trim();
    return { pointId: pointId || null };
  }
  return null;
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
    // Single reveal path: push hash entry, then open closed <details>, scroll via scroll-margin-top, and flash.
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

  if (fromToggle && !parseQuickHash()) {
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

function cleanupQuickHashOrPop() {
  if (!parseQuickHash()) return;
  if (history.state?.qkPushed) {
    history.back();
  } else {
    replaceUrl(window.location.pathname + window.location.search);
  }
}

function requestCloseSheet(ctx) {
  if (!ctx.dialog.open) return;
  if (parseQuickHash() && history.state?.qkPushed) {
    history.back();
    return;
  }
  closeSheetDom(ctx);
  if (parseQuickHash()) {
    replaceUrl(window.location.pathname + window.location.search);
  }
}

function handleExternalDialogClosed(ctx) {
  if (internalClose) return;
  if (ctx.openBtn.isConnected) {
    ctx.openBtn.focus({ preventScroll: true });
  }
  if (currentPageKey() === renderedPageKey) {
    cleanupQuickHashOrPop();
  }
}

function onHashChange() {
  if (currentPageKey() !== renderedPageKey) return;
  const ctx = getCurrentRoot();
  if (!ctx) return;

  const qk = parseQuickHash();
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

  const qk = parseQuickHash();
  if (qk) {
    openSheet(ctx, { pointId: qk.pointId, fromToggle: false });
  } else if (window.location.hash.length > 1 && !hasSavedScroll()) {
    // Ensure cold cross-page `#anchor` arrivals into collapsed `<details>` open cleanly.
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
