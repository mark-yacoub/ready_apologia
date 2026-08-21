import React, { useState, useEffect, useRef } from 'react';
import ScrollableTrack from '../../ScrollableTrack.jsx';
import {
  scrollToSection,
  setupInitialHashScroll,
  setupSectionObserver
} from '../../../utils/section_navigator.js';

function renderFormattedHadith(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[\s\S]*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="hadith-highlight">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function HadithItemCard({ item, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hadiths = item.hadiths || [];

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <article className={`hadith-item-card ${isOpen ? 'is-expanded' : 'is-collapsed'}`}>
      <header className="item-header-interactive" onClick={() => setIsOpen(!isOpen)}>
        <div className="item-header-top-row">
          <h3 className="item-title">{item.title}</h3>
          <div className="item-header-toggle">
            <span className="hadiths-count-badge">{hadiths.length} Hadith{hadiths.length > 1 ? 's' : ''}</span>
            <svg className={`toggle-chevron ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        {item.description && <p className="item-description">{item.description}</p>}
      </header>

      {isOpen && hadiths.length > 0 && (
        <div className="hadiths-stack">
          {hadiths.map((h, hIdx) => {
            const isBukhari = h.reference.includes('Bukhari');
            const isMuslim = h.reference.includes('Muslim');

            return (
              <div key={hIdx} className="hadith-quote-box">
                <div className="hadith-meta-row">
                  <a
                    href={h.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`collection-badge clickable-badge ${isBukhari ? 'bukhari-badge' : isMuslim ? 'muslim-badge' : 'generic-badge'}`}
                    title={`Verify ${h.reference} on Sunnah.com`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <span className="badge-ref-text">{h.reference}</span>
                    <svg className="badge-ext-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>

                <blockquote className="hadith-body">
                  <p>{renderFormattedHadith(h.english_text)}</p>
                </blockquote>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default function HadithPillarView({ categories = [] }) {
  const [activeId, setActiveId] = useState('cat-1');
  const [expandAll, setExpandAll] = useState(true);
  const isInitialMountRef = useRef(true);

  const validIds = categories.map(c => `cat-${c.category_id}`);

  useEffect(() => {
    const cleanup = setupInitialHashScroll({
      validIds,
      onHashFound: (id) => setActiveId(id),
      onComplete: () => {
        isInitialMountRef.current = false;
      }
    });
    return cleanup;
  }, []);

  useEffect(() => {
    const cleanup = setupSectionObserver({
      selector: '.slavery-category-block',
      rootMargin: '-20% 0px -60% 0px',
      isLocked: () => isInitialMountRef.current,
      onActiveIdChange: (id) => setActiveId(id),
      updateUrl: true
    });
    return cleanup;
  }, []);

  const handleNavClick = (id) => {
    setActiveId(id);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`);
    }
    scrollToSection(id, { behavior: 'smooth' });
  };

  return (
    <div className="hadith-pillar-container">
      {/* Sticky Pill Track */}
      <nav className="category-sticky-nav" aria-label="Hadith Categories Navigation">
        <ScrollableTrack containerClass="category-nav-scroller" activeTrigger={activeId}>
          {categories.map((c) => {
            const secId = `cat-${c.category_id}`;
            const isActive = activeId === secId;
            return (
              <button
                key={c.category_id}
                type="button"
                onClick={() => handleNavClick(secId)}
                className={`category-nav-pill ${isActive ? 'is-active active' : ''}`}
              >
                <span className="pill-title">{c.category_id}. {c.category_title.split('(')[0].trim()}</span>
                <span className="pill-badge">{c.items?.length || 0}</span>
              </button>
            );
          })}
        </ScrollableTrack>
      </nav>

      {/* Global Toolbar */}
      <div className="pillar-global-toolbar">
        <button
          type="button"
          onClick={() => setExpandAll(!expandAll)}
          className="toggle-all-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`toggle-all-icon ${expandAll ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <span>{expandAll ? 'Collapse All Cards' : 'Expand All Cards'}</span>
        </button>
      </div>

      {/* Categories Stack */}
      <div className="categories-stack">
        {categories.map((category) => (
          <section
            key={category.category_id}
            id={`cat-${category.category_id}`}
            className="slavery-category-block"
          >
            <header className="category-block-header">
              <div className="category-tag-row">
                <span className="category-num-tag">CATEGORY {category.category_id}</span>
                <span className="items-count-tag">{category.items?.length || 0} Evidentiary Cases</span>
              </div>
              <h2 className="category-block-title">{category.category_title}</h2>
              {category.category_description && (
                <p className="category-block-desc">{category.category_description}</p>
              )}
            </header>

            <div className="category-items-stack">
              {category.items && category.items.map((item, idx) => (
                <HadithItemCard key={idx} item={item} defaultOpen={expandAll} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <style>{`
        .hadith-pillar-container {
          display: flex;
          flex-direction: column;
        }

        .category-sticky-nav {
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
          .category-sticky-nav {
            padding: 10px 20px;
            margin: 0 0 24px 0;
            border-radius: 14px;
            border: 1px solid var(--color-outline-variant, #e4e4e7);
          }
        }

        .category-nav-scroller {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding: 2px 2px;
        }

        .category-nav-scroller::-webkit-scrollbar {
          display: none;
        }

        .category-nav-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          background: var(--color-surface, #ffffff);
          color: var(--color-on-surface-variant, #71717a);
          font-family: var(--font-body, -apple-system, sans-serif);
          font-size: 12.5px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .category-nav-pill:hover {
          border-color: #d4d4d8;
          color: var(--color-on-surface, #09090b);
        }

        .category-nav-pill.is-active {
          background: var(--color-primary, #09090b);
          border-color: var(--color-primary, #09090b);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(9, 9, 11, 0.15);
        }

        .category-nav-pill.is-active .pill-badge {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .pill-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1px 5px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 9999px;
          background: #f4f4f5;
          color: #71717a;
        }

        .pillar-global-toolbar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }

        .toggle-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f4f4f5;
          border: 1px solid #e4e4e7;
          border-radius: 9999px;
          padding: 5px 12px;
          font-size: 12.5px;
          font-weight: 600;
          color: #3f3f46;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .toggle-all-btn:hover {
          background: #e4e4e7;
          color: #09090b;
        }

        .toggle-all-icon {
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
        }

        .categories-stack {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        @media (min-width: 640px) {
          .categories-stack {
            gap: 40px;
          }
        }

        .slavery-category-block {
          scroll-margin-top: 70px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .slavery-category-block {
            border-radius: 20px;
          }
        }

        .category-block-header {
          padding: 16px 14px 14px 14px;
          background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
          border-bottom: 1px solid var(--color-outline-variant, #e4e4e7);
        }

        @media (min-width: 640px) {
          .category-block-header {
            padding: 24px 22px 20px 22px;
          }
        }

        .category-tag-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .category-num-tag {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #974543;
          background: #fdf2f2;
          padding: 2px 7px;
          border-radius: 5px;
          border: 1px solid rgba(151, 69, 67, 0.15);
        }

        .items-count-tag {
          font-size: 12px;
          font-weight: 600;
          color: #71717a;
        }

        .category-block-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: clamp(1.2rem, 3.5vw, 1.55rem);
          font-weight: 800;
          color: var(--color-primary, #09090b);
          margin: 0 0 6px 0;
          line-height: 1.25;
        }

        .category-block-desc {
          font-size: 13.5px;
          line-height: 1.55;
          color: #52525b;
          margin: 0;
        }

        .category-items-stack {
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        @media (min-width: 640px) {
          .category-items-stack {
            padding: 20px 18px;
            gap: 20px;
          }
        }

        .hadith-item-card {
          border-radius: 12px;
          background: #fafafa;
          border: 1px solid #e4e4e7;
          overflow: hidden;
          transition: border-color 0.15s ease;
        }

        .item-header-interactive {
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          background: #ffffff;
          border-bottom: 1px solid transparent;
          transition: background 0.15s ease;
        }

        @media (min-width: 640px) {
          .item-header-interactive {
            padding: 16px 14px;
            gap: 10px;
          }
        }

        .item-header-interactive:hover {
          background: #f8fafc;
        }

        .hadith-item-card.is-expanded .item-header-interactive {
          border-bottom-color: #e4e4e7;
        }

        .item-header-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
        }

        .item-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 15.5px;
          font-weight: 700;
          color: #18181b;
          margin: 0;
          line-height: 1.35;
          flex: 1;
        }

        @media (min-width: 640px) {
          .item-title {
            font-size: 17px;
          }
        }

        .item-description {
          font-size: 13.5px;
          line-height: 1.55;
          color: #4b5563;
          margin: 0;
          width: 100%;
        }

        .item-header-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          padding-top: 2px;
        }

        .hadiths-count-badge {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .toggle-chevron {
          width: 16px;
          height: 16px;
          color: #71717a;
          transition: transform 0.2s ease;
        }

        .rotate-180 {
          transform: rotate(180deg);
        }

        .hadiths-stack {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #fafafa;
        }

        @media (min-width: 640px) {
          .hadiths-stack {
            padding: 14px;
            gap: 12px;
          }
        }

        .hadith-quote-box {
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 12px 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        @media (min-width: 640px) {
          .hadith-quote-box {
            padding: 14px 14px;
          }
        }

        .hadith-meta-row {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }

        .collection-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 9999px;
          font-family: var(--font-body, -apple-system, sans-serif);
        }

        .clickable-badge {
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .clickable-badge:hover {
          transform: translateY(-1px);
          filter: brightness(0.96);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .bukhari-badge {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        .muslim-badge {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .generic-badge {
          background: #f4f4f5;
          color: #3f3f46;
          border: 1px solid #e4e4e7;
        }

        .badge-icon {
          width: 13px;
          height: 13px;
        }

        .badge-ext-icon {
          width: 12px;
          height: 12px;
          opacity: 0.7;
          margin-left: 2px;
        }

        .clickable-badge:hover .badge-ext-icon {
          opacity: 1;
        }

        .badge-ref-text {
          font-weight: 700;
        }

        .hadith-body {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.6;
          color: #27272a;
        }

        @media (min-width: 640px) {
          .hadith-body {
            font-size: 14.5px;
          }
        }

        .hadith-body p {
          margin: 0;
        }

        .hadith-highlight {
          color: #974543;
          font-weight: 700;
          background: rgba(151, 69, 67, 0.08);
          padding: 1px 3px;
          border-radius: 4px;
        }

      `}</style>
    </div>
  );
}
