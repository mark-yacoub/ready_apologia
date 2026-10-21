/**
 * UI configuration for the Sahih Hadith Explorer (/hadith).
 *
 * Kept separate from the data files (src/data/hadith/*) which are owned by the data pipeline.
 * Category / subcategory labels, short labels and slugs are keyed by the EXACT dataset names; an
 * unmapped or unlabelled name fails the build (see resolveTaxonomy in hadithLoader.js).
 */

import { HADITH_RELIABILITY_PATH } from './routes.js';

export const HADITH_BASE_PATH = '/hadith';

/** Route segments that cannot be used as category slugs (they are static routes under /hadith). */
export const RESERVED_SLUGS = new Set(['bukhari', 'muslim', 'data', 'translation-audit']);

/**
 * Keyed by the EXACT dataset names (the data pipeline owns those). Ordered by the dataset's category rank.
 *   label  what readers see: a neutral topic name, the way a hadith index would title a chapter,
 *          written for a curious Muslim reader (never a verdict). Falls back to the dataset name.
 *   short  where horizontal space is tight (pills, sidebar).
 *   slug   URL segment. /hadith was renamed before first push (Oct 2026), so no redirects exist;
 *          after it ships, a slug change needs a redirect.
 */
export const HADITH_TAXONOMY = {
  "Muhammad's Character, Life & Conduct": {
    label: "The Prophet's Life & Conduct",
    slug: 'prophet',
    short: "The Prophet's life",
    subcategories: {
      'Sexual Ethics, Child Marriage & Bedroom Conduct': { label: "Marriage, Aisha's Age & Married Life", slug: 'marriage-and-aishas-age', short: "Marriage & Aisha's age" },
      'Self-Serving Revelations & Prophetic Privileges': { label: "Revelations Concerning the Prophet's Household", slug: 'prophetic-privileges', short: 'Revelations on his household' },
      'Occult, Bewitchment & Demonic Revelation Symptoms': { label: 'Sorcery Against the Prophet & the Onset of Revelation', slug: 'sorcery-and-revelation', short: 'Sorcery & revelation' },
      'Deceit, Oath-Breaking & Political Assassinations': { label: 'Oaths, Deception in War & Targeted Killings', slug: 'oaths-and-killings', short: 'Oaths, deception & killings' },
    },
  },
  'Violence, Cruelty & Intolerance': {
    label: 'War, Punishment & Non-Muslims',
    slug: 'war-and-punishment',
    short: 'War & punishment',
    subcategories: {
      'Apostasy, Stoning & Unequal Justice': { label: 'Apostasy, Stoning & Legal Penalties', slug: 'apostasy-and-stoning', short: 'Apostasy & stoning' },
      'Offensive Jihad & Religious Intolerance': { label: 'Jihad & Relations With Non-Muslims', slug: 'jihad', short: 'Jihad & non-Muslims' },
      'Torture, Massacres & Extrajudicial Cruelty': { label: 'Severe Punishments & the Fate of Prisoners', slug: 'punishments-and-prisoners', short: 'Punishments & prisoners' },
    },
  },
  'Women, Slavery & Human Exploitation': {
    label: 'Women & Slavery',
    slug: 'women-and-slavery',
    short: 'Women & slavery',
    subcategories: {
      'Misogyny & Subjugation of Women': { label: 'The Status of Women', slug: 'status-of-women', short: 'Status of women' },
      'Chattel Slavery & Captive Concubinage': { label: 'Slavery & Concubinage', slug: 'slavery-and-concubinage', short: 'Slavery & concubinage' },
    },
  },
  'Absurdities, Superstitions & Scientific Errors': {
    label: 'Science, Medicine & the Unseen',
    slug: 'science-and-the-unseen',
    short: 'Science & the unseen',
    subcategories: {
      'Cosmological, Anatomical & Historical Errors': { label: 'The Cosmos, the Body & History', slug: 'cosmos-body-history', short: 'Cosmos, body & history' },
      'Medical Blunders & Unhygienic Remedies': { label: 'Prophetic Medicine & Remedies', slug: 'prophetic-medicine', short: 'Prophetic medicine' },
      'Absurd Folklore, Bizarre Myths & Demonology': { label: 'Jinn, Devils & Wonders', slug: 'jinn-and-wonders', short: 'Jinn & wonders' },
    },
  },
  'Quranic Preservation & Textual Reliability': {
    label: 'Preserving the Quran & the Hadith',
    slug: 'preservation',
    short: 'Preservation',
    subcategories: {
      'Quranic Loss, Forgotten Verses & Uthmanic Burning': { label: "Verses Not in Today's Mushaf & Uthman's Compilation", slug: 'missing-verses', short: 'Missing verses & Uthman' },
      'Internal Hadith Contradictions & Fabricated Prophecies': { label: 'Differing Reports & Prophecies', slug: 'differing-reports', short: 'Differing reports' },
    },
  },
  'Theological Defects & Anti-Biblical Doctrines': {
    label: 'God, Paradise & Predestination',
    slug: 'god-and-afterlife',
    short: 'God & the afterlife',
    subcategories: {
      'Crude Anthropomorphism, Carnal Paradise & Pagan Vestiges': { label: "God's Attributes, Paradise & Pre-Islamic Rites", slug: 'attributes-and-paradise', short: 'Attributes & paradise' },
      'Capricious Deity, Fatalism & Moral Immunity': { label: 'Predestination, Divine Will & Forgiveness', slug: 'predestination', short: 'Predestination' },
    },
  },
  'Christian Doctrines Muslims Attack That Are Conceded in Hadith': {
    label: 'Hadiths That Echo Christian Teaching',
    slug: 'christian-parallels',
    short: 'Echoes of Christian teaching',
    subcategories: {
      'Divine Immanence, Entering Creation & Visible Form (Incarnation Precedents)': { label: 'God Appearing in Form & Drawing Near', slug: 'god-in-form', short: 'God appearing in form' },
      'Uncreated Divine Word, Original Sin & Sacramental Relics (Trinitarian & Soteriological Precedents)': { label: "The Uncreated Word, Adam's Sin & Blessed Relics", slug: 'word-and-adams-sin', short: "Word, Adam's sin & relics" },
      'Vicarious Ransom, Sin-Transfer & Intercessory Salvation (Atonement Precedents)': { label: 'Ransom, Bearing Sins & Intercession', slug: 'ransom-and-intercession', short: 'Ransom & intercession' },
    },
  },
};

/** Sidebar entries (kept here so the ScriptureNav island doesn't import the dataset). */
export function getHadithNavSections(base = '') {
  return Object.entries(HADITH_TAXONOMY).map(([name, cfg]) => ({
    name: cfg.label || name,
    short: cfg.short,
    slug: cfg.slug,
    path: `${base}${HADITH_BASE_PATH}/${cfg.slug}`,
  }));
}

export const COLLECTION_NAMES = {
  bukhari: 'Sahih Bukhari',
  muslim: 'Sahih Muslim',
};

/**
 * Corrections for corpus records whose `arabicnumber` does not match Sunnah.com.
 * Detected by the loader's duplicate-reference check; verify each entry on Sunnah.com before adding.
 *   muslim:3499 — corpus says 1365.05 (same as muslim:3500); Sunnah.com files this Abu Musa
 *                 narration ("two rewards" for freeing and marrying a slave woman) as 154b.
 *   muslim:7354–7356 — corpus says 169.02–.04, but 169b/169c on Sunnah.com are a different hadith.
 *                 These three identical records are the combined entry "2930a, 2931, 169d" (chain
 *                 checked); the loader shows them once (see groupCombinedEntries).
 * From the full sweep of every Muslim reference against Sunnah.com (title + chain + English):
 *   muslim:3695–3696 — corpus says 1475.01/.02 (no such pages); Sunnah.com "1479e, 1475b" (Ibn ʿAbbas
 *                 asking ʿUmar about the two wives; Maʿmar → al-Zuhri chain).
 *   muslim:5670 — corpus says 2170.03; that number has no page of its own: it is part of "2170b, c".
 *   muslim:6625 — corpus says 2602.01; Sunnah.com 2602a is the al-Aʿmash chain, this Ibn Jurayj →
 *                 Abu al-Zubayr chain is "2602c, d".
 */
export const SUNNAH_NUMBER_OVERRIDES = {
  'muslim:3499': '154b',
  'muslim:3695': '1479e',
  'muslim:3696': '1479e',
  'muslim:5670': '2170b',
  'muslim:6625': '2602c',
  'muslim:7354': '2930a',
  'muslim:7355': '2930a',
  'muslim:7356': '2930a',
};

/**
 * translation_issue.type → UI copy. Order = audit tab order.
 * Each type is its own page at /hadith/translation-audit/<slug> (see getTranslationAuditPath);
 * there is no index page at /hadith/translation-audit.
 */
export const TRANSLATION_ISSUE_TYPES = {
  softened: {
    slug: 'softened', label: 'Softened', badge: 'Translation softened',
    blurb: 'The English tones down what the Arabic plainly says.',
    title: 'Softened Hadith Translations',
  },
  omission: {
    slug: 'omitted', label: 'Omitted', badge: 'Omitted in English',
    blurb: 'Words present in the Arabic were left out of the English.',
    title: 'Words Omitted from Hadith Translations',
  },
  euphemistic: {
    slug: 'euphemism', label: 'Euphemism', badge: 'Euphemism in English',
    blurb: 'An idiom was replaced with a vaguer, more polite phrase.',
    title: 'Euphemisms in Hadith Translations',
  },
};

export const TRANSLATION_AUDIT_PATH = `${HADITH_BASE_PATH}/translation-audit`;

/** Page URL for one translation-issue type ("softened" → /hadith/translation-audit/softened, "omission" → …/omitted). */
export function getTranslationAuditPath(type, base = '') {
  const cfg = TRANSLATION_ISSUE_TYPES[type];
  if (!cfg) throw new Error(`Unknown translation issue type: ${type}`);
  return `${base}${TRANSLATION_AUDIT_PATH}/${cfg.slug}`;
}

export const HADITH_LABELS = {
  readFull: 'Read full hadith',
  whyWording: 'Why the wording matters',
  showExcerpt: 'Show excerpt only',
  muslimResponse: 'Muslim response',
  defenseHeading: 'Anticipated Muslim defense & rebuttal',
  parallels: 'Parallels',
  tier4Drawer: 'Corroborating parallel narrations',
  outline: 'Outline',
  closeOutline: 'Close outline',
  compare: 'compare',
  alsoFiled: 'Also filed under',
  filedUnder: 'Filed under',
  whyItMatters: 'Why it matters',
  share: 'Share',
  linkCopied: 'Link copied',
  copyFailed: "Couldn't copy the link",
  openSunnah: 'Open on Sunnah.com',
  open: 'Open',
  loadError: "Couldn't load this text.",
  retry: 'Retry',
  omittedInline: 'Omitted in English:',
  fullNarration: 'Full narration',
  tier4Note: 'Parallel chains of the same events, kept for corroboration.',
  backToTop: 'Back to top',
  seeAll: (n) => `All ${n} narrations`,
};

/**
 * Hub intro. Same voice as the Hadith Reliability article: objective, short, an invitation to look.
 * The first paragraph is set in the serif face; the aside is a quiet pointer, not a claim.
 */
export const HADITH_INTRO = [
  'Sunni Muslims regard Sahih al-Bukhari and Sahih Muslim as the most authentic books after the Quran: the primary record of what Muhammad said and did.',
  'This section takes them on their own terms. Each entry shows the exact passage, the original Arabic, and a link to Sunnah.com to read it in full.',
];

/** A separate question the explorer does not try to answer: points to /discover/hadith-reliability. */
export const HADITH_INTRO_ASIDE = {
  lead: 'A separate question is how faithfully these reports were passed down before they were compiled, about two centuries after the Prophet.',
  linkLabel: 'How reliable are the hadith?',
  path: HADITH_RELIABILITY_PATH,
};

export const HADITH_SEO = {
  hub: {
    title: 'Sahih Hadith Explorer | Bukhari & Muslim by Topic',
    description: '820+ hadiths from Sahih al-Bukhari and Sahih Muslim, organized by topic, with the original Arabic, full narrations, translation notes and a Sunnah.com link for each.',
    keywords: 'sahih bukhari, sahih muslim, hadith by topic, aisha age hadith, hadith arabic english, hadith translation',
  },
  category: (category) => ({
    title: `${category} | Sahih Hadith Evidence`,
    keywords: `${category.toLowerCase()}, sahih bukhari, sahih muslim, hadith evidence, christian apologetics`,
  }),
  subcategory: (subcategory, category) => ({
    title: `${subcategory} | ${category} – Sahih Hadith`,
    keywords: `${subcategory.toLowerCase()}, sahih hadith, bukhari, muslim, islam apologetics`,
  }),
  permalink: (displayRef, note) => ({
    title: `${displayRef} – ${truncate(stripMarkdown(note), 70)}`,
    keywords: `${displayRef.toLowerCase()}, ${displayRef.toLowerCase()} explained, ${displayRef.toLowerCase()} arabic, hadith meaning`,
  }),
  /** Translation-audit pages: one per issue type (there is no audit index page). */
  auditType: (type, count) => {
    const cfg = TRANSLATION_ISSUE_TYPES[type];
    return {
      title: `${cfg.title} | Khan & Siddiqui Audit`,
      description: `${count} hadiths from Sahih al-Bukhari (Muhsin Khan) and Sahih Muslim (Siddiqui) where ${cfg.blurb.charAt(0).toLowerCase()}${cfg.blurb.slice(1)} Each passage is compared word for word with the Arabic.`,
      keywords: `${cfg.title.toLowerCase()}, sanitized hadith, hadith translation errors, muhsin khan translation, siddiqui translation, arabic hadith literal translation`,
    };
  },
};

export function stripMarkdown(text = '') {
  return String(text)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*+([^*]+)\*+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(text = '', max = 155) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, '')}…`;
}
