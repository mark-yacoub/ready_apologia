#!/usr/bin/env node
/**
 * End-to-end behavioural flow suite for Quick Points in headless Chrome (`npm run test:quick-points-flows`).
 *
 * Usage:
 *   node scripts/test_quick_points_flows.mjs [--base http://127.0.0.1:8083]
 *
 * If `--base` is omitted, starts `scripts/serve.js` automatically on an ephemeral local port against `dist/`.
 *
 * Verifies all 5 required user flows (URL, `dialog.open`, flashed/focused row or target, `.main-content` scrollTop):
 *   (a) toggle -> open + `#quick` -> Back -> closed, URL restored, no scroll jump
 *   (b) same-page tap (`quran-preservation` + closed-`<details>` target on `divinity-timeline`)
 *       -> dialog closed, target below sticky bar, enclosing `<details>` open -> Back -> sheet open on
 *       `#quick:<id>`, row in view, focused, and flashed
 *   (c) cross-page tap on `hadith-reliability` hub -> case page -> Back -> hub sheet open on that row;
 *       ZERO `quick_points_open` events and ZERO open `<dialog>` states on the outgoing case page
 *   (d) cold arrival on `quran-preservation#<item>` (and `from-mecca-to-medina#<item>` + manual scroll)
 *       -> open -> close via Article -> `.main-content` `scrollTop` unchanged within ±4px
 *   (e) Escape closes the sheet cleanly, restores URL, and subsequent Back does NOT reopen the sheet
 */

import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const explicitBase = baseIdx >= 0 && args[baseIdx + 1] ? args[baseIdx + 1].replace(/\/$/, '') : null;

const CHROME = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'].find(
  (bin) => spawnSync('which', [bin]).status === 0,
);

if (!CHROME) {
  console.warn('SKIP: no Chrome/Chromium on PATH; Quick Points flow checks not run.');
  process.exit(0);
}
if (typeof WebSocket === 'undefined') {
  console.warn(`SKIP: Node ${process.version} lacks global WebSocket; Quick Points flow checks not run.`);
  process.exit(0);
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      srv.close((err) => (err ? reject(err) : resolve(port)));
    });
    srv.on('error', reject);
  });
}

async function startLocalServerIfNeeded() {
  if (explicitBase) return { baseUrl: explicitBase, stop: () => {} };
  if (!fs.existsSync(DIST)) {
    console.error(`✗ dist directory not found at ${DIST}. Run astro build first or pass --base.`);
    process.exit(1);
  }
  const port = await getFreePort();
  const proc = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.js')], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port) },
    stdio: 'ignore',
  });
  const baseUrl = `http://127.0.0.1:${port}`;
  const stop = () => {
    try {
      proc.kill('SIGTERM');
    } catch {}
  };
  process.on('exit', stop);
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`${baseUrl}/discover/quran-preservation/`);
      if (r.ok) return { baseUrl, stop };
    } catch {}
    await sleep(100);
  }
  stop();
  throw new Error(`Timed out waiting for local static server at ${baseUrl}`);
}

async function openBrowser() {
  const port = await getFreePort();
  const profile = mkdtempSync(path.join(tmpdir(), 'qk-flows-'));
  const proc = spawn(
    CHROME,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      `--remote-debugging-port=${port}`,
      '--remote-debugging-address=127.0.0.1',
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  const cleanup = () => {
    try {
      proc.kill('SIGKILL');
    } catch {}
    rmSync(profile, { recursive: true, force: true });
  };
  process.on('exit', cleanup);

  let wsUrl = null;
  for (let i = 0; i < 50 && !wsUrl; i++) {
    await sleep(150);
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      wsUrl = targets.find((t) => t.type === 'page')?.webSocketDebuggerUrl ?? null;
    } catch {}
  }
  if (!wsUrl) {
    cleanup();
    throw new Error('Chrome did not expose a DevTools WebSocket endpoint');
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let nextId = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    const entry = pending.get(msg.id);
    if (!entry) return;
    pending.delete(msg.id);
    if (msg.error) entry.rej(new Error(msg.error.message));
    else entry.res(msg.result);
  };

  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const id = ++nextId;
      pending.set(id, { res, rej });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) {
      throw new Error(
        `Browser evaluation failed: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`,
      );
    }
    return r.result.value;
  };

  const navigateAndSettle = async (url) => {
    await send('Page.navigate', { url });
    for (let i = 0; i < 60; i++) {
      const ready = await evaluate(
        `document.readyState === 'complete' && !!document.querySelector('[data-qk-open], .main-content')`,
      );
      if (ready) break;
      await sleep(100);
    }
    await sleep(250);
  };

  /** Perform a real trusted mouse click at the center of `selector` (grants user activation). */
  const trustedClick = async (selector) => {
    const pt = await evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      el.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()`);
    assert.ok(pt, `Expected element matching ${selector} for trusted click`);
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: pt.x,
      y: pt.y,
      button: 'left',
      clickCount: 1,
    });
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: pt.x,
      y: pt.y,
      button: 'left',
      clickCount: 1,
    });
  };

  const pressEscape = async () => {
    await send('Input.dispatchKeyEvent', {
      type: 'rawKeyDown',
      key: 'Escape',
      code: 'Escape',
      windowsVirtualKeyCode: 27,
      nativeVirtualKeyCode: 27,
    });
    await send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Escape',
      code: 'Escape',
      windowsVirtualKeyCode: 27,
      nativeVirtualKeyCode: 27,
    });
  };

  const waitUntil = async (predicateExpr, timeoutMs = 4000) => {
    const deadline = Date.now() + timeoutMs;
    let last = null;
    while (Date.now() < deadline) {
      last = await evaluate(predicateExpr);
      if (last) return last;
      await sleep(60);
    }
    throw new Error(`Timed out waiting for condition: ${predicateExpr} (last=${JSON.stringify(last)})`);
  };

  return {
    send,
    evaluate,
    navigateAndSettle,
    trustedClick,
    pressEscape,
    waitUntil,
    close: () => {
      try {
        ws.close();
      } catch {}
      cleanup();
    },
  };
}

const { baseUrl, stop: stopServer } = await startLocalServerIfNeeded();
const browser = await openBrowser();
let passed = 0;
let failed = 0;

async function runFlow(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`✗ ${name}\n  ${err.stack || err.message}`);
  }
}

try {
  await browser.send('Page.enable');
  await browser.send('Emulation.setDeviceMetricsOverride', {
    width: 412,
    height: 900,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await browser.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });

  // ---------------------------------------------------------------------------
  // Flow (a): toggle -> open + #quick -> Back -> closed, URL restored, no jump
  // ---------------------------------------------------------------------------
  await runFlow('(a) toggle -> open + #quick -> Back -> closed, URL restored, no jump', async () => {
    await browser.navigateAndSettle(`${baseUrl}/discover/hadith-reliability/`);
    // Scroll slightly while keeping toggle button on screen, then click toggle; or click toggle from top,
    // and also test scrolled mid-page open via JS click to verify zero jump on Back.
    const initial = await browser.evaluate(`(() => {
      const m = document.querySelector('.main-content');
      return { href: location.href, scrollTop: m.scrollTop };
    })()`);

    await browser.trustedClick('[data-qk-open]');
    await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === true`);

    const openState = await browser.evaluate(`({
      open: document.querySelector('[data-qk-dialog]').open,
      hash: location.hash,
      rows: document.querySelectorAll('a.qk-row').length,
    })`);
    assert.equal(openState.open, true);
    assert.equal(openState.hash, '#quick');
    assert.equal(openState.rows, 25);

    await browser.evaluate(`history.back()`);
    await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === false`);
    await sleep(150);

    const closedState = await browser.evaluate(`({
      open: document.querySelector('[data-qk-dialog]').open,
      href: location.href,
      scrollTop: document.querySelector('.main-content').scrollTop,
      activeIsToggle: document.activeElement === document.querySelector('[data-qk-open]'),
    })`);
    assert.equal(closedState.open, false);
    assert.equal(closedState.href, initial.href);
    assert.ok(
      Math.abs(closedState.scrollTop - initial.scrollTop) <= 4,
      `Expected scrollTop unchanged (±4px): got ${closedState.scrollTop}, expected ${initial.scrollTop}`,
    );
    assert.equal(closedState.activeIsToggle, true);
  });

  // ---------------------------------------------------------------------------
  // Flow (b): same-page tap on quran-preservation (+ closed-<details> target) ->
  //           dialog closed, target below sticky bar, enclosing details open ->
  //           Back -> sheet open on #quick:<id>, row in view, focused & flashed
  // ---------------------------------------------------------------------------
  await runFlow(
    '(b) same-page tap (quran-preservation & closed-details target) -> target revealed below sticky bar -> Back -> sheet on #quick:<id>',
    async () => {
      // Part 1: quran-preservation same-page tap
      await browser.navigateAndSettle(`${baseUrl}/discover/quran-preservation/`);
      await browser.trustedClick('[data-qk-open]');
      await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === true`);

      // Pick a point lower down the page (`umar-stoning-verse`)
      await browser.trustedClick('a.qk-row[data-qk-id="umar-stoning-verse"]');
      await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === false`);
      await sleep(150);

      const tapState = await browser.evaluate(`(() => {
        const dialog = document.querySelector('[data-qk-dialog]');
        const bar = document.querySelector('.hrv-bar');
        const target = document.getElementById('umar-stoning-verse');
        const main = document.querySelector('.main-content');
        return {
          dialogOpen: dialog.open,
          hash: location.hash,
          scrollTop: main.scrollTop,
          barBottom: bar.getBoundingClientRect().bottom,
          targetTop: target.getBoundingClientRect().top,
          targetFlashed: target.classList.contains('qk-flash'),
        };
      })()`);

      assert.equal(tapState.dialogOpen, false);
      assert.equal(tapState.hash, '#umar-stoning-verse');
      assert.ok(tapState.scrollTop > 200, `Expected main-content to scroll down, got ${tapState.scrollTop}`);
      assert.ok(
        tapState.targetTop >= tapState.barBottom - 1,
        `Target top (${tapState.targetTop}) must clear sticky bar bottom (${tapState.barBottom})`,
      );
      assert.equal(tapState.targetFlashed, true);

      // Back -> sheet reopens on `#quick:umar-stoning-verse` with row in view, focused, and flashed
      await browser.evaluate(`history.back()`);
      await browser.waitUntil(
        `document.querySelector('[data-qk-dialog]')?.open === true && document.querySelector('a.qk-row[data-qk-id="umar-stoning-verse"]')?.classList.contains('qk-flash')`,
      );

      const backState = await browser.evaluate(`(() => {
        const dialog = document.querySelector('[data-qk-dialog]');
        const body = dialog.querySelector('.qk-body');
        const row = dialog.querySelector('a.qk-row[data-qk-id="umar-stoning-verse"]');
        const bodyRect = body.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        return {
          dialogOpen: dialog.open,
          hash: location.hash,
          focusedId: document.activeElement?.dataset?.qkId ?? null,
          flashed: row.classList.contains('qk-flash'),
          inView: rowRect.top >= bodyRect.top - 2 && rowRect.bottom <= bodyRect.bottom + 2,
        };
      })()`);

      assert.equal(backState.dialogOpen, true);
      assert.equal(backState.hash, '#quick:umar-stoning-verse');
      assert.equal(backState.focusedId, 'umar-stoning-verse');
      assert.equal(backState.flashed, true);
      assert.equal(backState.inView, true);

      // Part 2: closed-<details> target on divinity-timeline (`event-paris_magical_papyrus`)
      await browser.navigateAndSettle(`${baseUrl}/discover/divinity-timeline/`);
      const initiallyClosed = await browser.evaluate(
        `document.getElementById('event-paris_magical_papyrus')?.closest('details')?.open === false`,
      );
      assert.equal(initiallyClosed, true, 'Expected target ancestor <details> to start closed');

      await browser.trustedClick('[data-qk-open]');
      await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === true`);
      await browser.evaluate(
        `document.querySelector('a.qk-row[data-qk-id="event-paris_magical_papyrus"]').click()`,
      );
      await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === false`);
      await sleep(150);

      const dtlState = await browser.evaluate(`(() => {
        const target = document.getElementById('event-paris_magical_papyrus');
        const bar = document.querySelector('.dtl-nav');
        const enclosingDetails = target.closest('details');
        return {
          detailsOpen: enclosingDetails?.open ?? false,
          targetTop: target.getBoundingClientRect().top,
          barBottom: bar.getBoundingClientRect().bottom,
          flashed: target.classList.contains('qk-flash'),
        };
      })()`);
      assert.equal(dtlState.detailsOpen, true);
      assert.ok(
        dtlState.targetTop >= dtlState.barBottom - 1,
        `Closed-details target (${dtlState.targetTop}) must clear sticky nav (${dtlState.barBottom})`,
      );
      assert.equal(dtlState.flashed, true);
    },
  );

  // ---------------------------------------------------------------------------
  // Flow (c): cross-page tap on hadith-reliability hub -> case -> Back -> hub sheet
  //           on that row; NO quick_points_open and no open dialog on the case page
  // ---------------------------------------------------------------------------
  await runFlow(
    '(c) cross-page tap on hadith-reliability hub -> case -> Back -> hub sheet on row, zero spurious open on case page',
    async () => {
      await browser.navigateAndSettle(`${baseUrl}/discover/hadith-reliability/`);
      await browser.trustedClick('[data-qk-open]');
      await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === true`);

      // Scroll hub sheet down slightly and pick a cross-page row (e.g. row #8)
      const picked = await browser.evaluate(`(() => {
        const rows = [...document.querySelectorAll('a.qk-row')];
        const row = rows[7] || rows[0];
        return { id: row.dataset.qkId, href: row.getAttribute('href') };
      })()`);

      await browser.trustedClick(`a.qk-row[data-qk-id="${picked.id}"]`);
      await browser.waitUntil(
        `location.pathname !== '/discover/hadith-reliability/' && location.pathname !== '/discover/hadith-reliability' && document.querySelector('[data-qk-dialog]')?.open === false`,
      );
      await sleep(200);

      // Instrument the outgoing case page BEFORE calling history.back():
      // watch both the case page's <dialog> element and analytics events (`window.gtag` / `window.dataLayer`).
      await browser.evaluate(`(() => {
        const caseDialog = document.querySelector('[data-qk-dialog]');
        window.__caseDialogOpened = caseDialog?.open === true;
        if (caseDialog) {
          const mo = new MutationObserver(() => {
            if (caseDialog.open || caseDialog.hasAttribute('open')) {
              window.__caseDialogOpened = true;
            }
          });
          mo.observe(caseDialog, { attributes: true, attributeFilter: ['open'] });
        }
        window.__spuriousQuickOpenOnCase = [];
        const origGtag = window.gtag;
        window.gtag = function(cmd, evName, params) {
          if (cmd === 'event' && evName === 'quick_points_open') {
            window.__spuriousQuickOpenOnCase.push({
              evName,
              params,
              domPathAtCall: document.querySelector('.hrv-case-head') ? 'case-page' : 'hub-page',
            });
          }
          if (typeof origGtag === 'function') return origGtag.apply(this, arguments);
        };
      })()`);

      await browser.evaluate(`history.back()`);
      await browser.waitUntil(
        `(location.pathname === '/discover/hadith-reliability/' || location.pathname === '/discover/hadith-reliability') && document.querySelector('[data-qk-dialog]')?.open === true`,
      );
      await sleep(150);

      const hubReturn = await browser.evaluate(`(() => {
        const dialog = document.querySelector('[data-qk-dialog]');
        const body = dialog.querySelector('.qk-body');
        const row = dialog.querySelector(${JSON.stringify(`a.qk-row[data-qk-id="${picked.id}"]`)});
        const bodyRect = body.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        return {
          pathname: location.pathname,
          hash: location.hash,
          dialogOpen: dialog.open,
          focusedId: document.activeElement?.dataset?.qkId ?? null,
          flashed: row?.classList.contains('qk-flash') ?? false,
          inView: rowRect.top >= bodyRect.top - 2 && rowRect.bottom <= bodyRect.bottom + 2,
          caseDialogOpened: Boolean(window.__caseDialogOpened),
          quickOpenEvents: window.__spuriousQuickOpenOnCase || [],
        };
      })()`);

      assert.equal(hubReturn.dialogOpen, true);
      assert.equal(hubReturn.hash, `#quick:${picked.id}`);
      assert.equal(hubReturn.focusedId, picked.id);
      assert.equal(hubReturn.flashed, true);
      assert.equal(hubReturn.inView, true);
      assert.equal(
        hubReturn.caseDialogOpened,
        false,
        'Case page <dialog> must never open during cross-page Back',
      );
      const casePageEvents = hubReturn.quickOpenEvents.filter((e) => e.domPathAtCall === 'case-page');
      assert.equal(
        casePageEvents.length,
        0,
        `Expected 0 quick_points_open events on outgoing case page, got ${JSON.stringify(casePageEvents)}`,
      );
      assert.equal(
        hubReturn.quickOpenEvents.length,
        1,
        `Expected exactly 1 quick_points_open on hub arrival, got ${JSON.stringify(hubReturn.quickOpenEvents)}`,
      );
    },
  );

  // ---------------------------------------------------------------------------
  // Flow (d): land on quran-preservation with #<item> -> open -> close via Article ->
  //           scrollTop unchanged ±4px (plus mecca-to-medina #<item> + scroll offset)
  // ---------------------------------------------------------------------------
  await runFlow(
    '(d) land on quran-preservation#<item> (and mecca-to-medina#<item> + offset) -> open -> close via Article -> scrollTop unchanged ±4px',
    async () => {
      // 1. quran-preservation cold anchor landing
      await browser.navigateAndSettle(`${baseUrl}/discover/quran-preservation/#umar-stoning-verse`);
      const qpBefore = await browser.evaluate(`(() => {
        const m = document.querySelector('.main-content');
        return { scrollTop: m.scrollTop, hash: location.hash };
      })()`);
      assert.ok(qpBefore.scrollTop > 200, `Expected anchored landing to scroll down, got ${qpBefore.scrollTop}`);

      await browser.evaluate(`document.querySelector('[data-qk-open]').click()`);
      await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === true`);
      await browser.trustedClick('.qk-sheet .qk-seg button.qk-seg__btn');
      await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === false`);
      await sleep(200);

      const qpAfter = await browser.evaluate(`({
        scrollTop: document.querySelector('.main-content').scrollTop,
        hash: location.hash,
      })`);
      assert.equal(qpAfter.hash, '#umar-stoning-verse');
      assert.ok(
        Math.abs(qpAfter.scrollTop - qpBefore.scrollTop) <= 4,
        `quran-preservation scrollTop shifted by ${qpAfter.scrollTop - qpBefore.scrollTop}px (${qpBefore.scrollTop} -> ${qpAfter.scrollTop})`,
      );

      // 2. from-mecca-to-medina anchored landing + 300px extra reading scroll (regression check for Item 2)
      await browser.navigateAndSettle(`${baseUrl}/discover/from-mecca-to-medina/#who-9-29-names`);
      const mmBefore = await browser.evaluate(`(() => {
        const m = document.querySelector('.main-content');
        m.scrollTop += 300;
        return { scrollTop: m.scrollTop };
      })()`);
      await sleep(100);

      await browser.evaluate(`document.querySelector('[data-qk-open]').click()`);
      await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === true`);
      await browser.trustedClick('.qk-sheet .qk-seg button.qk-seg__btn');
      await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === false`);
      await sleep(200);

      const mmAfter = await browser.evaluate(`({
        scrollTop: document.querySelector('.main-content').scrollTop,
        hash: location.hash,
      })`);
      assert.equal(mmAfter.hash, '#who-9-29-names');
      assert.ok(
        Math.abs(mmAfter.scrollTop - mmBefore.scrollTop) <= 4,
        `from-mecca-to-medina scrollTop jumped by ${mmAfter.scrollTop - mmBefore.scrollTop}px (${mmBefore.scrollTop} -> ${mmAfter.scrollTop})`,
      );
    },
  );

  // ---------------------------------------------------------------------------
  // Flow (e): Escape closes, and Back does not unexpectedly reopen
  // ---------------------------------------------------------------------------
  await runFlow('(e) Escape closes sheet, restores URL, and Back does not reopen', async () => {
    // Establish a prior page in history (`/discover/`), navigate to an article, open Quick Points,
    // press Escape, then press Back -> should return to `/discover/` without reopening Quick Points!
    await browser.navigateAndSettle(`${baseUrl}/discover/`);
    await browser.evaluate(`(() => {
      const a = document.querySelector('a[href*="/discover/quran-preservation"]');
      a.click();
    })()`);
    await browser.waitUntil(
      `location.pathname.includes('/discover/quran-preservation') && document.querySelector('[data-qk-open]')?.dataset?.qkBound === '1' && !document.documentElement.hasAttribute('data-astro-transition')`,
    );

    await browser.trustedClick('[data-qk-open]');
    await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === true`);
    assert.equal(await browser.evaluate(`location.hash`), '#quick');

    await browser.pressEscape();
    await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === false`);
    await sleep(150);

    const afterEsc = await browser.evaluate(`({
      open: document.querySelector('[data-qk-dialog]').open,
      hash: location.hash,
      pathname: location.pathname,
    })`);
    assert.equal(afterEsc.open, false);
    assert.equal(afterEsc.hash, '');
    assert.match(afterEsc.pathname, /^\/discover\/quran-preservation\/?$/);

    // Pressing Back now must go back to `/discover/` — NEVER reopen `#quick`!
    await browser.evaluate(`history.back()`);
    await browser.waitUntil(
      `location.pathname === '/discover/' || location.pathname === '/discover'`,
    );
    await sleep(150);

    const afterBack = await browser.evaluate(`({
      pathname: location.pathname,
      hash: location.hash,
      anyOpenDialog: Boolean(document.querySelector('dialog[open]')),
    })`);
    assert.match(afterBack.pathname, /^\/discover\/?$/);
    assert.equal(afterBack.hash, '');
    assert.equal(afterBack.anyOpenDialog, false);
  });
} finally {
  browser.close();
  stopServer();
}

console.log(`\nQuick Points flows: ${passed} passed, ${failed} failed.`);
process.exit(failed ? 1 : 0);
