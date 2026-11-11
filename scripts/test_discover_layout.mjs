#!/usr/bin/env node
// Layout regression check for the /discover articles (built site, real browser).
//
//   node scripts/test_discover_layout.mjs [--base http://127.0.0.1:8090] [page-id ...]
//
// With no page ids, every page in PAGES is checked. Serve the built `dist/` first, for example
// `python3 -m http.server 8090 --bind 127.0.0.1 --directory dist`.
// It drives headless Chrome over the DevTools protocol (no extra npm dependency) at the playbook's
// three widths (360, 412, 1280 px). A page fails if:
//   1. it scrolls horizontally (content wider than the viewport);
//   2. a stand-alone control (the page's `controls` selectors) is shorter than 44 px. Inline citations
//      inside running text are not listed, so they are exempt;
//   3. two consecutive major sections are less than 40 px apart (re-cramming);
//   4. a card's source chips overlap its quotation (the old negative-margin hack).
// It exits 0 with a warning if Chrome (or Node 22+'s WebSocket) is missing, so it never blocks a
// machine without them.
//
// Adding a page: add an entry to PAGES with its URL path, the article root, and the selectors.
// `card`, `quote` and `chips` may be null for pages without quotation cards.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

/** One entry per page. Selectors are scoped to `root`. */
const PAGES = {
  'origins-of-revelation': {
    path: '/discover/origins-of-revelation/',
    root: '.hrv.orv',
    section: '.orv-sec',
    card: '.orv-card', quote: '.orv-card__q', chips: '.hrv-verify',
    controls: ['.orv-nav__chip', '.orv-nav__back', '.orv-card .hrv-verify a', '.hrv-disclosure > summary',
      '.orv-glance__row', '.orv-head__context', '.orv-context', '.orv-top', '.orv-card__repeat .hrv-link', '.hrv-src'],
  },
  'from-mecca-to-medina': {
    path: '/discover/from-mecca-to-medina/',
    root: '.hrv.mm',
    section: '.mm-q',
    card: '.mm-ev', quote: '.mm-quote', chips: '.mm-verify',
    controls: ['.hrv-bar__back', '.hrv-iconbtn', '.mm-index__sum', '.mm-index__q a', '.mm-index__items a', '.mm-index__tail a',
      '.mm-ctx a', '.mm-copy', '.hrv-tab', '.mm-more > summary', '.hrv-verify a', '.hrv-disclosure > summary', '.mm-next',
      '.mm-show__list a', 'a.hrv-src', '.hrv-more > summary'],
  },
  'quran-preservation': {
    path: '/discover/quran-preservation/',
    root: '.hrv.qp',
    section: '.qp-q',
    card: '.hrv-ev', quote: '.hrv-quote', chips: '.hrv-verify',
    controls: ['.hrv-bar__back', '.hrv-iconbtn', '.qp-index__sum', '.qp-index__q a', '.qp-index__items a', '.qp-ctx a',
      '.qp-copy', '.hrv-tab', '.hrv-verify a', '.qp-more > summary', '.qp-applink', '.qp-next', 'a.hrv-src', '.hrv-more > summary'],
  },
  'islamic-dilemma': {
    path: '/discover/islamic-dilemma/',
    root: '.hrv.idl',
    section: '.idl-sec',
    card: '.hrv-ev', quote: '.hrv-quote', chips: '.hrv-verify',
    controls: ['.idl-nav__back', '.idl-nav__chip', '.idl-nav__copy', '.idl-gcard', '.hrv-verify a', '.hrv-disclosure > summary',
      'a.hrv-src', '.hrv-more > summary'],
  },
  'convenient-revelations': {
    path: '/discover/convenient-revelations/',
    root: '.crv',
    section: '.crv-q-sec',
    card: null, quote: null, chips: null,
    controls: ['.hrv-bar__back', '.hrv-iconbtn', '.hrv-disclosure > summary', '.hrv-row', '.hrv-more > summary'],
  },
  'muhammad-and-slavery': {
    path: '/discover/muhammad-and-slavery/',
    root: '.hrv.ms',
    section: '.ms-hubq',
    card: null, quote: null, chips: null,
    controls: ['.hrv-bar__back', '.hrv-iconbtn', '.ms-start__cta', '.ms-browse__card', '.hrv-row', '.hrv-disclosure > summary'],
  },
  'divinity-timeline': {
    path: '/discover/divinity-timeline/',
    root: '.hrv.dtl',
    section: '.dtl-sec',
    card: '.dtl-card', quote: '.dtl-card__q', chips: '.hrv-verify',
    controls: ['.dtl-nav__chip', '.dtl-nav__back', '.dtl-nav__copy', '.dtl-glance__row', '.dtl-head__context', '.dtl-timeline__link', '.hrv-verify a', '.hrv-disclosure > summary', '.hrv-src', '.dtl-top'],
  },
  'extrabiblical-evidence-for-jesus': {
    path: '/discover/extrabiblical-evidence-for-jesus/',
    root: '.hrv.ebj',
    section: '.ebj-sec',
    card: '.ebj-card', quote: '.ebj-card__q', chips: '.hrv-verify',
    controls: ['.ebj-nav__chip', '.ebj-nav__back', '.ebj-nav__copy', '.ebj-glance__row', '.ebj-head__context', '.hrv-verify a', '.hrv-disclosure > summary', '.hrv-src', '.ebj-top'],
  },
  'trustworthiness-of-the-bible': {
    path: '/discover/trustworthiness-of-the-bible/',
    root: '.hrv.twb',
    section: '.twb-sec',
    card: '.twb-card', quote: '.twb-card__q', chips: '.hrv-verify',
    controls: ['.twb-nav__chip', '.twb-nav__back', '.twb-nav__copy', '.twb-glance__row', '.hrv-verify a', '.hrv-disclosure > summary', '.twb-scan__open', '.hrv-src', '.twb-top', '.twb-head__context'],
  },
};

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = (baseIdx >= 0 ? args.splice(baseIdx, 2)[1] : 'http://127.0.0.1:8090').replace(/\/$/, '');
const unknown = args.filter(id => !PAGES[id]);
if (unknown.length) { console.error(`Unknown page id(s): ${unknown.join(', ')}. Known: ${Object.keys(PAGES).join(', ')}`); process.exit(2); }
const SELECTED = args.length ? args : Object.keys(PAGES);
const WIDTHS = [360, 412, 1280];
const MIN_TAP = 44;
const MIN_SECTION_GAP = 40;
const CHROME = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']
  .find(bin => spawnSync('which', [bin]).status === 0);

if (!CHROME) {
  console.warn('SKIP: no Chrome/Chromium on PATH; layout checks not run.');
  process.exit(0);
}
if (typeof WebSocket === 'undefined') {
  console.warn(`SKIP: this Node (${process.version}) has no global WebSocket (needs Node 22+); layout checks not run.`);
  process.exit(0);
}

/** Minimal CDP session on a fresh headless Chrome; kills Chrome and removes its profile on exit. */
async function openBrowser() {
  const port = 9400 + Math.floor(Math.random() * 500);
  const profile = mkdtempSync(join(tmpdir(), 'orv-layout-'));
  const proc = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${port}`, '--remote-debugging-address=127.0.0.1',
    `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  const cleanup = () => { proc.kill('SIGKILL'); rmSync(profile, { recursive: true, force: true }); };
  process.on('exit', cleanup);
  let wsUrl;
  for (let i = 0; i < 50 && !wsUrl; i++) {
    await sleep(200);
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      wsUrl = targets.find(t => t.type === 'page')?.webSocketDebuggerUrl;
    } catch { /* Chrome still starting */ }
  }
  if (!wsUrl) throw new Error('Chrome did not expose a DevTools endpoint');
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    const p = pending.get(msg.id);
    if (!p) return;
    pending.delete(msg.id);
    msg.error ? p.rej(new Error(msg.error.message)) : p.res(msg.result);
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params }));
  });
  const evaluate = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };
  return { send, evaluate, close: () => { ws.close(); cleanup(); } };
}

// Runs in the page (as a string, so it is serialised with its config). Opens every <details> so
// collapsed controls are measured too.
const measure = cfg => `((cfg) => {
  const root = document.querySelector(cfg.root);
  if (!root) return { missing: true };
  root.querySelectorAll('details').forEach(d => { d.open = true; });
  const vw = document.documentElement.clientWidth;
  const out = { overflow: [], smallTaps: [], tightSections: [], overlaps: [] };

  // 1. horizontal overflow: an element extending past the viewport that is not inside its own
  //    scrolling/clipping track (scrollable chip rows clip their children by design).
  const inScroller = el => { for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
    const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') return true; } return false; };
  for (const el of root.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > vw + 1 && !inScroller(el)) {
      out.overflow.push(String(el.className || el.tagName).slice(0, 60) + ' right=' + Math.round(r.right));
      if (out.overflow.length > 5) break;
    }
  }

  // 2. tap targets on stand-alone controls.
  for (const sel of cfg.controls) for (const el of root.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    if (r.width && r.height < ${MIN_TAP} - 0.5) out.smallTaps.push(sel + ' h=' + r.height.toFixed(1) + ' "' + el.textContent.trim().slice(0, 40) + '"');
  }

  // 3. section rhythm: the gap between consecutive major sections.
  const secs = [...root.querySelectorAll(cfg.section)].filter(s => s.getBoundingClientRect().height > 0);
  for (let i = 1; i < secs.length; i++) {
    const gap = secs[i].getBoundingClientRect().top - secs[i - 1].getBoundingClientRect().bottom;
    if (gap < ${MIN_SECTION_GAP}) out.tightSections.push((secs[i].id || cfg.section + '#' + i) + ' gap=' + Math.round(gap));
  }

  // 4. chips must sit below their quotation.
  if (cfg.card) for (const card of root.querySelectorAll(cfg.card)) {
    const q = card.querySelector(cfg.quote), chips = card.querySelector(cfg.chips);
    if (!q || !chips) continue;
    const overlap = q.getBoundingClientRect().bottom - chips.getBoundingClientRect().top;
    if (overlap > 0.5) out.overlaps.push((card.id || 'card') + ' by ' + overlap.toFixed(1) + 'px');
  }
  out.counts = { sections: secs.length };
  return out;
})(${JSON.stringify(cfg)})`;

const browser = await openBrowser();
let failures = 0;
try {
  await browser.send('Page.enable');
  for (const id of SELECTED) {
    const cfg = PAGES[id];
    for (const width of WIDTHS) {
      await browser.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
      await browser.send('Page.navigate', { url: BASE + cfg.path });
      for (let i = 0; i < 50 && await browser.evaluate('document.readyState') !== 'complete'; i++) await sleep(100);
      await sleep(300);
      const m = await browser.evaluate(measure(cfg));
      const tag = `${id} @${width}px`;
      if (m.missing || !m.counts.sections) {
        console.log(`FAIL ${tag}: article not rendered (root ${cfg.root} / sections ${cfg.section} not found)`);
        failures++; continue;
      }
      const checks = [
        ['no horizontal overflow', m.overflow],
        [`stand-alone controls ≥ ${MIN_TAP}px`, m.smallTaps],
        [`sections ≥ ${MIN_SECTION_GAP}px apart`, m.tightSections],
        ['source chips below their quotation', m.overlaps],
      ];
      for (const [name, problems] of checks) {
        if (problems.length) {
          failures++;
          console.log(`FAIL ${tag}: ${name}\n  - ${problems.slice(0, 8).join('\n  - ')}`);
        } else {
          console.log(`ok   ${tag}: ${name}`);
        }
      }
    }
  }
} finally {
  browser.close();
}
console.log(failures ? `\n${failures} layout check(s) failed` : '\nAll layout checks passed');
process.exit(failures ? 1 : 0);
