import React, { useState } from 'react';
import booksMeta from '../data/books_meta.json';

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
    if (topicId) {
      localStorage.setItem('activeTopic', topicId);
    }
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
            onClick={(e) => { e.stopPropagation(); if (topicId) localStorage.setItem('activeTopic', topicId); }} 
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
            onClick={(e) => { e.stopPropagation(); setIsNoteOpen(!isNoteOpen); }} 
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

const getFatherCount = (fData) => {
  if (!fData || typeof fData !== 'object') return 0;
  let count = 0;
  Object.values(fData.works || {}).forEach(work => {
    count += (work?.quotes?.length || 0);
  });
  return count;
};

const getTopicTotalCount = (tData) => {
  if (!tData) return 0;
  return getTestamentCount(tData.Scripture?.['New Testament']) + 
         getTestamentCount(tData.Scripture?.['Old Testament']) + 
         getAnfCount(tData['Ante-Nicene Fathers']);
};

// ----------------------------------------------------
const FatherBlock = ({ fatherName, fData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fatherCount = getFatherCount(fData);

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
        <h3 className="father-name">{fatherName} <span className="item-count">({fatherCount})</span></h3>
        <Chevron open={isOpen} />
      </div>
      
      {isOpen && (
        <div className="father-content animate-fade-in">
          {fData.note && <div className="father-note-box">{fData.note}</div>}
          {Object.keys(fData.works || {}).map(workName => {
            const workQuotes = fData.works[workName]?.quotes || [];
            return (
              <div key={workName} className="patristic-work-group">
                <h4 className="work-title">{workName} <span className="item-count">({workQuotes.length})</span></h4>
                <div className="verse-group-list">
                  {workQuotes.map((q, idx) => {
                    const handleQuoteClick = () => {
                      if (q?.url) window.open(q.url, '_blank', 'noopener,noreferrer');
                    };
                    const hasChapter = q?.chapter && q.chapter !== 'N/A';
                    return (
                      <div 
                        key={idx} 
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
// Dedicated Topic View (No Accordions)
// ----------------------------------------------------
const DedicatedTopicView = ({ topicObj, verseTexts }) => {
  const [activeTab, setActiveTab] = useState('New Testament'); // 'New Testament', 'Old Testament', 'Fathers'
  const [activeFilter, setActiveFilter] = useState('All'); 

  const ntCount = getTestamentCount(topicObj.Scripture?.['New Testament']);
  const otCount = getTestamentCount(topicObj.Scripture?.['Old Testament']);
  const anfCount = getAnfCount(topicObj['Ante-Nicene Fathers']);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveFilter('All');
  };

  const renderScriptureFeed = (testament) => {
    const tData = topicObj.Scripture?.[testament];
    if (!tData || !tData.structure) return <div className="empty-state">No {testament} data available.</div>;

    const categories = tData.structure;
    const verseBank = tData.verse_bank || {};
    const totalTestamentCount = testament === 'New Testament' ? ntCount : otCount;

    const availableFilters = [
      { id: 'All', label: `All (${totalTestamentCount})` },
      ...categories.map(c => ({ id: c.title, label: `${c.title} (${c.verses?.length || 0})` }))
    ];

    const feedContent = categories
      .filter(cat => activeFilter === 'All' || activeFilter === cat.title)
      .map(cat => (
        <div key={cat.title} className="feed-category-block animate-fade-in">
          <h2 className="feed-category-title">{cat.title} <span className="item-count">({cat.verses?.length || 0})</span></h2>
          <VerseGroup verses={cat.verses} verseBank={verseBank} verseTexts={verseTexts} topicId={topicObj._id} testamentName={testament} />
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
              {Object.keys(fathers).map(fatherName => {
                const fData = fathers[fatherName];
                return (
                  <FatherBlock key={fatherName} fatherName={fatherName} fData={fData} />
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
      <div className="master-tabs-container">
        <button className={`master-tab ${activeTab === 'New Testament' ? 'active' : ''}`} onClick={() => handleTabChange('New Testament')}>
          New Testament <span className="tab-count">({ntCount})</span>
        </button>
        <button className={`master-tab ${activeTab === 'Old Testament' ? 'active' : ''}`} onClick={() => handleTabChange('Old Testament')}>
          Old Testament <span className="tab-count">({otCount})</span>
        </button>
        <button className={`master-tab ${activeTab === 'Fathers' ? 'active' : ''}`} onClick={() => handleTabChange('Fathers')}>
          Early Fathers <span className="tab-count">({anfCount})</span>
        </button>
      </div>
      <div className="master-tab-content">
        {activeTab === 'New Testament' && renderScriptureFeed('New Testament')}
        {activeTab === 'Old Testament' && renderScriptureFeed('Old Testament')}
        {activeTab === 'Fathers' && renderFathersFeed()}
      </div>
    </div>
  );
};


export default function TopicsExplorer({ topics = [], initialTopicId = null }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isDedicatedPage = Boolean(initialTopicId);

  // On dedicated page, we only show the one topic
  const displayTopics = isDedicatedPage ? topics.filter(t => t.topicId === initialTopicId) : topics;

  // Pre-calculate titles for dropdown
  const topicOptions = topics.map(t => {
    return {
      id: t.topicId,
      title: t.topicData?.Scripture?.['New Testament']?.title?.replace('New Testament ', '') || t.topicId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    };
  });
  
  const currentTopicOption = topicOptions.find(t => t.id === initialTopicId) || {};

  return (
    <div className="topics-explorer select-none">
      {!isDedicatedPage && (
        <header className="explorer-header">
          <h1 className="explorer-title">Apologetics Topics</h1>
          <p className="explorer-subtitle">Curated collections of Scripture and early Church testimonies defending core doctrines.</p>
        </header>
      )}

      {isDedicatedPage && (
        <div className="dedicated-topic-nav">
          <a href={`${base}/topics`} className="back-to-topics-btn" title="Back to All Topics">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>All Topics</span>
          </a>
          
          <div className="topic-dropdown-container">
            <button 
              className={`topic-dropdown-btn ${dropdownOpen ? 'open' : ''}`} 
              onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
            >
              <span className="dropdown-label">Current Topic:</span>
              <span className="dropdown-value">{currentTopicOption.title}</span>
              <Chevron open={dropdownOpen} />
            </button>
            
            {dropdownOpen && (
              <div className="topic-dropdown-menu">
                {topicOptions.map(t => (
                  <a 
                    key={t.id} 
                    href={`${base}/topics/${t.id}`} 
                    className={`dropdown-item ${t.id === initialTopicId ? 'active' : ''}`}
                  >
                    {t.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={isDedicatedPage ? "dedicated-topic-wrapper" : "topics-accordion-list"} onClick={() => setDropdownOpen(false)}>
        {displayTopics.map(t => {
          const tId = t.topicId;
          const tData = t.topicData;
          const tTitle = tData.Scripture?.['New Testament']?.title?.replace('New Testament ', '') || tId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

          if (isDedicatedPage) {
            return (
              <div key={tId} className="dedicated-topic-view-container animate-fade-in">
                <header className="dedicated-page-header">
                  <h1 className="dedicated-page-title">{tTitle}</h1>
                  <p className="dedicated-page-subtitle">Explore Biblical proofs and early Patristic witnesses.</p>
                </header>
                <DedicatedTopicView topicObj={{ ...tData, _id: tId }} verseTexts={t.verseTexts} />
              </div>
            );
          }

          const headerContent = (
            <>
              <div className="header-text-block">
                <h2 className="topic-main-heading">{tTitle}</h2>
                <p className="topic-summary-text">Explore Biblical proofs and early Patristic witnesses.</p>
              </div>
              <div className="header-controls">
                <Chevron open={false} />
              </div>
            </>
          );

          return (
            <div key={tId} className="master-topic-box" id={tId}>
              <a href={`${base}/topics/${tId}`} className="topic-header-box is-link">
                {headerContent}
              </a>
            </div>
          );
        })}
      </div>

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

        /* Dedicated Topic Nav */
        .dedicated-topic-nav {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .back-to-topics-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .back-to-topics-btn:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }
        
        .topic-dropdown-container {
          position: relative;
        }
        
        .topic-dropdown-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 14px;
          font-family: var(--font-body);
          font-size: 14px;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .topic-dropdown-btn:hover, .topic-dropdown-btn.open {
          border-color: #cbd5e1;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }
        .topic-dropdown-btn .dropdown-label {
          color: #64748b;
          font-weight: 500;
        }
        .topic-dropdown-btn .dropdown-value {
          color: #0f172a;
          font-weight: 700;
        }
        
        .topic-dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px;
          min-width: 240px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
          z-index: 100;
          display: flex;
          flex-direction: column;
        }
        .dropdown-item {
          padding: 8px 12px;
          color: #334155;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          border-radius: 6px;
          transition: background-color 0.15s ease;
        }
        .dropdown-item:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }
        .dropdown-item.active {
          background-color: #eff6ff;
          color: #2563eb;
          font-weight: 600;
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
        .clean-verse-card:hover .verse-ref-pill {
          background-color: #e2e8f0;
          color: #2563eb;
        }
        .clean-verse-card:hover .ref-arrow {
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
          border-bottom-color: #2563eb;
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
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .fathers-grid {
            grid-template-columns: 1fr 1fr;
          }
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
