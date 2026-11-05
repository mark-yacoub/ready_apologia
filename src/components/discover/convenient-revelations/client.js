/**
 * 12 Occasions of Revelation (`/discover/convenient-revelations`) — tiny, stateless client behaviour
 * (no storage of any kind):
 *   - copy link: every [data-crv-copy]; `data-crv-copy-hash` copies `url#id` (per-item buttons)
 *   - opens any closed <details> that contains the #target (hash links into drawers / nested reports)
 *   - "Read the full text" clamp toggles for long narrations (clamped only when this script runs)
 *   - the "On this page" sheet closes after a jump, on Escape and on an outside click
 * Version tabs come from hadith-reliability/client.js (also loaded on the chapter pages).
 *
 * The site uses Astro's ClientRouter: per-page wiring runs on every `astro:page-load` (on the swapped-in
 * root), while window/document listeners are registered once at module scope and do nothing unless the
 * current page is one of ours.
 */
const root = () => document.querySelector('.crv');

function toast(r, ok) {
  const t = r.querySelector('[data-crv-toast]');
  if (!t) return;
  t.textContent = ok ? (t.dataset.copied || t.textContent) : (t.dataset.failed || t.textContent);
  t.classList.add('is-on');
  setTimeout(() => t.classList.remove('is-on'), 1600);
}

function initCopy(r) {
  r.querySelectorAll('[data-crv-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const hash = btn.getAttribute('data-crv-copy-hash');
      const url = location.href.split('#')[0] + (hash ? `#${hash}` : '');
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        try { await navigator.share({ title: document.title, url }); } catch { /* user cancelled the share sheet */ }
        return;
      }
      try { await navigator.clipboard.writeText(url); toast(r, true); } catch { toast(r, false); }
    });
  });
}

function openFor(id) {
  if (!id || !root()) return;
  let el;
  try { el = document.getElementById(decodeURIComponent(id)); } catch { return; }
  if (!el) return;
  let changed = false;
  for (let d = el.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) {
    if (!d.open && !d.hasAttribute('data-crv-sheet')) { d.open = true; changed = true; }
  }
  if (changed) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
}

function closeSheet(r, { focus = false } = {}) {
  const sheet = r.querySelector('[data-crv-sheet][open]');
  if (!sheet) return;
  sheet.open = false;
  if (focus) sheet.querySelector('summary')?.focus();
}

function initPage(r) {
  openFor(location.hash.slice(1));
  r.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a) openFor(a.getAttribute('href').slice(1));
    const sheet = r.querySelector('[data-crv-sheet][open]');
    if (sheet && a && sheet.contains(a)) closeSheet(r);
  });
}

function initClamp(r) {
  r.querySelectorAll('[data-crv-clamp-btn]').forEach(btn => {
    const box = document.getElementById(btn.getAttribute('aria-controls'));
    const label = btn.querySelector('[data-label]');
    if (!box || !label) return;
    btn.addEventListener('click', () => {
      const open = box.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      label.textContent = open ? btn.dataset.less : btn.dataset.more;
    });
  });
}

function init() {
  const r = root();
  if (!r || r.dataset.crvReady) return;
  r.dataset.crvReady = '1';
  r.classList.add('crv-js');
  initCopy(r);
  initPage(r);
  initClamp(r);
}

// Registered once per document, whatever the number of client-side navigations.
if (!window.__crvClient) {
  window.__crvClient = true;
  window.addEventListener('hashchange', () => openFor(location.hash.slice(1)));
  document.addEventListener('keydown', e => { const r = root(); if (r && e.key === 'Escape') closeSheet(r, { focus: true }); });
  document.addEventListener('click', e => { const r = root(); const sheet = r?.querySelector('[data-crv-sheet][open]'); if (sheet && !sheet.contains(e.target)) closeSheet(r); });
  document.addEventListener('astro:page-load', init);
}
if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
