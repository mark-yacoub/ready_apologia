import React, { useState, useMemo } from 'react';
import { getEvidenceColor } from '../utils/evidenceColors.js';
import { EVIDENCE_TAXONOMY } from '../data/evidenceTaxonomy.js';
import '../styles/EvidenceExplorer.css';

const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;

import { EvidenceDropdown } from './common/EvidenceDropdown.jsx';
import { formatEvidenceTitle } from '../utils/evidenceHelpers.js';
import { getEvidenceTotalCount } from '../utils/evidenceCounters.js';
import { useActiveEvidence } from '../hooks/useActiveEvidence.js';

import { PropheciesDedicatedView } from './evidence/views/PropheciesDedicatedView.jsx';
import { DedicatedEvidenceView } from './evidence/views/DedicatedEvidenceView.jsx';
import { AuthorshipDedicatedView } from './evidence/views/AuthorshipDedicatedView.jsx';

export default function EvidenceExplorer({ evidence = [], initialEvidenceId = null }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [activeHighlightEvidence, toggleHighlight] = useActiveEvidence();
  const [activeMainHeading, setActiveMainHeading] = useState('Christianity');
  const isDedicatedPage = Boolean(initialEvidenceId);

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

    const unmappedEvidence = evidence.filter(t => !mappedIds.has(t.evidenceId));
    if (unmappedEvidence.length > 0) {
      sections.push({
        mainHeading: 'General Evidence',
        subHeadings: [{ title: 'Other', items: unmappedEvidence }]
      });
    }
    return sections;
  }, [evidence, evidenceMap]);

  const displayEvidence = isDedicatedPage ? [evidenceMap.get(initialEvidenceId)].filter(Boolean) : evidence;

  const evidenceOptions = useMemo(() => evidence.map(t => ({
    id: t.evidenceId,
    title: formatEvidenceTitle(t.evidenceId, t.evidenceData),
    count: getEvidenceTotalCount(t)
  })), [evidence]);

  // Note: evidenceSearch is available from state if we choose to add a search bar to dropdown later
  const filteredEvidenceOptions = useMemo(() => {
    return evidenceOptions.filter(t => t.title.toLowerCase().includes(evidenceSearch.toLowerCase()));
  }, [evidenceOptions, evidenceSearch]);

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
            const tTitle = formatEvidenceTitle(tId, tData);
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
          {/* Swipeable Hero Cards for Main Categories */}
          <div className="hero-cards-container">
            {EVIDENCE_TAXONOMY.map(section => {
              const isActive = activeMainHeading === section.mainHeading;
              const isChristianity = section.mainHeading === 'Christianity';
              return (
                <button
                  type="button"
                  key={section.mainHeading}
                  className={`category-hero-card ${isActive ? 'is-active' : ''} ${isChristianity ? 'christian-theme' : 'islam-theme'}`}
                  onClick={(e) => {
                    setActiveMainHeading(section.mainHeading);
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }}
                >
                  <div className="hero-card-content">
                    <h2 className="hero-card-title">{section.mainHeading}</h2>
                    <p className="hero-card-subtitle">
                      {isChristianity ? 'Defending Core Theology' : 'Evaluating Scripture'}
                    </p>
                  </div>
                  <div className="hero-watermark">
                    {isChristianity ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3v18M7 8h10"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Original Style Evidence Cards for Subheadings */}
          <div className="inset-groups-wrapper animate-fade-in" key={activeMainHeading}>
            {categorizedSections
              .filter(s => s.mainHeading === activeMainHeading)
              .map(classification =>
                classification.subHeadings.map(subGroup => (
                  <div key={subGroup.title} className="sub-heading-section">
                    <h3 className="sub-heading-title"><span>{subGroup.title}</span></h3>
                    <div className="evidence-accordion-list">
                      {subGroup.items.map(t => {
                        const tId = t.evidenceId;
                        const tData = t.evidenceData;
                        const tTitle = formatEvidenceTitle(tId, tData);
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
                                  type="button"
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
                ))
              )}
          </div>
        </div>
      )}
    </div>
  );
}
