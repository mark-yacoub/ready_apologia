import React from 'react';
import { parseQuranRef, parseTafsirRef, renderFormattedMarkdown, renderInlineFormatting } from './meccaMedinaUtils.jsx';
import CollapsibleHadithBox from './CollapsibleHadithBox.jsx';

export default function WarfareStagesTimeline({ section, base = '' }) {
  if (!section) return null;
  const { title, intro, stages } = section;

  return (
    <section id="four-stages-of-warfare" className="mm-section-block warfare-section">
      <div className="section-header-block">
        <span className="section-badge">SECTION 02</span>
        <h2 className="section-title">{title}</h2>
        {intro && <div className="section-intro">{renderFormattedMarkdown(intro)}</div>}
      </div>

      <div className="stages-timeline">
        {stages && stages.map((stage) => {
          const isStage4 = stage.stageNumber === 4;
          return (
            <div key={stage.stageNumber} className={`stage-card stage-${stage.stageNumber} ${isStage4 ? 'sword-stage-card' : ''}`}>
              <div className="stage-card-header">
                <div className="stage-num-badge">STAGE 0{stage.stageNumber}</div>
                <div className="stage-period-badge">{stage.period}</div>
              </div>

              <h3 className="stage-name">{stage.name}</h3>
              <div className="stage-summary">{renderFormattedMarkdown(stage.summary)}</div>

              {/* Primary Verse (Single) */}
              {stage.primaryVerse && (
                <div className="stage-verse-block">
                  <div className="block-label">PRIMARY QURANIC MANDATE</div>
                  <p className="verse-quote">"{renderInlineFormatting(stage.primaryVerse.text)}"</p>
                  <div className="verse-meta-row">
                    <span className="verse-ref-tag">{stage.primaryVerse.displayReference}</span>
                    {parseQuranRef(stage.primaryVerse.internalReference || stage.primaryVerse.reference, base) && (
                      <a
                        href={parseQuranRef(stage.primaryVerse.internalReference || stage.primaryVerse.reference, base)}
                        className="reader-link-btn"
                        title={`Read ${stage.primaryVerse.displayReference} in context`}
                      >
                        <span>Open Surah</span>
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Primary Verses (Array) */}
              {stage.primaryVerses && (
                <div className="stage-verses-list">
                  <div className="block-label">PRIMARY QURANIC MANDATES</div>
                  {stage.primaryVerses.map((pv, pvIdx) => {
                    const verseUrl = parseQuranRef(pv.internalReference || pv.reference, base);
                    return (
                      <div key={pvIdx} className="stage-verse-block mini-verse-block">
                        <p className="verse-quote">"{renderInlineFormatting(pv.text)}"</p>
                        <div className="verse-meta-row">
                          <span className="verse-ref-tag">{pv.displayReference}</span>
                          {verseUrl && (
                            <a href={verseUrl} className="reader-link-btn">
                              <span>Open Surah</span>
                              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Key Mandates (Stage 4) */}
              {stage.keyMandates && (
                <div className="key-mandates-list">
                  <div className="block-label">THE SWORD VERSES (AYAT AL-SAYF)</div>
                  {stage.keyMandates.map((km, kmIdx) => {
                    const verseUrl = parseQuranRef(km.internalReference || km.reference, base);
                    return (
                      <div key={kmIdx} className="mandate-item-card">
                        <h4 className="mandate-title">{km.title}</h4>
                        <p className="verse-quote">"{renderInlineFormatting(km.text)}"</p>
                        <div className="verse-meta-row">
                          <span className="verse-ref-tag">{km.displayReference}</span>
                          {verseUrl && (
                            <a href={verseUrl} className="reader-link-btn">
                              <span>Open Surah</span>
                              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tafsir Excerpts */}
              {stage.tafsirExcerpts && stage.tafsirExcerpts.length > 0 && (
                <div className="tafsir-excerpts-block">
                  <div className="block-label">CLASSICAL TAFSIR EXEGETICAL CONSENSUS</div>
                  <div className="tafsir-cards-grid">
                    {stage.tafsirExcerpts.map((te, teIdx) => {
                      const tafsirUrl = parseTafsirRef(te.internalReference || te.reference, base);
                      return (
                        <div key={teIdx} className="tafsir-item-card">
                          <div className="tafsir-head">
                            <span className="scholar-name">{te.scholar}</span>
                            <span className="tafsir-src">{te.displaySource}</span>
                          </div>
                          <div className="tafsir-text">{renderFormattedMarkdown(te.text)}</div>
                          {tafsirUrl && (
                            <div className="tafsir-link-wrap">
                              <a href={tafsirUrl} className="tafsir-drawer-link">
                                <span>View Full Commentary in Drawer</span>
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

              {/* Hadith Evidence */}
              {stage.hadithEvidence && (
                <div className="hadith-evidence-block">
                  <div className="block-label">AUTHENTIC SUNNI HADITH WITNESS</div>
                  {Array.isArray(stage.hadithEvidence) ? (
                    <div className="hadiths-grid">
                      {stage.hadithEvidence.map((h, hIdx) => (
                        <CollapsibleHadithBox key={hIdx} hadith={h} threshold={320} />
                      ))}
                    </div>
                  ) : (
                    <CollapsibleHadithBox hadith={stage.hadithEvidence} threshold={320} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .warfare-section {
          margin-bottom: 36px;
        }

        .stages-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .stage-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 12px;
          padding: 14px 12px;
          position: relative;
        }

        .sword-stage-card {
          border-left: 4px solid #b91c1c;
          background: #fffafa;
        }

        .stage-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .stage-num-badge {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--color-secondary, #974543);
          background: rgba(151, 69, 67, 0.08);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .stage-period-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-on-surface-variant, #71717a);
        }

        .stage-name {
          font-family: var(--font-display, Georgia, serif);
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 8px;
          color: var(--color-primary, #09090b);
        }

        .stage-summary {
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--color-on-surface, #09090b);
          margin: 0 0 12px;
        }

        .block-label {
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--color-on-surface-variant, #71717a);
          margin-bottom: 6px;
        }

        .stage-verse-block, .mandate-item-card {
          background: #fdfdfd;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-left: 3px solid var(--color-secondary, #974543);
          border-radius: 6px;
          padding: 10px 10px;
          margin-bottom: 10px;
        }

        .mandate-title {
          font-size: 13px;
          font-weight: 700;
          margin: 0 0 4px;
          color: #991b1b;
        }

        .verse-quote {
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

        .verse-ref-tag {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--color-secondary, #974543);
        }

        .reader-link-btn, .tafsir-drawer-link, .external-sunnah-link {
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

        .reader-link-btn:hover, .tafsir-drawer-link:hover, .external-sunnah-link:hover {
          color: var(--color-primary, #09090b);
          border-color: #a1a1aa;
        }

        /* Tafsir */
        .tafsir-excerpts-block {
          margin-top: 12px;
        }

        .tafsir-cards-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tafsir-item-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 10px;
        }

        .tafsir-head {
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

        .tafsir-src {
          font-size: 10.5px;
          color: #64748b;
        }

        .tafsir-text {
          font-size: 12.5px;
          line-height: 1.5;
          color: #334155;
          margin: 0 0 8px;
        }

        .tafsir-link-wrap {
          display: flex;
          justify-content: flex-end;
        }

        /* Hadith */
        .hadith-evidence-block {
          margin-top: 12px;
        }

        .hadiths-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hadith-card {
          background: #fdfaf6;
          border: 1px solid #fed7aa;
          border-radius: 8px;
          padding: 10px 10px;
        }

        .hadith-meta {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 6px;
        }

        .hadith-collection {
          font-size: 11.5px;
          font-weight: 700;
          color: #9a3412;
        }

        .hadith-narrator {
          font-size: 10.5px;
          color: #7c2d12;
        }

        .hadith-text {
          font-size: 12.5px;
          line-height: 1.5;
          color: #431407;
          margin: 0 0 8px;
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
          .stage-card {
            padding: 16px 14px;
          }
          .stage-name {
            font-size: 17px;
          }
        }
      `}</style>
    </section>
  );
}
