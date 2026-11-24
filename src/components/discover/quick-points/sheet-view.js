/**
 * Pure DOM view builder & interactive filter/chip/caveat controller for `<dialog class="qk-sheet">`.
 *
 * Responsibilities:
 *   - Builds the sheet header, filter input (`> 12` points), wrapping category jump chips
 *     (`>= 3` categories and `> 25` points), sticky uppercase category headers, point rows with
 *     inline `[ref]` badges, and collapsed `<details class="qk-caveats">` disclosures.
 *   - Uses `createElement` / `createElementNS` + `textContent` exclusively (never `innerHTML`).
 *   - Contains zero History/Router/Analytics calls; exposes a clean view API to `sheet-nav.js`.
 */

import { flashNode, prefersReducedMotion } from '../../../utils/reveal_target.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const FILTER_MIN_POINTS = 13; // show filter when > 12 points
const CHIPS_MIN_GROUPS = 3;   // show wrapping chips when >= 3 categories
const CHIPS_MIN_POINTS = 26;  // hide chip bar when <= 25 points
const INITIAL_VISIBLE_CHIPS = 8;
const MAX_NOWRAP_REF_PART = 28;
const MAX_UNBROKEN_TOKEN = 34;

const ICON_PATHS = {
  bolt: { d: ['M13 2L4.5 13.5h6.5L10 22l9.5-12h-6.5L13 2z'] },
  close: { d: ['M6 6l12 12', 'M18 6L6 18'] },
  search: { circle: [11, 11, 6], d: ['M20 20l-4.5-4.5'] },
  chevronRight: { d: ['M9 6l6 6-6 6'] },
  chevronDown: { d: ['M6 9l6 6 6-6'] },
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

/** Render text into `parent`, styling transliteration hamza/ʿayn (`ʾ`/`ʿ`) in Amiri. */
function appendAmiriMarks(parent, rawText) {
  const parts = String(rawText).split(/([ʾʿ])/g);
  for (const part of parts) {
    if (!part) continue;
    if (part === 'ʾ' || part === 'ʿ') {
      parent.appendChild(el('span', 'qk-tlm', part));
    } else {
      parent.appendChild(document.createTextNode(part));
    }
  }
}

/**
 * Append `[ref]` inline at the end of `stmtEl`.
 * Each `"; "`-separated citation is wrapped in a `white-space: nowrap` span so individual citations
 * (`[Muslim 1452a]`, `[Bukhari 3547;`, `Muslim 2347a]`) never wrap internally while allowing wraps
 * between citations. Very long single citations (> 28 chars, e.g. archaeological shelfmarks with
 * date clauses) break cleanly at `", "` so narrow 360px screens never overflow horizontally.
 */
function appendInlineRef(stmtEl, refText) {
  if (!refText) return;
  stmtEl.appendChild(document.createTextNode(' '));
  const refWrap = el('span', 'qk-row__ref');
  const rawParts = String(refText).split(/;\s+/).filter(Boolean);

  // Build segments `{ text, trailingSpace }` with `[` on the first and `]` on the last.
  const segments = [];
  rawParts.forEach((rawPart, idx) => {
    const withOpen = idx === 0 ? `[${rawPart}` : rawPart;
    const withDelim = idx < rawParts.length - 1 ? `${withOpen};` : `${withOpen}]`;

    if (withDelim.length <= MAX_NOWRAP_REF_PART || !withDelim.includes(', ')) {
      segments.push(withDelim);
    } else {
      const clauses = withDelim.split(/,\s+/);
      clauses.forEach((cl, ci) => {
        segments.push(ci < clauses.length - 1 ? `${cl},` : cl);
      });
    }
  });

  segments.forEach((segText, si) => {
    if (si > 0) refWrap.appendChild(document.createTextNode(' '));
    const cls =
      segText.length > MAX_UNBROKEN_TOKEN
        ? 'qk-row__ref-part qk-row__ref-part--long'
        : 'qk-row__ref-part';
    const partSpan = el('span', cls);
    appendAmiriMarks(partSpan, segText);
    refWrap.appendChild(partSpan);
  });

  stmtEl.appendChild(refWrap);
}

function normSearch(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ʾʿ'’`"-]/g, '')
    .toLowerCase();
}

/**
 * Build the Quick Points `<dialog>` DOM once and return its view controller API.
 *
 * @param {HTMLDialogElement} dialog
 * @param {object} data - Validated payload from `[data-qk-data]`.
 * @param {{ getPageKey: () => string, onRequestClose: () => void, onSelectPoint: (pt: object, ev: MouseEvent) => void }} callbacks
 */
export function createSheetView(
  dialog,
  data,
  { getPageKey, onRequestClose, onDialogClosed, onSelectPoint },
) {
  dialog.textContent = '';

  // 1. Sticky top header
  const top = el('div', 'qk-top');
  const bar = el('div', 'qk-bar');

  const seg = el('div', 'qk-seg');
  seg.setAttribute('role', 'group');
  seg.setAttribute('aria-label', 'Reading mode');

  const articleBtn = el('button', 'qk-seg__btn', 'Article');
  articleBtn.type = 'button';
  articleBtn.addEventListener('click', onRequestClose);

  const quickLabel = el('span', 'qk-seg__btn is-active');
  quickLabel.setAttribute('aria-current', 'true');
  quickLabel.appendChild(makeSvg('bolt', 'qk-bolt'));
  quickLabel.appendChild(el('span', '', 'Quick points'));

  seg.appendChild(articleBtn);
  seg.appendChild(quickLabel);

  const closeBtn = el('button', 'qk-close');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close quick points');
  closeBtn.appendChild(makeSvg('close'));
  closeBtn.addEventListener('click', onRequestClose);

  bar.appendChild(seg);
  bar.appendChild(closeBtn);
  top.appendChild(bar);

  const sub = el('p', 'qk-sub');
  sub.id = 'qk-sheet-title';
  dialog.setAttribute('aria-labelledby', 'qk-sheet-title');
  const subTitle = el('span', 'qk-sub__title');
  appendAmiriMarks(subTitle, data.title);
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
  const groupRecords = [];

  if (data.groups.length >= CHIPS_MIN_GROUPS && data.total >= CHIPS_MIN_POINTS) {
    chipsNav = el('nav', 'qk-chips');
    chipsNav.setAttribute('aria-label', 'Jump to category');

    data.groups.forEach((group, gi) => {
      const chip = el('button', 'qk-chip');
      chip.type = 'button';
      if (data.groups.length > INITIAL_VISIBLE_CHIPS && gi >= INITIAL_VISIBLE_CHIPS) {
        chip.hidden = true;
      }
      const lbl = el('span', 'qk-chip__label');
      appendAmiriMarks(lbl, group.category);
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
      const moreChipsBtn = el('button', 'qk-chip qk-chip--more', `+${extraCount} more`);
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
  const initialPageKey = getPageKey();

  const createRowItem = (pt, categoryNorm) => {
    const li = el('li');
    const a = el('a', pt.role === 'lead' ? 'qk-row qk-row--lead' : 'qk-row');
    a.href = pt.href;
    a.dataset.qkId = pt.id;
    a.dataset.qkRole = pt.role || 'support';

    const num = el('span', 'qk-row__num', String(pt.n));
    const stmt = el('span', 'qk-row__stmt');
    appendAmiriMarks(stmt, pt.statement);
    if (pt.ref) appendInlineRef(stmt, pt.ref);

    const chevWrap = el('span', 'qk-row__chev');
    chevWrap.setAttribute('aria-hidden', 'true');
    const initialIcon = pt.pageKey === initialPageKey ? 'chevronDown' : 'chevronRight';
    chevWrap.appendChild(makeSvg(initialIcon));

    a.appendChild(num);
    a.appendChild(stmt);
    a.appendChild(chevWrap);

    a.addEventListener('click', (ev) => onSelectPoint(pt, ev));

    li.appendChild(a);
    rowById.set(pt.id, a);

    const refNorm = pt.ref ? normSearch(pt.ref) : '';
    const rec = {
      pt,
      li,
      a,
      chevWrap,
      lastIcon: initialIcon,
      haystack: `${categoryNorm} ${normSearch(pt.statement)} ${refNorm}`,
    };
    pointRecords.push(rec);
    return rec;
  };

  for (const group of data.groups) {
    const section = el('section', 'qk-group');
    const head = el('h2', 'qk-group__head');
    const headName = el('span', 'qk-group__name');
    appendAmiriMarks(headName, group.category);
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
  // If Chromium's CloseWatcher fires a non-cancelable `cancel` (e.g. cold `#quick` entry with
  // zero prior user activation), the `close` listener below ensures URL/history still cleans up.
  dialog.addEventListener('cancel', (ev) => {
    if (ev.cancelable) {
      ev.preventDefault();
      onRequestClose();
    }
  });

  dialog.addEventListener('close', () => {
    if (onDialogClosed) onDialogClosed();
  });

  // Backdrop click on desktop right-panel closes sheet cleanly.
  dialog.addEventListener('click', (ev) => {
    if (ev.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    const inside =
      ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
    if (!inside) onRequestClose();
  });

  const refreshChevrons = (pageKey = getPageKey()) => {
    for (const rec of pointRecords) {
      const iconName = rec.pt.pageKey === pageKey ? 'chevronDown' : 'chevronRight';
      if (rec.lastIcon !== iconName) {
        rec.lastIcon = iconName;
        rec.chevWrap.textContent = '';
        rec.chevWrap.appendChild(makeSvg(iconName));
      }
    }
  };

  const revealRow = (pointId, { flash = true } = {}) => {
    if (!pointId) return false;
    let row = rowById.get(pointId);
    if (!row) return false;

    if (row.closest('[hidden]') && filterInput) {
      filterInput.value = '';
      applyFilter('');
      row = rowById.get(pointId);
    }
    if (!row) return false;

    const parentCaveats = row.closest('details.qk-caveats');
    if (parentCaveats instanceof HTMLDetailsElement && !parentCaveats.open) {
      parentCaveats.open = true;
    }

    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    row.scrollIntoView({ block: 'center', behavior });
    row.focus({ preventScroll: true });
    if (flash) flashNode(row);
    return true;
  };

  return {
    data,
    refreshChevrons,
    revealRow,
  };
}
