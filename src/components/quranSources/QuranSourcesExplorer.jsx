import React, { useState, useReducer, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  CATEGORIES,
  CATEGORY_BY_SLUG,
  CATEGORY_BY_KEY,
  TRADITION_BY_KEY,
  segmentWithHighlights,
} from '../../utils/quranSources/contract.js';
import {
  BASE,
  UI_COPY,
  formatStatStrip,
} from '../../utils/quranSources/config.js';
import { replaceUrl } from '../../utils/url_history.js';
import '../../styles/quran-sources-highlight.css';
import '../../styles/quran-sources.css';

function Chevron() {
  return (
    <svg
      className="qs-orig__chev"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function HighlightedQuote({ text, highlights }) {
  const segs = segmentWithHighlights(text, highlights);
  return (
    <>
      {segs.map((s, idx) =>
        s.mark ? (
          <mark key={idx} className="qs-hl">
            {s.text}
          </mark>
        ) : (
          <React.Fragment key={idx}>{s.text}</React.Fragment>
        )
      )}
    </>
  );
}

const pageFetchCache = new Map();

function fetchSlicePage(catSlug, filterKey, pageNum) {
  const url = `${BASE}/data/quran-sources/${catSlug}/${filterKey}/${pageNum}.json`;
  if (pageFetchCache.has(url)) {
    return pageFetchCache.get(url);
  }
  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .catch((err) => {
      pageFetchCache.delete(url);
      throw err;
    });
  pageFetchCache.set(url, promise);
  return promise;
}

function parseHashState(hashString) {
  if (!hashString) return null;
  const raw = hashString.replace(/^#/, '').trim().toLowerCase();
  if (!raw) return null;
  const [catPart, filterPart] = raw.split('/');
  const cat = CATEGORY_BY_SLUG[catPart] || CATEGORY_BY_KEY[catPart];
  if (!cat) return null;
  const filter = filterPart && TRADITION_BY_KEY[filterPart] ? filterPart : 'all';
  return { catSlug: cat.slug, filterKey: filter };
}

function SourceExcerpt({ src }) {
  const enText = src.en || '';
  const origText = (src.orig || '').trim();
  const hasDistinctOrig = Boolean(origText && origText !== enText.trim());
  const trad = TRADITION_BY_KEY[src.t];
  const workSub = src.workSub ?? '';
  const verifyHref = src.external ? src.href : `${BASE}${src.href}`;
  const verifyLabel = src.verifyLabel ?? '';

  return (
    <div className="qs-source-block">
      <div className="qs-source-block__head">
        <div className="qs-source-block__titles">
          {trad && <span className="qs-trad-tag">{trad.short}</span>}
          <span className="qs-source-block__ref">{src.ref || src.title}</span>
        </div>
        <span className="qs-source-block__date">{src.date}</span>
      </div>
      {workSub && <p className="qs-source-block__work">{workSub}</p>}

      <blockquote className="qs-quote-text">
        “<HighlightedQuote text={enText} highlights={src.highlights} />”
      </blockquote>

      {hasDistinctOrig && (
        <details className={`qs-orig${src.langCode === 'ar' ? ' qs-orig--ar' : ''}`}>
          <summary className="qs-orig__summary">
            <span>{UI_COPY.originalTextSummary.replace('{lang}', src.lang)}</span>
            <Chevron />
          </summary>
          <div
            className="qs-orig__body"
            lang={src.langCode || undefined}
            dir={src.dir || 'auto'}
          >
            {origText}
          </div>
        </details>
      )}

      <div className="qs-source-block__foot">
        {src.external ? (
          <a
            className="qs-verify"
            href={verifyHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {verifyLabel}
          </a>
        ) : (
          <a className="qs-verify" href={verifyHref}>
            {verifyLabel}
          </a>
        )}
      </div>
    </div>
  );
}

function ReferenceCard({ card, displayRank }) {
  const quranEn = card.quranEn || '';
  const quranAr = (card.quranAr || '').trim();
  const readerHref = `${BASE}/quran/${card.surah}/${card.startAyah}/sources`;

  return (
    <article className="qs-card">
      <header className="qs-card__header">
        <div className="qs-card__meta-row">
          <span className="qs-rank-pill">#{displayRank}</span>
          <a className="qs-verse-pill" href={readerHref}>
            {UI_COPY.quranColumnLabel} {card.range}
          </a>
        </div>
        <h3 className="qs-card__title">{card.title}</h3>
        <p className="qs-card__note">{card.note}</p>
      </header>

      <div className="qs-compare">
        <div className="qs-col qs-col--quran">
          <div className="qs-col__head">
            <span className="qs-col__label">
              {UI_COPY.quranColumnLabel} {card.range}
            </span>
            <a className="qs-col__reader-link" href={readerHref}>
              {UI_COPY.openReaderLabel}
            </a>
          </div>

          <blockquote className="qs-quote-text">
            “<HighlightedQuote text={quranEn} highlights={card.quranHighlights} />”
          </blockquote>

          {quranAr && (
            <details className="qs-orig qs-orig--ar">
              <summary className="qs-orig__summary">
                <span>{UI_COPY.arabicSummary}</span>
                <Chevron />
              </summary>
              <div className="qs-orig__body" dir="rtl" lang="ar">
                {quranAr}
              </div>
            </details>
          )}
        </div>

        <div className="qs-col qs-col--sources">
          {(card.sources || []).map((src, sIdx) => (
            <SourceExcerpt key={`${card.id}-src-${sIdx}`} src={src} />
          ))}
        </div>
      </div>

      {card.discussion?.view && card.discussion?.reply && (
        <details className="qs-discussion">
          <summary className="qs-discussion__summary">
            <span>{UI_COPY.discussionSummary}</span>
            <Chevron />
          </summary>
          <div className="qs-discussion__body">
            <div className="qs-discussion__row">
              <span className="qs-discussion__label">{UI_COPY.traditionalViewLabel}</span>
              <p className="qs-discussion__text">{card.discussion.view}</p>
            </div>
            <div className="qs-discussion__row qs-discussion__row--reply">
              <span className="qs-discussion__label qs-discussion__label--reply">
                {UI_COPY.primaryComparisonLabel}
              </span>
              <p className="qs-discussion__text">{card.discussion.reply}</p>
            </div>
          </div>
        </details>
      )}
    </article>
  );
}

function sliceReducer(state, action) {
  const { type, stateKey, pageNum, expectedPages, expectedCards, data } = action;
  const cur = state[stateKey] || {
    cards: [],
    loadedPage: 0,
    totalPages: data?.pages || expectedPages || 1,
    totalCards: data?.total ?? expectedCards ?? 0,
    loading: false,
    loadingPage: null,
    errorPage: null,
  };

  switch (type) {
    case 'start': {
      if (cur.loading || cur.loadedPage >= pageNum) {
        return state;
      }
      return {
        ...state,
        [stateKey]: {
          ...cur,
          loading: true,
          loadingPage: pageNum,
          errorPage: null,
        },
      };
    }
    case 'success': {
      const stillLoadingOther =
        cur.loading && cur.loadingPage !== null && cur.loadingPage !== pageNum;
      if (cur.loadedPage >= pageNum) {
        if (!stillLoadingOther && cur.loading) {
          return {
            ...state,
            [stateKey]: {
              ...cur,
              loading: false,
              loadingPage: null,
              errorPage: null,
            },
          };
        }
        return state;
      }
      const incoming = Array.isArray(data?.cards) ? data.cards : [];
      return {
        ...state,
        [stateKey]: {
          cards: pageNum === 1 ? incoming : [...cur.cards, ...incoming],
          loadedPage: pageNum,
          totalPages: data?.pages || cur.totalPages || 1,
          totalCards: data?.total ?? cur.totalCards ?? incoming.length,
          loading: stillLoadingOther,
          loadingPage: stillLoadingOther ? cur.loadingPage : null,
          errorPage: null,
        },
      };
    }
    case 'failure': {
      const stillLoadingOther =
        cur.loading && cur.loadingPage !== null && cur.loadingPage !== pageNum;
      if (stillLoadingOther || cur.loadedPage >= pageNum) {
        return state;
      }
      return {
        ...state,
        [stateKey]: {
          ...cur,
          loading: false,
          loadingPage: null,
          errorPage: pageNum,
        },
      };
    }
    default:
      return state;
  }
}

export default function QuranSourcesExplorer({
  totalItems = 0,
  totalVerses = 0,
  totalCitations = 0,
  categoryStats = [],
  initialCategorySlug = CATEGORIES[0].slug,
  initialPageData = null,
}) {
  const defaultCatSlug = initialCategorySlug || CATEGORIES[0].slug;

  const statsByCatSlug = useMemo(() => {
    const map = {};
    for (const c of categoryStats) {
      map[c.slug] = c;
    }
    return map;
  }, [categoryStats]);

  const initialKey = `${defaultCatSlug}:all`;

  const [sliceState, dispatchSlice] = useReducer(sliceReducer, null, () => {
    const initialCards = Array.isArray(initialPageData?.cards) ? initialPageData.cards : [];
    const initialPages = initialPageData?.pages || statsByCatSlug[defaultCatSlug]?.pages || 1;
    const initialTotal =
      initialPageData?.total ?? statsByCatSlug[defaultCatSlug]?.cards ?? initialCards.length;
    if (initialCards.length > 0) {
      const ssrUrl = `${BASE}/data/quran-sources/${defaultCatSlug}/all/1.json`;
      if (!pageFetchCache.has(ssrUrl)) {
        pageFetchCache.set(ssrUrl, Promise.resolve(initialPageData));
      }
    }
    return {
      [initialKey]: {
        cards: initialCards,
        loadedPage: initialCards.length > 0 ? 1 : 0,
        totalPages: initialPages,
        totalCards: initialTotal,
        loading: false,
        loadingPage: null,
        errorPage: null,
      },
    };
  });

  const sliceStateRef = useRef(sliceState);
  sliceStateRef.current = sliceState;
  const inFlightRef = useRef(new Set());
  const tabRefs = useRef({});

  const [activeCatSlug, setActiveCatSlug] = useState(defaultCatSlug);
  const [activeFilter, setActiveFilter] = useState('all');
  const sentinelRef = useRef(null);

  const getExpectedFilterMeta = useCallback(
    (catSlug, filterKey) => {
      const cStat = statsByCatSlug[catSlug];
      const fMeta = (cStat?.filters || []).find((f) => f.key === filterKey);
      return fMeta || { cards: 0, pages: 1 };
    },
    [statsByCatSlug]
  );

  const loadPage = useCallback(
    async (catSlug, filterKey, pageNum) => {
      const stateKey = `${catSlug}:${filterKey}`;
      const inFlightKey = `${catSlug}:${filterKey}:${pageNum}`;
      const cur = sliceStateRef.current[stateKey];
      if (
        inFlightRef.current.has(inFlightKey) ||
        (cur && (cur.loading || cur.loadedPage >= pageNum))
      ) {
        return;
      }

      const fMeta = getExpectedFilterMeta(catSlug, filterKey);
      inFlightRef.current.add(inFlightKey);
      dispatchSlice({
        type: 'start',
        stateKey,
        pageNum,
        expectedPages: fMeta.pages || 1,
        expectedCards: fMeta.cards || 0,
      });

      try {
        const data = await fetchSlicePage(catSlug, filterKey, pageNum);
        dispatchSlice({
          type: 'success',
          stateKey,
          pageNum,
          data,
          expectedPages: fMeta.pages || 1,
          expectedCards: fMeta.cards || 0,
        });
      } catch {
        dispatchSlice({
          type: 'failure',
          stateKey,
          pageNum,
          expectedPages: fMeta.pages || 1,
          expectedCards: fMeta.cards || 0,
        });
      } finally {
        inFlightRef.current.delete(inFlightKey);
      }
    },
    [getExpectedFilterMeta]
  );

  // Sync from URL hash on mount and hashchange
  useEffect(() => {
    const applyHash = () => {
      const parsed = parseHashState(window.location.hash);
      if (parsed) {
        setActiveCatSlug(parsed.catSlug);
        const cStat = statsByCatSlug[parsed.catSlug];
        const hasFilter = (cStat?.filters || []).some((f) => f.key === parsed.filterKey);
        setActiveFilter(hasFilter ? parsed.filterKey : 'all');
      }
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [statsByCatSlug]);

  const activeStateKey = `${activeCatSlug}:${activeFilter}`;

  useEffect(() => {
    const cur = sliceState[activeStateKey];
    if (!cur || (cur.loadedPage === 0 && !cur.loading && !cur.errorPage)) {
      loadPage(activeCatSlug, activeFilter, 1);
    }
  }, [activeStateKey, activeCatSlug, activeFilter, sliceState, loadPage]);

  const activeCategory = CATEGORY_BY_SLUG[activeCatSlug] || CATEGORIES[0];
  const activeCatStats = statsByCatSlug[activeCatSlug] || {
    cards: 0,
    pages: 1,
    filters: [{ key: 'all', cards: 0, pages: 1 }],
  };
  const availableFilters = activeCatStats.filters || [{ key: 'all', cards: 0, pages: 1 }];
  const currentMeta = getExpectedFilterMeta(activeCatSlug, activeFilter);

  const currentView = sliceState[activeStateKey] || {
    cards: [],
    loadedPage: 0,
    totalPages: currentMeta.pages || 1,
    totalCards: currentMeta.cards || 0,
    loading: false,
    loadingPage: null,
    errorPage: null,
  };

  const hasMorePages = currentView.loadedPage < currentView.totalPages;

  const updateUrlHash = (catSlug, filterKey) => {
    if (typeof window !== 'undefined') {
      const hash = filterKey === 'all' ? `#${catSlug}` : `#${catSlug}/${filterKey}`;
      replaceUrl(hash);
    }
  };

  const handleSelectCategory = (catSlug) => {
    setActiveCatSlug(catSlug);
    setActiveFilter('all');
    updateUrlHash(catSlug, 'all');
  };

  const handleSelectFilter = (filterKey) => {
    setActiveFilter(filterKey);
    updateUrlHash(activeCatSlug, filterKey);
  };

  const handleTabKeyDown = (e, idx) => {
    const count = CATEGORIES.length;
    let nextIdx = null;
    if (e.key === 'ArrowRight') {
      nextIdx = (idx + 1) % count;
    } else if (e.key === 'ArrowLeft') {
      nextIdx = (idx - 1 + count) % count;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = count - 1;
    }
    if (nextIdx !== null) {
      e.preventDefault();
      const nextCat = CATEGORIES[nextIdx];
      handleSelectCategory(nextCat.slug);
      tabRefs.current[nextCat.slug]?.focus();
    }
  };

  const handleLoadNext = useCallback(() => {
    if (currentView.loading || currentView.errorPage) return;
    if (currentView.loadedPage < currentView.totalPages) {
      loadPage(activeCatSlug, activeFilter, currentView.loadedPage + 1);
    }
  }, [
    activeCatSlug,
    activeFilter,
    currentView.loading,
    currentView.errorPage,
    currentView.loadedPage,
    currentView.totalPages,
    loadPage,
  ]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMorePages || currentView.loading || currentView.errorPage) {
      return undefined;
    }
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadNext();
      },
      { rootMargin: '320px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMorePages, currentView.loading, currentView.errorPage, handleLoadNext]);

  const statLine = formatStatStrip({ totalItems, totalCitations, totalVerses });
  const totalInSlice = currentView.totalCards || currentMeta.cards || currentView.cards.length;
  const activeTrad = activeFilter !== 'all' ? TRADITION_BY_KEY[activeFilter] : null;
  const summaryLine = activeTrad
    ? UI_COPY.filteredSummary
        .replace('{cards}', Number(totalInSlice).toLocaleString('en-US'))
        .replace('{tradition}', activeTrad.label)
    : UI_COPY.categorySummary.replace('{cards}', Number(totalInSlice).toLocaleString('en-US'));

  return (
    <div className="qs">
      <div className="qs-wrap">
        <header className="qs-hero">
          <nav className="qs-crumbs" aria-label="Breadcrumb">
            <a className="qs-crumb-link" href={`${BASE}/`}>
              {UI_COPY.breadcrumbRoot}
            </a>
            <span className="qs-crumb-sep" aria-hidden="true">
              /
            </span>
            <a className="qs-crumb-link" href={`${BASE}/evidence`}>
              {UI_COPY.breadcrumbShort}
            </a>
            <span className="qs-crumb-sep" aria-hidden="true">
              /
            </span>
            <span className="qs-crumb-current" aria-current="page">
              {UI_COPY.pageHeading}
            </span>
          </nav>

          <h1 className="qs-h1">{UI_COPY.pageHeading}</h1>

          <p className="qs-intro">
            {UI_COPY.intro.map((seg, i) =>
              typeof seg === 'string' ? (
                <React.Fragment key={i}>{seg}</React.Fragment>
              ) : (
                <a key={`${seg.path}:${i}`} className="qs-link" href={`${BASE}${seg.path}`}>
                  {seg.label}
                </a>
              )
            )}
          </p>

          <div className="qs-stats">
            <span className="qs-stats__dot" aria-hidden="true" />
            <span>{statLine}</span>
          </div>
        </header>

        <nav className="qs-switcher" aria-label={UI_COPY.categoryNavLabel}>
          <div className="qs-cat-tabs" role="tablist" aria-label={UI_COPY.categoryNavLabel}>
            {CATEGORIES.map((c, idx) => {
              const cStat = statsByCatSlug[c.slug];
              const count = cStat?.cards ?? 0;
              const isSelected = c.slug === activeCatSlug;
              return (
                <button
                  key={c.slug}
                  ref={(el) => {
                    tabRefs.current[c.slug] = el;
                  }}
                  id={`qs-tab-${c.slug}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="qs-tabpanel"
                  tabIndex={isSelected ? 0 : -1}
                  className={`qs-cat-tab${isSelected ? ' qs-cat-tab--active' : ''}`}
                  onClick={() => handleSelectCategory(c.slug)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                >
                  <span>{c.short}</span>
                  <span className="qs-cat-tab__count">{count.toLocaleString('en-US')}</span>
                </button>
              );
            })}
          </div>

          <div className="qs-filter-row" role="group" aria-label={UI_COPY.traditionFilterLabel}>
            {availableFilters.map((f) => {
              const isSelected = f.key === activeFilter;
              const label =
                f.key === 'all'
                  ? UI_COPY.allTraditionsChip
                  : TRADITION_BY_KEY[f.key]?.short || f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={isSelected}
                  className={`qs-filter-chip${isSelected ? ' qs-filter-chip--active' : ''}`}
                  onClick={() => handleSelectFilter(f.key)}
                >
                  <span>{label}</span>
                  <span className="qs-filter-chip__count">
                    {Number(f.cards || 0).toLocaleString('en-US')}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="qs-section-bar">
          <div>
            <h2 className="qs-section-bar__title">{activeCategory.label}</h2>
            <p className="qs-section-bar__desc">{activeCategory.description}</p>
          </div>
          <span className="qs-section-bar__meta">{summaryLine}</span>
        </div>

        <section
          id="qs-tabpanel"
          role="tabpanel"
          aria-labelledby={`qs-tab-${activeCatSlug}`}
          className="qs-feed"
        >
          {/* Filtered tradition views renumber cards 1..N within the active slice; "all" preserves category rank. */}
          {currentView.cards.map((card, idx) => (
            <ReferenceCard
              key={`${activeStateKey}-${card.id}`}
              card={card}
              displayRank={activeFilter === 'all' ? card.rank : idx + 1}
            />
          ))}
        </section>

        <div className="qs-pager">
          <div ref={sentinelRef} className="qs-sentinel" aria-hidden="true" />

          {currentView.errorPage && (
            <div className="qs-error" role="alert">
              <span>{UI_COPY.loadError}</span>
              <button
                type="button"
                className="qs-retry-btn"
                onClick={() => loadPage(activeCatSlug, activeFilter, currentView.errorPage)}
              >
                {UI_COPY.retryButton}
              </button>
            </div>
          )}

          {!currentView.errorPage && hasMorePages && (
            <button
              type="button"
              className="qs-more-btn"
              disabled={currentView.loading}
              onClick={handleLoadNext}
            >
              {currentView.loading ? UI_COPY.loadingMore : UI_COPY.showMoreButton}
            </button>
          )}

          <p className="qs-status" role="status" aria-live="polite">
            {currentView.cards.length > 0
              ? UI_COPY.showingCount
                  .replace('{shown}', currentView.cards.length.toLocaleString('en-US'))
                  .replace('{total}', Number(totalInSlice).toLocaleString('en-US'))
              : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
