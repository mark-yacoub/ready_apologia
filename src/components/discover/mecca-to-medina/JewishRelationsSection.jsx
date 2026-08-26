import React from 'react';
import { parseQuranRef, renderFormattedMarkdown, renderInlineFormatting } from './meccaMedinaUtils.jsx';
import CollapsibleHadithBox from './CollapsibleHadithBox.jsx';

export default function JewishRelationsSection({ section, base = '' }) {
  if (!section) return null;
  const { title, intro, subsections } = section;

  return (
    <section id="relations-with-jewish-tribes" className="mm-section-block jewish-relations-section">
      <div className="section-header-block">
        <span className="section-badge">SECTION 03</span>
        <h2 className="section-title">{title}</h2>
        {intro && <div className="section-intro">{renderFormattedMarkdown(intro)}</div>}
      </div>

      <div className="relations-subsections">
        {subsections && subsections.map((sub) => {
          if (sub.id === 'initial-concord') {
            return (
              <div key={sub.id} className="phase-card concord-card">
                <div className="phase-header">
                  <span className="phase-badge phase-1-badge">PHASE 1</span>
                  <h3 className="phase-title">{sub.title}</h3>
                </div>

                <div className="points-grid">
                  {sub.points && sub.points.map((pt, ptIdx) => (
                    <div key={ptIdx} className="point-item-box">
                      <h4 className="point-topic">{pt.topic}</h4>
                      <div className="point-desc">{renderFormattedMarkdown(pt.description)}</div>

                      {pt.verse && (
                        <div className="pt-verse-box">
                          <p className="pt-quote">"{renderInlineFormatting(pt.verse.text)}"</p>
                          <div className="verse-meta-row">
                            <span className="verse-ref-tag">{pt.verse.displayReference}</span>
                            {parseQuranRef(pt.verse.internalReference || pt.verse.reference, base) && (
                              <a href={parseQuranRef(pt.verse.internalReference || pt.verse.reference, base)} className="reader-link-btn">
                                <span>Read in Quran</span>
                                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {pt.citation && (
                        <div className="pt-citation-box">
                          <div className="cit-meta">
                            <span className="cit-collection">{pt.citation.collection}</span>
                          </div>
                          <div className="cit-quote">"{renderFormattedMarkdown(pt.citation.text)}"</div>
                          {pt.citation.url && (
                            <a href={pt.citation.url} target="_blank" rel="noopener noreferrer" className="external-sunnah-link">
                              <span>Verify on Sunnah.com</span>
                              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (sub.id === 'theological-fracture') {
            return (
              <div key={sub.id} className="phase-card fracture-card">
                <div className="phase-header">
                  <span className="phase-badge phase-2-badge">PHASE 2</span>
                  <h3 className="phase-title">{sub.title}</h3>
                </div>
                {sub.content && <div className="phase-intro">{renderFormattedMarkdown(sub.content)}</div>}

                <div className="categories-stack">
                  {sub.categories && sub.categories.map((cat, cIdx) => (
                    <div key={cIdx} className="category-block">
                      <h4 className="cat-heading">{cat.category}</h4>

                      {cat.verse && (
                        <div className="cat-verse-box">
                          <p className="cat-quote">"{renderInlineFormatting(cat.verse.text)}"</p>
                          <div className="verse-meta-row">
                            <span className="verse-ref-tag">{cat.verse.displayReference}</span>
                            {parseQuranRef(cat.verse.internalReference || cat.verse.reference, base) && (
                              <a href={parseQuranRef(cat.verse.internalReference || cat.verse.reference, base)} className="reader-link-btn">
                                <span>Read in Quran</span>
                                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {cat.verses && cat.verses.map((cv, cvIdx) => {
                        const verseUrl = parseQuranRef(cv.internalReference || cv.reference, base);
                        return (
                          <div key={cvIdx} className="cat-verse-box">
                            <p className="cat-quote">"{renderInlineFormatting(cv.text)}"</p>
                            <div className="verse-meta-row">
                              <span className="verse-ref-tag">{cv.displayReference}</span>
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
                  ))}
                </div>
              </div>
            );
          }

          if (sub.id === 'physical-escalation') {
            return (
              <div key={sub.id} className="phase-card escalation-card">
                <div className="phase-header">
                  <span className="phase-badge phase-3-badge">PHASE 3</span>
                  <h3 className="phase-title">{sub.title}</h3>
                </div>

                <div className="campaigns-grid">
                  {sub.campaigns && sub.campaigns.map((camp, campIdx) => (
                    <div key={campIdx} className="campaign-card">
                      <div className="camp-head">
                        <h4 className="camp-target">{camp.target}</h4>
                        <span className="camp-year">{camp.year}</span>
                      </div>
                      <div className="camp-outcome">{renderFormattedMarkdown(camp.outcome)}</div>

                      {/* Single Verse */}
                      {camp.verse && (
                        <div className="camp-verse-box">
                          <p className="camp-quote">"{renderInlineFormatting(camp.verse.text)}"</p>
                          <div className="verse-meta-row">
                            <span className="verse-ref-tag">{camp.verse.displayReference}</span>
                            {parseQuranRef(camp.verse.internalReference || camp.verse.reference, base) && (
                              <a href={parseQuranRef(camp.verse.internalReference || camp.verse.reference, base)} className="reader-link-btn">
                                <span>Read in Quran</span>
                                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Multiple Verses */}
                      {camp.verses && camp.verses.map((cv, cvIdx) => {
                        const verseUrl = parseQuranRef(cv.internalReference || cv.reference, base);
                        return (
                          <div key={cvIdx} className="camp-verse-box">
                            <p className="camp-quote">"{renderInlineFormatting(cv.text)}"</p>
                            <div className="verse-meta-row">
                              <span className="verse-ref-tag">{cv.displayReference}</span>
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

                      {/* Hadiths */}
                      {camp.hadiths && camp.hadiths.length > 0 && (
                        <div className="camp-hadiths-list">
                          {camp.hadiths.map((ch, chIdx) => (
                            <CollapsibleHadithBox key={chIdx} hadith={ch} threshold={320} />
                          ))}
                        </div>
                      )}

                      {/* Key Events (Banu Qurayza, Khaybar, etc.) */}
                      {camp.keyEvents && camp.keyEvents.length > 0 && (
                        <div className="camp-key-events-list">
                          <div className="key-events-section-title">CHRONOLOGY OF KEY EVENTS & PRIMARY SOURCES</div>
                          {camp.keyEvents.map((ev, evIdx) => {
                            const allSources = ev.historicalSources || ev.sources;
                            return (
                              <div key={evIdx} className="camp-event-block">
                                <h5 className="event-title">
                                  <span className="event-index">{evIdx + 1}.</span> {ev.title}
                                </h5>
                                {ev.details && (
                                  <div className="event-details">{renderFormattedMarkdown(ev.details)}</div>
                                )}

                                {/* Event Hadiths */}
                                {ev.hadiths && ev.hadiths.length > 0 && (
                                  <div className="event-hadiths-container">
                                    {ev.hadiths.map((h, hIdx) => (
                                      <CollapsibleHadithBox key={hIdx} hadith={h} threshold={320} />
                                    ))}
                                  </div>
                                )}

                                {/* Event Historical Sources */}
                                {allSources && allSources.length > 0 && (
                                  <div className="event-sources-row">
                                    <span className="sources-label">Historical Exegesis:</span>
                                    <span className="sources-list">{allSources.join(' • ')}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Classical Sources */}
                      {camp.sources && (
                        <div className="camp-sources-row">
                          <span className="sources-label">Primary Sources:</span>
                          <span className="sources-list">{camp.sources.join(' • ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      <style>{`
        .jewish-relations-section {
          margin-bottom: 36px;
        }

        .relations-subsections {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .phase-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 12px;
          padding: 14px 12px;
        }

        .phase-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .phase-badge {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .phase-1-badge {
          background: #fef3c7;
          color: #92400e;
        }

        .phase-2-badge {
          background: #fee2e2;
          color: #991b1b;
        }

        .phase-3-badge {
          background: #09090b;
          color: #ffffff;
        }

        .phase-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: var(--color-primary, #09090b);
        }

        .phase-intro {
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--color-on-surface, #09090b);
          margin-bottom: 14px;
        }

        /* Points */
        .points-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .point-item-box {
          background: #fafafa;
          border: 1px solid #f4f4f5;
          border-radius: 8px;
          padding: 10px 10px;
        }

        .point-topic {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-primary, #09090b);
          margin: 0 0 4px;
        }

        .point-desc {
          font-size: 12.5px;
          line-height: 1.45;
          color: var(--color-on-surface-variant, #71717a);
          margin-bottom: 8px;
        }

        .pt-verse-box, .cat-verse-box, .camp-verse-box {
          background: #ffffff;
          border-left: 3px solid var(--color-secondary, #974543);
          border-radius: 4px;
          padding: 8px 10px;
          margin-bottom: 6px;
          border-top: 1px solid #f4f4f5;
          border-right: 1px solid #f4f4f5;
          border-bottom: 1px solid #f4f4f5;
        }

        .pt-quote, .cat-quote, .camp-quote {
          font-family: var(--font-display, Georgia, serif);
          font-style: italic;
          font-size: 12.5px;
          line-height: 1.45;
          color: #18181b;
          margin: 0 0 6px;
        }

        .pt-citation-box, .camp-hadith-box {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 6px;
          padding: 8px 10px;
          margin-top: 6px;
        }

        .cit-meta {
          margin-bottom: 4px;
        }

        .cit-collection, .hadith-tag {
          font-size: 11px;
          font-weight: 700;
          color: #b45309;
        }

        .cit-quote, .hadith-snip {
          font-size: 12px;
          line-height: 1.45;
          color: #78350f;
          margin-bottom: 6px;
        }

        /* Categories */
        .categories-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .category-block {
          background: #fdfdfd;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 8px;
          padding: 10px 10px;
        }

        .cat-heading {
          font-size: 13px;
          font-weight: 700;
          color: #991b1b;
          margin: 0 0 8px;
        }

        /* Campaigns */
        .campaigns-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .campaign-card {
          background: #fffafa;
          border: 1px solid #fee2e2;
          border-radius: 8px;
          padding: 12px 10px;
        }

        .camp-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .camp-target {
          font-family: var(--font-display, Georgia, serif);
          font-size: 15px;
          font-weight: 700;
          margin: 0;
          color: #7f1d1d;
        }

        .camp-year {
          font-size: 11px;
          font-weight: 700;
          color: #991b1b;
        }

        .camp-outcome {
          font-size: 13px;
          line-height: 1.45;
          color: #450a0a;
          margin-bottom: 10px;
        }

        .camp-hadiths-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 8px;
        }

        .hadith-ref-sub {
          font-size: 11px;
          color: #92400e;
        }

        /* Key Events in Campaigns */
        .camp-key-events-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 14px;
          border-top: 1px dashed rgba(153, 27, 27, 0.2);
          padding-top: 12px;
        }

        .key-events-section-title {
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #991b1b;
          margin-bottom: 4px;
        }

        .camp-event-block {
          background: #ffffff;
          border: 1px solid #fed7aa;
          border-left: 3px solid #ea580c;
          border-radius: 8px;
          padding: 12px 10px;
        }

        .event-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 13.5px;
          font-weight: 700;
          color: #9a3412;
          margin: 0 0 6px;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .event-index {
          color: #c2410c;
          font-size: 12px;
        }

        .event-details {
          font-size: 12.5px;
          line-height: 1.5;
          color: #27272a;
          margin-bottom: 10px;
        }

        .event-hadiths-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 8px;
        }

        .event-hadith-box {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 6px;
          padding: 8px 10px;
        }

        .hadith-header-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }

        .hadith-badge {
          font-size: 11px;
          font-weight: 800;
          color: #b45309;
        }

        .hadith-ref-label {
          font-size: 11px;
          color: #78350f;
          font-weight: 600;
        }

        .hadith-quote {
          font-size: 12px;
          line-height: 1.45;
          color: #451a03;
          margin-bottom: 6px;
        }

        .hadith-quote .mm-para {
          margin: 0;
          font-size: 12px;
          line-height: 1.45;
        }

        .external-sunnah-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #b45309;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s ease;
        }

        .external-sunnah-link:hover {
          color: #78350f;
        }

        .event-sources-row {
          font-size: 11px;
          line-height: 1.4;
          color: #71717a;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid #f4f4f5;
        }

        .camp-sources-row {
          font-size: 11px;
          color: #71717a;
          margin-top: 8px;
        }

        .sources-label {
          font-weight: 700;
          margin-right: 4px;
          color: #52525b;
        }

        .sources-list {
          color: #71717a;
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
          .phase-card {
            padding: 16px 14px;
          }
          .phase-title {
            font-size: 17px;
          }
        }
      `}</style>
    </section>
  );
}
