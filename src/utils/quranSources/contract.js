/**
 * Shared contract + reader-facing labels for the v3 "Primary Sources of the Quran" dataset.
 * Isomorphic (no node imports): used by scripts/import_quran_sources.js, the build-time loader
 * and the client-side evidence explorer.
 *
 * Organization (v3):
 *   1. Primary tabs = 3 Evidence Categories:
 *      - stories   ("Stories & Narratives")
 *      - phrases   ("Distinct Phrases & Terms")
 *      - practices ("Islamic Practices & Laws")
 *   2. Secondary filter chips = 7 Donor Source Traditions
 */

/**
 * @typedef {Object} QuranSourceView
 * @property {string} t Donor tradition key (e.g. 'rabbinic', 'apocrypha', 'syriac')
 * @property {string} title Canonical work title
 * @property {string} ref Specific citation reference
 * @property {string} workSub Non-redundant work subtitle ('' when redundant with ref)
 * @property {string} date Historical date/century range string
 * @property {string} lang Reader-facing language label from dataset
 * @property {string} langCode BCP-47 language code ('he', 'arc', 'ar', 'syr', 'grc', 'la', 'gez', 'pal', 'ae', 'hy', 'cop', 'akk', 'en', or 'und')
 * @property {'rtl' | 'ltr'} dir Text direction for original quote ('rtl' for he/arc/ar/syr, else 'ltr')
 * @property {string} en Verbatim English translation quote
 * @property {string[]} highlights Verbatim highlight substrings inside `en`
 * @property {string} orig Original-language quote ('' when omitted)
 * @property {string} href Base-less internal route or external https:// URL
 * @property {boolean} external True when `href` points to an external domain
 * @property {'bible' | 'tafsir' | 'external'} linkKind Link destination kind
 * @property {string} verifyLabel Reader-facing verification link label
 * @property {string} [traditionLabel] Short tradition badge label added by drawer loader
 */

/**
 * @typedef {Object} QuranSourceDiscussion
 * @property {string} view Classical Muslim harmonization summary
 * @property {string} reply Primary-source comparison evaluation
 */

/**
 * @typedef {Object} QuranSourceDrawerEntry
 * @property {string} id Stable item identifier
 * @property {'stories' | 'phrases' | 'practices'} cat Primary category key
 * @property {string} motifGroup Motif cluster key
 * @property {number} rank Rank within category (1-indexed)
 * @property {number} surah Surah number (1..114)
 * @property {number} startAyah Starting ayah number
 * @property {number} endAyah Ending ayah number
 * @property {string} range Formatted verse range (e.g. '5:32' or '18:60-82')
 * @property {string} title Reader-facing card/entry heading
 * @property {string} note Concise connection note
 * @property {QuranSourceDiscussion} discussion Classical harmonization and primary-source evaluation
 * @property {string} quranEn Verbatim Droge English translation of the Quran passage
 * @property {string[]} quranHighlights Verbatim highlight substrings inside `quranEn`
 * @property {QuranSourceView[]} sources Array of parallel source citations
 */

/**
 * @typedef {QuranSourceDrawerEntry & {
 *   isPrimaryInMotif: boolean,
 *   globalRank: number,
 *   quranAr: string
 * }} QuranSourceCard
 */

export const CATEGORIES = [
  {
    key: 'stories',
    slug: 'stories',
    label: 'Stories & Narratives',
    short: 'Stories & Narratives',
    badge: 'Narrative Parallel',
    description:
      'Extra-biblical narratives in apocryphal gospels, Rabbinic midrash and Talmud, Syriac legends, classical medicine, and fused Biblical accounts that parallel specific Quranic episodes.',
  },
  {
    key: 'phrases',
    slug: 'phrases',
    label: 'Distinct Phrases & Terms',
    short: 'Phrases & Terms',
    badge: 'Distinct Phrase',
    description:
      'Multi-clause verbatim quotations, explicit scriptural citations, and rare compound idioms shared with earlier texts.',
  },
  {
    key: 'practices',
    slug: 'practices',
    label: 'Islamic Practices & Laws',
    short: 'Practices & Laws',
    badge: 'Practice & Law',
    description:
      'Distinctively Islamic pilgrimage rites, prayer directions and times, purity rules, fasting thresholds, and exact numerical ordinances with pre-Islamic precedents.',
  },
];

export const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));
export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

export const TRADITIONS = [
  {
    key: 'rabbinic',
    slug: 'rabbinic',
    dataset: 'Rabbinic Judaism (Mishnah, Talmud & Midrash)',
    label: 'Rabbinic Writings',
    long: 'Rabbinic Writings (Mishnah, Talmud, Midrash & Targum)',
    short: 'Rabbinic',
  },
  {
    key: 'apocrypha',
    slug: 'apocrypha',
    dataset: 'Christian Apocrypha & Pseudepigrapha',
    label: 'Apocrypha & Pseudepigrapha',
    long: 'Christian & Second Temple Apocrypha and Pseudepigrapha',
    short: 'Apocrypha',
  },
  {
    key: 'syriac',
    slug: 'syriac',
    dataset: 'Syriac & Patristic Christian',
    label: 'Syriac & Patristic',
    long: 'Syriac & Patristic Christian Writings',
    short: 'Syriac & Patristic',
  },
  {
    key: 'arabian',
    slug: 'arabian',
    dataset: 'Pre-Islamic Arabian Customs & Epigraphy',
    label: 'Pre-Islamic Arabian',
    long: 'Pre-Islamic Arabian Customs, Poetry & Epigraphy',
    short: 'Pre-Islamic Arabian',
  },
  {
    key: 'zoroastrian',
    slug: 'zoroastrian',
    dataset: 'Zoroastrian & Persian Traditions',
    label: 'Zoroastrian & Persian',
    long: 'Zoroastrian & Persian Texts',
    short: 'Zoroastrian & Persian',
  },
  {
    key: 'biblical',
    slug: 'biblical',
    dataset: 'Canonical Bible (Torah, Prophets, Psalms & NT)',
    label: 'Canonical Bible',
    long: 'Canonical Bible (Torah, Prophets, Psalms & New Testament)',
    short: 'Canonical Bible',
  },
  {
    key: 'classical',
    slug: 'classical',
    dataset: 'Greek Science & Ancient Near East',
    label: 'Greek & Near Eastern',
    long: 'Greek Science, Medicine & Ancient Near Eastern Literature',
    short: 'Greek & Near East',
  },
];

export const TRADITION_BY_KEY = Object.fromEntries(TRADITIONS.map((t) => [t.key, t]));
export const TRADITION_BY_SLUG = Object.fromEntries(TRADITIONS.map((t) => [t.slug, t]));
const BY_DATASET = Object.fromEntries(TRADITIONS.map((t) => [t.dataset, t.key]));

export const CARDS_PER_PAGE = 20;

export function traditionKeyFor(datasetName) {
  return BY_DATASET[datasetName] || null;
}

/** bible://ps/36/29 -> /bible/ps/36#29 */
export function bibleHref(url) {
  const m = /^bible:\/\/([^/]+)\/(\d+)\/(\d+)/.exec(url || '');
  return m ? `/bible/${m[1]}/${m[2]}#${m[3]}` : null;
}

/** tabari://2/158 -> /quran/2/158/tafsir/tabari; ibnkathir://22/37 -> /quran/22/37/tafsir/ibn_kathir */
export function tafsirHref(url) {
  const m = /^(tabari|ibnkathir):\/\/(\d+)\/(\d+)$/.exec(url || '');
  if (!m) return null;
  const scholar = m[1] === 'ibnkathir' ? 'ibn_kathir' : 'tabari';
  return `/quran/${m[2]}/${m[3]}/tafsir/${scholar}`;
}

export function resolveSourceLink(url) {
  const u = String(url || '').trim();
  if (u.startsWith('bible://')) {
    return { href: bibleHref(u), external: false, linkKind: 'bible' };
  }
  if (u.startsWith('tabari://') || u.startsWith('ibnkathir://')) {
    return { href: tafsirHref(u), external: false, linkKind: 'tafsir' };
  }
  return { href: u, external: true, linkKind: 'external' };
}

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'source';
  }
};

/**
 * Returns the reader-facing verification button label for a source citation.
 * Accepts either a built source object (`{ linkKind, href }`) or a raw source (`{ source_url }`).
 * @param {{ linkKind?: string, href?: string, source_url?: string }} source
 * @returns {string}
 */
export function verifyLabelFor(source) {
  if (!source || typeof source !== 'object') return 'Verify at source';
  const resolved =
    source.linkKind && source.href !== undefined
      ? { linkKind: source.linkKind, href: source.href }
      : resolveSourceLink(source.source_url || source.href || '');
  if (resolved.linkKind === 'bible') return 'Read in our Bible reader';
  if (resolved.linkKind === 'tafsir') return 'Read in our Tafsir reader';
  return `Verify at ${hostOf(resolved.href)}`;
}

/**
 * Computes a non-redundant work subtitle when `title` and `ref` differ meaningfully.
 * Returns `''` when `title` is already contained in or identical to `ref`.
 * @param {string} [title]
 * @param {string} [ref]
 * @returns {string}
 */
export function distinctWorkSubtitle(title, ref) {
  if (!title || !ref) return '';
  const norm = (s) => String(s).replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
  const t = norm(title);
  const r = norm(ref);
  if (!t || !r) return '';
  if (t.toLowerCase() === r.toLowerCase()) return '';
  if (r.toLowerCase().includes(t.toLowerCase())) return '';
  if (t.toLowerCase().startsWith(r.toLowerCase())) {
    return t.slice(r.length).trim().replace(/^\((.*)\)$/, '$1').trim();
  }
  return title;
}

export const LANG_CODE_MAP = Object.freeze({
  // Hebrew
  hebrew: 'he',
  'mishnaic hebrew': 'he',
  'biblical hebrew': 'he',
  'rabbinic hebrew': 'he',
  'biblical hebrew / greek': 'he',
  'hebrew / aramaic': 'he',
  'hebrew/aramaic': 'he',
  "hebrew / ge'ez": 'he',
  "ge'ez / hebrew (r.h. charles trans.)": 'he',
  'hebrew / jewish babylonian aramaic': 'he',
  'hebrew / jewish palestinian aramaic': 'he',
  'mishnaic hebrew / aramaic': 'he',
  'rabbinic hebrew / aramaic': 'he',

  // Aramaic
  aramaic: 'arc',
  'jewish babylonian aramaic': 'arc',
  'jewish palestinian aramaic': 'arc',
  'babylonian aramaic': 'arc',
  'biblical aramaic': 'arc',
  targum: 'arc',
  'targumic aramaic': 'arc',
  "aramaic / ge'ez / greek": 'arc',
  'aramaic / syriac': 'arc',
  'aramaic / syriac (harris, conybeare & lewis trans.)': 'arc',
  'aramaic/hebrew': 'arc',
  'babylonian aramaic / hebrew': 'arc',
  'biblical aramaic / greek': 'arc',
  'jewish babylonian aramaic / mishnaic hebrew': 'arc',

  // Arabic
  arabic: 'ar',
  'classical arabic': 'ar',

  // Syriac
  syriac: 'syr',
  'classical syriac': 'syr',

  // Greek
  greek: 'grc',
  koine: 'grc',
  'koine greek': 'grc',
  'koine greek (nasb)': 'grc',
  'koine greek (nt)': 'grc',
  'ancient greek': 'grc',
  'ancient greek (lxx)': 'grc',
  'greek / latin': 'grc',
  'greek/latin': 'grc',

  // Latin
  latin: 'la',
  'latin (from greek / semitic)': 'la',
  'latin (from syriac)': 'la',
  'latin / ancient greek': 'la',
  'latin / greek': 'la',

  // Ge'ez / Ethiopic
  "ge'ez": 'gez',
  geez: 'gez',
  ethiopic: 'gez',

  // Middle Persian / Pahlavi
  'middle persian': 'pal',
  pahlavi: 'pal',
  'middle persian / pahlavi': 'pal',

  // Avestan
  avestan: 'ae',

  // Armenian
  armenian: 'hy',
  'classical armenian': 'hy',

  // Coptic
  coptic: 'cop',
  'coptic (from greek)': 'cop',

  // Akkadian
  akkadian: 'akk',

  // English
  english: 'en',
});

const RTL_LANG_CODES = new Set(['he', 'arc', 'ar', 'syr']);

/**
 * Maps a human-readable `source_language` string to a BCP-47 language subtag.
 * Unknown languages return `'und'`.
 * @param {string} lang
 * @returns {string}
 */
export function langCodeFor(lang) {
  const norm = String(lang || '')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (!norm) return 'und';
  if (LANG_CODE_MAP[norm]) return LANG_CODE_MAP[norm];

  const stripped = norm.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  if (LANG_CODE_MAP[stripped]) return LANG_CODE_MAP[stripped];

  const firstPart = stripped
    .split('/')[0]
    ?.trim();
  if (firstPart && LANG_CODE_MAP[firstPart]) return LANG_CODE_MAP[firstPart];

  return 'und';
}

/**
 * Returns `'rtl'` for Hebrew, Aramaic, Arabic, and Syriac scripts, otherwise `'ltr'`.
 * @param {string} langCode
 * @returns {'rtl' | 'ltr'}
 */
export function dirForLang(langCode) {
  return RTL_LANG_CODES.has(langCode) ? 'rtl' : 'ltr';
}

export const cleanWhitespace = (s) => String(s || '').replace(/\s+/g, ' ').trim();
export const cleanQuoteText = (s) =>
  cleanWhitespace(s)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1');

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Builds a Unicode case-insensitive global RegExp for a highlight substring,
 * treating runs of whitespace as `\s+`.
 * @param {string} rawH
 * @returns {RegExp | null}
 */
export function buildHighlightPattern(rawH) {
  const h = cleanWhitespace(rawH);
  if (!h) return null;
  const pattern = h.split(' ').map(escapeRegExp).join('\\s+');
  return new RegExp(pattern, 'giu');
}

/**
 * Tests whether `highlight` occurs inside `text` using the same case-insensitive,
 * whitespace-normalized matching rule as `segmentWithHighlights`.
 * @param {string} text
 * @param {string} highlight
 * @returns {boolean}
 */
export function hasHighlightMatch(text, highlight) {
  const re = buildHighlightPattern(highlight);
  if (!re) return false;
  return re.test(String(text ?? ''));
}

const VERSE_ID = /^\d{1,3}:\d{1,3}$/;
const REQUIRED_SRC = [
  'tradition',
  'source_title',
  'source_reference',
  'source_date',
  'source_language',
  'source_quote_english',
  'source_url',
];

/**
 * Enforces the v3 dataset contract before importing into src/data and public/data.
 * @returns {{errors: string[], warnings: string[]}}
 */
export function validateDataset(dataset) {
  const errors = [];
  const warnings = [];
  const items = Array.isArray(dataset) ? dataset : dataset?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { errors: ['dataset.items must be a non-empty array'], warnings };
  }

  const seenIds = new Set();
  const catRankCounters = { stories: 0, phrases: 0, practices: 0 };
  let prevScore = 101;

  items.forEach((item, idx) => {
    const loc = `item[${idx}] (${item?.id || 'NO_ID'})`;
    if (!item || typeof item !== 'object') {
      errors.push(`${loc}: not an object`);
      return;
    }
    if (!item.id || seenIds.has(item.id)) {
      errors.push(`${loc}: missing or duplicate id "${item.id}"`);
    }
    seenIds.add(item.id);

    if (!CATEGORY_BY_KEY[item.category]) {
      errors.push(`${loc}: unknown category "${item.category}"`);
    } else {
      catRankCounters[item.category] += 1;
      if (item.rank_in_category !== catRankCounters[item.category]) {
        errors.push(`${loc}: expected rank_in_category=${catRankCounters[item.category]}, got ${item.rank_in_category}`);
      }
    }

    if (item.global_rank !== idx + 1) {
      errors.push(`${loc}: expected global_rank=${idx + 1}, got ${item.global_rank}`);
    }
    if (typeof item.cuj_score !== 'number' || item.cuj_score > prevScore) {
      errors.push(`${loc}: cuj_score ${item.cuj_score} violates non-increasing order after ${prevScore}`);
    } else {
      prevScore = item.cuj_score;
    }

    if (!Array.isArray(item.verse_ids) || item.verse_ids.length === 0) {
      errors.push(`${loc}: empty verse_ids`);
    } else {
      for (const vid of item.verse_ids) {
        if (!VERSE_ID.test(vid)) errors.push(`${loc}: malformed verse_id "${vid}"`);
      }
      if (
        Number.isInteger(item.surah) &&
        item.surah >= 1 &&
        item.surah <= 114 &&
        Number.isInteger(item.start_ayah) &&
        item.start_ayah >= 1 &&
        Number.isInteger(item.end_ayah) &&
        item.end_ayah >= item.start_ayah
      ) {
        const expectedVerseIds = [];
        for (let a = item.start_ayah; a <= item.end_ayah; a++) {
          expectedVerseIds.push(`${item.surah}:${a}`);
        }
        if (
          item.verse_ids.length !== expectedVerseIds.length ||
          item.verse_ids.some((v, i) => v !== expectedVerseIds[i])
        ) {
          errors.push(
            `${loc}: verse_ids [${item.verse_ids.join(', ')}] must be contiguous and match ${item.surah}:${item.start_ayah}..${item.end_ayah}`
          );
        }
      } else {
        errors.push(
          `${loc}: invalid surah/start_ayah/end_ayah (${item.surah}:${item.start_ayah}-${item.end_ayah})`
        );
      }
    }

    if (!String(item.short_title || '').trim()) errors.push(`${loc}: missing short_title`);
    if (!String(item.connection_note || '').trim()) errors.push(`${loc}: missing connection_note`);
    if (!String(item.motif_group || '').trim()) errors.push(`${loc}: missing motif_group`);
    if (
      !item.scholarly_discussion ||
      !String(item.scholarly_discussion.classical_harmonization || '').trim() ||
      !String(item.scholarly_discussion.primary_source_evaluation || '').trim()
    ) {
      errors.push(`${loc}: missing scholarly_discussion.{classical_harmonization, primary_source_evaluation}`);
    }

    if (!Array.isArray(item.quran_highlights) || item.quran_highlights.length === 0) {
      errors.push(`${loc}: missing quran_highlights[]`);
    } else {
      item.quran_highlights.forEach((qh, qi) => {
        if (typeof qh !== 'string' || !cleanQuoteText(qh)) {
          errors.push(`${loc}: quran_highlights[${qi}] must be a non-empty string`);
        }
      });
    }

    if (!Array.isArray(item.sources) || item.sources.length === 0) {
      errors.push(`${loc}: missing sources[]`);
      return;
    }

    item.sources.forEach((s, si) => {
      const p = `${loc}#src${si + 1}`;
      for (const f of REQUIRED_SRC) {
        if (!String(s[f] || '').trim()) errors.push(`${p}: missing ${f}`);
      }
      const cleanedQuoteEn = cleanQuoteText(s.source_quote_english);
      if (!Array.isArray(s.quote_highlights) || s.quote_highlights.length === 0) {
        errors.push(`${p}: missing quote_highlights[]`);
      } else {
        s.quote_highlights.forEach((qh, hi) => {
          const cleanedH = typeof qh === 'string' ? cleanQuoteText(qh) : '';
          if (!cleanedH) {
            errors.push(`${p}: quote_highlights[${hi}] must be a non-empty string`);
          } else if (
            !hasHighlightMatch(cleanedQuoteEn, cleanedH) &&
            !hasHighlightMatch(s.source_quote_english, qh)
          ) {
            errors.push(
              `${p}: quote_highlights[${hi}] "${qh}" not found in source_quote_english`
            );
          }
        });
      }
      if (s.tradition && !traditionKeyFor(s.tradition)) {
        errors.push(`${p}: tradition "${s.tradition}" has no reader-facing label in contract.js`);
      }
      if (s.source_language && langCodeFor(s.source_language) === 'und') {
        warnings.push(`${p}: unmapped source_language "${s.source_language}" (resolved to "und")`);
      }
      const link = resolveSourceLink(s.source_url);
      if (!link.href || /\s/.test(link.href)) {
        errors.push(`${p}: invalid source_url "${s.source_url}"`);
      }
      if (link.external && !/^https?:\/\//.test(link.href)) {
        errors.push(`${p}: external url must start with http(s):// (${link.href})`);
      }
    });
  });

  return { errors, warnings };
}

/**
 * Splits `text` into `[{ text, mark }]` segments by matching case-insensitive
 * substrings in `highlights` directly against `text` (using Unicode RegExp `giu`
 * with `\s+` whitespace normalization so offsets never drift on characters like 'İ'),
 * merging overlapping intervals, and leaving every character of `text` 100% verbatim.
 */
export function segmentWithHighlights(text, highlights = []) {
  const str = String(text ?? '');
  if (!str || !Array.isArray(highlights) || highlights.length === 0) {
    return [{ text: str, mark: false }];
  }
  const spans = [];
  for (const rawH of highlights) {
    const re = buildHighlightPattern(rawH);
    if (!re) continue;
    for (const m of str.matchAll(re)) {
      if (m[0].length > 0) {
        spans.push([m.index, m.index + m[0].length]);
      }
    }
  }
  if (spans.length === 0) return [{ text: str, mark: false }];
  spans.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged = [spans[0]];
  for (let i = 1; i < spans.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = spans[i];
    if (cur[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], cur[1]);
    } else {
      merged.push(cur);
    }
  }
  const out = [];
  let cursor = 0;
  for (const [s, e] of merged) {
    if (s > cursor) out.push({ text: str.slice(cursor, s), mark: false });
    out.push({ text: str.slice(s, e), mark: true });
    cursor = e;
  }
  if (cursor < str.length) out.push({ text: str.slice(cursor), mark: false });
  return out;
}
