// node --experimental-sqlite --test src/utils/apologistsLoader.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  APOLOGISTS, APOLOGIST_BY_SLUG, CHANNELS, channelUrl, resolveApologistLabel, resolveSpeakerSlugs, slugifyName,
} from '../data/apologists.js';
import {
  loadApologists, buildIndexPayload, buildPagePayload, creditLinks, prunePayload, resolveVerse,
} from './apologistsLoader.js';
import {
  ALL_OPEN_MAX, computeIndexRows, computePageView, initialOpenSections, parseFilters, serializeFilters, verseHref,
  verseLabel, reelItems, INDEX_SORTS, PAGE_SORTS,
} from '../components/apologists/apologistView.js';
import { query } from '../db.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
process.chdir(ROOT);

// The verse /videos tab orders by composite score (sortVideos uses it when present); video_service.js
// imports JSON without import attributes, so plain Node cannot load it here.
const rank = (rows) => rows.sort((a, b) => b.composite_score - a.composite_score || (b.rigor_score || 0) - (a.rigor_score || 0));
const slugsOf = (label) => resolveApologistLabel(label).map((p) => p.slug);

test('registry: slugs are unique, URL-safe, and aliases map to one person', () => {
  const seen = new Set();
  const aliasOwner = new Map();
  for (const a of APOLOGISTS) {
    assert.match(a.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, a.slug);
    assert.ok(!seen.has(a.slug), `duplicate slug ${a.slug}`);
    seen.add(a.slug);
    for (const al of a.aliases) {
      const k = al.toLowerCase();
      assert.ok(!aliasOwner.has(k) || aliasOwner.get(k) === a.slug, `alias "${al}" on ${a.slug} and ${aliasOwner.get(k)}`);
      aliasOwner.set(k, a.slug);
    }
    for (const ch of a.channels) assert.ok(CHANNELS[ch], `${a.slug}: unknown channel ${ch}`);
  }
});

test('alias map from the brief', () => {
  for (const n of ['Michael Jones', 'Michael Jones (InspiringPhilosophy)', 'Michael Jones & Bobby Finn']) assert.deepEqual(slugsOf(n), ['inspiringphilosophy'], n);
  for (const n of ['GodLogic', 'GodLogic (Avery Austin)', 'GodLogic (Avery)', 'Avery (GodLogic)']) assert.deepEqual(slugsOf(n), ['godlogic'], n);
  for (const n of ['Wesley Huff', 'Wes Huff']) assert.deepEqual(slugsOf(n), ['wes-huff'], n);
  for (const n of ['ONE FOR ISRAEL', 'One For Israel']) assert.deepEqual(slugsOf(n), ['one-for-israel'], n);
  for (const n of ['Erik Manning', 'Erik Manning (Testify)']) assert.deepEqual(slugsOf(n), ['erik-manning'], n);
  for (const n of ['Apostate Prophet', 'Apostate Prophet (Ridvan Aydemir)']) assert.deepEqual(slugsOf(n), ['apostate-prophet'], n);
  assert.deepEqual(slugsOf('Sam Shamoun & David Wood'), ['sam-shamoun', 'david-wood']);
  assert.deepEqual(slugsOf('Al Fadi and David Wood'), ['al-fadi', 'david-wood']);
  assert.deepEqual(slugsOf('Jay Smith / Al Fadi (CIRA International)'), ['jay-smith', 'al-fadi']);
  assert.deepEqual(slugsOf('Michael Jones (InspiringPhilosophy) & Tom Holland'), ['inspiringphilosophy']);
  for (const n of ['Unknown', 'Christian Apologist', 'Towards Jesus', 'Unknown (Towards Jesus Panel)', '', null]) assert.deepEqual(slugsOf(n), [], String(n));
  assert.equal(slugifyName("Dr. Dinesh D'Souza"), 'dinesh-dsouza');
  assert.deepEqual(slugsOf('CrossExamined'), ['frank-turek'], 'matches the pipeline registry');
  assert.deepEqual(slugsOf('CIRA International'), ['al-fadi'], 'matches the pipeline registry');
});

// Shared pipeline registry (data_collection/common/apologists.json): the source of truth for names and
// channels. Checked when present; CI without the pipeline checkout skips it.
const REGISTRY_PATH = [
  process.env.APOLOGIST_REGISTRY,
  path.join(os.homedir(), 'Documents/data_collection/common/apologists.json'),
].find((p) => p && fs.existsSync(p));

test('registry sync: channel buttons come from the pipeline registry; its aliases resolve here', { skip: !REGISTRY_PATH && 'pipeline registry not found (set APOLOGIST_REGISTRY)' }, () => {
  const registry = new Map(JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')).map((r) => [r.slug, r]));
  for (const a of APOLOGISTS) {
    const r = registry.get(a.slug);
    if (!r) continue; // website-only names (pipeline backfill pending) carry no channel
    const urls = a.channels.map(channelUrl);
    assert.deepEqual(urls.filter((u) => !(r.own_channel_urls || []).includes(u)), [], `${a.slug}: channel URL not in the registry`);
    assert.deepEqual((r.own_channel_urls || []).filter((u) => !urls.includes(u)), [], `${a.slug}: registry channel missing on the site`);
    assert.equal(a.type || 'Person', r.kind || 'Person', `${a.slug}: kind`);
    for (const alias of r.aliases) assert.deepEqual(slugsOf(alias), [a.slug], `${a.slug}: registry alias "${alias}"`);
  }
  for (const a of APOLOGISTS.filter((x) => !registry.has(x.slug))) assert.deepEqual(a.channels, [], `${a.slug}: channel without a registry entry`);
});

test('pipeline speaker_slugs column: preferred when set, excluded slugs dropped, bad values ignored', () => {
  assert.deepEqual(resolveSpeakerSlugs('["sam-shamoun","david-wood"]').map((p) => p.slug), ['sam-shamoun', 'david-wood']);
  assert.deepEqual(resolveSpeakerSlugs('["towards-jesus"]'), []);
  assert.equal(resolveSpeakerSlugs(''), null);
  assert.equal(resolveSpeakerSlugs('[]'), null);
  assert.equal(resolveSpeakerSlugs('not json'), null);
  assert.equal(resolveSpeakerSlugs('["bobby-finn"]')[0].registered, false);
});

test('every apologist_name in data.db is either registered or explicitly excluded (no auto slugs)', () => {
  const names = query('SELECT DISTINCT apologist_name AS n FROM shorts_metadata').map((r) => r.n);
  assert.ok(names.length > 50);
  const unregistered = names.flatMap((n) => resolveApologistLabel(n).filter((p) => !p.registered).map((p) => `${n} → ${p.name}`));
  assert.deepEqual(unregistered, [], 'add these to src/data/apologists.js (aliases) or EXCLUDED_LABELS');
});

test('loader: counts, multi-speaker credit, excluded labels, first answers', async () => {
  const data = await loadApologists({ rank });
  assert.ok(data.people.length >= 60, `pages: ${data.people.length}`);
  assert.equal(data.unregistered.size, 0);
  for (const p of data.people) {
    assert.ok(p.total > 0 && p.total === p.clips.length);
    assert.ok(p.bible + p.quran >= p.total, `${p.slug}: every clip cites a Bible or Qurʾān verse`);
    assert.equal(new Set(p.clips.map((c) => c.videoId)).size, p.total, `${p.slug}: no duplicate clips`);
    assert.ok(APOLOGIST_BY_SLUG.has(p.slug));
    for (const c of p.channels) assert.match(c.url, /^https:\/\/www\.youtube\.com\/@/);
  }
  for (const banned of ['unknown', 'christian-apologist', 'towards-jesus', 'bart-ehrman']) assert.ok(!data.bySlug.has(banned), banned);

  const both = query("SELECT video_id FROM shorts_metadata WHERE apologist_name = 'Sam Shamoun & David Wood' LIMIT 1")[0]?.video_id;
  if (both) {
    assert.ok(data.bySlug.get('sam-shamoun').clips.some((c) => c.videoId === both));
    assert.ok(data.bySlug.get('david-wood').clips.some((c) => c.videoId === both));
  }

  // First answers: each verse has at most one top clip, credited to its speakers.
  const firstCount = data.people.reduce((a, p) => a + p.firstAnswers.length, 0);
  assert.ok(firstCount > 1000, `first answers: ${firstCount}`);
  const spot = data.bySlug.get('sam-shamoun').firstAnswers[0];
  const top = rank(query('SELECT spv.*, sm.rigor_score FROM short_per_verse spv JOIN shorts_metadata sm USING (video_id) WHERE spv.verse_id = :v', { v: spot.id }))[0];
  assert.ok(data.bySlug.get('sam-shamoun').clips.some((c) => c.videoId === top.video_id), 'first answer = top-ranked clip on that verse');

  // Badges (VideosGrid / VideosCarousel) use the page credit rule and link only to built pages.
  for (const row of query('SELECT * FROM shorts_metadata')) {
    for (const c of creditLinks(data, row, '/base')) {
      if (c.href) assert.equal(c.href, `/base/apologists/${c.slug}`);
      assert.ok(!c.href || data.bySlug.has(c.slug), `badge for "${row.apologist_name}" links to missing /apologists/${c.slug}`);
    }
  }
  assert.deepEqual(creditLinks(data, { apologist_name: 'Unknown' }), []);
  assert.equal(creditLinks(data, { apologist_name: 'Sam Shamoun' })[0].href, '/apologists/sam-shamoun');
});

test('client verse labels/links match the build-time resolver', async () => {
  const data = await loadApologists({ rank });
  for (const p of data.people) {
    const payload = buildPagePayload(data, p);
    const byLabel = new Map(p.clips.flatMap((c) => c.verses).map((v) => [v.label, v]));
    for (const v of payload.verses) {
      const label = verseLabel(payload.books, v);
      const server = byLabel.get(label);
      assert.ok(server, `${p.slug}: no server verse for ${label}`);
      assert.equal(verseHref(payload.books, v, ''), server.href, label);
    }
  }
  assert.equal(resolveVerse('gn_1_1').href, '/bible/gn/1/1/videos');
  assert.equal(resolveVerse('4_157').label, 'Qurʾān 4:157');
  assert.equal(resolveVerse('gospels').href, '/bible/gospels/videos');
  assert.equal(resolveVerse('nope'), null);
  // OT ids are Masoretic; links use LXX numbering and must map back to the same id on the verse page.
  assert.equal(resolveVerse('ps_23_1').href, '/bible/ps/22/1/videos');
  assert.equal(resolveVerse('jl_3_5').href, '/bible/jl/2/32/videos');
  assert.equal(resolveVerse('jl_2_32'), null, 'not a Masoretic verse: /bible/jl/2/32 lists MT 3:5, so no tab shows it');
});

test('page view: every clip placed once; filters match the header counts', async () => {
  const data = await loadApologists({ rank });
  for (const p of data.people) {
    const payload = buildPagePayload(data, p);
    const all = computePageView(payload, { s: 'all', b: [], sort: 'verse' });
    assert.equal(all.total, p.total, p.slug);
    const placed = all.sections.flatMap((s) => s.verses.flatMap((g) => g.clips));
    assert.equal(new Set(placed).size, p.total, `${p.slug}: each clip once`);
    assert.equal(computePageView(payload, { s: 'bible', b: [], sort: 'verse' }).total, p.bible, `${p.slug} bible`);
    assert.equal(computePageView(payload, { s: 'quran', b: [], sort: 'count' }).total, p.quran, `${p.slug} quran`);
    const topBook = p.bookCounts[0];
    assert.equal(computePageView(payload, { s: 'all', b: [topBook.key], sort: 'verse' }).total, topBook.count, `${p.slug} ${topBook.key}`);

    const items = reelItems(payload, all, p.name);
    assert.equal(items.length, p.total);
    assert.ok(items.every((it) => it.videoId && it.verseLabel && it.verseHref && it.apologistName.startsWith(p.name)));

    // Pruned SSR payload renders the same open sections, with the same verses and clips.
    const open = new Set(initialOpenSections(all.sections).map((s) => s.b));
    assert.equal(open.size, p.total <= ALL_OPEN_MAX ? all.sections.length : 1);
    const ssr = prunePayload(payload, all, open);
    assert.ok(ssr.verses.length <= payload.verses.length && ssr.clips.length <= payload.clips.length);
    const ssrView = computePageView(ssr, { s: 'all', b: [], sort: 'verse' });
    const shown = (d, v) => v.sections.map((s) => [s.b, s.n, s.verses.map((g) => [verseLabel(d.books, d.verses[g.v]), g.clips.map((ci) => d.clips[ci].v)])]);
    assert.deepEqual(shown(ssr, ssrView), shown(payload, { sections: all.sections.filter((s) => open.has(s.b)) }), p.slug);
  }
});

test('index view: counts per filter match the person data', async () => {
  const data = await loadApologists({ rank });
  const payload = buildIndexPayload(data);
  const rows = computeIndexRows(payload, { s: 'all', b: [], sort: 'count' });
  assert.equal(rows.length, data.people.length);
  for (const r of rows) assert.equal(r.count, data.bySlug.get(r.s).total, r.s);
  for (let i = 1; i < rows.length; i += 1) assert.ok(rows[i - 1].count >= rows[i].count);
  const bible = computeIndexRows(payload, { s: 'bible', b: [], sort: 'name' });
  for (const r of bible) assert.equal(r.count, data.bySlug.get(r.s).bible, r.s);
  assert.equal(bible.length, data.people.filter((p) => p.bible).length);
  const jn = computeIndexRows(payload, { s: 'all', b: ['jn'], sort: 'count' });
  for (const r of jn) assert.equal(r.count, data.bySlug.get(r.s).bookCounts.find((b) => b.key === 'jn').count, r.s);
});

test('filter state: parse/serialize round trip, invalid values dropped', () => {
  const books = [{ k: 'jn', l: 'John', g: 'nt' }, { k: 'gn', l: 'Genesis', g: 'ot' }, { k: 'q4', l: '4. An-Nisa', g: 'quran' }];
  assert.deepEqual(parseFilters('', { books }), { s: 'all', b: [], sort: 'count' });
  assert.deepEqual(parseFilters('?s=bible&b=jn,q4,zz&sort=name', { books }), { s: 'bible', b: ['jn'], sort: 'name' });
  assert.deepEqual(parseFilters('?s=x&sort=verse', { books, sorts: PAGE_SORTS }), { s: 'all', b: [], sort: 'verse' });
  assert.equal(serializeFilters({ s: 'all', b: [], sort: 'count' }, { sorts: INDEX_SORTS }), '');
  assert.equal(serializeFilters({ s: 'quran', b: ['q4'], sort: 'count' }, { sorts: PAGE_SORTS }), '?s=quran&b=q4&sort=count');
  const st = { s: 'all', b: ['jn', 'gn'], sort: 'name' };
  assert.deepEqual(parseFilters(serializeFilters(st), { books }), st);
});
