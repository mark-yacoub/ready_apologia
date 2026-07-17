import React, { useState } from 'react';
import booksMeta from '../../data/books_meta.json';
import { trackEvidenceInteraction } from '../../utils/analytics.js';

const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;

export const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"></circle>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01"></path>
  </svg>
);

const formatBookName = (bookId) => {
  const ntBook = booksMeta.nt.find(b => b.id === bookId);
  if (ntBook) return ntBook.name;
  const otBook = booksMeta.ot.find(b => b.id === bookId);
  if (otBook) return otBook.name;
  return bookId.charAt(0).toUpperCase() + bookId.slice(1);
};

export const VerseItem = ({ vId, text, note, evidenceId, categoryTitle = null, isQuran = false }) => {
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  let refStr = '';
  let linkTarget = '';

  if (isQuran) {
    const parts = vId.split(':');
    const surahNum = parts[0];
    const verseNum = parts[1];
    refStr = `Quran ${surahNum}:${verseNum}`;
    linkTarget = `${base}/quran/${surahNum}#${verseNum}`;
  } else {
    const parts = vId.split('_');
    const bookId = parts[0];
    const chapterNum = parts[1];
    const verseNumStr = parts.slice(2).join('_');
    const bookName = formatBookName(bookId);
    refStr = `${bookName} ${chapterNum}:${verseNumStr}`;
    linkTarget = `${base}/bible/${bookId}/${chapterNum}#${verseNumStr}`;
  }

  const handleCardClick = (e) => {
    if (e.target.closest('.evidence-note-btn')) return;
    window.location.href = linkTarget;
  };

  return (
    <div
      className="clean-verse-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e);
        }
      }}
    >
      <div className="verse-card-header">
        <div className="verse-header-left">
          <a
            href={linkTarget}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="verse-ref-link"
          >
            <span className="verse-ref-pill">{refStr} <span className="ref-arrow">&gt;</span></span>
          </a>
          {categoryTitle && (
            <span className="verse-cat-tag">↳ {categoryTitle}</span>
          )}
        </div>
        {note && (
          <button
            className={`evidence-note-btn ${isNoteOpen ? 'active' : ''}`}
            onClick={(e) => { 
              e.stopPropagation(); 
              const nextState = !isNoteOpen;
              setIsNoteOpen(nextState); 
              if (nextState) {
                trackEvidenceInteraction({ evidenceId, action: 'note_opened', verseRef: refStr });
              }
            }}
            aria-label="Toggle commentary note"
            title="View commentary note"
            type="button"
          >
            <InfoIcon />
            <span>Note</span>
          </button>
        )}
      </div>
      <p className="verse-card-text">{text}</p>
      {note && isNoteOpen && (
        <div className="verse-note-tooltip animate-fade-in" onClick={e => e.stopPropagation()}>
          {note}
        </div>
      )}
    </div>
  );
};
