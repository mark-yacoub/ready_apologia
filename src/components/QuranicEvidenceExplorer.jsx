import React, { useState, useMemo, useEffect } from 'react';
import ScrollableTrack from './ScrollableTrack.jsx';
import { trackEvidenceInteraction } from '../utils/analytics.js';

const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;

import { VerseItem } from './common/VerseItem.jsx';
import { EvidenceDropdown } from './common/EvidenceDropdown.jsx';
import '../styles/EvidenceExplorer.css';// --- Module-Level Static Constants (Zero Allocation per Render) ---
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

const getEvidenceTotalCount = (tData, verseLabels) => {
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

export default function QuranicEvidenceExplorer({ evidenceDropdownData = [], verseLabels = {}, drogeTranslation = {} }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return decodeURIComponent(window.location.hash.substring(1));
    }
    return '';
  });

  const evidenceId = 'quranic_deficiencies';
  const evidenceColor = { hex: '#059669', bgHex: '#d1fae5' }; // .theme-quran derived
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

  const handleTabClick = (label) => {
    setActiveTab(label);
    if (typeof window !== 'undefined') {
      const hash = label.replace(/\s+/g, '-');
      window.history.replaceState(null, '', `#${hash}`);
    }
  };

  // Derive current tab safely
  const currentTab = useMemo(() => {
    if (activeTab) {
      const match = sortedLabels.find(l => 
        l.toLowerCase() === activeTab.toLowerCase() || 
        l.replace(/\s+/g, '-') === activeTab ||
        l.replace(/\s+/g, '-').toLowerCase() === activeTab.toLowerCase()
      );
      if (match) return match;
    }
    return sortedLabels.length > 0 ? sortedLabels[0] : '';
  }, [activeTab, sortedLabels]);

  const evidenceOptions = evidenceDropdownData.map(t => {
    const isQuran = t.evidenceId === 'quranic_deficiencies';
    const computedName = t.evidenceData?.name || t.evidenceData?.Scripture?.['New Testament']?.title?.replace('New Testament ', '') || t.evidenceId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      id: t.evidenceId,
      title: computedName,
      count: t.totalCount !== undefined ? t.totalCount : getEvidenceTotalCount(t.evidenceData, verseLabels)
    };
  });

  return (
    <div className="evidence-explorer select-none relative">
      <nav className="breadcrumb-nav-bar" aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item">
            <a href={`${base}/`} className="breadcrumb-link">Ready Apologia</a>
          </li>
          <li className="breadcrumb-separator" aria-hidden="true">/</li>
          <li className="breadcrumb-item">
            <a href={`${base}/evidence`} className="breadcrumb-link">Evidence</a>
          </li>
          <li className="breadcrumb-separator" aria-hidden="true">/</li>
          <li className="breadcrumb-item breadcrumb-current" aria-current="page">
            <span>Quranic Deficiencies</span>
          </li>
        </ol>
      </nav>

      <div className="dedicated-evidence-wrapper" onClick={() => setDropdownOpen(false)}>
        <div
          className="dedicated-evidence-view-container animate-fade-in"
          style={{ '--evidence-color': evidenceColor.hex, '--evidence-bg': evidenceColor.bgHex }}
        >
          <header className="dedicated-hero-header" style={{ paddingBottom: '16px' }}>
            <EvidenceDropdown
              tTitle={tTitle}
              currentEvidenceId={evidenceId}
              evidenceOptions={evidenceOptions}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              base={base}
            />
            {/* Omitted the "Highlight in Scripture" functionality as requested */}
          </header>          <div className="dedicated-evidence-view">
            <ScrollableTrack containerClass="master-tabs-container" activeTrigger={currentTab}>
              {sortedLabels.map(label => {
                const count = map.get(label).length;
                return (
                  <button
                    key={label}
                    id={label.replace(/\s+/g, '-')}
                    className={`master-tab ${currentTab === label ? 'active' : ''}`}
                    onClick={() => handleTabClick(label)}
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
                            evidenceId={evidenceId}
                            categoryTitle={v.label}
                            isQuran={true}
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
    </div>
  );
}
