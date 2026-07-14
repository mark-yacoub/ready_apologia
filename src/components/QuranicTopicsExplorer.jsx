import React, { useState, useMemo } from 'react';
import ScrollableTrack from './ScrollableTrack.jsx';
import { trackTopicInteraction } from '../utils/analytics.js';

const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;

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

const VerseItem = ({ vId, text, note, topicId, categoryTitle = null }) => {
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const parts = vId.split(':');
  const surahNum = parts[0];
  const verseNum = parts[1];
  const refStr = `Quran ${surahNum}:${verseNum}`;

  const handleCardClick = (e) => {
    if (e.target.closest('.topic-note-btn')) return;
    window.location.href = `${base}/quran/${surahNum}#${verseNum}`;
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
            href={`${base}/quran/${surahNum}#${verseNum}`}
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
};// --- Module-Level Static Constants (Zero Allocation per Render) ---
const STANDARD_MAP = {
  'Borrowed Mythology': 'Borrowed Mythology & Plagiarism',
  'Borrowed Mythology & Plagiarism': 'Borrowed Mythology & Plagiarism',
  'Contradicts the Bible': 'Contradicts the Bible',
  'Devalues Women': 'Devalues Women',
  'Failed Prophecy': 'Failed Prophecy',
  'Historical Error': 'Historical Error',
  'Incites Violence & Intolerance': 'Incites Violence & Intolerance',
  'Promotes Division & Discrimination': 'Promotes Division & Discrimination',
  'Sanctions Slavery & Concubinage': 'Sanctions Slavery & Concubinage',
  'Theological Defect': 'Theological Defect'
};

const normalizeAndSplitLabel = (rawLabel) => {
  const clean = rawLabel.replace(/^[0-9]+\.\s*/, '').trim();
  if (STANDARD_MAP[clean]) return [STANDARD_MAP[clean]];

  const targets = [];
  for (const [key, normalizedName] of Object.entries(STANDARD_MAP)) {
    if (clean.includes(key) && !targets.includes(normalizedName)) {
      targets.push(normalizedName);
    }
  }
  return targets.length > 0 ? targets : [clean];
};

const CUSTOM_ORDER_KEYWORDS = [
  ['devalues women'],
  ['historical error'],
  ['incites violence'],
  ['promotes division'],
  ['slavery'],
  ['borrowed myth', 'plagiarism'],
  ['theological defect'],
  ['contradicts the bible'],
  ['failed prophecy']
];

const getLabelPriority = (label) => {
  const lower = label.toLowerCase();
  for (let i = 0; i < CUSTOM_ORDER_KEYWORDS.length; i++) {
    if (CUSTOM_ORDER_KEYWORDS[i].some(kw => lower.includes(kw))) {
      return i;
    }
  }
  return 999;
};

const getTopicTotalCount = (tData, verseLabels) => {
  if (tData._isQuran) {
    return Object.keys(verseLabels).length;
  }
  let count = 0;
  if (tData.Scripture) {
    ['New Testament', 'Old Testament'].forEach(t => {
      const s = tData.Scripture[t]?.structure;
      if (s) count += s.reduce((acc, cat) => acc + (cat.verses?.length || 0), 0);
    });
  }
  ['Ante-Nicene Fathers', 'Ancient Judaism'].forEach(era => {
    const eData = tData[era];
    if (eData) {
      Object.values(eData).forEach(group => {
        Object.values(group || {}).forEach(author => {
          if (author && author.works) {
            Object.values(author.works).forEach(work => {
              count += (work?.quotes?.length || 0);
            });
          }
        });
      });
    }
  });
  if (Array.isArray(tData.prophecies)) count += tData.prophecies.length;
  return count;
};

export default function QuranicTopicsExplorer({ topicsDropdownData = [], verseLabels = {}, drogeTranslation = {} }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const topicId = 'quranic_deficiencies';
  const topicColor = { hex: '#059669', bgHex: '#d1fae5' }; // .theme-quran derived
  const tTitle = "Quranic Deficiencies";

  // Parse & Categorize Data Purely (No Render Side-Effects)
  const { map, sortedLabels } = useMemo(() => {
    const dataMap = new Map();

    for (const [vId, labelsObj] of Object.entries(verseLabels)) {
      const [surahNum, verseNum] = vId.split(':').map(Number);
      
      for (const [rawLabel, note] of Object.entries(labelsObj)) {
        const targetLabels = normalizeAndSplitLabel(rawLabel);
        const translatedText = drogeTranslation[vId]?.text || 'Translation unavailable';

        for (const label of targetLabels) {
          if (!dataMap.has(label)) dataMap.set(label, []);
          dataMap.get(label).push({ vId, surahNum, verseNum, text: translatedText, note });
        }
      }
    }

    // Sort labels according to user's requested custom sequence
    const sorted = Array.from(dataMap.keys()).sort((a, b) => {
      const pA = getLabelPriority(a);
      const pB = getLabelPriority(b);
      if (pA !== pB) return pA - pB;
      return a.localeCompare(b);
    });

    // Sort verses numerically within each label
    for (const label of sorted) {
      dataMap.get(label).sort((a, b) => {
        return a.surahNum !== b.surahNum ? a.surahNum - b.surahNum : a.verseNum - b.verseNum;
      });
    }

    return { map: dataMap, sortedLabels: sorted };
  }, [verseLabels, drogeTranslation]);

  // Derive current tab without calling setState inside render/useMemo
  const currentTab = activeTab || (sortedLabels.length > 0 ? sortedLabels[0] : '');

  const topicOptions = topicsDropdownData.map(t => {
    const isQuran = t.topicId === 'quranic_deficiencies';
    const computedName = t.topicData?.name || t.topicData?.Scripture?.['New Testament']?.title?.replace('New Testament ', '') || t.topicId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      id: t.topicId,
      title: computedName,
      count: getTopicTotalCount(isQuran ? { ...t.topicData, _isQuran: true } : t.topicData, verseLabels)
    };
  });

  return (
    <div className="topics-explorer select-none relative">
      <div className="ios-nav-container">
        <a href={`${base}/topics`} className="ios-nav-back" title="All Topics">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span>All Topics</span>
        </a>
      </div>

      <div className="dedicated-topic-wrapper" onClick={() => setDropdownOpen(false)}>
        <div
          className="dedicated-topic-view-container animate-fade-in"
          style={{ '--topic-color': topicColor.hex, '--topic-bg': topicColor.bgHex }}
        >
          <header className="dedicated-hero-header" style={{ paddingBottom: '16px' }}>
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
                      const isSelected = opt.id === topicId;
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
            {/* Omitted the "Highlight in Scripture" functionality as requested */}
          </header>          <div className="dedicated-topic-view">
            <ScrollableTrack containerClass="master-tabs-container" activeTrigger={currentTab}>
              {sortedLabels.map(label => {
                const count = map.get(label).length;
                return (
                  <button
                    key={label}
                    id={label.replace(/\s+/g, '-')}
                    className={`master-tab ${currentTab === label ? 'active' : ''}`}
                    onClick={() => setActiveTab(label)}
                  >
                    {label} <span className="tab-count">({count})</span>
                  </button>
                );
              })}
            </ScrollableTrack>
            
            <div className="master-tab-content">
              {currentTab && map.has(currentTab) && (
                <div className="scripture-feed-container animate-fade-in">
                  <div className="feed-content-area">
                    <div className="feed-category-block">
                      <h2 className="feed-category-title">
                        {currentTab} <span className="item-count">({map.get(currentTab).length})</span>
                      </h2>
                      <div className="verse-group-list">
                        {map.get(currentTab).map(v => (
                          <VerseItem
                            key={v.vId}
                            vId={v.vId}
                            text={v.text}
                            note={v.note}
                            topicId={topicId}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .topics-explorer {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 32px;
        }

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
          background: var(--topic-bg, #ecfdf5);
          color: var(--topic-color, #059669);
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
          background: var(--topic-bg, #d1fae5);
          color: var(--topic-color, #059669);
        }
        .sheet-checkmark {
          color: var(--topic-color, #059669);
          flex-shrink: 0;
        }

        .dedicated-topic-wrapper {
          width: 100%;
        }

        .master-tabs-container {
          display: flex;
          gap: 12px;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 24px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .master-tabs-container::-webkit-scrollbar {
          display: none;
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
          margin-bottom: -2px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .master-tab:hover {
          color: #334155;
        }
        .master-tab.active {
          color: #0f172a;
          border-bottom-color: var(--topic-color, #059669);
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
          color: #059669;
        }
        .clean-verse-card:hover .ref-arrow, .verse-ref-link:hover .ref-arrow {
          color: #059669;
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
          background-color: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 20px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          color: #047857;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .topic-note-btn:hover {
          background-color: #d1fae5;
          border-color: #6ee7b7;
          color: #065f46;
          transform: translateY(-1px);
        }
        .topic-note-btn.active {
          color: #ffffff;
          background-color: #059669;
          border-color: #047857;
          box-shadow: 0 2px 4px rgba(5, 150, 105, 0.25);
        }
        .topic-note-btn svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        .verse-note-tooltip {
          margin-top: 12px;
          padding: 12px 14px;
          background-color: #ecfdf5;
          border-left: 3px solid #059669;
          border-radius: 0 8px 8px 0;
          font-family: var(--font-body);
          font-size: 13px;
          color: #065f46;
          line-height: 1.45;
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
          color: #059669;
        }
      ` }} />
    </div>
  );
}
