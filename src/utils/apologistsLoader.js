/**
 * Build-time data for /apologists and /apologists/[slug].
 *
 * Reads `shorts_metadata ⨝ short_per_verse` once (memoised) and groups every clip under the featured
 * pages it credits (FEATURED_APOLOGISTS in src/data/apologists.js; a page also holds the clips of the
 * people it includes). A clip with two featured speakers counts on both pages; clips that credit no
 * featured person are on no page (the verse /videos tabs still credit them by name).
 *
 * - Per person: clips (each with its verses in passage order), per-book clip counts, Bible/Qurʾān
 *   counts, and "first answer" verses: verses where this person's clip is ranked first by the same
 *   `sortVideos` ranking the verse /videos tab uses, so the claim matches what readers see there.
 * - `buildIndexPayload()` / `buildPagePayload()` produce the compact JSON the filter islands read.
 * - `speaker_slugs` (JSON array, preferred when set) and `original_url` are optional pipeline columns,
 *   feature-detected (plan §5); without them the credit comes from `apologist_name` via the registry.
 *
 * Counting rule shared by the pages and the filters: a clip counts once for every book it cites, and
 * once for a scripture when it cites any verse of that scripture. "N clips" is always distinct clips.
 */
import fs from 'node:fs';
import path from 'node:path';
import { query } from '../db.js';
import { getBibleUrl, getQuranUrl } from './urlFactory.js';
import { mapLxxToMt, mapMtToLxx } from './scripture_mapper.js';
import {
  APOLOGIST_BY_SLUG, CHANNELS, FEATURED_APOLOGISTS, FEATURED_BY_SLUG, channelKey, channelUrl, pageSlugFor,
  resolveApologistLabel, resolveSpeakerSlugs,
} from '../data/apologists.js';

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(process.cwd(), rel), 'utf8'));

const SUMMARY_MAX = 150;

let booksCache = null;
/** Book catalog: key → { key, label, group: 'nt'|'ot'|'quran', order }. */
export function getBookCatalog() {
  if (booksCache) return booksCache;
  const meta = readJson('src/data/books_meta.json');
  const suras = readJson('src/data/quran/arabic/meta.json');
  const map = new Map();
  let order = 0;
  map.set('gospels', { key: 'gospels', label: 'The Gospels', group: 'nt', order: order++ });
  for (const b of meta.nt) map.set(b.id, { key: b.id, label: b.name, group: 'nt', order: order++ });
  for (const b of meta.ot) map.set(b.id, { key: b.id, label: b.name, group: 'ot', order: order++ });
  for (const s of suras) map.set(`q${s.id}`, { key: `q${s.id}`, label: `${s.id}. ${s.transliteration}`, group: 'quran', order: 1000 + s.id });
  booksCache = map;
  return map;
}

/**
 * Resolve a short_per_verse verse id to its display label, /videos tab link and book.
 * Bible OT ids are Masoretic in the DB; links and labels use the site's LXX numbering.
 * @returns {{ id, book, label, href, scripture: 'bible'|'quran', sort: number[] } | null}
 */
export function resolveVerse(verseId) {
  const catalog = getBookCatalog();
  const id = String(verseId || '').trim().toLowerCase();
  if (id === 'gospels') {
    return { id, book: 'gospels', label: 'The Gospels', href: `${getBibleUrl({})}/gospels/videos`, scripture: 'bible', sort: [catalog.get('gospels').order, 0, 0] };
  }
  let m = id.match(/^(\d+)_(\d+)$/);
  if (m) {
    const book = `q${Number(m[1])}`;
    if (!catalog.has(book)) return null;
    return {
      id, book, scripture: 'quran',
      label: `Qurʾān ${Number(m[1])}:${Number(m[2])}`,
      href: getQuranUrl({ surah: Number(m[1]), ayah: Number(m[2]), tab: 'videos' }),
      sort: [catalog.get(book).order, Number(m[1]), Number(m[2])],
    };
  }
  m = id.match(/^([0-9a-z]*[a-z][0-9a-z]*)_(\d+)_(\d+)$/);
  if (!m) return null;
  let [, book, chapter, verse] = m;
  const entry = catalog.get(book);
  if (!entry) return null;
  if (entry.group === 'ot') {
    const lxx = mapMtToLxx(book, chapter, verse);
    if (lxx) { book = lxx.book; chapter = String(lxx.chapter); verse = String(lxx.verse); }
    // The verse page maps its LXX address back to MT and queries that exact id. Ids that do not
    // round-trip (e.g. `jl_2_32`, English numbering stored as MT) are listed on no /videos tab.
    const back = mapLxxToMt(book, chapter, verse);
    if (!back || `${back.book}_${back.chapter}_${back.verse}` !== String(verseId)) return null;
  }
  const bookEntry = catalog.get(book) || entry;
  return {
    id, book: bookEntry.key, scripture: 'bible',
    label: `${bookEntry.label} ${chapter}:${verse}`,
    href: getBibleUrl({ book, chapter, verse, tab: 'videos' }),
    sort: [bookEntry.order, Number(chapter), Number(verse)],
  };
}

const cmpSort = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

function truncate(text, max) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const at = cut.lastIndexOf(' ');
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.–—-]+$/, '')}…`;
}

function hasColumn(table, column) {
  return query(`PRAGMA table_info(${table})`).some((c) => c.name === column);
}

/**
 * The verse /videos tab ranking, verbatim: those pages pass `getRawVideosByVerseId()` rows
 * (`sm.*` + `short_per_verse` columns, ORDER BY composite_score DESC, rigor_score DESC) through
 * `enrichVideosWithVerses()`, which resolves `verses` and calls `sortVideos`. sortVideos treats scores
 * within 0.05 as equal, so its result depends on the input order too: callers pre-order the rows the
 * same way (see `byTabOrder`).
 */
const defaultRank = async () => {
  const { enrichVideosWithVerses } = await import('./video_service.js');
  return (rows, verseId) => enrichVideosWithVerses(rows, '', verseId);
};

/** SQL order of getRawVideosByVerseId (stable sort keeps the table order for ties, like SQLite). */
const byTabOrder = (a, b) => (b.composite_score ?? -Infinity) - (a.composite_score ?? -Infinity)
  || (b.rigor_score || 0) - (a.rigor_score || 0);

/**
 * People a `shorts_metadata` row credits: the pipeline's `speaker_slugs` when set, else
 * `apologist_name` through the registry. The single rule for pages, counts and badges.
 */
export function creditedPeople(row) {
  return resolveSpeakerSlugs(row?.speaker_slugs) || resolveApologistLabel(row?.apologist_name);
}

/** Featured page slugs a row's clip appears on (deduplicated, in credit order). */
export function pageSlugsOf(people) {
  return [...new Set(people.map((p) => pageSlugFor(p.slug)).filter(Boolean))];
}

/**
 * Credits for a video card (build time): one per credited person, linked to the featured page that
 * shows their clips, plain text (`href: null`) for everyone else. A person folded into another page
 * reads "<name> · <page name>". `[]` when the row credits nobody (Unknown, uploader names, …).
 * @returns {{ slug: string, name: string, href: string | null }[]}  slug = the person's registry slug
 */
export function creditLinks(row, base = '') {
  const seenPages = new Set();
  const out = [];
  for (const p of creditedPeople(row)) {
    const page = pageSlugFor(p.slug);
    if (page && seenPages.has(page)) continue; // e.g. "Seth Postell" and "ONE FOR ISRAEL" on one clip
    if (page) seenPages.add(page);
    const pageName = page && FEATURED_BY_SLUG.get(page).name;
    out.push({
      slug: p.slug,
      name: page && page !== p.slug ? `${p.name} · ${pageName}` : p.name,
      href: page ? `${base}/apologists/${page}` : null,
    });
  }
  return out;
}

let cachePromise = null;

/**
 * @param {{ rank?: (rows: object[], verseId: string) => object[] }} [opts] ranking override (tests:
 *   plain Node cannot import video_service.js); defaults to the verse-tab ranking above.
 *   Memoised (as a promise, so concurrent page renders share one load) for the default ranking only.
 */
export function loadApologists(opts = {}) {
  if (opts.rank) return buildApologists(opts.rank);
  cachePromise ??= defaultRank().then(buildApologists);
  return cachePromise;
}

async function buildApologists(rank) {
  // Optional pipeline columns (plan §5): feature-detected so today's data.db still builds.
  const hasOriginal = hasColumn('shorts_metadata', 'original_url');
  // `*` so ranking sees exactly the columns the verse tab passes to sortVideos.
  const meta = query('SELECT * FROM shorts_metadata');
  const links = query(`
    SELECT verse_id, video_id, ref_order, total_passages, is_primary, relevance_score, composite_score
    FROM short_per_verse`);

  const verseInfo = new Map();
  const unreachable = new Set();
  const infoFor = (vid) => {
    if (!verseInfo.has(vid)) {
      const info = resolveVerse(vid);
      if (!info) unreachable.add(vid);
      verseInfo.set(vid, info);
    }
    return verseInfo.get(vid);
  };

  const linksByVideo = new Map();
  const linksByVerse = new Map();
  for (const l of links) {
    if (!linksByVideo.has(l.video_id)) linksByVideo.set(l.video_id, []);
    linksByVideo.get(l.video_id).push(l);
    if (!linksByVerse.has(l.verse_id)) linksByVerse.set(l.verse_id, []);
    linksByVerse.get(l.verse_id).push(l);
  }

  const people = new Map(FEATURED_APOLOGISTS.map((f) => {
    const reg = APOLOGIST_BY_SLUG.get(f.slug);
    if (!reg) throw new Error(`[apologists] featured slug "${f.slug}" is not in APOLOGISTS (src/data/apologists.js)`);
    return [f.slug, {
      slug: f.slug,
      name: reg.name,
      type: reg.type || 'Person',
      alternateName: reg.alternateName || null,
      channelKeys: reg.channels || [],
      clips: [],
      firstAnswers: [],
    }];
  }));
  const clipById = new Map();

  for (const row of meta) {
    const credited = creditedPeople(row);
    const pages = pageSlugsOf(credited);
    if (!pages.length) continue;
    const verses = (linksByVideo.get(row.video_id) || [])
      .map((l) => ({ l, info: infoFor(l.verse_id) }))
      .filter((x) => x.info)
      .sort((a, b) => (a.l.ref_order || 0) - (b.l.ref_order || 0) || cmpSort(a.info.sort, b.info.sort))
      .map((x) => x.info);
    if (!verses.length) continue;

    const clip = {
      videoId: row.video_id,
      summary: truncate(row.summary || row.title, SUMMARY_MAX),
      channel: channelKey(row.channel_id),
      originalUrl: hasOriginal && /^https:\/\//.test(row.original_url || '') ? row.original_url : null,
      verses: [...new Map(verses.map((v) => [v.id, v])).values()],
      slugs: pages,
      // Everyone credited, for "with …" on a page card: [page slug or null, name].
      credits: credited.map((p) => [pageSlugFor(p.slug), p.name]),
      rigor: Number(row.rigor_score) || 0,
    };
    clipById.set(clip.videoId, clip);
    for (const slug of pages) people.get(slug).clips.push(clip);
  }
  const empty = [...people.values()].filter((p) => !p.clips.length).map((p) => p.slug);
  if (empty.length) throw new Error(`[apologists] featured apologist(s) with no clips (no page to build): ${empty.join(', ')}`);

  // First answers: rank every verse's clips exactly like the verse /videos tab.
  const rowById = new Map(meta.map((r) => [r.video_id, r]));
  for (const [verseId, vLinks] of linksByVerse) {
    const info = infoFor(verseId);
    if (!info) continue;
    const rows = vLinks
      .filter((l) => rowById.has(l.video_id))
      .map((l) => ({ ...rowById.get(l.video_id), target_verse_id: verseId, ...l }))
      .sort(byTabOrder);
    const top = rank(rows, verseId)[0];
    const clip = top && clipById.get(top.video_id);
    if (!clip) continue;
    for (const slug of clip.slugs) people.get(slug)?.firstAnswers.push(info);
  }

  const catalog = getBookCatalog();
  const list = [...people.values()].map((p) => {
    const books = new Map();
    let bible = 0;
    let quran = 0;
    for (const c of p.clips) {
      const bs = new Set(c.verses.map((v) => v.book));
      for (const b of bs) books.set(b, (books.get(b) || 0) + 1);
      if (c.verses.some((v) => v.scripture === 'bible')) bible += 1;
      if (c.verses.some((v) => v.scripture === 'quran')) quran += 1;
    }
    const bookCounts = [...books.entries()]
      .map(([key, count]) => ({ key, label: catalog.get(key).label, group: catalog.get(key).group, count }))
      .sort((a, b) => b.count - a.count || catalog.get(a.key).order - catalog.get(b.key).order);
    const channels = p.channelKeys
      .map((k) => ({ key: k, name: CHANNELS[k]?.name, url: channelUrl(k) }))
      .filter((c) => c.name && c.url);
    return {
      ...p,
      channels,
      total: p.clips.length,
      bible,
      quran,
      bookCounts,
      firstAnswers: [...new Map(p.firstAnswers.map((v) => [v.id, v])).values()].sort((a, b) => cmpSort(a.sort, b.sort)),
    };
  }).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  if (unreachable.size) {
    console.warn(`[apologists] ${unreachable.size} short_per_verse verse id(s) have no /videos tab that lists them; left out of the apologist pages: ${[...unreachable].join(', ')}`);
  }

  return {
    people: list,
    bySlug: new Map(list.map((p) => [p.slug, p])),
    unreachableVerses: unreachable,
    hasOriginalUrl: hasOriginal,
    totalClips: new Set(list.flatMap((p) => p.clips.map((c) => c.videoId))).size,
  };
}

/** Books present in `people`, in catalog order, as compact `{ k, l, g }` entries. */
function booksFor(clips) {
  const catalog = getBookCatalog();
  const keys = new Set(clips.flatMap((c) => c.verses.map((v) => v.book)));
  return [...keys].map((k) => catalog.get(k)).sort((a, b) => a.order - b.order).map((b) => ({ k: b.key, l: b.label, g: b.group }));
}

/**
 * Index island payload: books + per person the distinct book sets of their clips with counts,
 * so "clips in any selected book" is exact (no double counting).
 * people[i] = { s: slug, n: name, t: total, c: [[count, bookIdx...], ...] }
 */
export function buildIndexPayload(data) {
  const allClips = data.people.flatMap((p) => p.clips);
  const books = booksFor(allClips);
  const idx = new Map(books.map((b, i) => [b.k, i]));
  const people = data.people.map((p) => {
    const combos = new Map();
    for (const c of p.clips) {
      const key = [...new Set(c.verses.map((v) => idx.get(v.book)))].sort((a, b) => a - b).join('.');
      combos.set(key, (combos.get(key) || 0) + 1);
    }
    return {
      s: p.slug,
      n: p.name,
      t: p.total,
      c: [...combos].map(([k, n]) => [n, ...k.split('.').map(Number)]),
    };
  });
  return { books, people };
}

/**
 * Apologist page island payload (compact; rendered by src/components/apologists/apologistView.js).
 * books[i]  = { k, l, g }
 * verses[i] = [bookIdx, chapter, verse] in canonical order (LXX numbering, = the link target)
 * clips[j]  = { v: videoId, s: summary, vs: [verseIdx in passage order], via?, o?: originalUrl,
 *               w?: [[page slug | null, name]] (other speakers; null = no page, shown as plain text) }
 *             ordered by rigor score (highest first) inside each verse group.
 */
export function buildPagePayload(person) {
  const books = booksFor(person.clips);
  const bIdx = new Map(books.map((b, i) => [b.k, i]));
  const verseList = [...new Map(person.clips.flatMap((c) => c.verses).map((v) => [v.id, v])).values()]
    .sort((a, b) => cmpSort(a.sort, b.sort));
  const vIdx = new Map(verseList.map((v, i) => [v.id, i]));
  const own = new Set(person.channelKeys);
  const clips = [...person.clips]
    .sort((a, b) => b.rigor - a.rigor || a.videoId.localeCompare(b.videoId))
    .map((c) => {
      const out = { v: c.videoId, s: c.summary, vs: c.verses.map((v) => vIdx.get(v.id)) };
      const via = own.has(c.channel) ? null : CHANNELS[c.channel]?.name;
      if (via) out.via = via;
      if (c.originalUrl) out.o = c.originalUrl;
      // Other speakers; people folded into this page are not "with" it.
      const others = c.credits.filter(([page]) => page !== person.slug);
      if (others.length) out.w = others;
      return out;
    });
  return {
    slug: person.slug,
    name: person.name,
    books,
    verses: verseList.map((v) => [bIdx.get(v.book), v.sort[1], v.sort[2]]),
    clips,
  };
}

/**
 * The slice of `payload` needed to server-render `view` with only the `openBooks` sections expanded:
 * their clips and verses (re-indexed), so the island props do not repeat the full payload, which
 * ships once in the page's JSON <script>. `books` keep their indices (section ids refer to them).
 */
export function prunePayload(payload, view, openBooks) {
  const keepClips = new Set();
  for (const sec of view.sections) {
    if (!openBooks.has(sec.b)) continue;
    for (const g of sec.verses) g.clips.forEach((ci) => keepClips.add(ci));
  }
  const clips = payload.clips.filter((_, i) => keepClips.has(i));
  const usedVerses = [...new Set(clips.flatMap((c) => c.vs))].sort((a, b) => a - b); // keeps canonical order
  const remap = new Map(usedVerses.map((v, i) => [v, i]));
  return {
    ...payload,
    verses: usedVerses.map((v) => payload.verses[v]),
    clips: clips.map((c) => ({ ...c, vs: c.vs.map((v) => remap.get(v)) })),
  };
}
