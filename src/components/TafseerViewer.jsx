import React, { useState } from 'react';
import ScrollableTrack from './ScrollableTrack.jsx';
import '../styles/tafseer.css';

export default function TafseerViewer({ commentaries, surah, ayah }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!commentaries || commentaries.length === 0) return null;

  return (
    <div className="tafseer-apple-container">
      {/* 1. Apple-Style Segmented Control for Tafseers */}
      {commentaries.length > 1 && (
        <div className="tafseer-nav-wrapper">
          <ScrollableTrack containerClass="tafseer-segmented-track" activeTrigger={activeIndex.toString()}>
            {commentaries.map((comm, idx) => {
              const isActive = idx === activeIndex;
              const titleText = comm.title || comm.name || "Tafsir";

              return (
                <button
                  key={comm.id || idx}
                  type="button"
                  className={`tafseer-segment-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                  role="tab"
                  aria-selected={isActive}
                >
                  <span className="tafseer-segment-label">{titleText}</span>
                </button>
              );
            })}
          </ScrollableTrack>
        </div>
      )}

      {/* 2. Primary Commentary Card Window */}
      {commentaries.map((comm, idx) => {
        const isActive = idx === activeIndex;
        const cleanTitle = comm.name || comm.title || 'Tafsir';
        const authorityLead = comm.authority?.lead;
        const authorityDetail = comm.authority?.detail;

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
                <details className="tafseer-scripture-context">
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
              <div
                className="tafseer-exegesis-prose ct-answer-body"
                dangerouslySetInnerHTML={{ __html: comm.formattedContent }}
              />

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
