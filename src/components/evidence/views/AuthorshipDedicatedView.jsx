import React, { useState, useEffect, useMemo } from 'react';
import ScrollableTrack from '../../ScrollableTrack.jsx';
import { SourceBlock } from '../SourceBlock.jsx';
import { getBookCenturies, CANON_LISTS_BOOK_ID } from '../../../utils/evidenceCounters.js';
import { replaceUrl } from '../../../utils/url_history.js';

const toHash = (bookTitle) => bookTitle.replace(/\s+/g, '_');

const getBookMetaLine = (meta) => {
  if (!meta || meta.book_id === CANON_LISTS_BOOK_ID) return null;
  const parts = [
    meta.traditional_author && `Traditional author: ${meta.traditional_author}`,
    meta.composition_date && `Composed ${meta.composition_date}`,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
};

export const AuthorshipDedicatedView = ({ tData }) => {
  const authorship = tData?.authorship_data;
  const books = useMemo(() => Object.keys(authorship || {}), [authorship]);

  // Start from the first book so the server and client render the same markup;
  // the URL hash is applied after hydration.
  const [activeBook, setActiveBook] = useState(books[0] || null);
  const [activeCentury, setActiveCentury] = useState('All');

  useEffect(() => {
    const hashBook = decodeURIComponent(window.location.hash.substring(1));
    const match = hashBook && books.find(b => toHash(b) === hashBook || b === hashBook);
    if (match) setActiveBook(match);
  }, [books]);

  const handleBookChange = (b) => {
    setActiveBook(b);
    setActiveCentury('All');
    replaceUrl(`#${encodeURIComponent(toHash(b))}`);
  };

  const bookEntry = authorship?.[activeBook];
  if (!bookEntry) return null;

  const bookData = getBookCenturies(bookEntry);
  const centuries = Object.keys(bookData);
  const metaLine = getBookMetaLine(bookEntry.book_meta);

  const availableFilters = [
    { id: 'All', label: 'All Centuries' },
    ...centuries.map(c => ({ id: c, label: c }))
  ];

  const feedContent = centuries
    .filter(c => activeCentury === 'All' || activeCentury === c)
    .map(century => {
      const fathers = bookData[century];
      return (
        <div key={century} className="feed-category-block animate-fade-in">
          <h2 className="feed-category-title">{century} <span className="item-count">({Object.keys(fathers).length} sources)</span></h2>
          <div className="fathers-grid">
            {Object.keys(fathers).map(fatherName => (
              <SourceBlock key={fatherName} sourceName={fatherName} sData={fathers[fatherName]} />
            ))}
          </div>
        </div>
      );
    });

  return (
    <div className="dedicated-evidence-view">
      <ScrollableTrack containerClass="master-tabs-container" activeTrigger={activeBook}>
        {books.map(b => (
          <button
            key={b}
            className={`master-tab ${activeBook === b ? 'active' : ''}`}
            onClick={() => handleBookChange(b)}
          >
            {authorship[b].book_meta?.short_name || b}
          </button>
        ))}
      </ScrollableTrack>
      <div className="scripture-feed-container">
        {metaLine && <p className="authorship-book-meta">{metaLine}</p>}
        <div className="feed-controls-bar">
          <div className="pills-scroll-container">
            {availableFilters.map(filter => (
              <button
                key={filter.id}
                className={`filter-pill ${activeCentury === filter.id ? 'active' : ''}`}
                onClick={() => setActiveCentury(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="feed-content-area">
          {feedContent}
        </div>
      </div>
    </div>
  );
};
