#!/usr/bin/env node
/**
 * End-to-end behavioural flow suite for Quick Points in headless Chrome (`npm run test:quick-points-flows`).
 *
 * Usage:
 *   node scripts/test_quick_points_flows.mjs [--base http://127.0.0.1:8083]
 *
 * If `--base` is omitted, starts `scripts/serve.js` automatically on an ephemeral local port against `dist/`.
 *
 * Verifies all 6 required user flows (URL, `dialog.open`, flashed/focused row or target, `.main-content` scrollTop):
 *   (a) toggle -> open + `#quick` -> Back -> closed, URL restored, no scroll jump
 *   (b) same-page tap (`quran-preservation` + closed-`<details>` target on `divinity-timeline`)
 *       -> dialog closed, target below sticky bar, enclosing `<details>` open -> Back -> sheet open on
 *       `#quick:<id>`, row in view, focused, and flashed
 *   (c) cross-page tap on `hadith-reliability` hub -> case page -> Back -> hub sheet open on that row;
 *       ZERO `quick_points_open` events and ZERO open `<dialog>` states on the outgoing case page
 *   (d) cold arrival on `quran-preservation#<item>` (and `from-mecca-to-medina#<item>` + manual scroll)
 *       -> open -> close via Article -> `.main-content` `scrollTop` unchanged within ±4px
 *   (e) Escape closes the sheet cleanly, restores URL, and subsequent Back does NOT reopen the sheet
 *   (f) cold `#anchor` arrival into closed `<details>` on `divinity-timeline` (`[data-reveal-own]`)
 *       and on `islamic-dilemma` (`sheet-nav.js` site-wide fallback): exactly one `scrollIntoView` call,
 *       enclosing `<details>` opened, and target visible in viewport below sticky nav
 */

import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs, { mkdtempSync, rmSync } from 'node:fs';
import net from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as pollDelay } from 'node:timers/promises';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const VIEWPORT_WIDTH = 412;
const VIEWPORT_HEIGHT = 900;
const SCROLL_TOLERANCE_PX = 4;
const POLL_INTERVAL_MS = 40;
const DEFAULT_WAIT_TIMEOUT_MS = 5000;
const SERVER_STARTUP_ATTEMPTS = 50;

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
  for (let i = 0; i < SERVER_STARTUP_ATTEMPTS; i++) {
    try {
      const r = await fetch(`${baseUrl}/discover/quran-preservation/`);
      if (r.ok) return { baseUrl, stop };
    } catch {}
    await pollDelay(POLL_INTERVAL_MS);
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
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {}
  };
  process.on('exit', cleanup);

  let wsUrl = null;
  for (let i = 0; i < SERVER_STARTUP_ATTEMPTS && !wsUrl; i++) {
    await pollDelay(POLL_INTERVAL_MS);
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

  /** Wait for `count` browser `requestAnimationFrame` ticks so queued rAF callbacks & layout settle. */
  const nextFrames = async (count = 2) => {
    await evaluate(`new Promise((resolve) => {
      let n = ${Number(count)};
      const step = () => (--n <= 0 ? resolve(true) : requestAnimationFrame(step));
      requestAnimationFrame(step);
    })`);
  };

  const waitUntil = async (predicateExpr, timeoutMs = DEFAULT_WAIT_TIMEOUT_MS) => {
    const deadline = Date.now() + timeoutMs;
    let last = null;
    while (Date.now() < deadline) {
      last = await evaluate(predicateExpr);
      if (last) return last;
      await pollDelay(POLL_INTERVAL_MS);
    }
    throw new Error(`Timed out waiting for condition: ${predicateExpr} (last=${JSON.stringify(last)})`);
  };

  const navigateAndSettle = async (url) => {
    await send('Page.navigate', { url });
    await waitUntil(
      `document.readyState === 'complete' && !!document.querySelector('.main-content') && !document.documentElement.hasAttribute('data-astro-transition') && (!document.querySelector('[data-qk-open]') || document.querySelector('[data-qk-open]').dataset.qkBound === '1')`,
    );
    await nextFrames(2);
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

  return {
    send,
    evaluate,
    nextFrames,
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
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
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
    assert.equal(openState.open, true, 'Expected Quick Points dialog to be open');
    assert.equal(openState.hash, '#quick', 'Expected #quick URL hash when opened from toggle');
    assert.equal(openState.rows, 25, 'Expected 25 rows on hadith-reliability sheet');

    await browser.evaluate(`history.back()`);
    await browser.waitUntil(
      `document.querySelector('[data-qk-dialog]')?.open === false && location.hash === ''`,
    );
    await browser.nextFrames(2);

    const closedState = await browser.evaluate(`({
      open: document.querySelector('[data-qk-dialog]').open,
      href: location.href,
      scrollTop: document.querySelector('.main-content').scrollTop,
      activeIsToggle: document.activeElement === document.querySelector('[data-qk-open]'),
    })`);
    assert.equal(closedState.open, false, 'Expected dialog to close on Back');
    assert.equal(closedState.href, initial.href, 'Expected URL restored to initial article URL');
    assert.ok(
      Math.abs(closedState.scrollTop - initial.scrollTop) <= SCROLL_TOLERANCE_PX,
      `Expected scrollTop unchanged (±${SCROLL_TOLERANCE_PX}px): got ${closedState.scrollTop}, expected ${initial.scrollTop}`,
    );
    assert.equal(closedState.activeIsToggle, true, 'Expected focus restored to [data-qk-open]');
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

      await browser.trustedClick('a.qk-row[data-qk-id="umar-stoning-verse"]');
      await browser.waitUntil(
        `document.querySelector('[data-qk-dialog]')?.open === false && location.hash === '#umar-stoning-verse'`,
      );
      await browser.nextFrames(2);

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

      assert.equal(tapState.dialogOpen, false, 'Expected dialog closed after same-page point tap');
      assert.equal(tapState.hash, '#umar-stoning-verse', 'Expected target #hash in URL');
      assert.ok(tapState.scrollTop > 200, `Expected main-content to scroll down, got ${tapState.scrollTop}`);
      assert.ok(
        tapState.targetTop >= tapState.barBottom - 1,
        `Target top (${tapState.targetTop}) must clear sticky bar bottom (${tapState.barBottom})`,
      );
      assert.equal(tapState.targetFlashed, true, 'Expected .qk-flash class on revealed target');

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

      assert.equal(backState.dialogOpen, true, 'Expected sheet reopened on Back');
      assert.equal(backState.hash, '#quick:umar-stoning-verse', 'Expected #quick:<id> hash on Back');
      assert.equal(backState.focusedId, 'umar-stoning-verse', 'Expected tapped row focused on Back');
      assert.equal(backState.flashed, true, 'Expected tapped row flashed on Back');
      assert.equal(backState.inView, true, 'Expected tapped row visible inside .qk-body');

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
      await browser.waitUntil(
        `document.querySelector('[data-qk-dialog]')?.open === false && location.hash === '#event-paris_magical_papyrus'`,
      );
      await browser.nextFrames(2);

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
      assert.equal(dtlState.detailsOpen, true, 'Expected ancestor <details> opened by revealTarget');
      assert.ok(
        dtlState.targetTop >= dtlState.barBottom - 1,
        `Closed-details target (${dtlState.targetTop}) must clear sticky nav (${dtlState.barBottom})`,
      );
      assert.equal(dtlState.flashed, true, 'Expected .qk-flash on closed-details target');
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

      const picked = await browser.evaluate(`(() => {
        const rows = [...document.querySelectorAll('a.qk-row')];
        const row = rows[7] || rows[0];
        return { id: row.dataset.qkId, href: row.getAttribute('href') };
      })()`);

      await browser.trustedClick(`a.qk-row[data-qk-id="${picked.id}"]`);
      await browser.waitUntil(
        `location.pathname !== '/discover/hadith-reliability/' && location.pathname !== '/discover/hadith-reliability' && !document.documentElement.hasAttribute('data-astro-transition') && document.querySelector('[data-qk-open]')?.dataset?.qkBound === '1' && document.querySelector('[data-qk-dialog]')?.open === false`,
      );

      // Instrument the outgoing case page BEFORE calling history.back().
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
        `(location.pathname === '/discover/hadith-reliability/' || location.pathname === '/discover/hadith-reliability') && !document.documentElement.hasAttribute('data-astro-transition') && document.querySelector('[data-qk-dialog]')?.open === true && document.querySelector(${JSON.stringify(`a.qk-row[data-qk-id="${picked.id}"]`)})?.classList.contains('qk-flash')`,
      );

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

      assert.equal(hubReturn.dialogOpen, true, 'Expected hub Quick Points dialog open after Back');
      assert.equal(hubReturn.hash, `#quick:${picked.id}`, 'Expected hub URL hash restored to #quick:<id>');
      assert.equal(hubReturn.focusedId, picked.id, 'Expected selected row focused on hub return');
      assert.equal(hubReturn.flashed, true, 'Expected selected row flashed on hub return');
      assert.equal(hubReturn.inView, true, 'Expected selected row visible inside .qk-body');
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
      await browser.waitUntil(
        `document.querySelector('[data-qk-dialog]')?.open === false && location.hash === '#umar-stoning-verse'`,
      );
      await browser.nextFrames(2);

      const qpAfter = await browser.evaluate(`({
        scrollTop: document.querySelector('.main-content').scrollTop,
        hash: location.hash,
      })`);
      assert.equal(qpAfter.hash, '#umar-stoning-verse', 'Expected #umar-stoning-verse hash preserved');
      assert.ok(
        Math.abs(qpAfter.scrollTop - qpBefore.scrollTop) <= SCROLL_TOLERANCE_PX,
        `quran-preservation scrollTop shifted by ${qpAfter.scrollTop - qpBefore.scrollTop}px (${qpBefore.scrollTop} -> ${qpAfter.scrollTop})`,
      );

      // 2. from-mecca-to-medina anchored landing + 300px extra reading scroll
      await browser.navigateAndSettle(`${baseUrl}/discover/from-mecca-to-medina/#who-9-29-names`);
      const mmBefore = await browser.evaluate(`(() => {
        const m = document.querySelector('.main-content');
        m.scrollTop += 300;
        return { scrollTop: m.scrollTop };
      })()`);
      await browser.nextFrames(2);

      await browser.evaluate(`document.querySelector('[data-qk-open]').click()`);
      await browser.waitUntil(`document.querySelector('[data-qk-dialog]')?.open === true`);
      await browser.trustedClick('.qk-sheet .qk-seg button.qk-seg__btn');
      await browser.waitUntil(
        `document.querySelector('[data-qk-dialog]')?.open === false && location.hash === '#who-9-29-names'`,
      );
      await browser.nextFrames(2);

      const mmAfter = await browser.evaluate(`({
        scrollTop: document.querySelector('.main-content').scrollTop,
        hash: location.hash,
      })`);
      assert.equal(mmAfter.hash, '#who-9-29-names', 'Expected #who-9-29-names hash preserved');
      assert.ok(
        Math.abs(mmAfter.scrollTop - mmBefore.scrollTop) <= SCROLL_TOLERANCE_PX,
        `from-mecca-to-medina scrollTop jumped by ${mmAfter.scrollTop - mmBefore.scrollTop}px (${mmBefore.scrollTop} -> ${mmAfter.scrollTop})`,
      );
    },
  );

  // ---------------------------------------------------------------------------
  // Flow (e): Escape closes, and Back does not unexpectedly reopen
  // ---------------------------------------------------------------------------
  await runFlow('(e) Escape closes sheet, restores URL, and Back does not reopen', async () => {
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
    assert.equal(await browser.evaluate(`location.hash`), '#quick', 'Expected #quick hash on open');

    await browser.pressEscape();
    await browser.waitUntil(
      `document.querySelector('[data-qk-dialog]')?.open === false && location.hash === ''`,
    );
    await browser.nextFrames(2);

    const afterEsc = await browser.evaluate(`({
      open: document.querySelector('[data-qk-dialog]').open,
      hash: location.hash,
      pathname: location.pathname,
    })`);
    assert.equal(afterEsc.open, false, 'Expected dialog closed after Escape');
    assert.equal(afterEsc.hash, '', 'Expected empty hash after Escape');
    assert.match(
      afterEsc.pathname,
      /^\/discover\/quran-preservation\/?$/,
      'Expected pathname to remain on quran-preservation after Escape',
    );

    await browser.evaluate(`history.back()`);
    await browser.waitUntil(
      `(location.pathname === '/discover/' || location.pathname === '/discover') && !document.documentElement.hasAttribute('data-astro-transition')`,
    );
    await browser.nextFrames(2);

    const afterBack = await browser.evaluate(`({
      pathname: location.pathname,
      hash: location.hash,
      anyOpenDialog: Boolean(document.querySelector('dialog[open]')),
    })`);
    assert.match(afterBack.pathname, /^\/discover\/?$/, 'Expected Back after Escape to reach /discover/');
    assert.equal(afterBack.hash, '', 'Expected empty hash on /discover/');
    assert.equal(afterBack.anyOpenDialog, false, 'Expected no open dialog after Back');
  });

  // ---------------------------------------------------------------------------
  // Flow (f): cold #anchor arrival into closed <details>:
  //   1. `divinity-timeline` (`[data-reveal-own]`): exactly ONE `scrollIntoView` call,
  //      enclosing `<details>` open, target visible below sticky `.dtl-nav`.
  //   2. `islamic-dilemma` (no `[data-reveal-own]`, relies on `sheet-nav.js` fallback):
  //      `<details class="idl-answer">` opened and scrolled into view once.
  // ---------------------------------------------------------------------------
  await runFlow(
    '(f) cold #anchor arrival into closed <details> on divinity-timeline (1 scroll, in view) and islamic-dilemma fallback',
    async () => {
      const { identifier } = await browser.send('Page.addScriptToEvaluateOnNewDocument', {
        source: `(() => {
          window.__coldScrollCalls = [];
          const orig = Element.prototype.scrollIntoView;
          Element.prototype.scrollIntoView = function(arg) {
            window.__coldScrollCalls.push({ id: this.id, tag: this.tagName, arg });
            return orig.apply(this, arguments);
          };
        })()`,
      });

      try {
        // 1. divinity-timeline (`data-reveal-own` prevents `sheet-nav.js` duplicate scroll)
        await browser.navigateAndSettle(
          `${baseUrl}/discover/divinity-timeline/#event-paris_magical_papyrus`,
        );

        const dtlCold = await browser.evaluate(`(() => {
          const target = document.getElementById('event-paris_magical_papyrus');
          const bar = document.querySelector('.dtl-nav');
          const rect = target.getBoundingClientRect();
          return {
            calls: window.__coldScrollCalls || [],
            detailsOpen: target.closest('details')?.open ?? false,
            targetTop: rect.top,
            targetBottom: rect.bottom,
            barBottom: bar.getBoundingClientRect().bottom,
            viewportHeight: window.innerHeight,
          };
        })()`);

        assert.equal(
          dtlCold.calls.length,
          1,
          `Expected exactly 1 scrollIntoView call on divinity-timeline cold arrival, got ${JSON.stringify(dtlCold.calls)}`,
        );
        assert.equal(dtlCold.calls[0].id, 'event-paris_magical_papyrus');
        assert.equal(dtlCold.detailsOpen, true, 'Expected closed <details> opened on cold arrival');
        assert.ok(
          dtlCold.targetTop >= dtlCold.barBottom - 1 && dtlCold.targetTop < dtlCold.viewportHeight,
          `Expected target in view below sticky nav (${dtlCold.barBottom}px <= ${dtlCold.targetTop}px < ${dtlCold.viewportHeight}px)`,
        );

        // 2. islamic-dilemma (no own reveal handler -> `sheet-nav.js` opens closed <details class="idl-answer">)
        const firstClosedAnswerId = await browser.evaluate(`(async () => {
          const res = await fetch('/discover/islamic-dilemma/');
          const html = await res.text();
          const m = html.match(/<details[^>]*class="[^"]*idl-answer[^"]*"[^>]*id="([^"]+)"/);
          return m ? m[1] : null;
        })()`);
        assert.ok(firstClosedAnswerId, 'Expected a <details class="idl-answer" id="..."> on islamic-dilemma');

        await browser.navigateAndSettle(`${baseUrl}/discover/islamic-dilemma/#${firstClosedAnswerId}`);
        const idlCold = await browser.evaluate(`((id) => {
          const target = document.getElementById(id);
          const bar = document.querySelector('.idl-nav');
          const rect = target.getBoundingClientRect();
          return {
            calls: window.__coldScrollCalls || [],
            detailsOpen: target instanceof HTMLDetailsElement ? target.open : Boolean(target?.closest('details')?.open),
            targetTop: rect.top,
            barBottom: bar.getBoundingClientRect().bottom,
            viewportHeight: window.innerHeight,
          };
        })(${JSON.stringify(firstClosedAnswerId)})`);

        assert.equal(
          idlCold.calls.length,
          1,
          `Expected exactly 1 scrollIntoView call via sheet-nav.js fallback on islamic-dilemma, got ${JSON.stringify(idlCold.calls)}`,
        );
        assert.equal(idlCold.detailsOpen, true, 'Expected islamic-dilemma <details> opened by sheet-nav.js fallback');
        assert.ok(
          idlCold.targetTop >= idlCold.barBottom - 1 && idlCold.targetTop < idlCold.viewportHeight,
          `Expected islamic-dilemma target in view below sticky nav (${idlCold.barBottom}px <= ${idlCold.targetTop}px < ${idlCold.viewportHeight}px)`,
        );
      } finally {
        await browser.send('Page.removeScriptToEvaluateOnNewDocument', { identifier });
      }
    },
  );
} finally {
  browser.close();
  stopServer();
}

console.log(`\nQuick Points flows: ${passed} passed, ${failed} failed.`);
process.exit(failed ? 1 : 0);
