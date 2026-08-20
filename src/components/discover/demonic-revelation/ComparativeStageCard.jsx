import React from 'react';
import { getBibleUrl, getQuranUrl } from '../../../utils/urlFactory.js';

// Format **bold** markdown safely
function renderFormattedQuote(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="rev-quote-highlight">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Resolve source links cleanly
function resolveSourceLink(ref, base = '') {
  if (!ref) return { href: '#', isExternal: false, label: 'Source' };

  if (ref.startsWith('http://') || ref.startsWith('https://')) {
    let label = 'Verify Source';
    if (ref.includes('sunnah.com/bukhari:')) {
      label = `Sahih al-Bukhari ${ref.split('bukhari:')[1]}`;
    } else if (ref.includes('sunnah.com/muslim:')) {
      label = `Sahih Muslim ${ref.split('muslim:')[1]}`;
    } else if (ref.includes('TheLifeOfMohammedGuillaume')) {
      label = 'Sirat Rasul Allah (Ibn Ishaq)';
    } else if (ref.includes('TheHistoryOfAlTabari')) {
      label = 'Tarikh al-Tabari (Vol. 6)';
    } else if (ref.includes('archive.org')) {
      label = 'Historical Source Archive';
    }
    return { href: ref, isExternal: true, label };
  }

  if (ref.startsWith('bible/')) {
    const parts = ref.split('/');
    const book = parts[1];
    const ch = parts[2];
    const verses = parts[3];
    const label = `${book.toUpperCase()} ${ch}:${verses}`;
    return { href: getBibleUrl({ book, chapter: ch, verse: verses, base }), isExternal: false, label };
  }

  if (ref.startsWith('quran/')) {
    const [_, surah, ayah] = ref.split('/');
    return { href: getQuranUrl({ surah, ayah, base }), isExternal: false, label: `Surah ${surah}:${ayah}` };
  }

  if (ref.startsWith('ibnkathir/')) {
    const [_, surah, ayah] = ref.split('/');
    return { href: getQuranUrl({ surah, ayah, tab: 'tafsir/ibn_kathir', base }), isExternal: false, label: `Tafsir Ibn Kathir (${surah}:${ayah})` };
  }

  return { href: ref, isExternal: false, label: ref };
}

export default function ComparativeStageCard({ item, base = '' }) {
  const comp = item.comparatives && item.comparatives[0];
  if (!comp) return null;

  return (
    <article id={item.id} className="revelation-stage-section">
      <header className="stage-card-header">
        <h2 className="stage-card-title">{item.title}</h2>
      </header>

      {/* 1. Islamic Historical Testimony */}
      <div className="evidence-block islamic-block">
        <div className="block-header">
          <span className="block-tag tag-islamic">RECORDED ISLAMIC TESTIMONY</span>
        </div>
        <div className="quotes-stack">
          {comp.islamic_quotes.map((q, idx) => {
            const linkInfo = resolveSourceLink(q.reference, base);
            return (
              <blockquote key={idx} className="rev-quote-card">
                <p className="rev-quote-body">{renderFormattedQuote(q.quote)}</p>
                <footer className="rev-quote-footer">
                  <a
                    href={linkInfo.href}
                    target={linkInfo.isExternal ? '_blank' : '_self'}
                    rel={linkInfo.isExternal ? 'noopener noreferrer' : undefined}
                    className="source-pill"
                    title={`Verify ${linkInfo.label}`}
                  >
                    <span>{linkInfo.label}</span>
                    {linkInfo.isExternal ? (
                      <svg aria-hidden="true" className="ext-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    ) : (
                      <svg aria-hidden="true" className="int-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    )}
                  </a>
                </footer>
              </blockquote>
            );
          })}
        </div>
      </div>

      {/* 2. Biblical Demonic Parallel */}
      <div className="evidence-block demonic-block">
        <div className="block-header">
          <span className="block-tag tag-demonic">BIBLICAL ADVERSARIAL / DEMONIC PARALLEL</span>
        </div>
        <div className="quotes-stack">
          {comp.biblical_parallels.map((q, idx) => {
            const linkInfo = resolveSourceLink(q.reference, base);
            return (
              <blockquote key={idx} className="rev-quote-card">
                <p className="rev-quote-body">{renderFormattedQuote(q.quote)}</p>
                <footer className="rev-quote-footer">
                  <a
                    href={linkInfo.href}
                    className="source-pill"
                    title={`Open ${linkInfo.label} in Bible reader`}
                  >
                    <span>{linkInfo.label}</span>
                    <svg aria-hidden="true" className="int-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </a>
                </footer>
              </blockquote>
            );
          })}
        </div>
      </div>

      {/* 3. Biblical Angelic Expectation */}
      <div className="evidence-block angelic-block">
        <div className="block-header">
          <span className="block-tag tag-angelic">BIBLICAL ANGELIC PRECEDENT (THE PROPHETIC STANDARD)</span>
        </div>
        <div className="quotes-stack">
          {comp.biblical_expectations.map((q, idx) => {
            const linkInfo = resolveSourceLink(q.reference, base);
            return (
              <blockquote key={idx} className="rev-quote-card">
                <p className="rev-quote-body">{renderFormattedQuote(q.quote)}</p>
                <footer className="rev-quote-footer">
                  <a
                    href={linkInfo.href}
                    className="source-pill"
                    title={`Open ${linkInfo.label} in Bible reader`}
                  >
                    <span>{linkInfo.label}</span>
                    <svg aria-hidden="true" className="int-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </a>
                </footer>
              </blockquote>
            );
          })}
        </div>
      </div>

      {/* 4. Subtle Reflective Inquiry */}
      {item.closing_thought && (
        <aside className="subtle-reflection-box" aria-label="Reflection on this topic">
          <p className="reflection-text">{item.closing_thought}</p>
        </aside>
      )}

      <style>{`
        .revelation-stage-section {
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 0;
          margin-bottom: 28px;
          scroll-margin-top: 60px;
        }

        @media (min-width: 640px) {
          .revelation-stage-section {
            background: var(--color-surface, #ffffff);
            border: 1px solid var(--color-outline-variant, #e4e4e7);
            border-radius: 20px;
            padding: 28px 24px;
            margin-bottom: 36px;
            box-shadow: 0 4px 20px -2px rgba(9, 9, 11, 0.04);
            scroll-margin-top: 70px;
          }
        }

        .stage-card-header {
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--color-outline-variant, #e4e4e7);
        }

        @media (min-width: 640px) {
          .stage-card-header {
            margin-bottom: 20px;
            padding-bottom: 14px;
          }
        }

        .stage-card-title {
          font-family: var(--font-display, 'Literata', Georgia, serif);
          font-size: clamp(1.2rem, 3.5vw, 1.75rem);
          font-weight: 800;
          color: var(--color-on-surface, #09090b);
          line-height: 1.25;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .evidence-block {
          border-radius: 12px;
          padding: 12px 10px;
          margin-bottom: 12px;
          border: 1px solid transparent;
        }

        @media (min-width: 640px) {
          .evidence-block {
            border-radius: 14px;
            padding: 18px 16px;
            margin-bottom: 16px;
          }
        }

        .islamic-block {
          background: #fafafa;
          border-color: #e4e4e7;
        }

        .demonic-block {
          background: #faf5f5;
          border-color: #f0dcdc;
        }

        .angelic-block {
          background: #f4f8f6;
          border-color: #dcece3;
        }

        .block-header {
          margin-bottom: 10px;
        }

        @media (min-width: 640px) {
          .block-header {
            margin-bottom: 12px;
          }
        }

        .block-tag {
          display: inline-block;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 5px;
        }

        .tag-islamic {
          background: #ebebeb;
          color: #3f3f46;
        }

        .tag-demonic {
          background: rgba(151, 69, 67, 0.12);
          color: #974543;
        }

        .tag-angelic {
          background: rgba(16, 185, 129, 0.12);
          color: #065f46;
        }

        .quotes-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        @media (min-width: 640px) {
          .quotes-stack {
            gap: 12px;
          }
        }

        .rev-quote-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 10px;
          padding: 10px 12px;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        @media (min-width: 640px) {
          .rev-quote-card {
            border-radius: 12px;
            padding: 14px 16px;
            gap: 10px;
          }
        }

        .rev-quote-body {
          font-family: var(--font-body, -apple-system, sans-serif);
          font-size: 13.5px;
          line-height: 1.55;
          color: #18181b;
          margin: 0;
        }

        @media (min-width: 640px) {
          .rev-quote-body {
            font-size: 14.5px;
            line-height: 1.6;
          }
        }

        .rev-quote-highlight {
          font-weight: 700;
          color: #09090b;
          background: rgba(151, 69, 67, 0.06);
          padding: 1px 3px;
          border-radius: 4px;
        }

        .rev-quote-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        .source-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
          color: #52525b;
          background: #f4f4f5;
          border: 1px solid #e4e4e7;
          border-radius: 9999px;
          padding: 4px 10px;
          text-decoration: none;
          transition: all 0.18s ease;
        }

        .source-pill:hover {
          color: #09090b;
          border-color: #d4d4d8;
          background: #e4e4e7;
          transform: translateY(-1px);
        }

        .ext-icon, .int-icon {
          width: 12px;
          height: 12px;
          opacity: 0.75;
        }

        /* Subtle Reflection Box */
        .subtle-reflection-box {
          margin-top: 20px;
          padding: 14px 16px;
          background: #f8fafc;
          border-left: 3px solid #cbd5e1;
          border-radius: 0 12px 12px 0;
        }

        .reflection-text {
          font-family: var(--font-display, 'Literata', Georgia, serif);
          font-size: 14px;
          font-style: italic;
          line-height: 1.55;
          color: #475569;
          margin: 0;
        }
      `}</style>
    </article>
  );
}
