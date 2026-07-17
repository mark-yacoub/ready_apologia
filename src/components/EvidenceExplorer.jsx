import React, { useState, useEffect, useMemo } from 'react';
import booksMeta from '../data/books_meta.json';
import { getEvidenceColor } from '../utils/evidenceColors.js';
import ScrollableTrack from './ScrollableTrack.jsx';
import { trackEvidenceInteraction } from '../utils/analytics.js';
import { EVIDENCE_TAXONOMY } from '../data/evidenceTaxonomy.js';
import '../styles/EvidenceExplorer.css';

const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;

// ----------------------------------------------------
// UI Icons & Helpers
// ----------------------------------------------------
import { VerseItem, InfoIcon } from './common/VerseItem.jsx';
import { EvidenceDropdown } from './common/EvidenceDropdown.jsx';

import { Chevron } from './evidence/Chevron.jsx';
import { SourceBlock } from './evidence/SourceBlock.jsx';
import { ProphecyCard } from './evidence/ProphecyCard.jsx';

import { VerseGroup } from './evidence/VerseGroup.jsx';
import { formatBookName } from '../utils/evidenceHelpers.js';
import {
  getTestamentCount,
  getAnfCount,
  getCenturyCount,
  getSourceCount,
  getAncientJudaismCount,
  getEvidenceTotalCount
} from '../utils/evidenceCounters.js';


// ----------------------------------------------------
// ----------------------------------------------------
// Prophecies Dedicated View
// ----------------------------------------------------
const PropheciesDedicatedView = ({ prophecies, verseTexts, evidenceId }) => {
  const [activeTab, setActiveTab] = useState('Category');
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = [...new Set(prophecies.map(p => p.category).filter(Boolean))];

  // Group by book
  const booksMap = new Map();
  prophecies.forEach(p => {
    const otBookId = p.ot_verses?.[0]?.split('_')[0];
    if (otBookId) {
      if (!booksMap.has(otBookId)) booksMap.set(otBookId, []);
      booksMap.get(otBookId).push(p);
    }
  });

  const bookIds = Array.from(booksMap.keys()).sort((a, b) => {
    const idxA = booksMeta.ot.findIndex(x => x.id === a);
    const idxB = booksMeta.ot.findIndex(x => x.id === b);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });

  const availableFilters = activeTab === 'Category'
    ? [{ id: 'All', label: `All (${prophecies.length})` }, ...categories.map(c => ({ id: c, label: `${c} (${prophecies.filter(p => p.category === c).length})` }))]
    : [{ id: 'All', label: `All (${prophecies.length})` }, ...bookIds.map(b => ({ id: b, label: `${formatBookName(b)} (${booksMap.get(b).length})` }))];

  const filteredProphecies = activeTab === 'Category'
    ? prophecies.filter(p => activeFilter === 'All' || p.category === activeFilter)
    : prophecies.filter(p => {
        if (activeFilter === 'All') return true;
        const otBookId = p.ot_verses?.[0]?.split('_')[0];
        return otBookId === activeFilter;
      });

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

// ----------------------------------------------------
// Dedicated Evidence View (No Accordions)
// ----------------------------------------------------
const DedicatedEvidenceView = ({ evidenceObj, verseTexts }) => {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash;
      if (h === '#ot') return 'Old Testament';
      if (h === '#early-church' || h === '#pre-nicene-writings' || h === '#fathers') return 'Fathers';
      if (h === '#ancient-judaism' || h === '#judaism') return 'Ancient Judaism';
    }
    return 'New Testament';
  });
  const [activeFilter, setActiveFilter] = useState('All');

  const ntCount = getTestamentCount(evidenceObj.Scripture?.['New Testament']);
  const otCount = getTestamentCount(evidenceObj.Scripture?.['Old Testament']);
  const anfCount = getAnfCount(evidenceObj['Ante-Nicene Fathers']);
  const ajCount = getAncientJudaismCount(evidenceObj['Ancient Judaism']);

  const handleTabChange = (tab, hash) => {
    setActiveTab(tab);
    setActiveFilter('All');
    if (typeof window !== 'undefined' && hash) {
      window.history.replaceState(null, '', `#${hash}`);
    }
  };

  const renderScriptureFeed = (testament) => {
    const tData = evidenceObj.Scripture?.[testament];
    if (!tData || !tData.structure) return <div className="empty-state">No {testament} data available.</div>;

    const categories = tData.structure;
    const verseBank = tData.verse_bank || {};
    const totalTestamentCount = testament === 'New Testament' ? ntCount : otCount;

    const availableFilters = [
      { id: 'All', label: `All (${totalTestamentCount})` },
      ...categories.map((c, idx) => {
        const title = c?.title || (categories.length === 1 ? 'General Evidence' : `Category ${idx + 1}`);
        return { id: title, label: `${title} (${c?.verses?.length || 0})` };
      })
    ];

    const feedContent = categories
      .map((cat, idx) => ({ cat, title: cat?.title || (categories.length === 1 ? 'General Evidence' : `Category ${idx + 1}`) }))
      .filter(item => activeFilter === 'All' || activeFilter === item.title)
      .map(({ cat, title }) => (
        <div key={title} className="feed-category-block animate-fade-in">
          <h2 className="feed-category-title">{title} <span className="item-count">({cat?.verses?.length || 0})</span></h2>
          <VerseGroup verses={cat?.verses || []} verseBank={verseBank} verseTexts={verseTexts} evidenceId={evidenceObj._id} testamentName={testament} />
        </div>
      ));

    return (
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
        <div className="feed-content-area">
          {feedContent}
        </div>
      </div>
    );
  };

  const renderFathersFeed = () => {
    const anfData = evidenceObj['Ante-Nicene Fathers'];
    if (!anfData) return <div className="empty-state">No Patristic data available.</div>;
    const centuries = Object.keys(anfData);

    const availableFilters = [
      { id: 'All', label: `All (${anfCount})` },
      ...centuries.map(c => ({ id: c, label: `${c} (${getCenturyCount(anfData[c])})` }))
    ];

    const feedContent = centuries
      .filter(c => activeFilter === 'All' || activeFilter === c)
      .map(century => {
        const fathers = anfData[century];
        const centCount = getCenturyCount(fathers);
        return (
          <div key={century} className="feed-category-block animate-fade-in">
            <h2 className="feed-category-title">{century} <span className="item-count">({centCount})</span></h2>
            <div className="fathers-grid">
              {Object.keys(fathers || {}).map(fatherName => {
                const fData = fathers[fatherName];
                return (
                  <SourceBlock key={fatherName} sourceName={fatherName} sData={fData} />
                );
              })}
            </div>
          </div>
        );
      });

    return (
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
        <div className="feed-content-area">
          {feedContent}
        </div>
      </div>
    );
  };

  const renderAncientJudaismFeed = () => {
    const ajData = evidenceObj['Ancient Judaism'];
    if (!ajData) return <div className="empty-state">No Ancient Judaism data available.</div>;
    const eras = Object.keys(ajData);

    const availableFilters = [
      { id: 'All', label: `All (${ajCount})` },
      ...eras.map(e => ({ id: e, label: `${e} (${getCenturyCount(ajData[e])})` }))
    ];

    const feedContent = eras
      .filter(e => activeFilter === 'All' || activeFilter === e)
      .map(era => {
        const authors = ajData[era];
        const eraCount = getCenturyCount(authors);
        return (
          <div key={era} className="feed-category-block animate-fade-in">
            <h2 className="feed-category-title">{era} <span className="item-count">({eraCount})</span></h2>
            <div className="fathers-grid">
              {Object.keys(authors || {}).map(authorName => {
                const aData = authors[authorName];
                return (
                  <SourceBlock key={authorName} sourceName={authorName} sData={aData} />
                );
              })}
            </div>
          </div>
        );
      });

    return (
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
        <div className="feed-content-area">
          {feedContent}
        </div>
      </div>
    );
  };

  return (
    <div className="dedicated-evidence-view">
      <ScrollableTrack containerClass="master-tabs-container" activeTrigger={activeTab}>
        <button id="nt" className={`master-tab ${activeTab === 'New Testament' ? 'active' : ''}`} onClick={() => handleTabChange('New Testament', 'nt')}>
          New Testament <span className="tab-count">({ntCount})</span>
        </button>
        <button id="ot" className={`master-tab ${activeTab === 'Old Testament' ? 'active' : ''}`} onClick={() => handleTabChange('Old Testament', 'ot')}>
          Old Testament <span className="tab-count">({otCount})</span>
        </button>
        <button id="early-church" className={`master-tab ${activeTab === 'Fathers' ? 'active' : ''}`} onClick={() => handleTabChange('Fathers', 'early-church')}>
          Pre-Nicene Writings <span className="tab-count">({anfCount})</span>
        </button>
        {ajCount > 0 && (
          <button id="ancient-judaism" className={`master-tab ${activeTab === 'Ancient Judaism' ? 'active' : ''}`} onClick={() => handleTabChange('Ancient Judaism', 'ancient-judaism')}>
            Ancient Judaism <span className="tab-count">({ajCount})</span>
          </button>
        )}
      </ScrollableTrack>
      <div className="master-tab-content">
        {activeTab === 'New Testament' && renderScriptureFeed('New Testament')}
        {activeTab === 'Old Testament' && renderScriptureFeed('Old Testament')}
        {activeTab === 'Fathers' && renderFathersFeed()}
        {activeTab === 'Ancient Judaism' && renderAncientJudaismFeed()}
      </div>
    </div>
  );
};


const AuthorshipDedicatedView = ({ tData }) => {
  const [activeBook, setActiveBook] = useState(null);
  const [activeCentury, setActiveCentury] = useState('All');

  const authorship = tData.authorship_data || {};
  const books = Object.keys(authorship);
  
  // Set initial active book once books are loaded
  useEffect(() => {
    if (books.length > 0 && !activeBook) {
      setActiveBook(books[0]);
    }
  }, [books, activeBook]);

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
            onClick={() => { setActiveBook(b); setActiveCentury('All'); }}
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


export default function EvidenceExplorer({ evidence = [], initialEvidenceId = null }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [activeHighlightEvidence, setActiveHighlightEvidence] = useState([]);
  const isDedicatedPage = Boolean(initialEvidenceId);

  const toggleHighlight = (tId) => {
    let active = [];
    try {
      const parsed = JSON.parse(localStorage.getItem('activeEvidence') || '[]');
      active = Array.isArray(parsed) ? parsed : [];
    } catch(e) {}

    // Legacy support
    const legacyEvidence = localStorage.getItem('activeEvidence');
    if (legacyEvidence && !active.length) {
      active = [legacyEvidence];
      localStorage.removeItem('activeEvidence');
    }

    if (active.includes(tId)) {
      active = active.filter(id => id !== tId);
    } else {
      active.push(tId);
    }

    localStorage.setItem('activeEvidence', JSON.stringify(active));
    setActiveHighlightEvidence(active);
  };

  useEffect(() => {
    const syncActive = () => {
      if (typeof window !== 'undefined') {
        let active = [];
        try {
          const parsed = JSON.parse(localStorage.getItem('activeEvidence') || '[]');
          active = Array.isArray(parsed) ? parsed : [];
        } catch(e) {}

        const legacyEvidence = localStorage.getItem('activeEvidence');
        if (legacyEvidence && !active.length) {
          active = [legacyEvidence];
          localStorage.setItem('activeEvidence', JSON.stringify(active));
          localStorage.removeItem('activeEvidence');
        }

        setActiveHighlightEvidence(active);
      }
    };
    syncActive();
    window.addEventListener('storage', syncActive);
    window.addEventListener('pageshow', syncActive);
    document.addEventListener('astro:after-swap', syncActive);
    document.addEventListener('astro:page-load', syncActive);
    return () => {
      window.removeEventListener('storage', syncActive);
      window.removeEventListener('pageshow', syncActive);
      document.removeEventListener('astro:after-swap', syncActive);
      document.removeEventListener('astro:page-load', syncActive);
    };
  }, []);

  // Fast O(1) Evidence Lookup Map
  const evidenceMap = useMemo(() => {
    return new Map(evidence.map(t => [t.evidenceId, t]));
  }, [evidence]);

  // Compute Categorized Sections with Orphan Safety Net
  const categorizedSections = useMemo(() => {
    const mappedIds = new Set();

    const sections = EVIDENCE_TAXONOMY.map(section => {
      const subHeadings = section.subHeadings
        .map(sub => {
          const items = sub.evidence
            .map(id => {
              mappedIds.add(id);
              return evidenceMap.get(id);
            })
            .filter(Boolean);

          return { ...sub, items };
        })
        .filter(sub => sub.items.length > 0);

      return { ...section, subHeadings };
    }).filter(section => section.subHeadings.length > 0);

    // Safety net: Collect unmapped evidence if any exist
    const unmappedEvidence = evidence.filter(t => !mappedIds.has(t.evidenceId));
    if (unmappedEvidence.length > 0) {
      sections.push({
        mainHeading: 'General Evidence',
        subHeadings: [
          {
            title: 'Other',
            items: unmappedEvidence
          }
        ]
      });
    }

    return sections;
  }, [evidence, evidenceMap]);

  const displayEvidence = isDedicatedPage ? [evidenceMap.get(initialEvidenceId)].filter(Boolean) : evidence;

  // Pre-calculate titles and comprehensive counts for dropdown
  const evidenceOptions = evidence.map(t => {
    return {
      id: t.evidenceId,
      title: t.evidenceData?.name || t.evidenceData?.Scripture?.['New Testament']?.title?.replace('New Testament ', '') || t.evidenceId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: getEvidenceTotalCount(t)
    };
  });

  const currentEvidenceOption = evidenceOptions.find(t => t.id === initialEvidenceId) || {};
  const filteredEvidenceOptions = evidenceOptions.filter(t => t.title.toLowerCase().includes(evidenceSearch.toLowerCase()));

  return (
    <div className="evidence-explorer select-none">
      {!isDedicatedPage && (
        <header className="explorer-header">
          <h1 className="explorer-title">Apologetics Evidence</h1>
          <p className="explorer-subtitle">Curated collections of Scripture and early Church testimonies defending core doctrines.</p>
        </header>
      )}

      {isDedicatedPage && (
        <div className="ios-nav-container">
          <a href={`${base}/evidence`} className="ios-nav-back" title="All Evidence">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>All Evidence</span>
          </a>
        </div>
      )}

      {isDedicatedPage ? (
        <div className="dedicated-evidence-wrapper" onClick={() => setDropdownOpen(false)}>
          {displayEvidence.map(t => {
            const tId = t.evidenceId;
            const tData = t.evidenceData;
            const tTitle = tData.name || tData.Scripture?.['New Testament']?.title?.replace('New Testament ', '') || tId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const evidenceColor = getEvidenceColor(tId);

            return (
              <div
                key={tId}
                className="dedicated-evidence-view-container animate-fade-in"
                style={{ '--evidence-color': evidenceColor.hex, '--evidence-bg': evidenceColor.bgHex }}
              >
                <header className="dedicated-hero-header">
                  <EvidenceDropdown
                    tTitle={tTitle}
                    currentEvidenceId={initialEvidenceId}
                    evidenceOptions={evidenceOptions}
                    dropdownOpen={dropdownOpen}
                    setDropdownOpen={setDropdownOpen}
                    base={base}
                  />
                  {tData.hideHighlightButton ? null : (
                    <div className="hero-top-row">
                      <button
                        className={`ios-compact-toggle ${activeHighlightEvidence.includes(tId) ? 'is-active' : ''}`}
                        onClick={() => toggleHighlight(tId)}
                        aria-pressed={activeHighlightEvidence.includes(tId)}
                        title="Toggle Scripture Highlighting"
                      >
                        <span className="ios-toggle-track">
                          <span className="ios-toggle-knob"></span>
                        </span>
                        <span className="compact-toggle-text">Highlight in Scripture</span>
                      </button>
                    </div>
                  )}
                </header>
                {tData.prophecies ? (
                  <PropheciesDedicatedView prophecies={tData.prophecies} verseTexts={t.verseTexts} evidenceId={tId} />
                ) : tData.authorship_data ? (
                  <AuthorshipDedicatedView tData={tData} />
                ) : (
                  <DedicatedEvidenceView evidenceObj={{ ...tData, _id: tId }} verseTexts={t.verseTexts} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="evidence-index-layout" onClick={() => setDropdownOpen(false)}>
          {categorizedSections.map(classification => (
            <section key={classification.mainHeading} className="main-heading-section">
              <h2 className="main-heading-title">{classification.mainHeading}</h2>
              {classification.subHeadings.map(subGroup => (
                <div key={subGroup.title} className="sub-heading-section">
                  <h3 className="sub-heading-title"><span>{subGroup.title}</span></h3>
                  <div className="evidence-accordion-list">
                    {subGroup.items.map(t => {
                      const tId = t.evidenceId;
                      const tData = t.evidenceData;
                      const tTitle = tData.name || tData.Scripture?.['New Testament']?.title?.replace('New Testament ', '') || tId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      const evidenceColor = getEvidenceColor(tId);
                      const isHighlighted = activeHighlightEvidence.includes(tId);

                      const headerContent = (
                        <div className="evidence-card-inner-flex">
                          <div className="header-text-block">
                            <h4 className="evidence-main-heading">{tTitle}</h4>
                          </div>
                          <div className="header-controls">
                            {(!tData.hideHighlightButton && tId !== 'quranic_deficiencies' && tId !== 'scientific_errors') && (
                              <button
                                className={`ios-compact-toggle card-toggle ${isHighlighted ? 'is-active' : ''}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleHighlight(tId);
                                }}
                                title="Toggle Scripture Highlighting"
                                aria-pressed={isHighlighted}
                              >
                                <span className="ios-toggle-track">
                                  <span className="ios-toggle-knob"></span>
                                </span>
                                <span className="compact-toggle-text">Highlight in Scripture</span>
                              </button>
                            )}
                            <div className="explore-badge-btn">
                              Explore
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </div>
                          </div>
                        </div>
                      );

                      return (
                        <div
                          key={tId}
                          className="master-evidence-box"
                          id={tId}
                          style={{ '--evidence-color': evidenceColor.hex, '--evidence-bg': evidenceColor.bgHex }}
                        >
                          <a href={`${base}/evidence/${tId}`} className="evidence-header-box is-link">
                            {headerContent}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      
        
    </div>
  );
}
