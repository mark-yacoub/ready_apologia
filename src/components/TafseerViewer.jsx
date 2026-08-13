import React, { useState, useEffect } from 'react';
import ScrollableTrack from './ScrollableTrack.jsx';
import { trackEvent } from '../utils/analytics.js';
import '../styles/tafseer.css';

export default function TafseerViewer({ activeCommentary, scholarMenu = [], surah = '', ayah = '' }) {
  const [language, setLanguage] = useState('en');

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    trackEvent('tafseer_language_changed', {
      scholar: activeCommentary?.id,
      language: lang,
      surah: surah,
      ayah: ayah
    });
    if (typeof window !== 'undefined') {
      window.location.hash = lang;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash === 'en' || hash === 'ar') {
          setLanguage(hash);
        }
      }
    };

    handleHashChange();
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

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
                  href={`${base}/quran/${surah}/${ayah}/tafsir/${comm.id}#${language}`}
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
          {hasContent ? (
            <div
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
