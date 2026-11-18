// Builds the "Through Christian Eyes" handout as two native, editable Google Slides pages
// (11" × 8.5"), with symmetric print margins and a clean gutter each side of the fold.
//
// Copy and typed text runs come from `src/utils/throughChristianEyes/content.js` via `printModel.js`;
// Slides REST API serialization lives in `./slides_emit.mjs`; QR PNGs are encoded in pure Node via `./chrome.mjs`.
//
// Usage: node handouts/through-christian-eyes/build_slides.mjs [outDir]
//   → writes requests.json, qr/*.png, qr_placements.json (throws and exits 1 if any panel fails to fit).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSlidesSpec, plainSlidesRuns, runsPlainText } from '../../src/utils/throughChristianEyes/printModel.js';
import { runChrome, writeQrPng } from './chrome.mjs';
import { emitSlidesDeck } from './slides_emit.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || path.join(dir, 'slides_build'); // git-ignored
fs.mkdirSync(path.join(OUT, 'qr'), { recursive: true });

// ---------------------------------------------------------------------------------------------
// Geometry (pt). Page 792 × 612. Safe margin 22pt outer sides, 21pt top/bottom; 19pt fold gutter.
// ---------------------------------------------------------------------------------------------
const MX = 22, MY = 21, GUT = 19, PAGE_W = 792, PAGE_H = 612;
const OUT_SLIDE = process.env.OUT_SLIDE || 'cp2026_s39';
const IN_SLIDE = process.env.IN_SLIDE || 'cp2026_s40';
const PANELS = {
  back: { slide: OUT_SLIDE, x0: MX + 2, x1: PAGE_W / 2 - GUT, qrCol: 94 },
  cover: { slide: OUT_SLIDE, x0: PAGE_W / 2 + 34, x1: PAGE_W - 34, qrCol: 86 },
  p2: { slide: IN_SLIDE, x0: MX + 2, x1: PAGE_W / 2 - GUT, qrCol: 85 },
  p3: { slide: IN_SLIDE, x0: PAGE_W / 2 + GUT, x1: PAGE_W - MX, qrCol: 80 },
};
const Y0 = MY, Y1 = PAGE_H - MY;
const QR_GAP = 6.0, PAD = 4.6;
/** Empirical Chrome CSS line-height → Google Slides text-box line-spacing calibration factor. */
const SLIDES_LH_RATIO = 1.21;

const C = {
  ink: '#1C1917', muted: '#57534E', red: '#883432', gold: '#9A4406', amber: '#8A4B08',
  line: '#E2D8CA', frame: '#D8BEBA', quote: '#3B1F14', answerBg: '#F3EBE0', white: '#FFFFFF',
};

const spec = buildSlidesSpec();

// ---------------------------------------------------------------------------------------------
// Typography styles (paragraph base + inline run overrides)
// ---------------------------------------------------------------------------------------------
function styleFor(kind, S, hasAr = false, dense = false) {
  const base = {
    font: 'Public Sans', size: S, color: C.ink, align: 'START',
    spaceBelow: S * (dense ? 0.24 : 0.31),
    lineSpacing: hasAr ? 130 : (dense ? 100 : 102),
  };
  switch (kind) {
    case 'lead': return { ...base, color: C.muted };
    case 'label': return { ...base, size: S - 1.2, color: C.gold, bold: true, spaceBelow: 0, lineSpacing: 100 };
    case 'aside': return { ...base, size: S - 0.5, color: C.muted };
    case 'asideLabel': return { ...base, size: S - 1.3, color: C.muted, bold: true, spaceBelow: 0, lineSpacing: 100 };
    case 'pull': return { ...base, spaceBelow: 0, lineSpacing: 102 };
    case 'caption': return { ...base, size: 5.15, color: C.red, bold: true, align: 'CENTER', spaceBelow: 0, lineSpacing: 100 };
    case 'title': return { ...base, font: 'Literata', size: S + (dense ? 3.7 : 4.0), color: C.red, bold: true, spaceBelow: 0, lineSpacing: 100 };
    default: return base;
  }
}

function runStyleFor(s, S, kind, dense = false) {
  switch (s) {
    case 'b': return { bold: true };
    case 'em': return { italic: true };
    case 'q':
      return kind === 'pull'
        ? { font: 'Literata', italic: true, bold: true, color: C.amber, size: S + (dense ? 1.5 : 2.1) }
        : { font: 'Literata', italic: true, color: C.quote, size: S + 0.2 };
    case 'c': return { font: 'Public Sans', italic: false, color: C.muted, size: Math.max(S - 0.8, 5.4) };
    case 'u': return { font: 'JetBrains Mono', color: C.muted, size: kind === 'caption' ? 4.75 : 5.9 };
    case 'r': return { bold: true, color: C.red };
    case 'i': return { italic: true, bold: false, color: C.red };
    case 'a': return { font: 'Amiri', italic: false, size: Math.max(S + 0.6, 6.8) };
    default: return {};
  }
}

const closingStyle = (kind, S) => ({
  invite: { font: 'Public Sans', size: S - 0.3, color: C.ink, align: 'START', spaceBelow: 0, lineSpacing: 103 },
  love: { font: 'Literata', size: 9.3, color: C.red, bold: true, align: 'CENTER', spaceBelow: 0, lineSpacing: 100 },
  footp: { font: 'Literata', size: 6.65, color: C.muted, italic: false, align: 'CENTER', spaceBelow: 0, lineSpacing: 104 },
  site: { font: 'Cinzel', size: 10.8, color: C.red, bold: true, align: 'CENTER', spaceBelow: 0, lineSpacing: 100 },
}[kind]);

const COVER_STYLES = {
  brand: { font: 'Cinzel', size: 8.5, color: C.red, bold: true, align: 'START', spaceBelow: 0 },
  kicker: { font: 'Public Sans', size: 6.1, color: C.gold, bold: true, align: 'END', spaceBelow: 0 },
  h1: { font: 'Literata', size: 30, color: C.red, bold: true, weight: 800, align: 'START', spaceBelow: 0, lineSpacing: 92 },
  h2: { font: 'Literata', size: 16, color: C.ink, weight: 600, align: 'START', spaceBelow: 0, lineSpacing: 108 },
  intro: { font: 'Literata', size: 10.0, color: C.ink, align: 'START', spaceBelow: 9, lineSpacing: 114 },
  pledge: { font: 'Public Sans', size: 8.4, color: C.ink, bold: true, align: 'START', spaceBelow: 2.2, lineSpacing: 108 },
};

// ---------------------------------------------------------------------------------------------
// Single-batch DOM text-box measurement in headless Chrome
// ---------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function cssOf(st) {
  return `font-family:'${st.font}';font-size:${st.size}pt;color:${st.color};${st.bold ? 'font-weight:700;' : ''}${st.weight ? `font-weight:${st.weight};` : ''}${st.italic ? 'font-style:italic;' : ''}`;
}

function runsHtml(runs, st, kind, dense = false) {
  return runs.map((r) => {
    const rs = { ...runStyleFor(r.s, st.size, kind, dense) };
    if (r.tlm) { rs.font = 'Amiri'; rs.zeroLh = true; }
    if (r.sal) { rs.font = 'Amiri'; rs.italic = false; rs.bold = false; rs.zeroLh = true; }
    const css =
      `${rs.font ? `font-family:'${rs.font}';` : ''}` +
      `${rs.size ? `font-size:${rs.size}pt;` : ''}` +
      `${rs.color ? `color:${rs.color};` : ''}` +
      `${rs.bold === true ? 'font-weight:700;' : rs.bold === false ? 'font-weight:400;' : ''}` +
      `${rs.italic === true ? 'font-style:italic;' : rs.italic === false ? 'font-style:normal;' : ''}` +
      `${rs.zeroLh ? 'line-height:0;' : ''}`;
    return css ? `<span style="${css}">${esc(r.t)}</span>` : esc(r.t);
  }).join('');
}

function boxHtml(id, width, paras, st, kind, dense = false) {
  const ls = (st.lineSpacing || 100) / 100;
  const ps = paras.map((runs, i) => {
    const plain = runsPlainText(runs);
    const hang = plain.startsWith('•  ') ? 'padding-left:9.5pt;text-indent:-9.5pt;' : '';
    const align = st.align === 'CENTER' ? 'center' : st.align === 'END' ? 'right' : 'left';
    return `<p style="margin:0 0 ${i < paras.length - 1 ? st.spaceBelow : 0}pt 0;${hang}text-align:${align};">${runsHtml(runs, st, kind, dense)}</p>`;
  }).join('');
  return `<div class="m" id="${id}" style="width:${width}pt;${cssOf(st)}line-height:${ls * SLIDES_LH_RATIO};">${ps}</div>`;
}

function measure(items) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400..800;1,7..72,400..700&family=Public+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Cinzel:wght@700&family=Amiri&family=JetBrains+Mono:wght@500&display=swap');
    body{margin:0} .m{position:relative;margin-bottom:20px;overflow-wrap:break-word}
    </style></head><body>${items.map((it) => boxHtml(it.id, it.width, it.paras, it.st, it.kind, it.dense)).join('')}
    <pre id="out"></pre><script>
    document.fonts.ready.then(()=>{ const o={}; document.querySelectorAll('.m').forEach(e=>o[e.id]=e.getBoundingClientRect().height*0.75); document.getElementById('out').textContent=JSON.stringify(o); });
    </script></body></html>`;
  const f = path.join(OUT, 'measure.html');
  fs.writeFileSync(f, html);
  const dom = runChrome(['--virtual-time-budget=10000', '--dump-dom', `file://${f}`]);
  const raw = (dom.match(/<pre id="out">(.*?)<\/pre>/s) || [])[1]?.trim();
  if (!raw) throw new Error('[build_slides] Font-ready measurement timed out (<pre id="out"> was empty)');
  return JSON.parse(raw.replace(/&quot;/g, '"'));
}

// ---------------------------------------------------------------------------------------------
// Panel layout solver
// ---------------------------------------------------------------------------------------------
const capSt = { font: 'Public Sans', size: 5.2, color: C.red, align: 'CENTER', spaceBelow: 0.4, lineSpacing: 100 };

/** Splits long QR URLs cleanly after /discover/ or /evidence/ so Slides never wraps mid-word. */
function capParas(label, id) {
  const full = `${spec.siteHost}${spec.links[id]}`;
  const m = full.match(/^([^/]+\/(?:discover|evidence)\/)(.+)$/);
  if (m) return [plainSlidesRuns(label, 'b'), [{ t: m[1], s: 'u' }], [{ t: m[2], s: 'u' }]];
  return [plainSlidesRuns(label, 'b'), [{ t: full, s: 'u' }]];
}

const blockHasAr = (b) => Boolean(b.hasAr) || (b.paras || []).some((runs) => runs.some((r) => r.s === 'a'));
const blockBg = (b) => (b.isAnswer ? C.answerBg : null);
const blockBar = (b) => (b.hasPullBar ? C.amber : null);

function collectPanelItems(name, S, tag) {
  const P = PANELS[name], W = P.x1 - P.x0, QR_COL = P.qrCol, dense = name === 'p3';
  const blocks = spec.panels[name].blocks;
  const items = [];
  blocks.forEach((b, i) => {
    if (b.type === 'head') {
      items.push({ id: `${tag}_${i}`, width: W - 20, paras: b.paras, st: styleFor('title', S, false, dense), kind: 'title', dense });
    } else if (b.type === 'text') {
      const st = styleFor(b.kind, S, blockHasAr(b), dense);
      if (b.tight) st.spaceBelow = S * 0.15;
      let w = b.qr ? W - QR_COL - QR_GAP : W;
      if (blockBg(b)) w -= 2 * PAD;
      if (blockBar(b)) w -= 8;
      items.push({ id: `${tag}_${i}`, width: w, paras: b.paras, st, kind: b.kind, dense });
      if (b.qr) items.push({ id: `${tag}_${i}_cap`, width: QR_COL, paras: capParas(b.qr.label, b.qr.id), st: capSt, kind: 'caption' });
    } else if (b.type === 'stackQr') {
      const colW = W - QR_COL - QR_GAP;
      b.children.forEach((ch, ci) => {
        const st = styleFor(ch.kind, S, blockHasAr(ch), dense);
        const w = blockBg(ch) ? colW - 2 * PAD : colW;
        items.push({ id: `${tag}_${i}_c${ci}`, width: w, paras: ch.paras, st, kind: ch.kind, dense });
      });
      items.push({ id: `${tag}_${i}_cap`, width: QR_COL, paras: capParas(b.qr.label, b.qr.id), st: capSt, kind: 'caption' });
    }
  });
  if (name === 'back') {
    spec.closing.forEach((c, j) => {
      if (c.paras) items.push({ id: `${tag}_close_${j}`, width: W, paras: c.paras, st: closingStyle(c.kind, S), kind: c.kind });
    });
  }
  return items;
}

function stackPanel(name, S, tag, H) {
  const P = PANELS[name], W = P.x1 - P.x0, QR_COL = P.qrCol, dense = name === 'p3';
  const blocks = spec.panels[name].blocks;
  const out = [];
  let y = Y0;
  const D = 15, blockGap = dense ? 2.1 : 3.0;

  blocks.forEach((b, i) => {
    const id = `${tag}_${i}`;
    const isLast = i === blocks.length - 1;
    if (b.type === 'gap') { y += b.h; return; }
    if (b.type === 'rule') { out.push({ t: 'line', x: P.x0, y: y + 1.5, w: W }); y += 5; return; }
    if (b.type === 'head') {
      if (i > 0) y += dense ? 2.2 : 3.8;
      const h = H[id];
      out.push({ t: 'circle', x: P.x0, y: y + (h - D) / 2 - 0.8, d: D, num: b.num });
      out.push({ t: 'text', x: P.x0 + 20, y, w: W - 20, h, paras: b.paras, st: styleFor('title', S, false, dense), kind: 'title', dense });
      y += h + (dense ? 2.2 : 3.2);
      return;
    }
    if (b.type === 'stackQr') {
      const colW = W - QR_COL - QR_GAP;
      const bodyX = b.qr.side === 'left' ? P.x0 + QR_COL + QR_GAP : P.x0;
      const qrX = b.qr.side === 'left' ? P.x0 : P.x1 - QR_COL;
      const childGap = dense ? 2.6 : 3.2;
      let colH = 0;
      b.children.forEach((ch, ci) => {
        const hText = H[`${id}_c${ci}`];
        colH += (blockBg(ch) ? hText + 2 * PAD : hText) + (ci < b.children.length - 1 ? childGap : 0);
      });
      const qrH = b.qr.size + 2.5 + H[`${id}_cap`];
      const rowH = Math.max(colH, qrH);
      let cy = y + (rowH - colH) / 2;
      b.children.forEach((ch, ci) => {
        const st = styleFor(ch.kind, S, blockHasAr(ch), dense);
        const hText = H[`${id}_c${ci}`];
        const bg = blockBg(ch);
        const boxH = bg ? hText + 2 * PAD : hText;
        if (bg) {
          out.push({ t: 'rect', x: bodyX, y: cy, w: colW, h: boxH, color: bg });
          out.push({ t: 'bar', x: bodyX, y: cy, h: boxH, color: C.red });
          out.push({ t: 'text', x: bodyX + PAD, y: cy + PAD, w: colW - 2 * PAD, h: hText, paras: ch.paras, st, kind: ch.kind, dense });
        } else {
          out.push({ t: 'text', x: bodyX, y: cy, w: colW, h: hText, paras: ch.paras, st, kind: ch.kind, dense });
        }
        cy += boxH + childGap;
      });
      const qy = y + (rowH - qrH) / 2;
      out.push({ t: 'qr', id: b.qr.id, x: qrX + (QR_COL - b.qr.size) / 2, y: qy, size: b.qr.size });
      out.push({ t: 'text', x: qrX, y: qy + b.qr.size + 2.5, w: QR_COL, h: H[`${id}_cap`], paras: capParas(b.qr.label, b.qr.id), st: capSt, kind: 'caption' });
      y += rowH + (isLast ? 0 : blockGap);
      return;
    }

    const st = styleFor(b.kind, S, blockHasAr(b), dense);
    if (b.tight) st.spaceBelow = S * 0.15;
    const hText = H[id];
    const bg = blockBg(b);
    const bar = blockBar(b);
    let bodyX = P.x0, bodyW = W, qrX = null;
    if (b.qr) {
      bodyW = W - QR_COL - QR_GAP;
      if (b.qr.side === 'left') { qrX = P.x0; bodyX = P.x0 + QR_COL + QR_GAP; }
      else { qrX = P.x1 - QR_COL; }
    }
    const boxH = bg ? hText + 2 * PAD : hText;
    const qrH = b.qr ? b.qr.size + 2.5 + H[`${id}_cap`] : 0;
    const rowH = Math.max(boxH, qrH);
    const ty = y + (rowH - boxH) / 2;

    if (bar) {
      out.push({ t: 'bar', x: bodyX, y: ty + 0.5, h: Math.max(4, hText - 2.2), color: bar });
      out.push({ t: 'text', x: bodyX + 8, y: ty, w: bodyW - 8, h: hText, paras: b.paras, st, kind: b.kind, dense });
    } else if (bg) {
      out.push({ t: 'rect', x: bodyX, y: ty, w: bodyW, h: boxH, color: bg });
      out.push({ t: 'bar', x: bodyX, y: ty, h: boxH, color: C.red });
      out.push({ t: 'text', x: bodyX + PAD, y: ty + PAD, w: bodyW - 2 * PAD, h: hText, paras: b.paras, st, kind: b.kind, dense });
    } else {
      out.push({ t: 'text', x: bodyX, y: ty, w: bodyW, h: hText, paras: b.paras, st, kind: b.kind, dense });
    }
    if (b.qr) {
      const qy = y + (rowH - qrH) / 2;
      out.push({ t: 'qr', id: b.qr.id, x: qrX + (QR_COL - b.qr.size) / 2, y: qy, size: b.qr.size });
      out.push({ t: 'text', x: qrX, y: qy + b.qr.size + 2.5, w: QR_COL, h: H[`${id}_cap`], paras: capParas(b.qr.label, b.qr.id), st: capSt, kind: 'caption' });
    }
    y += rowH + (isLast ? 0 : (b.kind === 'label' ? 1 : blockGap));
  });

  let bottom = y;
  if (name === 'back') {
    let ch = 0;
    const parts = [];
    spec.closing.forEach((c, j) => {
      if (c.kind === 'rule') { parts.push({ t: 'line', h: 8 }); ch += 8; return; }
      const h = H[`${tag}_close_${j}`];
      parts.push({ t: 'text', h, paras: c.paras, st: closingStyle(c.kind, S), kind: c.kind });
      ch += h + 3;
    });
    let cy = Y1 - ch;
    const closeTop = cy;
    out.push({ t: 'line', x: P.x0, y: cy - 6, w: W });
    parts.forEach((p) => {
      if (p.t === 'line') { out.push({ t: 'line', x: P.x0, y: cy + 3, w: W }); cy += 8; return; }
      out.push({ t: 'text', x: P.x0, y: cy, w: W, h: p.h, paras: p.paras, st: p.st, kind: p.kind });
      cy += p.h + 3;
    });
    bottom = y + (Y1 - closeTop) + 10; // must leave ≥10pt breathing room above closing rule
  }
  return { out, bottom, fits: bottom <= Y1 };
}

function collectCoverItems() {
  const P = PANELS.cover, W = P.x1 - P.x0;
  return [
    { id: 'c_h1', width: W, paras: spec.cover.h1, st: COVER_STYLES.h1 },
    { id: 'c_h2', width: W, paras: spec.cover.h2, st: COVER_STYLES.h2 },
    { id: 'c_intro', width: W, paras: spec.cover.intro, st: COVER_STYLES.intro },
    { id: 'c_pledge', width: W - 10, paras: spec.cover.pledge, st: COVER_STYLES.pledge },
    { id: 'c_brand', width: W * 0.42, paras: spec.cover.brand, st: COVER_STYLES.brand },
  ];
}

function stackCover(H) {
  const P = PANELS.cover, W = P.x1 - P.x0;
  const cy0 = 44, cy1 = PAGE_H - 48;
  const out = [
    { t: 'frame', x: PAGE_W / 2 + 21.6, y: 21.6, w: PAGE_W / 2 - 43.2, h: PAGE_H - 43.2, color: C.frame },
  ];
  const groups = [
    { h: H.c_brand, draw: (y) => {
      out.push({ t: 'text', x: P.x0, y, w: W * 0.42, h: H.c_brand, paras: spec.cover.brand, st: COVER_STYLES.brand });
      out.push({ t: 'text', x: P.x0 + W * 0.38, y: y + 1.5, w: W * 0.62, h: H.c_brand, paras: spec.cover.kicker, st: COVER_STYLES.kicker });
    } },
    { h: H.c_h1 + 17 + H.c_h2, draw: (y) => {
      out.push({ t: 'text', x: P.x0, y, w: W, h: H.c_h1, paras: spec.cover.h1, st: COVER_STYLES.h1 });
      out.push({ t: 'rect', x: P.x0, y: y + H.c_h1 + 7, w: 64, h: 2.5, color: C.gold });
      out.push({ t: 'text', x: P.x0, y: y + H.c_h1 + 17, w: W, h: H.c_h2, paras: spec.cover.h2, st: COVER_STYLES.h2 });
    } },
    { h: H.c_intro, draw: (y) => out.push({ t: 'text', x: P.x0, y, w: W, h: H.c_intro, paras: spec.cover.intro, st: COVER_STYLES.intro }) },
    { h: H.c_pledge, draw: (y) => {
      out.push({ t: 'bar', x: P.x0, y: y + 0.5, h: H.c_pledge - 3, color: C.red });
      out.push({ t: 'text', x: P.x0 + 10, y, w: W - 10, h: H.c_pledge, paras: spec.cover.pledge, st: COVER_STYLES.pledge, kind: 'pledge' });
    } },
  ];
  const total = groups.reduce((s, g) => s + g.h, 0);
  const free = (cy1 - cy0) - total;
  if (free < 0) throw new Error(`[build_slides] Cover panel overflows vertical frame by ${(-free).toFixed(1)}pt`);
  const gap = free / (groups.length - 1);
  let y = cy0;
  groups.forEach((gr) => { gr.draw(y); y += gr.h + gap; });
  return { out };
}

// ---------------------------------------------------------------------------------------------
// Fit all panels in ONE headless Chrome pass (0.05pt steps; fail fast if any panel cannot fit)
// ---------------------------------------------------------------------------------------------
const MIN_FONT_PT = 5.8;
const allItems = [...collectCoverItems()];
const candidates = {};
for (const name of ['p2', 'p3', 'back']) {
  candidates[name] = [];
  for (let S = spec.panels[name].S; S >= MIN_FONT_PT - 1e-6; S = +(S - 0.05).toFixed(2)) {
    const tag = `${name}_${Math.round(S * 100)}`;
    candidates[name].push({ S, tag });
    allItems.push(...collectPanelItems(name, S, tag));
  }
}
const allH = measure(allItems);

const layouts = {};
for (const name of ['p2', 'p3', 'back']) {
  let chosen = null;
  let smallestAttempt = null;
  for (const { S, tag } of candidates[name]) {
    const L = stackPanel(name, S, tag, allH);
    smallestAttempt = { S, L };
    if (L.fits) {
      chosen = { S, L };
      break;
    }
  }
  if (!chosen) {
    throw new Error(
      `[build_slides] Panel "${name}" overflowed even at minimum font S=${smallestAttempt.S.toFixed(2)}pt ` +
        `(bottom=${smallestAttempt.L.bottom.toFixed(1)}pt > limit=${Y1}pt)`,
    );
  }
  console.log(`${name}: S=${chosen.S.toFixed(2)} bottom=${chosen.L.bottom.toFixed(1)} (limit ${Y1})`);
  layouts[name] = chosen.L.out;
}
layouts.cover = stackCover(allH).out;

// ---------------------------------------------------------------------------------------------
// Serialize Slides batchUpdate requests + encode 9 QR PNGs in pure Node (0 extra Chrome spawns)
// ---------------------------------------------------------------------------------------------
const { reqs, qrPlacements } = emitSlidesDeck({
  outSlide: OUT_SLIDE,
  inSlide: IN_SLIDE,
  insertAt: Number(process.env.INSERT_AT || 38),
  layouts,
  colors: C,
  runStyleFor,
  links: spec.links,
  siteHost: spec.siteHost,
});

fs.writeFileSync(path.join(OUT, 'requests.json'), JSON.stringify(reqs, null, 1));
fs.writeFileSync(path.join(OUT, 'qr_placements.json'), JSON.stringify(qrPlacements, null, 1));

for (const q of qrPlacements) {
  writeQrPng(q.url, path.join(OUT, 'qr', `${q.id}.png`));
}
console.log(`requests: ${reqs.length}, qr: ${qrPlacements.length}`);
