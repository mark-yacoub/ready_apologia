import React, { useState, useEffect, useMemo } from 'react';
import booksMeta from '../data/books_meta.json';
import { getTopicColor } from '../utils/topicColors.js';
import ScrollableTrack from './ScrollableTrack.jsx';
import { trackTopicInteraction } from '../utils/analytics.js';
import { TOPICS_TAXONOMY } from '../data/topicsTaxonomy.js';
import '../styles/TopicsExplorer.css';

const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;

// ----------------------------------------------------
// UI Icons & Helpers
// ----------------------------------------------------
import { VerseItem, InfoIcon } from './common/VerseItem.jsx';
import { TopicDropdown } from './common/TopicDropdown.jsx';

const Chevron = ({ open }) => (
  <svg className={`chevron ${open ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export const formatBookName = (bookId) => {
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

const getTopicTotalCount = (t) => {
  if (t.totalCount !== undefined) return t.totalCount; // Prioritize explicitly set totalCount
  const tData = t.topicData;
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

  const displayTopics = isDedicatedPage ? [topicsMap.get(initialTopicId)].filter(Boolean) : topics;

  // Pre-calculate titles and comprehensive counts for dropdown
  const topicOptions = topics.map(t => {
    return {
      id: t.topicId,
      title: t.topicData?.name || t.topicData?.Scripture?.['New Testament']?.title?.replace('New Testament ', '') || t.topicId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: getTopicTotalCount(t)
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
                  <TopicDropdown
                    tTitle={tTitle}
                    currentTopicId={initialTopicId}
                    topicOptions={topicOptions}
                    dropdownOpen={dropdownOpen}
                    setDropdownOpen={setDropdownOpen}
                    base={base}
                  />
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
                            {(tId !== 'quranic_deficiencies' && tId !== 'scientific_errors') && (
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

      
        
    </div>
  );
}
