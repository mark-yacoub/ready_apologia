/**
 * Phase 3 of the model: the items of the three sub-pages, in reading order.
 *   buildHadithPage  34 accounts in HADITH_SECTIONS (reports, key text, showcase, counts)
 *   buildQuranPage   16 passages in QURAN_SECTIONS (repo Droge, repo-verbatim tafsir quotes, chips)
 *   buildAnswersPage 9 answers in ANSWER_ORDER (answer panel, texts beside it, cited links)
 * Each item is registered in k.itemsById and placed exactly once (k.placeOnce).
 */
import { verseId, ANSWER_IDS } from './ids.js';
import { asNum, containsQuote, displayText, fill, sunnahUrl, th } from './text.js';
import { tl } from '../hadithReliability/render.js';

const TITLE_COUNT = /\b(\d+|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(?:reports|accounts|wordings|narrations)\b/i;

function sectionsOf(k, q, page, list) {
  const copy = k.C.COPY.pages[page]?.sections || {};
  for (const id of Object.keys(copy)) if (!list.some(s => s.id === id)) k.fail(`stale copy key pages.${page}.sections.${id}`);
  return list.map((s, i) => {
    const sc = copy[s.id] || {};
    if (!sc.question) k.fail(`pages.${page}.sections.${s.id}: missing question`);
    return {
      id: s.id, number: i + 1, legacy: s.legacy || [], ids: s.items,
      question: q.plainCopy(sc.question || s.id, `pages.${page}.sections.${s.id}.question`, { headline: true }),
      questionHtml: tl(sc.question || s.id),
      dekHtml: q.prose(sc.dek, `pages.${page}.sections.${s.id}.dek`),
    };
  });
}

function copyFor(k, table, id, where) {
  const c = k.C.COPY[table][id];
  if (!c) { k.fail(`${where}: no copy`); return {}; }
  k.used[table].add(id);
  return c;
}

export function buildHadithPage(k, q, src) {
  const { C, L, fail } = k;
  const items = [];
  const sections = sectionsOf(k, q, 'hadith', C.HADITH_SECTIONS);
  for (const s of sections) {
    s.items = s.ids.map(id => {
      k.placeOnce(id, 'hadith', `HADITH_SECTIONS.${s.id}`);
      const reports = src.reportsOf.get(id);
      if (!reports) { fail(`HADITH_SECTIONS.${s.id}: unknown item "${id}"`); return null; }
      const where = `copy.items.${id}`;
      const c = copyFor(k, 'items', id, where);
      const pool = [...reports.map(r => r.text), ...q.poolOf(c)];
      const textReports = reports.filter(r => !r.chain);
      const counted = textReports.filter(r => r.counted);
      const it = {
        id, page: 'hadith', kind: 'hadith', section: s,
        title: q.plainCopy(c.title, `${where}.title`, { headline: true }),
        contextHtml: q.prose(c.context, `${where}.context`, { pool }),
        hookHtml: q.prose(c.hook, `${where}.hook`, { pool }),
        takeawayHtml: q.prose(c.takeaway, `${where}.takeaway`, { pool }),
        comparisonHtml: q.prose(c.comparison, `${where}.comparison`, { pool, paragraphs: true }),
        classical: q.classical(c.classical, `${where}.classical`, pool),
        showcase: q.showcase(c.showcase, `${where}.showcase`, id, `${id}-texts`, pool),
        reports,
        mainReports: textReports.filter(r => !r.group),
        relatedReports: textReports.filter(r => r.group === 'related'),
        chainReports: reports.filter(r => r.chain),
        // One counted set for the total and the per-collection figures (they must add up).
        counts: {
          texts: counted.length,
          bukhari: counted.filter(r => r.col === 'bukhari').length,
          muslim: counted.filter(r => r.col === 'muslim').length,
        },
        legacy: [],
        href: `${k.P.hadith}#${id}`,
        copyCrossLinks: c.crossLinks,
      };
      if (it.counts.bukhari + it.counts.muslim !== it.counts.texts) fail(`${id}: per-collection counts (${it.counts.bukhari} + ${it.counts.muslim}) do not add up to ${it.counts.texts}`);
      const kq = c.keyQuote && q.quote(c.keyQuote.text, c.keyQuote.ref, `${where}.keyQuote`);
      it.keyQuote = kq ? { html: kq.html, ref: kq.ref, src: kq.src, arabic: kq.src.arabic || null } : null;
      const counts = [it.counts.bukhari && fill(L.countsBukhari, { n: it.counts.bukhari }), it.counts.muslim && fill(L.countsMuslim, { n: it.counts.muslim })].filter(Boolean).join(' · ');
      it.readAllLabel = fill(it.counts.texts === 1 ? L.readOne : C.ONE_STORY.includes(id) ? L.readAllOneStory : L.readAll, { n: it.counts.texts, counts }).replace(/\s*\(\)$/, '');
      it.relatedLabel = L[C.RELATED_LABEL[id] || 'relatedReports'];
      it.badges = [it.counts.bukhari && L.badges.bukhari, it.counts.muslim && L.badges.muslim].filter(Boolean);
      const m = it.title.match(TITLE_COUNT);
      if (m && asNum(m[1]) !== it.counts.texts) fail(`${where}.title says ${m[1]} reports; the item shows ${it.counts.texts}`);
      items.push(it);
      k.itemsById.set(id, it);
      return it;
    }).filter(Boolean);
  }
  for (const id of src.itemEntries.keys()) if (!k.allIds.has(id)) fail(`item "${id}" is in no hadith section`);
  return { sections, items };
}

export function buildQuranPage(k, q, src) {
  const { C, L, fail } = k;
  const verses = k.data.quran_slavery_tafsir?.verses || [];
  const verseById = new Map(verses.map(v => [verseId(v.verse_key), v]));
  const items = [];
  const sections = sectionsOf(k, q, 'quran', C.QURAN_SECTIONS);
  for (const s of sections) {
    s.items = s.ids.map(id => {
      k.placeOnce(id, 'quran', `QURAN_SECTIONS.${s.id}`);
      const v = verseById.get(id);
      if (!v) { fail(`QURAN_SECTIONS.${s.id}: unknown passage "${id}"`); return null; }
      const where = `copy.items.${id}`;
      const c = copyFor(k, 'items', id, where);
      const [surah, range] = v.verse_key.split(':');
      const [a0, a1] = range.split('-').map(Number);
      const ayat = [];
      for (let a = a0; a <= (a1 || a0); a++) {
        const t = src.verseText(`${surah}:${a}`);
        if (!t) fail(`${id}: no repo Droge text for ${surah}:${a}`);
        ayat.push({ key: `${surah}:${a}`, ayah: a, text: t || '' });
      }
      if (!a1 && typeof v.droge_translation === 'string' && ayat[0]?.text && v.droge_translation.trim() !== ayat[0].text.trim()) fail(`${id}: dataset droge_translation differs from the repo Droge`);
      if (a1 && !ayat.every(x => String(v.droge_translation).includes(x.text))) fail(`${id}: dataset range text does not contain the repo Droge āyāt`);
      const pool = [...ayat.flatMap(x => [x.text, k.tafsir.ik[x.key], k.tafsir.tb[x.key]]), ...q.poolOf(c)].filter(Boolean);
      const commentators = (c.tafsirQuotes || []).map((t, i) => {
        const w = `${where}.tafsirQuotes[${i}]`;
        const s0 = src.resolveSource(t.ref, w);
        if (!s0) return null;
        if (s0.kind !== 'tafsir') { fail(`${w}: ${t.ref} is not a tafsir reference`); return null; }
        if (!containsQuote(s0.text, t.text)) fail(`${w}: tafsir excerpt is not a substring of the repo commentary on ${s0.verse}: "${t.text.slice(0, 80)}…"`);
        const info = C.TAFSIR_SOURCES[s0.who];
        const chip = s0.who === 'ik' ? L.quranChipIbnKathir : L.quranChipTabari;
        // One source of truth for the commentator's name and date (config): when the copy's `who` is the
        // commentator himself ("al-Ṭabarī (d. 310 AH), his own comment"), the caption shows the name once,
        // keeps the rest of the attribution, and the date comes from TAFSIR_SOURCES (a different date fails).
        const who = q.plainCopy(t.who, `${w}.who`);
        const self = who.startsWith(info.label) ? who.slice(info.label.length).match(/^\s*(?:\(d\.\s*(\d+)\s*AH\))?\s*,?\s*(.*)$/) : null;
        if (self?.[1] && Number(self[1]) !== info.deathAh) fail(`${w}.who: says d. ${self[1]} AH; ${info.label} died ${info.deathAh} AH`);
        const rest = self && !/^on \d+:\d+$/.test(self[2]) ? self[2] : '';
        return {
          nameHtml: tl(self ? (rest ? `${info.label}, ${rest}` : info.label) : who),
          lineHtml: tl(fill(self ? L.tafsirSelf : L.tafsirVia, { source: info.label, deathAh: info.deathAh, work: info.work, key: s0.verse })),
          who, source: info.label, deathAh: info.deathAh, work: info.work, key: s0.verse,
          leadHtml: q.prose(t.lead, `${w}.lead`, { pool: [s0.text] }), html: `<span class="ms-vq">${th(displayText(t.text))}</span>`,
          link: { label: fill(chip, { key: s0.verse }), href: s0.link.href, external: false, attrs: {} },
        };
      }).filter(Boolean);
      if (!commentators.length) fail(`${where}: no tafsir quotes`);
      const related = (c.relatedNote?.items || []).map((x, i) => {
        const w = `${where}.relatedNote.items[${i}]`;
        const parts = x.parts.map((pt, j) => q.quote(pt.text, pt.ref, `${w}.parts[${j}]`)).filter(Boolean);
        const s0 = src.resolveSource(x.ref, w);
        if (!s0 || !parts.length) return null;
        return { leadHtml: q.prose(x.lead, `${w}.lead`, { pool: parts.map(pt => pt.src.text) }), html: parts.map(pt => pt.html).join(' … '), ref: s0.link, label: s0.label };
      }).filter(Boolean);
      const chipKey = C.VERSE_CHIP_AYAH[id] || `${surah}:${a0}`;
      const chips = c.verifyChips?.length
        ? c.verifyChips.map((ch, i) => {
          const s0 = src.resolveSource(ch.ref, `${where}.verifyChips[${i}]`);
          if (s0 && s0.kind !== 'tafsir') fail(`${where}.verifyChips[${i}]: ${ch.ref} is not a tafsir reference`);
          return s0 && { label: q.plainCopy(ch.label, `${where}.verifyChips[${i}].label`), href: s0.link.href, external: false, attrs: {} };
        }).filter(Boolean)
        : ['tb', 'ik'].map(who => ({ label: fill(who === 'ik' ? L.quranChipIbnKathir : L.quranChipTabari, { key: chipKey }), href: k.quranUrl(...chipKey.split(':'), C.TAFSIR_SOURCES[who].tab), external: false, attrs: {} }));
      const it = {
        id, page: 'quran', kind: 'verse', section: s, verseKey: v.verse_key, surah: Number(surah), surahName: k.surahNames?.[Number(surah)] || null,
        title: q.plainCopy(c.title, `${where}.title`, { headline: true }),
        contextHtml: q.prose(c.context, `${where}.context`, { pool }),
        hookHtml: q.prose(c.hook, `${where}.hook`, { pool }),
        takeawayHtml: q.prose(c.takeaway, `${where}.takeaway`, { pool }),
        comparisonHtml: q.prose(c.comparison, `${where}.comparison`, { pool, paragraphs: true }),
        classical: q.classical(c.classical, `${where}.classical`, pool),
        showcase: q.showcase(c.showcase, `${where}.showcase`, id, `${id}-verse`, pool),
        ayat, chips, commentators,
        related: related.length ? { titleHtml: tl(q.plainCopy(c.relatedNote.title || L.relatedVerses, `${where}.relatedNote.title`, { headline: true })), introHtml: q.prose(c.relatedNote.intro, `${where}.relatedNote.intro`, { pool: q.poolOf(c.relatedNote) }), items: related } : null,
        copyCrossLinks: c.crossLinks,
        badges: [L.badges.quran, L.badges.tafsir],
        legacy: [],
        href: `${k.P.quran}#${id}`,
      };
      items.push(it);
      k.itemsById.set(id, it);
      return it;
    }).filter(Boolean);
  }
  for (const id of verseById.keys()) if (!k.allIds.has(id)) fail(`passage "${id}" is in no Qurʾān section`);
  return { sections, items };
}

/** Citations in a faq's answer_markdown, with FAQ_LINK_FIXES applied. */
function citationsOf(k, src, f) {
  const { C } = k;
  const out = [];
  const seen = new Set();
  for (const m of String(f.answer_markdown || '').matchAll(/\[([^\[\]]+)\]\(([^)\s]+)\)/g)) {
    const url = m[2];
    const fixKey = C.FAQ_LINK_FIXES[`${f.faq_id}|${url}`] !== undefined ? `${f.faq_id}|${url}` : (C.FAQ_LINK_FIXES[url] !== undefined ? url : null);
    let key = null;
    if (fixKey) {
      k.used.links.add(fixKey);
      const fx = C.FAQ_LINK_FIXES[fixKey];
      if (!fx.reason) k.fail(`FAQ_LINK_FIXES["${fixKey}"] needs a reason`);
      if (fx.ref === null) continue;
      key = fx.ref;
    } else {
      let mm;
      if ((mm = url.match(/^https:\/\/sunnah\.com\/muslim\/(\d+)\/(\d+)$/))) {
        const num = C.REF_MAP[`Sahih Muslim ${mm[1]}:${mm[2]}`];
        if (!num) { k.fail(`faq ${f.faq_id}: in-book link ${url} has no canonical number (REF_MAP or FAQ_LINK_FIXES)`); continue; }
        key = `muslim:${num}`;
      } else if ((mm = url.match(/^https:\/\/sunnah\.com\/(bukhari|nasai|ibnmajah|abudawud|tirmidhi):(\d+[a-z]?)$/))) {
        key = `${mm[1]}:${mm[2]}`;
      } else if ((mm = url.match(/^quran\/(\d+)#(\d+)(?:-(\d+))?$/))) {
        key = `quran:${mm[1]}:${mm[3] || mm[2]}`;
      } else { k.fail(`faq ${f.faq_id}: unrecognised link ${url}`); continue; }
    }
    if (seen.has(key)) continue;
    seen.add(key);
    const qm = key.match(/^quran:(\d+):(\d+)$/);
    if (qm) { out.push({ label: `Qurʾān ${qm[1]}:${qm[2]}`, href: k.quranUrl(qm[1], qm[2], 'tafsir/tabari'), external: false, attrs: {} }); continue; }
    const [col, num] = key.split(':');
    const s0 = src.sources.get(key);
    const grade = s0 ? src.gradeOf(s0) : null;
    out.push({ label: `${src.collectionLabel(col)} ${num}${grade ? ` (${src.gradeLabel(grade)})` : ''}`, ...k.ext(sunnahUrl(col, num)) });
  }
  return out;
}

export function buildAnswersPage(k, q, src) {
  const { C, L, fail } = k;
  const faqById = new Map();
  for (const f of k.data.faqs || []) {
    const id = ANSWER_IDS[f.faq_id];
    if (!id) { fail(`faq_id ${f.faq_id} has no ANSWER_IDS entry`); continue; }
    faqById.set(id, f);
  }
  if (new Set(C.ANSWER_ORDER).size !== C.ANSWER_ORDER.length) fail('ANSWER_ORDER lists an answer twice');
  const chip = l => ({ label: l.label, href: l.href, external: l.external, attrs: l.attrs });
  const items = C.ANSWER_ORDER.map(id => {
    k.placeOnce(id, 'answers', 'ANSWER_ORDER');
    const f = faqById.get(id);
    if (!f) { fail(`ANSWER_ORDER: unknown answer "${id}"`); return null; }
    const where = `copy.answers.${id}`;
    const c = copyFor(k, 'answers', id, where);
    const textCard = (t, i, w) => {
      if (t.itemId) {
        const target = k.itemsById.get(t.itemId);
        if (!target) { fail(`${w}: unknown itemId "${t.itemId}"`); return null; }
        const kq = t.text && t.ref ? q.quote(t.text, t.ref, w) : null;
        const kk = kq ? { html: kq.html, ref: kq.ref, src: kq.src } : target.keyQuote;
        const toLabel = target.kind === 'verse' ? L.toPassage : target.kind === 'answer' ? L.toAnswer : L.toAccount;
        const aria = fill(L.toItemAria, { label: toLabel, title: target.title });
        const chips = [kk?.ref && chip(kk.ref), { label: toLabel, href: target.href, external: false, attrs: { 'aria-label': aria }, title: aria, toItem: true }].filter(Boolean);
        return { n: i + 1, labelHtml: tl(t.label || (kq ? kq.src.label : target.title)), html: kk?.html || '', grade: t.grade ? src.gradeLabel(t.grade) : src.gradeLabel(kk?.src?.grade), chips, item: target, srcText: kk?.src?.text || '' };
      }
      const r = q.quote(t.text, t.ref, w);
      if (!r) return null;
      return { n: i + 1, labelHtml: tl(t.label || r.src.label), html: r.html, grade: t.grade ? src.gradeLabel(t.grade) : src.gradeLabel(r.src.grade), chips: [chip(r.ref)], srcText: r.src.text };
    };
    // Consecutive cards that open the same item keep the item chip on the first card only.
    const dedupe = list => list.map((t, i) => (i && list[i - 1].item && t.item === list[i - 1].item ? { ...t, chips: t.chips.filter(ch => !ch.toItem) } : t));
    const answerTexts = dedupe((c.answerTexts || []).map((t, i) => textCard(t, i, `${where}.answerTexts[${i}]`)).filter(Boolean));
    const texts = dedupe((c.texts || []).map((t, i) => textCard(t, i, `${where}.texts[${i}]`)).filter(Boolean));
    // Answer prose may quote any text the answer cites (its cards, the items they point to, its own refs).
    const pool = [...answerTexts, ...texts].flatMap(t => [t.srcText || '', ...(t.item?.reports || []).map(r => r.text), ...(t.item?.ayat || []).map(a => a.text)]).concat(q.poolOf(c));
    const cites = citationsOf(k, src, f);
    const it = {
      id, page: 'answers', kind: 'answer', faqId: f.faq_id,
      title: q.plainCopy(c.question, `${where}.question`, { headline: true }),
      contextHtml: q.prose(c.context, `${where}.context`, { pool }),
      answerHtml: q.prose(c.answer, `${where}.answer`, { pool }),
      answerTexts,
      takeawayHtml: q.prose(c.takeaway, `${where}.takeaway`, { pool }),
      showcase: q.showcase(c.showcase, `${where}.showcase`, id, `${id}-texts-h`, pool),
      texts,
      classical: q.classical(c.classical, `${where}.classical`, pool),
      comparisonHtml: q.prose(c.comparison, `${where}.comparison`, { pool, paragraphs: true }),
      copyCrossLinks: c.crossLinks,
      citations: cites,
      allCitedLabel: fill(L.allCited, { n: cites.length }),
      legacy: [`faq-${f.faq_id}`],
      badges: [L.badges.answer],
      href: `${k.P.answers}#${id}`,
    };
    k.itemsById.set(id, it);
    return it;
  }).filter(Boolean);
  for (const id of faqById.keys()) if (!C.ANSWER_ORDER.includes(id)) fail(`answer "${id}" is not in ANSWER_ORDER`);
  for (const key of Object.keys(C.FAQ_LINK_FIXES)) if (!k.used.links.has(key)) fail(`stale FAQ_LINK_FIXES key "${key}"`);
  return { items };
}
