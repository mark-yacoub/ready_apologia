/**
 * Sitemap <lastmod> resolver (build-time only, imported by astro.config.mjs).
 *
 * Google only trusts <lastmod> when it is consistently accurate, so every URL's
 * date is the last git commit that touched the files that produce its CONTENT
 * (data + page template), never the build time. Layout/CSS-only commits do not
 * bump it on purpose.
 *
 * MAINTENANCE RULE (see JETSKI.md / .agents/AGENTS.md):
 *   - New route or new data source → add/extend a rule in LASTMOD_RULES
 *     (or DISCOVER_SOURCES for a new Discover article).
 *   - The build prints `[sitemap-lastmod]` with every sitemap URL that matched
 *     no rule; those URLs ship WITHOUT <lastmod>. Fix the mapping, don't ignore it.
 *
 * CI must check out full history (`fetch-depth: 0`); in a shallow clone every
 * file would share the HEAD date, so lastmod is skipped with a warning instead.
 */
import { execFileSync } from 'node:child_process';

/** Discover article slug → extra content sources (page dir/file and
 *  src/components/discover/<slug> are added automatically). */
export const DISCOVER_SOURCES = {
  'through-christian-eyes': ['src/utils/throughChristianEyes'],
  'hadith-reliability': ['src/utils/hadithReliability', 'src/data/discover/islam/scripture/hadith_reliability'],
  'convenient-revelations': ['src/utils/convenientRevelations', 'src/data/convenient-revelations.json'],
  'quran-preservation': ['src/utils/quranPreservation', 'src/data/discover/islam/scripture/quran_preservation.json'],
  'from-mecca-to-medina': ['src/utils/meccaToMedina', 'src/data/discover/islam/scripture/from_mecca_to_medina.json', 'src/components/discover/mecca-to-medina'],
  'muhammad-and-slavery': ['src/utils/muhammadSlavery', 'src/data/discover/islam/prophet/slavery.json', 'src/components/discover/muhammad-slavery'],
  'origins-of-revelation': ['src/utils/originsOfRevelation', 'src/data/discover/islam/scripture/demonic_revelation.json'],
  'islamic-dilemma': ['src/utils/islamicDilemma', 'src/data/discover/islam/scripture/islamic_dilemma.md'],
  'trustworthiness-of-the-bible': ['src/data/trustworthiness-of-the-bible.json', 'src/components/discover/trustworthiness'],
  'divinity-timeline': ['src/data/divinityTimeline.json'],
  'extrabiblical-evidence-for-jesus': ['src/data/extrabiblical-evidence-for-jesus.json'],
  'statistics': ['src/utils/statisticsLoader.js', 'data.db', 'src/data/quran', 'src/data/hadith'],
};

/**
 * Ordered rules, first match wins (most specific first).
 * `match(segments)` gets the path split on '/', e.g. ['quran','4','24','tafsir','tabari'].
 * `sources` is an array or a function of the segments.
 */
export const LASTMOD_RULES = [
  { id: 'home', match: (s) => s.length === 0,
    sources: [
      'src/pages/index.astro',
      'src/components/home',
      'src/styles/home.css',
      'src/utils/homeStats.js',
      'src/utils/throughChristianEyes',
      'src/data/apologists.js', // "Videos by Apologist" counts
      'data.db',
      'src/data/books_meta.json',
      'src/data/discoverCatalog.json',
      'src/data/quran/arabic/meta.json',
      'src/data/quran/commentary/tafsir_tabari_english.json',
      'src/data/quran/commentary/nickel_annotations.json',
      'src/data/quran/non_uthmanic',
      'src/data/quran/qiraat',
      'src/data/quran/sources/index.json',
      'src/data/hadith',
      'src/data/evidence',
      'src/data/discover',
      'src/data/divinityTimeline.json',
      'src/data/extrabiblical-evidence-for-jesus.json',
      'src/data/trustworthiness-of-the-bible.json',
      'src/utils/islamic_commentaries_loader.js',
      'src/utils/nonUthmanicLoader.js',
      'src/utils/qiraatLoader.js',
      'src/utils/hadithLoader.js',
      'src/utils/hadith_config.js',
      'src/utils/evidenceLoader.js',
      'src/utils/evidenceCounters.js',
      'src/utils/hadithReliability/loader.js',
      'src/utils/quranPreservation/config.js',
      'src/utils/convenientRevelations/model.js',
      'src/utils/meccaToMedina/config.js',
      'src/utils/muhammadSlavery/config.js',
      'src/utils/originsOfRevelation/content.js',
      'src/utils/originsOfRevelation/model.js',
    ] },

  { id: 'discover-hub', match: (s) => s[0] === 'discover' && s.length === 1,
    sources: ['src/pages/discover/index.astro', 'src/data/discoverCatalog.json'] },
  { id: 'discover-article', match: (s) => s[0] === 'discover' && s.length >= 2 && s[1] in DISCOVER_SOURCES,
    sources: (s) => [
      `src/pages/discover/${s[1]}`,
      `src/pages/discover/${s[1]}.astro`,
      `src/components/discover/${s[1]}`,
      ...DISCOVER_SOURCES[s[1]],
    ] },

  { id: 'evidence-quran-sources', match: (s) => s[0] === 'evidence' && s[1] === 'quran_sources',
    sources: ['src/pages/evidence/quran_sources.astro', 'src/data/quran/sources', 'src/components/quranSources', 'src/utils/quranSources'] },
  { id: 'evidence', match: (s) => s[0] === 'evidence',
    sources: ['src/pages/evidence', 'src/data/evidence', 'src/data/evidence.db', 'src/data/evidenceTaxonomy.js', 'src/components/evidence'] },

  { id: 'hadith', match: (s) => s[0] === 'hadith', sources: ['src/pages/hadith', 'src/data/hadith'] },

  { id: 'apologists', match: (s) => s[0] === 'apologists',
    sources: ['src/pages/apologists', 'src/components/apologists', 'src/data/apologists.js', 'src/utils/apologistsLoader.js', 'data.db'] },

  { id: 'quran-tafsir', match: (s) => s[0] === 'quran' && s[3] === 'tafsir',
    sources: ['src/data/quran/commentary', 'src/utils/tafseer_config.js', 'src/pages/quran/[surah]/[ayah]'] },
  { id: 'quran-codex', match: (s) => s[0] === 'quran' && s[1] === 'codex',
    sources: ['src/pages/quran/codex', 'src/data/quran/non_uthmanic', 'src/components/QuranSpecial.astro'] },
  { id: 'quran-variant', match: (s) => s[0] === 'quran' && s[1] === 'variant',
    sources: ['src/pages/quran/variant', 'src/data/quran/qiraat'] },
  { id: 'quran', match: (s) => s[0] === 'quran', sources: ['src/pages/quran', 'src/data/quran', 'data.db'] },

  { id: 'bible', match: (s) => s[0] === 'bible', sources: ['src/pages/bible', 'src/data/scripture', 'data.db'] },
];

let gitState; // undefined = unchecked, false = unusable, true = ok
function gitUsable() {
  if (gitState !== undefined) return gitState;
  try {
    const shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf8' }).trim();
    if (shallow === 'true') {
      console.warn('[sitemap-lastmod] Shallow git clone detected; skipping <lastmod> (set fetch-depth: 0 in CI).');
      gitState = false;
    } else {
      gitState = true;
    }
  } catch {
    console.warn('[sitemap-lastmod] git unavailable; skipping <lastmod>.');
    gitState = false;
  }
  return gitState;
}

const dateCache = new Map();
function lastCommitDate(paths) {
  const key = paths.join('\0');
  if (dateCache.has(key)) return dateCache.get(key);
  let iso;
  try {
    iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...paths], { encoding: 'utf8' }).trim() || undefined;
  } catch {
    iso = undefined;
  }
  dateCache.set(key, iso);
  return iso;
}

const unmatched = [];

/** Returns an ISO date string, or undefined when no rule matches / git is unusable. */
export function resolveLastmod(pathname) {
  if (!gitUsable()) return undefined;
  const segments = pathname.split('/').filter(Boolean);
  const rule = LASTMOD_RULES.find((r) => r.match(segments));
  if (!rule) {
    unmatched.push(pathname);
    return undefined;
  }
  const sources = typeof rule.sources === 'function' ? rule.sources(segments) : rule.sources;
  const iso = lastCommitDate(sources);
  if (!iso) unmatched.push(`${pathname} (rule "${rule.id}": no commits for its sources)`);
  return iso;
}

/** Call once after the sitemap is serialized. */
export function reportUnmatchedLastmod() {
  if (unmatched.length === 0) return;
  console.warn(`[sitemap-lastmod] ${unmatched.length} sitemap URL(s) have no <lastmod>; add a rule in src/utils/sitemap_lastmod.js:`);
  for (const p of unmatched.slice(0, 20)) console.warn(`  - ${p}`);
  if (unmatched.length > 20) console.warn(`  … and ${unmatched.length - 20} more`);
  unmatched.length = 0;
}
