/**
 * Trustworthiness of the Bible: tiny, stateless client behavior (no storage of any kind, no URL
 * rewriting, no history manipulation).
 *   - active section chip (IntersectionObserver), kept visible inside the scrollable nav track
 *   - copy link button with empty live-region toast
 *   - lazy hydration of digitized folio scans inside <details data-twb-scan> (0 bytes while closed)
 *   - deep-link helper: expands any closed <details> ancestor if a #hash target sits inside one
 */
import { hasSavedScroll } from '../../../utils/scroll_restoration.js';

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function hydrateScan(detailsEl) {
  if (!detailsEl || !detailsEl.open) return;
  for (const img of detailsEl.querySelectorAll('img[data-src]')) {
    if (!img.getAttribute('src')) {
      img.setAttribute('src', img.dataset.src);
    }
  }
}

function initScans(root) {
  for (const d of root.querySelectorAll('details[data-twb-scan]')) {
    if (d.open) hydrateScan(d);
    d.addEventListener('toggle', () => hydrateScan(d));
  }
}

function revealHashTarget(root, { allowScroll = true } = {}) {
  let raw = '';
  try {
    raw = decodeURIComponent(location.hash.replace(/^#/, ''));
  } catch {
    return;
  }
  if (!raw) return;
  const target = document.getElementById(raw);
  if (!target || !root.contains(target)) return;
  let opened = false;
  for (let p = target.parentElement; p && p !== root; p = p.parentElement) {
    if (p.tagName === 'DETAILS' && !p.open) {
      p.open = true;
      hydrateScan(p);
      opened = true;
    }
  }
  if (opened && allowScroll) {
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    });
  }
}

function initNav(root, state) {
  const nav = root.querySelector('[data-twb-nav]');
  const track = nav && nav.querySelector('[data-twb-track]');
  if (!nav || !('IntersectionObserver' in window)) return null;
  const chips = [...nav.querySelectorAll('[data-twb-chip]')];
  const ids = chips.map(a => a.dataset.twbChip);
  const seen = new Map();
  const setActive = id => {
    if (id === state.current) return;
    state.current = id;
    chips.forEach(a => (a.dataset.twbChip === id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
    const a = chips.find(c => c.dataset.twbChip === id);
    if (a && track) {
      const t = track.getBoundingClientRect();
      const c = a.getBoundingClientRect();
      const targetLeft = Math.max(0, track.scrollLeft + (c.left - t.left) - (t.width - c.width) / 2);
      track.scrollTo({ left: targetLeft, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
  };
  const bar = parseFloat(getComputedStyle(root).getPropertyValue('--hrv-bar-h')) || 52;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => seen.set(e.target.id, e.isIntersecting));
    const inBand = ids.filter(id => seen.get(id));
    setActive(inBand[inBand.length - 1] || null);
  }, { rootMargin: `-${Math.round(bar + 12)}px 0px -60% 0px` });
  ids.forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });
  const updateFade = () => { if (track) nav.classList.toggle('is-end', track.scrollLeft + track.clientWidth >= track.scrollWidth - 4); };
  if (track) track.addEventListener('scroll', updateFade, { passive: true });
  updateFade();
  return io;
}

function initCopy(root, state) {
  const btn = root.querySelector('[data-twb-copy]');
  const toast = root.querySelector('[data-twb-toast]');
  if (!btn) return;
  let timer = 0;
  const show = text => {
    if (!toast) return;
    clearTimeout(timer);
    toast.textContent = text;
    toast.classList.add('is-on');
    timer = setTimeout(() => { toast.classList.remove('is-on'); toast.textContent = ''; }, 1800);
  };
  btn.addEventListener('click', async () => {
    const base = btn.dataset.url || location.href.split('#')[0];
    const url = state.current ? `${base}#${state.current}` : base;
    try {
      await navigator.clipboard.writeText(url);
      show(btn.dataset.copied || '');
    } catch {
      try {
        if (navigator.share) { await navigator.share({ title: document.title, url }); return; }
      } catch { return; }
      show(btn.dataset.failed || '');
    }
  });
}

function init() {
  const root = document.querySelector('.twb');
  if (!root || root.dataset.twbReady) return;
  root.dataset.twbReady = '1';
  const state = { current: null };
  initScans(root);
  revealHashTarget(root, { allowScroll: !hasSavedScroll() });
  const onHashChange = () => revealHashTarget(root, { allowScroll: true });
  const onAnchorClick = ev => {
    const link = ev.target && ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!link || !root.contains(link)) return;
    const href = link.getAttribute('href') || '';
    if (href.length < 2) return;
    let targetId = '';
    try {
      targetId = decodeURIComponent(href.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(targetId);
    if (!target || !root.contains(target)) return;
    let opened = false;
    for (let p = target.parentElement; p && p !== root; p = p.parentElement) {
      if (p.tagName === 'DETAILS' && !p.open) {
        p.open = true;
        hydrateScan(p);
        opened = true;
      }
    }
    if (opened) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
      });
    }
  };
  window.addEventListener('hashchange', onHashChange);
  root.addEventListener('click', onAnchorClick);
  const io = initNav(root, state);
  initCopy(root, state);
  document.addEventListener('astro:before-swap', () => {
    if (io) io.disconnect();
    window.removeEventListener('hashchange', onHashChange);
    root.removeEventListener('click', onAnchorClick);
  }, { once: true });
}

document.addEventListener('astro:page-load', init);
if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
