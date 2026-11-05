/**
 * Quran Preservation: tiny, stateless client behaviour (no storage of any kind). The shared
 * hadith-reliability client.js handles the page copy-link button and the version tabs; this adds
 *   - per-item copy link (URL + #item-id), share sheet on touch devices
 *   - "On this page" index: closes on a link tap, Escape, a tap outside, or Tab out of the panel
 * Bound on astro:page-load because the site uses Astro's ClientRouter.
 */
function init() {
  const root = document.querySelector('[data-qp]');
  if (!root || root.dataset.qpReady) return;
  root.dataset.qpReady = '1';
  const toast = root.querySelector('[data-hrv-toast]');
  const index = root.querySelector('[data-qp-index]');
  bindDocument();

  root.addEventListener('click', async e => {
    const btn = e.target.closest('[data-qp-copy]');
    if (btn) {
      const url = `${location.href.split('#')[0]}#${btn.dataset.qpCopy}`;
      try {
        if (navigator.share && matchMedia('(pointer: coarse)').matches) { await navigator.share({ title: document.title, url }); return; }
        await navigator.clipboard.writeText(url);
      } catch { return; /* share cancelled or clipboard unavailable */ }
      if (toast) { toast.classList.add('is-on'); setTimeout(() => toast.classList.remove('is-on'), 1600); }
      return;
    }
    if (index?.open && e.target.closest('[data-qp-index] a')) index.open = false;
  });
}

/** Document-level listeners are bound once (the ClientRouter swaps the page, not the document). */
let documentBound = false;
function bindDocument() {
  if (documentBound) return;
  documentBound = true;
  const openIndex = () => { const i = document.querySelector('[data-qp-index]'); return i?.open ? i : null; };
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
}

document.addEventListener('astro:page-load', init);
if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
