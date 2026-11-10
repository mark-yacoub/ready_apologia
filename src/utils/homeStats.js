/**
 * Build-time statistics & corpus counts for the homepage (`src/pages/index.astro`).
 *
 * Every count displayed on `/` or in its SEO description is computed here from its
 * canonical build-time source of truth without magic fallback numbers. If any count
 * is missing, NaN, non-integer, or <= 0, `validateStats()` throws a single aggregated
 * Error listing every failing key so the build fails loudly rather than shipping stale
 * or broken numbers.
 *
 * Tabari verse count note:
 *   Instead of reading and parsing the 50 MB `tafsir_tabari_english.json` file a second
 *   time just to count keys, we read the shared memoised commentary map from
 *   `loadIslamicCommentaries()` (`src/utils/islamic_commentaries_loader.js`, already
 *   loaded during the build by `/quran/*` and `/discover/muhammad-and-slavery`), count
 *   the verses that have a non-empty `tabari` entry, and verify that coverage equals the
 *   canonical ayah total in `src/data/quran/arabic/meta.json` (6,236 verses across 114 sūras).
 */

import fs from 'node:fs';
import path from 'node:path';
import { query } from '../db.js';
import { loadIslamicCommentaries } from './islamic_commentaries_loader.js';
import { loadAllCompanions, loadLostVersesPageData } from './nonUthmanicLoader.js';
import { getAllQiraatCategoriesAndEffects } from './qiraatLoader.js';
import { loadHadithModel } from './hadithLoader.js';
import { TRANSLATION_ISSUE_TYPES, getTranslationAuditPath } from './hadith_config.js';
import { loadAllEvidenceData } from './evidenceLoader.js';
import { getEvidenceTotalCount } from './evidenceCounters.js';
import { EVIDENCE_DETAIL_KEYS, computeEvidenceDetailCounts } from './home/evidenceDetail.js';
import { BIBLE_ANSWERS_KEYS, computeBibleAnswersCounts } from './home/bibleAnswers.js';
import { loadHadithReliability } from './hadithReliability/loader.js';
import { SECTIONS as qpSections } from './quranPreservation/config.js';
import { loadConvenientRevelations } from './convenientRevelations/model.js';
import { SECTIONS as mmSections } from './meccaToMedina/config.js';
import {
  HADITH_SECTIONS as msHadithSections,
  QURAN_SECTIONS as msQuranSections,
  ANSWER_ORDER as msAnswerOrder,
} from './muhammadSlavery/config.js';
import * as ORV_CONTENT from './originsOfRevelation/content.js';
import { loadOriginsOfRevelation } from './originsOfRevelation/model.js';

/**
 * @typedef {Object} HomeAuditTab
 * @property {string} key
 * @property {string} label
 * @property {number} count
 * @property {string} path
 */

/**
 * @typedef {Object} HomeStats
 * @property {number} surahsCount
 * @property {number} ntMssCount
 * @property {number} otMssCount
 * @property {number} bibleMssCount
 * @property {number} ntScansCount
 * @property {number} otScansCount
 * @property {number} bibleScansCount
 * @property {number} quranMssCount
 * @property {number} quranScansCount
 * @property {number} quranMsVersesCount
 * @property {number} apologeticsCount
 * @property {number} patristicWorksCount
 * @property {number} patristicFathersCount
 * @property {number} patristicEntriesCount
 * @property {number} scholarlyDefensesCount
 * @property {number} pairingsCount
 * @property {number} videosCount
 * @property {number} tabariCount
 * @property {number} nickelCount
 * @property {number} companionsCount
 * @property {number} ibnMasudCount
 * @property {number} ubayyCount
 * @property {number} totalCodexVariantsCount
 * @property {number} lostPassagesCount
 * @property {number} featuredCodexCount
 * @property {number} lostHubTotalCount
 * @property {number} qiraatEffectsTotal
 * @property {number} hadithCount
 * @property {number} hadithAnnotationsCount
 * @property {number} hadithCategoriesCount
 * @property {HomeAuditTab[]} auditTabs
 * @property {number} auditTotalCount
 * @property {number} evidenceDirectoriesCount
 * @property {number} divinityChristCount
 * @property {number} ntAuthorsCount
 * @property {number} propheciesCount
 * @property {number} holySpiritCount
 * @property {number} trinityCount
 * @property {number} discoverArticlesCount
 * @property {number} hrvCasesCount
 * @property {number} hrvSectionsCount
 * @property {number} qpSectionsCount
 * @property {number} qpItemsCount
 * @property {number} crvChaptersCount
 * @property {number} crvItemsCount
 * @property {number} mmSectionsCount
 * @property {number} mmItemsCount
 * @property {number} msHadithItemsCount
 * @property {number} msQuranPassagesCount
 * @property {number} msAnswersCount
 * @property {number} orvAccountsCount
 * @property {number} trustBibleCount
 * @property {number} extrabiblicalCount
 * @property {number} divinityTimelineCount
 * @property {number} dcNtVersesCount        Divinity of Christ: New Testament verses
 * @property {number} dcOtVersesCount        Divinity of Christ: Old Testament verses
 * @property {number} dcFathersQuotesCount   Divinity of Christ: Ante-Nicene Father quotations
 * @property {number} dcJewishSourcesCount   Divinity of Christ: ancient Jewish sources
 * @property {number} ntAuthorsBooksCount    NT Authorship: books covered (canon lists excluded)
 * @property {number} prophecyPairsCount     Prophecies: OT prophecy / NT fulfilment pairs
 * @property {number} prophecyJewishCount    Prophecies: ancient Jewish messianic texts
 * @property {number} hsScriptureCount       Holy Spirit: OT + NT passages
 * @property {number} hsFathersCount         Holy Spirit: Ante-Nicene Father quotations
 * @property {number} hsJewishCount          Holy Spirit: ancient Jewish sources
 * @property {number} trinityScriptureCount  Trinity: OT + NT passages
 * @property {number} trinityFathersCount    Trinity: Ante-Nicene Father quotations
 * @property {number} qsParallelsCount       Primary Sources of the Qurʾān: curated parallels
 * @property {number} qsCitationsCount       Primary Sources of the Qurʾān: primary-source citations
 * @property {number} qsVersesCount          Primary Sources of the Qurʾān: verses with a parallel
 * @property {number} qdVersesCount          /evidence/quranic_deficiencies: verses discussed
 * @property {number} seVersesCount          /evidence/scientific_errors: verses discussed
 * @property {number} bibleAnswersCount         Answered alleged Bible contradictions (rows in `contradictions`).
 * @property {number} bibleAnswersVersesCount   Distinct verses (verse1 ∪ verse2) carrying a `/contradictions` tab.
 * @property {number} bibleVideosCount          Distinct videos tagged to at least one Bible verse (or the Gospels overview).
 * @property {number} bibleVideoVersesCount     Distinct Bible verse ids with a `/videos` tab.
 * @property {number} quranVideosCount          Distinct videos tagged to at least one Qurʾān verse.
 */

/** Every numeric count property required on `HomeStats`. */
export const STAT_KEYS = Object.freeze([
  'surahsCount',
  'ntMssCount',
  'otMssCount',
  'bibleMssCount',
  'ntScansCount',
  'otScansCount',
  'bibleScansCount',
  'quranMssCount',
  'quranScansCount',
  'quranMsVersesCount',
  'apologeticsCount',
  'patristicWorksCount',
  'patristicFathersCount',
  'patristicEntriesCount',
  'scholarlyDefensesCount',
  'pairingsCount',
  'videosCount',
  'tabariCount',
  'nickelCount',
  'companionsCount',
  'ibnMasudCount',
  'ubayyCount',
  'totalCodexVariantsCount',
  'lostPassagesCount',
  'featuredCodexCount',
  'lostHubTotalCount',
  'qiraatEffectsTotal',
  'hadithCount',
  'hadithAnnotationsCount',
  'hadithCategoriesCount',
  'auditTotalCount',
  'evidenceDirectoriesCount',
  'divinityChristCount',
  'ntAuthorsCount',
  'propheciesCount',
  'holySpiritCount',
  'trinityCount',
  'discoverArticlesCount',
  'hrvCasesCount',
  'hrvSectionsCount',
  'qpSectionsCount',
  'qpItemsCount',
  'crvChaptersCount',
  'crvItemsCount',
  'mmSectionsCount',
  'mmItemsCount',
  'msHadithItemsCount',
  'msQuranPassagesCount',
  'msAnswersCount',
  'orvAccountsCount',
  'trustBibleCount',
  'extrabiblicalCount',
  'divinityTimelineCount',
]);


const isPositiveInt = (v) => typeof v === 'number' && Number.isInteger(v) && v > 0;

/**
 * Pure validator that checks every count in `stats` and throws a single aggregated
 * Error listing all invalid, missing, NaN, or zero counts.
 *
 * @param {Record<string, any>} stats
 * @returns {HomeStats}
 */
export function validateStats(stats) {
  if (!stats || typeof stats !== 'object') {
    throw new Error('[homeStats] Expected a stats object');
  }

  const problems = [];
  for (const key of [...STAT_KEYS, ...EVIDENCE_DETAIL_KEYS, ...BIBLE_ANSWERS_KEYS]) {
    const val = stats[key];
    if (!isPositiveInt(val)) {
      problems.push(`${key}: expected positive integer, got ${String(val)}`);
    }
  }

  if (!Array.isArray(stats.auditTabs) || stats.auditTabs.length === 0) {
    problems.push(`auditTabs: expected non-empty array, got ${ JSON.stringify(stats.auditTabs) }`);
  } else {
    stats.auditTabs.forEach((tab, idx) => {
      if (!tab || typeof tab.key !== 'string' || !tab.key) {
        problems.push(`auditTabs[${idx}].key: expected non-empty string`);
      }
      if (!tab || typeof tab.label !== 'string' || !tab.label) {
        problems.push(`auditTabs[${idx}].label: expected non-empty string`);
      }
      if (!tab || typeof tab.path !== 'string' || !tab.path.startsWith('/')) {
        problems.push(`auditTabs[${idx}].path: expected root-relative path, got ${String(tab?.path)}`);
      }
      if (!isPositiveInt(tab?.count)) {
        problems.push(`auditTabs[${idx}].count (${tab?.key ?? idx}): expected positive integer, got ${String(tab?.count)}`);
      }
    });
  }

  if (problems.length > 0) {
    throw new Error(
      `[homeStats] Invalid or zero build-time counts (${problems.length}):\n  - ${problems.join('\n  - ')}`
    );
  }

  return /** @type {HomeStats} */ (stats);
}

const readJson = (relPath) =>
  // Resolve against the project root, not import.meta.url: Astro bundles this
  // module into .astro/.prerender/chunks/, where '../data' does not exist.
  JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/utils', relPath), 'utf8'));

let cachedStats = null;

/**
 * Computes, validates, and memoises all build-time counts required by the homepage.
 *
 * @returns {Promise<HomeStats>}
 */
export async function loadHomeStats() {
  if (cachedStats) return cachedStats;

  const discoverCatalog = readJson('../data/discoverCatalog.json');
  const quranMeta = readJson('../data/quran/arabic/meta.json');
  const nickelAnnotations = readJson('../data/quran/commentary/nickel_annotations.json');
  const divinityTimeline = readJson('../data/divinityTimeline.json');
  const extrabiblicalData = readJson('../data/extrabiblical-evidence-for-jesus.json');
  const trustBibleData = readJson('../data/trustworthiness-of-the-bible.json');

  // 1. Bible & SQLite corpus counts
  const scalar = (sql) => Number(query(sql)[0]?.c);
  const ntMssCount = scalar('SELECT COUNT(*) AS c FROM manuscripts_meta');
  const otMssCount = scalar('SELECT COUNT(*) AS c FROM manuscripts_meta_ot');
  const bibleMssCount = ntMssCount + otMssCount;
  const ntScansCount = scalar('SELECT COUNT(DISTINCT image_name) AS c FROM manuscript_per_verse');
  const otScansCount = scalar('SELECT COUNT(DISTINCT image_name) AS c FROM manuscript_per_verse_ot');
  const bibleScansCount = ntScansCount + otScansCount;

  const quranMssCount = scalar('SELECT COUNT(*) AS c FROM manuscripts_meta_quran');
  const quranScansCount = scalar('SELECT COUNT(DISTINCT image_name) AS c FROM manuscript_per_verse_quran');
  const quranMsVersesCount = scalar('SELECT COUNT(DISTINCT verse_id) AS c FROM manuscript_per_verse_quran');

  const apologeticsCount = scalar('SELECT COUNT(*) AS c FROM apologetics');
  const patristicWorksCount = scalar('SELECT COUNT(*) AS c FROM patristics_works');
  const patristicFathersCount = scalar('SELECT COUNT(*) AS c FROM patristics_fathers');
  const patristicEntriesCount = scalar(
    "SELECT COUNT(*) AS c FROM apologetics WHERE src IN (SELECT id FROM patristics_works) OR src LIKE 'na_%'"
  );
  const scholarlyDefensesCount = apologeticsCount - patristicEntriesCount;
  const pairingsCount = scalar('SELECT COUNT(*) AS c FROM contradictions');
  const videosCount = scalar('SELECT COUNT(*) AS c FROM shorts_metadata');

  // 2. Qur'an sūras, Tabari coverage, Christian footnotes, Companion codices, Qirāʾāt & Primary Sources
  const surahsCount = Array.isArray(quranMeta) ? quranMeta.length : 0;
  const metaTotalVerses = Array.isArray(quranMeta)
    ? quranMeta.reduce((sum, s) => sum + s.total_verses, 0)
    : 0;

  const commentaries = loadIslamicCommentaries();
  let tabariVerses = 0;
  for (const entries of Object.values(commentaries)) {
    if (Array.isArray(entries) && entries.some((c) => c.id === 'tabari' && (c.commentary || c.commentary_arabic))) {
      tabariVerses++;
    }
  }
  const tabariCount = tabariVerses === metaTotalVerses ? tabariVerses : 0;

  const nickelCount = Array.isArray(nickelAnnotations) ? nickelAnnotations.length : 0;

  const [companions, lostPageData, qiraatFilters] = await Promise.all([
    loadAllCompanions(),
    loadLostVersesPageData(),
    getAllQiraatCategoriesAndEffects(),
  ]);

  const companionsCount = companions.length;
  const ibnMasudCount = companions.find((c) => c.slug === 'abdullah-bin-masud')?.count;
  const ubayyCount = companions.find((c) => c.slug === 'ubayy-bin-kab')?.count;
  const totalCodexVariantsCount = lostPageData.totalVariantsCount;
  const lostPassagesCount = lostPageData.lostPassages.length;
  const featuredCodexCount = lostPageData.featuredVerseVariants.length;
  const lostHubTotalCount = lostPassagesCount + featuredCodexCount;
  const qiraatEffectsTotal = qiraatFilters
    .filter((f) => f.type === 'effect')
    .reduce((sum, f) => sum + f.count, 0);


  // 3. Sahih Hadith & Translation Audit counts
  const hadithModel = loadHadithModel();
  const hadithCount = hadithModel.stats?.hadiths;
  const hadithAnnotationsCount = hadithModel.stats?.annotations;
  const hadithCategoriesCount = hadithModel.categories?.length;
  const auditTabs = Object.entries(TRANSLATION_ISSUE_TYPES).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    count: hadithModel.translationIssues?.[key]?.length,
    path: getTranslationAuditPath(key, ''),
  }));
  const auditTotalCount = auditTabs.reduce((sum, t) => sum + t.count, 0);

  // 4. Theological Evidence directory counts
  const allEvidence = loadAllEvidenceData();
  const evidenceDirectoriesCount = allEvidence.length;
  const evidenceCountMap = Object.fromEntries(
    allEvidence.map((item) => [item.evidenceId, getEvidenceTotalCount(item)])
  );
  const divinityChristCount = evidenceCountMap.divinity_of_christ;
  const ntAuthorsCount = evidenceCountMap.nt_authors;
  const propheciesCount = evidenceCountMap.prophecies;
  const holySpiritCount = evidenceCountMap.divinity_of_the_holy_spirit;
  const trinityCount = evidenceCountMap.trinity;
  const evidenceDetail = computeEvidenceDetailCounts(allEvidence, readJson('../data/quran/sources/index.json'));

  // 5. Discover deep-dive counts
  const discoverArticlesCount = discoverCatalog.length;
  const hrvModel = loadHadithReliability();
  const hrvCasesCount = hrvModel.cases?.length;
  const hrvSectionsCount = hrvModel.questions?.length;

  const qpSectionsCount = qpSections?.length;
  const qpItemsCount = (qpSections || []).reduce((sum, s) => sum + (s.items?.length || 0), 0);

  const crvModel = loadConvenientRevelations();
  const crvChaptersCount = crvModel.parts?.length;
  const crvItemsCount = crvModel.items?.length;

  const mmSectionsCount = mmSections?.length;
  const mmItemsCount = (mmSections || []).reduce((sum, s) => sum + (s.items?.length || 0), 0);

  const msHadithItemsCount = (msHadithSections || []).reduce((sum, s) => sum + (s.items?.length || 0), 0);
  const msQuranPassagesCount = (msQuranSections || []).reduce((sum, s) => sum + (s.items?.length || 0), 0);
  const msAnswersCount = msAnswerOrder?.length;

  const orvModel = loadOriginsOfRevelation(ORV_CONTENT);
  const orvAccountsCount = orvModel.sections?.length;

  const trustBibleCount = trustBibleData.totalEvidences;
  const extrabiblicalCount = extrabiblicalData.totalEvidences;
  const divinityTimelineCount = Array.isArray(divinityTimeline) ? divinityTimeline.length : undefined;

  const rawStats = {
    ...evidenceDetail,
    ...computeBibleAnswersCounts(),
    surahsCount,
    ntMssCount,
    otMssCount,
    bibleMssCount,
    ntScansCount,
    otScansCount,
    bibleScansCount,
    quranMssCount,
    quranScansCount,
    quranMsVersesCount,
    apologeticsCount,
    patristicWorksCount,
    patristicFathersCount,
    patristicEntriesCount,
    scholarlyDefensesCount,
    pairingsCount,
    videosCount,
    tabariCount,
    nickelCount,
    companionsCount,
    ibnMasudCount,
    ubayyCount,
    totalCodexVariantsCount,
    lostPassagesCount,
    featuredCodexCount,
    lostHubTotalCount,
    qiraatEffectsTotal,
    hadithCount,
    hadithAnnotationsCount,
    hadithCategoriesCount,
    auditTabs: Object.freeze(auditTabs.map((t) => Object.freeze({ ...t }))),
    auditTotalCount,
    evidenceDirectoriesCount,
    divinityChristCount,
    ntAuthorsCount,
    propheciesCount,
    holySpiritCount,
    trinityCount,
    discoverArticlesCount,
    hrvCasesCount,
    hrvSectionsCount,
    qpSectionsCount,
    qpItemsCount,
    crvChaptersCount,
    crvItemsCount,
    mmSectionsCount,
    mmItemsCount,
    msHadithItemsCount,
    msQuranPassagesCount,
    msAnswersCount,
    orvAccountsCount,
    trustBibleCount,
    extrabiblicalCount,
    divinityTimelineCount,
  };

  cachedStats = Object.freeze(validateStats(rawStats));
  return cachedStats;
}
