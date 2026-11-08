import { useEffect, useMemo, useState } from 'react';
import ApologistFilters from './ApologistFilters.jsx';
import {
  PAGE_SORTS, computePageView, initialOpenSections, isDefaultFilter, parseFilters, reelItems, serializeFilters,
  verseHref, verseLabel,
} from './apologistView.js';
import { replaceUrl } from '../../utils/url_history.js';

// Reel player (owned by src/components/reel/**). Optional at build time: when the module is absent
// the glob is empty, cards fall back to opening the Short on YouTube and no "Play all" is shown.
const reelButtonMods = import.meta.glob('../reel/PlayAllButton.jsx', { eager: true });
const reelControllerMods = import.meta.glob('../reel/reelController.js', { eager: true });
const PlayAllButton = Object.values(reelButtonMods)[0]?.default || null;
const reelController = Object.values(reelControllerMods)[0] || null;

const DEFAULTS = { s: 'all', b: [], sort: 'verse' };
const base = import.meta.env.BASE_URL === '/' ? '' : String(import.meta.env.BASE_URL || '').replace(/\/$/, '');

/** A plain left click (no modifier): the only click the reel takes over; others keep the link. */
const isPlainClick = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/**
 * Apologist page clip list: book sections → verse groups → thumbnail cards.
 * Nothing autoplays; tapping a card opens the reel at that clip, continuing through the
 * current filtered selection in the current order.
 *
 * @param {{
 *   ssr: object,              // payload pruned to the sections open on first render (see prunePayload)
 *   ssrSections: { b: number, n: number }[],
 *   dataId: string,           // id of the <script type="application/json"> holding the full payload
 *   scriptureCounts: Record<string, number>,
 * }} props
 */
export default function ApologistClips({ ssr, ssrSections, dataId, scriptureCounts }) {
  const [full, setFull] = useState(null);
  const [state, setState] = useState(DEFAULTS);
  const [open, setOpen] = useState(() => initialOpen(ssr.books, ssrSections));

  useEffect(() => {
    const el = document.getElementById(dataId);
    const data = el ? JSON.parse(el.textContent) : ssr;
    setFull(data);
    const parsed = parseFilters(window.location.search, { books: data.books, sorts: PAGE_SORTS });
    setState(parsed);
    if (!isDefaultFilter(parsed) || parsed.sort !== DEFAULTS.sort) {
      setOpen(initialOpen(data.books, computePageView(data, parsed).sections));
    }
  }, [dataId, ssr]);

  const data = full || ssr;
  const view = useMemo(() => {
    if (full) return computePageView(full, state);
    const partial = computePageView(ssr, DEFAULTS);
    const byBook = new Map(partial.sections.map((s) => [s.b, s]));
    return {
      total: ssrSections.reduce((a, s) => a + s.n, 0),
      sections: ssrSections.map((s) => ({ ...s, verses: byBook.get(s.b)?.verses || [] })),
    };
  }, [full, ssr, ssrSections, state]);

  const items = useMemo(() => (full ? reelItems(full, view, full.name) : []), [full, view]);
  const indexOf = useMemo(() => new Map(items.map((it, i) => [it.videoId, i])), [items]);

  const bookCounts = useMemo(() => {
    const counts = data.books.map(() => 0);
    for (const c of data.clips) for (const b of new Set(c.vs.map((i) => data.verses[i][0]))) counts[b] += 1;
    return counts;
  }, [data]);

  const update = (next) => {
    setState(next);
    if (full) {
      const sections = computePageView(full, next).sections;
      const visible = new Set(sections.map((s) => data.books[s.b].k));
      if (![...open].some((k) => visible.has(k))) setOpen(initialOpen(data.books, sections));
    }
    replaceUrl(`${window.location.pathname}${serializeFilters(next, { sorts: PAGE_SORTS })}${window.location.hash}`);
  };

  const toggle = (k) => {
    const next = new Set(open);
    if (next.has(k)) next.delete(k); else next.add(k);
    setOpen(next);
  };

  const findCard = (videoId) => document.querySelector(`.apg-clips [data-video-id="${CSS.escape(videoId)}"]`)
    || document.querySelector('.apg-clips .apg-sec__toggle');

  const play = (e, videoId) => {
    // Fall back to the YouTube link: no reel module, payload not read yet, or a modified click
    // (new tab / window), which must keep working as a link.
    if (!reelController || !full || !indexOf.has(videoId) || !isPlainClick(e)) return;
    e.preventDefault();
    reelController.openReel(items, indexOf.get(videoId), { opener: e.currentTarget, findCard });
  };

  return (
    <div className="apg-clips">
      <ApologistFilters
        state={state}
        onChange={update}
        books={data.books}
        bookCounts={bookCounts}
        sorts={PAGE_SORTS}
        scriptureCounts={scriptureCounts}
        idPrefix="apg-page"
      />

      <div className="apg-clips__bar">
        <p className="apg-count" aria-live="polite">{view.total} {view.total === 1 ? 'clip' : 'clips'}</p>
        {/* Reel slot: "Play all" for the current filtered selection, in the current order. */}
        <div id="apologist-play-all" data-count={items.length}>
          {PlayAllButton && full && <PlayAllButton items={items} label="Play all" findCard={findCard} className="apg-play-all" />}
        </div>
      </div>

      {view.total ? view.sections.map((sec) => {
        const bk = data.books[sec.b];
        const isOpen = open.has(bk.k);
        const secId = `apg-sec-${bk.k}`;
        return (
          <section key={bk.k} className="apg-sec">
            <h2 className="apg-sec__h">
              <button type="button" className="apg-sec__toggle" aria-expanded={isOpen} aria-controls={isOpen ? secId : undefined} onClick={() => toggle(bk.k)}>
                <svg className="apg-sec__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                <span className="apg-sec__name">{bk.k === 'gospels' ? 'The Gospels' : bk.g === 'quran' ? `Sūrah ${bk.l.replace('. ', ' · ')}` : bk.l}</span>
                <span className="apg-sec__n">{sec.n}</span>
              </button>
            </h2>
            {isOpen && (
              <div id={secId} className="apg-sec__body">
                {sec.verses.map((g) => {
                  const v = data.verses[g.v];
                  return (
                    <div key={g.v} className="apg-verse">
                      <h3 className="apg-verse__h">
                        <a href={verseHref(data.books, v)}>{verseLabel(data.books, v)}</a>
                        {g.clips.length > 1 && <span className="apg-verse__n">{g.clips.length}</span>}
                      </h3>
                      <ul className="apg-cards">
                        {g.clips.map((ci) => <ClipCard key={data.clips[ci].v} clip={data.clips[ci]} onPlay={play} />)}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      }) : (
        <p className="apg-empty">
          No clips in these books. <button type="button" className="apg-link-btn" onClick={() => update(DEFAULTS)}>Clear filters</button>
        </p>
      )}
    </div>
  );
}

function initialOpen(books, sections) {
  return new Set(initialOpenSections(sections).map((s) => books[s.b].k));
}

function ClipCard({ clip, onPlay }) {
  return (
    <li className="apg-card" data-video-id={clip.v}>
      <a
        className="apg-card__main"
        href={`https://www.youtube.com/shorts/${clip.v}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => onPlay(e, clip.v)}
      >
        <span className="apg-card__thumb">
          <img src={`https://i.ytimg.com/vi/${clip.v}/mqdefault.jpg`} alt="" width="320" height="180" loading="lazy" decoding="async" />
          <span className="apg-card__play" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" /></svg>
          </span>
        </span>
        <span className="apg-card__summary">{clip.s}</span>
      </a>
      {(clip.w || clip.o || clip.via) && (
        <p className="apg-card__meta">
          {clip.w && (
            <span>with {clip.w.map(([slug, name], i) => (
              <span key={slug}>{i ? ', ' : ''}<a href={`${base}/apologists/${slug}`}>{name}</a></span>
            ))}</span>
          )}
          {clip.o && <a href={clip.o} target="_blank" rel="noopener">Full video ↗</a>}
          {clip.via && <span className="apg-card__via">via {clip.via}</span>}
        </p>
      )}
    </li>
  );
}
