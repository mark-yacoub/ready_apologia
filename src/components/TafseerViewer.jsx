import React, { useState, useEffect } from 'react';
import ScrollableTrack from './ScrollableTrack.jsx';
import { trackEvent } from '../utils/analytics.js';
import '../styles/tafseer.css';

export default function TafseerViewer({ commentaries, surah, ayah }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [language, setLanguage] = useState('en');

  // Synchronize initial state from URL hash and listen for Back/Forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const parts = hash.split('-');
        if (parts.length >= 2) {
          const lang = parts.pop(); 
          const parsedId = parts.join('-');
          
          if (lang === 'en' || lang === 'ar') {
            setLanguage(lang);
          }
          
          const internalId = parsedId === 'kathir' ? 'ibn_kathir' : parsedId;
          const foundIdx = commentaries.findIndex(c => c.id === internalId);
          
          if (foundIdx !== -1) {
            setActiveIndex(foundIdx);
          }
        }
      }
    };

    handleHashChange(); // Run on initial mount
    
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, [commentaries]);

  // Reflect state changes into Browser History (pushState for native Back button support)
  useEffect(() => {
    if (typeof window !== 'undefined' && commentaries && commentaries.length > 0) {
      const internalId = commentaries[activeIndex]?.id;
      if (internalId) {
        const hashId = internalId === 'ibn_kathir' ? 'kathir' : internalId;
        const targetHash = `#${hashId}-${language}`;
        
        if (window.location.hash !== targetHash) {
          window.history.pushState(null, '', targetHash);
        }
      }
    }
  }, [activeIndex, language, commentaries]);

  const handleTafseerChange = (idx) => {
    setActiveIndex(idx);
    const comm = commentaries[idx];
    if (comm) {
      trackEvent('tafseer_scholar_changed', {
        scholar: comm.id,
        surah: surah,
        ayah: ayah
      });
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const commId = commentaries[activeIndex]?.id;
    trackEvent('tafseer_language_changed', {
      scholar: commId,
      language: lang,
      surah: surah,
      ayah: ayah
    });
  };

  if (!commentaries || commentaries.length === 0) return null;

  return (
    <div className="tafseer-apple-container">
      {/* 1. Header controls (Segmented Control & Language Toggle) */}
      <div className="tafseer-header-controls">
        {commentaries.length > 1 ? (
          <ScrollableTrack containerClass="tafseer-segmented-track" activeTrigger={activeIndex.toString()}>
            {commentaries.map((comm, idx) => {
              const isActive = idx === activeIndex;
              const titleText = comm.title || comm.name || "Tafsir";

              return (
                <button
                  key={comm.id || idx}
                  type="button"
                  className={`tafseer-segment-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleTafseerChange(idx)}
                  role="tab"
                  aria-selected={isActive}
                >
                  <span className="tafseer-segment-label">{titleText}</span>
                </button>
              );
            })}
          </ScrollableTrack>
        ) : (
          <div className="tafseer-single-title">
             {commentaries[0].title || commentaries[0].name || "Tafsir"}
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

      {/* 2. Primary Commentary Card Window */}
      {commentaries.map((comm, idx) => {
        const isActive = idx === activeIndex;
        // Use Arabic title if language is 'ar' and available
        const cleanTitle = (language === 'ar' && comm.title_arabic) 
                             ? comm.title_arabic 
                             : (comm.title || comm.name || 'Tafsir');

        const authorityLead = comm.authority?.lead;
        const authorityDetail = comm.authority?.detail;
        
        // Pick the selected content
        const exegesisContent = language === 'ar' ? comm.formattedArabicContent : comm.formattedContent;
        // Check if content exists
        const hasContent = !!exegesisContent;

        return (
          <div
            key={comm.id || idx}
            className="tafseer-card"
            style={{ display: isActive ? 'block' : 'none' }}
          >
            {/* Card Content Body */}
            <div className="tafseer-card-body">
              {/* Optional Full Scripture Context Dropdown (shown only for multi-verse spans) */}
              {comm.rangeVerses && comm.rangeVerses.length > 1 && (
                <details 
                  className="tafseer-scripture-context"
                  onToggle={(e) => {
                    if (e.target.open) {
                      trackEvent('tafseer_context_expanded', {
                        scholar: comm.id,
                        verse_range: comm.verse_range,
                        surah: surah,
                        ayah: ayah
                      });
                    }
                  }}
                >
                  <summary className="tafseer-context-summary">
                    <span className="tafseer-summary-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      <span>Full Scripture Context ({comm.verse_range}) — {comm.rangeVerses.length} Verses</span>
                    </span>
                    <svg className="tafseer-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>

                  <div className="tafseer-context-verses-grid">
                    {comm.rangeVerses.map((rv, rIdx) => (
                      <div className="tafseer-context-row" key={rIdx}>
                        <span className="tafseer-verse-num">Ayah {rv.number}</span>
                        {rv.arabic && (
                          <p className="tafseer-context-arabic" dangerouslySetInnerHTML={{ __html: rv.arabic }} />
                        )}
                        {rv.english && (
                          <p className="tafseer-context-english" dangerouslySetInnerHTML={{ __html: rv.english }} />
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Main Exegesis Text Content */}
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

              {/* Subtle AI Translation Note */}
              {comm.aiTranslated && language === 'en' && hasContent && (
                <div className="tafseer-ai-translation-note">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
                  <span>Translation generated by Gemini 3.1 Pro using Tafsir Ibn Kathir and Droge's English translation as templates.</span>
                </div>
              )}

              {/* Source Volume Footnote */}
              {comm.source_volume_page && (
                <div className="tafseer-source-footer">
                  <span>Source Reference:</span> <em>{cleanTitle} ({comm.source_volume_page})</em>
                </div>
              )}
            </div>

            {/* 3. Always-Expanded Declarative Scholarly Authority Banner */}
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
        );
      })}
    </div>
  );
}
