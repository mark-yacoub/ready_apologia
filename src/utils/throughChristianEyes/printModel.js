/**
 * Compiles the canonical copy in `content.js` into:
 *   1. Print HTML panels (`renderPrintPanels`) for `handouts/through-christian-eyes/generate.mjs`
 *   2. Typed Google Slides layout AST & text runs (`buildSlidesSpec`) for `handouts/through-christian-eyes/build_slides.mjs`
 *
 * Calls `loadThroughChristianEyes()` first so every editorial/tone/link invariant in `model.js` gates
 * Print and Slides builds automatically — zero duplicated prose, zero unguarded copy.
 */
import { ASIDE, CLOSING, HERO, LABELS, LINKS, SECTIONS, SITE_HOST } from './content.js';
import { COPY_LINK_RE, loadThroughChristianEyes } from './model.js';

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Single-link parenthetical citation: `([Bukhārī 4986](/path))` → `<cite>(Bukhārī 4986)</cite>` in print/slides. */
const SINGLE_LINK_CITE_RE = /\(\[((?:[^\[\]]|\[[^\[\]]*\])+)\]\(([^)\s]+)\)\)/g;

/** Strips markdown link targets while keeping link labels intact. */
const stripLinks = (s) => String(s).replace(COPY_LINK_RE, '$1');

/** Wrap ʿayn/hamza transliteration half-rings in `.tlm` outside HTML tags. */
export const wrapPrintTlm = (html) =>
  html
    .split(/(<[^>]+>)/g)
    .map((part) => (part.startsWith('<') ? part : part.replace(/[ʾʿ]+/g, '<span class="tlm">$&</span>')))
    .join('');

/** Asserts that no raw markdown tokens leaked into compiled Print HTML. */
function assertCleanPrintHtml(html, at) {
  for (const leak of ['**', '==', '](', '`']) {
    if (html.includes(leak)) throw new Error(`[printModel] ${at}: unrendered markup "${leak}" in Print HTML`);
  }
  const opened = (html.match(/“/g) || []).length;
  const closed = (html.match(/”/g) || []).length;
  if (opened !== closed) throw new Error(`[printModel] ${at}: unbalanced curly quotes (${opened} “ vs ${closed} ”)`);
}

/**
 * Compiles inline markdown from `content.js` to Print HTML (`generate.mjs`).
 * Supports `**bold**`, `*italic*`, `` `arabic` ``, `[label](url)`, `(ﷺ)`, `“quote”`, and `<cite>(…)</cite>`.
 */
export function compilePrintInline(md, { citeTrailing = false, coverMode = false, at = 'inline' } = {}) {
  const slots = [];
  const park = (frag) => `\u0000${slots.push(frag) - 1}\u0000`;

  let s = String(md ?? '');
  // 1. Backtick Arabic spans (with typographic hairspaces inside parens or before a Latin comma)
  s = s.replace(/\(`([^`]+)`\)/g, (_, ar) => park(`(\u200A<span class="ar">${escapeHtml(ar)}</span>\u200A)`));
  s = s.replace(/`([^`]+)`,/g, (_, ar) => park(`<span class="ar">${escapeHtml(ar)}</span>\u200A,`));
  s = s.replace(/`([^`]+)`/g, (_, ar) => park(`<span class="ar">${escapeHtml(ar)}</span>`));

  // 2. Single-link parenthetical citations → `<cite>(label)</cite>`
  s = s.replace(SINGLE_LINK_CITE_RE, (_, label) => park(`<cite>(${escapeHtml(label)})</cite>`));
  if (citeTrailing) {
    s = s.replace(/\(St\. Athanasius, c\. AD 359\)/g, (m) => park(`<cite>${escapeHtml(m)}</cite>`));
    s = s.replace(/\(([^()]+)\)$/, (_, inner) => park(`<cite>(${escapeHtml(stripLinks(inner))})</cite>`));
  }

  // 3. Strip remaining web links to their visible label, then HTML-escape
  s = escapeHtml(stripLinks(s));

  // 4. Upright honorifics
  s = s.replace(/\(ﷺ\)|ﷺ/g, (m) => park(`<span class="ar">${m}</span>`));

  // 5. Cover emphasized question (`*“…”*` stays red `<em>` without `.q` override)
  if (coverMode) {
    s = s.replace(/\*“([^“”]*)”\*/g, (_, qText) => park(`<em>“${qText}”</em>`));
  }

  // 6. Emphasis, highlights, and quotations
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/\*([^*]+)\*/g, '<i>$1</i>');
  s = s.replace(/==([^=]+?)==/g, '<mark>$1</mark>');
  s = s.replace(/“([^“”]*)”/g, '<span class="q">“$1”</span>');

  let prev;
  do {
    prev = s;
    s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[Number(i)]);
  } while (s !== prev);

  assertCleanPrintHtml(s, at);
  return wrapPrintTlm(s);
}

/** Break opportunities at '/' only, never mid-word or mid-hyphenated-slug. */
const fmtPrintUrl = (u) => escapeHtml(u).replace(/-/g, '&#8209;').replace(/\//g, '/<wbr>');

function renderPrintQr(id, label, { size = 0.56, side = 'right' } = {}) {
  return `
  <figure class="qr qr-${side}">
    <div class="qr-code" data-qr="https://${SITE_HOST}${LINKS[id]}" style="width:${size}in;height:${size}in"></div>
    <figcaption><b>${wrapPrintTlm(escapeHtml(label))}</b><span class="url">${fmtPrintUrl(SITE_HOST + LINKS[id])}</span></figcaption>
  </figure>`;
}

function wrapPrintWithQr(bodyHtml, deeper) {
  const { link, label, side = 'right', pdfSize = 0.56 } = deeper;
  return `
  <div class="with-qr ${side}">
    ${side === 'left' ? renderPrintQr(link, label, { size: pdfSize, side }) : ''}
    <div class="with-qr-body">${bodyHtml}</div>
    ${side === 'right' ? renderPrintQr(link, label, { size: pdfSize, side }) : ''}
  </div>`;
}

function renderPrintAnswer(text, at) {
  const paras = text.split(/\n\n+/).map((p, i) => {
    const prefix = i === 0 ? `<span class="answer-h">${escapeHtml(LABELS.answer)}</span> ` : '';
    return `<p>${prefix}${compilePrintInline(p, { at: `${at}[${i}]` })}</p>`;
  });
  return `<div class="answer">${paras.join('')}</div>`;
}

function renderPrintBlock(b, at) {
  if (b.kind === 'subhead') return `<h4>${wrapPrintTlm(escapeHtml(b.text))}</h4>`;
  if (b.kind === 'lead') return `<p class="lead-in">${compilePrintInline(b.text, { at })}</p>`;
  if (b.kind === 'answer') return renderPrintAnswer(b.text, at);
  if (b.kind === 'entry') {
    const hasAr = /`[^`]+`/.test(b.text || '');
    const cls = hasAr ? 'entry has-ar' : 'entry';
    const body = compilePrintInline(`${b.lead ? `**${b.lead}**` : ''}${b.text || ''}`, { at });
    const tail = b.webMore ? ` <span class="inline-url">${escapeHtml(SITE_HOST + b.webMore.href)}</span>` : '';
    return `<div class="${cls}">${body}${tail}</div>`;
  }
  if (b.kind === 'list') {
    const head = compilePrintInline(`${b.lead ? `**${b.lead}**` : ''}${b.text || ''}`, { at });
    const items = (b.items || []).map((li, j) => `<li>${compilePrintInline(li, { at: `${at}.items[${j}]` })}</li>`).join('');
    return `<div class="entry">${head}<ul class="witness">${items}</ul></div>`;
  }
  throw new Error(`[printModel] unexpected standalone block kind "${b.kind}" at ${at}`);
}

function renderPrintSection(sec, secIdx) {
  const num = secIdx + 1;
  const out = [
    `<div class="sec-head"><span class="sec-num">${num}</span><h3>${wrapPrintTlm(escapeHtml(sec.title))}</h3></div>`,
  ];
  if (sec.claim) {
    out.push(`<p class="claim">${compilePrintInline(sec.claim, { citeTrailing: true, at: `${sec.id}.claim` })}</p>`);
  }
  if (sec.lead) {
    out.push(`<p class="lead-in">${compilePrintInline(sec.lead, { at: `${sec.id}.lead` })}</p>`);
  }
  if (sec.pull) {
    const qHtml = compilePrintInline(sec.pull.quote, { at: `${sec.id}.pull.quote` });
    const cHtml = wrapPrintTlm(escapeHtml(stripLinks(sec.pull.cite)));
    out.push(`<p class="pull">${qHtml} <cite>${cHtml}</cite></p>`);
  }

  // Pair any `deeper` block with its preceding `qrSpan` (default 1) rendered blocks.
  const rendered = [];
  sec.blocks.forEach((b, bi) => {
    const at = `${sec.id}.blocks[${bi}]`;
    if (b.kind === 'deeper') {
      const span = b.qrSpan || 1;
      if (rendered.length < span) throw new Error(`[printModel] ${at}: qrSpan=${span} exceeds preceding blocks`);
      const group = rendered.splice(rendered.length - span, span).join('\n');
      rendered.push(wrapPrintWithQr(group, b));
    } else {
      rendered.push(renderPrintBlock(b, at));
    }
  });
  return [...out, ...rendered].join('\n');
}

/** Renders all four US Letter bi-fold handout panels (`panel1`..`panel4`) from `content.js`. */
export function renderPrintPanels() {
  loadThroughChristianEyes(); // Enforce all model.js editorial & link invariants first.

  const sourcesHtml = HERO.sourcesLines.map((l) => wrapPrintTlm(escapeHtml(l))).join('<br>');
  const panel1 = `
<section class="panel cover">
  <div class="cover-top">
    <div class="brand">${escapeHtml(HERO.printBrand)}</div>
    <div class="kicker">${escapeHtml(HERO.kicker)}</div>
  </div>
  <div class="cover-title">
    <h1>${wrapPrintTlm(escapeHtml(HERO.h1))}</h1>
    <div class="rule"></div>
    <h2>${wrapPrintTlm(escapeHtml(HERO.printSubtitle)).replace(/\u00A0/g, '&nbsp;')}</h2>
  </div>
  <div class="cover-intros">
    <p class="cover-intro">${compilePrintInline(HERO.intro[0], { coverMode: true, at: 'HERO.intro[0]' })}</p>
    <p class="cover-intro">${compilePrintInline(HERO.printIntro, { at: 'HERO.printIntro' })}</p>
  </div>
  <div class="pledge">
    <div class="pledge-h">${escapeHtml(HERO.sourcesLabel)}</div>
    <div class="pledge-list">${sourcesHtml}</div>
  </div>
</section>`;

  const byPanel = (name) =>
    SECTIONS.map((s, idx) => ({ s, idx }))
      .filter(({ s }) => s.panel === name)
      .map(({ s, idx }) => renderPrintSection(s, idx))
      .join('\n\n');

  const panel2 = `<section class="panel p2">\n${byPanel('p2')}\n</section>`;
  const panel3 = `<section class="panel p3">\n${byPanel('p3')}\n</section>`;

  const asideBody = `<p>${compilePrintInline(ASIDE.text, { at: 'ASIDE.text' })}</p>`;
  const asideHtml = `
  <div class="aside">
    <h5>${wrapPrintTlm(escapeHtml(ASIDE.title))}</h5>
    ${wrapPrintWithQr(asideBody, ASIDE.deeper)}
  </div>`;

  const closingHtml = `
  <div class="closing">
    <p class="invite">${compilePrintInline(CLOSING.invite, { at: 'CLOSING.invite' })}</p>
    <div class="foot">
      <div class="foot-love">${escapeHtml(CLOSING.printFooter.love)}</div>
      <p>${compilePrintInline(CLOSING.printFooter.orthodoxy, { citeTrailing: true, at: 'CLOSING.printFooter.orthodoxy' })}</p>
      <div class="foot-site">${escapeHtml(CLOSING.printFooter.site)}</div>
    </div>
  </div>`;

  const panel4 = `<section class="panel back">\n${byPanel('back')}\n${asideHtml}\n${closingHtml}\n</section>`;
  return { panel1, panel2, panel3, panel4 };
}

// =============================================================================================
// GOOGLE SLIDES COMPILER (Typed Runs & Panel AST — zero intermediate brace-regex strings)
// =============================================================================================

/** Splits transliteration half-rings (`ʾ`/`ʿ`) and `(ﷺ)` into Amiri sub-runs so Slides never slants/widens them. */
export function splitSlidesGlyphs(runs) {
  const out = [];
  for (const r of runs) {
    if (!r.t) continue;
    if (r.s === 'a' || r.s === 'u' || !/[ʾʿﷺ]/.test(r.t)) {
      out.push(r);
      continue;
    }
    for (const part of r.t.split(/(\(ﷺ\)|ﷺ|[ʾʿ]+)/g)) {
      if (!part) continue;
      if (part.includes('ﷺ')) out.push({ t: part, s: r.s, sal: true });
      else if (/[ʾʿ]/.test(part)) out.push({ t: part, s: r.s, tlm: true });
      else out.push({ t: part, s: r.s });
    }
  }
  return out;
}

/** Concatenates the plain visible text of a Slides run array. */
export const runsPlainText = (runs) => runs.map((r) => r.t).join('');

function assertCleanSlidesRuns(runs, at) {
  const full = runsPlainText(runs);
  for (const leak of ['**', '==', '](', '`', '{q:', '{c:', '{a:', '{u:']) {
    if (full.includes(leak)) throw new Error(`[printModel] ${at}: unrendered markup "${leak}" in Slides text`);
  }
  const opened = (full.match(/“/g) || []).length;
  const closed = (full.match(/”/g) || []).length;
  if (opened !== closed) throw new Error(`[printModel] ${at}: unbalanced curly quotes (${opened} “ vs ${closed} ”)`);
}

/**
 * Compiles inline markdown from `content.js` directly into typed Slides runs:
 *   `{ t: string, s: '' | 'b' | 'em' | 'q' | 'c' | 'u' | 'r' | 'i' | 'a', tlm?: boolean, sal?: boolean }`
 */
export function compileSlidesRuns(md, { citeTrailing = false, coverMode = false, prefixRuns = [], suffixRuns = [], at = 'slides' } = {}) {
  const slots = [];
  const park = (runList) => `\u0000${slots.push(runList) - 1}\u0000`;

  let s = String(md ?? '');
  // 1. Backtick Arabic spans
  s = s.replace(/\(`([^`]+)`\)/g, (_, ar) => park([{ t: '(\u200A', s: '' }, { t: ar, s: 'a' }, { t: '\u200A)', s: '' }]));
  s = s.replace(/`([^`]+)`,/g, (_, ar) => park([{ t: ar, s: 'a' }, { t: '\u200A,', s: '' }]));
  s = s.replace(/`([^`]+)`/g, (_, ar) => park([{ t: ar, s: 'a' }]));

  // 2. Citations
  s = s.replace(SINGLE_LINK_CITE_RE, (_, label) => park([{ t: `(${label})`, s: 'c' }]));
  if (citeTrailing) {
    s = s.replace(/\(St\. Athanasius, c\. AD 359\)/g, (m) => park([{ t: m, s: 'c' }]));
    s = s.replace(/\(([^()]+)\)$/, (_, inner) => park([{ t: `(${stripLinks(inner)})`, s: 'c' }]));
  }

  // 3. Strip remaining web links to their visible label (preserving *italic* inside labels)
  s = stripLinks(s);

  // 4. Cover emphasized quote (`*“…”*` → red italic `i`)
  if (coverMode) {
    s = s.replace(/\*“([^“”]*)”\*/g, (_, qText) => park([{ t: `“${qText}”`, s: 'i' }]));
  }

  // 5. Tokenize bold, italic, highlights, quotations, and parked run slots in one pass
  const tokenRe = /\u0000(\d+)\u0000|\*\*([^*]+)\*\*|\*([^*]+)\*|==([^=]+?)==|“([^“”]*)”/g;
  const rawRuns = [...prefixRuns];
  let last = 0;
  let m;
  while ((m = tokenRe.exec(s))) {
    if (m.index > last) rawRuns.push({ t: s.slice(last, m.index), s: '' });
    if (m[1] !== undefined) rawRuns.push(...slots[Number(m[1])]);
    else if (m[2] !== undefined) rawRuns.push({ t: m[2], s: 'b' });
    else if (m[3] !== undefined) rawRuns.push({ t: m[3], s: 'em' });
    else if (m[4] !== undefined) rawRuns.push({ t: m[4], s: 'b' });
    else if (m[5] !== undefined) rawRuns.push({ t: `“${m[5]}”`, s: 'q' });
    last = tokenRe.lastIndex;
  }
  if (last < s.length) rawRuns.push({ t: s.slice(last), s: '' });
  rawRuns.push(...suffixRuns);

  const finalRuns = splitSlidesGlyphs(rawRuns);
  assertCleanSlidesRuns(finalRuns, at);
  return finalRuns;
}

/** Plain literal run(s) (with `ʾ`/`ʿ` split into Amiri `.tlm`). */
export const plainSlidesRuns = (text, s = '') => splitSlidesGlyphs([{ t: String(text), s }]);

function qrSpec(deeper) {
  return {
    id: deeper.link,
    label: deeper.label,
    side: deeper.side || 'right',
    size: deeper.slidesSize || 40,
  };
}

function buildSlidesBlock(b, at) {
  if (b.kind === 'subhead') {
    return [
      { type: 'text', kind: 'label', paras: [plainSlidesRuns(b.text.toUpperCase())] },
      { type: 'rule' },
    ];
  }
  if (b.kind === 'lead') {
    return [{ type: 'text', kind: 'lead', paras: [compileSlidesRuns(b.text, { at })] }];
  }
  if (b.kind === 'answer') {
    const paras = b.text.split(/\n\n+/).map((p, i) =>
      compileSlidesRuns(p, {
        prefixRuns: i === 0 ? [{ t: LABELS.answer, s: 'r' }, { t: ' ', s: '' }] : [],
        at: `${at}[${i}]`,
      }),
    );
    return [{ type: 'text', kind: 'body', isAnswer: true, paras }];
  }
  if (b.kind === 'entry') {
    const hasAr = /`[^`]+`/.test(b.text || '');
    const suffixRuns = b.webMore ? [{ t: ' ', s: '' }, { t: `${SITE_HOST}${b.webMore.href}`, s: 'u' }] : [];
    const runs = compileSlidesRuns(`${b.lead ? `**${b.lead}**` : ''}${b.text || ''}`, { suffixRuns, at });
    return [{ type: 'text', kind: 'body', coalescibleEntry: true, hasAr, paras: [runs] }];
  }
  if (b.kind === 'list') {
    const headRuns = compileSlidesRuns(`${b.lead ? `**${b.lead}**` : ''}${b.text || ''}`, { at });
    const itemParas = (b.items || []).map((li, j) =>
      compileSlidesRuns(li, { prefixRuns: [{ t: '•  ', s: '' }], at: `${at}.items[${j}]` }),
    );
    return [{ type: 'text', kind: 'body', tight: true, paras: [headRuns, ...itemParas] }];
  }
  throw new Error(`[printModel] unexpected Slides block "${b.kind}" at ${at}`);
}

/** Coalesces adjacent standalone `entry` blocks that share the same `hasAr` flag into one multi-paragraph Slides box. */
function coalesceEntries(nodes) {
  const out = [];
  for (const n of nodes) {
    const prev = out[out.length - 1];
    if (
      prev &&
      prev.coalescibleEntry &&
      n.coalescibleEntry &&
      !prev.qr &&
      !n.qr &&
      Boolean(prev.hasAr) === Boolean(n.hasAr)
    ) {
      prev.paras.push(...n.paras);
    } else {
      out.push(n);
    }
  }
  return out;
}

function buildSlidesSection(sec, secIdx) {
  const num = secIdx + 1;
  const nodes = [{ type: 'head', num, paras: [plainSlidesRuns(sec.title)] }];
  if (sec.claim) {
    nodes.push({ type: 'text', kind: 'body', paras: [compileSlidesRuns(sec.claim, { citeTrailing: true, at: `${sec.id}.claim` })] });
  }
  if (sec.lead) {
    nodes.push({ type: 'text', kind: 'lead', paras: [compileSlidesRuns(sec.lead, { at: `${sec.id}.lead` })] });
  }
  if (sec.pull) {
    nodes.push({
      type: 'text',
      kind: 'pull',
      hasPullBar: true,
      paras: [
        compileSlidesRuns(sec.pull.quote, { at: `${sec.id}.pull.quote` }),
        plainSlidesRuns(stripLinks(sec.pull.cite), 'c'),
      ],
    });
  }

  const secBody = [];
  sec.blocks.forEach((b, bi) => {
    const at = `${sec.id}.blocks[${bi}]`;
    if (b.kind === 'deeper') {
      const span = b.qrSpan || 1;
      if (secBody.length < span) throw new Error(`[printModel] ${at}: qrSpan=${span} exceeds preceding Slides blocks`);
      const group = coalesceEntries(secBody.splice(secBody.length - span, span));
      const qr = qrSpec(b);
      if (group.length === 1) {
        group[0].qr = qr;
        secBody.push(group[0]);
      } else {
        secBody.push({ type: 'stackQr', children: group, qr });
      }
    } else {
      // Insert small breathing gap before section-closing answer when preceded by a QR block on p2
      if (b.kind === 'answer' && sec.panel === 'p2' && secBody.at(-1)?.qr) {
        secBody.push({ type: 'gap', h: 2 });
      }
      secBody.push(...buildSlidesBlock(b, at));
    }
  });

  return [...nodes, ...coalesceEntries(secBody)];
}

/** Builds the complete, validated Google Slides specification from `content.js`. */
export function buildSlidesSpec() {
  loadThroughChristianEyes(); // Enforce all model.js editorial & link invariants first.

  const panelBlocks = (panelName) => {
    const matching = SECTIONS.map((s, idx) => ({ s, idx })).filter(({ s }) => s.panel === panelName);
    const blocks = [];
    matching.forEach(({ s, idx }, pos) => {
      if (pos > 0) blocks.push({ type: 'gap', h: 1 });
      blocks.push(...buildSlidesSection(s, idx));
    });
    if (panelName === 'back') {
      blocks.push(
        { type: 'gap', h: 3 },
        { type: 'rule' },
        { type: 'text', kind: 'asideLabel', paras: [plainSlidesRuns(ASIDE.title.toUpperCase())] },
        {
          type: 'text',
          kind: 'aside',
          paras: [compileSlidesRuns(ASIDE.text, { at: 'ASIDE.text' })],
          qr: qrSpec(ASIDE.deeper),
        },
      );
    }
    return blocks;
  };

  const cover = {
    brand: [plainSlidesRuns(HERO.printBrand)],
    kicker: [plainSlidesRuns(HERO.kicker.toUpperCase())],
    h1: [plainSlidesRuns(HERO.h1)],
    h2: [plainSlidesRuns(HERO.printSubtitle)],
    intro: [
      compileSlidesRuns(HERO.intro[0], { coverMode: true, at: 'HERO.intro[0]' }),
      compileSlidesRuns(HERO.printIntro, { at: 'HERO.printIntro' }),
    ],
    pledge: [
      plainSlidesRuns(HERO.sourcesLabel.toUpperCase()),
      ...HERO.sourcesLines.map((l) => plainSlidesRuns(l)),
    ],
  };

  const closing = [
    { kind: 'invite', paras: [compileSlidesRuns(CLOSING.invite, { at: 'CLOSING.invite' })] },
    { kind: 'rule' },
    { kind: 'love', paras: [plainSlidesRuns(CLOSING.printFooter.love)] },
    { kind: 'footp', paras: [compileSlidesRuns(CLOSING.printFooter.orthodoxy, { citeTrailing: true, at: 'CLOSING.printFooter.orthodoxy' })] },
    { kind: 'site', paras: [plainSlidesRuns(CLOSING.printFooter.site)] },
  ];

  return {
    siteHost: SITE_HOST,
    links: LINKS,
    cover,
    panels: {
      p2: { S: 7.45, blocks: panelBlocks('p2') },
      p3: { S: 7.2, blocks: panelBlocks('p3') },
      back: { S: 8.2, blocks: panelBlocks('back') },
    },
    closing,
  };
}
