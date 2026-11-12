/**
 * Discover audio player (see AudioPlayer.astro). Vanilla JS, no dependencies.
 *
 *  - Full-screen sheet opened by `[data-ra-audio-open]`; ⌄ minimises to a mini bar while audio
 *    keeps playing; ✕ pauses and closes.
 *  - Lock-screen / headphone controls through the Media Session API (play, pause, ±10 s, seek).
 *    A real <audio> element keeps playing with the screen locked (iOS Safari/PWA, Android Chrome).
 *  - Resume: progress per episode in localStorage `ra:audio:v1:<id>` = { t, d, updatedAt, done },
 *    saved every 5 s and on pause / pagehide / hidden tab / ClientRouter swap. Speed is a global
 *    preference in `ra:audio:rate`.
 *
 * ClientRouter rules (JETSKI.md): this module runs once per session, so it mounts on every
 * astro:page-load only when its markup is present, looks up the current page's elements each time,
 * and saves + tears down on astro:before-swap.
 */
import { trackEvent } from '../../utils/analytics.js';
import { AUDIO_LABELS as L, fmtClock as clock, fmtMinutes } from '../../utils/discoverAudio.js';

const SKIP = 10;
const SAVE_EVERY_MS = 5000;
const DONE_TAIL = 15;      // seconds from the end that count as "finished"
const RESUME_REWIND = 3;   // podcast convention: resume a few seconds back
const MIN_RESUME = 5;      // don't offer to resume a few seconds in
const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];
const RATE_KEY = 'ra:audio:rate';
const keyFor = id => `ra:audio:v1:${id}`;

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode / quota */ } },
};

function spoken(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return [h && `${h} hour${h > 1 ? 's' : ''}`, m && `${m} minute${m > 1 ? 's' : ''}`, `${r} second${r === 1 ? '' : 's'}`].filter(Boolean).join(' ');
}
const fmtRate = r => `${String(r).replace(/^0/, '')}×`;

let current = null; // the mounted controller for the current page

function mount(root) {
  const $ = sel => root.querySelector(sel);
  const $$ = sel => [...root.querySelectorAll(sel)];
  const audio = $('[data-rap-audio]');
  const sheet = $('[data-rap-sheet]');
  const mini = $('[data-rap-mini]');
  const range = $('[data-rap-range]');
  const elapsedEl = $('[data-rap-elapsed]');
  const remainingEl = $('[data-rap-remaining]');
  const miniBar = $('[data-rap-mini-bar]');
  const miniTime = $('[data-rap-mini-time]');
  const resumeBox = $('[data-rap-resume]');
  const resumeAt = $('[data-rap-resume-at]');
  const rateBtn = $('[data-rap-rate]');
  const statusEl = $('[data-rap-status]');
  const toggles = $$('[data-rap-toggle]');
  const ds = root.dataset;
  const id = ds.id;
  const key = keyFor(id);

  // Overlay the whole app frame (header + content + bottom nav), on phones and in the desktop card.
  // Layout.astro renders the player inside .content-frame; this is a guard for other placements.
  const frame = root.closest('.content-frame') || document.querySelector('.content-frame');
  if (frame && root.parentElement !== frame) frame.appendChild(root);

  // Title = the page's own <h1> (keeps ʿ/ʾ spans; links, buttons and icons are dropped).
  const h1 = document.querySelector('.main-content h1') || document.querySelector('h1');
  const titleText = (h1?.textContent || document.title).replace(/\s+/g, ' ').trim();
  for (const slot of $$('[data-rap-title]')) {
    if (!h1) { slot.textContent = titleText; continue; }
    const c = h1.cloneNode(true);
    c.querySelectorAll('a, button, svg, script, style').forEach(n => n.replaceWith(...(n.matches('a') ? n.childNodes : [])));
    slot.replaceChildren(...c.childNodes);
  }

  // Open buttons are server-rendered (AudioButton in the bar, AudioListen under the <h1>). A page
  // with neither gets the listen button inserted under its <h1>, so every episode can be opened.
  if (![...document.querySelectorAll('[data-ra-audio-open]')].some(b => !root.contains(b))) {
    const tpl = $('template[data-rap-listen-tpl]');
    if (tpl && h1) h1.after(tpl.content.cloneNode(true));
  }

  let duration = Number(ds.duration) || 0;
  let started = false;        // has playback been started on this page view
  let want = null;            // position to apply once metadata is loaded
  let opener = null;
  let showRemaining = true;
  let dragging = false;
  let lastSave = 0;
  let stallTimer = 0;
  const milestones = new Set();

  const saved = store.get(key);
  let resumeFrom = saved && !saved.done && saved.t > MIN_RESUME ? saved.t : 0;

  let rate = Number(store.get(RATE_KEY)) || 1;
  if (!RATES.includes(rate)) rate = 1;

  // ---- position helpers --------------------------------------------------------------------
  const hasMeta = () => audio.readyState >= 1 && Number.isFinite(audio.duration);
  // Before the first play, the shown position is the saved one (or a position the listener picked).
  const pos = () => (want != null ? want : started ? audio.currentTime || 0 : resumeFrom);
  const clamp = t => Math.min(Math.max(0, t), Math.max(0, duration - 0.5));
  function seekTo(t) {
    const target = clamp(t);
    if (hasMeta()) { audio.currentTime = target; want = null; } else want = target;
    if (!started) { resumeFrom = 0; renderResume(); } // an explicit seek replaces the resume offer
    render(target);
    savePos(true);
  }

  // ---- rendering -----------------------------------------------------------------------------
  function render(t = pos()) {
    const tt = Math.min(t, duration || t);
    if (!dragging) range.value = String(Math.floor(tt));
    const pct = duration ? (tt / duration) * 100 : 0;
    range.style.setProperty('--rap-pos', `${pct}%`);
    elapsedEl.textContent = clock(tt);
    remainingEl.textContent = showRemaining ? `−${clock(duration - tt)}` : clock(duration);
    range.setAttribute('aria-valuetext', L.positionOf.replace('{t}', spoken(tt)).replace('{d}', spoken(duration)));
    miniBar.style.width = `${pct}%`;
    miniTime.textContent = `${clock(tt)} / ${clock(duration)}`;
  }
  function renderBuffered() {
    try {
      const b = audio.buffered;
      const end = b.length ? b.end(b.length - 1) : 0;
      range.style.setProperty('--rap-buf', `${duration ? (end / duration) * 100 : 0}%`);
    } catch { /* ignore */ }
  }
  function renderPlaying() {
    const playing = !audio.paused && !audio.ended;
    root.classList.toggle('is-playing', playing);
    for (const b of toggles) {
      b.setAttribute('aria-pressed', String(playing));
      b.setAttribute('aria-label', playing ? L.pause : L.play);
    }
  }
  function renderRate() {
    rateBtn.textContent = fmtRate(rate);
    rateBtn.setAttribute('aria-label', `${L.speed}: ${fmtRate(rate)}`);
  }
  function status(msg) { statusEl.textContent = msg || ''; }
  function renderResume() {
    const show = !started && resumeFrom > 0;
    resumeBox.hidden = !show;
    if (show) resumeAt.textContent = clock(resumeFrom);
  }

  // ---- persistence ---------------------------------------------------------------------------
  function savePos(force = false, done = false) {
    const now = Date.now();
    if (!started) return; // nothing played on this page view: keep whatever is saved
    if (!force && now - lastSave < SAVE_EVERY_MS) return;
    lastSave = now;
    const t = pos();
    const isDone = done || (duration > 0 && duration - t < DONE_TAIL);
    store.set(key, { t: Math.floor(t), d: Math.floor(duration), updatedAt: now, done: isDone });
    renderListenLabel(isDone ? 0 : t);
  }
  /** Under-title button: "Listen · 46 min", or "Resume · 25 min left" when there is progress. */
  function renderListenLabel(t) {
    const left = Math.max(1, Math.round((duration - t) / 60));
    const text = t > MIN_RESUME ? L.resumeLeft.replace('{m}', String(left)) : fmtMinutes(duration);
    for (const el of document.querySelectorAll('[data-rap-listen-sub]')) el.textContent = text;
  }

  // ---- media session -------------------------------------------------------------------------
  function setupMediaSession() {
    const ms = navigator.mediaSession;
    if (!ms) return;
    try {
      ms.metadata = new MediaMetadata({
        title: titleText,
        artist: 'Ready Apologia',
        album: 'Discover',
        artwork: [{ src: ds.cover, sizes: '512x512', type: ds.cover.endsWith('.png') ? 'image/png' : 'image/jpeg' }],
      });
    } catch { /* MediaMetadata unsupported */ }
    const h = {
      play: () => play(),
      pause: () => audio.pause(),
      stop: () => { audio.pause(); savePos(true); },
      seekbackward: d => seekTo(pos() - (d?.seekOffset || SKIP)),
      seekforward: d => seekTo(pos() + (d?.seekOffset || SKIP)),
      seekto: d => { if (d && Number.isFinite(d.seekTime)) seekTo(d.seekTime); },
      // iOS shows prev/next track instead of ±10 when these exist; clear them explicitly.
      previoustrack: null,
      nexttrack: null,
    };
    for (const [action, fn] of Object.entries(h)) { try { ms.setActionHandler(action, fn); } catch { /* unsupported action */ } }
  }
  function updatePositionState() {
    const ms = navigator.mediaSession;
    if (!ms || !ms.setPositionState || !hasMeta()) return;
    try { ms.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate, position: Math.min(audio.currentTime, audio.duration) }); } catch { /* ignore */ }
  }
  function clearMediaSession() {
    const ms = navigator.mediaSession;
    if (!ms) return;
    try { ms.metadata = null; } catch { /* ignore */ }
    for (const a of ['play', 'pause', 'stop', 'seekbackward', 'seekforward', 'seekto']) { try { ms.setActionHandler(a, null); } catch { /* ignore */ } }
  }

  // ---- playback ------------------------------------------------------------------------------
  function play() {
    if (!started) {
      started = true;
      if (want == null && resumeFrom > 0) want = Math.max(0, resumeFrom - RESUME_REWIND);
      renderResume();
      setupMediaSession();
      trackEvent('audio_play', { article_path: ds.key, resumed: want > 0 });
    }
    if (audio.error) { want = pos(); audio.load(); }
    audio.playbackRate = rate;
    // Called synchronously inside the tap so iOS allows playback.
    const p = audio.play();
    if (p && p.catch) p.catch(err => { if (err && err.name !== 'AbortError') status(L.loadError); renderPlaying(); });
  }
  function toggle() { if (audio.paused || audio.ended) play(); else audio.pause(); }

  // ---- sheet / mini bar ----------------------------------------------------------------------
  function setMini(on) {
    mini.hidden = !on;
    frame?.classList.toggle('rap-has-mini', on);
  }
  function openSheet(from) {
    opener = from || document.activeElement;
    sheet.hidden = false;
    setMini(false);
    renderResume();
    root.classList.add('is-open');
    setInert(true);
    requestAnimationFrame(() => (resumeBox.hidden ? toggles[0] : $('[data-rap-resume-go]')).focus({ preventScroll: true }));
    trackEvent('audio_open', { article_path: ds.key });
  }
  function setInert(on) {
    if (!frame) return;
    for (const el of frame.children) if (el !== root) el.inert = on;
  }
  function minimise() {
    sheet.hidden = true;
    root.classList.remove('is-open');
    setInert(false);
    setMini(started);
    if (started) $('[data-rap-expand]')?.focus({ preventScroll: true });
    else opener?.focus?.({ preventScroll: true });
  }
  function close() {
    audio.pause();
    savePos(true);
    sheet.hidden = true;
    root.classList.remove('is-open');
    setInert(false);
    setMini(false);
    opener?.focus?.({ preventScroll: true });
  }

  // ---- events --------------------------------------------------------------------------------
  const ac = new AbortController();
  const on = (el, ev, fn, opts) => el.addEventListener(ev, fn, { signal: ac.signal, ...opts });

  on(document, 'click', e => {
    const btn = e.target.closest('[data-ra-audio-open]');
    if (btn) { e.preventDefault(); openSheet(btn); }
  });

  on(root, 'click', e => {
    const t = e.target.closest('button');
    if (!t || !root.contains(t)) return;
    if (t.matches('[data-rap-toggle]')) toggle();
    else if (t.matches('[data-rap-skip]')) seekTo(pos() + Number(t.dataset.rapSkip));
    else if (t.matches('[data-rap-minimise]')) minimise();
    else if (t.matches('[data-rap-close]')) close();
    else if (t.matches('[data-rap-expand]')) openSheet(t);
    else if (t.matches('[data-rap-resume-go]')) play();
    else if (t.matches('[data-rap-restart]')) { resumeFrom = 0; want = 0; play(); }
    else if (t.matches('[data-rap-remaining]')) { showRemaining = !showRemaining; render(); }
    else if (t.matches('[data-rap-rate]')) {
      rate = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
      audio.playbackRate = rate;
      store.set(RATE_KEY, rate);
      renderRate();
      trackEvent('audio_rate', { article_path: ds.key, rate });
    }
  });

  on(range, 'input', () => {
    dragging = true;
    const t = Number(range.value);
    elapsedEl.textContent = clock(t);
    remainingEl.textContent = showRemaining ? `−${clock(duration - t)}` : clock(duration);
    range.style.setProperty('--rap-pos', `${duration ? (t / duration) * 100 : 0}%`);
  });
  on(range, 'change', () => {
    dragging = false;
    seekTo(Number(range.value));
  });

  on(sheet, 'keydown', e => {
    if (e.target === range && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return; // native slider keys
    const k = e.key;
    if (k === 'Escape') { e.preventDefault(); if (started && !audio.paused) minimise(); else close(); }
    else if ((k === ' ' || k === 'k' || k === 'K') && !e.target.matches('button')) { e.preventDefault(); toggle(); }
    else if (k === 'ArrowLeft' || k === 'j' || k === 'J') { e.preventDefault(); seekTo(pos() - SKIP); }
    else if (k === 'ArrowRight' || k === 'l' || k === 'L') { e.preventDefault(); seekTo(pos() + SKIP); }
    else if (k === 'Tab') {
      // keep focus inside the dialog
      const f = [...sheet.querySelectorAll('button, input')].filter(x => !x.closest('[hidden]'));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  on(audio, 'loadedmetadata', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) duration = audio.duration;
    range.max = String(Math.floor(duration));
    if (want != null) { audio.currentTime = clamp(want); want = null; }
    audio.playbackRate = rate;
    render();
    updatePositionState();
  });
  on(audio, 'timeupdate', () => {
    render();
    savePos();
    if (duration) {
      const pct = (audio.currentTime / duration) * 100;
      for (const m of [25, 50, 75]) if (pct >= m && !milestones.has(m)) { milestones.add(m); trackEvent('audio_progress', { article_path: ds.key, percent: m }); }
    }
  });
  on(audio, 'progress', renderBuffered);
  on(audio, 'play', () => { renderPlaying(); status(''); updatePositionState(); });
  on(audio, 'playing', () => { root.classList.remove('is-buffering'); clearTimeout(stallTimer); status(''); });
  on(audio, 'pause', () => { renderPlaying(); savePos(true); updatePositionState(); });
  on(audio, 'ratechange', () => { if (audio.playbackRate !== rate) audio.playbackRate = rate; updatePositionState(); });
  on(audio, 'seeked', () => { updatePositionState(); savePos(true); });
  on(audio, 'waiting', () => {
    root.classList.add('is-buffering');
    clearTimeout(stallTimer);
    stallTimer = setTimeout(() => { if (started && !audio.paused) status(L.reconnecting); }, 4000);
  });
  on(audio, 'ended', () => {
    renderPlaying();
    savePos(true, true);
    resumeFrom = 0;
    if (!milestones.has(100)) { milestones.add(100); trackEvent('audio_progress', { article_path: ds.key, percent: 100 }); }
  });
  on(audio, 'error', () => { root.classList.remove('is-buffering'); renderPlaying(); if (started) status(L.loadError); });

  renderRate();
  render();
  renderResume();
  renderListenLabel(resumeFrom);

  return {
    root,
    save: () => savePos(true),
    destroy() {
      savePos(true);
      clearTimeout(stallTimer);
      ac.abort();
      try { audio.pause(); } catch { /* ignore */ }
      frame?.classList.remove('rap-has-mini');
      setInert(false);
      clearMediaSession();
    },
  };
}

function init() {
  const root = document.querySelector('[data-ra-audio]');
  if (!root) return;
  if (current && current.root === root) return;
  current?.destroy();
  current = mount(root);
}

let documentBound = false;
function bindDocument() {
  if (documentBound) return;
  documentBound = true;
  document.addEventListener('astro:page-load', init);
  document.addEventListener('astro:before-swap', () => { current?.destroy(); current = null; });
  window.addEventListener('pagehide', () => current?.save());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') current?.save(); });
}

bindDocument();
init();
