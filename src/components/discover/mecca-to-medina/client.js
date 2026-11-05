/**
 * From Mecca to Medina: tiny, stateless client behaviour (no storage of any kind). The shared
 * hadith-reliability client.js handles the page copy-link button and the version tabs; this adds
 *   - per-item copy link (URL + #item-id), share sheet on touch devices;
 *   - "On this page" index: a link tap closes the panel first, then scrolls; Escape (focus returns to
 *     the summary), a tap outside, or tabbing out also close it;
 *   - a #hash that targets something inside a closed <details> (or a legacy anchor marked
 *     data-mm-open) opens it, then scrolls there, on load and on hashchange.
 * Bound on astro:page-load because the site uses Astro's ClientRouter.
 */
function openFor(target) {
  if (!target) return;
  const extra = target.dataset?.mmOpen ? document.getElementById(target.dataset.mmOpen) : null;
  if (extra && extra.tagName === 'DETAILS') extra.open = true;
  for (let el = target.parentElement; el; el = el.parentElement) if (el.tagName === 'DETAILS') el.open = true;
  if (target.tagName === 'DETAILS') target.open = true;
}

function goTo(id, { push = false } = {}) {
  const target = id && document.getElementById(id);
  if (!target) return false;
  openFor(target);
  // A null state is safe with Astro's ClientRouter: it treats a null-state popstate as a hash-only change
  // and leaves it to the browser, and our `hashchange` listener re-opens/scrolls on Back.
  if (push && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  // Wait a frame so a just-closed index panel or just-opened <details> has its final layout.
  requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  return true;
}

const hashId = () => { try { return decodeURIComponent(location.hash.slice(1)); } catch { return ''; } };

function init() {
  const root = document.querySelector('[data-mm]');
  if (!root || root.dataset.mmReady) return;
  root.dataset.mmReady = '1';
  const toast = root.querySelector('[data-hrv-toast]');
  let toastTimer = 0;
  const showToast = () => {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.classList.add('is-on');
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 1600);
  };
  bindDocument();

  root.addEventListener('click', async e => {
    const btn = e.target.closest('[data-mm-copy]');
    if (btn) {
      const url = `${location.href.split('#')[0]}#${btn.dataset.mmCopy}`;
      try {
        if (navigator.share && matchMedia('(pointer: coarse)').matches) { await navigator.share({ title: document.title, url }); return; }
        if (!navigator.clipboard) { window.prompt(btn.getAttribute('aria-label') || 'Copy link', url); return; } // http preview, old WebViews
        await navigator.clipboard.writeText(url);
      } catch { return; /* share cancelled or clipboard denied */ }
      showToast();
      return;
    }
    const indexLink = e.target.closest('[data-mm-index] a[href^="#"]');
    if (indexLink) {
      const index = indexLink.closest('[data-mm-index]');
      e.preventDefault();
      index.open = false;
      goTo(indexLink.getAttribute('href').slice(1), { push: true });
      return;
    }
    // Any in-page link whose target sits inside a closed <details>.
    const a = e.target.closest('a[href^="#"]');
    if (a) {
      const t = document.getElementById(a.getAttribute('href').slice(1));
      if (t && (t.closest('details:not([open])') || t.dataset.mmOpen)) { e.preventDefault(); goTo(t.id, { push: true }); }
    }
  });

  if (location.hash) goTo(hashId());
}

/** Document-level listeners are bound once (the ClientRouter swaps the page, not the document). */
let documentBound = false;
function bindDocument() {
  if (documentBound) return;
  documentBound = true;
  const openIndex = () => { const i = document.querySelector('[data-mm-index]'); return i?.open ? i : null; };
  document.addEventListener('click', e => { const i = openIndex(); if (i && !i.contains(e.target)) i.open = false; });
  document.addEventListener('keydown', e => {
    const i = openIndex();
    if (e.key === 'Escape' && i) { i.open = false; i.querySelector('summary')?.focus(); }
  });
  // Tabbing out of the open panel closes it, so the overlay never covers the newly focused element.
  document.addEventListener('focusout', e => {
    const i = openIndex();
    if (i && i.contains(e.target) && e.relatedTarget && !i.contains(e.relatedTarget)) i.open = false;
  });
  window.addEventListener('hashchange', () => { if (document.querySelector('[data-mm]')) goTo(hashId()); });
}

document.addEventListener('astro:page-load', init);
if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
