import React, { useState, useEffect, useMemo } from 'react';
import ScrollableTrack from '../../ScrollableTrack.jsx';
import { SourceBlock } from '../SourceBlock.jsx';

export const AuthorshipDedicatedView = ({ tData }) => {
  const authorship = tData.authorship_data || {};
  const books = useMemo(() => Object.keys(authorship), [authorship]);

  const [activeBook, setActiveBook] = useState(() => {
    const defaultBook = books[0] || null;
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashBook = decodeURIComponent(window.location.hash.substring(1));
      const match = books.find(k => k.replace(/\s+/g, '_') === hashBook || k === hashBook);
      if (match) {
        return match;
      }
    }
    return defaultBook;
  });

  const [activeCentury, setActiveCentury] = useState('All');
  const handleBookChange = (b) => {
    setActiveBook(b);
    setActiveCentury('All');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${encodeURIComponent(b.replace(/\s+/g, '_'))}`);
    }
  };

  if (!activeBook || !authorship[activeBook]) return null;

  const bookData = authorship[activeBook];
  const centuries = Object.keys(bookData);

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
            {b}
          </button>
        ))}
      </ScrollableTrack>
      <div className="scripture-feed-container">
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
