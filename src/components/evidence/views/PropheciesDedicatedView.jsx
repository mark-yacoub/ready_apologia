import React, { useState, useMemo } from 'react';
import booksMeta from '../../../data/books_meta.json';
import { formatBookName } from '../../../utils/evidenceHelpers.js';
import { ProphecyCard } from '../ProphecyCard.jsx';

export const PropheciesDedicatedView = ({ prophecies, verseTexts, evidenceId }) => {
  const [activeTab, setActiveTab] = useState('Category');
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = useMemo(() => {
    return [...new Set(prophecies.map(p => p.category).filter(Boolean))];
  }, [prophecies]);

  // Group by book
  const { booksMap, bookIds } = useMemo(() => {
    const map = new Map();
    prophecies.forEach(p => {
      const otBookId = p.ot_verses?.[0]?.split('_')[0];
      if (otBookId) {
        if (!map.has(otBookId)) map.set(otBookId, []);
        map.get(otBookId).push(p);
      }
    });

    const ids = Array.from(map.keys()).sort((a, b) => {
      const idxA = booksMeta.ot.findIndex(x => x.id === a);
      const idxB = booksMeta.ot.findIndex(x => x.id === b);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
    
    return { booksMap: map, bookIds: ids };
  }, [prophecies]);

  const availableFilters = useMemo(() => {
    return activeTab === 'Category'
      ? [{ id: 'All', label: `All (${prophecies.length})` }, ...categories.map(c => ({ id: c, label: `${c} (${prophecies.filter(p => p.category === c).length})` }))]
      : [{ id: 'All', label: `All (${prophecies.length})` }, ...bookIds.map(b => ({ id: b, label: `${formatBookName(b)} (${booksMap.get(b).length})` }))];
  }, [activeTab, categories, bookIds, booksMap, prophecies]);

  const filteredProphecies = useMemo(() => {
    return activeTab === 'Category'
      ? prophecies.filter(p => activeFilter === 'All' || p.category === activeFilter)
      : prophecies.filter(p => {
          if (activeFilter === 'All') return true;
          const otBookId = p.ot_verses?.[0]?.split('_')[0];
          return otBookId === activeFilter;
        });
  }, [activeTab, activeFilter, prophecies]);

  let feedContent = null;
  if (activeTab === 'Category') {
    const groups = categories.filter(c => activeFilter === 'All' || activeFilter === c);
    feedContent = groups.map(c => {
      const items = filteredProphecies.filter(p => p.category === c);
      if (!items.length) return null;
      return (
        <div key={c} className="feed-category-block animate-fade-in">
          <h2 className="feed-category-title">{c} <span className="item-count">({items.length})</span></h2>
          <div className="prophecies-feed-list">
            {items.map((p, idx) => <ProphecyCard key={p.name || idx} prophecy={p} verseTexts={verseTexts} evidenceId={evidenceId} />)}
          </div>
        </div>
      );
    });
  } else {
    const groups = bookIds.filter(b => activeFilter === 'All' || activeFilter === b);
    feedContent = groups.map(b => {
      const items = filteredProphecies.filter(p => p.ot_verses?.[0]?.split('_')[0] === b);
      if (!items.length) return null;
      return (
        <div key={b} className="feed-category-block animate-fade-in">
          <h2 className="feed-category-title">{formatBookName(b)} <span className="item-count">({items.length})</span></h2>
          <div className="prophecies-feed-list">
            {items.map((p, idx) => <ProphecyCard key={p.name || idx} prophecy={p} verseTexts={verseTexts} evidenceId={evidenceId} />)}
          </div>
        </div>
      );
    });
  }

  return (
    <div className="dedicated-evidence-view">
      <div className="master-tabs-container">
        <button className={`master-tab ${activeTab === 'Category' ? 'active' : ''}`} onClick={() => { setActiveTab('Category'); setActiveFilter('All'); }}>
          By Category
        </button>
        <button className={`master-tab ${activeTab === 'Book' ? 'active' : ''}`} onClick={() => { setActiveTab('Book'); setActiveFilter('All'); }}>
          By Book
        </button>
      </div>
      <div className="scripture-feed-container">
        <div className="feed-controls-bar">
          <div className="pills-scroll-container">
            {availableFilters.map(filter => (
              <button
                key={filter.id}
                className={`filter-pill ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="feed-content-area prophecies-feed">
          {feedContent}
        </div>
      </div>
    </div>
  );
};
