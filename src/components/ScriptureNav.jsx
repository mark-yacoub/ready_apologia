import React, { useState, useEffect } from 'react';
import booksData from '../data/books_meta.json';

export default function ScriptureNav() {
  const [expandedSection, setExpandedSection] = useState('nt'); // 'nt', 'ot', or null
  const [expandedBook, setExpandedBook] = useState(null); // book id (e.g. 'jn')
  const [currentBook, setCurrentBook] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);

  // Synchronize active scripture route context
  useEffect(() => {
    const syncNavWithUrl = () => {
      const pathname = window.location.pathname;
      const parts = pathname.split('/');
      
      if (parts[1] === 'bible' && parts[2]) {
        const bookId = parts[2];
        const chapNum = parts[3];
        
        setCurrentBook(bookId);
        setCurrentChapter(chapNum);
        
        const isBookNT = booksData.nt.some(b => b.id === bookId);
        setExpandedSection(isBookNT ? 'nt' : 'ot');
        setExpandedBook(bookId);
      }
    };

    syncNavWithUrl();
    
    document.addEventListener('astro:after-swap', syncNavWithUrl);
    return () => {
      document.removeEventListener('astro:after-swap', syncNavWithUrl);
    };
  }, []);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
    setExpandedBook(null);
  };

  const toggleBook = (bookId) => {
    if (expandedBook === bookId) {
      setExpandedBook(null);
    } else {
      setExpandedBook(bookId);
    }
  };

  const renderBookList = (books, type) => {
    return (
      <div className="book-list animate-fade-in">
        {books.map((book) => (
          <div key={book.id} className={`book-item ${expandedBook === book.id ? 'expanded' : ''}`}>
            <button 
              onClick={() => toggleBook(book.id)} 
              className="book-select-btn"
            >
              <span className="book-name">{book.name}</span>
              <span className="arrow">{expandedBook === book.id ? '▼' : '▶'}</span>
            </button>

            {expandedBook === book.id && (
              <div className="chapter-grid">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map((chap) => {
                  const isCurrentChapter = book.id === currentBook && String(chap) === currentChapter;
                  
                  return (
                    <a
                      key={chap}
                      href={`/bible/${book.id}/${chap}`}
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
        {/* Scripture Button (Active) */}
        <button className="sidebar-nav-btn active" aria-label="Scripture View">
          <div className="btn-icon-wrapper">
            <svg viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="btn-label">Scripture</span>
        </button>
        
        {/* Topics Button (Coming Soon) */}
        <button className="sidebar-nav-btn disabled" disabled aria-label="Topics (Coming Soon)">
          <div className="btn-icon-wrapper">
            <svg viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <span className="btn-label">Topics</span>
          <span className="soon-badge">Soon</span>
        </button>
        
        {/* Library Button (Coming Soon) */}
        <button className="sidebar-nav-btn disabled" disabled aria-label="Library (Coming Soon)">
          <div className="btn-icon-wrapper">
            <svg viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="btn-label">Library</span>
          <span className="soon-badge">Soon</span>
        </button>
      </div>
      
      {/* 3. Scrollable Books Tree Navigator */}
      <div className="sidebar-scroll-content">
        {/* New Testament */}
        <div className="nav-section">
          <button 
            onClick={() => toggleSection('nt')} 
            className={`section-header-btn ${expandedSection === 'nt' ? 'active' : ''}`}
          >
            <span className="icon">✝</span>
            <span className="title-text">New Testament (ESV)</span>
            <span className="section-arrow">{expandedSection === 'nt' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'nt' && renderBookList(booksData.nt, 'nt')}
        </div>

        {/* Old Testament */}
        <div className="nav-section">
          <button 
            onClick={() => toggleSection('ot')} 
            className={`section-header-btn ${expandedSection === 'ot' ? 'active' : ''}`}
          >
            <span className="icon">📜</span>
            <span className="title-text">Old Testament (LXX)</span>
            <span className="section-arrow">{expandedSection === 'ot' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'ot' && renderBookList(booksData.ot, 'ot')}
        </div>

        {/* Quran */}
        <div className="nav-section disabled">
          <div className="section-header-btn">
            <span className="icon">🌙</span>
            <span className="title-text">Quran (Arabic/English)</span>
            <span className="badge">Soon</span>
          </div>
        </div>
      </div>

      {/* Custom Styling */}
      <style>{`
        .nav-sidebar-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          color: #475569;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow-x: hidden;
        }

        .sidebar-header {
          padding: 18px 20px;
          border-bottom: 1px solid #f1f5f9;
          font-weight: 700;
          font-size: 15px;
          color: #0f172a;
        }

        /* ============================================================
           Desktop Vertical Nav Panel (Hidden on Mobile, Docked on Desktop)
           ============================================================ */
        .sidebar-tabs-vertical {
          display: none; /* Hidden on mobile by default */
        }

        @media (min-width: 768px) {
          .sidebar-tabs-vertical {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 12px;
            border-bottom: 1px solid #f1f5f9;
            background-color: #fafafa;
          }
        }

        .sidebar-nav-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border: none;
          background: none;
          color: #64748b; /* Slate 500 */
          font-size: 13px;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .sidebar-nav-btn:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }

        .btn-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          color: inherit;
        }
        .btn-icon-wrapper svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          fill: none;
        }

        /* Active Scripture Tab in Sidebar vertical panel */
        .sidebar-nav-btn.active {
          background-color: #e4e4e7; /* Zinc 200 */
          color: #18181b; /* Zinc 900 */
        }
        .sidebar-nav-btn.active .btn-icon-wrapper {
          color: #18181b;
        }

        .sidebar-nav-btn.disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .sidebar-nav-btn.disabled:hover {
          background-color: transparent;
          color: #64748b;
        }

        .soon-badge {
          position: absolute;
          right: 12px;
          background-color: #f1f5f9;
          color: #475569;
          font-size: 7px;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 99px;
          border: 1px solid #e2e8f0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* ==========================================
           Scrollable book navigator
           ========================================== */
        .sidebar-scroll-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 10px;
        }

        .nav-section {
          margin-bottom: 8px;
        }
        .nav-section.disabled {
          opacity: 0.4;
        }

        .section-header-btn {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 10px 12px;
          background: none;
          border: none;
          color: inherit;
          font-size: 13.5px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.15s ease;
        }
        .section-header-btn:hover {
          background-color: #f8fafc;
        }
        
        .section-header-btn.active {
          background-color: #f4f4f5;
          color: #18181b;
        }

        .section-header-btn .icon {
          font-size: 14px;
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .section-header-btn .title-text {
          flex: 1;
        }
        
        .section-arrow {
          font-size: 9px;
          opacity: 0.7;
        }

        .book-list {
          padding-left: 10px;
          margin-top: 4px;
          border-left: 1px dashed #cbd5e1;
          margin-left: 16px;
        }

        .book-item {
          margin-bottom: 2px;
        }

        .book-select-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 8px;
          background: none;
          border: none;
          color: inherit;
          font-size: 12.5px;
          text-align: left;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s ease;
        }
        .book-select-btn:hover {
          background-color: #f1f5f9;
        }

        .book-item.expanded .book-select-btn {
          font-weight: 700;
          color: #18181b;
        }

        .arrow {
          font-size: 8px;
          opacity: 0.5;
        }

        .chapter-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 4px;
          padding: 6px;
          background-color: #f8fafc;
          border-radius: 6px;
          margin-top: 4px;
          margin-bottom: 4px;
          border: 1px solid #f1f5f9;
          max-width: 100%;
        }

        .chapter-link {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 28px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          color: #475569;
          text-decoration: none;
          font-size: 11.5px;
          border-radius: 5px;
          font-weight: 600;
          transition: all 0.15s ease;
        }
        .chapter-link:hover {
          border-color: var(--color-secondary);
          color: var(--color-secondary);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }
        
        .chapter-link.active {
          background-color: var(--color-secondary);
          color: #ffffff;
          border-color: var(--color-secondary);
        }

        .badge {
          background-color: #f1f5f9;
          color: #475569;
          font-size: 7px;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 99px;
          border: 1px solid #e2e8f0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
