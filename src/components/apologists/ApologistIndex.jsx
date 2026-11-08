import { useEffect, useMemo, useState } from 'react';
import ApologistFilters from './ApologistFilters.jsx';
import { INDEX_SORTS, computeIndexRows, parseFilters, serializeFilters } from './apologistView.js';
import { replaceUrl } from '../../utils/url_history.js';

const DEFAULTS = { s: 'all', b: [], sort: 'count' };
const base = import.meta.env.BASE_URL === '/' ? '' : String(import.meta.env.BASE_URL || '').replace(/\/$/, '');

const EMPTY = { books: [], people: [] };

/**
 * /apologists list with Scripture / Books / Sort filters (state in the URL query).
 * The full payload ({ books: {k,l,g}[], people: { s, n, t, c: number[][] }[] }) is read from the
 * <script type="application/json" id={dataId}> after hydration; `ssrRows` (default view) render first.
 * @param {{ dataId: string, ssrRows: { s, n, count, top }[], ssrScriptureCounts: Record<string, number> }} props
 */
export default function ApologistIndex({ dataId, ssrRows, ssrScriptureCounts }) {
  const [state, setState] = useState(DEFAULTS);
  const [data, setData] = useState(null);

  useEffect(() => {
    const el = document.getElementById(dataId);
    if (!el) return;
    const full = JSON.parse(el.textContent);
    setData(full);
    setState(parseFilters(window.location.search, { books: full.books, sorts: INDEX_SORTS }));
  }, [dataId]);

  const update = (next) => {
    setState(next);
    replaceUrl(`${window.location.pathname}${serializeFilters(next, { sorts: INDEX_SORTS })}${window.location.hash}`);
  };

  const { bookCounts, scriptureCounts } = useMemo(() => {
    if (!data) return { bookCounts: [], scriptureCounts: ssrScriptureCounts };
    const counts = data.books.map(() => 0);
    const sc = { all: data.people.length, bible: 0, quran: 0 };
    for (const p of data.people) {
      const has = { bible: false, quran: false };
      for (const [n, ...bks] of p.c) {
        for (const i of bks) {
          counts[i] += n;
          has[data.books[i].g === 'quran' ? 'quran' : 'bible'] = true;
        }
      }
      if (has.bible) sc.bible += 1;
      if (has.quran) sc.quran += 1;
    }
    return { bookCounts: counts, scriptureCounts: sc };
  }, [data]);

  const rows = data ? computeIndexRows(data, state) : ssrRows;
  const pageQuery = serializeFilters({ s: state.s, b: state.b, sort: 'verse' }, { sorts: { verse: '' } });

  return (
    <div className="apg-index">
      <ApologistFilters
        state={state}
        onChange={update}
        books={(data || EMPTY).books}
        bookCounts={bookCounts}
        sorts={INDEX_SORTS}
        scriptureCounts={scriptureCounts}
        countNoun="apologists"
        idPrefix="apg-index"
      />
      <p className="apg-count" aria-live="polite">
        {rows.length} {rows.length === 1 ? 'apologist' : 'apologists'}
      </p>
      {rows.length ? (
        <ol className="apg-rows">
          {rows.map((r) => (
            <li key={r.s}>
              <a className="apg-row" href={`${base}/apologists/${r.s}${pageQuery}`}>
                <span className="apg-row__name">{r.n}</span>
                <span className="apg-row__meta">
                  <span className="apg-row__n">{r.count} {r.count === 1 ? 'clip' : 'clips'}</span>
                  <span className="apg-row__books">{r.top.join(', ')}</span>
                </span>
                <svg className="apg-row__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p className="apg-empty">
          No apologist has clips in these books. <button type="button" className="apg-link-btn" onClick={() => update(DEFAULTS)}>Clear filters</button>
        </p>
      )}
    </div>
  );
}
