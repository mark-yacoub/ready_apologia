/**
 * Phase 1 of the model: every hadith the article can quote, and the reports of each hadith item.
 *   - dataset entries → canonical refs (REF_MAP for Muslim), QUOTE_FIXES applied, `**` stripped
 *   - ids matched on the RAW dataset by anchor reference (ids.js), then ITEM_MUTATIONS applied
 *   - EXTRA_TEXTS (verified texts not in the dataset)
 *   - reports: Sunnah.com combined numbers merged, REPORT_NOTES applied, chips built
 *   - resolveSource(ref): a structured key → { text, label, link, … } (hadith, Qurʾān, tafsir)
 * `k` is the shared build context (model.js): { C, L, fail, warn, used, ext, int, quranUrl, … }.
 */
import { HADITH_ITEM_IDS, QURAN_STUB_CATEGORY_ID } from './ids.js';
import { displayText, cmpNorm, th, fill, parseRef, sunnahUrl } from './text.js';

export function buildSources(data, k) {
  const { C, L, fail, warn, used, ext, int, quranUrl, BASE } = k;
  const categories = (data.categories || []).filter(c => c.category_id !== QURAN_STUB_CATEGORY_ID);
  const stub = (data.categories || []).find(c => c.category_id === QURAN_STUB_CATEGORY_ID);
  if (stub && JSON.stringify(stub.verses) !== JSON.stringify(data.quran_slavery_tafsir?.verses)) {
    fail(`categories[${QURAN_STUB_CATEGORY_ID - 1}].verses differs from quran_slavery_tafsir.verses (the model reads quran_slavery_tafsir)`);
  }
  const collectionLabel = col => C.COLLECTIONS[col]?.label || col;

  /** dataset entry → { col, num, key } */
  function canonicalOf(h, where) {
    const ref = h.reference;
    let m = ref.match(/^Sahih al-Bukhari (\d+)$/);
    if (m) {
      if (h.url !== sunnahUrl('bukhari', m[1])) fail(`${where}: "${ref}" URL ${h.url} points at another number`);
      return { col: 'bukhari', num: m[1], key: `bukhari:${m[1]}` };
    }
    m = ref.match(/^Sahih Muslim (\d+):(\d+)$/);
    if (m) {
      const num = C.REF_MAP[ref];
      if (num) used.refMap.add(ref);
      if (!num) { fail(`${where}: Muslim reference "${ref}" has no REF_MAP entry`); return null; }
      if (h.url !== `https://sunnah.com/muslim/${m[1]}/${m[2]}`) fail(`${where}: "${ref}" URL ${h.url} does not match its label`);
      return { col: 'muslim', num, key: `muslim:${num}` };
    }
    fail(`${where}: unrecognised reference "${ref}"`);
    return null;
  }

  // Raw items with ids (matching on the raw dataset, before mutations).
  const rawItems = [];
  const anchorHits = Object.fromEntries(Object.keys(HADITH_ITEM_IDS).map(r => [r, 0]));
  categories.forEach((cat, ci) => (cat.items || []).forEach((it, ii) => {
    const where = `categories[${ci}].items[${ii}]`;
    let id = null;
    for (const h of it.hadiths || []) {
      if (!(h.reference in anchorHits)) continue;
      anchorHits[h.reference]++;
      if (id) fail(`${where} contains two anchor references (${id}, ${HADITH_ITEM_IDS[h.reference]})`);
      else id = HADITH_ITEM_IDS[h.reference];
    }
    if (!id) { fail(`${where} ("${it.title}") gets no id: none of its references is in HADITH_ITEM_IDS`); return; }
    rawItems.push({ id, where, raw: it });
  }));
  for (const [ref, n] of Object.entries(anchorHits)) if (n !== 1) fail(`anchor reference "${ref}" found ${n} times (must be exactly 1)`);

  // Entries per item, and the source map (canonical key → text).
  const itemEntries = new Map();
  const sources = new Map();
  for (const ri of rawItems) {
    if (itemEntries.has(ri.id)) { fail(`item id "${ri.id}" assigned twice`); continue; }
    const entries = [];
    (ri.raw.hadiths || []).forEach((h, hi) => {
      const where = `${ri.where}.hadiths[${hi}]`;
      const can = canonicalOf(h, where);
      if (!can) return;
      const fixKey = `${ri.id}|${h.reference}`;
      const fix = C.QUOTE_FIXES[fixKey];
      if (fix) {
        used.fixes.add(fixKey);
        if (!fix.reason || !fix.sourceUrl) fail(`QUOTE_FIXES["${fixKey}"] needs a reason and a sourceUrl`);
      }
      const entry = { ...can, refRaw: h.reference, origItem: ri.id, text: displayText(fix ? fix.text : h.english_text), fixed: !!fix, extra: false };
      entries.push(entry);
      if (!sources.has(can.key)) sources.set(can.key, entry);
    });
    itemEntries.set(ri.id, entries);
  }
  for (const id of Object.values(HADITH_ITEM_IDS)) if (!itemEntries.has(id)) fail(`item "${id}" not found in the dataset`);
  for (const key of Object.keys(C.QUOTE_FIXES)) if (!used.fixes.has(key)) fail(`stale QUOTE_FIXES key "${key}" (matches no dataset report)`);

  for (const [key, x] of Object.entries(C.EXTRA_TEXTS)) {
    const p = parseRef(key);
    if (!p || p.kind !== 'hadith') { fail(`EXTRA_TEXTS key "${key}" is not a hadith reference`); continue; }
    if (!sources.has(key)) sources.set(key, { ...p, text: displayText(x.text), extra: true, grades: x.grades || [], arabic: x.arabic || null });
  }

  /** Called when an EXTRA_TEXTS entry renders (a mutation adds it, or a quote cites it). */
  const useExtra = key => { if (C.EXTRA_TEXTS[key]) used.extras.add(key); };

  // ITEM_MUTATIONS (applied after ids are resolved on the raw data).
  for (const [i, m] of (C.ITEM_MUTATIONS || []).entries()) {
    const where = `ITEM_MUTATIONS[${i}]`;
    if (!m.reason) fail(`${where} needs a reason`);
    const to = itemEntries.get(m.to);
    if (!to) { fail(`${where}: unknown target item "${m.to}"`); continue; }
    let entry;
    if (m.op === 'move') {
      const from = itemEntries.get(m.from);
      const idx = from ? from.findIndex(e => e.refRaw === m.ref) : -1;
      if (idx < 0) { fail(`${where}: "${m.ref}" not found in "${m.from}"`); continue; }
      [entry] = from.splice(idx, 1);
    } else if (m.op === 'add') {
      const src = sources.get(m.extra);
      if (!src || !C.EXTRA_TEXTS[m.extra]) { fail(`${where}: "${m.extra}" is not in EXTRA_TEXTS`); continue; }
      useExtra(m.extra);
      entry = { ...src, refRaw: null, origItem: null, fixed: false, extra: true };
    } else { fail(`${where}: unknown op "${m.op}"`); continue; }
    if (m.position === 'first') to.unshift(entry); else to.push(entry);
  }
  // No item may carry the same report twice (a Sunnah.com combined pair is one text under two numbers).
  for (const [id, entries] of itemEntries) {
    const seen = new Set();
    for (const e of entries) {
      if (seen.has(e.key)) fail(`${id}: ${e.key} appears twice in the item (check ITEM_MUTATIONS)`);
      seen.add(e.key);
    }
  }

  // Reports per item.
  const permalinkFor = (col, num) => (k.permalinks.has(`/hadith/${col}/${num}`) ? `${BASE}/hadith/${col}/${num}` : null);
  const gradeOf = src => {
    if (C.COLLECTIONS[src.col]?.sahih) return null;
    return (src.grades || []).find(x => /albani/i.test(x)) || (src.grades || [])[0] || null;
  };
  /** "Al-Albani: Sahih" → the grade label (LABELS.gradeChip, tokens {grader} {grade}). */
  const gradeLabel = g => {
    if (!g) return null;
    // Split at the FIRST colon only: "al-Albānī: ḥasan; Zubair ʿAlī Zaʾī: ḍaʿīf" keeps the second grader.
    const i = String(g).indexOf(':');
    const [grader, grade] = i > -1 ? [String(g).slice(0, i), String(g).slice(i + 1).trim()] : ['', String(g)];
    return fill(L.gradeChip, { grader, grade }).replace(/^:\s*/, '');
  };
  function chipsFor(col, num, alsoNums = []) {
    const chips = [{ label: `${collectionLabel(col)} ${num}`, ...ext(sunnahUrl(col, num)), title: `${collectionLabel(col)} ${num} on Sunnah.com` }];
    for (const n of alsoNums) chips.push({ label: `${collectionLabel(col)} ${n}`, ...ext(sunnahUrl(col, num)), title: `${L.sameText}: ${collectionLabel(col)} ${num}` });
    const internal = permalinkFor(col, num);
    if (internal) chips.push({ label: L.openInternal, ...int(internal), title: `${collectionLabel(col)} ${num} on this site`, secondary: true });
    return chips;
  }

  const reportNotes = C.COPY.reportNotes || {};
  const usedNoteText = new Set();
  const reportsOf = new Map();
  for (const [id, entries] of itemEntries) {
    const reports = [];
    const byNum = new Map();
    for (const e of entries) {
      if (e.col === 'bukhari' && C.COMBINED[e.num] != null) {
        const kept = byNum.get(String(C.COMBINED[e.num]));
        if (kept) {
          if (cmpNorm(kept.text) !== cmpNorm(e.text)) fail(`${id}: Bukhārī ${e.num} is filed as combined with ${kept.num} but the texts differ`);
          kept.also.push(e.num);
          continue;
        }
        warn(`${id}: Bukhārī ${e.num} is a combined second number but ${C.COMBINED[e.num]} is not in the same item`);
      }
      const note = C.REPORT_NOTES[e.key];
      if (note) used.notes.add(e.key);
      if (reportNotes[e.key] != null) usedNoteText.add(e.key);
      reports.push({ ...e, also: [], chain: note?.kind === 'chain', group: note?.group || null, note: reportNotes[e.key] ?? null, counted: note?.count !== false });
      byNum.set(String(e.num), reports[reports.length - 1]);
    }
    for (const r of reports) {
      r.label = [`${collectionLabel(r.col)} ${r.num}`, ...r.also].join(' · ');
      r.chips = chipsFor(r.col, r.num, r.also);
      r.grade = gradeLabel(gradeOf(r));
      r.html = th(r.text);
    }
    reportsOf.set(id, reports);
  }
  for (const key of Object.keys(C.REPORT_NOTES)) if (!used.notes.has(key)) fail(`stale REPORT_NOTES key "${key}"`);
  for (const key of Object.keys(reportNotes)) if (!usedNoteText.has(key)) fail(`stale copy key hadith.reportNotes.${key}`);

  // Reference resolution.
  const verseText = key => {
    const [s, a] = String(key).split(':');
    return k.droge[`${s}:${a}`] || null;
  };
  /** @returns {{ kind, key, text, label, link, grade, … } | null} */
  function resolveSource(ref, where) {
    const p = typeof ref === 'object' && ref ? ref : parseRef(ref);
    if (!p) { fail(`${where}: not a reference key: "${ref}"`); return null; }
    if (p.kind === 'hadith') {
      const src = sources.get(p.key);
      if (!src) { fail(`${where}: ${p.key} is neither in the dataset nor in EXTRA_TEXTS`); return null; }
      useExtra(p.key);
      const label = `${collectionLabel(src.col)} ${src.num}`;
      return { kind: 'hadith', key: p.key, text: src.text, label, link: { ...ext(sunnahUrl(src.col, src.num)), label, title: `${label} on Sunnah.com` }, grade: gradeOf(src), col: src.col, num: src.num, arabic: src.arabic || k.arabicMap[p.key] || null };
    }
    if (p.kind === 'quran') {
      const ayat = [];
      for (let a = p.ayah; a <= (p.ayahEnd || p.ayah); a++) ayat.push(verseText(`${p.surah}:${a}`));
      const label = `Qurʾān ${p.surah}:${p.ayah}${p.ayahEnd ? `–${p.ayahEnd}` : ''}`;
      if (ayat.some(t => !t)) { fail(`${where}: no Droge text for ${label}`); return null; }
      return { kind: 'quran', key: p.key, keys: ayat.map((_, i) => `${p.surah}:${p.ayah + i}`), text: ayat.join(' '), label, link: { ...int(quranUrl(p.surah, p.ayahEnd || p.ayah, 'tafsir/tabari')), label, title: `Tafsir al-Ṭabarī on ${label}` }, grade: null };
    }
    const t = k.tafsir[p.who]?.[p.key];
    const info = C.TAFSIR_SOURCES[p.who];
    if (!t) { fail(`${where}: no repo ${info.label} commentary for ${p.key}`); return null; }
    const [s, a] = p.key.split(':');
    const label = `${info.label} on ${p.key}`;
    return { kind: 'tafsir', key: `${p.who}:${p.key}`, who: p.who, verse: p.key, text: t, label, link: { ...int(quranUrl(s, a, info.tab)), label, title: `${info.work} on Qurʾān ${p.key}` }, grade: null };
  }

  /** Unused hand-maintained entries (call after every quote has been resolved). */
  function checkUnused() {
    for (const ref of Object.keys(C.REF_MAP)) if (!used.refMap.has(ref)) fail(`stale REF_MAP key "${ref}" (matches no dataset report)`);
    for (const key of Object.keys(C.EXTRA_TEXTS)) if (!used.extras.has(key)) fail(`stale EXTRA_TEXTS key "${key}" (never rendered)`);
  }

  return { checkUnused, itemEntries, sources, reportsOf, resolveSource, verseText, gradeOf, gradeLabel, collectionLabel };
}
