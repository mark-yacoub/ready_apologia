/**
 * UI configuration for the Sahih Hadith Explorer (/hadith).
 *
 * Kept separate from the data files (src/data/hadith/*) which are owned by the data pipeline.
 * Category / subcategory display slugs are keyed by the EXACT dataset names; unknown names fall
 * back to an auto-slug and emit a build warning (see hadithLoader.js).
 */

export const HADITH_BASE_PATH = '/hadith';

/** Route segments that cannot be used as category slugs (they are static routes under /hadith). */
export const RESERVED_SLUGS = new Set(['bukhari', 'muslim', 'data', 'translation-audit']);

/**
 * Ordered by the dataset's category rank. `short` is used where horizontal space is tight (pills, sidebar).
 */
export const HADITH_TAXONOMY = {
  "Muhammad's Character, Life & Conduct": {
    slug: 'muhammad',
    short: "Muhammad's Character",
    subcategories: {
      'Sexual Ethics, Child Marriage & Bedroom Conduct': { slug: 'sexual-ethics', short: 'Sexual ethics & child marriage' },
      'Self-Serving Revelations & Prophetic Privileges': { slug: 'self-serving-revelations', short: 'Self-serving revelations' },
      'Occult, Bewitchment & Demonic Revelation Symptoms': { slug: 'occult-and-bewitchment', short: 'Occult & bewitchment' },
      'Deceit, Oath-Breaking & Political Assassinations': { slug: 'deceit-and-assassinations', short: 'Deceit & assassinations' },
    },
  },
  'Violence, Cruelty & Intolerance': {
    slug: 'violence',
    short: 'Violence & Intolerance',
    subcategories: {
      'Apostasy, Stoning & Unequal Justice': { slug: 'apostasy-and-stoning', short: 'Apostasy & stoning' },
      'Offensive Jihad & Religious Intolerance': { slug: 'offensive-jihad', short: 'Offensive jihad' },
      'Torture, Massacres & Extrajudicial Cruelty': { slug: 'torture-and-massacres', short: 'Torture & massacres' },
    },
  },
  'Women, Slavery & Human Exploitation': {
    slug: 'women-and-slavery',
    short: 'Women & Slavery',
    subcategories: {
      'Misogyny & Subjugation of Women': { slug: 'misogyny', short: 'Misogyny' },
      'Chattel Slavery & Captive Concubinage': { slug: 'slavery-and-concubinage', short: 'Slavery & concubinage' },
    },
  },
  'Absurdities, Superstitions & Scientific Errors': {
    slug: 'absurdities',
    short: 'Absurdities & Science',
    subcategories: {
      'Cosmological, Anatomical & Historical Errors': { slug: 'cosmological-errors', short: 'Scientific & historical errors' },
      'Medical Blunders & Unhygienic Remedies': { slug: 'medical-blunders', short: 'Medical blunders' },
      'Absurd Folklore, Bizarre Myths & Demonology': { slug: 'folklore-and-myths', short: 'Folklore & myths' },
    },
  },
  'Quranic Preservation & Textual Reliability': {
    slug: 'quran-preservation',
    short: 'Quran Preservation',
    subcategories: {
      'Quranic Loss, Forgotten Verses & Uthmanic Burning': { slug: 'lost-verses', short: 'Lost verses & burning' },
      'Internal Hadith Contradictions & Fabricated Prophecies': { slug: 'contradictions-and-prophecies', short: 'Contradictions & prophecies' },
    },
  },
  'Theological Defects & Anti-Biblical Doctrines': {
    slug: 'theology',
    short: 'Theology',
    subcategories: {
      'Crude Anthropomorphism, Carnal Paradise & Pagan Vestiges': { slug: 'anthropomorphism-and-paradise', short: 'Anthropomorphism & paradise' },
      'Capricious Deity, Fatalism & Moral Immunity': { slug: 'capricious-deity', short: 'Capricious deity & fatalism' },
    },
  },
  'Christian Doctrines Muslims Attack That Are Conceded in Hadith': {
    slug: 'christian-doctrines-conceded',
    short: 'Christian Doctrines Conceded',
    subcategories: {
      'Divine Immanence, Entering Creation & Visible Form (Incarnation Precedents)': { slug: 'incarnation', short: 'Incarnation precedents' },
      'Uncreated Divine Word, Original Sin & Sacramental Relics (Trinitarian & Soteriological Precedents)': { slug: 'divine-word-and-original-sin', short: 'Divine Word & original sin' },
      'Vicarious Ransom, Sin-Transfer & Intercessory Salvation (Atonement Precedents)': { slug: 'atonement', short: 'Atonement precedents' },
    },
  },
};

/** Sidebar entries (kept here so the ScriptureNav island doesn't import the dataset). */
export function getHadithNavSections(base = '') {
  return Object.entries(HADITH_TAXONOMY).map(([name, cfg]) => ({
    name,
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

/** Placeholder intro for the hub page. Replace with final copy. */
export const HADITH_INTRO = [
  'The Sahih collections of al-Bukhari and Muslim are regarded by Sunni Muslims as the most authentic books after the Quran. They are the primary record of what Muhammad said and did, and they shape Islamic law, belief and practice to this day.',
  'This section lets the texts speak for themselves. Each entry shows the exact passage that matters, the original Arabic, and a direct link to Sunnah.com so anyone can verify it in full.',
];

export const HADITH_SEO = {
  hub: {
    title: 'Sahih Hadith Explorer | Bukhari & Muslim Under Scrutiny',
    description: 'Explore 820+ authentic hadiths from Sahih al-Bukhari and Sahih Muslim, organized by topic, with the original Arabic, full narrations, sanitized-translation audits and Sunnah.com verification.',
    keywords: 'sahih bukhari, sahih muslim, problematic hadith, hadith analysis, islam apologetics, aisha age hadith, hadith translation errors',
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
