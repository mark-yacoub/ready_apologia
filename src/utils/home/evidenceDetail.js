/**
 * Evidence directory breakdowns for the homepage Evidence section (EvidenceGrid.astro).
 *
 * Per-directory sub-counts shown in the card descriptions on `/`, so no description
 * carries a hand-typed number. Computed from the same counters that `/evidence/*` uses
 * (`evidenceCounters.js`) plus the Primary Sources index, and cross-checked: each card's
 * parts must add up to the directory total shown in its badge.
 */
import {
  getEvidenceTotalCount,
  getTestamentCount,
  getAnfCount,
  getAncientJudaismCount,
} from '../evidenceCounters.js';

/** Every numeric evidence-breakdown property required on `HomeStats`. */
export const EVIDENCE_DETAIL_KEYS = Object.freeze([
  'dcNtVersesCount',
  'dcOtVersesCount',
  'dcFathersQuotesCount',
  'dcJewishSourcesCount',
  'ntAuthorsBooksCount',
  'prophecyPairsCount',
  'prophecyJewishCount',
  'hsScriptureCount',
  'hsFathersCount',
  'hsJewishCount',
  'trinityScriptureCount',
  'trinityFathersCount',
  'qsParallelsCount',
  'qsCitationsCount',
  'qsVersesCount',
  'qdVersesCount',
  'seVersesCount',
]);

/**
 * @param {Array<{evidenceId: string, evidenceData: any, totalCount?: number}>} allEvidence
 * @param {{ totalItems?: number, totalCitations?: number, totalVerses?: number }} quranSourcesIndex
 * @returns {Record<string, number>}
 */
export function computeEvidenceDetailCounts(allEvidence, quranSourcesIndex) {
  const byId = Object.fromEntries(allEvidence.map((item) => [item.evidenceId, item]));
  const data = (id) => byId[id]?.evidenceData || {};
  const nt = (id) => getTestamentCount(data(id).Scripture?.['New Testament']);
  const ot = (id) => getTestamentCount(data(id).Scripture?.['Old Testament']);
  const fathers = (id) => getAnfCount(data(id)['Ante-Nicene Fathers']);
  const jewish = (id) => getAncientJudaismCount(data(id)['Ancient Judaism']);

  const detail = {
    dcNtVersesCount: nt('divinity_of_christ'),
    dcOtVersesCount: ot('divinity_of_christ'),
    dcFathersQuotesCount: fathers('divinity_of_christ'),
    dcJewishSourcesCount: jewish('divinity_of_christ'),
    ntAuthorsBooksCount: Object.keys(data('nt_authors').authorship_data || {}).filter(
      (title) => !/canon list/i.test(title)
    ).length,
    prophecyPairsCount: Array.isArray(data('prophecies').prophecies) ? data('prophecies').prophecies.length : 0,
    prophecyJewishCount: jewish('prophecies'),
    hsScriptureCount: nt('divinity_of_the_holy_spirit') + ot('divinity_of_the_holy_spirit'),
    hsFathersCount: fathers('divinity_of_the_holy_spirit'),
    hsJewishCount: jewish('divinity_of_the_holy_spirit'),
    trinityScriptureCount: nt('trinity') + ot('trinity'),
    trinityFathersCount: fathers('trinity'),
    qsParallelsCount: quranSourcesIndex?.totalItems,
    qsCitationsCount: quranSourcesIndex?.totalCitations,
    qsVersesCount: quranSourcesIndex?.totalVerses,
    qdVersesCount: byId.quranic_deficiencies?.totalCount,
    seVersesCount: byId.scientific_errors?.totalCount,
  };

  // The NT Authorship card says "across all N New Testament books": hold that claim to 27,
  // so a renamed canon-lists entry (filtered above by title) or a missing book fails the build.
  if (detail.ntAuthorsBooksCount !== 27) {
    throw new Error(`[homeStats] nt_authors covers ${detail.ntAuthorsBooksCount} books, expected 27 (check the canon-list filter)`);
  }

  // Each card's parts must add up to the total in its badge.
  const total = (id) => (byId[id] ? getEvidenceTotalCount(byId[id]) : NaN);
  const sums = [
    ['divinity_of_christ', detail.dcNtVersesCount + detail.dcOtVersesCount + detail.dcFathersQuotesCount + detail.dcJewishSourcesCount],
    ['prophecies', detail.prophecyPairsCount + detail.prophecyJewishCount],
    ['divinity_of_the_holy_spirit', detail.hsScriptureCount + detail.hsFathersCount + detail.hsJewishCount],
    ['trinity', detail.trinityScriptureCount + detail.trinityFathersCount],
    ['quran_sources', detail.qsParallelsCount],
  ];
  const mismatches = sums
    .filter(([id, sum]) => sum !== total(id))
    .map(([id, sum]) => `${id}: parts add up to ${sum}, directory total is ${total(id)}`);
  if (mismatches.length > 0) {
    throw new Error(`[homeStats] Evidence breakdowns do not match their totals:\n  - ${mismatches.join('\n  - ')}`);
  }
  return detail;
}
