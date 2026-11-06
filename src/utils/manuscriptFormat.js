/**
 * Isomorphic manuscript date, name, location, and title formatting helpers.
 * Pure JS (no node: imports) so React client islands (ManuscriptCarousel, QuranManuscriptCarousel)
 * and server-side SEO resolvers can share a single source of truth.
 */
import { fitText, formatList } from './seo/text.js';

/**
 * Formats an integer historical year: negative = BC (e.g. -150 -> "150 BC"),
 * non-negative = AD (e.g. 200 -> "AD 200").
 * Note: Diffing seoFactory.js, ManuscriptCarousel.jsx, and QuranManuscriptCarousel.jsx showed
 * identical output for all dates (the "~" prefix in carousel share/spec strings is in the JSX caller).
 *
 * @param {number|string|null|undefined} dateVal
 * @returns {string}
 */
export const formatDate = (dateVal) => {
  if (dateVal === null || dateVal === undefined || dateVal === '') return 'Unknown';
  const n = parseInt(dateVal, 10);
  if (isNaN(n)) return String(dateVal);
  return n < 0 ? `${Math.abs(n)} BC` : `AD ${n}`;
};

export const formatMsDateRange = (ms) => {
  const e = ms?.earliest_date !== null && ms?.earliest_date !== undefined && ms?.earliest_date !== '' ? parseInt(ms.earliest_date, 10) : NaN;
  const l = ms?.latest_date !== null && ms?.latest_date !== undefined && ms?.latest_date !== '' ? parseInt(ms.latest_date, 10) : NaN;
  if (!isNaN(e) && !isNaN(l) && e !== l) {
    if (e < 0 && l < 0) return `c. ${Math.abs(e)}–${Math.abs(l)} BC`;
    if (e >= 0 && l >= 0) return `c. AD ${e}–${l}`;
    return `c. ${formatDate(e)}–${formatDate(l)}`;
  }
  if (!isNaN(e)) return `c. ${formatDate(e)}`;
  if (!isNaN(l)) return `c. ${formatDate(l)}`;
  return ms?.date_range_english || 'ancient period';
};

export const cleanMsName = (ms) =>
  String(ms?.name || ms?.ms_id || '')
    .replace(/\s*\(Scan\s+\d+\)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

export const conciseMsName = (ms) => {
  let n = cleanMsName(ms)
    .replace(/\s*\[=[^\]]*\]/g, '')
    .replace(/\s*\[Scriptio Inferior\]/gi, '')
    .replace(/\s*\([^)]{20,}\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (n.includes(' — ')) {
    const [head, tail] = n.split(' — ').map(s => s.trim());
    n = tail && tail.length <= 16 ? `${head} (${tail})` : head;
  }
  const parts = n.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 3 && n.length > 48) {
    n = `${parts[0]}, ${parts[parts.length - 1]}`;
  }
  return n;
};

export const shortMsNameForTitle = (ms) => {
  let n = conciseMsName(ms)
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (n.includes(' — ')) n = n.split(' — ')[0].trim();
  if (n.includes(' / ')) n = n.split(' / ')[0].trim();
  const parts = n.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    n = last.toLowerCase().includes(first.toLowerCase()) ? last : `${first} ${last}`;
  }
  return n;
};

export const conciseLocation = (loc) =>
  String(loc || '')
    .split(' / ')[0]
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const getUniqueManuscripts = (manuscripts) =>
  Array.from(new Map((manuscripts || []).map(m => [m.ms_id, m])).values());

export const buildManuscriptLocationAndDates = (ms, isNT) => {
  let details = [];
  if (!isNT) {
    if (ms.language) details.push(`is written in ${ms.language}`);
    if (ms.form && ms.material) details.push(`was crafted as a ${ms.form.toLowerCase()} from ${ms.material.toLowerCase()}`);
    else if (ms.form) details.push(`was crafted as a ${ms.form.toLowerCase()}`);
    else if (ms.material) details.push(`was crafted from ${ms.material.toLowerCase()}`);
  }
  const dateRange = formatMsDateRange(ms);
  if (dateRange && dateRange !== 'ancient period') details.push(`dates to ${dateRange}`);
  else if (ms.date_range_english) details.push(`dates back to ${ms.date_range_english}`);
  if (ms.script_style) details.push(`features the ${ms.script_style} script style`);

  let text = '';
  if (details.length > 0) text += ` It ${formatList(details)}.`;
  if (ms.found_location) text += ` Originally discovered in ${ms.found_location},`;
  if (ms.current_location) {
    text += ` ${ms.found_location ? 'it' : 'It'} is currently housed at ${ms.current_location}.`;
  } else if (ms.found_location) {
    text += `.`;
  }
  return text;
};

/**
 * Manuscript tab title that names the manuscripts, so a search for
 * "Papyrus 66 John 1:1" or "Codex Sinaiticus John 1" can match the page title.
 * e.g. "John 1:1 Manuscripts: Papyrus 66, Papyrus 75 & 5 More" (kept to ≤60 chars).
 */
export const buildManuscriptTitle = (verseRef, uniqueMs, fallback) => {
  const names = (uniqueMs || []).map(shortMsNameForTitle).filter(Boolean);
  if (names.length === 0) return fallback;
  const prefix = `${verseRef} Manuscripts: `;
  const MAX = 60;
  const shown = [names[0]];
  for (const n of names.slice(1)) {
    const rest = names.length - shown.length - 1;
    const candidate = prefix + [...shown, n].join(', ') + (rest > 0 ? ` & ${rest} More` : '');
    if (candidate.length > MAX) break;
    shown.push(n);
  }
  const more = names.length - shown.length;
  let full;
  if (more === 0 && shown.length > 1) {
    full = `${prefix}${shown.slice(0, -1).join(', ')} & ${shown[shown.length - 1]}`;
  } else {
    full = `${prefix}${shown.join(', ')}${more > 0 ? ` & ${more} More` : ''}`;
  }
  if (full.length <= MAX) return full;

  // If even a single manuscript name pushes the title past 60 chars, strip leading "Codex "/"The " or fit cleanly.
  const suffix = more > 0 ? ` & ${more} More` : '';
  const strippedFirst = shown[0].replace(/^(?:The|Codex)\s+/i, '');
  if (`${prefix}${strippedFirst}${suffix}`.length <= MAX) {
    return `${prefix}${strippedFirst}${suffix}`;
  }
  const avail = MAX - prefix.length - suffix.length;
  if (avail >= 8) {
    return `${prefix}${fitText(strippedFirst, avail)}${suffix}`;
  }
  const shortPrefix = `${verseRef} MSS: `;
  return `${shortPrefix}${fitText(strippedFirst, MAX - shortPrefix.length - suffix.length)}${suffix}`;
};
