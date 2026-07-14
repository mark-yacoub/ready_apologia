import React, { useState, useEffect, useMemo } from 'react';
import booksMeta from '../data/books_meta.json';
import { getTopicColor } from '../utils/topicColors.js';
import ScrollableTrack from './ScrollableTrack.jsx';
import { trackTopicInteraction } from '../utils/analytics.js';
import { TOPICS_TAXONOMY } from '../data/topicsTaxonomy.js';

const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;

// ----------------------------------------------------
// UI Icons & Helpers
// ----------------------------------------------------
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"></circle>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01"></path>
  </svg>
);

const Chevron = ({ open }) => (
  <svg className={`chevron ${open ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const formatBookName = (bookId) => {
  const ntBook = booksMeta.nt.find(b => b.id === bookId);
  if (ntBook) return ntBook.name;
  const otBook = booksMeta.ot.find(b => b.id === bookId);
  if (otBook) return otBook.name;
  return bookId.charAt(0).toUpperCase() + bookId.slice(1);
};

// Sort verses canonically (LXX order for OT, standard NT order)
const sortCanonicalVerses = (verseIds, testamentName) => {
  const metaList = testamentName === 'New Testament' ? booksMeta.nt : booksMeta.ot;
  return [...verseIds].sort((a, b) => {
    const partsA = a.split('_');
    const partsB = b.split('_');
    const bookA = partsA[0];
    const bookB = partsB[0];
    const idxA = metaList.findIndex(x => x.id === bookA);
    const idxB = metaList.findIndex(x => x.id === bookB);
    if (idxA !== idxB) {
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    }
    const chapA = parseInt(partsA[1], 10) || 0;
    const chapB = parseInt(partsB[1], 10) || 0;
    if (chapA !== chapB) return chapA - chapB;
    const vA = parseInt(partsA[2], 10) || 0;
    const vB = parseInt(partsB[2], 10) || 0;
    return vA - vB;
  });
};


// ----------------------------------------------------
// Scripture Verse Card (Clean White Box without left border)
// ----------------------------------------------------
const VerseItem = ({ vId, text, note, topicId, categoryTitle = null }) => {
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const parts = vId.split('_');
  const bookId = parts[0];
  const chapterNum = parts[1];
  const verseNumStr = parts.slice(2).join('_');
  const bookName = formatBookName(bookId);
  const refStr = `${bookName} ${chapterNum}:${verseNumStr}`;

  const handleCardClick = (e) => {
    if (e.target.closest('.topic-note-btn')) return;
    window.location.href = `${base}/bible/${bookId}/${chapterNum}#${verseNumStr}`;
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
            href={`${base}/bible/${bookId}/${chapterNum}#${verseNumStr}`}
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
            className={`topic-note-btn ${isNoteOpen ? 'active' : ''}`}
            onClick={(e) => { 
              e.stopPropagation(); 
              const nextState = !isNoteOpen;
              setIsNoteOpen(nextState); 
              if (nextState) {
                trackTopicInteraction({ topicId, action: 'note_opened', verseRef: refStr });
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

const VerseGroup = ({ verses, verseBank, verseTexts, topicId, testamentName, verseCategories = null }) => {
  const sortedIds = sortCanonicalVerses(verses, testamentName);
  return (
    <div className="verse-group-list">
      {sortedIds.map(vId => (
        <VerseItem
          key={vId}
          vId={vId}
          text={verseTexts[vId] || 'Verse text unavailable'}
          note={verseBank[vId]}
          topicId={topicId}
          categoryTitle={verseCategories ? verseCategories[vId]?.join(', ') : null}
        />
      ))}
    </div>
  );
};



// ----------------------------------------------------
// Master TopicsExplorer Component
// ----------------------------------------------------

// ----------------------------------------------------
// Patristic Father Block (Collapsible)

// ----------------------------------------------------
// Count Calculators
// ----------------------------------------------------
const getTestamentCount = (tData) => {
  if (!tData || !Array.isArray(tData.structure)) return 0;
  return tData.structure.reduce((acc, cat) => acc + (cat.verses?.length || 0), 0);
};

const getAnfCount = (anfData) => {
  if (!anfData || typeof anfData !== 'object') return 0;
  let count = 0;
  Object.values(anfData).forEach(century => {
    Object.values(century || {}).forEach(father => {
      Object.values(father?.works || {}).forEach(work => {
        count += (work?.quotes?.length || 0);
      });
    });
  });
  return count;
};

const getCenturyCount = (centuryObj) => {
  if (!centuryObj || typeof centuryObj !== 'object') return 0;
  let count = 0;
  Object.values(centuryObj).forEach(father => {
    Object.values(father?.works || {}).forEach(work => {
      count += (work?.quotes?.length || 0);
    });
  });
  return count;
};

const getSourceCount = (sData) => {
  if (!sData || typeof sData !== 'object') return 0;
  let count = 0;
  Object.values(sData.works || {}).forEach(work => {
    count += (work?.quotes?.length || 0);
  });
  return count;
};

const getAncientJudaismCount = (ajData) => {
  if (!ajData || typeof ajData !== 'object') return 0;
  let count = 0;
  Object.values(ajData).forEach(era => {
    Object.values(era || {}).forEach(author => {
      Object.values(author?.works || {}).forEach(work => {
        count += (work?.quotes?.length || 0);
      });
    });
  });
  return count;
};

const getTopicTotalCount = (tData) => {
  if (!tData) return 0;
  let count = getTestamentCount(tData.Scripture?.['New Testament']) +
         getTestamentCount(tData.Scripture?.['Old Testament']) +
         getAnfCount(tData['Ante-Nicene Fathers']) +
         getAncientJudaismCount(tData['Ancient Judaism']);
  if (Array.isArray(tData.prophecies)) count += tData.prophecies.length;
  return count;
};

// ----------------------------------------------------
const SourceBlock = ({ sourceName, sData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sourceCount = getSourceCount(sData);

  return (
    <div className={`father-block ${isOpen ? 'is-expanded' : ''}`}>
      <div
        className="father-header-box"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <h3 className="father-name">{sourceName} <span className="item-count">({sourceCount})</span></h3>
        <Chevron open={isOpen} />
      </div>

      {isOpen && (
        <div className="father-content animate-fade-in">
          {sData?.note && <div className="father-note-box">{sData.note}</div>}
          {Object.keys(sData?.works || {}).map(workName => {
            const workObj = sData.works[workName] || {};
            const workQuotes = workObj.quotes || [];
            const workDate = workObj.date;
            const workNote = workObj.note;
            return (
              <div key={workName} className="patristic-work-group">
                <div className="work-header-meta">
                  <h4 className="work-title">
                    {workName} {workDate && <span className="work-date-badge">({workDate})</span>} <span className="item-count">({workQuotes.length})</span>
                  </h4>
                  {workNote && <p className="work-note-text">{workNote}</p>}
                </div>
                <div className="verse-group-list">
                  {workQuotes.map((q, idx) => {
                    const handleQuoteClick = () => {
                      if (q?.url) window.open(q.url, '_blank', 'noopener,noreferrer');
                    };
                    const hasChapter = q?.chapter && q.chapter !== 'N/A';
                    return (
                      <div
                        key={q?.quote ? q.quote.slice(0, 40) : idx}
                        className="clean-verse-card"
                        onClick={handleQuoteClick}
                        role={q?.url ? "button" : undefined}
                        tabIndex={q?.url ? 0 : undefined}
                        onKeyDown={q?.url ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleQuoteClick();
                          }
                        } : undefined}
                      >
                        {(hasChapter || q?.url) && (
                          <div className="verse-card-header">
                            <span className="verse-ref-pill">
                              {hasChapter ? q.chapter : 'Source'} {q?.url && <span className="ref-arrow">&gt;</span>}
                            </span>
                          </div>
                        )}
                        <p className="verse-card-text">"{q?.quote || ''}"</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// Prophecies Dedicated View
// ----------------------------------------------------
const ProphecyCard = ({ prophecy, verseTexts, topicId }) => {
  const otBookId = prophecy.ot_verses?.[0]?.split('_')[0];
  const bookName = otBookId ? formatBookName(otBookId) : '';
  const otText = (prophecy.ot_verses || []).map(vId => verseTexts[vId] || '').filter(Boolean).join(' ');

  return (
    <div className="prophecy-card">
      <div className="prophecy-card-header">
        <div className="prophecy-header-top">
          <h2 className="prophecy-title">{prophecy.name}</h2>
          {prophecy.type && <span className="prophecy-type-badge">{prophecy.type}</span>}
        </div>
        {prophecy.date && <p className="prophecy-date-meta">{prophecy.date}</p>}
      </div>

      <div className="prophecy-card-body">
        <div className="prophecy-ot-pane">
          <h4 className="prophecy-pane-label">Old Testament Promise {bookName ? `(${bookName})` : ''}</h4>
          <div className="prophecy-ot-text">{otText}</div>
          <div className="prophecy-ot-refs">
            {(prophecy.ot_verses || []).map(vId => {
              const p = vId.split('_');
              return (
                <a key={vId} href={`${base}/bible/${p[0]}/${p[1]}#${p.slice(2).join('_')}`} className="verse-ref-link" onClick={(e) => {
                  e.stopPropagation();
                }}>
                  <span className="verse-ref-pill">{formatBookName(p[0])} {p[1]}:{p.slice(2).join('_')} <span className="ref-arrow">&gt;</span></span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="prophecy-nt-pane">
          <h4 className="prophecy-pane-label">New Testament Fulfillment</h4>
          <div className="prophecy-nt-stack">
            {(prophecy.nt_fulfillments || []).map((nt, idx) => {
              const ntText = (nt.verses || []).map(vId => verseTexts[vId] || '').filter(Boolean).join(' ');
              return (
                <div key={idx} className="prophecy-nt-block">
                  {idx > 0 && <div className="prophecy-nt-divider" />}
                  <div className="prophecy-nt-text">{ntText}</div>
                  <div className="prophecy-nt-refs">
                    {(nt.verses || []).map(vId => {
                      const p = vId.split('_');
                      return (
                        <a key={vId} href={`${base}/bible/${p[0]}/${p[1]}#${p.slice(2).join('_')}`} className="verse-ref-link" onClick={(e) => {
                          e.stopPropagation();
                        }}>
                          <span className="verse-ref-pill">{formatBookName(p[0])} {p[1]}:{p.slice(2).join('_')} <span className="ref-arrow">&gt;</span></span>
                        </a>
                      );
                    })}
                  </div>
                  {nt.note && <div className="prophecy-nt-note">{nt.note}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const PropheciesDedicatedView = ({ prophecies, verseTexts, topicId }) => {
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
            {items.map((p, idx) => <ProphecyCard key={p.name || idx} prophecy={p} verseTexts={verseTexts} topicId={topicId} />)}
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
            {items.map((p, idx) => <ProphecyCard key={p.name || idx} prophecy={p} verseTexts={verseTexts} topicId={topicId} />)}
          </div>
        </div>
      );
    });
  }

  return (
    <div className="dedicated-topic-view">
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
// Dedicated Topic View (No Accordions)
// ----------------------------------------------------
const DedicatedTopicView = ({ topicObj, verseTexts }) => {
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

  const ntCount = getTestamentCount(topicObj.Scripture?.['New Testament']);
  const otCount = getTestamentCount(topicObj.Scripture?.['Old Testament']);
  const anfCount = getAnfCount(topicObj['Ante-Nicene Fathers']);
  const ajCount = getAncientJudaismCount(topicObj['Ancient Judaism']);

  const handleTabChange = (tab, hash) => {
    setActiveTab(tab);
    setActiveFilter('All');
    if (typeof window !== 'undefined' && hash) {
      window.history.replaceState(null, '', `#${hash}`);
    }
  };

  const renderScriptureFeed = (testament) => {
    const tData = topicObj.Scripture?.[testament];
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
          <VerseGroup verses={cat?.verses || []} verseBank={verseBank} verseTexts={verseTexts} topicId={topicObj._id} testamentName={testament} />
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
    const anfData = topicObj['Ante-Nicene Fathers'];
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
    const ajData = topicObj['Ancient Judaism'];
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
    <div className="dedicated-topic-view">
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


export default function TopicsExplorer({ topics = [], initialTopicId = null }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [topicSearch, setTopicSearch] = useState('');
  const [activeHighlightTopics, setActiveHighlightTopics] = useState([]);
  const isDedicatedPage = Boolean(initialTopicId);

  const toggleHighlight = (tId) => {
    let active = [];
    try {
      const parsed = JSON.parse(localStorage.getItem('activeTopics') || '[]');
      active = Array.isArray(parsed) ? parsed : [];
    } catch(e) {}

    // Legacy support
    const legacyTopic = localStorage.getItem('activeTopic');
    if (legacyTopic && !active.length) {
      active = [legacyTopic];
      localStorage.removeItem('activeTopic');
    }

    if (active.includes(tId)) {
      active = active.filter(id => id !== tId);
    } else {
      active.push(tId);
    }

    localStorage.setItem('activeTopics', JSON.stringify(active));
    setActiveHighlightTopics(active);
  };

  useEffect(() => {
    const syncActive = () => {
      if (typeof window !== 'undefined') {
        let active = [];
        try {
          const parsed = JSON.parse(localStorage.getItem('activeTopics') || '[]');
          active = Array.isArray(parsed) ? parsed : [];
        } catch(e) {}

        const legacyTopic = localStorage.getItem('activeTopic');
        if (legacyTopic && !active.length) {
          active = [legacyTopic];
          localStorage.setItem('activeTopics', JSON.stringify(active));
          localStorage.removeItem('activeTopic');
        }

        setActiveHighlightTopics(active);
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

  // Fast O(1) Topic Lookup Map
  const topicsMap = useMemo(() => {
    return new Map(topics.map(t => [t.topicId, t]));
  }, [topics]);

  // Compute Categorized Sections with Orphan Safety Net
  const categorizedSections = useMemo(() => {
    const mappedIds = new Set();

    const sections = TOPICS_TAXONOMY.map(section => {
      const subHeadings = section.subHeadings
        .map(sub => {
          const items = sub.topics
            .map(id => {
              mappedIds.add(id);
              return topicsMap.get(id);
            })
            .filter(Boolean);

          return { ...sub, items };
        })
        .filter(sub => sub.items.length > 0);

      return { ...section, subHeadings };
    }).filter(section => section.subHeadings.length > 0);

    // Safety net: Collect unmapped topics if any exist
    const unmappedTopics = topics.filter(t => !mappedIds.has(t.topicId));
    if (unmappedTopics.length > 0) {
      sections.push({
        mainHeading: 'General Topics',
        subHeadings: [
          {
            title: 'Other',
            items: unmappedTopics
          }
        ]
      });
    }

    return sections;
  }, [topics, topicsMap]);

  // Pre-calculate titles and comprehensive counts for dropdown
  const topicOptions = topics.map(t => {
    return {
      id: t.topicId,
      title: t.topicData?.name || t.topicData?.Scripture?.['New Testament']?.title?.replace('New Testament ', '') || t.topicId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: getTopicTotalCount(t.topicData)
    };
  });

  const currentTopicOption = topicOptions.find(t => t.id === initialTopicId) || {};
  const filteredTopicOptions = topicOptions.filter(t => t.title.toLowerCase().includes(topicSearch.toLowerCase()));

  return (
    <div className="topics-explorer select-none">
      {!isDedicatedPage && (
        <header className="explorer-header">
          <h1 className="explorer-title">Apologetics Topics</h1>
          <p className="explorer-subtitle">Curated collections of Scripture and early Church testimonies defending core doctrines.</p>
        </header>
      )}

      {isDedicatedPage && (
        <div className="ios-nav-container">
          <a href={`${base}/topics`} className="ios-nav-back" title="All Topics">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>All Topics</span>
          </a>
        </div>
      )}

      {isDedicatedPage ? (
        <div className="dedicated-topic-wrapper" onClick={() => setDropdownOpen(false)}>
          {displayTopics.map(t => {
            const tId = t.topicId;
            const tData = t.topicData;
            const tTitle = tData.name || tData.Scripture?.['New Testament']?.title?.replace('New Testament ', '') || tId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const topicColor = getTopicColor(tId);

            return (
              <div
                key={tId}
                className="dedicated-topic-view-container animate-fade-in"
                style={{ '--topic-color': topicColor.hex, '--topic-bg': topicColor.bgHex }}
              >
                <header className="dedicated-hero-header">
                  <div className="hero-title-wrapper select-none" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="hero-title-selector-btn"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      aria-expanded={dropdownOpen}
                      title="Switch topic"
                    >
                      <h1 className="hero-title-text">{tTitle}</h1>
                      <span className="hero-switch-badge">
                        <span>Switch Topic</span>
                        <Chevron open={dropdownOpen} />
                      </span>
                    </button>

                    {dropdownOpen && (
                      <div className="hero-dropdown-sheet animate-fade-in">
                        <div className="dropdown-sheet-header">Available Topics</div>
                        <div className="dropdown-sheet-list">
                          {topicOptions.map(opt => {
                            const isSelected = opt.id === initialTopicId;
                            return (
                              <a
                                key={opt.id}
                                href={`${base}/topics/${opt.id}`}
                                className={`dropdown-sheet-item ${isSelected ? 'is-selected' : ''}`}
                              >
                                <span className="sheet-item-title">{opt.title}</span>
                                <div className="sheet-item-right">
                                  <span className="sheet-item-count">{opt.count}</span>
                                  {isSelected && (
                                    <svg className="sheet-checkmark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  )}
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="hero-top-row">
                    <button
                      className={`ios-compact-toggle ${activeHighlightTopics.includes(tId) ? 'is-active' : ''}`}
                      onClick={() => toggleHighlight(tId)}
                      aria-pressed={activeHighlightTopics.includes(tId)}
                      title="Toggle Scripture Highlighting"
                    >
                      <span className="ios-toggle-track">
                        <span className="ios-toggle-knob"></span>
                      </span>
                      <span className="compact-toggle-text">Highlight in Scripture</span>
                    </button>
                  </div>
                </header>
                {tData.prophecies ? (
                  <PropheciesDedicatedView prophecies={tData.prophecies} verseTexts={t.verseTexts} topicId={tId} />
                ) : (
                  <DedicatedTopicView topicObj={{ ...tData, _id: tId }} verseTexts={t.verseTexts} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="topics-index-layout" onClick={() => setDropdownOpen(false)}>
          {categorizedSections.map(classification => (
            <section key={classification.mainHeading} className="main-heading-section">
              <h2 className="main-heading-title">{classification.mainHeading}</h2>
              {classification.subHeadings.map(subGroup => (
                <div key={subGroup.title} className="sub-heading-section">
                  <h3 className="sub-heading-title"><span>{subGroup.title}</span></h3>
                  <div className="topics-accordion-list">
                    {subGroup.items.map(t => {
                      const tId = t.topicId;
                      const tData = t.topicData;
                      const tTitle = tData.name || tData.Scripture?.['New Testament']?.title?.replace('New Testament ', '') || tId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      const topicColor = getTopicColor(tId);
                      const isHighlighted = activeHighlightTopics.includes(tId);

                      const headerContent = (
                        <div className="topic-card-inner-flex">
                          <div className="header-text-block">
                            <h4 className="topic-main-heading">{tTitle}</h4>
                          </div>
                          <div className="header-controls">
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
                          className="master-topic-box"
                          id={tId}
                          style={{ '--topic-color': topicColor.hex, '--topic-bg': topicColor.bgHex }}
                        >
                          <a href={`${base}/topics/${tId}`} className="topic-header-box is-link">
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

      <style dangerouslySetInnerHTML={{ __html: `
        .topics-explorer {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 32px;
        }

        .explorer-header {
          margin-bottom: 8px;
        }
        .explorer-title {
          font-family: var(--font-display);
          font-size: 30px;
          font-weight: 900;
          color: var(--color-primary, #1e293b);
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }
        .explorer-subtitle {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-on-surface-variant, #64748b);
          margin: 0;
          line-height: 1.5;
        }

        /* --------------------------------------
           Classification Layout Styles
           -------------------------------------- */
        .topics-index-layout {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .main-heading-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .main-heading-title {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 700;
          color: var(--color-primary);
          margin: 0;
          letter-spacing: -0.01em;
          border-bottom: 1px solid var(--color-outline-variant, #e4e4e7);
          padding-bottom: 6px;
        }

        .sub-heading-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sub-heading-title {
          font-family: var(--font-cinzel, 'Times New Roman', serif); /* Fallback just in case var string differs */
          font-size: 22px;
          font-weight: 600;
          color: var(--color-on-surface-variant, #475569);
          margin: 0 0 8px 0;
          text-align: center;
          position: relative;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .sub-heading-title::after {
          content: '';
          display: block;
          width: 60px;
          height: 1px;
          background-color: var(--color-outline-variant, #cbd5e1);
          margin: 8px auto 0 auto;
        }


        /* Master Topic Boxes (Level 1) */
        .topics-accordion-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .master-topic-box {
          background-color: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #cbd5e1);
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .topic-header-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 22px;
          background: #ffffff;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .topic-header-box.is-link {
          text-decoration: none;
          color: inherit;
        }
        .topic-header-box.is-link:hover {
          background: #f8fafc;
        }
        .topic-header-box.is-link:active {
          transform: scale(0.995);
          background: #f1f5f9;
        }

        .header-text-block {
          flex: 1;
          margin-right: 16px;
        }
        .topic-main-heading {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 800;
          color: var(--color-primary, #0f172a);
          margin: 0 0 4px 0;
          letter-spacing: -0.01em;
        }
        .topic-summary-text {
          font-family: var(--font-body);
          font-size: 13.5px;
          color: var(--color-on-surface-variant, #64748b);
          margin: 0;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        /* Apple HIG iOS Navigation Bar & Popover Sheet */
        .ios-nav-container {
          position: relative;
          z-index: 50;
          margin-bottom: 12px;
        }
        .ios-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 52px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 0 8px;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        /* Apple HIG Hero Header & Title Dropdown */
        .ios-nav-container {
          margin-bottom: 16px;
        }
        .ios-nav-back {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #64748b;
          font-family: var(--font-body);
          font-size: 14.5px;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.15s ease;
          text-decoration: none;
        }
        .ios-nav-back:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }

        .dedicated-hero-header {
          margin-bottom: 24px;
        }
        .hero-title-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 6px;
        }
        .hero-title-selector-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          border: none;
          padding: 4px 8px;
          margin: -4px -8px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s ease;
          text-align: left;
        }
        .hero-title-selector-btn:hover {
          background: rgba(0, 0, 0, 0.04);
        }
        .hero-title-text {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .hero-switch-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #f1f5f9;
          color: #475569;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 99px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .hero-title-selector-btn:hover .hero-switch-badge {
          background: #e2e8f0;
          color: #0f172a;
        }

        .hero-dropdown-sheet {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 320px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 16px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          z-index: 100;
        }
        .dropdown-sheet-header {
          padding: 12px 16px 8px 16px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .dropdown-sheet-list {
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-height: 320px;
          overflow-y: auto;
        }
        .dropdown-sheet-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: #1e293b;
          font-family: var(--font-body);
          font-size: 14.5px;
          font-weight: 600;
          transition: background 0.15s ease;
        }
        .dropdown-sheet-item:hover {
          background: rgba(0, 0, 0, 0.04);
        }
        .dropdown-sheet-item.is-selected {
          background: var(--topic-bg, #eff6ff);
          color: var(--topic-color, #2563eb);
          font-weight: 700;
        }
        .sheet-item-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sheet-item-count {
          background: #f1f5f9;
          color: #64748b;
          font-size: 11.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 99px;
        }
        .dropdown-sheet-item.is-selected .sheet-item-count {
          background: var(--topic-bg, #dbeafe);
          color: var(--topic-color, #2563eb);
        }
        .sheet-checkmark {
          color: var(--topic-color, #2563eb);
          flex-shrink: 0;
        }

        .topic-card-inner-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .topic-card-inner-flex {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .header-controls {
            width: 100%;
            justify-content: space-between;
          }
        }
        .hero-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 16px;
          margin-bottom: 16px;
        }
        .explore-badge-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: var(--color-secondary, #974543);
          color: #ffffff !important;
          padding: 5px 12px;
          border-radius: 99px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid transparent;
          line-height: 1;
        }
        .explore-badge-btn svg {
          stroke: currentColor;
          fill: none;
          flex-shrink: 0;
        }
        .topic-header-box.is-link:hover .explore-badge-btn {
          filter: brightness(0.9);
          transform: translateY(-1px);
        }
        .topic-header-box.is-link:active .explore-badge-btn {
          transform: translateY(0) scale(0.98);
        }
        .ios-compact-toggle {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 5px 12px;
          border-radius: 99px;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          -webkit-user-select: none;
        }
        .ios-compact-toggle:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .ios-compact-toggle.is-active {
          background: var(--topic-bg, #ecfdf5);
          border-color: var(--topic-color, #a7f3d0);
          color: var(--topic-color, #059669);
        }
        .ios-toggle-track {
          position: relative;
          display: inline-block;
          width: 32px;
          height: 18px;
          background-color: #cbd5e1;
          border-radius: 99px;
          transition: background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }
        .is-active .ios-toggle-track {
          background-color: var(--topic-color, #10b981);
        }
        .ios-toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 14px;
          height: 14px;
          background-color: #ffffff;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 1px rgba(0,0,0,0.1);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .is-active .ios-toggle-knob {
          transform: translateX(14px);
        }

        /* Expanded Inner Container */
        .topic-expanded-container {
          padding: 24px;
          background-color: #ffffff;
        }

        /* Segmented Tabs */
        .main-segmented-wrapper, .sub-segmented-wrapper {
          margin-bottom: 16px;
        }
        .segmented-tabs {
          display: flex;
          background-color: #f1f5f9;
          padding: 3px;
          border-radius: 10px;
          gap: 4px;
        }
        .tab-btn {
          flex: 1;
          padding: 9px;
          background: none;
          border: none;
          border-radius: 8px;
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tab-btn.active {
          background-color: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03);
        }

        .sub-segmented-tabs {
          display: inline-flex;
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          padding: 3px;
          border-radius: 8px;
          gap: 2px;
        }
        .sub-btn {
          padding: 5px 14px;
          background: none;
          border: none;
          border-radius: 6px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .sub-btn.active {
          background-color: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        /* Hierarchy Accordions (Levels 2 & 3) */
        .hierarchy-accordion {
          margin-bottom: 12px;
          border-radius: 12px;
          overflow: hidden;
          background-color: #ffffff;
          border: 1px solid #f1f5f9;
        }
        .hierarchy-accordion.level-3 {
          margin-bottom: 8px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.04);
        }

        .accordion-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .header-right-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Apple-Style Refined Muted Level 2 Headers */
        .nt-header-banner {
          background: #eff6ff;
          color: #1e40af;
          font-size: 15px;
          font-weight: 700;
          border-bottom: 1px solid #dbeafe;
        }
        .nt-header-banner .chevron { color: #60a5fa; }

        .ot-header-banner {
          background: #fefce8;
          color: #854d0e;
          font-size: 15px;
          font-weight: 700;
          border-bottom: 1px solid #fef08a;
        }
        .ot-header-banner .chevron { color: #facc15; }

        /* Elegant Minimalist Level 3 Headers */
        .nt-cat-header {
          background-color: #ffffff;
          border-left: 2.5px solid #6366f1;
          color: #334155;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
        }
        .nt-cat-header:hover { background-color: #fcfcfd; }

        .ot-cat-header {
          background-color: #ffffff;
          border-left: 2.5px solid #f59e0b;
          color: #334155;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
        }
        .ot-cat-header:hover { background-color: #fcfcfd; }

        .century-header {
          background-color: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          font-weight: 700;
        }
        .father-header {
          background-color: #ffffff;
          color: #334155;
          font-weight: 600;
          border-bottom: 1px solid #f8fafc;
        }

        .accordion-content-body {
          padding: 16px;
          background-color: #ffffff;
          border-top: 1px solid #f8fafc;
        }

        /* Clean Verse Cards (Level 4 - No Left Color Border!) */
        .verse-group-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .clean-verse-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px 18px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          cursor: pointer;
        }
        .clean-verse-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
          border-color: #cbd5e1;
        }

        .verse-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .verse-header-left {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .verse-cat-tag {
          display: inline-flex;
          align-items: center;
          font-family: var(--font-body);
          font-size: 11.5px;
          font-weight: 500;
          color: #64748b;
          background-color: #f1f5f9;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.1px;
        }
        .verse-ref-pill {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 800;
          color: #0f172a;
          background-color: #f1f5f9;
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.2px;
        }
        .ref-arrow {
          color: #94a3b8;
          font-weight: 900;
          margin-left: 3px;
          transition: color 0.15s ease;
        }
        .clean-verse-card:hover .verse-ref-pill, .verse-ref-link:hover .verse-ref-pill {
          background-color: #e2e8f0;
          color: #2563eb;
        }
        .clean-verse-card:hover .ref-arrow, .verse-ref-link:hover .ref-arrow {
          color: #2563eb;
        }

        .verse-card-text {
          font-family: var(--font-display);
          font-size: 15.5px;
          line-height: 1.55;
          color: #1e293b;
          margin: 0;
        }

        .topic-note-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 4px 12px;
          background-color: #fef9c3;
          border: 1px solid #fde047;
          border-radius: 20px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          color: #854d0e;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .topic-note-btn:hover {
          background-color: #fef08a;
          border-color: #eab308;
          color: #713f12;
          transform: translateY(-1px);
        }
        .topic-note-btn.active {
          color: #ffffff;
          background-color: #eab308;
          border-color: #ca8a04;
          box-shadow: 0 2px 4px rgba(234, 179, 8, 0.25);
        }
        .topic-note-btn svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        .verse-note-tooltip {
          margin-top: 12px;
          padding: 12px 14px;
          background-color: #fefce8;
          border-left: 3px solid #eab308;
          border-radius: 0 8px 8px 0;
          font-family: var(--font-body);
          font-size: 13px;
          color: #713f12;
          line-height: 1.45;
        }

        /* Patristic elements */
        .father-note-box {
          padding: 10px 14px;
          font-style: italic;
          color: #64748b;
          font-size: 13px;
          margin-bottom: 12px;
        }
        .patristic-work-group {
          margin-bottom: 16px;
        }
        .work-title {
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 8px 0;
        }
        .quote-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 8px;
        }
        .quote-text {
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.5;
          color: #334155;
          margin: 0 0 8px 0;
        }
        .quote-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: #94a3b8;
          font-weight: 600;
        }
        .quote-source-link {
          color: #2563eb;
          text-decoration: none;
        }
        .quote-source-link:hover { text-decoration: underline; }

        /* Dedicated Page Redesign */
        .dedicated-topic-wrapper {
          width: 100%;
        }
        .dedicated-page-header {
          margin-bottom: 24px;
        }
        .dedicated-page-title {
          font-family: var(--font-display);
          font-size: 36px;
          font-weight: 900;
          color: var(--color-primary, #0f172a);
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }
        .dedicated-page-subtitle {
          font-family: var(--font-body);
          font-size: 16px;
          color: var(--color-on-surface-variant, #64748b);
          margin: 0;
        }

        .master-tabs-container {
          display: flex;
          gap: 12px;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 24px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
        }
        .master-tabs-container::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }

        .master-tab {
          background: none;
          border: none;
          padding: 12px 16px;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px; /* overlap the container border */
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .master-tab:hover {
          color: #334155;
        }
        .master-tab.active {
          color: #0f172a;
          border-bottom-color: var(--topic-color, #2563eb);
        }

        .pills-scroll-container {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 12px;
          margin-bottom: 12px;
          scrollbar-width: none;
        }
        .pills-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .filter-pill {
          background-color: #f1f5f9;
          color: #475569;
          border: 1px solid transparent;
          border-radius: 20px;
          padding: 8px 16px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .filter-pill:hover {
          background-color: #e2e8f0;
          color: #1e293b;
        }
        .filter-pill.active {
          background-color: #2563eb;
          color: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
        }

        .feed-category-block {
          margin-bottom: 40px;
        }
        .feed-category-title {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 16px 0;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 8px;
        }

        .fathers-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .father-block {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }
        .father-block.is-expanded {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .father-header-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          cursor: pointer;
          background: #ffffff;
          transition: background 0.15s ease;
        }
        .father-header-box:hover {
          background: #f8fafc;
        }
        .father-block.is-expanded .father-header-box {
          border-bottom: 1px solid #f1f5f9;
          background: #f8fafc;
        }
        .father-name {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .father-content {
          padding: 20px;
        }
        .work-header-meta {
          margin-bottom: 8px;
        }
        .work-date-badge {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          margin-left: 4px;
        }
        .work-note-text {
          font-size: 14px;
          color: #475569;
          margin: 4px 0 0 0;
          line-height: 1.4;
        }


        /* Prophecies Cards */
        .prophecies-feed-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .prophecy-card {
          background-color: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #cbd5e1);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .prophecy-card-header {
          padding: 18px 20px 14px;
          background: #f8fafc;
          border-bottom: 1px solid var(--color-outline-variant, #cbd5e1);
        }
        .prophecy-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 6px;
        }
        .prophecy-title {
          font-family: var(--font-display);
          font-size: 19px;
          font-weight: 800;
          color: var(--color-primary, #0f172a);
          margin: 0;
          line-height: 1.25;
        }
        .prophecy-type-badge {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 8px;
          border-radius: 6px;
          background-color: var(--topic-bg);
          color: var(--topic-color);
          white-space: nowrap;
        }
        .prophecy-date-meta {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-on-surface-variant, #64748b);
          margin: 0;
        }
        .prophecy-card-body {
          display: flex;
          flex-direction: column;
        }
        .prophecy-ot-pane {
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-outline-variant, #cbd5e1);
        }
        .prophecy-nt-pane {
          padding: 16px 20px;
          background-color: rgba(0,0,0,0.01);
        }
        .prophecy-pane-label {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          color: var(--color-on-surface-variant, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0 0 10px 0;
        }
        .prophecy-ot-text, .prophecy-nt-text {
          font-family: var(--font-display);
          font-size: 16px;
          line-height: 1.6;
          color: var(--color-on-surface, #1e293b);
          margin-bottom: 10px;
        }
        .prophecy-ot-refs, .prophecy-nt-refs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .prophecy-nt-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .prophecy-nt-block {
          display: flex;
          flex-direction: column;
        }
        .prophecy-nt-divider {
          height: 1px;
          background-color: var(--color-outline-variant, #cbd5e1);
          margin: 0 0 16px 0;
          opacity: 0.5;
        }
        .prophecy-nt-note {
          margin-top: 12px;
          padding: 12px 14px;
          background-color: var(--topic-bg);
          border-left: 3px solid var(--topic-color);
          border-radius: 0 6px 6px 0;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.5;
          color: var(--color-primary, #0f172a);
        }

        .item-count {
          font-weight: 500;
          color: #94a3b8;
          font-size: 0.85em;
          margin-left: 4px;
        }
        .tab-count {
          font-weight: 600;
          color: #94a3b8;
          font-size: 13px;
          margin-left: 4px;
        }
        .master-tab.active .tab-count {
          color: #3b82f6;
        }

      ` }} />
    </div>
  );
}
