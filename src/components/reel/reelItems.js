/**
 * Builds the reel queue (the props of <PlayAllButton> / openReel) from video rows.
 * Pure and build-time safe: call it in an Astro page's frontmatter.
 *
 * Queue item shape (shared with the apologist pages):
 *   { videoId, apologistName?, verseLabel?, verseHref?, originalUrl? }
 */

/** Labels that are placeholders, not a person: never shown as the speaker. */
const PLACEHOLDER_NAME = /unknown|^christian apologist$/i;

/** @param {unknown} name */
export function displayApologistName(name) {
  const s = typeof name === 'string' ? name.trim() : '';
  return s && !PLACEHOLDER_NAME.test(s) ? s : '';
}

/**
 * @param {Array<Record<string, any>>} videos - Rows in display order (e.g. from enrichVideosWithVerses).
 * @param {{ verseLabel?: string, verseHref?: string }} [context] - The verse these videos belong to.
 * @returns {Array<{ videoId: string, apologistName?: string, verseLabel?: string, verseHref?: string, originalUrl?: string }>}
 */
export function toReelItems(videos, { verseLabel, verseHref } = {}) {
  const seen = new Set();
  const items = [];
  for (const v of videos || []) {
    const videoId = v && (v.video_id || v.videoId);
    if (!videoId || seen.has(videoId)) continue;
    seen.add(videoId);
    const item = { videoId };
    const name = displayApologistName(v.apologist_name ?? v.apologistName);
    if (name) item.apologistName = name;
    if (verseLabel) item.verseLabel = verseLabel;
    if (verseHref) item.verseHref = verseHref;
    const original = v.original_url ?? v.originalUrl;
    if (typeof original === 'string' && /^https:\/\//.test(original)) item.originalUrl = original;
    items.push(item);
  }
  return items;
}
