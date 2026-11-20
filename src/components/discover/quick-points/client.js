/**
 * Quick Points client controller (vanilla JS, stateless, ClientRouter-safe).
 *
 * - Builds the `<dialog class="qk-sheet">` DOM lazily on first open from `[data-qk-data]` JSON
 *   using DOM creation + `textContent` only (never `innerHTML`).
 * - URL & Back history go exclusively through `pushHash`, `replaceUrl`, and `mergeHistoryState`
 *   from `src/utils/url_history.js` (zero storage, zero raw History API calls).
 * - Opening pushes `#quick` (`qkPushed: true`), so browser/OS Back closes the sheet.
 * - Tapping a row sets `#quick:<pointId>` on the sheet's entry via `replaceUrl` first:
 *     - Same-page target: closes dialog, opens closed `<details>` ancestors, pushes `#<hash>`,
 *       scrolls `.main-content` clearing any sticky header bar, and flashes `.qk-flash` for 1.2s.
 *     - Cross-page target: lets Astro's `<ClientRouter />` navigate; pressing Back returns to
 *       `#quick:<pointId>`, which reopens the sheet, scrolls that row into view, and flashes it.
 */

import { pushHash, replaceUrl, mergeHistoryState } from '../../../utils/url_history.js';
import { trackEvent } from '../../../utils/analytics.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const FLASH_MS = 1200;
const FILTER_MIN_POINTS = 13; // show filter when > 12 points
const CHIPS_MIN_GROUPS = 3;   // show wrapping chips when >= 3 categories
const INITIAL_VISIBLE_CHIPS = 4;

const ICON_PATHS = {
  bolt: { fill: true, d: ['M13 2L4.5 13.5h6.5L10 22l9.5-12h-6.5L13 2z'] },
  close: { fill: false, d: ['M6 6l12 12', 'M18 6L6 18'] },
  search: { fill: false, circle: [11, 11, 6], d: ['M20 20l-4.5-4.5'] },
  chevronRight: { fill: false, d: ['M9 6l6 6-6 6'] },
  chevronDown: { fill: false, d: ['M6 9l6 6 6-6'] },
};

function makeSvg(name, cls = 'qk-icon') {
  const spec = ICON_PATHS[name];
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', cls);
  if (spec.circle) {
    const [cx, cy, r] = spec.circle;
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', String(cx));
    c.setAttribute('cy', String(cy));
    c.setAttribute('r', String(r));
    svg.appendChild(c);
  }
  for (const d of spec.d) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
  }
  return svg;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}

/** Format text into a node, tightening spaced medial hamza/ʿayn (e.g. "Qur ʾ ān" -> "Qurʾān") and styling ʾ/ʿ in Amiri. */
function appendFormattedText(parent, rawText) {
  const cleaned = String(rawText).replace(/(\p{L})\s+([ʾʿ])\s+(\p{L})/gu, '$1$2$3');
  const parts = cleaned.split(/([ʾʿ])/g);
  for (const part of parts) {
    if (!part) continue;
    if (part === 'ʾ' || part === 'ʿ') {
      parent.appendChild(el('span', 'qk-tlm', part));
    } else {
      parent.appendChild(document.createTextNode(part));
    }
  }
}

function normSearch(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ʾʿ'’`"-]/g, '')
    .toLowerCase();
}

function normPath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/$/, '');
}

function isSamePage(targetPath) {
  return normPath(targetPath) === normPath(window.location.pathname);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function parseQuickHash(hashStr = window.location.hash) {
  if (!hashStr) return null;
  let raw = hashStr.slice(1);
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // ignore malformed percent encoding
  }
  if (raw === 'quick') return { pointId: null };
  if (raw.startsWith('quick:')) {
    const pointId = raw.slice(6).trim();
    return { pointId: pointId || null };
  }
  return null;
}

let activeFlashTimers = new Set();

function clearAllTimers() {
  for (const id of activeFlashTimers) clearTimeout(id);
  activeFlashTimers.clear();
}

function flashElement(node) {
  if (!node || !(node instanceof HTMLElement)) return;
  let visual = node;
  // Legacy alias spans often have height: 0; flash their visible sibling or container instead.
  if (visual.getBoundingClientRect().height < 4) {
    const sib = visual.nextElementSibling;
    visual =
      sib instanceof HTMLElement && sib.getBoundingClientRect().height >= 4
        ? sib
        : visual.parentElement || visual;
  }
  visual.classList.remove('qk-flash');
  if (!prefersReducedMotion()) {
    // Force style recalc so consecutive flashes restart cleanly.
    void visual.offsetWidth;
  }
  visual.classList.add('qk-flash');
  const timer = window.setTimeout(() => {
    visual.classList.remove('qk-flash');
    activeFlashTimers.delete(timer);
  }, FLASH_MS);
  activeFlashTimers.add(timer);
}

function openAncestorDetails(target) {
  if (!target) return false;
  let openedAny = false;
  for (let d = target.closest('details'); d; d = d.parentElement?.closest('details')) {
    if (
      d.hasAttribute('data-mm-index') ||
      d.hasAttribute('data-qp-index') ||
      d.hasAttribute('data-crv-sheet') ||
      d.hasAttribute('data-ms-index')
    ) {
      continue;
    }
    if (!d.open) {
      d.open = true;
      openedAny = true;
    }
  }
  // Support section-level `data-mm-open` disclosure pointer (e.g. Mecca-to-Medina reflection)
  const extraId = target.dataset?.mmOpen;
  if (extraId) {
    const extra = document.getElementById(extraId);
    if (extra instanceof HTMLDetailsElement && !extra.open) {
      extra.open = true;
      openedAny = true;
    }
  }
  return openedAny;
}

function computeStickyTopOffset(main) {
  const mainRect = main.getBoundingClientRect();
  let stickyHeight = 0;
  const candidates = main.querySelectorAll('.hrv-bar, nav, [class*="-nav"]');
  for (const c of candidates) {
    if (!(c instanceof HTMLElement)) continue;
    const cs = window.getComputedStyle(c);
    if (cs.position !== 'sticky') continue;
    const r = c.getBoundingClientRect();
    if (r.height > 0 && r.height < 140 && r.top <= mainRect.top + 12 && r.bottom > mainRect.top) {
      stickyHeight = Math.max(stickyHeight, r.height);
    }
  }
  return stickyHeight + 16;
}

function scrollArticleToTarget(hash) {
  const main = document.querySelector('.main-content');
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
  if (!hash) {
    if (main) main.scrollTo({ top: 0, behavior });
    return;
  }
  const target = document.getElementById(hash);
  if (!target) return;

  openAncestorDetails(target);

  const performScroll = (scrollBehavior) => {
    const scroller = document.querySelector('.main-content');
    if (!scroller) return;
    const offset = computeStickyTopOffset(scroller);
    const targetRect = target.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const nextTop = Math.max(0, scroller.scrollTop + (targetRect.top - scrollerRect.top) - offset);
    scroller.scrollTo({ top: nextTop, behavior: scrollBehavior });
  };

  // Settle layout after opening <details> and after Router/popstate frame handlers
  performScroll('auto');
  requestAnimationFrame(() => {
    performScroll(behavior);
    flashElement(target);
  });
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

/** WeakMap storing built controller state per `<dialog>` instance. */
const dialogStateMap = new WeakMap();

function ensureSheetBuilt(ctx) {
  const existing = dialogStateMap.get(ctx.dialog);
  if (existing) {
    existing.refreshChevrons();
    return existing;
  }

  const data = JSON.parse(ctx.dataEl.textContent || '{}');
  const dialog = ctx.dialog;
  dialog.textContent = '';

  // 1. Sticky top header
  const top = el('div', 'qk-top');
  const bar = el('div', 'qk-bar');

  const seg = el('div', 'qk-seg');
  seg.setAttribute('role', 'group');
  seg.setAttribute('aria-label', 'Reading mode');

  const articleBtn = el('button', 'qk-seg__btn', 'Article');
  articleBtn.type = 'button';
  articleBtn.setAttribute('aria-pressed', 'false');
  articleBtn.addEventListener('click', () => requestCloseSheet(ctx));

  const quickBtn = el('button', 'qk-seg__btn is-active');
  quickBtn.type = 'button';
  quickBtn.setAttribute('aria-pressed', 'true');
  quickBtn.appendChild(makeSvg('bolt', 'qk-bolt'));
  quickBtn.appendChild(el('span', '', 'Quick points'));

  seg.appendChild(articleBtn);
  seg.appendChild(quickBtn);

  const closeBtn = el('button', 'qk-close');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close quick points');
  closeBtn.appendChild(makeSvg('close'));
  closeBtn.addEventListener('click', () => requestCloseSheet(ctx));

  bar.appendChild(seg);
  bar.appendChild(closeBtn);
  top.appendChild(bar);

  const sub = el('p', 'qk-sub');
  sub.id = 'qk-sheet-title';
  dialog.setAttribute('aria-labelledby', 'qk-sheet-title');
  const subTitle = el('span', 'qk-sub__title');
  appendFormattedText(subTitle, data.title);
  const subSep = el('span', 'qk-sub__sep', ' · ');
  subSep.setAttribute('aria-hidden', 'true');
  const subCount = el('span', 'qk-sub__count', String(data.total));
  sub.appendChild(subTitle);
  sub.appendChild(subSep);
  sub.appendChild(subCount);
  top.appendChild(sub);

  let filterInput = null;
  let clearFilterBtn = null;

  if (data.total >= FILTER_MIN_POINTS) {
    const filterWrap = el('div', 'qk-filter');
    filterWrap.appendChild(makeSvg('search', 'qk-icon qk-filter__icon'));

    filterInput = el('input', 'qk-filter__input');
    filterInput.type = 'search';
    filterInput.placeholder = 'Filter points';
    filterInput.setAttribute('aria-label', 'Filter points');
    filterInput.autocomplete = 'off';
    filterInput.spellcheck = false;

    clearFilterBtn = el('button', 'qk-filter__clear');
    clearFilterBtn.type = 'button';
    clearFilterBtn.hidden = true;
    clearFilterBtn.setAttribute('aria-label', 'Clear filter');
    clearFilterBtn.appendChild(makeSvg('close'));

    filterWrap.appendChild(filterInput);
    filterWrap.appendChild(clearFilterBtn);
    top.appendChild(filterWrap);
  }

  dialog.appendChild(top);

  // 2. Scrollable body
  const body = el('div', 'qk-body');

  let chipsNav = null;
  let chipsExpanded = false;
  const chipButtons = [];
  let moreChipsBtn = null;

  if (data.groups.length >= CHIPS_MIN_GROUPS) {
    chipsNav = el('nav', 'qk-chips');
    chipsNav.setAttribute('aria-label', 'Jump to category');

    data.groups.forEach((group, gi) => {
      const chip = el('button', 'qk-chip');
      chip.type = 'button';
      if (data.groups.length > INITIAL_VISIBLE_CHIPS && gi >= INITIAL_VISIBLE_CHIPS) {
        chip.hidden = true;
      }
      const lbl = el('span', 'qk-chip__label');
      appendFormattedText(lbl, group.category);
      const cnt = el('span', 'qk-chip__count', String(group.points.length));
      chip.appendChild(lbl);
      chip.appendChild(cnt);
      chip.addEventListener('click', () => {
        const sec = groupRecords[gi]?.section;
        if (!sec) return;
        const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
        sec.scrollIntoView({ block: 'start', behavior });
        const firstLink = sec.querySelector('a.qk-row');
        if (firstLink instanceof HTMLElement) {
          firstLink.focus({ preventScroll: true });
        }
      });
      chipButtons.push(chip);
      chipsNav.appendChild(chip);
    });

    if (data.groups.length > INITIAL_VISIBLE_CHIPS) {
      const extraCount = data.groups.length - INITIAL_VISIBLE_CHIPS;
      moreChipsBtn = el('button', 'qk-chip qk-chip--more', `+${extraCount} more`);
      moreChipsBtn.type = 'button';
      moreChipsBtn.setAttribute('aria-expanded', 'false');
      moreChipsBtn.addEventListener('click', () => {
        chipsExpanded = !chipsExpanded;
        moreChipsBtn.setAttribute('aria-expanded', String(chipsExpanded));
        moreChipsBtn.textContent = chipsExpanded ? 'Show fewer' : `+${extraCount} more`;
        chipButtons.forEach((btn, idx) => {
          if (idx >= INITIAL_VISIBLE_CHIPS) btn.hidden = !chipsExpanded;
        });
      });
      chipsNav.appendChild(moreChipsBtn);
    }

    body.appendChild(chipsNav);
  }

  const rowById = new Map();
  const pointRecords = [];
  const groupRecords = [];

  const createRowItem = (pt, categoryNorm) => {
    const li = el('li');
    const a = el(
      'a',
      pt.role === 'lead' ? 'qk-row qk-row--lead' : 'qk-row',
    );
    a.href = pt.href;
    a.dataset.qkId = pt.id;
    a.dataset.qkRole = pt.role || 'support';

    const num = el('span', 'qk-row__num', String(pt.n));
    const stmt = el('span', 'qk-row__stmt');
    appendFormattedText(stmt, pt.statement);
    const chevWrap = el('span', 'qk-row__chev');
    chevWrap.setAttribute('aria-hidden', 'true');
    chevWrap.appendChild(makeSvg(isSamePage(pt.path) ? 'chevronDown' : 'chevronRight'));

    a.appendChild(num);
    a.appendChild(stmt);
    a.appendChild(chevWrap);

    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const same = isSamePage(pt.path);
      trackEvent('quick_point_tap', {
        article_slug: data.slug,
        point_id: pt.id,
        point_number: pt.n,
        same_page: same,
      });

      // Rewrite the sheet's own history entry to `#quick:<id>` so Back restores this exact row.
      replaceUrl(`#quick:${encodeURIComponent(pt.id)}`);

      if (same) {
        e.preventDefault();
        if (dialog.open) dialog.close();
        if (pt.hash) {
          // Open closed <details> BEFORE pushHash so layout height is ready.
          const target = document.getElementById(pt.hash);
          if (target) openAncestorDetails(target);
          pushHash(pt.hash);
          scrollArticleToTarget(pt.hash);
        } else {
          const topEl = document.getElementById('top') || document.getElementById('intro');
          if (topEl?.id) pushHash(topEl.id);
          scrollArticleToTarget('');
        }
      }
      // Cross-page link: let Astro's <ClientRouter /> navigate natively; `astro:before-swap` closes dialog.
    });

    li.appendChild(a);
    rowById.set(pt.id, a);

    const rec = {
      pt,
      li,
      a,
      chevWrap,
      haystack: `${categoryNorm} ${normSearch(pt.statement)}`,
      isCaveat: pt.role === 'caveat',
    };
    pointRecords.push(rec);
    return rec;
  };

  for (const group of data.groups) {
    const section = el('section', 'qk-group');
    const head = el('h2', 'qk-group__head');
    const headName = el('span', 'qk-group__name');
    appendFormattedText(headName, group.category);
    const headSep = el('span', '', ' · ');
    headSep.setAttribute('aria-hidden', 'true');
    const headCount = el('span', 'qk-group__count', String(group.points.length));
    head.appendChild(headName);
    head.appendChild(headSep);
    head.appendChild(headCount);
    section.appendChild(head);

    const catNorm = normSearch(group.category);
    const regularPts = group.points.filter((p) => p.role !== 'caveat');
    const caveatPts = group.points.filter((p) => p.role === 'caveat');

    const regularRecs = [];
    if (regularPts.length > 0) {
      const ol = el('ol', 'qk-rows');
      for (const pt of regularPts) {
        const rec = createRowItem(pt, catNorm);
        regularRecs.push(rec);
        ol.appendChild(rec.li);
      }
      section.appendChild(ol);
    }

    let caveatsDetails = null;
    let caveatsCountEl = null;
    const caveatRecs = [];
    if (caveatPts.length > 0) {
      caveatsDetails = el('details', 'qk-caveats');
      const sum = el('summary', 'qk-caveats__sum');
      const sumText = el('span', 'qk-caveats__label');
      sumText.appendChild(document.createTextNode('Disputed / context · '));
      caveatsCountEl = el('span', 'qk-caveats__count', String(caveatPts.length));
      sumText.appendChild(caveatsCountEl);
      sum.appendChild(sumText);
      sum.appendChild(makeSvg('chevronDown', 'qk-icon qk-caveats__chev'));
      caveatsDetails.appendChild(sum);

      const cavOl = el('ol', 'qk-rows qk-rows--caveats');
      for (const pt of caveatPts) {
        const rec = createRowItem(pt, catNorm);
        caveatRecs.push(rec);
        cavOl.appendChild(rec.li);
      }
      caveatsDetails.appendChild(cavOl);
      section.appendChild(caveatsDetails);
    }

    body.appendChild(section);
    groupRecords.push({
      section,
      headCount,
      totalCount: group.points.length,
      regularRecs,
      caveatsDetails,
      caveatsCountEl,
      totalCaveats: caveatPts.length,
      caveatRecs,
    });
  }

  const emptyBox = el('div', 'qk-empty');
  emptyBox.hidden = true;
  const emptyMsg = el('p', 'qk-empty__msg', 'No matching points.');
  const emptyResetBtn = el('button', 'qk-empty__btn', 'Clear filter');
  emptyResetBtn.type = 'button';
  emptyBox.appendChild(emptyMsg);
  emptyBox.appendChild(emptyResetBtn);
  body.appendChild(emptyBox);

  dialog.appendChild(body);

  const applyFilter = (rawQuery) => {
    const tokens = normSearch(rawQuery).split(/\s+/).filter(Boolean);
    const filtering = tokens.length > 0;

    if (clearFilterBtn) clearFilterBtn.hidden = !rawQuery.length;
    if (chipsNav) chipsNav.hidden = filtering;

    let totalVisible = 0;

    for (const g of groupRecords) {
      let groupVisible = 0;
      for (const r of g.regularRecs) {
        const match = !filtering || tokens.every((t) => r.haystack.includes(t));
        r.li.hidden = !match;
        if (match) groupVisible += 1;
      }

      if (g.caveatsDetails) {
        let cavVisible = 0;
        for (const r of g.caveatRecs) {
          const match = !filtering || tokens.every((t) => r.haystack.includes(t));
          r.li.hidden = !match;
          if (match) cavVisible += 1;
        }
        g.caveatsDetails.hidden = cavVisible === 0;
        if (g.caveatsCountEl) {
          g.caveatsCountEl.textContent = String(filtering ? cavVisible : g.totalCaveats);
        }
        if (filtering && cavVisible > 0) {
          g.caveatsDetails.open = true;
        } else if (!filtering) {
          g.caveatsDetails.open = false;
        }
        groupVisible += cavVisible;
      }

      g.section.hidden = groupVisible === 0;
      g.headCount.textContent = String(filtering ? groupVisible : g.totalCount);
      totalVisible += groupVisible;
    }

    subCount.textContent = filtering ? `${totalVisible} of ${data.total}` : String(data.total);
    emptyBox.hidden = totalVisible > 0;
    if (totalVisible === 0) {
      emptyMsg.textContent = `No points match “${rawQuery.trim()}”.`;
    }
  };

  if (filterInput) {
    filterInput.addEventListener('input', () => applyFilter(filterInput.value));
    clearFilterBtn.addEventListener('click', () => {
      filterInput.value = '';
      applyFilter('');
      filterInput.focus();
    });
    emptyResetBtn.addEventListener('click', () => {
      filterInput.value = '';
      applyFilter('');
      filterInput.focus();
    });
  }

  // Intercept Escape (`cancel`) so history cleanup matches Article / ✕.
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    requestCloseSheet(ctx);
  });

  // Backdrop click on desktop right-panel closes sheet cleanly.
  dialog.addEventListener('click', (e) => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    const inside =
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) requestCloseSheet(ctx);
  });

  const refreshChevrons = () => {
    for (const rec of pointRecords) {
      const iconName = isSamePage(rec.pt.path) ? 'chevronDown' : 'chevronRight';
      if (rec.lastIcon !== iconName) {
        rec.lastIcon = iconName;
        rec.chevWrap.textContent = '';
        rec.chevWrap.appendChild(makeSvg(iconName));
      }
    }
  };

  const state = {
    data,
    body,
    filterInput,
    applyFilter,
    rowById,
    refreshChevrons,
  };
  dialogStateMap.set(dialog, state);
  return state;
}

function openSheet(ctx, { pointId = null, fromPill = false } = {}) {
  const state = ensureSheetBuilt(ctx);
  const { dialog, openBtn } = ctx;

  if (!dialog.open) {
    dialog.showModal();
    openBtn.setAttribute('aria-pressed', 'true');
    trackEvent('quick_points_open', {
      article_slug: state.data.slug,
      total_points: state.data.total,
      source: fromPill ? 'toggle' : 'hash',
    });
  }

  if (fromPill && !parseQuickHash()) {
    pushHash('quick');
    mergeHistoryState({ qkPushed: true });
  }

  if (pointId) {
    let row = state.rowById.get(pointId);
    if (row && row.closest('[hidden]') && state.filterInput) {
      state.filterInput.value = '';
      state.applyFilter('');
      row = state.rowById.get(pointId);
    }
    if (row) {
      const parentCaveats = row.closest('details.qk-caveats');
      if (parentCaveats instanceof HTMLDetailsElement && !parentCaveats.open) {
        parentCaveats.open = true;
      }
      requestAnimationFrame(() => {
        const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
        row.scrollIntoView({ block: 'center', behavior });
        row.focus({ preventScroll: true });
        flashElement(row);
      });
    }
  }
}

function closeSheetDom(ctx, { restoreFocus = true } = {}) {
  if (ctx.dialog.open) {
    ctx.dialog.close();
  }
  ctx.openBtn.setAttribute('aria-pressed', 'false');
  if (restoreFocus && ctx.openBtn.isConnected) {
    ctx.openBtn.focus({ preventScroll: true });
  }
}

function requestCloseSheet(ctx) {
  if (!ctx.dialog.open) return;
  if (parseQuickHash() && history.state?.qkPushed) {
    history.back();
    // Safety fallback if popstate does not arrive (e.g. external interference)
    const fallbackTimer = window.setTimeout(() => {
      activeFlashTimers.delete(fallbackTimer);
      const current = getCurrentRoot();
      if (current?.dialog.open) {
        closeSheetDom(current);
        if (parseQuickHash()) replaceUrl(window.location.pathname + window.location.search);
      }
    }, 450);
    activeFlashTimers.add(fallbackTimer);
    return;
  }

  closeSheetDom(ctx);
  if (parseQuickHash()) {
    replaceUrl(window.location.pathname + window.location.search);
  }
}

function syncWithUrl() {
  const ctx = getCurrentRoot();
  if (!ctx) return;

  const qk = parseQuickHash();
  if (qk) {
    openSheet(ctx, { pointId: qk.pointId, fromPill: false });
  } else if (ctx.dialog.open) {
    closeSheetDom(ctx);
  }
}

function initPage() {
  const ctx = getCurrentRoot();
  if (!ctx) return;

  if (!ctx.openBtn.dataset.qkBound) {
    ctx.openBtn.dataset.qkBound = '1';
    ctx.openBtn.addEventListener('click', () => {
      openSheet(ctx, { fromPill: true });
    });
  }

  // If landing on a normal in-page `#anchor` nested inside a collapsed `<details>`, ensure it opens.
  const qk = parseQuickHash();
  if (qk) {
    openSheet(ctx, { pointId: qk.pointId, fromPill: false });
  } else if (window.location.hash.length > 1) {
    let rawId = window.location.hash.slice(1);
    try {
      rawId = decodeURIComponent(rawId);
    } catch {
      // ignore
    }
    const elTarget = document.getElementById(rawId);
    if (elTarget && openAncestorDetails(elTarget)) {
      requestAnimationFrame(() => {
        const scroller = document.querySelector('.main-content');
        if (!scroller) return;
        const offset = computeStickyTopOffset(scroller);
        const top = Math.max(
          0,
          scroller.scrollTop +
            (elTarget.getBoundingClientRect().top - scroller.getBoundingClientRect().top) -
            offset,
        );
        scroller.scrollTo({ top, behavior: 'auto' });
      });
    }
  }
}

if (typeof window !== 'undefined' && !window.__qkClientBound) {
  window.__qkClientBound = true;

  window.addEventListener('hashchange', syncWithUrl);
  window.addEventListener('popstate', syncWithUrl);

  document.addEventListener('astro:before-swap', () => {
    clearAllTimers();
    const ctx = getCurrentRoot();
    if (ctx?.dialog.open) {
      ctx.dialog.close();
    }
  });

  document.addEventListener('astro:page-load', initPage);
}

if (typeof document !== 'undefined') {
  if (document.readyState !== 'loading') initPage();
  else document.addEventListener('DOMContentLoaded', initPage, { once: true });
}
