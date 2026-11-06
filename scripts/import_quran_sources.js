/**
 * Imports the v3 "Primary Sources of the Quran" dataset into ready_apologia.
 *
 * Source of truth (data_collection repo, single writer):
 *   islamicdata/quran_sources/final_output/quran_sources_master.json
 *
 * Outputs (read-only data for the app; never hand-edit):
 *   src/data/quran/sources/surah_<n>.json
 *     — deduplicated per-surah view model ({ entries: { [id]: entry }, verses: { [verseId]: [id, ...] } })
 *       for the verse drawer tab (/quran/[surah]/[ayah]/sources)
 *   src/data/quran/sources/index.json
 *     — category & tradition filter counts, per-verse counts, and dataset SHA-256
 *   public/data/quran-sources/<catSlug>/<tradKeyOrAll>/<page>.json
 *     — pre-paginated minimal side-by-side reference cards (20/page, strongest-first)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  CATEGORIES,
  TRADITIONS,
  CARDS_PER_PAGE,
  traditionKeyFor,
  validateDataset,
  resolveSourceLink,
  verifyLabelFor,
  distinctWorkSubtitle,
  langCodeFor,
  dirForLang,
  cleanWhitespace,
  cleanQuoteText,
  hasHighlightMatch,
} from '../src/utils/quranSources/contract.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const DATASET_PATH = process.env.QURAN_SOURCES_PATH
  ? path.resolve(process.env.QURAN_SOURCES_PATH)
  : path.resolve(
      repoRoot,
      '../data_collection/islamicdata/quran_sources/final_output/quran_sources_master.json'
    );
const DEST_DIR = path.resolve(repoRoot, 'src/data/quran/sources');
const PUBLIC_DIR = path.resolve(repoRoot, 'public/data/quran-sources');
const ENGLISH_PATH = path.resolve(repoRoot, 'src/data/quran/english/droge_translation.json');
const ARABIC_SURAH_DIR = path.resolve(repoRoot, 'src/data/quran/arabic/surahs');

function loadArabicSurahs() {
  const map = new Map();
  for (let s = 1; s <= 114; s++) {
    const p = path.join(ARABIC_SURAH_DIR, `${s}.json`);
    if (fs.existsSync(p)) {
      const d = JSON.parse(fs.readFileSync(p, 'utf8'));
      map.set(s, d.verses || {});
    }
  }
  return map;
}

/**
 * @param {object} src Raw source citation from dataset
 * @returns {import('../src/utils/quranSources/contract.js').QuranSourceView}
 */
function toSource(src) {
  const link = resolveSourceLink(src.source_url);
  const title = cleanWhitespace(src.source_title);
  const ref = cleanWhitespace(src.source_reference);
  const lang = cleanWhitespace(src.source_language);
  const langCode = langCodeFor(lang);
  return {
    t: traditionKeyFor(src.tradition),
    title,
    ref,
    workSub: distinctWorkSubtitle(title, ref),
    date: cleanWhitespace(src.source_date),
    lang,
    langCode,
    dir: dirForLang(langCode),
    en: cleanQuoteText(src.source_quote_english),
    highlights: (src.quote_highlights || []).map(cleanQuoteText).filter(Boolean),
    orig: cleanWhitespace(src.source_quote_original),
    href: link.href,
    external: link.external,
    linkKind: link.linkKind,
    verifyLabel: verifyLabelFor(link),
  };
}

function buildQuranPassage(item, english, arabicMap, warnings) {
  const surahVersesAr = arabicMap.get(item.surah) || {};
  const enParts = [];
  const arParts = [];
  const multi = item.verse_ids.length > 1;
  for (const vid of item.verse_ids) {
    const ayah = vid.split(':')[1];
    const enTxt = cleanWhitespace(english[vid]?.text || '');
    const arTxt = cleanWhitespace(surahVersesAr[ayah] || '');
    if (!enTxt) {
      warnings.push(`item (${item.id}): verse "${vid}" has no Droge English text`);
    } else {
      enParts.push(multi ? `[${ayah}] ${enTxt}` : enTxt);
    }
    if (arTxt) arParts.push(multi ? `${arTxt} ﴿${ayah}﴾` : arTxt);
  }
  return {
    quranEn: enParts.join(' '),
    quranAr: arParts.join(' '),
  };
}

/**
 * Single shared builder for both the verse-drawer entry and the explorer card.
 * @returns {{
 *   drawerEntry: import('../src/utils/quranSources/contract.js').QuranSourceDrawerEntry,
 *   explorerCard: import('../src/utils/quranSources/contract.js').QuranSourceCard
 * }}
 */
function buildItemModels(item, { quranEn, quranAr, quranHighlights, sources }) {
  const drawerEntry = {
    id: item.id,
    cat: item.category,
    motifGroup: item.motif_group,
    rank: item.rank_in_category,
    surah: item.surah,
    startAyah: item.start_ayah,
    endAyah: item.end_ayah,
    range: item.verse_range,
    title: cleanWhitespace(item.short_title),
    note: cleanWhitespace(item.connection_note),
    discussion: {
      view: cleanWhitespace(item.scholarly_discussion?.classical_harmonization),
      reply: cleanWhitespace(item.scholarly_discussion?.primary_source_evaluation),
    },
    quranEn,
    quranHighlights,
    sources,
  };

  const explorerCard = {
    ...drawerEntry,
    isPrimaryInMotif: Boolean(item.is_primary_in_motif),
    globalRank: item.global_rank,
    quranAr,
  };

  return { drawerEntry, explorerCard };
}

function main() {
  if (!fs.existsSync(DATASET_PATH)) {
    console.error(
      `✖ Dataset file not found at: ${DATASET_PATH}\n` +
        `  Set QURAN_SOURCES_PATH=/path/to/quran_sources_master.json and re-run.`
    );
    process.exit(1);
  }

  console.log(`Dataset: ${DATASET_PATH}`);
  const raw = fs.readFileSync(DATASET_PATH);
  const sha256 = crypto.createHash('sha256').update(raw).digest('hex');
  const dataset = JSON.parse(raw.toString('utf8'));

  const { errors, warnings } = validateDataset(dataset);
  if (errors.length) {
    warnings.slice(0, 20).forEach((w) => console.warn(`  [warn] ${w}`));
    console.error(`\n✖ Dataset contract failed with ${errors.length} error(s). Nothing imported.`);
    errors.slice(0, 30).forEach((e) => console.error(`  [error] ${e}`));
    process.exit(1);
  }

  const items = Array.isArray(dataset) ? dataset : dataset.items;
  const english = JSON.parse(fs.readFileSync(ENGLISH_PATH, 'utf8'));
  const arabicMap = loadArabicSurahs();

  const perSurah = new Map();
  const verseCounts = {};
  let totalCitations = 0;

  // Prepare explorer cards bucketed by category -> ('all' | traditionKey)
  const buckets = {};
  const coveredVersesByCat = {};
  const citationsByCat = {};
  for (const c of CATEGORIES) {
    buckets[c.key] = { all: [] };
    coveredVersesByCat[c.key] = new Set();
    citationsByCat[c.key] = 0;
    for (const t of TRADITIONS) {
      buckets[c.key][t.key] = [];
    }
  }

  const passageErrors = [];

  for (const item of items) {
    const sources = item.sources.map(toSource);
    totalCitations += sources.length;
    citationsByCat[item.category] += sources.length;

    const { quranEn, quranAr } = buildQuranPassage(item, english, arabicMap, warnings);
    const quranHighlights = (item.quran_highlights || []).map(cleanQuoteText).filter(Boolean);

    for (let qi = 0; qi < quranHighlights.length; qi++) {
      const qh = quranHighlights[qi];
      if (!hasHighlightMatch(quranEn, qh)) {
        passageErrors.push(
          `item (${item.id}): quran_highlights[${qi}] "${qh}" does not match built quranEn`
        );
      }
    }

    const { drawerEntry, explorerCard } = buildItemModels(item, {
      quranEn,
      quranAr,
      quranHighlights,
      sources,
    });

    buckets[item.category].all.push(explorerCard);
    const seenTrads = new Set();
    for (const s of sources) {
      if (!seenTrads.has(s.t)) {
        seenTrads.add(s.t);
        buckets[item.category][s.t].push(explorerCard);
      }
    }

    // Populate deduplicated per-surah drawer model: { entries: { [id]: entry }, verses: { [vid]: [id, ...] } }
    const surahKey = String(item.surah);
    if (!perSurah.has(surahKey)) {
      perSurah.set(surahKey, { entries: {}, verses: {} });
    }
    const surahObj = perSurah.get(surahKey);
    surahObj.entries[item.id] = drawerEntry;

    for (const vid of item.verse_ids) {
      if (!surahObj.verses[vid]) surahObj.verses[vid] = [];
      surahObj.verses[vid].push(item.id);
      verseCounts[vid] = (verseCounts[vid] || 0) + sources.length;
      coveredVersesByCat[item.category].add(vid);
    }
  }

  warnings.slice(0, 20).forEach((w) => console.warn(`  [warn] ${w}`));

  if (passageErrors.length > 0) {
    console.error(
      `\n✖ Quran passage highlight validation failed with ${passageErrors.length} error(s). Nothing imported.`
    );
    passageErrors.slice(0, 30).forEach((e) => console.error(`  [error] ${e}`));
    process.exit(1);
  }

  // Write atomically via temp dirs (<dest>.tmp-<pid>) and swap into place only after all writes succeed
  const destTmp = `${DEST_DIR}.tmp-${process.pid}`;
  const publicTmp = `${PUBLIC_DIR}.tmp-${process.pid}`;
  const categoryIndex = [];

  try {
    fs.rmSync(destTmp, { recursive: true, force: true });
    fs.rmSync(publicTmp, { recursive: true, force: true });
    fs.mkdirSync(destTmp, { recursive: true });
    fs.mkdirSync(publicTmp, { recursive: true });

    for (const [surah, surahData] of perSurah) {
      fs.writeFileSync(path.join(destTmp, `surah_${surah}.json`), JSON.stringify(surahData));
    }

    for (const c of CATEGORIES) {
      const allCards = buckets[c.key].all;
      const filters = [];

      const writeFilterPages = (filterKey, cards) => {
        const pages = Math.max(1, Math.ceil(cards.length / CARDS_PER_PAGE));
        const dir = path.join(publicTmp, c.slug, filterKey);
        fs.mkdirSync(dir, { recursive: true });
        for (let p = 0; p < pages; p++) {
          const slice = cards.slice(p * CARDS_PER_PAGE, (p + 1) * CARDS_PER_PAGE);
          fs.writeFileSync(
            path.join(dir, `${p + 1}.json`),
            JSON.stringify({ page: p + 1, pages, total: cards.length, cards: slice })
          );
        }
        return pages;
      };

      const allPages = writeFilterPages('all', allCards);
      filters.push({ key: 'all', cards: allCards.length, pages: allPages });

      for (const t of TRADITIONS) {
        const tCards = buckets[c.key][t.key];
        if (tCards.length === 0) continue;
        const tPages = writeFilterPages(t.key, tCards);
        filters.push({ key: t.key, cards: tCards.length, pages: tPages });
      }

      categoryIndex.push({
        key: c.key,
        slug: c.slug,
        cards: allCards.length,
        pages: allPages,
        citations: citationsByCat[c.key],
        verses: coveredVersesByCat[c.key].size,
        filters,
      });
    }

    const index = {
      schemaVersion: 3,
      sha256,
      importedFrom: path.basename(DATASET_PATH),
      totalItems: items.length,
      totalVerses: Object.keys(verseCounts).length,
      totalCitations,
      categories: categoryIndex,
      verseCounts,
    };
    fs.writeFileSync(path.join(destTmp, 'index.json'), JSON.stringify(index));

    fs.mkdirSync(path.dirname(DEST_DIR), { recursive: true });
    fs.mkdirSync(path.dirname(PUBLIC_DIR), { recursive: true });
    fs.rmSync(DEST_DIR, { recursive: true, force: true });
    fs.renameSync(destTmp, DEST_DIR);
    fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
    fs.renameSync(publicTmp, PUBLIC_DIR);

    console.log(
      `\n✔ Imported ${index.totalItems} curated items (${index.totalCitations} source citations across ${index.totalVerses} Quran verses)`
    );
    for (const c of categoryIndex) {
      console.log(
        `  ${c.key.padEnd(11)} ${String(c.cards).padStart(4)} items · ${String(c.citations).padStart(4)} citations · ${String(c.verses).padStart(4)} verses · ${c.pages} pages`
      );
    }
    console.log(`  SHA-256: ${sha256}`);
  } catch (err) {
    fs.rmSync(destTmp, { recursive: true, force: true });
    fs.rmSync(publicTmp, { recursive: true, force: true });
    throw err;
  }
}

main();
