import React, { useState, useEffect, useRef } from 'react';
import ScrollableTrack from './ScrollableTrack.jsx';
import { trackEvent } from '../utils/analytics.js';
import '../styles/tafseer.css';

function normalizeForMatch(str) {
  return (str || '')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/['’‘"“”`.,;:!?()[\]{}«»—–\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export default function TafseerViewer({ activeCommentary, scholarMenu = [], surah = '', ayah = '' }) {
  const [language, setLanguage] = useState('en');
  const [hlParams, setHlParams] = useState({ hlEn: '', hlAr: '', searchStr: '' });
  const [hasMatchedHighlight, setHasMatchedHighlight] = useState(false);
  const proseRef = useRef(null);

  const scrollToHighlightedPassage = () => {
    if (!proseRef.current) return;
    const el = proseRef.current.querySelector('.tafseer-codex-highlight-block');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    trackEvent('tafseer_language_changed', {
      scholar: activeCommentary?.id,
      language: lang,
      surah: surah,
      ayah: ayah
    });
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${lang}`);
    }
  };

  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === 'undefined') return;
      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash === 'en' || hash === 'ar') {
          setLanguage(hash);
        }
      }
      const params = new URLSearchParams(window.location.search);
      const hlEn = params.get('hl_en') || '';
      const hlAr = params.get('hl_ar') || '';
      setHlParams({ hlEn, hlAr, searchStr: window.location.search || '' });
    };

    syncFromUrl();
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', syncFromUrl);
      return () => window.removeEventListener('hashchange', syncFromUrl);
    }
  }, []);

  useEffect(() => {
    if (!proseRef.current) return;
    const blocks = Array.from(proseRef.current.querySelectorAll('p, li, blockquote'));
    blocks.forEach((b) => b.classList.remove('tafseer-codex-highlight-block'));

    const rawTarget = language === 'ar' ? hlParams.hlAr : hlParams.hlEn;
    const normTarget = normalizeForMatch(rawTarget);
    if (!normTarget || normTarget.length < 6) {
      setHasMatchedHighlight(false);
      return;
    }

    const targetWords = normTarget.split(' ').filter(Boolean);
    let bestBlocks = [];

    // 1. Direct normalized substring or 6-word sliding window match
    const windowSize = Math.min(6, targetWords.length);
    const windows = [];
    for (let i = 0; i <= targetWords.length - windowSize; i++) {
      windows.push(targetWords.slice(i, i + windowSize).join(' '));
    }

    for (const block of blocks) {
      const normBlock = normalizeForMatch(block.textContent || '');
      if (!normBlock) continue;
      if (normBlock.includes(normTarget) || (normBlock.length > 30 && normTarget.includes(normBlock))) {
        bestBlocks.push(block);
      } else if (windows.length > 0 && windows.some((w) => w.length >= 14 && normBlock.includes(w))) {
        bestBlocks.push(block);
      }
    }

    // 2. Fallback: highest token overlap if no exact window matched
    if (bestBlocks.length === 0 && targetWords.length >= 3) {
      let bestScore = 0;
      let bestCandidate = null;
      for (const block of blocks) {
        const normBlock = normalizeForMatch(block.textContent || '');
        if (!normBlock) continue;
        let hits = 0;
        for (const w of targetWords) {
          if (w.length > 2 && normBlock.includes(w)) hits++;
        }
        const score = hits / targetWords.length;
        if (score > bestScore && score >= 0.55) {
          bestScore = score;
          bestCandidate = block;
        }
      }
      if (bestCandidate) bestBlocks = [bestCandidate];
    }

    if (bestBlocks.length > 0) {
      bestBlocks.forEach((b) => b.classList.add('tafseer-codex-highlight-block'));
      setHasMatchedHighlight(true);
      const timerId = setTimeout(() => {
        bestBlocks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
      return () => clearTimeout(timerId);
    } else {
      setHasMatchedHighlight(false);
    }
  }, [language, activeCommentary?.id, hlParams.hlEn, hlParams.hlAr]);

  if (!activeCommentary) return null;

  const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;

  const authorityLead = activeCommentary.authority?.lead;
  const authorityDetail = activeCommentary.authority?.detail;
  const exegesisContent = language === 'ar' ? activeCommentary.formattedArabicContent : activeCommentary.formattedContent;
  const hasContent = !!exegesisContent;
  const source = activeCommentary.sources?.[language] || activeCommentary.sources?.['ar'] || activeCommentary.sources?.['en'];

  return (
    <div className="tafseer-apple-container">
      <div className="tafseer-header-controls">
        {scholarMenu.length > 1 ? (
          <ScrollableTrack containerClass="tafseer-segmented-track" activeTrigger={activeCommentary.id}>
            {scholarMenu.map((comm) => {
              const isActive = comm.id === activeCommentary.id;
              return (
                <a 
                  key={comm.id}
                  href={`${base}/quran/${surah}/${ayah}/tafsir/${comm.id}${hlParams.searchStr}#${language}`}
                  className={`tafseer-segment-btn ${isActive ? 'is-active' : ''}`}
                  role="tab"
                  aria-selected={isActive}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span className="tafseer-segment-label">{comm.title}</span>
                </a>
              );
            })}
          </ScrollableTrack>
        ) : (
          <div className="tafseer-single-title">
             {scholarMenu[0]?.title || "Tafsir"}
          </div>
        )}

        <div className="tafseer-lang-toggle">
          <button 
            type="button" 
            className={`tafseer-lang-btn ${language === 'en' ? 'is-active' : ''}`}
            onClick={() => handleLanguageChange('en')}
          >
            English
          </button>
          <button 
            type="button" 
            className={`tafseer-lang-btn ${language === 'ar' ? 'is-active' : ''}`}
            onClick={() => handleLanguageChange('ar')}
          >
            العربية
          </button>
        </div>
      </div>

      <div className="tafseer-card">
        <div className="tafseer-card-meta-bar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <span className="tafseer-meta-era">
            {language === 'ar' ? (activeCommentary.era_arabic || activeCommentary.era) : activeCommentary.era}
          </span>
          {source && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tafseer-source-link-btn"
              title={language === 'ar' ? 'عرض النص من المصدر الأصلي' : 'View verified source edition'}
            >
              <span>{source.label}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        <div className="tafseer-card-body">
          {hasMatchedHighlight && (
            <div className="tafseer-codex-jump-banner" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <span className="tafseer-codex-jump-label">
                {language === 'ar'
                  ? 'تم تمييز الفقرة الخاصة بقراءة ومصحف الصحابي أدناه'
                  : 'Companion Codex attestation highlighted in the commentary below'}
              </span>
              <button
                type="button"
                className="tafseer-codex-jump-btn"
                onClick={scrollToHighlightedPassage}
              >
                {language === 'ar' ? 'انتقل إلى الموضع ↓' : 'Jump to Passage ↓'}
              </button>
            </div>
          )}
          {hasContent ? (
            <div
              ref={proseRef}
              className="tafseer-exegesis-prose ct-answer-body"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={{ __html: exegesisContent }}
            />
          ) : (
            <div className="tafseer-exegesis-prose" style={{ fontStyle: 'italic', opacity: 0.6 }}>
              Translation not available for this passage.
            </div>
          )}

          {activeCommentary.translationNote && language === 'en' && hasContent && (
            <div className="tafseer-ai-translation-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
              <span>{activeCommentary.translationNote}</span>
            </div>
          )}
        </div>

        {(authorityLead || authorityDetail) && (
          <div className="tafseer-authority-callout">
            <div className="tafseer-authority-header">
              <div className="tafseer-authority-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>HISTORICAL CONTEXT & SCHOLARLY AUTHORITY</span>
              </div>
            </div>
            <div className="tafseer-authority-content">
              {authorityLead && (
                <p className="tafseer-authority-lead">{authorityLead}</p>
              )}
              {authorityDetail && (
                <p className="tafseer-authority-detail">{authorityDetail}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
