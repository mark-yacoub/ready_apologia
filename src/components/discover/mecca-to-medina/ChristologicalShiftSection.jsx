import React, { useState } from 'react';
import { parseQuranRef, renderFormattedMarkdown, renderInlineFormatting } from './meccaMedinaUtils.jsx';

export default function ChristologicalShiftSection({ section, base = '' }) {
  if (!section) return null;
  const { title, intro, subsections } = section;
  const [activeTab, setActiveTab] = useState('early');

  const exaltedSub = subsections?.find(s => s.id === 'exalted-titles');
  const polemicsSub = subsections?.find(s => s.id === 'medinan-polemics');

  return (
    <section id="christological-shift" className="mm-section-block christology-section">
      <div className="section-header-block">
        <span className="section-badge">SECTION 04</span>
        <h2 className="section-title">{title}</h2>
        {intro && <div className="section-intro">{renderFormattedMarkdown(intro)}</div>}
      </div>

      {/* Segmented Switch */}
      <div className="christology-controls" role="tablist" aria-label="Christology Comparison">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'early'}
          onClick={() => setActiveTab('early')}
          className={`christ-tab-btn ${activeTab === 'early' ? 'is-active early-active' : ''}`}
        >
          <span className="tab-dot early-dot"></span>
          <span>1. Exalted Early Titles</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'polemics'}
          onClick={() => setActiveTab('polemics')}
          className={`christ-tab-btn ${activeTab === 'polemics' ? 'is-active polemic-active' : ''}`}
        >
          <span className="tab-dot polemic-dot"></span>
          <span>2. Medinan Polemical Rebuttals</span>
        </button>
      </div>

      <div className="christology-content-display">
        {/* Part 1: Exalted Titles */}
        {activeTab === 'early' && exaltedSub && (
          <div className="christ-panel early-panel animate-fade-in">
            <div className="panel-header">
              <span className="panel-tag early-tag">DEVOTIONAL REVERENCE</span>
              <h3 className="panel-title">{exaltedSub.title}</h3>
            </div>

            <div className="attributes-grid">
              {exaltedSub.attributes && exaltedSub.attributes.map((attr, aIdx) => (
                <div key={aIdx} className="attribute-card">
                  <h4 className="attribute-title">{attr.attribute}</h4>
                  <div className="attr-verses-list">
                    {attr.verses && attr.verses.map((v, vIdx) => {
                      const verseUrl = parseQuranRef(v.internalReference || v.reference, base);
                      return (
                        <div key={vIdx} className="attr-verse-box">
                          <p className="verse-quote">"{renderInlineFormatting(v.text)}"</p>
                          <div className="verse-meta-row">
                            <span className="verse-ref-tag">{v.displayReference}</span>
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
              ))}
            </div>
          </div>
        )}

        {/* Part 2: Medinan Polemics */}
        {activeTab === 'polemics' && polemicsSub && (
          <div className="christ-panel polemics-panel animate-fade-in">
            <div className="panel-header">
              <span className="panel-tag polemics-tag">DOGMATIC REJECTION</span>
              <h3 className="panel-title">{polemicsSub.title}</h3>
            </div>
            {polemicsSub.content && <div className="panel-desc">{renderFormattedMarkdown(polemicsSub.content)}</div>}

            <div className="polemics-cards-grid">
              {polemicsSub.polemicsTable && polemicsSub.polemicsTable.map((pol, pIdx) => {
                const verseUrl = parseQuranRef(pol.internalReference || pol.reference, base);
                return (
                  <div key={pIdx} className="polemic-item-card">
                    <div className="polemic-head">
                      <span className="doctrine-tag">CHRISTIAN DOCTRINE</span>
                      <h4 className="doctrine-title">{pol.doctrine}</h4>
                    </div>
                    <div className="quranic-rebuttal-box">
                      <span className="rebuttal-label">QURANIC REFUTATION</span>
                      <p className="rebuttal-text">"{renderInlineFormatting(pol.quranicRefutation)}"</p>
                      <div className="verse-meta-row">
                        <span className="verse-ref-tag">{pol.displayVerseReference}</span>
                        {verseUrl && (
                          <a href={verseUrl} className="reader-link-btn">
                            <span>Open Surah</span>
                            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Eschatology */}
            {polemicsSub.eschatology && (
              <div className="eschatology-block">
                <div className="eschatology-header">
                  <span className="escha-tag">ESCHATOLOGICAL WITNESS</span>
                  <h4 className="escha-title">{polemicsSub.eschatology.topic}</h4>
                </div>
                <div className="escha-hadiths-grid">
                  {polemicsSub.eschatology.hadiths && polemicsSub.eschatology.hadiths.map((eh, ehIdx) => (
                    <div key={ehIdx} className="escha-hadith-box">
                      <div className="hadith-meta">
                        <span className="hadith-collection">{eh.collection}</span>
                        {eh.narrator && <span className="hadith-narrator">Narrator: {eh.narrator}</span>}
                      </div>
                      <div className="hadith-text">{renderFormattedMarkdown(eh.text)}</div>
                      {eh.url && (
                        <a href={eh.url} target="_blank" rel="noopener noreferrer" className="external-sunnah-link">
                          <span>Verify on Sunnah.com</span>
                          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .christology-section {
          margin-bottom: 36px;
        }

        .christology-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 16px;
          background: var(--color-background, #f4f4f5);
          padding: 4px;
          border-radius: 8px;
        }

        .christ-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 4px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-on-surface-variant, #71717a);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .christ-tab-btn.is-active {
          background: #ffffff;
          color: var(--color-primary, #09090b);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .tab-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .early-dot {
          background: #d97706;
        }

        .polemic-dot {
          background: #dc2626;
        }

        .christ-panel {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 12px;
          padding: 14px 12px;
        }

        .early-panel {
          border-top: 3px solid #d97706;
        }

        .polemics-panel {
          border-top: 3px solid #dc2626;
          background: #fffafa;
        }

        .panel-header {
          margin-bottom: 12px;
        }

        .panel-tag {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 4px;
        }

        .early-tag {
          background: #fef3c7;
          color: #92400e;
        }

        .polemics-tag {
          background: #fee2e2;
          color: #991b1b;
        }

        .panel-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: var(--color-primary, #09090b);
        }

        .panel-desc {
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--color-on-surface, #09090b);
          margin-bottom: 14px;
        }

        /* Attributes */
        .attributes-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .attribute-card {
          background: #fafafa;
          border: 1px solid #f4f4f5;
          border-radius: 8px;
          padding: 10px 10px;
        }

        .attribute-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #92400e;
          margin: 0 0 8px;
        }

        .attr-verses-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .attr-verse-box {
          background: #ffffff;
          border-left: 3px solid #d97706;
          border-radius: 4px;
          padding: 8px 10px;
          border-top: 1px solid #f4f4f5;
          border-right: 1px solid #f4f4f5;
          border-bottom: 1px solid #f4f4f5;
        }

        .verse-quote {
          font-family: var(--font-display, Georgia, serif);
          font-style: italic;
          font-size: 12.5px;
          line-height: 1.45;
          color: #18181b;
          margin: 0 0 6px;
        }

        /* Polemics */
        .polemics-cards-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .polemic-item-card {
          background: #ffffff;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 10px;
        }

        .polemic-head {
          margin-bottom: 6px;
        }

        .doctrine-tag {
          font-size: 9.5px;
          font-weight: 800;
          color: #71717a;
          letter-spacing: 0.05em;
        }

        .doctrine-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #18181b;
          margin: 2px 0 0;
        }

        .quranic-rebuttal-box {
          background: #fef2f2;
          border-left: 3px solid #dc2626;
          border-radius: 4px;
          padding: 8px 10px;
          margin-top: 6px;
        }

        .rebuttal-label {
          font-size: 9.5px;
          font-weight: 800;
          color: #dc2626;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 4px;
        }

        .rebuttal-text {
          font-family: var(--font-display, Georgia, serif);
          font-style: italic;
          font-size: 12.5px;
          line-height: 1.45;
          color: #7f1d1d;
          margin: 0 0 6px;
        }

        /* Eschatology */
        .eschatology-block {
          margin-top: 16px;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 12px 10px;
        }

        .eschatology-header {
          margin-bottom: 8px;
        }

        .escha-tag {
          font-size: 10px;
          font-weight: 800;
          color: #92400e;
        }

        .escha-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 14px;
          font-weight: 700;
          margin: 2px 0 0;
          color: #78350f;
        }

        .escha-hadiths-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .escha-hadith-box {
          background: #ffffff;
          border: 1px solid #fef3c7;
          border-radius: 6px;
          padding: 8px 10px;
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
          .christ-panel {
            padding: 16px 14px;
          }
          .panel-title {
            font-size: 17px;
          }
        }
      `}</style>
    </section>
  );
}
