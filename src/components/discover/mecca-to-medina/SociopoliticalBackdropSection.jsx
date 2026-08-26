import React, { useState } from 'react';
import { parseQuranRef, renderFormattedMarkdown, renderInlineFormatting } from './meccaMedinaUtils.jsx';

export default function SociopoliticalBackdropSection({ section, base = '' }) {
  if (!section) return null;
  const { title, intro, comparison, subsections } = section;
  const [activeTab, setActiveTab] = useState('mecca');

  return (
    <section id="sociopolitical-backdrop" className="mm-section-block backdrop-section">
      <div className="section-header-block">
        <span className="section-badge">SECTION 01</span>
        <h2 className="section-title">{title}</h2>
        {intro && <div className="section-intro">{renderFormattedMarkdown(intro)}</div>}
      </div>

      {/* Interactive Two-Era Segmented Switch */}
      {comparison && (
        <div className="era-comparison-container">
          <div className="era-tab-controls" role="tablist" aria-label="Era Comparison">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'mecca'}
              onClick={() => setActiveTab('mecca')}
              className={`era-tab-btn mecca-tab ${activeTab === 'mecca' ? 'is-active' : ''}`}
            >
              <span className="tab-dot mecca-dot"></span>
              <span className="tab-text">Meccan Era (610–622 AD)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'medina'}
              onClick={() => setActiveTab('medina')}
              className={`era-tab-btn medina-tab ${activeTab === 'medina' ? 'is-active' : ''}`}
            >
              <span className="tab-dot medina-dot"></span>
              <span className="tab-text">Medinan Era (622–632 AD)</span>
            </button>
          </div>

          <div className="era-card-display">
            {activeTab === 'mecca' ? (
              <div className="era-card mecca-era-card animate-fade-in">
                <div className="era-card-head">
                  <div className="era-period-tag mecca-tag">MECCA • 13 YEARS</div>
                  <h3 className="era-heading">{comparison.meccanPeriod.status}</h3>
                </div>
                <div className="era-metrics-grid">
                  <div className="metric-row">
                    <span className="metric-label">Socio-Political Context:</span>
                    <span className="metric-val">{renderInlineFormatting(comparison.meccanPeriod.context)}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Revelation Style:</span>
                    <span className="metric-val">{renderInlineFormatting(comparison.meccanPeriod.revelationStyle)}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Core Ethos:</span>
                    <span className="metric-val">{renderInlineFormatting(comparison.meccanPeriod.coreEthos)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="era-card medina-era-card animate-fade-in">
                <div className="era-card-head">
                  <div className="era-period-tag medina-tag">MEDINA • 10 YEARS</div>
                  <h3 className="era-heading">{comparison.medinanPeriod.status}</h3>
                </div>
                <div className="era-metrics-grid">
                  <div className="metric-row">
                    <span className="metric-label">Socio-Political Context:</span>
                    <span className="metric-val">{renderInlineFormatting(comparison.medinanPeriod.context)}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Revelation Style:</span>
                    <span className="metric-val">{renderInlineFormatting(comparison.medinanPeriod.revelationStyle)}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Core Ethos:</span>
                    <span className="metric-val">{renderInlineFormatting(comparison.medinanPeriod.coreEthos)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subsections: Meccan Crucible & Medinan Sovereign */}
      {subsections && (
        <div className="subsections-list">
          {subsections.map((sub) => (
            <div key={sub.id} className="subsection-card">
              <h3 className="subsection-title">{sub.title}</h3>
              {sub.content && <div className="subsection-content">{renderFormattedMarkdown(sub.content)}</div>}

              {sub.verses && sub.verses.length > 0 && (
                <div className="subsection-verses-grid">
                  {sub.verses.map((v, vIdx) => {
                    const verseUrl = parseQuranRef(v.internalReference || v.reference, base);
                    return (
                      <div key={vIdx} className="verse-quote-box">
                        <p className="verse-text">"{renderInlineFormatting(v.text)}"</p>
                        <div className="verse-meta-row">
                          <span className="verse-ref-label">{v.displayReference}</span>
                          {verseUrl && (
                            <a
                              href={verseUrl}
                              className="verse-reader-link"
                              title={`Open ${v.displayReference} in Quran Reader`}
                            >
                              <span>Read in Quran</span>
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .backdrop-section {
          margin-bottom: 36px;
        }

        .section-header-block {
          margin-bottom: 18px;
        }

        .section-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--color-secondary, #974543);
          margin-bottom: 4px;
        }

        .section-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 18px;
          font-weight: 700;
          line-height: 1.3;
          margin: 0 0 8px;
          color: var(--color-primary, #09090b);
        }

        .section-intro {
          font-size: 14px;
          line-height: 1.55;
          color: var(--color-on-surface-variant, #71717a);
        }

        /* Era Comparison */
        .era-comparison-container {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 20px;
        }

        .era-tab-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 12px;
          background: var(--color-background, #f4f4f5);
          padding: 4px;
          border-radius: 8px;
        }

        .era-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 4px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-on-surface-variant, #71717a);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .era-tab-btn.is-active {
          background: #ffffff;
          color: var(--color-primary, #09090b);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .tab-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .mecca-dot {
          background: #d97706;
        }

        .medina-dot {
          background: #475569;
        }

        .era-card {
          border-radius: 10px;
          padding: 14px 12px;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
        }

        .mecca-era-card {
          background: #fefdf9;
          border-color: #fde68a;
        }

        .medina-era-card {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .era-card-head {
          margin-bottom: 12px;
        }

        .era-period-tag {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 2px 6px;
          border-radius: 4px;
          margin-bottom: 4px;
        }

        .mecca-tag {
          background: #fef3c7;
          color: #92400e;
        }

        .medina-tag {
          background: #e2e8f0;
          color: #1e293b;
        }

        .era-heading {
          font-family: var(--font-display, Georgia, serif);
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: var(--color-primary, #09090b);
        }

        .era-metrics-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .metric-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 12.5px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .metric-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .metric-label {
          font-weight: 700;
          color: var(--color-on-surface-variant, #71717a);
          font-size: 11.5px;
        }

        .metric-val {
          color: var(--color-on-surface, #09090b);
          line-height: 1.45;
        }

        /* Subsections */
        .subsections-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .subsection-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 12px;
          padding: 14px 12px;
        }

        .subsection-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 8px;
          color: var(--color-primary, #09090b);
        }

        .subsection-content {
          font-size: 13.5px;
          line-height: 1.55;
          color: var(--color-on-surface, #09090b);
          margin-bottom: 12px;
        }

        .subsection-verses-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .verse-quote-box {
          background: #fafafa;
          border-left: 3px solid var(--color-secondary, #974543);
          border-radius: 6px;
          padding: 10px 12px;
        }

        .verse-text {
          font-family: var(--font-display, Georgia, serif);
          font-style: italic;
          font-size: 13px;
          line-height: 1.5;
          color: #18181b;
          margin: 0 0 8px;
        }

        .verse-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
        }

        .verse-ref-label {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--color-secondary, #974543);
        }

        .verse-reader-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-on-surface-variant, #71717a);
          text-decoration: none;
          padding: 2px 8px;
          border-radius: 4px;
          background: #ffffff;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          transition: all 0.15s ease;
        }

        .verse-reader-link:hover {
          color: var(--color-primary, #09090b);
          border-color: #a1a1aa;
        }

        .mm-bold {
          font-weight: 700;
          color: inherit;
        }

        .mm-em {
          font-style: italic;
          color: inherit;
        }

        .mm-quran-bracket {
          background: #fef2f2;
          color: #7f1d1d;
          border: 1px solid #fecaca;
          font-family: var(--font-display, Georgia, serif);
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          display: inline-block;
          font-style: normal;
        }

        .mm-para {
          margin: 0 0 6px 0;
        }
        .mm-para:last-child {
          margin-bottom: 0;
        }

        @media (min-width: 640px) {
          .section-title {
            font-size: 20px;
          }
          .era-card {
            padding: 16px 14px;
          }
          .subsection-card {
            padding: 16px 14px;
          }
        }
      `}</style>
    </section>
  );
}
