import React, { useState, useEffect, useRef } from 'react';
import ScrollableTrack from '../../ScrollableTrack.jsx';
import { getQuranUrl } from '../../../utils/urlFactory.js';
import {
  scrollToSection,
  setupInitialHashScroll,
  setupSectionObserver
} from '../../../utils/section_navigator.js';

function renderInlineFormatting(str) {
  if (!str) return null;
  const tokens = str.split(/(\*\*[\s\S]*?\*\*|\*[^*]+?\*|\{[^}]+\})/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return <strong key={idx} className="tafsir-bold">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      return <em key={idx} className="tafsir-em">{token.slice(1, -1)}</em>;
    }
    if (token.startsWith('{') && token.endsWith('}') && token.length >= 2) {
      return <span key={idx} className="quran-quote-tag">{token}</span>;
    }
    return token;
  });
}

function renderFormattedMarkdown(text) {
  if (!text) return null;
  const blocks = text.trim().split(/\n\n+/);
  return blocks.map((block, bIdx) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('### ')) {
      return <h4 key={bIdx} className="tafsir-heading">{renderInlineFormatting(trimmed.replace(/^###\s+/, ''))}</h4>;
    }
    if (trimmed.startsWith('#### ')) {
      return <h5 key={bIdx} className="tafsir-subheading">{renderInlineFormatting(trimmed.replace(/^####\s+/, ''))}</h5>;
    }
    if (trimmed.startsWith('> ')) {
      const quoteText = trimmed.replace(/^>\s*/gm, '');
      return (
        <blockquote key={bIdx} className="tafsir-blockquote">
          <p>{renderInlineFormatting(quoteText)}</p>
        </blockquote>
      );
    }
    if (trimmed.startsWith('- ')) {
      const items = trimmed.split(/\n-\s*/).map(s => s.replace(/^- /, '').trim()).filter(Boolean);
      return (
        <ul key={bIdx} className="tafsir-bullet-list">
          {items.map((it, iIdx) => (
            <li key={iIdx}>{renderInlineFormatting(it)}</li>
          ))}
        </ul>
      );
    }
    const lines = trimmed.split(/\n/);
    if (lines.length > 1) {
      return (
        <p key={bIdx} className="tafsir-para">
          {lines.map((line, lIdx) => (
            <React.Fragment key={lIdx}>
              {renderInlineFormatting(line)}
              {lIdx < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    }
    return <p key={bIdx} className="tafsir-para">{renderInlineFormatting(trimmed)}</p>;
  });
}

function getCleanTranslation(translation) {
  if (!translation) return '';
  if (typeof translation === 'object') {
    return translation.combined_text || translation.text || '';
  }
  if (typeof translation === 'string') {
    const trimmed = translation.trim();
    if (trimmed.startsWith('{') && trimmed.includes('combined_text')) {
      const match = trimmed.match(/['"]combined_text['"]\s*:\s*['"]([\s\S]+?)['"](?=\s*[,}])/);
      if (match) return match[1];
    }
    return trimmed;
  }
  return String(translation);
}

function QuranVerseCard({ verse, base = '' }) {
  const [activeTafsirTab, setActiveTafsirTab] = useState('ibn_kathir');
  const [isExpanded, setIsExpanded] = useState(false);

  const quranReaderUrl = getQuranUrl({ surah: verse.surah_number, ayah: verse.ayah_number, base });
  const ibnKathirUrl = getQuranUrl({ surah: verse.surah_number, ayah: verse.ayah_number, tab: 'tafsir/ibn_kathir', base });
  const tabariUrl = getQuranUrl({ surah: verse.surah_number, ayah: verse.ayah_number, tab: 'tafsir/tabari', base });

  const activeTafsirUrl = activeTafsirTab === 'ibn_kathir' ? ibnKathirUrl : tabariUrl;
  const activeTafsirText = activeTafsirTab === 'ibn_kathir'
    ? verse.tafsir_ibn_kathir?.text
    : verse.tafsir_tabari?.text;

  const isLongText = (activeTafsirText || '').length > 450;
  const verseId = `verse-${verse.verse_key.replace(':', '-')}`;
  const cleanTranslationText = getCleanTranslation(verse.droge_translation);

  return (
    <article id={verseId} className="quran-verse-card">
      <header className="quran-card-header">
        <div className="quran-meta-row">
          <span className="quran-ref-badge">
            <svg className="badge-quran-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Surah {verse.surah_name} ({verse.verse_key})</span>
          </span>

          {verse.theme && (
            <span className="quran-theme-badge">{verse.theme}</span>
          )}
        </div>
      </header>

      {/* Quran Snippet Box with Read Surah Button */}
      <div className="quran-snippet-wrapper">
        <blockquote className="droge-translation-box">
          <p className="droge-text">"{cleanTranslationText}"</p>
          <div className="droge-actions-row">
            <a
              href={quranReaderUrl}
              className="read-surah-btn"
              title={`Read Surah ${verse.surah_name} verse ${verse.verse_key} in Quran Reader`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="read-surah-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span>Read Surah {verse.surah_name}</span>
              <svg className="read-surah-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </blockquote>
      </div>

      {/* Key Legal Rulings */}
      {verse.key_legal_rulings && (
        <div className="legal-rulings-box">
          <h4 className="rulings-heading">
            <svg className="rulings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Core Fiqh & Jurisprudential Mandates</span>
          </h4>
          {Array.isArray(verse.key_legal_rulings) ? (
            <ul className="rulings-list">
              {verse.key_legal_rulings.map((r, rIdx) => (
                <li key={rIdx} className="ruling-item">{r}</li>
              ))}
            </ul>
          ) : (
            <p className="ruling-text-para">{verse.key_legal_rulings}</p>
          )}
        </div>
      )}

      {/* Classical Tafsir Section */}
      <div className="tafsir-section-wrapper">
        <div className="tafsir-header-bar">
          <div className="tafsir-tab-switcher">
            <button
              type="button"
              onClick={() => setActiveTafsirTab('ibn_kathir')}
              className={`tafsir-tab-btn ${activeTafsirTab === 'ibn_kathir' ? 'active' : ''}`}
            >
              <span>Tafsir Ibn Kathir</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTafsirTab('tabari')}
              className={`tafsir-tab-btn ${activeTafsirTab === 'tabari' ? 'active' : ''}`}
            >
              <span>Tafsir Al-Tabari</span>
            </button>
          </div>

          <a
            href={activeTafsirUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="full-tafsir-link"
            title={`Read complete ${activeTafsirTab === 'ibn_kathir' ? 'Ibn Kathir' : 'Al-Tabari'} commentary in Quran Reader`}
          >
            <span>Read Full Tafsir</span>
            <svg className="ext-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>

        <div className={`tafsir-body-container ${!isExpanded && isLongText ? 'is-clamped' : 'is-expanded'}`}>
          <div className="tafsir-body">
            {renderFormattedMarkdown(activeTafsirText)}
          </div>

          {!isExpanded && isLongText && (
            <div className="tafsir-fade-overlay" aria-hidden="true" />
          )}
        </div>

        {isLongText && (
          <div className="tafsir-expand-footer">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="tafsir-expand-btn"
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? 'Show Less' : 'Read Full Excerpt'}</span>
              <svg className={`expand-btn-icon ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function QuranPillarView({ quranicWitness = {}, base = '' }) {
  const [activeVerseKey, setActiveVerseKey] = useState(null);
  const isInitialMountRef = useRef(true);

  const verses = quranicWitness.verses || [];
  const validIds = verses.map(v => `verse-${v.verse_key.replace(':', '-')}`);

  useEffect(() => {
    const cleanup = setupInitialHashScroll({
      validIds,
      onHashFound: (id) => setActiveVerseKey(id),
      onComplete: () => {
        isInitialMountRef.current = false;
      }
    });
    return cleanup;
  }, []);

  useEffect(() => {
    const cleanup = setupSectionObserver({
      selector: '.quran-verse-card',
      rootMargin: '-20% 0px -60% 0px',
      isLocked: () => isInitialMountRef.current,
      onActiveIdChange: (id) => setActiveVerseKey(id),
      updateUrl: true
    });
    return cleanup;
  }, []);

  const handlePillClick = (vKey) => {
    const targetId = `verse-${vKey.replace(':', '-')}`;
    setActiveVerseKey(targetId);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${targetId}`);
    }
    scrollToSection(targetId, { behavior: 'smooth' });
  };

  return (
    <div className="quran-pillar-container">
      {/* Sticky Verse Track */}
      <nav className="verse-sticky-nav" aria-label="Quranic Slavery Passages Navigation">
        <ScrollableTrack containerClass="verse-nav-scroller" activeTrigger={activeVerseKey}>
          {verses.map((v) => {
            const secId = `verse-${v.verse_key.replace(':', '-')}`;
            const isActive = activeVerseKey === secId;
            return (
              <button
                key={v.verse_key}
                type="button"
                onClick={() => handlePillClick(v.verse_key)}
                className={`verse-nav-pill ${isActive ? 'is-active active' : ''}`}
                title={`Surah ${v.surah_name} (${v.verse_key})`}
              >
                <span className="pill-title">{v.verse_key}</span>
              </button>
            );
          })}
        </ScrollableTrack>
      </nav>

      {/* Verses Stack */}
      <div className="verses-stack">
        {verses.map((verse, idx) => (
          <QuranVerseCard key={idx} verse={verse} base={base} />
        ))}
      </div>

      <style>{`
        .quran-pillar-container {
          display: flex;
          flex-direction: column;
        }

        .verse-sticky-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-outline-variant, #e4e4e7);
          padding: 8px 10px;
          margin: 0 -10px 20px -10px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        }

        @media (min-width: 640px) {
          .verse-sticky-nav {
            padding: 10px 20px;
            margin: 0 0 24px 0;
            border-radius: 14px;
            border: 1px solid var(--color-outline-variant, #e4e4e7);
          }
        }

        .verse-nav-scroller {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding: 2px 2px;
        }

        .verse-nav-scroller::-webkit-scrollbar {
          display: none;
        }

        .verse-nav-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 9999px;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          background: var(--color-surface, #ffffff);
          color: var(--color-on-surface-variant, #71717a);
          font-size: 12.5px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .verse-nav-pill:hover {
          border-color: #d4d4d8;
          color: var(--color-on-surface, #09090b);
        }

        .verse-nav-pill.is-active {
          background: #047857;
          border-color: #047857;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(4, 120, 87, 0.25);
        }

        .quran-intro-card {
          border-radius: 16px;
          background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          padding: 18px 14px;
          margin-bottom: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        }

        @media (min-width: 640px) {
          .quran-intro-card {
            padding: 24px 22px;
            border-radius: 20px;
          }
        }

        .intro-tag-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .intro-tag {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #047857;
          background: #ecfdf5;
          padding: 2px 7px;
          border-radius: 5px;
          border: 1px solid rgba(4, 120, 87, 0.15);
        }

        .intro-count {
          font-size: 12px;
          font-weight: 600;
          color: #71717a;
        }

        .intro-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: clamp(1.25rem, 3.5vw, 1.6rem);
          font-weight: 800;
          color: var(--color-primary, #09090b);
          margin: 0 0 8px 0;
          line-height: 1.25;
        }

        .intro-desc {
          font-size: 13.5px;
          line-height: 1.55;
          color: #52525b;
          margin: 0;
        }

        .verses-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @media (min-width: 640px) {
          .verses-stack {
            gap: 28px;
          }
        }

        .quran-verse-card {
          scroll-margin-top: 70px;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.03);
        }

        @media (min-width: 640px) {
          .quran-verse-card {
            border-radius: 18px;
            padding: 22px 18px;
            gap: 18px;
          }
        }

        .quran-meta-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }

        .quran-ref-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #09090b;
          color: #ffffff;
          font-size: 12.5px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 9999px;
        }

        .badge-quran-icon {
          width: 13px;
          height: 13px;
        }

        .quran-theme-badge {
          font-size: 11.5px;
          font-weight: 600;
          color: #047857;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .quran-snippet-wrapper {
          display: flex;
          flex-direction: column;
        }

        .droge-translation-box {
          margin: 0;
          padding: 12px 12px 10px;
          background: #f8fafc;
          border-left: 3.5px solid #059669;
          border-radius: 0 10px 10px 0;
          border-top: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }

        .droge-text {
          font-family: var(--font-display, Georgia, serif);
          font-size: 14.5px;
          line-height: 1.6;
          color: #18181b;
          margin: 0 0 10px 0;
          font-style: italic;
        }

        @media (min-width: 640px) {
          .droge-text {
            font-size: 15.5px;
          }
        }

        .droge-actions-row {
          display: flex;
          justify-content: flex-end;
        }

        .read-surah-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: #ffffff;
          color: #047857;
          border: 1px solid #a7f3d0;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.15s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }

        .read-surah-btn:hover {
          background: #ecfdf5;
          border-color: #059669;
          color: #065f46;
        }

        .read-surah-icon {
          width: 13px;
          height: 13px;
          color: #059669;
        }

        .read-surah-arrow {
          width: 12px;
          height: 12px;
          transition: transform 0.15s ease;
        }

        .read-surah-btn:hover .read-surah-arrow {
          transform: translateX(2px);
        }

        .legal-rulings-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 12px;
        }

        .rulings-heading {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 800;
          color: #334155;
          margin: 0 0 6px 0;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .rulings-icon {
          width: 13px;
          height: 13px;
          color: #0284c7;
        }

        .rulings-list {
          margin: 0;
          padding-left: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ruling-text-para {
          font-size: 13px;
          line-height: 1.5;
          color: #334155;
          margin: 0;
        }

        .ruling-item {
          font-size: 13px;
          line-height: 1.45;
          color: #334155;
        }

        .tafsir-section-wrapper {
          border-radius: 10px;
          background: #fafafa;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .tafsir-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tafsir-tab-switcher {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .tafsir-tab-btn {
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tafsir-tab-btn.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        .full-tafsir-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 700;
          color: #2563eb;
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 6px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          transition: all 0.15s ease;
        }

        .full-tafsir-link:hover {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .full-tafsir-link .ext-icon {
          width: 12px;
          height: 12px;
        }

        .tafsir-body-container {
          position: relative;
          background: #fafafa;
          transition: max-height 0.3s ease;
        }

        .tafsir-body-container.is-clamped {
          max-height: 380px;
          overflow: hidden;
        }

        .tafsir-body-container.is-expanded {
          max-height: none;
        }

        .tafsir-fade-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: linear-gradient(to bottom, rgba(250, 250, 250, 0) 0%, #fafafa 90%);
          pointer-events: none;
        }

        .tafsir-expand-footer {
          display: flex;
          justify-content: center;
          padding: 8px 12px 12px;
          background: #fafafa;
          border-top: 1px solid #f1f5f9;
        }

        .tafsir-expand-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #cbd5e1;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          transition: all 0.15s ease;
        }

        .tafsir-expand-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .expand-btn-icon {
          width: 13px;
          height: 13px;
          transition: transform 0.2s ease;
        }

        .tafsir-body {
          padding: 12px 12px;
          font-size: 13.5px;
          line-height: 1.6;
          color: #334155;
          background: #fafafa;
        }

        .tafsir-heading {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
          margin: 10px 0 4px 0;
        }

        .tafsir-subheading {
          font-size: 12.5px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin: 8px 0 4px 0;
        }

        .tafsir-blockquote {
          margin: 8px 0;
          padding: 8px 12px;
          background: #ffffff;
          border-left: 3px solid #64748b;
          border-radius: 0 6px 6px 0;
          font-size: 13px;
          color: #1e293b;
        }

        .tafsir-blockquote p {
          margin: 0;
        }

        .tafsir-bullet-list {
          margin: 6px 0;
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
          color: #334155;
        }

        .tafsir-para {
          margin: 0 0 6px 0;
        }

        .tafsir-bold {
          color: #09090b;
          font-weight: 700;
        }

        .tafsir-em {
          font-style: italic;
          color: #475569;
        }

        .quran-quote-tag {
          color: #047857;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
