/**
 * Hadith Reliability — tiny, stateless client behaviour (no storage of any kind).
 *   - copy link (case bar)          - kind-of-evidence filter chips (hub, at a glance)
 *   - version tabs (showcase)
 * Bound on astro:page-load because the site uses Astro's ClientRouter.
 */
function initCopy(root) {
  const btn = root.querySelector('[data-hrv-copy]');
  const toast = root.querySelector('[data-hrv-toast]');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const url = location.href.split('#')[0];
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) { await navigator.share({ title: document.title, url }); return; }
      await navigator.clipboard.writeText(url);
    } catch { /* user cancelled share or clipboard unavailable */ return; }
    if (toast) { toast.classList.add('is-on'); setTimeout(() => toast.classList.remove('is-on'), 1600); }
  });
}

function initChips(root) {
  const bar = root.querySelector('[data-hrv-chips]');
  if (!bar) return;
  const scope = root.querySelector('[data-hrv-filter-scope]') || root;
  bar.addEventListener('click', e => {
    const chip = e.target.closest('[data-angle]');
    if (!chip) return;
    const angle = chip.dataset.angle;
    bar.querySelectorAll('[data-angle]').forEach(b => b.setAttribute('aria-pressed', String(b === chip)));
    scope.querySelectorAll('[data-archetype]').forEach(el => { el.hidden = angle !== 'all' && el.dataset.archetype !== angle; });
    scope.querySelectorAll('[data-hrv-group]').forEach(g => { g.hidden = !g.querySelector('[data-archetype]:not([hidden])'); });
  });
}

function initTabs(root) {
  root.querySelectorAll('[data-hrv-tabs]').forEach(box => {
    const tabs = [...box.querySelectorAll('[role="tab"]')];
    const select = i => tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
      const panel = box.querySelector(`#${t.getAttribute('aria-controls')}`);
      if (panel) panel.hidden = i !== j;
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          select(n); tabs[n].focus();
        }
      });
    });
    select(0);
  });
}

function init() {
  const root = document.querySelector('.hrv');
  if (!root || root.dataset.hrvReady) return;
  root.dataset.hrvReady = '1';
  root.classList.add('hrv-js');
  initCopy(root);
  initChips(root);
  initTabs(root);
}

document.addEventListener('astro:page-load', init);
if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
