/**
 * Build-time data for /apologists and /apologists/[slug].
 *
 * Reads `shorts_metadata ⨝ short_per_verse` once (memoised) and groups every clip under the people
 * it credits (src/data/apologists.js). A clip with two speakers counts on both pages.
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
import { mapMtToLxx } from './scripture_mapper.js';
import {
  APOLOGIST_BY_SLUG, CHANNELS, channelKey, channelUrl, resolveApologistLabel, resolveSpeakerSlugs,
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

const defaultRank = async () => (await import('./video_service.js')).sortVideos;

let cache = null;

/**
 * @param {{ rank?: (rows: object[], verseId: string) => object[] }} [opts] ranking override (tests);
 *   defaults to `sortVideos` from video_service.js. Memoised only for the default ranking.
 */
export async function loadApologists(opts = {}) {
  if (cache && !opts.rank) return cache;
  const rank = opts.rank || await defaultRank();

  // Optional pipeline columns (plan §5): feature-detected so today's data.db still builds.
  const hasOriginal = hasColumn('shorts_metadata', 'original_url');
  const hasSpeakerSlugs = hasColumn('shorts_metadata', 'speaker_slugs');
  const meta = query(`
    SELECT video_id, channel_id, title, apologist_name, summary, rigor_score, raw_verses_display
           ${hasOriginal ? ', original_url' : ''}${hasSpeakerSlugs ? ', speaker_slugs' : ''}
    FROM shorts_metadata`);
  const links = query(`
    SELECT verse_id, video_id, ref_order, total_passages, is_primary, relevance_score, composite_score
    FROM short_per_verse`);

  const verseInfo = new Map();
  const infoFor = (vid) => {
    if (!verseInfo.has(vid)) verseInfo.set(vid, resolveVerse(vid));
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

  const people = new Map();
  const unregistered = new Map();
  const excludedLabels = new Map();
  const clipById = new Map();

  for (const row of meta) {
    const credited = (hasSpeakerSlugs && resolveSpeakerSlugs(row.speaker_slugs)) || resolveApologistLabel(row.apologist_name);
    if (!credited.length) {
      excludedLabels.set(row.apologist_name, (excludedLabels.get(row.apologist_name) || 0) + 1);
      continue;
    }
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
      slugs: credited.map((p) => p.slug),
      rigor: Number(row.rigor_score) || 0,
    };
    clipById.set(clip.videoId, clip);

    for (const p of credited) {
      if (!p.registered) unregistered.set(p.name, p.slug);
      if (!people.has(p.slug)) {
        const reg = APOLOGIST_BY_SLUG.get(p.slug);
        people.set(p.slug, {
          slug: p.slug,
          name: reg?.name || p.name,
          type: reg?.type || 'Person',
          alternateName: reg?.alternateName || null,
          channelKeys: reg?.channels || [],
          clips: [],
          firstAnswers: [],
        });
      }
      people.get(p.slug).clips.push(clip);
    }
  }

  // First answers: rank every verse's clips exactly like the verse /videos tab.
  const rowById = new Map(meta.map((r) => [r.video_id, r]));
  for (const [verseId, vLinks] of linksByVerse) {
    const info = infoFor(verseId);
    if (!info) continue;
    const rows = vLinks.map((l) => ({ ...rowById.get(l.video_id), target_verse_id: verseId, ...l })).filter((r) => r.video_id);
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

  if (unregistered.size) {
    console.warn(`[apologists] ${unregistered.size} name(s) not in src/data/apologists.js, pages use an auto slug: ${[...unregistered].map(([n, s]) => `${n} → ${s}`).join('; ')}`);
  }

  const result = {
    people: list,
    bySlug: new Map(list.map((p) => [p.slug, p])),
    unregistered,
    excludedLabels,
    hasOriginalUrl: hasOriginal,
    totalClips: new Set(list.flatMap((p) => p.clips.map((c) => c.videoId))).size,
  };
  if (!opts.rank) cache = result;
  return result;
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
 * clips[j]  = { v: videoId, s: summary, vs: [verseIdx in passage order], via?, o?: originalUrl, w?: [[slug, name]] }
 *             ordered by rigor score (highest first) inside each verse group.
 */
export function buildPagePayload(data, person) {
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
      const others = c.slugs.filter((s) => s !== person.slug).map((s) => [s, data.bySlug.get(s)?.name || s]);
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

/** The verses + clips needed to server-render `view` with only `openBooks` expanded. */
export function prunePayload(payload, view, openBooks) {
  const keepClips = new Set();
  for (const sec of view.sections) {
    if (!openBooks.has(sec.b)) continue;
    for (const g of sec.verses) g.clips.forEach((ci) => keepClips.add(ci));
  }
  if (keepClips.size === payload.clips.length) return payload;
  return { ...payload, clips: payload.clips.filter((_, i) => keepClips.has(i)) };
}
