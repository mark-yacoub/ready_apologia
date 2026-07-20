import React, { useState, useMemo } from 'react';
import ScrollableTrack from './ScrollableTrack.jsx';
import { trackEvidenceInteraction } from '../utils/analytics.js';

const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;

import { VerseItem } from './common/VerseItem.jsx';
import { EvidenceDropdown } from './common/EvidenceDropdown.jsx';
import '../styles/EvidenceExplorer.css';

// --- Module-Level Static Constants & Mappers ---
const extractSpecificError = (explanation) => {
  let phrase = explanation.split('.')[0].trim();
  if (phrase.startsWith('States the human embryo') || phrase.startsWith('States man becomes a clot')) return 'Embryology';
  if (phrase.startsWith('Claims mountains') || phrase.startsWith('Reiterates the claim') || phrase.startsWith('Describes mountains')) return 'Geology';
  return phrase;
};

const CATEGORY_MAP = {
  // Astronomy & Cosmology
  'Geocentricism': 'Astronomy & Cosmology',
  'Cosmology / Flat Earth': 'Astronomy & Cosmology',
  'Astronomy': 'Astronomy & Cosmology',
  'Stars are Missiles Shot at Devils': 'Astronomy & Cosmology',
  'Moon Emits Light': 'Astronomy & Cosmology',
  'Cosmology': 'Astronomy & Cosmology',
  'Seven Heavens': 'Astronomy & Cosmology',
  'Stars are Located in the Nearest Heaven': 'Astronomy & Cosmology',
  'Earth Created in Six Days': 'Astronomy & Cosmology',
  'Earth Created before Stars': 'Astronomy & Cosmology',
  'Sky is a Tent/Dome': 'Astronomy & Cosmology',
  'Sky can Fall Down on People': 'Astronomy & Cosmology',
  'The Earth is Flat': 'Astronomy & Cosmology',
  'The Earth does not Rotate': 'Astronomy & Cosmology',

  // Biology & Life Sciences
  'Evolution': 'Biology & Life Sciences',
  'Anatomy': 'Biology & Life Sciences',
  'Embryology': 'Biology & Life Sciences',
  'All Organisms are Created in Pairs': 'Biology & Life Sciences',
  'Source and Purity of Milk': 'Biology & Life Sciences',
  'The Heart as the Organ of Thinking': 'Biology & Life Sciences',

  // Earth Sciences
  'Permanent Barrier between Fresh and Salt Water': 'Earth Sciences',
  'Geology': 'Earth Sciences',
  'No Evaporation in Water Cycle': 'Earth Sciences',

  // Mathematics & Logic
  'Mathematical Error in Hereditary Laws': 'Mathematics & Logic'
};

const getMasterCategory = (specificError) => {
  return CATEGORY_MAP[specificError] || 'Other';
};

const getEvidenceTotalCount = (t) => {
  if (t.totalCount !== undefined) return t.totalCount; // Prioritize explicitly set totalCount
  const tData = t.evidenceData;
  if (!tData) return 0;

  let count = 0;
  if (tData.Scripture) {
    ['New Testament', 'Old Testament'].forEach(testament => {
      const s = tData.Scripture[testament]?.structure;
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

export default function ScientificErrorsExplorer({ evidenceDropdownData = [], scientificErrors = {}, drogeTranslation = {} }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const evidenceId = 'scientific_errors';
  const evidenceColor = { hex: '#059669', bgHex: '#d1fae5' }; // .theme-quran derived
  const tTitle = "Scientific Errors";

  // Parse & Categorize Data Purely (No Render Side-Effects)
  const { map, sortedLabels } = useMemo(() => {
    const dataMap = new Map();

    for (const [vId, errorObj] of Object.entries(scientificErrors)) {
      const [surahNum, verseNum] = vId.split(':').map(Number);
      const explanation = errorObj.explanation;
      const specificError = extractSpecificError(explanation);
      const masterCat = getMasterCategory(specificError);

      const translatedText = drogeTranslation[vId]?.text || 'Translation unavailable';
      const note = explanation;

      if (!dataMap.has(masterCat)) dataMap.set(masterCat, []);
      dataMap.get(masterCat).push({ vId, surahNum, verseNum, text: translatedText, note, specificError });
    }

    // Sort tabs according to hardcoded sequence
    const priority = ['Astronomy & Cosmology', 'Biology & Life Sciences', 'Earth Sciences', 'Mathematics & Logic', 'Other'];
    const sorted = Array.from(dataMap.keys()).sort((a, b) => {
      const pA = priority.indexOf(a) !== -1 ? priority.indexOf(a) : 999;
      const pB = priority.indexOf(b) !== -1 ? priority.indexOf(b) : 999;
      if (pA !== pB) return pA - pB;
      return a.localeCompare(b);
    });

    // Sort verses numerically within each tab
    for (const label of sorted) {
      dataMap.get(label).sort((a, b) => {
        return a.surahNum !== b.surahNum ? a.surahNum - b.surahNum : a.verseNum - b.verseNum;
      });
    }

    return { map: dataMap, sortedLabels: sorted };
  }, [scientificErrors, drogeTranslation]);

  // Derive current tab without calling setState inside render/useMemo
  const currentTab = activeTab || (sortedLabels.length > 0 ? sortedLabels[0] : '');

  const evidenceOptions = evidenceDropdownData.map(t => {
    const computedName = t.evidenceData?.name || t.evidenceData?.Scripture?.['New Testament']?.title?.replace('New Testament ', '') || t.evidenceId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return {
      id: t.evidenceId,
      title: computedName,
      count: t.totalCount !== undefined ? t.totalCount : getEvidenceTotalCount(t)
    };
  });

  return (
    <div className="evidence-explorer select-none relative">
      <div className="ios-nav-container">
        <a href={`${base}/evidence`} className="ios-nav-back" title="All Evidence">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span>All Evidence</span>
        </a>
      </div>

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
          </header>

          <div className="dedicated-evidence-view">
            <ScrollableTrack containerClass="master-tabs-container" activeTrigger={currentTab}>
              {sortedLabels.map(label => {
                const count = map.get(label).length;
                return (
                  <button
                    key={label}
                    id={label.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}
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
                            evidenceId={evidenceId}
                            categoryTitle={v.specificError}
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
