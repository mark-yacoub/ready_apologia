/**
 * Stateless client enhancement for `/discover/divinity-timeline`:
 *   1. Marks the active section chip (`aria-current="location"`) via IntersectionObserver
 *      without mutating `window.location` or `history`.
 *   2. Copies the canonical URL + current `#section` fragment on copy-button tap,
 *      showing a polite transient toast.
 *   3. Opens any closed `<details>` ancestor when navigating to an in-page `#event-<id>`
 *      anchor (Pitfall P-08, e.g. the 14 excluded legacy anchors in `#methodology-and-scope`).
 * Zero persistent client state or URL/history mutation.
 */

import { hasSavedScroll } from '../../../utils/scroll_restoration.js';

const reduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealHashTarget(root, { allowScroll = true } = {}) {
  const rawHash = window.location.hash;
  if (!rawHash || rawHash.length < 2) return;
  let targetId;
  try {
    targetId = decodeURIComponent(rawHash.slice(1));
  } catch {
    return;
  }
  const target = document.getElementById(targetId);
  if (!target || !root.contains(target)) return;

  let openedAny = false;
  let parent = target.parentElement;
  while (parent && parent !== root) {
    if (parent.tagName === 'DETAILS' && !parent.open) {
      parent.open = true;
      openedAny = true;
    }
    parent = parent.parentElement;
  }
  if (openedAny && allowScroll) {
    requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: reduceMotion() ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  }
}

function initNav(root, state) {
  const nav = root.querySelector('[data-dtl-nav]');
  const track = nav && nav.querySelector('[data-dtl-track]');
  if (!nav || !('IntersectionObserver' in window)) return null;

  const chips = [...nav.querySelectorAll('[data-dtl-chip]')];
  const ids = chips.map((a) => a.dataset.dtlChip);
  const seen = new Map();

  const setActive = (id) => {
    if (id === state.current) return;
    state.current = id;
    chips.forEach((a) => {
      if (a.dataset.dtlChip === id) {
        a.setAttribute('aria-current', 'location');
      } else {
        a.removeAttribute('aria-current');
      }
    });
    const activeChip = chips.find((c) => c.dataset.dtlChip === id);
    if (activeChip && track) {
      const tRect = track.getBoundingClientRect();
      const cRect = activeChip.getBoundingClientRect();
      if (cRect.left < tRect.left || cRect.right > tRect.right - 24) {
        track.scrollBy({
          left: cRect.left - tRect.left - 12,
          behavior: reduceMotion() ? 'auto' : 'smooth',
        });
      }
    }
  };

  const barHeight =
    parseFloat(getComputedStyle(root).getPropertyValue('--hrv-bar-h')) || 52;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
      const inBand = ids.filter((id) => seen.get(id));
      setActive(inBand[inBand.length - 1] || null);
    },
    { rootMargin: `-${Math.round(barHeight + 12)}px 0px -60% 0px` },
  );

  ids.forEach((id) => {
    const sec = document.getElementById(id);
    if (sec) io.observe(sec);
  });

  const updateFade = () => {
    if (!track) return;
    nav.classList.toggle(
      'is-end',
      track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
    );
  };
  if (track) {
    track.addEventListener('scroll', updateFade, { passive: true });
    updateFade();
  }
  return io;
}

function initCopy(root, state) {
  const btn = root.querySelector('[data-dtl-copy]');
  const toast = root.querySelector('[data-dtl-toast]');
  if (!btn) return;
  let timer = 0;

  const showToast = (msg) => {
    if (!toast) return;
    clearTimeout(timer);
    toast.textContent = msg;
    toast.classList.add('is-on');
    timer = window.setTimeout(() => {
      toast.classList.remove('is-on');
      toast.textContent = '';
    }, 1800);
  };

  btn.addEventListener('click', async () => {
    const base = btn.dataset.url || window.location.href.split('#')[0];
    const url = state.current ? `${base}#${state.current}` : base;
    try {
      await navigator.clipboard.writeText(url);
      showToast(btn.dataset.copied || 'Copied');
    } catch {
      try {
        if (navigator.share) {
          await navigator.share({ title: document.title, url });
          return;
        }
      } catch {
        return;
      }
      showToast(btn.dataset.failed || 'Copy failed');
    }
  });
}

function init() {
  const root = document.querySelector('.hrv.dtl');
  if (!root || root.dataset.dtlReady) return;
  root.dataset.dtlReady = '1';

  const state = { current: null };
  const io = initNav(root, state);
  initCopy(root, state);
  revealHashTarget(root, { allowScroll: !hasSavedScroll() });

  const onHashChange = () => revealHashTarget(root, { allowScroll: true });
  const onAnchorClick = (ev) => {
    const link = ev.target && ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!link || !root.contains(link)) return;
    const href = link.getAttribute('href') || '';
    if (href.length < 2) return;
    let targetId;
    try {
      targetId = decodeURIComponent(href.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(targetId);
    if (!target || !root.contains(target)) return;
    let opened = false;
    let parent = target.parentElement;
    while (parent && parent !== root) {
      if (parent.tagName === 'DETAILS' && !parent.open) {
        parent.open = true;
        opened = true;
      }
      parent = parent.parentElement;
    }
    if (opened) {
      requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: reduceMotion() ? 'auto' : 'smooth',
          block: 'start',
        });
      });
    }
  };
  window.addEventListener('hashchange', onHashChange);
  root.addEventListener('click', onAnchorClick);

  document.addEventListener(
    'astro:before-swap',
    () => {
      if (io) io.disconnect();
      window.removeEventListener('hashchange', onHashChange);
      root.removeEventListener('click', onAnchorClick);
    },
    { once: true },
  );
}

document.addEventListener('astro:page-load', init);
if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
