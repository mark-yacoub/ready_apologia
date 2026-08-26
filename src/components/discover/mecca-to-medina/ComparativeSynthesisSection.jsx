import React from 'react';
import { renderFormattedMarkdown, renderInlineFormatting } from './meccaMedinaUtils.jsx';

export default function ComparativeSynthesisSection({ section, base = '' }) {
  if (!section) return null;
  const { title, intro, comparisonRows, hadithCitation } = section;

  return (
    <section id="comparative-synthesis" className="mm-section-block synthesis-section">
      <div className="section-header-block">
        <span className="section-badge">SECTION 06</span>
        <h2 className="section-title">{title}</h2>
        {intro && <div className="section-intro">{renderFormattedMarkdown(intro)}</div>}
      </div>

      <div className="synthesis-cards-stack">
        {comparisonRows && comparisonRows.map((row, rIdx) => (
          <div key={rIdx} className="synthesis-card">
            <div className="synthesis-theme-badge">
              <span className="theme-idx">0{rIdx + 1}</span>
              <h3 className="theme-name">{row.theme}</h3>
            </div>

            <div className="synthesis-comparison-grid">
              {/* Jesus */}
              <div className="paradigm-box jesus-box">
                <div className="box-header">
                  <span className="figure-badge jesus-badge">THE NAZARENE PARADIGM</span>
                  <h4 className="figure-name">Jesus the Messiah</h4>
                </div>
                <div className="figure-statement">{renderFormattedMarkdown(row.jesus)}</div>
              </div>

              {/* Muhammad */}
              <div className="paradigm-box muhammad-box">
                <div className="box-header">
                  <span className="figure-badge muhammad-badge">THE MEDINAN PARADIGM</span>
                  <h4 className="figure-name">Muhammad of Medina</h4>
                </div>
                <div className="figure-statement">{renderFormattedMarkdown(row.muhammad)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Apostasy Hadith Citation */}
      {hadithCitation && (
        <div className="synthesis-hadith-card">
          <div className="hadith-meta">
            <span className="hadith-collection">{hadithCitation.collection}</span>
            {hadithCitation.narrator && <span className="hadith-narrator">Narrator: {hadithCitation.narrator}</span>}
          </div>
          <div className="hadith-text">"{renderFormattedMarkdown(hadithCitation.text)}"</div>
          {hadithCitation.url && (
            <a href={hadithCitation.url} target="_blank" rel="noopener noreferrer" className="external-sunnah-link">
              <span>Verify on Sunnah.com</span>
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          )}
        </div>
      )}

      <style>{`
        .synthesis-section {
          margin-bottom: 36px;
        }

        .synthesis-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 16px;
        }

        .synthesis-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 12px;
          padding: 14px 12px;
        }

        .synthesis-theme-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--color-outline-variant, #e4e4e7);
        }

        .theme-idx {
          font-size: 11px;
          font-weight: 800;
          color: var(--color-secondary, #974543);
        }

        .theme-name {
          font-family: var(--font-display, Georgia, serif);
          font-size: 15px;
          font-weight: 700;
          margin: 0;
          color: var(--color-primary, #09090b);
        }

        .synthesis-comparison-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .paradigm-box {
          border-radius: 8px;
          padding: 10px 10px;
          border: 1px solid transparent;
        }

        .jesus-box {
          background: #fdfaf6;
          border-color: #fde68a;
          border-left: 3px solid #d97706;
        }

        .muhammad-box {
          background: #f8fafc;
          border-color: #cbd5e1;
          border-left: 3px solid #475569;
        }

        .box-header {
          margin-bottom: 6px;
        }

        .figure-badge {
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.05em;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 2px;
        }

        .jesus-badge {
          background: #fef3c7;
          color: #92400e;
        }

        .muhammad-badge {
          background: #e2e8f0;
          color: #1e293b;
        }

        .figure-name {
          font-family: var(--font-display, Georgia, serif);
          font-size: 13.5px;
          font-weight: 700;
          margin: 0;
          color: #09090b;
        }

        .figure-statement {
          font-size: 12.5px;
          line-height: 1.5;
          color: #27272a;
        }

        .synthesis-hadith-card {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 8px;
          padding: 12px 10px;
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

        .mm-blockquote {
          margin: 8px 0;
          padding: 6px 12px;
          background: #f4f4f5;
          border-left: 3px solid var(--color-secondary, #974543);
          border-radius: 0 6px 6px 0;
          font-style: italic;
        }

        .mm-para {
          margin: 0 0 6px 0;
        }
        .mm-para:last-child {
          margin-bottom: 0;
        }

        @media (min-width: 640px) {
          .synthesis-card {
            padding: 16px 14px;
          }
          .synthesis-comparison-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </section>
  );
}
