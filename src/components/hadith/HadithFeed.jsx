/**
 * Ranked hadith feed (subcategory page) and the category overview (top 3 per subcategory).
 *
 * - Language toggle (EN / عربي / Both); Arabic excerpts are fetched per subcategory pack.
 * - Deep links: #muslim-1422a scrolls to the card (opening the Tier-4 drawer if needed) and flashes it.
 * - Feed variant: floating "Outline" button → navigation-only bottom sheet with scroll-spy.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HADITH_LABELS as L } from '../../utils/hadith_config.js';
import { fetchJsonOnce, revealElement, scrollToAnchor, useHadithLanguage } from './hadithClient.js';
import { Icon, LanguageToggle } from './HadithParts.jsx';
import HadithCard from './HadithCard.jsx';
import OutlineSheet from './OutlineSheet.jsx';

/** Flattens sections into Outline entries; only the first occurrence of a hadith gets the DOM anchor. */
function buildEntries(sections) {
  const seen = new Set();
  const anchors = {};
  const entries = [];
  for (const s of sections) {
    for (const [items, group] of [[s.items, s.title || null], [s.tier4 || [], L.tier4Drawer]]) {
      for (const it of items) {
        if (!seen.has(it.slug)) { seen.add(it.slug); anchors[it.id] = it.slug; }
        entries.push({ id: it.id, slug: it.slug, anchor: anchors[it.id] || null, headline: it.ann.headline, displayRef: it.displayRef, group });
      }
    }
  }
  return { anchors, entries };
}

export default function HadithFeed({ sections, variant = 'feed', base = '', heading }) {
  const [lang, setLang] = useHadithLanguage();
  const [packs, setPacks] = useState({}); // packUrl → { data } | { error } | { loading }
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const { anchors, entries } = useMemo(() => buildEntries(sections), [sections]);

  // Arabic packs load only when Arabic is requested.
  useEffect(() => {
    if (lang === 'en') return;
    for (const s of sections) {
      const url = s.packUrl;
      if (!url || packs[url]) continue;
      setPacks(p => ({ ...p, [url]: { loading: true } }));
      fetchJsonOnce(url).then(
        data => setPacks(p => ({ ...p, [url]: { data } })),
        error => {
          console.warn('[hadith] Arabic pack failed to load', url, error);
          setPacks(p => ({ ...p, [url]: { error } }));
        },
      );
    }
  }, [lang, sections, packs]);
  const retryPack = useCallback(url => setPacks(p => {
    const next = { ...p };
    delete next[url];
    return next;
  }), []);

  // Deep-link on load + hash changes.
  useEffect(() => {
    const go = () => scrollToAnchor(decodeURIComponent(window.location.hash.slice(1)), { smooth: false });
    const t = setTimeout(go, 60);
    window.addEventListener('hashchange', go);
    return () => { clearTimeout(t); window.removeEventListener('hashchange', go); };
  }, []);

  // Scroll-spy (feed only).
  useEffect(() => {
    if (variant !== 'feed' || !rootRef.current) return undefined;
    const cards = [...rootRef.current.querySelectorAll('.hx-card[data-idx]')];
    const io = new IntersectionObserver(obs => {
      for (const o of obs) {
        if (o.isIntersecting) setActiveIndex(Number(o.target.dataset.idx));
      }
    }, { rootMargin: '-35% 0px -60% 0px' });
    cards.forEach(c => io.observe(c));
    return () => io.disconnect();
  }, [variant, sections]);

  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const pick = useCallback(e => {
    setSheetOpen(false);
    if (e.anchor) history.replaceState(null, '', `#${e.anchor}`);
    setTimeout(() => {
      const el = document.querySelector(`[data-item-id="${CSS.escape(e.id)}"] .hx-card`);
      if (!el) return;
      revealElement(el);
      el.focus({ preventScroll: true }); // keyboard users continue from the picked card
    }, 30);
  }, []);
  const toTop = useCallback(() => {
    setSheetOpen(false);
    history.replaceState(null, '', window.location.pathname);
    (document.querySelector('.main-content') || window).scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  let idx = 0;
  const renderCards = (items, section) => items.map(it => {
    const i = idx++;
    const pack = section.packUrl ? packs[section.packUrl] : null;
    return (
      <div key={it.id} className="hx-card-slot" data-item-id={it.id}>
        <HadithCard
          item={it}
          lang={lang}
          arabic={pack?.data?.[it.id] || null}
          onArabicRetry={pack?.error ? () => retryPack(section.packUrl) : null}
          base={base}
          anchorId={anchors[it.id]}
          spyIndex={variant === 'feed' ? i : undefined}
          // Share the hadith's own page: stable if the hadith is re-filed, and it carries its own
          // title / description for link previews. The feed anchor is only a fallback.
          shareHref={it.permalink || `${section.href}#${it.slug}`}
        />
      </div>
    );
  });

  const showFab = variant === 'feed' && activeIndex >= 1;

  return (
    <div className="hx-feed-root" ref={rootRef}>
      <div className="hx-head">
        {heading?.eyebrow && <p className="hx-eyebrow">{heading.eyebrow}</p>}
        <h1 className="hx-h1">{heading?.title}</h1>
        {heading?.lede && <p className="hx-lede">{heading.lede}</p>}
        <div className="hx-tools">
          <LanguageToggle lang={lang} onChange={setLang} />
        </div>
      </div>

      {variant === 'overview' ? (
        sections.map(s => (
          <section key={s.id} className="hx-section" aria-labelledby={`sec-${s.id}`}>
            <div className="hx-section-head">
              <h2 id={`sec-${s.id}`}><a href={s.href} data-astro-prefetch="hover">{s.title}</a></h2>
            </div>
            <div className="hx-feed">{renderCards(s.items, s)}</div>
            <a className="hx-see-all" href={s.href} data-astro-prefetch="hover">{L.seeAll(s.count)} {Icon.arrowRight(16)}</a>
          </section>
        ))
      ) : (
        sections.map(s => (
          <React.Fragment key={s.id}>
            <div className="hx-feed">{renderCards(s.items, s)}</div>
            {s.tier4?.length > 0 && (
              <details className="hx-drawer">
                <summary>{Icon.chevronRight(16)} {L.tier4Drawer} <span className="count">({s.tier4.length})</span></summary>
                <p className="hx-drawer-note">{L.tier4Note}</p>
                <div className="hx-feed">{renderCards(s.tier4, s)}</div>
              </details>
            )}
          </React.Fragment>
        ))
      )}

      {variant === 'feed' && (
        <div className="hx-fab-wrap">
          <button type="button" className={`hx-fab${showFab ? ' is-on' : ''}`} onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog" tabIndex={showFab ? 0 : -1} aria-hidden={!showFab}>
            {Icon.list(17)} {L.outline}
            {activeIndex >= 0 && <span className="hx-fab-pos">{activeIndex + 1}/{entries.length}</span>}
          </button>
        </div>
      )}

      {sheetOpen && (
        <OutlineSheet
          entries={entries}
          activeIndex={activeIndex}
          onPick={pick}
          onClose={closeSheet}
          onTop={toTop}
          title={heading?.title || L.outline}
        />
      )}
    </div>
  );
}
