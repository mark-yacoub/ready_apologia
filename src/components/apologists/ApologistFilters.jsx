import { useRef, useState } from 'react';
import {
  SCRIPTURES, SCRIPTURE_LABELS, bookOptions,
} from './apologistView.js';

/**
 * Scripture · Books · Sort controls for the apologist index and apologist pages.
 * Stateless: the parent owns the filter state ({ s, b, sort }) and the URL.
 *
 * @param {{
 *   state: { s: string, b: string[], sort: string },
 *   onChange: (next: { s: string, b: string[], sort: string }) => void,
 *   books: { k: string, l: string, g: string }[],
 *   bookCounts: number[],            // clips citing each book (same order as books)
 *   sorts: Record<string, string>,   // value → label; first = default
 *   scriptureCounts?: Record<string, number>,
 *   countNoun?: string,              // what scriptureCounts count, for screen readers ("clips")
 *   idPrefix: string,
 * }} props
 */
export default function ApologistFilters({ state, onChange, books, bookCounts, sorts, scriptureCounts, countNoun = 'clips', idPrefix }) {
  const [open, setOpen] = useState(false);
  const booksBtn = useRef(null);
  // Closing from inside the panel unmounts the focused control: hand focus back to the toggle.
  const closePanel = () => {
    setOpen(false);
    booksBtn.current?.focus();
  };
  const groups = bookOptions(books, bookCounts, state);
  const selected = new Set(state.b);
  const keyToLabel = new Map(books.map((bk) => [bk.k, bk.l]));
  // A selection that is exactly one or more whole groups reads as the group names ("Old Testament").
  const wholeGroups = groups.filter((grp) => grp.list.every((bk) => selected.has(bk.k)));
  const wholeCount = wholeGroups.reduce((a, grp) => a + grp.list.length, 0);
  const bookSummary = !state.b.length
    ? 'All books'
    : wholeGroups.length && wholeCount === state.b.length ? wholeGroups.map((grp) => grp.label).join(' + ')
      : state.b.length <= 2 ? state.b.map((k) => keyToLabel.get(k)).join(', ') : `${state.b.length} books`;

  const setScripture = (s) => {
    const keep = state.b.filter((k) => {
      const bk = books.find((x) => x.k === k);
      return s === 'all' || (s === 'quran' ? bk.g === 'quran' : bk.g !== 'quran');
    });
    onChange({ ...state, s, b: keep });
  };
  const order = new Map(books.map((bk, i) => [bk.k, i]));
  const setBooks = (next) => onChange({ ...state, b: [...new Set(next)].sort((a, b) => order.get(a) - order.get(b)) });
  const toggleBook = (k) => setBooks(selected.has(k) ? state.b.filter((x) => x !== k) : [...state.b, k]);
  /** Whole-group toggle: select every book in the group, or clear them when all are already on. */
  const toggleGroup = (grp) => {
    const keys = grp.list.map((bk) => bk.k);
    const allOn = keys.every((k) => selected.has(k));
    setBooks(allOn ? state.b.filter((k) => !keys.includes(k)) : [...state.b, ...keys]);
  };
  const panelId = `${idPrefix}-books`;

  return (
    <div className="apg-filters">
      <div className="apg-seg" role="group" aria-label="Scripture">
        {SCRIPTURES.map((s) => {
          const disabled = scriptureCounts && s !== 'all' && !scriptureCounts[s];
          return (
            <button
              key={s}
              type="button"
              className="apg-seg__btn"
              aria-pressed={state.s === s}
              aria-label={scriptureCounts ? `${SCRIPTURE_LABELS[s]}: ${scriptureCounts[s] || 0} ${countNoun}` : undefined}
              disabled={disabled}
              onClick={() => setScripture(s)}
            >
              {SCRIPTURE_LABELS[s]}
              {scriptureCounts && <span className="apg-seg__n">{scriptureCounts[s] || 0}</span>}
            </button>
          );
        })}
      </div>

      <div className="apg-filters__row">
        <button
          ref={booksBtn}
          type="button"
          className="apg-books-btn"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={() => setOpen(!open)}
        >
          <span className="apg-books-btn__k">Books</span>
          <span className="apg-books-btn__v">{bookSummary}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <label className="apg-sort">
          <span className="apg-sort__k">Sort</span>
          <select value={state.sort} onChange={(e) => onChange({ ...state, sort: e.target.value })}>
            {Object.entries(sorts).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>

      {open && (
        <div
          className="apg-books"
          id={panelId}
          role="group"
          aria-label="Books"
          onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); closePanel(); } }}
        >
          <div className="apg-books__bar">
            <button type="button" className="apg-link-btn" onClick={() => onChange({ ...state, b: [] })} disabled={!state.b.length}>All books</button>
            <button type="button" className="apg-done-btn" onClick={closePanel}>Done</button>
          </div>
          {groups.map((grp) => {
            const allOn = grp.list.every((bk) => selected.has(bk.k));
            return (
            <fieldset key={grp.g} className="apg-books__group">
              <legend className="sr-only">{grp.label}</legend>
              <div className="apg-books__head">
                <span className="apg-books__title" aria-hidden="true">{grp.label}</span>
                <button
                  type="button"
                  className="apg-group-btn"
                  aria-pressed={allOn}
                  aria-label={allOn ? `Clear all ${grp.label} books` : `Select all ${grp.list.length} ${grp.label} books`}
                  onClick={() => toggleGroup(grp)}
                >
                  {allOn ? 'Clear' : `All ${grp.label}`}
                </button>
              </div>
              <div className="apg-chips">
                {grp.list.map((bk) => (
                  <button
                    key={bk.k}
                    type="button"
                    className="apg-chip"
                    aria-pressed={selected.has(bk.k)}
                    onClick={() => toggleBook(bk.k)}
                  >
                    {bk.l}<span className="apg-chip__n">{bk.n}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            );
          })}
        </div>
      )}
    </div>
  );
}
