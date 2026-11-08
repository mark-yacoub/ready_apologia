/**
 * Pure view logic shared by the apologist islands (client) and the build (SSR + tests).
 * No DOM, no Node APIs.
 *
 * Filter state lives in the URL query (canonical stays the bare page):
 *   ?s=bible|quran   scripture (default all)
 *   &b=jn,mt,q4      books, comma-separated keys (Bible ids, `q<sura>` for sūras, `gospels`)
 *   &sort=name       index: count (default) | name;  apologist page: verse (default) | count
 */

export const SCRIPTURES = ['all', 'bible', 'quran'];
export const SCRIPTURE_LABELS = { all: 'All', bible: 'Bible', quran: 'Qurʾān' };
export const GROUP_LABELS = { nt: 'New Testament', ot: 'Old Testament', quran: 'Qurʾān' };
export const INDEX_SORTS = { count: 'Most clips', name: 'Name A–Z' };
export const PAGE_SORTS = { verse: 'Verse order', count: 'Most clips' };

export const groupScripture = (g) => (g === 'quran' ? 'quran' : 'bible');

/** @returns {{ s: string, b: string[], sort: string }} */
export function parseFilters(search, { books = [], sorts = INDEX_SORTS } = {}) {
  const q = new URLSearchParams(search || '');
  const sortKeys = Object.keys(sorts);
  const s = SCRIPTURES.includes(q.get('s')) ? q.get('s') : 'all';
  const valid = new Map(books.map((bk) => [bk.k, bk]));
  const b = [...new Set(String(q.get('b') || '').split(',').map((x) => x.trim().toLowerCase()).filter((k) => valid.has(k)))]
    .filter((k) => s === 'all' || groupScripture(valid.get(k).g) === s);
  const sort = sortKeys.includes(q.get('sort')) ? q.get('sort') : sortKeys[0];
  return { s, b, sort };
}

/** Query string for the state ('' when every filter is at its default). */
export function serializeFilters(state, { sorts = INDEX_SORTS } = {}) {
  const q = new URLSearchParams();
  if (state.s && state.s !== 'all') q.set('s', state.s);
  if (state.b && state.b.length) q.set('b', state.b.join(','));
  if (state.sort && state.sort !== Object.keys(sorts)[0]) q.set('sort', state.sort);
  const str = q.toString().replace(/%2C/gi, ',');
  return str ? `?${str}` : '';
}

/** Does a book (`{k, g}`) pass the scripture + book filters? */
export function bookPasses(book, state) {
  if (!book) return false;
  if (state.s !== 'all' && groupScripture(book.g) !== state.s) return false;
  return !state.b.length || state.b.includes(book.k);
}

export const isDefaultFilter = (state) => state.s === 'all' && !state.b.length;

/** Apologist pages with at most this many clips (in the current view) open every book section. */
export const ALL_OPEN_MAX = 24;

/**
 * Sections expanded on first render: every section for short lists, else the first one.
 * Shared by the server render ([slug].astro) and the island so hydration matches.
 * @template {{ n: number }} S
 * @param {S[]} sections
 * @returns {S[]}
 */
export function initialOpenSections(sections) {
  const total = sections.reduce((a, s) => a + s.n, 0);
  return total <= ALL_OPEN_MAX ? sections : sections.slice(0, 1);
}

function baseUrl() {
  const raw = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '';
  return raw === '/' ? '' : raw.replace(/\/$/, '');
}

/** Verse label + /videos tab link from a compact verse `[bookIdx, chapter, verse]`
 *  (numbers already in the site's LXX numbering). Must match `resolveVerse()` in apologistsLoader.js. */
export function verseLabel(books, v) {
  const bk = books[v[0]];
  if (bk.k === 'gospels') return 'The Gospels';
  if (bk.g === 'quran') return `Qurʾān ${v[1]}:${v[2]}`;
  return `${bk.l} ${v[1]}:${v[2]}`;
}

export function verseHref(books, v, base = baseUrl()) {
  const bk = books[v[0]];
  if (bk.k === 'gospels') return `${base}/bible/gospels/videos`;
  if (bk.g === 'quran') return `${base}/quran/${v[1]}/${v[2]}/videos`;
  return `${base}/bible/${bk.k}/${v[1]}/${v[2]}/videos`;
}

/**
 * Apologist page: place each clip under its FIRST verse (passage order) that passes the filters.
 * @returns {{ total: number, sections: { b: number, n: number, verses: { v: number, clips: number[] }[] }[] }}
 */
export function computePageView(data, state) {
  const sections = new Map();
  let total = 0;
  data.clips.forEach((clip, ci) => {
    const vi = clip.vs.find((i) => bookPasses(data.books[data.verses[i][0]], state));
    if (vi === undefined) return;
    total += 1;
    const b = data.verses[vi][0];
    if (!sections.has(b)) sections.set(b, new Map());
    const verses = sections.get(b);
    if (!verses.has(vi)) verses.set(vi, []);
    verses.get(vi).push(ci);
  });
  let list = [...sections].map(([b, verses]) => ({
    b,
    verses: [...verses].map(([v, clips]) => ({ v, clips })),
  }));
  for (const sec of list) sec.n = sec.verses.reduce((acc, x) => acc + x.clips.length, 0);
  const byVerse = (a, b) => a.v - b.v; // verses are pre-sorted canonically
  if (state.sort === 'count') {
    list.forEach((sec) => sec.verses.sort((a, b) => b.clips.length - a.clips.length || byVerse(a, b)));
    list.sort((a, b) => b.n - a.n || a.b - b.b);
  } else {
    list.forEach((sec) => sec.verses.sort(byVerse));
    list.sort((a, b) => a.b - b.b);
  }
  return { total, sections: list };
}

/** Ordered reel queue for the current view (every section, expanded or not). */
export function reelItems(data, view, personName) {
  const out = [];
  for (const sec of view.sections) {
    for (const g of sec.verses) {
      const v = data.verses[g.v];
      for (const ci of g.clips) {
        const c = data.clips[ci];
        const item = {
          videoId: c.v,
          apologistName: [personName, ...(c.w || []).map((w) => w[1])].join(' & '),
          verseLabel: verseLabel(data.books, v),
          verseHref: verseHref(data.books, v),
        };
        if (c.o) item.originalUrl = c.o;
        out.push(item);
      }
    }
  }
  return out;
}

/**
 * Index rows for the filters. A person's count = distinct clips citing at least one passing book.
 * @returns {{ s: string, n: string, count: number, top: string[] }[]}
 */
export function computeIndexRows(data, state) {
  const pass = data.books.map((bk) => bookPasses(bk, state));
  const rows = [];
  for (const p of data.people) {
    let count = 0;
    const perBook = new Map();
    for (const [n, ...bks] of p.c) {
      const hit = bks.filter((i) => pass[i]);
      if (!hit.length) continue;
      count += n;
      for (const i of hit) perBook.set(i, (perBook.get(i) || 0) + n);
    }
    if (!count) continue;
    const top = [...perBook].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 3).map(([i]) => shortBookLabel(data.books[i]));
    rows.push({ s: p.s, n: p.n, count, top });
  }
  if (state.sort === 'name') rows.sort((a, b) => a.n.localeCompare(b.n, 'en', { sensitivity: 'base' }));
  else rows.sort((a, b) => b.count - a.count || a.n.localeCompare(b.n, 'en', { sensitivity: 'base' }));
  return rows;
}

export function shortBookLabel(bk) {
  return bk.g === 'quran' ? `Q ${bk.l.replace(/^(\d+)\..*$/, '$1')}` : bk.l;
}

/** Books relevant to the current scripture, with a count each (clips citing it), grouped NT / OT / Qurʾān. */
export function bookOptions(books, counts, state) {
  const groups = { nt: [], ot: [], quran: [] };
  books.forEach((bk, i) => {
    if (state.s !== 'all' && groupScripture(bk.g) !== state.s) return;
    if (!counts[i]) return;
    groups[bk.g].push({ ...bk, i, n: counts[i] });
  });
  return Object.entries(groups).filter(([, list]) => list.length).map(([g, list]) => ({ g, label: GROUP_LABELS[g], list }));
}
