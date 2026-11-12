/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *  DISCOVER AUDIO REGISTRY: which Discover page has a "listen to this article" audio overview.
 *  This is the ONLY place an episode is declared. Everything else (icon, player, lock-screen
 *  controls, resume, sitemap lastmod, tests) is automatic for every Discover page.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 *  ADD OR REPLACE AN EPISODE (<page-path> = the page URL after "/discover/", e.g.
 *  quran-preservation or hadith-reliability/<case>):
 *
 *  1. Encode. MONO is mandatory: these are spoken-word podcasts and stereo doubles the download
 *     for no audible gain (73 MB stereo → ~19 MB). +faststart puts the index first so playback and
 *     seeking start before the download ends (Safari needs it). -16 LUFS = podcast loudness.
 *
 *       ffmpeg -i <input> -vn -ac 1 -c:a aac -b:a 64k -ar 44100 \
 *         -af loudnorm=I=-16:TP=-1.5:LRA=11 -movflags +faststart -map_metadata -1 \
 *         public/media/audio/<page-path>.m4a
 *
 *  2. Get the duration:  ffprobe -v error -show_entries format=duration -of csv=p=0 <that file>
 *
 *  3. Add ONE line between the markers below, in this exact shape, kept in alphabetical order:
 *       '<page-path>': { durationSec: <rounded seconds>, version: 1, cover: '/media/…' },
 *     - cover (optional) = lock-screen artwork: use the article's OG image (its config OG_IMAGE).
 *       Omit it to show the site logo. Never an image that depicts the Prophet
 *       (convenient-revelations has OG_IMAGE = null for that reason: omit cover there).
 *     - REPLACING an episode: overwrite the file and bump `version` by 1. The version is part of
 *       the listener's resume key, so a new recording does not resume at a point from the old one.
 *
 *  4. Verify:  npm run test:discover-audio            (page exists, file is mono AAC ≤80 kbps,
 *                                                       faststart, duration matches, line shape)
 *              astro build && npm run audit:discover-audio   (page renders player + open button)
 *
 *  Player title = the page's own <h1> (read at runtime), so it always matches the article.
 *  Open button: the page's bar <AudioButton> or the <AudioListen> under its <h1> (see JETSKI.md).
 */
/** Site base ('' at the root; undefined under plain node, e.g. tests and scripts). */
const SITE_BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');

export const DISCOVER_AUDIO = {
  // @audio-entries-start (one line per page, alphabetical, exact shape above)
  'convenient-revelations': { durationSec: 3585, version: 1 },
  'divinity-timeline': { durationSec: 3356, version: 1, cover: '/media/divinity_timeline/megiddo_mosaic/image_1.jpg' },
  'extrabiblical-evidence-for-jesus': { durationSec: 3508, version: 1, cover: '/media/extrabiblical_evidence/cover.jpg' },
  'from-mecca-to-medina': { durationSec: 2515, version: 1, cover: '/media/mecca_to_medina/cover.jpg' },
  'hadith-reliability': { durationSec: 2780, version: 1, cover: '/media/hadith_reliability/cover.jpg' },
  'islamic-dilemma': { durationSec: 2275, version: 1, cover: '/media/islamic_dilemma/cover.jpg' },
  'muhammad-and-slavery': { durationSec: 3061, version: 1, cover: '/media/slavery/cover.jpg' },
  'origins-of-revelation': { durationSec: 2651, version: 1, cover: '/media/demonic_revelation/cover.jpg' },
  'quran-preservation': { durationSec: 2267, version: 1, cover: '/media/quran_preservation/cover.jpg' },
  'trustworthiness-of-the-bible': { durationSec: 2918, version: 1, cover: '/media/trustworthiness_bible/cover.jpg' },
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
  listen: 'Listen',
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
  resumeLeft: 'Resume · {m} min left',
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
