// Route, source-integrity, anchor-coverage, and link-allowlist contract for
// `/discover/divinity-timeline` (`.hrv.dtl`).
//
// `src/data/divinityTimeline.json` and `src/data/discoverCatalog.json` remain
// byte-identically untouched in the worktree (catalog card copy is applied via
// `src/utils/discoverCatalogOverrides.ts`). At build and test time, `model.js` verifies both the
// SHA-256 of `divinityTimeline.json` and a 1-to-1 bijection across all 42 raw
// dataset IDs so every `#event-<id>` deep link resolves uniquely.

import { BASE } from '../hadithReliability/config.js';

export { BASE };
export const discoverHref = () => `${BASE}/discover`;

export function sitePath(p) {
  if (typeof p !== 'string' || !p.startsWith('/') || /^\/[\/\\]/.test(p)) {
    throw new Error(`sitePath requires a single-slash root-relative path: ${p}`);
  }
  return `${BASE}${p}`;
}

export const ARTICLE_SLUG = 'divinity-timeline';
export const ARTICLE_PATH = `${BASE}/discover/${ARTICLE_SLUG}`;
export const CANONICAL_URL = `https://readyapologia.com/discover/${ARTICLE_SLUG}`;
export const OG_IMAGE = `${BASE}/media/divinity_timeline/megiddo_mosaic/image_1.jpg`;
export const DATE_PUBLISHED = '2026-04-12';
export const DATE_MODIFIED = '2026-04-20';

// Byte-exact SHA-256 of `src/data/divinityTimeline.json` on `HEAD`.
export const EXPECTED_DATA_SHA256 =
  'e04dd53c6e91f09c2fbe86a239e4e79635887a10cc2bcf0036bdd9773a43fb3e';

// Maximum permitted byte size for any rendered artifact photograph on the page
// so mobile load remains fast without serving multi-megabyte archival dumps.
export const MAX_RENDERED_IMAGE_BYTES = 600 * 1024;

// Five numbered evidentiary sections (matching H1 count = 5 and Glance rows = 5)
// followed by the unnumbered Methodology & Scope section.
export const NUMBERED_SECTION_IDS = Object.freeze([
  'inscriptions-and-archaeology',
  'hostile-and-external-witnesses',
  'first-century-creeds',
  'earliest-biblical-papyri',
  'patristic-and-liturgical-papyri',
]);

export const METHODOLOGY_SECTION_ID = 'methodology-and-scope';

export const SECTION_ORDER = Object.freeze([
  ...NUMBERED_SECTION_IDS,
  METHODOLOGY_SECTION_ID,
]);

// Partition of all 42 raw `src/data/divinityTimeline.json` IDs:
// 16 primary artifact cards + 12 grouped comparative/regional sub-anchors +
// 14 excluded items inside `#methodology-and-scope` = 42 unique anchors.
export const PRIMARY_CARD_IDS = Object.freeze([
  // Section 01 — Inscriptions & Archaeology (5)
  'megiddo_mosaic',
  'frankfurt_silver_scroll',
  'dura_europos_church',
  'abercius_inscription',
  'stele_of_licinia_amias',
  // Section 02 — Hostile, Ritual & Rival-Christian Witnesses (3)
  'alexamenos_graffito',
  'magic_crucifixion_gem',
  'marcionite_inscription',
  // Section 04 — Earliest Biblical Papyri & Nomina Sacra (4)
  'papyrus_66_john_1_1',
  'papyrus_46_philippians_2_6',
  'papyrus_98',
  'papyrus_104',
  // Section 05 — Patristic Letters, Liturgical Hymns & Martyrdom Papyri (4)
  'papyrus_oxyrhynchus_405',
  'papyrus_bodmer_xiii',
  'oxyrhynchus_hymn',
  'papyrus_bodmer_xx',
]);

export const GROUPED_SUB_ANCHOR_IDS = Object.freeze([
  // Section 01 grouped epigraphic, catacomb, post-Nicene copy & Galilean comparators (6)
  'house_of_peter',
  'eumeneian_formula_inscriptions',
  'phrygian_montanist_tombstones',
  'epitaph_of_pectorius',
  'catacomb_of_priscilla',
  'san_sebastiano_graffiti',
  // Section 02 comparative gem & magical codex parallels (2)
  'costanza_gem',
  'paris_magical_papyrus',
  // Section 04 additional column lines + nomina sacra papyri (3)
  'papyrus_98_revelation_1_13',
  'papyrus_77',
  'papyrus_oxyrhynchus_2',
  // Section 05 liturgical prayer sheet parallel (1)
  'papyrus_oxyrhynchus_407',
]);

export const EXCLUDED_LEGACY_IDS = Object.freeze([
  'papyrus_oxyrhynchus_412',
  'chachati_gem',
  'catacomb_of_domitilla',
  'epitaph_of_eutropos',
  'via_salaria_sarcophagus',
  'early_christian_gold_glass',
  'pgm_xiii_command',
  'michigan_magical_papyrus',
  'early_christian_bronze_lamps',
  'papyrus_bodmer_v',
  'catacomb_of_callixtus',
  'sarcophagus_santa_maria_antiqua',
  'vatican_necropolis_graffiti',
  'nott_gem',
]);

export const ALL_LEGACY_EVENT_IDS = Object.freeze([
  ...PRIMARY_CARD_IDS,
  ...GROUPED_SUB_ANCHOR_IDS,
  ...EXCLUDED_LEGACY_IDS,
]);

export const DATING_BASIS_LABELS = Object.freeze({
  stratigraphic: 'Stratigraphic / Sealed Context',
  'dated-epigraphic': 'Dated Inscription',
  'historical-prosopographical': 'Dated Administrative / Archival Record',
  'patristic-manuscript':
    'Literary Letters (Middle Recension; Main Greek MSS 10th–11th c.)',
  'martyr-acts': 'Martyr Protocol (Trial AD 304–307; [theos] Restored)',
  'epigraphic-contextual': 'Epigraphic & Archaeological Context',
  paleographical: 'Paleographical Hand Range',
  'composition-copy': 'Earlier Text / Late 3rd–4th C. Copy',
  'disputed-post-nicene': 'Post-Nicene / Contested Pre-325',
  'pre-pauline-textual': 'Pre-Pauline Tradition in Pauline Epistle',
  'pauline-epistle': 'Pauline Epistle (c. AD 53–55)',
});

export const EVIDENCE_TIER_LABELS = Object.freeze({
  'tier-a': 'Tier A · Calls Jesus God (theos / deus)',
  'tier-b': 'Tier B · Prayer, Hymn, or Worship to Jesus',
  'tier-c': 'Tier C · Christian Titles, Sacred Names, or Context',
});

// Books and surahs built during sliced `preview.sh` builds so zero internal
// links 404 on local preview or production.
export const BUILT_BIBLE_BOOKS = new Set([
  'jn',
  'mk',
  'mt',
  'lk',
  'acts',
  'rom',
  '1cor',
  'phil',
  'col',
  '1tm',
  '2pt',
  '1jn',
  'rv',
  'is',
  'ps',
  'nm',
]);

export const BUILT_QURAN_SURAHS = new Set(['1', '4', '5', '9']);

export const ALLOWED_DISCOVER_PATHS = new Set([
  '/discover',
  '/discover/divinity-timeline',
  '/discover/extrabiblical-evidence-for-jesus',
  '/discover/trustworthiness-of-the-bible',
  '/discover/islamic-dilemma',
]);

// Closed HTTPS allowlist of museum catalogues, epigraphic/papyrological
// databases, primary-source editions, and peer-reviewed scholarly publishers.
// Wikipedia, Wikimedia, blogs, and polemical sites are never permitted.
export const HOSTS = new Set([
  'www.hadashot-esi.org.il',
  'hadashot.iaa.org.il',
  'www.sanisidoro.net',
  'aktuelles.uni-frankfurt.de',
  'www.leiza.de',
  'www.museivaticani.va',
  'inscriptions.packhum.org',
  'edh.ub.uni-heidelberg.de',
  'www.edr-edr.it',
  'www.britishmuseum.org',
  'grbs.library.duke.edu',
  'gallica.bnf.fr',
  'papyri.info',
  'ntvmr.uni-muenster.de',
  'bodmerlab.unige.ch',
  'viewer.cbl.ie',
  'chesterbeatty.ie',
  'portal.sds.ox.ac.uk',
  'digital.bodleian.ox.ac.uk',
  'library.harvard.edu',
  'archive.org',
  'web.archive.org',
  'manuscripts.csntm.org',
  'www.judaism-and-rome.org',
  'www.perseus.tufts.edu',
  'scaife.perseus.org',
  'www.newadvent.org',
  'doi.org',
  'www.jstor.org',
  'academic.oup.com',
  'www.cambridge.org',
  'bmcr.brynmawr.edu',
  'swbts.edu',
  'www.eerdmans.com',
]);

export function validateHref(href) {
  if (typeof href !== 'string' || href.length === 0) {
    return { ok: false, reason: 'empty href' };
  }
  if (/\s/.test(href)) {
    return { ok: false, reason: `whitespace in href: ${href}` };
  }
  if (href.startsWith('#')) {
    return /^#[A-Za-z0-9_-]+$/.test(href)
      ? { ok: true, kind: 'anchor' }
      : { ok: false, reason: `malformed fragment: ${href}` };
  }
  if (/^\/[\/\\]/.test(href)) {
    return { ok: false, reason: `protocol-relative href forbidden: ${href}` };
  }
  if (href.startsWith('/')) {
    const rel = BASE && href.startsWith(`${BASE}/`) ? href.slice(BASE.length) : href;
    const [pathname, hash] = rel.split('#');
    if (hash !== undefined && !/^[A-Za-z0-9_-]+$/.test(hash)) {
      return { ok: false, reason: `malformed hash on internal route: ${href}` };
    }
    const bibleMatch = pathname.match(/^\/bible\/([a-z0-9]+)\/(\d+)$/);
    if (bibleMatch) {
      if (!BUILT_BIBLE_BOOKS.has(bibleMatch[1])) {
        return {
          ok: false,
          reason: `Bible book '${bibleMatch[1]}' is outside preview sliced build set: ${href}`,
        };
      }
      return { ok: true, kind: 'internal-bible' };
    }
    const quranMatch = pathname.match(
      /^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/,
    );
    if (quranMatch) {
      if (!BUILT_QURAN_SURAHS.has(quranMatch[1])) {
        return {
          ok: false,
          reason: `Quran surah '${quranMatch[1]}' is outside allowed build set: ${href}`,
        };
      }
      return { ok: true, kind: 'internal-quran' };
    }
    if (ALLOWED_DISCOVER_PATHS.has(pathname)) {
      return { ok: true, kind: 'internal-discover' };
    }
    return { ok: false, reason: `unrecognised internal route: ${href}` };
  }
  let parsed;
  try {
    parsed = new URL(href);
  } catch {
    return { ok: false, reason: `invalid URL: ${href}` };
  }
  if (parsed.protocol !== 'https:') {
    return { ok: false, reason: `non-HTTPS external URL: ${href}` };
  }
  if (parsed.hostname === 'quran.com' || parsed.hostname.endsWith('.quran.com')) {
    return {
      ok: false,
      reason: `Qurʾān links must use internal tafsir routes: ${href}`,
    };
  }
  if (!HOSTS.has(parsed.hostname)) {
    return {
      ok: false,
      reason: `external host '${parsed.hostname}' not in academic/museum allowlist: ${href}`,
    };
  }
  return { ok: true, kind: 'external', host: parsed.hostname };
}
