// Bi-fold handout: "Through Christian Eyes: Why We Cannot Accept Islam as Divine Revelation".
// From Orthodox Evangelism, St. Moses & St. Katherine Coptic Orthodox Church (smsk.ca).
//
// US Letter landscape (11" × 8.5"), printed double-sided and folded once into four 5.5" × 8.5" panels.
//   Sheet 1 (outside): left = Panel 4 (back cover), right = Panel 1 (front cover)
//   Sheet 2 (inside):  left = Panel 2,              right = Panel 3
// Print: 100% / actual size, duplex "flip on short edge".
//
// Copy is compiled directly from `src/utils/throughChristianEyes/content.js` via `printModel.js`
// (single source of truth; guarded by `model.js` tone, link, and markup-leak checks).
// Run:  NODE=$(ls ~/.vscode-server/cli/servers/*/server/node | head -1); $NODE handouts/through-christian-eyes/generate.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { renderPrintPanels } from '../../src/utils/throughChristianEyes/printModel.js';
import { QR_JS_SOURCE, runChrome } from './chrome.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const C = { ink: '#1C1917', muted: '#57534E', red: '#883432', gold: '#9A4406', paper: '#FBF8F3', line: '#E2D8CA', quote: '#3B1F14' };
const PANEL_NAMES = ['Panel 4 (Back Cover)', 'Panel 1 (Front Cover)', 'Panel 2 (Inside Left)', 'Panel 3 (Inside Right)'];

const { panel1, panel2, panel3, panel4 } = renderPrintPanels();

const css = `
@import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400..800;1,7..72,400..700&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Cinzel:wght@600;700&family=Amiri&family=JetBrains+Mono:wght@500&display=swap');
@page { size: 11in 8.5in; margin: 0; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'Public Sans', sans-serif; color: ${C.ink}; }
.sheet { width: 11in; height: 8.5in; display: flex; position: relative; page-break-after: always; overflow: hidden; }
.sheet:last-child { page-break-after: auto; }
.fold { position: absolute; left: 5.5in; top: 0; bottom: 0; border-left: 1px dashed rgba(0,0,0,0.12); }
@media print { .fold { display: none; } }
.panel { width: 5.5in; height: 8.5in; padding: 0.28in 0.34in 0.26in; background: ${C.paper}; display: flex; flex-direction: column; overflow: hidden; font-size: 7.45pt; line-height: 1.3; }
.panel > * { flex-shrink: 0; }

/* headings */
.sec-head { display: flex; align-items: center; gap: 0.07in; margin: 0.03in 0 0.03in; }
.sec-num { font-family: 'Cinzel', serif; font-weight: 700; font-size: 8pt; line-height: 1; padding-top: 1.8pt; color: #fff; background: ${C.red}; width: 0.22in; height: 0.22in; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
h3 { font-family: 'Literata', serif; font-size: 11.4pt; line-height: 1.12; color: ${C.red}; font-weight: 800; }
h4 { font-size: 6.3pt; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: ${C.gold}; margin: 0.048in 0 0.024in; padding-bottom: 0.018in; border-bottom: 1px solid ${C.line}; }
h5 { font-size: 6.4pt; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: ${C.muted}; margin-bottom: 0.03in; }
.tlm { font-family: 'Amiri', serif; font-style: normal; letter-spacing: 0; line-height: 0; }
.ar { font-family: 'Amiri', serif; font-style: normal; font-size: 1.06em; line-height: 1; }
.has-ar { line-height: 1.38; }

.p2 { font-size: 7.15pt; line-height: 1.26; }
.p2 .entry { margin-bottom: 0.039in; }
.p2 .lead-in { margin-bottom: 0.034in; }
.p2 .with-qr { margin: 0.024in 0 0.046in; }

.p3 { padding: 0.23in 0.31in 0.22in; font-size: 6.76pt; line-height: 1.225; }
.p3 h3 { font-size: 10.8pt; }
.p3 .with-qr { gap: 0.085in; margin: 0.014in 0 0.026in; }
.p3 .qr { width: 1.10in; }
.p3 .entry { margin-bottom: 0.021in; }
.p3 .with-qr-body .entry { margin-bottom: 0.028in; }
.p3 .lead-in { margin-bottom: 0.022in; }
.p3 .sec-head { margin: 0.016in 0 0.018in; }
.p3 .qr figcaption { margin-top: 0.015in; }
.p3 .pull { margin: 0.006in 0 0.022in; }
.p3 .pull .q { font-size: 8.5pt; }

/* text */
.q { font-family: 'Literata', serif; font-style: italic; color: ${C.quote}; font-size: 1.02em; }
.claim { margin-bottom: 0.03in; color: ${C.muted}; }
.claim .q { font-size: 8.2pt; }
.pull { margin: 0.01in 0 0.035in; padding-left: 0.1in; border-left: 3px solid #8A4B08; }
.pull .q { font-size: 10.2pt; font-weight: 600; color: #8A4B08; }
.pull cite { display: block; margin-top: 0.018in; }
.lead-in { color: ${C.muted}; margin-bottom: 0.04in; }
.entry { margin-bottom: 0.045in; }
.entry:last-child { margin-bottom: 0; }
cite { font-family: 'Public Sans', sans-serif; font-style: normal; color: ${C.muted}; font-size: 0.91em; white-space: nowrap; }
.inline-url { font-family: 'JetBrains Mono', monospace; font-size: 5.9pt; color: ${C.muted}; white-space: nowrap; }

/* QR */
.with-qr { display: flex; gap: 0.12in; align-items: center; margin: 0.03in 0 0.05in; }
.with-qr-body { flex: 1; min-width: 0; }
.with-qr-body p + p { margin-top: 0.035in; }
.qr { display: flex; flex-direction: column; align-items: center; text-align: center; flex-shrink: 0; width: 1.22in; }
.qr-code { background: #fff; padding: 4px; border: 1px solid ${C.line}; border-radius: 3px; }
.qr-code img, .qr-code canvas { width: 100% !important; height: 100% !important; display: block; image-rendering: pixelated; }
.qr figcaption { margin-top: 0.028in; line-height: 1.16; }
.qr figcaption b { display: block; font-size: 5.75pt; font-weight: 700; color: ${C.red}; }
.qr .url { display: block; font-family: 'JetBrains Mono', monospace; font-size: 4.85pt; color: ${C.muted}; word-break: keep-all; overflow-wrap: break-word; margin-top: 1px; }

/* low-emphasis asides (no box) */
.aside { margin-top: auto; padding-top: 0.055in; border-top: 1px solid ${C.line}; font-size: 7.1pt; color: ${C.muted}; }
.aside .q { color: #44403C; }
.aside .with-qr { margin-bottom: 0; }

/* cover */
.cover { justify-content: space-between; padding: 0.54in 0.48in 0.56in; position: relative; }
.cover::before { content: ''; position: absolute; inset: 0.30in; border: 1px solid ${C.red}59; pointer-events: none; }
.cover-top { display: flex; justify-content: space-between; align-items: baseline; }
.brand { font-family: 'Cinzel', serif; font-weight: 700; color: ${C.red}; letter-spacing: 0.08em; font-size: 8.5pt; }
.kicker { font-size: 6.2pt; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ${C.gold}; }
.cover-title h1 { font-family: 'Literata', serif; font-size: 31pt; line-height: 1.04; color: ${C.red}; font-weight: 800; }
.cover-title .rule { width: 0.9in; height: 3px; background: ${C.gold}; margin: 0.17in 0 0.13in; }
.cover-title h2 { font-family: 'Literata', serif; font-size: 16.5pt; line-height: 1.18; color: ${C.ink}; font-weight: 600; }
.cover-intros { display: flex; flex-direction: column; gap: 0.12in; }
.cover-intro { font-family: 'Literata', serif; font-size: 10.2pt; line-height: 1.45; }
.cover-intro em { color: ${C.red}; }
.pledge { border-left: 3px solid ${C.red}; padding: 0.02in 0 0.02in 0.12in; margin-bottom: 0.06in; }
.pledge-h { font-size: 6.4pt; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: ${C.red}; margin-bottom: 0.03in; }
.pledge-list { font-weight: 600; font-size: 8.5pt; line-height: 1.42; }
.closing { text-align: center; }

/* back */
.back { font-size: 7.75pt; line-height: 1.28; }
.back h3 { font-size: 12.8pt; }
.back .with-qr { margin: 0.022in 0 0.042in; }
.back > .answer { margin: 0.02in 0 0.04in; }
.back .aside { margin-top: 0.055in; padding-top: 0.055in; font-size: 7.15pt; line-height: 1.27; }
.back .aside h5 { margin-bottom: 0.03in; }
.back .closing { margin-top: auto; border-top: 1px solid ${C.line}; padding-top: 0.055in; }
.closing p { font-family: 'Literata', serif; font-style: italic; font-size: 9pt; margin-bottom: 0.045in; }

/* answers */
.answer { background: #F3EBE0; border-left: 3px solid ${C.red}; padding: 0.035in 0.07in; border-radius: 2px; }
.answer p + p { margin-top: 0.032in; }
.answer-h { font-weight: 800; color: ${C.red}; }
.witness { margin: 0.022in 0 0 0.14in; }
.witness li { margin-bottom: 0.014in; }

/* footer */
.closing .invite { font-family: 'Public Sans', sans-serif; font-style: normal; font-size: 7.35pt; line-height: 1.3; margin-bottom: 0.05in; text-align: left; }
.foot { text-align: center; border-top: 1px solid ${C.line}; padding-top: 0.045in; }
.foot-love { font-family: 'Literata', serif; font-weight: 700; color: ${C.red}; font-size: 9.2pt; }
.foot p { font-family: 'Literata', serif; font-style: normal; font-size: 6.65pt; color: ${C.muted}; margin: 0.02in 0 0.028in; line-height: 1.28; }
.foot-site { font-family: 'Cinzel', serif; font-weight: 700; color: ${C.red}; font-size: 10.6pt; letter-spacing: 0.06em; }
`;

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>PENDING_FONTS</title>
<style>${css}</style></head>
<body>
  <div class="sheet" id="outside">${panel4}${panel1}<div class="fold"></div></div>
  <div class="sheet" id="inside">${panel2}${panel3}<div class="fold"></div></div>
  <script>${QR_JS_SOURCE}</script>
  <script>
    document.querySelectorAll('.qr-code').forEach((el) => {
      new QRCode(el, { text: el.dataset.qr, width: 240, height: 240, colorDark: '#2A0F0E', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
    });
    document.fonts.ready.then(() => {
      const report = [...document.querySelectorAll('.panel')].map((p, i) => {
        const pb = parseFloat(getComputedStyle(p).paddingBottom) || 26;
        const last = [...p.children].reduce((m, c) => Math.max(m, c.getBoundingClientRect().bottom), 0);
        return { i, over: Math.round(last - (p.getBoundingClientRect().bottom - pb)) };
      });
      document.title = JSON.stringify(report);
    });
  </script>
</body></html>`;

const htmlPath = path.resolve(dir, 'handout.html');
const pdfPath = path.resolve(dir, 'ThroughChristianEyes_Bifold_Letter.pdf');
fs.writeFileSync(htmlPath, html);

console.log('Rendering PDF…');
runChrome(['--virtual-time-budget=8000', '--no-pdf-header-footer', `--print-to-pdf=${pdfPath}`, `file://${htmlPath}`]);

console.log('Overflow check…');
const dom = runChrome(['--virtual-time-budget=8000', '--window-size=1056,816', '--dump-dom', `file://${htmlPath}`]);
const rawTitle = ((dom.match(/<title>(.*?)<\/title>/) || [])[1] || '').replace(/&quot;/g, '"');

let report;
try {
  report = JSON.parse(rawTitle);
} catch {
  throw new Error(`[generate] Font-ready overflow check did not resolve in time (<title>="${rawTitle}")`);
}
if (!Array.isArray(report) || report.length !== 4) {
  throw new Error(`[generate] Expected 4 panel measurements, got: ${JSON.stringify(report)}`);
}
console.log('  panel overflow past bottom padding (px, ≤0 is OK):', JSON.stringify(report));
const clipped = report.filter((p) => p.over > 0);
if (clipped.length) {
  throw new Error(
    `[generate] ${clipped.length} panel(s) overflow bottom padding: ` +
      clipped.map((p) => `${PANEL_NAMES[p.i]} (+${p.over}px)`).join(', '),
  );
}

console.log('Rendering PNG previews…');
execFileSync('pdftoppm', ['-png', '-r', '150', pdfPath, path.resolve(dir, 'preview')]);
console.log('Done:', pdfPath);
