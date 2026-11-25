import React, { useState, useEffect } from 'react';
import booksData from '../data/books_meta.json';
import { NT_TRANSLATION_NAME } from '../utils/bible_config.js';
import { getQuranSections } from '../utils/quran_config.js';
import { getHadithNavSections } from '../utils/hadith_config.js';
import { getBaseUrl } from '../utils/urlFactory.js';
import { NAV_TABS, useNavTabs } from './navTabs.js';

const OVERVIEW_ROUTES = {
  gospels: 'nt'
};

// Static taxonomy + base path, so compute once instead of on every render / route sync.
const HADITH_HOME_HREF = `${getBaseUrl()}/hadith`;
const HADITH_NAV_SECTIONS = getHadithNavSections(getBaseUrl());
const HADITH_CATEGORY_SLUGS = new Set(HADITH_NAV_SECTIONS.map(s => s.slug));

function NavIcon({ kind }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.85',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };
  switch (kind) {
    case 'quran':
      return (
        <svg {...props}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    case 'hadith':
      return (
        <svg {...props}>
          <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
          <path d="M4 21V5" />
          <path d="M9 8h5M9 12h5" />
        </svg>
      );
    case 'nt':
      return (
        <svg {...props}>
          <path d="M12 3v18M7 8h10" />
        </svg>
      );
    case 'ot':
      return (
        <svg {...props}>
          <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
          <path d="M19 17V5a2 2 0 0 0-2-2H4" />
        </svg>
      );
    case 'scale':
      return (
        <svg {...props} width={14} height={14}>
          <path d="M12 3v18M5 7h14M6 7l-3 7h6l-3-7zm12 0-3 7h6l-3-7z" />
        </svg>
      );
    case 'video':
      return (
        <svg {...props} width={14} height={14}>
          <rect x="2" y="5" width="14" height="14" rx="2" />
          <path d="m16 10 6-3v10l-6-3z" />
        </svg>
      );
    default:
      return null;
  }
}

function Chevron({ open }) {
  return (
    <svg
      className={`nav-chevron ${open ? 'open' : ''}`}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function ScriptureNav() {
  const [expandedSection, setExpandedSection] = useState('nt');
  const [expandedBook, setExpandedBook] = useState(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentQuranIndex, setCurrentQuranIndex] = useState(null);
  const [currentHadithSection, setCurrentHadithSection] = useState(null);
  const { activeTab, hrefFor } = useNavTabs();

  useEffect(() => {
    const syncNavWithUrl = () => {
      const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
      const pathname = window.location.pathname;
      const activePath = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
      const parts = activePath.split('/');

      if (parts[1] === 'bible' && parts[2]) {
        const bookId = parts[2];
        const chapNum = parts[3];

        setCurrentBook(bookId);
        setCurrentChapter(chapNum);
        setCurrentQuranIndex(null);

        if (OVERVIEW_ROUTES[bookId]) {
          setExpandedSection(OVERVIEW_ROUTES[bookId]);
          setExpandedBook(bookId);
        } else {
          const isBookNT = booksData.nt.some(b => b.id === bookId);
          setExpandedSection(isBookNT ? 'nt' : 'ot');
          setExpandedBook(bookId);
        }
      } else if (parts[1] === 'quran' && parts[2]) {
        setCurrentBook(null);
        setCurrentChapter(null);
        if (parts[2] === 'codex' || parts[2] === 'variant') {
          setCurrentQuranIndex('home');
        } else {
          setCurrentQuranIndex(parseInt(parts[2], 10));
        }
        setExpandedSection('quran');
      } else if (parts[1] === 'quran') {
        setCurrentBook(null);
        setCurrentChapter(null);
        setCurrentQuranIndex('home');
        setExpandedSection('quran');
      } else if (parts[1] === 'hadith') {
        setCurrentBook(null);
        setCurrentChapter(null);
        setCurrentQuranIndex(null);
        setExpandedSection('hadith');
      } else {
        setCurrentBook(null);
        setCurrentChapter(null);
        setCurrentQuranIndex(null);
      }

      if (parts[1] === 'hadith') {
        const isCategory = HADITH_CATEGORY_SLUGS.has(parts[2]);
        setCurrentHadithSection(isCategory ? parts[2] : (parts[2] ? null : 'home'));
      } else {
        setCurrentHadithSection(null);
      }
    };

    syncNavWithUrl();

    document.addEventListener('astro:after-swap', syncNavWithUrl);
    return () => {
      document.removeEventListener('astro:after-swap', syncNavWithUrl);
    };
  }, []);

  const toggleSection = (section) => {
    setExpandedSection(prev => (prev === section ? null : section));
    setExpandedBook(null);
  };

  const toggleBook = (bookId) => {
    setExpandedBook(prev => (prev === bookId ? null : bookId));
  };

  const renderBookList = (books, type, preamble = []) => {
    const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;

    return (
      <div className="book-list animate-fade-in">
        {preamble.map(item => (
          <div key={item.id} className="book-item">
            <a
              href={`${base}${item.path}`}
              className={`book-select-btn book-select-btn--featured ${currentBook === item.id ? 'active-book' : ''}`}
            >
              <span className="book-name-with-icon">
                {item.icon && <NavIcon kind={item.icon} />}
                <span>{item.name}</span>
              </span>
            </a>
          </div>
        ))}
        {books.map((book) => (
          <div key={book.id} className={`book-item ${expandedBook === book.id ? 'expanded' : ''}`}>
            <button
              type="button"
              onClick={() => toggleBook(book.id)}
              className="book-select-btn"
              aria-expanded={expandedBook === book.id}
            >
              <span className="book-name">{book.name}</span>
              <Chevron open={expandedBook === book.id} />
            </button>

            {expandedBook === book.id && (
              <div className="chapter-grid">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map((chap) => {
                  const isCurrentChapter = book.id === currentBook && String(chap) === currentChapter;

                  return (
                    <a
                      key={chap}
                      href={`${base}/bible/${book.id}/${chap}`}
                      className={`chapter-link ${isCurrentChapter ? 'active' : ''}`}
                    >
                      {chap}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="nav-sidebar-inner">
      {/* 1. Header Brand */}
      <div className="sidebar-header">
        <h3>Navigation</h3>
      </div>

      {/* 2. Desktop Navigation Panel (Visible only on desktop, hidden on mobile) */}
      <div className="sidebar-tabs-vertical">
        {NAV_TABS.map(tab => (
          <a
            key={tab.id}
            href={hrefFor(tab)}
            className={`sidebar-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? 'true' : undefined}
          >
            <div className="btn-icon-wrapper">
              <svg viewBox="0 0 24 24" strokeWidth="2.1" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
            </div>
            <span className="btn-label">{tab.label}</span>
          </a>
        ))}
      </div>

      {/* 3. Scrollable books tree: two libraries, clearly distinguished */}
      <nav className="sidebar-scroll-content" aria-label="Books and sources">
        <section className="nav-group nav-group--islamic" aria-labelledby="nav-group-islamic">
          <h4 id="nav-group-islamic" className="nav-group-label">Islamic sources</h4>
          {/* Quran */}
          <div className="nav-section">
            <button
              type="button"
              onClick={() => toggleSection('quran')}
              className={`section-header-btn ${expandedSection === 'quran' ? 'active' : ''}`}
              aria-expanded={expandedSection === 'quran'}
            >
              <span className="icon"><NavIcon kind="quran" /></span>
              <span className="title-text">Quran</span>
              <Chevron open={expandedSection === 'quran'} />
            </button>
            {expandedSection === 'quran' && (
              <div className="book-list animate-fade-in">
                <div className="book-item">
                  <a
                    href={`${import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL}/quran`}
                    className={`book-select-btn book-select-btn--featured ${currentQuranIndex === 'home' ? 'active-book' : ''}`}
                  >
                    <span className="book-name-with-icon">
                      <NavIcon kind="scale" />
                      <span>Evidence &amp; Filters</span>
                    </span>
                  </a>
                </div>
                {getQuranSections().map((sec) => (
                  <div key={sec.id} className="book-item">
                    <a
                      href={sec.path}
                      className={`book-select-btn ${currentQuranIndex === sec.index ? 'active-book' : ''}`}
                    >
                      <span className="book-name">{sec.name}</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sahih Hadiths */}
          <div className="nav-section">
            <button
              type="button"
              onClick={() => toggleSection('hadith')}
              className={`section-header-btn ${expandedSection === 'hadith' ? 'active' : ''}`}
              aria-expanded={expandedSection === 'hadith'}
            >
              <span className="icon"><NavIcon kind="hadith" /></span>
              <span className="title-text">Sahih Hadiths</span>
              <Chevron open={expandedSection === 'hadith'} />
            </button>
            {expandedSection === 'hadith' && (
              <div className="book-list animate-fade-in">
                <div className="book-item">
                  <a
                    href={HADITH_HOME_HREF}
                    className={`book-select-btn ${currentHadithSection === 'home' ? 'active-book' : ''}`}
                  >
                    <span className="book-name">Overview</span>
                  </a>
                </div>
                {HADITH_NAV_SECTIONS.map((sec) => (
                  <div key={sec.slug} className="book-item">
                    <a
                      href={sec.path}
                      className={`book-select-btn ${currentHadithSection === sec.slug ? 'active-book' : ''}`}
                    >
                      <span className="book-name">{sec.short}</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="nav-group nav-group--christian" aria-labelledby="nav-group-bible">
          <h4 id="nav-group-bible" className="nav-group-label">Bible</h4>
          {/* New Testament */}
          <div className="nav-section">
            <button
              type="button"
              onClick={() => toggleSection('nt')}
              className={`section-header-btn ${expandedSection === 'nt' ? 'active' : ''}`}
              aria-expanded={expandedSection === 'nt'}
            >
              <span className="icon"><NavIcon kind="nt" /></span>
              <span className="title-text">New Testament ({NT_TRANSLATION_NAME})</span>
              <Chevron open={expandedSection === 'nt'} />
            </button>
            {expandedSection === 'nt' && renderBookList(booksData.nt, 'nt', [
              { id: 'gospels', name: 'The Gospels Overview', icon: 'video', path: '/bible/gospels/videos' }
            ])}
          </div>

          {/* Old Testament */}
          <div className="nav-section">
            <button
              type="button"
              onClick={() => toggleSection('ot')}
              className={`section-header-btn ${expandedSection === 'ot' ? 'active' : ''}`}
              aria-expanded={expandedSection === 'ot'}
            >
              <span className="icon"><NavIcon kind="ot" /></span>
              <span className="title-text">Old Testament (LXX)</span>
              <Chevron open={expandedSection === 'ot'} />
            </button>
            {expandedSection === 'ot' && renderBookList(booksData.ot, 'ot')}
          </div>
        </section>
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-sidebar-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          color: var(--ra-ink-2, #57514a);
          background-color: var(--ra-surface, #ffffff);
          font-family: var(--ra-sans, 'Public Sans', -apple-system, sans-serif);
          overflow-x: hidden;
        }

        .sidebar-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--ra-line, #e8e2d9);
          background-color: var(--ra-paper, #fbf9f5);
        }
        .sidebar-header h3 {
          margin: 0;
          padding: 0;
          border: 0;
          font-family: var(--ra-display, 'Literata', Georgia, serif);
          font-weight: 700;
          font-size: 16px;
          color: var(--ra-ink, #1b1917);
        }

        .sidebar-tabs-vertical {
          display: none;
        }

        @media (min-width: 768px) {
          .sidebar-tabs-vertical {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 10px 12px;
            border-bottom: 1px solid var(--ra-line, #e8e2d9);
            background-color: var(--ra-paper, #fbf9f5);
          }
        }

        .sidebar-nav-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border: 1px solid transparent;
          background: none;
          color: var(--ra-ink-2, #57514a);
          font-size: 13.5px;
          font-weight: 600;
          border-radius: 9px;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
          position: relative;
          box-sizing: border-box;
        }
        .sidebar-nav-btn:hover {
          background-color: var(--ra-well, #f3efe8);
          color: var(--ra-ink, #1b1917);
        }

        .btn-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 6px;
          color: inherit;
        }
        .btn-icon-wrapper svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          fill: none;
        }

        .sidebar-nav-btn.active {
          background-color: var(--ra-accent-bg, #f0ece4);
          border-color: var(--ra-accent-rule, #d8d0c4);
          color: var(--ra-accent, #1b1917);
          font-weight: 700;
        }
        .sidebar-nav-btn.active .btn-icon-wrapper {
          color: var(--ra-accent, #1b1917);
        }

        .sidebar-scroll-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 10px 10px 24px;
        }

        .nav-group {
          --nav-grp-accent: var(--ra-ink, #1b1917);
          --nav-grp-bg: var(--ra-well, #f3efe8);
          --nav-grp-rule: var(--ra-line-strong, #d8d0c4);
        }
        .nav-group--islamic {
          --nav-grp-accent: var(--ra-islamic, #33593a);
          --nav-grp-bg: var(--ra-islamic-bg, #edf3ee);
          --nav-grp-rule: var(--ra-islamic-rule, #c2d6c6);
        }
        .nav-group--christian {
          --nav-grp-accent: var(--ra-christian, #7a3530);
          --nav-grp-bg: var(--ra-christian-bg, #f6eeec);
          --nav-grp-rule: var(--ra-christian-rule, #dfc5c2);
        }

        .nav-group + .nav-group {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--ra-line, #e8e2d9);
        }
        .nav-group-label {
          margin: 4px 10px 6px;
          padding: 0;
          border: 0;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: var(--ra-sans, 'Public Sans', sans-serif);
          line-height: 1.3;
          color: var(--nav-grp-accent);
        }

        .nav-section {
          margin-bottom: 4px;
        }

        .section-header-btn {
          width: 100%;
          display: flex;
          align-items: center;
          min-height: 44px;
          padding: 9px 10px;
          background: none;
          border: 1px solid transparent;
          color: var(--ra-ink, #1b1917);
          font-size: 13.5px;
          font-weight: 650;
          text-align: left;
          cursor: pointer;
          border-radius: 9px;
          transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .section-header-btn:hover {
          background-color: var(--ra-well, #f3efe8);
        }
        .section-header-btn.active {
          background-color: var(--nav-grp-bg);
          border-color: var(--nav-grp-rule);
          color: var(--nav-grp-accent);
          font-weight: 700;
        }
        .section-header-btn:focus-visible,
        .book-select-btn:focus-visible,
        .chapter-link:focus-visible,
        .sidebar-nav-btn:focus-visible {
          outline: 2px solid var(--ra-verify, #0e5e6f);
          outline-offset: 2px;
        }

        .section-header-btn .icon {
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--nav-grp-accent);
          flex-shrink: 0;
        }
        .section-header-btn .title-text {
          flex: 1;
        }

        .nav-chevron {
          color: var(--ra-ink-3, #6b6560);
          flex-shrink: 0;
          transition: transform 0.18s ease;
        }
        .nav-chevron.open {
          transform: rotate(90deg);
          color: var(--nav-grp-accent);
        }

        .book-list {
          padding-left: 10px;
          margin-top: 4px;
          border-left: 1.5px solid var(--nav-grp-rule);
          margin-left: 17px;
        }

        .book-item {
          margin-bottom: 2px;
        }

        .book-select-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 10px;
          background: none;
          border: none;
          color: var(--ra-ink-2, #57514a);
          font-size: 13px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          border-radius: 7px;
          transition: background-color 0.15s ease, color 0.15s ease;
          box-sizing: border-box;
        }
        .book-select-btn:hover {
          background-color: var(--ra-well, #f3efe8);
          color: var(--ra-ink, #1b1917);
        }
        .book-select-btn--featured {
          font-weight: 600;
          color: var(--ra-ink, #1b1917);
        }
        .book-name-with-icon {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .book-name-with-icon svg {
          color: var(--nav-grp-accent);
          flex-shrink: 0;
        }
        .book-select-btn.active-book {
          font-weight: 700;
          color: var(--nav-grp-accent);
          background-color: var(--nav-grp-bg);
        }

        .book-item.expanded .book-select-btn {
          font-weight: 700;
          color: var(--ra-ink, #1b1917);
        }

        .chapter-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 4px;
          padding: 6px;
          background-color: var(--ra-paper, #fbf9f5);
          border-radius: 8px;
          margin-top: 4px;
          margin-bottom: 6px;
          border: 1px solid var(--ra-line, #e8e2d9);
          max-width: 100%;
          box-sizing: border-box;
        }

        .chapter-link {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          background-color: var(--ra-surface, #ffffff);
          border: 1px solid var(--ra-line, #e8e2d9);
          color: var(--ra-ink-2, #57514a);
          text-decoration: none;
          font-size: 12px;
          font-variant-numeric: tabular-nums;
          border-radius: 6px;
          font-weight: 600;
          transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;
        }
        .chapter-link:hover {
          border-color: var(--nav-grp-accent);
          color: var(--nav-grp-accent);
          background-color: var(--nav-grp-bg);
        }

        .chapter-link.active {
          background-color: var(--nav-grp-accent);
          color: #ffffff;
          border-color: var(--nav-grp-accent);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.18s ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in { animation: none; }
          .nav-chevron { transition: none; }
        }
      ` }} />
    </div>
  );
}
