/**
 * Extrabiblical Evidence for Jesus: stateless progressive-enhancement script.
 *   - Highlights active section chip via IntersectionObserver without rewriting the URL.
 *   - Copies canonical URL + active section fragment to clipboard on button tap.
 *   - Opens any closed <details> ancestor when a hash navigation targets an anchor inside it.
 * Zero storage, zero cookies, zero URL mutation.
 */
import { hasSavedScroll } from '../../../utils/scroll_restoration.js';

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealHashTarget(root, { allowScroll = true } = {}) {
  let raw = '';
  try {
    raw = decodeURIComponent(window.location.hash.replace(/^#/, ''));
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
  const nav = root.querySelector('[data-ebj-nav]');
  const track = nav && nav.querySelector('[data-ebj-track]');
  if (!nav || !('IntersectionObserver' in window)) return null;
  const chips = [...nav.querySelectorAll('[data-ebj-chip]')];
  const ids = chips.map(a => a.dataset.ebjChip);
  const seen = new Map();
  const setActive = id => {
    if (id === state.current) return;
    state.current = id;
    chips.forEach(a =>
      a.dataset.ebjChip === id
        ? a.setAttribute('aria-current', 'location')
        : a.removeAttribute('aria-current'),
    );
    const activeChip = chips.find(c => c.dataset.ebjChip === id);
    if (activeChip && track) {
      const t = track.getBoundingClientRect();
      const c = activeChip.getBoundingClientRect();
      if (c.left < t.left || c.right > t.right - 24) {
        track.scrollBy({
          left: c.left - t.left - 12,
          behavior: reduceMotion() ? 'auto' : 'smooth',
        });
      }
    }
  };
  const bar = parseFloat(getComputedStyle(root).getPropertyValue('--hrv-bar-h')) || 52;
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => seen.set(e.target.id, e.isIntersecting));
      const inBand = ids.filter(id => seen.get(id));
      setActive(inBand[inBand.length - 1] || null);
    },
    { rootMargin: `-${Math.round(bar + 12)}px 0px -60% 0px` },
  );
  ids.forEach(id => {
    const s = document.getElementById(id);
    if (s) io.observe(s);
  });
  const updateFade = () => {
    if (track) nav.classList.toggle('is-end', track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
  };
  if (track) track.addEventListener('scroll', updateFade, { passive: true });
  updateFade();
  return io;
}

function initCopy(root, state) {
  const btn = root.querySelector('[data-ebj-copy]');
  const toast = root.querySelector('[data-ebj-toast]');
  if (!btn) return;
  let timer = 0;
  const show = text => {
    if (!toast) return;
    clearTimeout(timer);
    toast.textContent = text;
    toast.classList.add('is-on');
    timer = setTimeout(() => {
      toast.classList.remove('is-on');
      toast.textContent = '';
    }, 1800);
  };
  btn.addEventListener('click', async () => {
    const base = btn.dataset.url || window.location.href.split('#')[0];
    const url = state.current ? `${base}#${state.current}` : base;
    try {
      await navigator.clipboard.writeText(url);
      show(btn.dataset.copied || '');
    } catch {
      try {
        if (navigator.share) {
          await navigator.share({ title: document.title, url });
          return;
        }
      } catch {
        return;
      }
      show(btn.dataset.failed || '');
    }
  });
}

function init() {
  const root = document.querySelector('.ebj');
  if (!root || root.dataset.ebjReady) return;
  root.dataset.ebjReady = '1';
  revealHashTarget(root, { allowScroll: !hasSavedScroll() });
  const onHash = () => revealHashTarget(root, { allowScroll: true });
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
        opened = true;
      }
    }
    if (opened) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
      });
    }
  };
  window.addEventListener('hashchange', onHash);
  root.addEventListener('click', onAnchorClick);
  const state = { current: null };
  const io = initNav(root, state);
  initCopy(root, state);
  document.addEventListener(
    'astro:before-swap',
    () => {
      if (io) io.disconnect();
      window.removeEventListener('hashchange', onHash);
      root.removeEventListener('click', onAnchorClick);
    },
    { once: true },
  );
}

document.addEventListener('astro:page-load', init);
if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
