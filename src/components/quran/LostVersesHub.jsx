import React, { useState, useEffect, useRef } from 'react';

function highlightText(fullText, highlightSubstring) {
  if (!highlightSubstring || !fullText || !fullText.includes(highlightSubstring)) {
    return fullText;
  }
  const parts = fullText.split(highlightSubstring);
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <strong className="hadith-highlight-phrase">{highlightSubstring}</strong>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

function VideoCarousel({ videos }) {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [videos]);

  const handleScroll = (direction) => {
    if (!containerRef.current) return;
    const scrollAmount = 240;
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!videos || videos.length === 0) return null;

  return (
    <div className="videos-carousel-wrapper">
      <button
        type="button"
        className={`carousel-btn carousel-btn-left ${canScrollLeft ? 'visible' : ''}`}
        onClick={() => handleScroll('left')}
        aria-label="Scroll left"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div className="videos-carousel-container" ref={containerRef}>
        <div className="videos-carousel-track">
          {videos.map((video, idx) => {
            const dynamicTitle = video.title
              || video.summary
              || (video.apologist_name && video.apologist_name !== "Unknown"
                  ? `YouTube Short by ${video.apologist_name}`
                  : 'YouTube Short Apologetics Video');

            return (
              <div key={video.video_id || idx} className="video-card">
                <div className="iframe-container">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.video_id}`}
                    title={dynamicTitle}
                    frameBorder="0"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                <div className="video-meta">
                  {video.apologist_name && !video.apologist_name.toLowerCase().includes("unknown") && (
                    <div className="apologist-name">
                      <span className="apologist-badge">{video.apologist_name}</span>
                    </div>
                  )}

                  {video.summary && (
                    <div className="video-summary">
                      <p>{video.summary}</p>
                    </div>
                  )}

                  <div className="video-footer">
                    <a
                      href={`https://www.youtube.com/shorts/${video.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-visit-pill-btn"
                      title="Watch on YouTube"
                    >
                      <span>Watch</span>
                      <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className={`carousel-btn carousel-btn-right ${canScrollRight ? 'visible' : ''}`}
        onClick={() => handleScroll('right')}
        aria-label="Scroll right"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  );
}

function parseSurahAyah(refStr) {
  if (!refStr) return null;
  const match = refStr.match(/(\d+):(\d+)/);
  if (match) {
    return { surah: match[1], ayah: match[2] };
  }
  return null;
}

export default function LostVersesHub({ initialItems, categories, base = '' }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [languageMode, setLanguageMode] = useState('english'); // 'english' | 'arabic' | 'parallel'

  useEffect(() => {
    const savedLang = localStorage.getItem('quranLanguage');
    if (savedLang === 'arabic') {
      setLanguageMode('arabic');
    }
  }, []);

  const handleLanguageChange = (mode) => {
    setLanguageMode(mode);
    localStorage.setItem('quranLanguage', mode === 'arabic' ? 'arabic' : 'english');
  };

  const filteredItems = activeCategory === 'all'
    ? initialItems
    : initialItems.filter(item => item.category === activeCategory);

  return (
    <div className={`lost-verses-hub lang-mode-${languageMode}`}>
      {/* Category Pills Navigation */}
      <div className="hub-controls-bar">
        <div className="category-pills-scroll" role="tablist" aria-label="Evidence Categories">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat.id)}
                className={`category-pill ${isActive ? 'active' : ''}`}
              >
                <span>{cat.label}</span>
                <span className="pill-count">{cat.count}</span>
              </button>
            );
          })}
        </div>

        {/* Language Mode Toggle */}
        <div className="language-mode-selector" aria-label="Language Mode">
          <button
            onClick={() => handleLanguageChange('english')}
            className={`lang-btn ${languageMode === 'english' ? 'active' : ''}`}
            title="English Prominent"
          >
            EN
          </button>
          <button
            onClick={() => handleLanguageChange('arabic')}
            className={`lang-btn ${languageMode === 'arabic' ? 'active' : ''}`}
            title="Arabic Prominent"
          >
            عربي
          </button>
          <button
            onClick={() => handleLanguageChange('parallel')}
            className={`lang-btn ${languageMode === 'parallel' ? 'active' : ''}`}
            title="Side by Side Parallel View"
          >
            Parallel
          </button>
        </div>
      </div>

      {/* Ranked Evidence Cards List */}
      <div className="evidence-cards-stream">
        {filteredItems.map(item => (
          <article key={item.id} className="lost-verse-card" id={item.id}>
            {/* Card Header & Meta */}
            <div className="card-top-meta">
              <div className="meta-left-badges">
                <span className="rank-badge">#{item.rank}</span>
                <span className="category-tag">{item.category_label}</span>
              </div>
              {item.companion && (
                <a
                  href={`${base}/quran/codex/${item.companion.slug}`}
                  className="companion-codex-link"
                  title={`View all variants in the Codex of ${item.companion.name}`}
                >
                  <span className="companion-name">{item.companion.name}</span>
                  <svg className="link-arrow-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              )}
            </div>

            <h2 className="card-title">{item.title}</h2>

            {/* Comparison Box (if surviving vs lost variant exists) */}
            {item.comparisons && item.comparisons.length > 0 ? (
              <div className="comparisons-stack">
                {item.comparisons.map((comp, cIdx) => {
                  const parsed = parseSurahAyah(comp.surviving_verse_ref);
                  const verseHref = parsed ? `${base}/quran/${parsed.surah}#${parsed.ayah}` : null;
                  return (
                    <div key={cIdx} className="comparison-banner">
                      <div className="comparison-col surviving-col">
                        <div className="comparison-header-row">
                          <span className="comparison-label">Modern Uthmanic Text</span>
                          {verseHref && (
                            <a
                              href={verseHref}
                              className="verse-reader-link"
                              title={`Check ${comp.surviving_verse_ref} in Quran Reader`}
                            >
                              <span>{comp.surviving_verse_ref}</span>
                              <svg className="link-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </a>
                          )}
                        </div>
                        <p className="verse-text-arabic" dir="rtl">{comp.surviving_arabic}</p>
                        <p className="verse-text-english">{comp.surviving_english}</p>
                      </div>
                      <div className="comparison-divider" />
                      <div className="comparison-col variant-col">
                        <span className="comparison-label lost-label">Companion Recitation</span>
                        <p className="verse-text-arabic lost-highlight" dir="rtl">{comp.lost_verse_arabic}</p>
                        <p className="verse-text-english lost-highlight">{comp.lost_verse_english}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : item.surviving_verse_ref ? (
              (() => {
                const parsed = parseSurahAyah(item.surviving_verse_ref);
                const verseHref = parsed ? `${base}/quran/${parsed.surah}#${parsed.ayah}` : null;
                return (
                  <div className="comparison-banner">
                    <div className="comparison-col surviving-col">
                      <div className="comparison-header-row">
                        <span className="comparison-label">Modern Uthmanic Text</span>
                        {verseHref && (
                          <a
                            href={verseHref}
                            className="verse-reader-link"
                            title={`Check ${item.surviving_verse_ref} in Quran Reader`}
                          >
                            <span>{item.surviving_verse_ref}</span>
                            <svg className="link-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </a>
                        )}
                      </div>
                      <p className="verse-text-arabic" dir="rtl">{item.surviving_arabic}</p>
                      <p className="verse-text-english">{item.surviving_english}</p>
                    </div>
                    <div className="comparison-divider" />
                    <div className="comparison-col variant-col">
                      <span className="comparison-label lost-label">Companion Recitation</span>
                      <p className="verse-text-arabic lost-highlight" dir="rtl">{item.lost_verse_arabic}</p>
                      <p className="verse-text-english lost-highlight">{item.lost_verse_english}</p>
                    </div>
                  </div>
                );
              })()
            ) : null}

            {/* Lost Verse Quote Callout (for non-comparison standalone lost verses) */}
            {!item.surviving_verse_ref && item.lost_verse_arabic && (
              <div className="lost-verse-quote-box">
                <div className="quote-header">
                  <span className="quote-label">Lost Quranic Passage</span>
                </div>
                <p className="lost-verse-arabic" dir="rtl">{item.lost_verse_arabic}</p>
                <p className="lost-verse-english">{item.lost_verse_english}</p>
              </div>
            )}

            {/* Concise Objective Textual Summary */}
            {item.summary && (
              <div className="textual-summary-box">
                <p className="summary-text">{item.summary}</p>
              </div>
            )}

            {/* Abrogation Benchmark Callout Box */}
            {item.abrogation_note && (
              <div className="abrogation-benchmark-box">
                <div className="benchmark-header">
                  <span className="benchmark-tag">Canonical Benchmark</span>
                  <h3 className="benchmark-title">{item.abrogation_note.title}</h3>
                </div>
                {languageMode !== 'arabic' && (
                  <p className="benchmark-text-english">{item.abrogation_note.english}</p>
                )}
                {languageMode !== 'english' && (
                  <p className="benchmark-text-arabic" dir="rtl">{item.abrogation_note.arabic}</p>
                )}
              </div>
            )}

            {/* Unabridged Hadith Narrations */}
            <div className="hadiths-evidence-container">
              <div className="hadiths-header">
                <span className="hadiths-section-title">Primary Sahih Hadith Documentation</span>
              </div>

              <div className="hadiths-list">
                {item.hadiths.map((hadith, hIndex) => (
                  <div key={hIndex} className="hadith-entry-box">
                    <div className="hadith-entry-top">
                      <div className="source-info">
                        <span className="source-title">{hadith.source_reference}</span>
                        {hadith.in_book_reference && (
                          <span className="in-book-ref">• {hadith.in_book_reference}</span>
                        )}
                      </div>
                      {hadith.sunnah_url && (
                        <a
                          href={hadith.sunnah_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sunnah-verify-btn"
                          title="Verify original text on Sunnah.com"
                        >
                          <span>Sunnah.com</span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      )}
                    </div>

                    <div className="hadith-body">
                      {/* Arabic Text */}
                      {hadith.hadith_arabic && (
                        <p className="hadith-arabic-text" dir="rtl">
                          {highlightText(hadith.hadith_arabic, hadith.highlight_arabic)}
                        </p>
                      )}
                      {/* English Text */}
                      {hadith.hadith_english && (
                        <p className="hadith-english-text">
                          {highlightText(hadith.hadith_english, hadith.highlight_english)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expandable Apologetics Shorts Section */}
            {item.videos && item.videos.length > 0 && (
              <details className="card-videos-details">
                <summary className="videos-details-summary">
                  <div className="summary-left">
                    <svg className="video-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    <span className="summary-title">Related Apologetics Shorts ({item.videos.length})</span>
                  </div>
                  <svg className="summary-chevron" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </summary>
                <div className="videos-details-content">
                  <VideoCarousel videos={item.videos} />
                </div>
              </details>
            )}
          </article>
        ))}
      </div>

      <style>{`
        .lost-verses-hub {
          display: flex;
          flex-direction: column;
          gap: 28px;
          margin-top: 10px;
        }

        /* Controls & Filter Bar */
        .hub-controls-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid var(--color-outline-variant);
        }

        .category-pills-scroll {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .category-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid var(--color-outline-variant);
          background-color: var(--color-surface);
          color: var(--color-on-surface-variant);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .category-pill:hover {
          border-color: var(--color-secondary);
          color: var(--color-secondary);
        }

        .category-pill.active {
          background-color: var(--color-secondary);
          color: #ffffff;
          border-color: var(--color-secondary);
          box-shadow: 0 1px 3px rgba(151, 69, 67, 0.25);
        }

        .pill-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 9999px;
          background-color: rgba(0, 0, 0, 0.06);
          color: inherit;
        }

        .category-pill.active .pill-count {
          background-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .language-mode-selector {
          display: inline-flex;
          background-color: var(--color-surface-container-low);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid var(--color-outline-variant);
        }

        .lang-btn {
          border: none;
          background: transparent;
          padding: 5px 12px;
          border-radius: 6px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          color: var(--color-on-surface-variant);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .lang-btn:hover {
          color: var(--color-primary);
        }

        .lang-btn.active {
          background-color: var(--color-surface);
          color: var(--color-secondary);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        }

        /* Evidence Cards Stream */
        .evidence-cards-stream {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .lost-verse-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-outline-variant);
          border-radius: 14px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          transition: border-color 0.15s ease;
        }

        .lost-verse-card:hover {
          border-color: rgba(151, 69, 67, 0.35);
        }

        /* Top Meta Badges */
        .card-top-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .meta-left-badges {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 800;
          background-color: var(--color-primary);
          color: #ffffff;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.3px;
        }

        .lost-verse-card:nth-child(1) .rank-badge,
        .lost-verse-card:nth-child(2) .rank-badge {
          background-color: var(--color-secondary);
        }

        .category-tag {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--color-on-surface-variant);
          background-color: var(--color-surface-container-low);
          padding: 4px 9px;
          border-radius: 6px;
          border: 1px solid var(--color-outline-variant);
        }

        .companion-codex-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          color: var(--color-secondary);
          background-color: rgba(151, 69, 67, 0.06);
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(151, 69, 67, 0.2);
          transition: all 0.15s ease;
        }

        .companion-codex-link:hover {
          background-color: var(--color-secondary);
          color: #ffffff;
        }

        .link-arrow-icon {
          opacity: 0.7;
          transition: transform 0.15s ease;
        }

        .companion-codex-link:hover .link-arrow-icon {
          opacity: 1;
          transform: translate(1px, -1px);
        }

        .card-title {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 800;
          color: var(--color-primary);
          margin: 0;
          line-height: 1.35;
        }

        /* Comparison Banner */
        .comparisons-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comparison-banner {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background-color: var(--color-surface-container-low);
          border: 1px solid var(--color-outline-variant);
          border-radius: 10px;
          padding: 16px;
        }

        @media (min-width: 640px) {
          .comparison-banner {
            flex-direction: row;
            gap: 16px;
          }
          .comparison-col {
            flex: 1;
          }
          .comparison-divider {
            width: 1px;
            background-color: var(--color-outline-variant);
          }
        }

        .comparison-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .comparison-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }

        .comparison-label {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-on-surface-variant);
        }

        .verse-reader-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          color: var(--color-primary);
          background-color: var(--color-surface-container);
          border: 1px solid var(--color-outline-variant);
          padding: 2px 7px;
          border-radius: 4px;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .verse-reader-link:hover {
          background-color: var(--color-primary);
          color: var(--color-on-primary);
          border-color: var(--color-primary);
        }

        .verse-reader-link .link-icon {
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }

        .verse-reader-link:hover .link-icon {
          transform: translate(1px, -1px);
        }

        .comparison-label.lost-label {
          color: var(--color-secondary);
        }

        .verse-text-arabic {
          font-family: 'Amiri', 'Traditional Arabic', serif;
          font-size: 18px;
          line-height: 1.8;
          color: var(--color-on-surface);
          margin: 0;
        }

        .verse-text-english {
          font-family: var(--font-display);
          font-size: 14px;
          line-height: 1.5;
          color: var(--color-on-surface-variant);
          margin: 0;
        }

        .lost-highlight {
          color: var(--color-secondary) !important;
          font-weight: 600;
        }

        /* Lost Verse Quote Callout Box */
        .lost-verse-quote-box {
          background-color: rgba(151, 69, 67, 0.03);
          border-left: 4px solid var(--color-secondary);
          border-radius: 0 10px 10px 0;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .quote-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .quote-label {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--color-secondary);
        }

        .lost-verse-arabic {
          font-family: 'Amiri', 'Traditional Arabic', serif;
          font-size: 21px;
          line-height: 1.8;
          color: var(--color-primary);
          margin: 0;
          font-weight: 700;
        }

        .lost-verse-english {
          font-family: var(--font-display);
          font-size: 15px;
          font-style: italic;
          line-height: 1.55;
          color: var(--color-on-surface);
          margin: 0;
        }

        /* Objective Textual Summary */
        .textual-summary-box {
          background-color: var(--color-surface-container-low);
          border-radius: 8px;
          padding: 12px 16px;
          border: 1px solid var(--color-outline-variant);
        }

        .summary-text {
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.6;
          color: var(--color-on-surface);
          margin: 0;
        }

        /* Abrogation Benchmark Box */
        .abrogation-benchmark-box {
          background-color: color-mix(in srgb, var(--color-tertiary-container, #ffdcc2) 18%, var(--color-surface-container-low));
          border-left: 4px solid var(--color-tertiary, #b35924);
          border-radius: 0 10px 10px 0;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .benchmark-header {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .benchmark-tag {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          background-color: var(--color-tertiary, #b35924);
          color: var(--color-on-tertiary, #ffffff);
          padding: 3px 8px;
          border-radius: 4px;
        }

        .benchmark-title {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--color-primary);
          margin: 0;
        }

        .benchmark-text-english {
          font-family: var(--font-body);
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--color-on-surface);
          margin: 0;
        }

        .benchmark-text-arabic {
          font-family: 'Amiri', 'Traditional Arabic', serif;
          font-size: 16px;
          line-height: 1.8;
          color: var(--color-on-surface-variant);
          margin: 0;
          border-top: 1px dashed var(--color-outline-variant);
          padding-top: 8px;
        }

        /* Hadith Documentation Container */
        .hadiths-evidence-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 4px;
        }

        .hadiths-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hadiths-section-title {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--color-on-surface-variant);
        }

        .hadiths-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .hadith-entry-box {
          background-color: var(--color-surface-container-lowest);
          border: 1px solid var(--color-outline-variant);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hadith-entry-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding-bottom: 8px;
          border-bottom: 1px dashed var(--color-outline-variant);
        }

        .source-info {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .source-title {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 700;
          color: var(--color-secondary);
        }

        .in-book-ref {
          font-family: var(--font-body);
          font-size: 11px;
          color: var(--color-on-surface-variant);
        }

        .sunnah-verify-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          color: var(--color-on-surface-variant);
          text-decoration: none;
          padding: 3px 8px;
          border-radius: 4px;
          background-color: var(--color-surface-container-low);
          border: 1px solid var(--color-outline-variant);
          transition: all 0.15s ease;
        }

        .sunnah-verify-btn:hover {
          color: var(--color-secondary);
          border-color: var(--color-secondary);
          background-color: var(--color-surface);
        }

        .hadith-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hadith-arabic-text {
          font-family: 'Amiri', 'Traditional Arabic', serif;
          font-size: 17px;
          line-height: 1.85;
          text-align: right;
          color: var(--color-on-surface);
          margin: 0;
        }

        .hadith-english-text {
          font-family: var(--font-display);
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-on-surface-variant);
          margin: 0;
        }

        .hadith-highlight-phrase {
          color: var(--color-secondary);
          background-color: rgba(151, 69, 67, 0.08);
          padding: 1px 4px;
          border-radius: 4px;
          font-weight: 700;
        }

        /* Language Prominence Variants */
        .lang-mode-arabic .hadith-arabic-text,
        .lang-mode-arabic .verse-text-arabic,
        .lang-mode-arabic .lost-verse-arabic {
          font-size: 22px;
          color: var(--color-primary);
        }

        .lang-mode-arabic .hadith-english-text,
        .lang-mode-arabic .verse-text-english,
        .lang-mode-arabic .lost-verse-english {
          font-size: 13px;
          opacity: 0.75;
        }

        .lang-mode-english .hadith-english-text,
        .lang-mode-english .verse-text-english,
        .lang-mode-english .lost-verse-english {
          font-size: 15px;
          color: var(--color-primary);
        }

        .lang-mode-english .hadith-arabic-text,
        .lang-mode-english .verse-text-arabic,
        .lang-mode-english .lost-verse-arabic {
          font-size: 17px;
          opacity: 0.8;
        }

        /* Parallel Mode */
        @media (min-width: 720px) {
          .lang-mode-parallel .hadith-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .lang-mode-parallel .hadith-arabic-text {
            order: 2;
          }
          .lang-mode-parallel .hadith-english-text {
            order: 1;
          }
        }

        /* Expandable Apologetics Shorts Details & Carousel */
        .card-videos-details {
          background-color: var(--color-surface-container-low);
          border: 1px solid var(--color-outline-variant);
          border-radius: 10px;
          overflow: hidden;
          margin-top: 6px;
        }

        .videos-details-summary {
          padding: 10px 14px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          color: var(--color-on-surface);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
          list-style: none;
          transition: background-color 0.15s ease;
        }

        .videos-details-summary::-webkit-details-marker {
          display: none;
        }

        .videos-details-summary:hover {
          background-color: var(--color-outline-variant);
        }

        .summary-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .video-icon {
          color: var(--color-secondary);
        }

        .summary-title {
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.2px;
        }

        .summary-chevron {
          color: var(--color-on-surface-variant);
          transition: transform 0.2s ease;
        }

        .card-videos-details[open] .summary-chevron {
          transform: rotate(180deg);
        }

        .videos-details-content {
          padding: 14px 10px 10px 10px;
          border-top: 1px solid var(--color-outline-variant);
          background-color: var(--color-surface);
        }

        /* Videos Carousel Track */
        .videos-carousel-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--color-surface);
          border: 1px solid var(--color-outline-variant);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          color: var(--color-on-surface);
          transition: all 0.2s ease;
          opacity: 0;
          pointer-events: none;
        }

        .carousel-btn:hover {
          background-color: var(--color-surface-container-high);
          transform: translateY(-50%) scale(1.05);
        }

        .carousel-btn.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .carousel-btn-left {
          left: -12px;
        }

        .carousel-btn-right {
          right: -12px;
        }

        @media (max-width: 600px) {
          .carousel-btn {
            display: none;
          }
        }

        .videos-carousel-container {
          width: 100%;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          overscroll-behavior-x: contain;
          padding-bottom: 8px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: var(--color-outline-variant) transparent;
        }

        .videos-carousel-container::-webkit-scrollbar {
          height: 5px;
        }

        .videos-carousel-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .videos-carousel-container::-webkit-scrollbar-thumb {
          background-color: var(--color-outline-variant);
          border-radius: 20px;
        }

        .videos-carousel-track {
          display: flex;
          gap: 12px;
          width: max-content;
          padding: 2px;
        }

        .video-card {
          scroll-snap-align: start;
          width: 220px;
          flex-shrink: 0;
          background-color: var(--color-surface);
          border: 1px solid var(--color-outline-variant);
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .video-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.04);
        }

        .iframe-container {
          position: relative;
          width: 100%;
          padding-bottom: 177.77%;
          background-color: #000000;
        }

        .iframe-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .video-meta {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          justify-content: space-between;
        }

        .apologist-badge {
          display: inline-flex;
          align-items: center;
          background-color: var(--color-surface-container-low);
          color: var(--color-on-surface);
          border: 1px solid var(--color-outline-variant);
          border-radius: 999px;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .video-summary p {
          font-family: var(--font-body);
          font-size: 12px;
          line-height: 1.45;
          color: var(--color-on-surface);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .video-footer {
          display: flex;
          justify-content: flex-end;
          border-top: 1px dashed var(--color-outline-variant);
          padding-top: 6px;
          margin-top: 2px;
        }

        .source-visit-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 5px;
          background-color: var(--color-surface-container-low);
          border: 1px solid var(--color-outline-variant);
          color: #ef4444;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .source-visit-pill-btn:hover {
          background-color: #fef2f2;
          border-color: #fca5a5;
        }

        @media (max-width: 600px) {
          .lost-verse-card {
            padding: 18px;
            gap: 14px;
          }
          .card-title {
            font-size: 18px;
          }
          .card-top-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .category-pills-scroll {
            overflow-x: auto;
            padding-bottom: 4px;
            width: 100%;
          }
          .hub-controls-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .language-mode-selector {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
