import React from 'react';
import { parseQuranRef, parseTafsirRef, renderFormattedMarkdown, renderInlineFormatting } from './meccaMedinaUtils.jsx';

export default function DoctrineOfNaskhSection({ section, base = '' }) {
  if (!section) return null;
  const { title, intro, scripturalBasis, classicalDefinitions, caseStudy } = section;

  return (
    <section id="doctrine-of-naskh" className="mm-section-block naskh-section">
      <div className="section-header-block">
        <span className="section-badge">SECTION 05</span>
        <h2 className="section-title">{title}</h2>
        {intro && <div className="section-intro">{renderFormattedMarkdown(intro)}</div>}
      </div>

      {/* Scriptural Basis */}
      {scripturalBasis && (
        <div className="naskh-card basis-card">
          <div className="card-badge-row">
            <span className="card-mini-badge">SCRIPTURAL BASIS IN THE QURAN</span>
          </div>
          <div className="scripture-basis-grid">
            {scripturalBasis.map((sb, sbIdx) => {
              const verseUrl = parseQuranRef(sb.internalReference || sb.reference, base);
              return (
                <div key={sbIdx} className="basis-quote-box">
                  <p className="verse-quote">"{renderInlineFormatting(sb.text)}"</p>
                  <div className="verse-meta-row">
                    <span className="verse-ref-tag">{sb.displayReference}</span>
                    {verseUrl && (
                      <a href={verseUrl} className="reader-link-btn">
                        <span>Read in Quran</span>
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Classical Definitions */}
      {classicalDefinitions && (
        <div className="naskh-card definitions-card">
          <div className="card-badge-row">
            <span className="card-mini-badge">CLASSICAL SCHOLARLY DEFINITIONS</span>
          </div>
          <div className="definitions-grid">
            {classicalDefinitions.map((cd, cdIdx) => {
              const tafsirUrl = parseTafsirRef(cd.internalReference || cd.reference, base);
              return (
                <div key={cdIdx} className="definition-box">
                  <div className="def-head">
                    <span className="scholar-name">{cd.scholar}</span>
                    <span className="scholar-source">{cd.displaySource}</span>
                  </div>
                  <div className="def-quote">{renderFormattedMarkdown(cd.quote)}</div>
                  {tafsirUrl && (
                    <div className="tafsir-link-wrap">
                      <a href={tafsirUrl} className="tafsir-drawer-link">
                        <span>View Commentary in Drawer</span>
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Case Study: Surah 2:109 */}
      {caseStudy && (
        <div className="naskh-card casestudy-card">
          <div className="card-badge-row">
            <span className="card-mini-badge casestudy-badge">CASE STUDY</span>
          </div>
          <h3 className="casestudy-title">{caseStudy.title}</h3>

          {caseStudy.verse && (
            <div className="casestudy-verse-box">
              <span className="cs-label">THE ABROGATED VERSE (MANSUKH)</span>
              <p className="verse-quote">"{renderInlineFormatting(caseStudy.verse.text)}"</p>
              <div className="verse-meta-row">
                <span className="verse-ref-tag">{caseStudy.verse.displayReference}</span>
                {parseQuranRef(caseStudy.verse.internalReference || caseStudy.verse.reference, base) && (
                  <a href={parseQuranRef(caseStudy.verse.internalReference || caseStudy.verse.reference, base)} className="reader-link-btn">
                    <span>Read in Quran</span>
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {caseStudy.scholarlyConsensus && (
            <div className="cs-scholars-list">
              <span className="cs-label">CLASSICAL TAFSIR CONSENSUS ON ABROGATION</span>
              {caseStudy.scholarlyConsensus.map((sc, scIdx) => {
                const tafsirUrl = parseTafsirRef(sc.internalReference || sc.reference, base);
                return (
                  <div key={scIdx} className="cs-scholar-box">
                    <div className="def-head">
                      <span className="scholar-name">{sc.scholar}</span>
                      <span className="scholar-source">{sc.displaySource}</span>
                    </div>
                    <div className="cs-quote">{renderFormattedMarkdown(sc.quote)}</div>
                    {tafsirUrl && (
                      <div className="tafsir-link-wrap">
                        <a href={tafsirUrl} className="tafsir-drawer-link">
                          <span>View Commentary in Drawer</span>
                          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {caseStudy.abrogationScope && (
            <div className="abrogation-scope-box">
              <div className="scope-badge">TOTAL SCHOLARLY SCOPE</div>
              <div className="scope-text">{renderFormattedMarkdown(caseStudy.abrogationScope)}</div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .naskh-section {
          margin-bottom: 36px;
        }

        .naskh-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 12px;
          padding: 14px 12px;
          margin-bottom: 16px;
        }

        .card-badge-row {
          margin-bottom: 10px;
        }

        .card-mini-badge {
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--color-secondary, #974543);
          background: rgba(151, 69, 67, 0.08);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .casestudy-badge {
          background: #fee2e2;
          color: #991b1b;
        }

        .casestudy-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 12px;
          color: var(--color-primary, #09090b);
        }

        .scripture-basis-grid, .definitions-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .basis-quote-box {
          background: #fdfdfd;
          border-left: 3px solid var(--color-secondary, #974543);
          border-radius: 6px;
          padding: 10px 10px;
          border-top: 1px solid #f4f4f5;
          border-right: 1px solid #f4f4f5;
          border-bottom: 1px solid #f4f4f5;
        }

        .definition-box, .cs-scholar-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 10px;
        }

        .def-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 6px;
        }

        .scholar-name {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
        }

        .scholar-source {
          font-size: 10.5px;
          color: #64748b;
        }

        .def-quote, .cs-quote {
          font-size: 12.5px;
          line-height: 1.5;
          color: #334155;
          margin: 0 0 8px;
        }

        /* Case Study */
        .casestudy-verse-box {
          background: #fff5f5;
          border-left: 3px solid #dc2626;
          border-radius: 6px;
          padding: 10px 10px;
          margin-bottom: 14px;
        }

        .cs-label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #71717a;
          margin-bottom: 6px;
        }

        .cs-scholars-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }

        .abrogation-scope-box {
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 12px 10px;
        }

        .scope-badge {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #92400e;
          margin-bottom: 4px;
        }

        .scope-text {
          font-size: 13px;
          line-height: 1.5;
          color: #78350f;
          font-weight: 500;
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
          background: #f1f5f9;
          border-left: 3px solid var(--color-secondary, #974543);
          border-radius: 0 6px 6px 0;
          font-style: italic;
        }

        .mm-blockquote p {
          margin: 0;
          font-size: 12.5px;
          line-height: 1.5;
        }

        .mm-inline-blockquote {
          display: block;
          margin: 4px 0;
          padding: 4px 8px;
          background: #f1f5f9;
          border-left: 3px solid var(--color-secondary, #974543);
          border-radius: 0 4px 4px 0;
          font-style: italic;
        }

        .mm-para {
          margin: 0 0 6px 0;
        }
        .mm-para:last-child {
          margin-bottom: 0;
        }

        @media (min-width: 640px) {
          .naskh-card {
            padding: 16px 14px;
          }
          .casestudy-title {
            font-size: 17px;
          }
        }
      `}</style>
    </section>
  );
}
