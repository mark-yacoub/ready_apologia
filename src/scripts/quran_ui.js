export const normalizeArabic = (word) => {
  let norm = word;
  norm = norm.replace(/\u0649\u0670/g, '\u0649');
  norm = norm.replace(/[\u0648\u064A]\u0670/g, '\u0627');
  norm = norm.replace(/\u0670/g, '\u0627');
  norm = norm.replace(/[\u06D6-\u06DC\u06DF-\u06ED\u0653\u0640\u0652]/g, '');
  norm = norm.replace(/\u0671/g, '\u0627');
  norm = norm.replace(/\u0649/g, '\u064A');
  norm = norm.replace(/[\u0621\u0623\u0624\u0625\u0626\u0654\u0655]/g, '\u0621');
  norm = norm.replace(/^([^\u064B-\u0651])\u0651/, '$1');
  norm = norm.replace(/\u064E\u0627/g, '\u0627\u064E');
  norm = norm.replace(/^ذ[اَ]*ل[ِ]*ك[َ]*$/g, 'ذلك');
  norm = norm.replace(/^ه[اَ]*ذ[اَ]*$/g, 'هذا');
  norm = norm.replace(/^الرَّحْم[اَ]*ن[ِ]*$/g, 'الرحمن');
  norm = norm.replace(/^الَّي[َُِ]*ل/g, 'اللَّيل');
  norm = norm.split(/\s+/).map(w => w.replace(/^(\u0627)[\u064B-\u0651]+/g, '$1')).join(' ');
  return norm;
};

export const normalizeSentence = (sentence) => {
  if (!sentence) return '';
  return sentence.split(/\s+/).map(normalizeArabic).join(' ');
};

export const initQuranUI = (containerSelector = '.verses-container.quran-reader-mode, .lost-verses-container') => {
  const container = document.querySelector(containerSelector);
  if (!container || container.dataset.quranInit) return;
  container.dataset.quranInit = 'true';

  const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
  const isSurah0 = window.location.pathname.includes('/quran/0');

  // 1. Setup Chapter Dropdown
  const dropdownBtn = document.querySelector('#quran-chapter-dropdown-btn');
  const dropdownMenu = document.querySelector('#quran-chapter-dropdown-menu');
  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== dropdownBtn) {
        dropdownMenu.style.display = 'none';
      }
    });
  }

  // 2. Setup Lens Selector (Dropdown Navigation)
  const lensSelect = document.querySelector('#quran-lens-select');
  if (lensSelect) {
    const savedLens = localStorage.getItem('quran-lens');
    if (savedLens && savedLens !== lensSelect.value) {
      if (!isSurah0) {
        lensSelect.value = savedLens;
        lensSelect.dispatchEvent(new Event('change'));
      }
    }

    lensSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      localStorage.setItem('quran-lens', val);
      
      if (val === 'SHOW_ALL') {
        window.location.href = `${base}/quran/0`;
      } else if (val === 'STANDARD') {
        if (isSurah0) {
          window.location.href = `${base}/quran/1`;
        } else {
          const match = window.location.pathname.match(/\/quran\/(\d+)/);
          const surahIndex = match ? match[1] : 1;
          window.location.href = `${base}/quran/${surahIndex}`;
        }
      } else if (val.startsWith('codex-')) {
        const comp = val.replace('codex-', '');
        if (isSurah0) {
          window.location.href = `${base}/quran/0/${comp}`;
        } else {
          const match = window.location.pathname.match(/\/quran\/(\d+)/);
          const surahIndex = match ? match[1] : 1;
          window.location.href = `${base}/quran/${surahIndex}/${comp}`;
        }
      } else if (val.startsWith('recitation-')) {
         const parts = val.replace('recitation-', '').split('-');
         const rawi = parts.slice(1).join('-');
         if (isSurah0) {
            window.location.href = `${base}/quran/1/${rawi}`;
         } else {
            const match = window.location.pathname.match(/\/quran\/(\d+)/);
            const surahIndex = match ? match[1] : 1;
            window.location.href = `${base}/quran/${surahIndex}/${rawi}`;
         }
      }
    });
  }

  // 3. Setup Diff Trigger
  const diffTrigger = document.getElementById('quran-diff-trigger');
  const diffPopover = document.getElementById('quran-diff-popover');
  const diffGoBtn = document.getElementById('quran-diff-go-btn');
  
  if (diffTrigger && diffPopover && diffGoBtn) {
    diffTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      diffPopover.style.display = diffPopover.style.display === 'flex' ? 'none' : 'flex';
    });
    
    document.addEventListener('click', (e) => {
      if (!diffPopover.contains(e.target) && e.target !== diffTrigger) {
        diffPopover.style.display = 'none';
      }
    });
    
    diffGoBtn.addEventListener('click', () => {
      const t1 = document.getElementById('diff-text-1').value;
      const t2 = document.getElementById('diff-text-2').value;
      if (t1 && t2 && t1 !== t2) {
        window.location.href = `${base}/quran/diff/${t1}/${t2}`;
      }
    });
  }

  // 4. Setup Language Toggles
  window.quranUpdateLang = (lang) => {
    localStorage.setItem('quran-lang-pref', lang);
    const btnEn = document.getElementById('lang-btn-en');
    const btnAr = document.getElementById('lang-btn-ar');
    
    if (btnEn && btnAr) {
      if (lang === 'en') {
        btnEn.style.background = 'var(--color-primary)';
        btnEn.style.color = 'var(--color-on-primary)';
        btnAr.style.background = 'transparent';
        btnAr.style.color = 'var(--color-on-surface)';
      } else {
        btnAr.style.background = 'var(--color-primary)';
        btnAr.style.color = 'var(--color-on-primary)';
        btnEn.style.background = 'transparent';
        btnEn.style.color = 'var(--color-on-surface)';
      }
    }

    if (lang === 'en') {
      // Standard Verses
      document.querySelectorAll('.quran-verse').forEach(row => {
        const en = row.querySelector('.quran-en');
        const ar = row.querySelector('.quran-ar');
        if (en) { en.style.fontSize = '20px'; en.style.opacity = '1'; }
        if (ar) { ar.style.fontSize = '16px'; ar.style.opacity = '0.6'; ar.style.color = 'var(--color-on-surface)'; }
      });
      
      // Lost Verses & Hadiths & Variants
      document.querySelectorAll('.lost-verse-item, .companion-virtues-panel, .variant-item').forEach(row => {
        const ar = row.querySelector('.quran-ar');
        const en = row.querySelector('.quran-en');
        const har = row.querySelector('.hadith-ar');
        const hen = row.querySelector('.hadith-en');
        if (en) { en.style.fontSize = '22px'; en.style.opacity = '1'; }
        if (ar) { ar.style.fontSize = '16px'; ar.style.opacity = '0.6'; }
        if (hen) { hen.style.fontSize = '18px'; hen.style.opacity = '1'; }
        if (har) { har.style.fontSize = '14px'; har.style.opacity = '0.6'; }
      });
      
    } else {
      // Standard Verses
      document.querySelectorAll('.quran-verse').forEach(row => {
        const en = row.querySelector('.quran-en');
        const ar = row.querySelector('.quran-ar');
        if (en) { en.style.fontSize = '16px'; en.style.opacity = '0.6'; }
        if (ar) { ar.style.fontSize = '24px'; ar.style.opacity = '1'; ar.style.color = 'var(--color-on-surface)'; }
      });
      
      // Lost Verses & Hadiths & Variants
      document.querySelectorAll('.lost-verse-item, .companion-virtues-panel, .variant-item').forEach(row => {
        const ar = row.querySelector('.quran-ar');
        const en = row.querySelector('.quran-en');
        const har = row.querySelector('.hadith-ar');
        const hen = row.querySelector('.hadith-en');
        if (en) { en.style.fontSize = '16px'; en.style.opacity = '0.6'; }
        if (ar) { ar.style.fontSize = '26px'; ar.style.opacity = '1'; }
        if (hen) { hen.style.fontSize = '12px'; hen.style.opacity = '0.6'; }
        if (har) { har.style.fontSize = '22px'; har.style.opacity = '1'; }
      });
    }
  };

  const btnEn = document.getElementById('lang-btn-en');
  const btnAr = document.getElementById('lang-btn-ar');
  if (btnEn && btnAr) {
    btnAr.addEventListener('click', () => window.quranUpdateLang('ar'));
    btnEn.addEventListener('click', () => window.quranUpdateLang('en'));
    
    // Init state
    const initialLang = localStorage.getItem('quran-lang-pref') || 'en';
    window.quranUpdateLang(initialLang);
  } else {
    // If no buttons, at least ensure the styles are applied on load
    const initialLang = localStorage.getItem('quran-lang-pref') || 'en';
    window.quranUpdateLang(initialLang);
  }

  // 5. Verse Expansion (Badges)
  const qDataStr = container.getAttribute('data-quran');
  if (qDataStr) {
    try {
      const qData = JSON.parse(qDataStr);
      document.querySelectorAll('.quran-badge').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const verseNum = btn.dataset.verse;
          const panel = document.getElementById(`quran-expand-${verseNum}`);
          if (!panel) return;
          
          const isCanonical = btn.classList.contains('quran-badge-canonical');
          const isCompanion = btn.classList.contains('quran-badge-companion');
          
          const resetBadge = (badgeBtn) => {
            if (badgeBtn.classList.contains('quran-badge-canonical')) {
              badgeBtn.style.background = 'var(--color-tertiary-container)';
              badgeBtn.style.color = 'var(--color-on-tertiary-container)';
              badgeBtn.style.border = '1px solid rgba(180, 83, 9, 0.2)';
            } else {
              badgeBtn.style.background = 'var(--color-secondary)';
              badgeBtn.style.color = 'white';
              badgeBtn.style.border = 'none';
            }
          };
          
          // Toggle off if already open for this specific type of badge
          const activeType = panel.getAttribute('data-active-type');
          if (panel.style.display === 'block' && activeType === (isCanonical ? 'canonical' : 'companion')) {
            panel.style.display = 'none';
            panel.removeAttribute('data-active-type');
            resetBadge(btn);
            return;
          }
          
          const verseData = qData.verses.find(v => String(v.verseNum) === verseNum);
          if (!verseData) return;
          
          // Reset other badge styles in this row
          btn.parentElement.querySelectorAll('.quran-badge').forEach(b => {
            resetBadge(b);
          });
          
          let html = `<div style="font-size: 13.5px; color: var(--color-on-surface); line-height: 1.6; text-align: left;">`;
          
          if (isCanonical && verseData.canonicalVariants && verseData.canonicalVariants.length > 0) {
            panel.setAttribute('data-active-type', 'canonical');
            html += `<h4 style="margin: 0 0 10px 0; color: var(--color-primary); font-size: 14px; font-weight: 700;">Canonical Recitation Variants</h4>`;
            html += `<div style="display: flex; flex-direction: column; gap: 12px;">`;
            verseData.canonicalVariants.forEach(v => {
              html += `<div class="variant-item" style="border-bottom: 1px solid var(--color-outline-variant); padding-bottom: 12px;">`;
              html += `<div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">`;
              html += v.readers.map(r => `<span style="background: var(--color-primary-container); color: var(--color-on-primary-container); padding: 4px 10px; border-radius: 12px; font-size: 11.5px; font-weight: 600;">${r}</span>`).join('');
              if (v.category) html += `<span style="background: var(--color-tertiary-container); color: var(--color-on-tertiary-container); padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">${v.category}</span>`;
              html += `</div>`;
              html += `<div class="quran-ar" style="direction: rtl; font-family: 'Amiri', serif; font-size: 22px; text-align: right; margin-bottom: 8px; color: var(--color-primary); line-height: 1.6;">${v.diffed_arabic || v.arabic}</div>`;
              html += `<div class="quran-en" style="font-size: 13.5px; color: var(--color-on-surface); line-height: 1.5;">${v.english}</div>`;
              if (v.reason) html += `<div style="display: flex; align-items: center; gap: 6px; margin-top: 10px;"><span style="background: var(--color-error-container); color: var(--color-on-error-container); padding: 3px 8px; border-radius: 12px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Reason</span> <span style="font-size: 12.5px; color: var(--color-on-surface-variant);">${v.reason}</span></div>`;
              html += `</div>`;
            });
            html += `</div>`;
          } else if (isCompanion && verseData.codexVariants && verseData.codexVariants.length > 0) {
            panel.setAttribute('data-active-type', 'companion');
            html += `<h4 style="margin: 0 0 10px 0; color: var(--color-secondary); font-size: 14px; font-weight: 700;">Competing Companion Codices</h4>`;
            html += `<div style="display: flex; flex-direction: column; gap: 12px;">`;
            verseData.codexVariants.forEach(v => {
              html += `<div class="variant-item" style="border-bottom: 1px solid var(--color-outline-variant); padding-bottom: 12px;">`;
              html += `<div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">`;
              const comps = v.companions || [v.companion_codex].filter(Boolean);
              html += comps.map(c => `<span style="background: var(--color-secondary-container); color: var(--color-on-secondary-container); padding: 4px 10px; border-radius: 12px; font-size: 11.5px; font-weight: 600;">${c.replace(/_/g, ' ')}'s Codex</span>`).join('');
              html += `</div>`;
              html += `<div class="quran-ar" style="direction: rtl; font-family: 'Amiri', serif; font-size: 22px; text-align: right; margin-bottom: 8px; color: var(--color-secondary); line-height: 1.6;">${v.diffed_variant_arabic || v.variant_arabic}</div>`;
              html += `<div class="quran-en" style="font-size: 13.5px; color: var(--color-on-surface); line-height: 1.5;">${v.variant_english}</div>`;
              if (v.hadith_arabic || v.hadith_english) {
                html += `<div style="font-size: 12.5px; background: var(--color-surface-container-low); padding: 12px; border-radius: 6px; margin-top: 10px; color: var(--color-on-surface-variant); border-left: 3px solid var(--color-secondary);">`;
                html += `<div style="font-weight: 600; margin-bottom: 8px; color: var(--color-secondary);">Context (Hadith):</div>`;
                if (v.hadith_arabic) {
                  html += `<div class="hadith-ar" style="direction: rtl; font-family: 'Amiri', serif; font-size: 16px; margin-bottom: 8px; color: var(--color-on-surface); line-height: 1.6;">${v.hadith_arabic}</div>`;
                }
                if (v.hadith_english) {
                  html += `<div class="hadith-en" style="line-height: 1.5; margin-bottom: 8px;">${v.hadith_english}</div>`;
                }
                html += `<div style="font-size: 11px; text-align: right; margin-top: 4px;">Source: <a href="${v.sunnah_url || '#'}" target="_blank" style="text-decoration: underline; color: var(--color-secondary); font-weight: 500;">${v.source_reference || 'Source'}</a></div>`;
                html += `</div>`;
              } else if (v.source_reference || v.sunnah_url) {
                html += `<div style="margin-top: 6px; font-size: 11px; color: var(--color-on-surface-variant);">Source: <a href="${v.sunnah_url || '#'}" target="_blank" style="text-decoration: underline; color: var(--color-secondary);">${v.source_reference || 'Source'}</a></div>`;
              }
              html += `</div>`;
            });
            html += `</div>`;
          } else {
            return; // No data to show
          }
          
          html += `</div>`;
          panel.innerHTML = html;
          panel.style.display = 'block';
          btn.style.background = isCanonical ? 'var(--color-primary-container)' : 'var(--color-secondary-container)';
          btn.style.color = isCanonical ? 'var(--color-on-primary-container)' : 'var(--color-on-secondary-container)';
          btn.style.border = '1px solid transparent';
          
          if (window.quranUpdateLang) {
            window.quranUpdateLang(localStorage.getItem('quran-lang-pref') || 'en');
          }
        });
      });
    } catch(err) {
      console.error("Failed to parse qData", err);
    }
  }

  // 6. Connect Lost Verses Group Headers to Lens Select
  document.querySelectorAll('.read-as-lost-companion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const codex = btn.getAttribute('data-codex');
      if (lensSelect) {
        lensSelect.value = codex;
        lensSelect.dispatchEvent(new Event('change'));
      }
    });
  });

  // 7. Setup companion virtues toggle
  document.querySelectorAll('.companion-info-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const comp = btn.getAttribute('data-companion');
      const panel = document.getElementById(`companion-virtues-${comp}`);
      if (panel) {
        if (panel.style.display === 'block') {
          panel.style.display = 'none';
          btn.textContent = comp.includes('Aisha') ? 'ℹ️ Why she matters' : 'ℹ️ Why he matters';
        } else {
          panel.style.display = 'block';
          panel.open = true; // Ensure it opens when toggled from the button
          btn.textContent = '📖 Hide Hadiths';
        }
      }
    });
  });
};
