/**
 * Presentation config for the Hadith Reliability article. No data lives here: anything factual
 * (questions, showcase facts, takeaways, intro) comes from the dataset; the values below are only
 * fallbacks used until the dataset provides them, plus UI copy and the archetype → angle mapping.
 */

/** Site base ('' at the root). Every internal href goes through BASE so a non-root BASE_URL works. */
export const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');
export const BASE_PATH = `${BASE}/discover/hadith-reliability`;
/** Shared cover image (public/), as a site-relative path including BASE. */
export const OG_IMAGE = `${BASE}/media/hadith_reliability/cover.jpg`;
export const CATALOG_SLUG = 'hadith-reliability';

/** Fallback reader-facing questions (dataset field: arguments[].reader_question). */
export const QUESTION_FALLBACKS = {
  prophets_words: 'How do the sources describe the wording and handing down of key reports?',
  reports_changed_over_time: 'What do earlier and later versions of the same reports show side by side?',
  clashing_authentic_reports: 'When Ṣaḥīḥ reports of one event differ, what did classical scholars conclude?',
  carriers_and_circulation: 'What do classical sources record about key narrators and the size of the corpus?',
  what_sahih_guarantees: 'How did the classical hadith masters describe their own grading standards?',
  rules_applied_to_quran: 'What did hadith critics write about the reciters who passed on the Qurʾān?',
};

/** Fallback intro (dataset field: article_meta.hub_intro). */
export const HUB_INTRO_FALLBACK =
  'Sunni Islam regards Ṣaḥīḥ al-Bukhārī and Ṣaḥīḥ Muslim as the most authentic books after the Qurʾān. ' +
  'These cases look at specific reports in those books and at what classical scholars, many of them the books’ defenders, ' +
  'wrote about them. Each case quotes its sources and links to them, so you can read the full text and judge for yourself. ' +
  'Where classical scholars proposed a reconciliation, the case presents it beside the texts. ' +
  'Start with the first case, or choose any question below.';

/**
 * Showcase archetype per case (dataset `showcase.type` wins when present; the data agent may
 * reassign a case if another visual represents its evidence more faithfully).
 */
export const ARCHETYPE_BY_CASE = {
  meccan_stay_three_timelines: 'number_fan',
  solar_eclipse_prayer_ibrahim_death: 'number_fan',
  first_and_last_quranic_revelations: 'number_fan',
  farewell_sermon_bequest_three_versions: 'versions',
  temporary_marriage_mutah_four_way_contradiction: 'versions',
  farewell_pilgrimage_modes_and_kabah_chamber: 'versions',
  empirical_proof_of_retrojection_raf_across_compilations: 'versions',
  editorial_redaction_cave_hira_and_ten_promised_paradise: 'redline',
  sahifat_ali_divergent_scrolls_and_mount_thawr: 'redline',
  green_arabia_hadith_classical_raf_doubt_and_translation_shift: 'redline',
  unfulfilled_eschatological_horizon_800ce_cutoff: 'timeline',
  second_fitnah_eschatology_ibn_al_zubayr: 'timeline',
  constantinople_and_basra_banu_qantura_traditions: 'timeline',
  early_prohibitions_burning_umayyad_coercion: 'timeline',
  pious_falsehood_and_late_isnad_emergence: 'timeline',
  hisham_ibn_urwah_ikhtilat_and_kufan_muammarun: 'timeline',
  asymmetric_companion_distribution_abu_hurayrah_ibn_abbas: 'bars',
  bukhari_corpus_metrics_and_exclusion_ratio: 'bars',
  tadlis_common_links_and_circular_exemption: 'chain',
  muslim_rejection_of_liqa_and_broken_chains: 'chain',
  abu_hurayrah_internal_sahih_transmission_errors: 'witnesses',
  hafs_ibn_sulayman_rijal_condemnation: 'witnesses',
  systemic_defects_canonical_qurra_and_tabari: 'witnesses',
  pragmatic_retention_and_solitary_reports: 'witnesses',
  quranic_epistemology_vs_ilm_al_rijal_and_zann: 'confrontation',
};

/** Second navigation axis ("browse by kind of evidence"), in display order. */
export const ANGLES = [
  { id: 'number_fan', label: 'Numbers & timelines' },
  { id: 'versions', label: 'Parallel accounts' },
  { id: 'timeline', label: 'Prophecies & dates' },
  { id: 'witnesses', label: 'What the scholars said' },
  { id: 'redline', label: 'Wording across versions' },
  { id: 'bars', label: 'Narrator & corpus counts' },
  { id: 'chain', label: 'Chain links & continuity' },
  { id: 'confrontation', label: 'Principles side by side' },
];

export const LABELS = {
  eyebrow: 'How reliable are the hadith?',
  startHere: 'Start here',
  openCase: 'Open the case',
  glanceCta: 'See all {n} cases at a glance',
  browseByKind: 'Browse by kind of evidence',
  allKinds: 'All',
  allCases: 'All cases',
  caseOf: 'Case {n} of {total}',
  coldContext: 'One of {n} cases from Bukhārī, Muslim and the classical scholars',
  aboutQuestion: 'About this question',
  sources: 'What the sources say',
  sideBySide: 'Side by side',
  scholars: 'How classical scholars responded',
  harmonization: 'The classical explanation',
  evaluation: 'Comparing with the primary text',
  deeper: 'Go deeper',
  readAnalysis: 'Read the full analysis',
  originalArabic: 'Original Arabic',
  check: 'Check the sources',
  further: 'Academic references',
  furtherNote: 'Peer-reviewed studies and reference works on the material above.',
  reference: 'Academic references',
  perspective: 'What others are saying',
  perspectiveNote: 'Blogs, videos and commentary by others, including critics of the hadith literature. These are opinions, not part of the evidence on this page.',
  copyLink: 'Copy link',
  copied: 'Link copied',
  glanceTitle: 'All {n} cases at a glance',
  glanceIntro: 'Scan every case in a minute and open whichever catches your eye.',
  sourcesUsed: 'Sources used in this article',
};

export const SOURCE_GROUPS = [
  { kind: 'sunnah', label: 'Hadith collections', note: 'Opens Sunnah.com' },
  { kind: 'quran', label: 'Qurʾān', note: 'Opens Tafsir al-Ṭabarī on this site' },
  { kind: 'classical', label: 'Classical works', note: 'Opens IslamWeb, Shamela and other libraries' },
  { kind: 'other', label: 'Other references', note: '' },
];

/** Repository hosts as shown in the hub's "Sources used" footer. */
export const HOST_LABELS = {
  'sunnah.com': 'Sunnah.com',
  'islamweb.net': 'IslamWeb',
  'bukhari.islamweb.net': 'IslamWeb',
  'shamela.ws': 'Shamela',
  'quran.com': 'Qurʾān (Tafsir al-Ṭabarī)',
  'ketabonline.com': 'Ketab Online',
  'ar.wikisource.org': 'Arabic Wikisource',
};

/** Further reading: hidden hosts, and the only hosts treated as academic/neutral references (all else is "what others are saying"). */
export const HIDDEN_HOSTS = ['reddit.com'];
export const REFERENCE_HOSTS = ['doi.org', 'jstor.org', 'routledge.com', 'sefaria.org', 'web.archive.org', 'brill.com', 'cambridge.org'];

/** Short display names for hadith collections (verify chips, badges). */
export const COLLECTION_SHORT = [
  [/^Ṣaḥīḥ al-Bukhārī(?=[\s,]|$)/, 'Bukhārī'],
  [/^Ṣaḥīḥ Muslim(?=[\s,]|$)/, 'Muslim'],
  [/^Jāmiʿ al-Tirmidhī(?=[\s,]|$)/, 'Tirmidhī'],
  [/^Sunan Abī Dāwūd(?=[\s,]|$)/, 'Abū Dāwūd'],
  [/^Sunan Ibn Mājah(?=[\s,]|$)/, 'Ibn Mājah'],
  [/^Sunan al-Nasāʾī(?=[\s,]|$)/, 'Nasāʾī'],
  [/^Muwaṭṭaʾ Mālik(?=[\s,]|$)/, 'Muwaṭṭaʾ'],
  [/^Musnad Aḥmad(?=[\s,]|$)/, 'Musnad Aḥmad'],
];

/** Canonical short names for classical scholars (badges). Order = priority when trimming. */
export const SCHOLAR_ALIASES = [
  [/^(?:Imām )?Ibn Ḥajar(?: al-ʿAsqalānī)?$/i, 'Ibn Ḥajar'],
  [/^(?:Imām )?al-Nawawī$/i, 'al-Nawawī'],
  [/^al-Dhahabī$/i, 'al-Dhahabī'],
  [/^al-Mizzī$/i, 'al-Mizzī'],
  [/^Ibn Abī Ḥātim$/i, 'Ibn Abī Ḥātim'],
  [/^Ibn Ḥibbān$/i, 'Ibn Ḥibbān'],
  [/^Ibn Taymiyyah$/i, 'Ibn Taymiyyah'],
  [/^Ibn ʿAbd al-Barr$/i, 'Ibn ʿAbd al-Barr'],
  [/^al-Khaṭīb al-Baghdādī$/i, 'al-Khaṭīb'],
  [/^Ibn al-Ṣalāḥ$/i, 'Ibn al-Ṣalāḥ'],
  [/^al-Ṭabarī$/i, 'al-Ṭabarī'],
  [/^Ibn Kathīr$/i, 'Ibn Kathīr'],
  [/^al-Ḥākim$/i, 'al-Ḥākim'],
];
