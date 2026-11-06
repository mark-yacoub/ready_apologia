/**
 * Islamic Dilemma article: tiny, stateless client behaviour (no storage of any kind, no URL rewriting).
 *   - copy link (section bar)
 *   - active section chip (IntersectionObserver), kept in view inside the scrollable bar
 * Old `#stage-N` links work without JS: each has an alias anchor at its new section.
 * Bound on astro:page-load because the site uses Astro's ClientRouter.
 */
function initCopy(root) {
  const btn = root.querySelector('[data-idl-copy]');
  const toast = root.querySelector('[data-idl-toast]');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const url = location.href.split('#')[0];
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) { await navigator.share({ title: document.title, url }); return; }
      await navigator.clipboard.writeText(url);
    } catch { return; }
    if (toast) { toast.classList.add('is-on'); setTimeout(() => toast.classList.remove('is-on'), 1600); }
  });
}

function initNav(root) {
  const nav = root.querySelector('[data-idl-nav]');
  const track = nav && nav.querySelector('[data-idl-track]');
  if (!nav || !('IntersectionObserver' in window)) return;
  const chips = [...nav.querySelectorAll('[data-idl-chip]')];
  const ids = chips.map(a => a.dataset.idlChip);
  const seen = new Map();
  let current = null;
  const setActive = id => {
    if (id === current) return;
    current = id;
    chips.forEach(a => (a.dataset.idlChip === id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
    const a = chips.find(c => c.dataset.idlChip === id);
    if (a && track) {
      const t = track.getBoundingClientRect(), c = a.getBoundingClientRect();
      if (c.left < t.left || c.right > t.right - 24) track.scrollBy({ left: c.left - t.left - 12, behavior: 'smooth' });
    }
  };
  navObserver?.disconnect();
  const io = navObserver = new IntersectionObserver(entries => {
    entries.forEach(e => seen.set(e.target.id, e.isIntersecting));
    // The band (below the bar, top 40% of the screen) can hold the previous section's tail and the
    // current section's head at once; the later one in reading order is the section being read.
    const inBand = ids.filter(id => seen.get(id));
    setActive(inBand[inBand.length - 1] || null);
  }, { rootMargin: '-64px 0px -60% 0px' });
  ids.forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });
  const updateFade = () => { if (track) nav.classList.toggle('is-end', track.scrollLeft + track.clientWidth >= track.scrollWidth - 4); };
  track && track.addEventListener('scroll', updateFade, { passive: true });
  updateFade();
}

/** Disconnected when the page is swapped out, so it does not keep the old page's nodes alive. */
let navObserver = null;
document.addEventListener('astro:before-swap', () => { navObserver?.disconnect(); navObserver = null; });

function init() {
  const root = document.querySelector('.idl');
  if (!root || root.dataset.idlReady) return;
  root.dataset.idlReady = '1';
  document.querySelectorAll('.app-footer .footer-verse').forEach(p => {
    if (/Verse 101\b/.test(p.textContent || '')) p.hidden = true;
  });
  initCopy(root);
  initNav(root);
}

document.addEventListener('astro:page-load', init);
if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
