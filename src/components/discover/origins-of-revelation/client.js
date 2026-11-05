/**
 * Origins of Revelation article: tiny, stateless client behaviour (no storage of any kind, no URL
 * rewriting, no history entries).
 *   - active section chip (IntersectionObserver), kept in view inside the scrollable bar
 *   - copy link: on tap, copies the canonical URL + the #id of the section being read; the toast is an
 *     empty live region that gets its text only when something happened
 * Old section ids work without JS: each has an alias anchor at its new section.
 * Bound on astro:page-load (the site uses Astro's ClientRouter); the observer is disconnected on
 * astro:before-swap.
 */
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function initNav(root, state) {
  const nav = root.querySelector('[data-orv-nav]');
  const track = nav && nav.querySelector('[data-orv-track]');
  if (!nav || !('IntersectionObserver' in window)) return null;
  const chips = [...nav.querySelectorAll('[data-orv-chip]')];
  const ids = chips.map(a => a.dataset.orvChip);
  const seen = new Map();
  const setActive = id => {
    if (id === state.current) return;
    state.current = id;
    chips.forEach(a => (a.dataset.orvChip === id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
    const a = chips.find(c => c.dataset.orvChip === id);
    if (a && track) {
      const t = track.getBoundingClientRect(), c = a.getBoundingClientRect();
      if (c.left < t.left || c.right > t.right - 24) track.scrollBy({ left: c.left - t.left - 12, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
  };
  // The band starts under the sticky bar (its height is the --hrv-bar-h token) and covers the top 40%.
  const bar = parseFloat(getComputedStyle(root).getPropertyValue('--hrv-bar-h')) || 52;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => seen.set(e.target.id, e.isIntersecting));
    // The band can hold the previous section's tail and the next section's head at once; the later
    // one in reading order is the section being read.
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
  const btn = root.querySelector('[data-orv-copy]');
  const toast = root.querySelector('[data-orv-toast]');
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
      } catch { return; /* share sheet cancelled */ }
      show(btn.dataset.failed || '');
    }
  });
}

function init() {
  const root = document.querySelector('.orv');
  if (!root || root.dataset.orvReady) return;
  root.dataset.orvReady = '1';
  const state = { current: null };
  const io = initNav(root, state);
  initCopy(root, state);
  if (io) document.addEventListener('astro:before-swap', () => io.disconnect(), { once: true });
}

document.addEventListener('astro:page-load', init);
if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
