/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *  DISCOVER AUDIO REGISTRY: which Discover page has a "listen to this article" audio overview.
 *  This is the ONLY place an episode is declared. Everything else (icon, player, lock-screen
 *  controls, resume, sitemap lastmod, tests) is automatic for every Discover page.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 *  TO ADD OR REPLACE AN EPISODE, run exactly one command (do not encode by hand, do not edit any
 *  other file, do not hand-edit the managed block below):
 *
 *      node scripts/add_discover_audio.mjs <page-path> <input-audio-file>
 *
 *      e.g. node scripts/add_discover_audio.mjs quran-preservation ~/Downloads/Episode.m4a
 *           node scripts/add_discover_audio.mjs hadith-reliability/<case-slug> ~/Downloads/Case.m4a
 *
 *  <page-path> is the page URL after "/discover/" (no leading or trailing slash).
 *
 *  What the script does:
 *    1. Converts the input to AAC **MONO**, 64 kbps, 44.1 kHz, loudness -16 LUFS, `+faststart`.
 *       Mono is mandatory: these are spoken-word podcasts, stereo doubles the download for no
 *       audible gain (a 73 MB stereo file becomes ~19 MB). `+faststart` puts the index at the start
 *       of the file so playback and seeking begin before the download finishes (Safari needs it).
 *    2. Writes public/media/audio/<page-path>.m4a (the path is derived from the key; never set it).
 *    3. Upserts the entry below: `durationSec` from ffprobe; `version` 1 for a new episode, +1 when
 *       replacing one (the version is part of the listener's resume key, so a new recording does
 *       not resume at a position from the old one).
 *
 *  Then verify:   npm run test:discover-audio          (files, mono, duration, page exists)
 *                 astro build && npm run audit:discover-audio   (rendered page has icon + player)
 *
 *  Optional per entry: `cover: '/media/…'` = lock-screen artwork (square-ish image). Without it the
 *  site logo is used. Pass `--cover /media/…` to the script to set it. Never use an image that
 *  depicts the Prophet (see convenient-revelations OG_IMAGE note in JETSKI.md).
 *
 *  Player title = the page's own <h1> (read at runtime), so it always matches the article.
 */
/** Site base ('' at the root; undefined under plain node, e.g. tests and scripts). */
const SITE_BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');

export const DISCOVER_AUDIO = {
  // @audio-entries-start (managed by scripts/add_discover_audio.mjs: one line per page, sorted)
  'divinity-timeline': { durationSec: 3356, version: 1, cover: '/media/divinity_timeline/megiddo_mosaic/image_1.jpg' },
  'quran-preservation': { durationSec: 2267, version: 1, cover: '/media/quran_preservation/cover.jpg' },
  // @audio-entries-end
};

export const DEFAULT_COVER = '/assets/logo.png';
export const audioSrcFor = key => `/media/audio/${key}.m4a`;

/** Registry entry → the episode the player needs (paths without the site base). */
export function episodeFor(key) {
  const e = DISCOVER_AUDIO[key];
  if (!e) return null;
  return { key, id: `${key}@v${e.version}`, src: audioSrcFor(key), cover: e.cover || DEFAULT_COVER, durationSec: e.durationSec };
}

/** "/ready_apologia/discover/hadith-reliability/x/" → "hadith-reliability/x"; non-Discover → null. */
export function audioKeyFromPath(pathname, base = SITE_BASE) {
  let p = pathname || '';
  const b = (base || '').replace(/\/$/, '');
  if (b && p.startsWith(b + '/')) p = p.slice(b.length);
  const m = /^\/discover\/(.+?)\/?(?:index\.html)?$/.exec(p);
  return m ? m[1] : null;
}

export const audioForPath = (pathname, base) => {
  const key = audioKeyFromPath(pathname, base);
  return key ? episodeFor(key) : null;
};

export const AUDIO_LABELS = {
  open: 'Listen to this article',
  fab: 'Listen',
  note: 'Listen to the article: a podcast-style overview made with Google NotebookLM',
  kicker: 'Audio overview',
  coverAlt: 'Cover image of the audio overview',
  play: 'Play',
  pause: 'Pause',
  back: 'Back 10 seconds',
  forward: 'Forward 10 seconds',
  speed: 'Playback speed',
  seek: 'Seek',
  positionOf: '{t} of {d}',
  toggleRemaining: 'Show elapsed or remaining time',
  minimise: 'Minimise player',
  expand: 'Open player',
  close: 'Close player',
  resume: 'Resume from',
  restart: 'Start over',
  reconnecting: 'Reconnecting…',
  loadError: 'The audio could not be loaded. Check your connection and try again.',
};

/** 2267 → "37:47"; 3700 → "1:01:40". */
export function fmtClock(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? `${h}:` : ''}${mm}:${String(r).padStart(2, '0')}`;
}

/** 2267 → "38 min". */
export const fmtMinutes = sec => `${Math.max(1, Math.round(sec / 60))} min`;
