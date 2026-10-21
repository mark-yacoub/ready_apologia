/**
 * Markdown → HTML for the Hadith Reliability article.
 *
 * A deliberately small renderer for the exact subset the dataset uses (audited): `###`/`####`
 * headings, paragraphs, `-`/`*` and `1.` lists with indented continuation lines, `***`/`**`/`*`
 * emphasis, `code` spans, `[text](https://…)` links and raw `<br>` inside table cells. Everything
 * else is HTML-escaped. Editorial brackets such as `[years]` or `[7 + 8]` stay literal: a link is
 * only recognised when `](http` follows immediately.
 *
 * Code spans carry three different things in this dataset and are styled accordingly:
 *   - Arabic script                 → `.hrv-ar-inline` (lang="ar", dir="rtl")
 *   - isnād chains / narrator names → `.hrv-chain` (`Ibn ʿAbbās ← ʿIkrimah ← Hishām`)
 *   - arithmetic                    → `.hrv-math` (`40 + 10 + 10 = 60`)
 *
 * Link policy (see `linkFor`): Qurʾān references go to the site's own Tafsir al-Ṭabarī page;
 * everything else opens externally in a new tab (`linkAttrs` is the single policy). Links the
 * verification workflow graded `broken` are rendered as plain text (and reported); `mismatch`
 * verdicts fail the static audit instead.
 */

import { BASE } from './config.js';

const ARABIC_CHAR = '\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF';
const ARABIC_TEST = new RegExp(`[${ARABIC_CHAR}]`);
/** A run of Arabic words, allowing the spaces/punctuation that sit between them. */
const ARABIC_RUN = new RegExp(`(?:«\\s*)?[${ARABIC_CHAR}]+(?:[\\s«»"'(),.:;!?،؛؟…\\-–—ـ]+[${ARABIC_CHAR}]+)*[؟!.»"']?`, 'g');
// Link text may contain one level of editorial brackets: `[Musnad Aḥmad #18478 [ed. #18957]](url)`.
const LINK = /\[((?:[^\[\]]|\[[^\[\]]*\])+)\]\((https?:\/\/[^)\s]+)\)/g;
const CODE = /`([^`]+)`/g;
const PLACEHOLDER = /\u0000(\d+)\u0000/g;

const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const escapeAttr = escapeHtml;

/**
 * The one place that decides how a link opens. External links open in a new tab without leaking the
 * opener or referrer; `nofollow` marks links we list but do not vouch for ("what others are saying").
 * Templates spread the result: `<a href={l.href} {...l.attrs}>`.
 * @returns {{ target?: '_blank', rel?: string }}
 */
export function linkAttrs({ external, nofollow = false }) {
  if (!external) return {};
  return { target: '_blank', rel: nofollow ? 'noopener noreferrer nofollow' : 'noopener noreferrer' };
}

/** `linkAttrs` as an HTML attribute string, for the markdown renderer. */
function attrString(attrs) {
  return Object.entries(attrs).map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join('');
}

/**
 * Resolves a dataset URL to where the site should actually send the reader.
 * @param {string} url
 * @param {{ nofollow?: boolean }} [opts]
 * @returns {{ href: string, external: boolean, kind: 'quran'|'sunnah'|'classical'|'other', host: string, title?: string, attrs: object }}
 */
export function linkFor(url, { nofollow = false } = {}) {
  const make = (link) => ({ ...link, attrs: linkAttrs({ external: link.external, nofollow }) });
  let u;
  try { u = new URL(url); } catch { return make({ href: url, external: true, kind: 'other', host: '' }); }
  const host = u.hostname.replace(/^www\./, '');
  if (host === 'quran.com') {
    const m = u.pathname.match(/^\/(\d+)(?:\/(\d+)(?:-\d+)?)?\/?$/);
    if (m) {
      const [, surah, ayah] = m;
      return make(ayah
        ? { href: `${BASE}/quran/${surah}/${ayah}/tafsir/tabari`, external: false, kind: 'quran', host, title: `Tafsir al-Ṭabarī on Qurʾān ${surah}:${ayah}` }
        : { href: `${BASE}/quran/${surah}`, external: false, kind: 'quran', host, title: `Surah ${surah}` });
    }
  }
  if (host === 'sunnah.com') return make({ href: url, external: true, kind: 'sunnah', host });
  if (/(^|\.)islamweb\.net$|(^|\.)shamela\.ws$|(^|\.)ketabonline\.com$|(^|\.)wikisource\.org$/.test(host)) {
    return make({ href: url, external: true, kind: 'classical', host });
  }
  return make({ href: url, external: true, kind: 'other', host });
}

export function anchor(url, innerHtml, { className = '', blocked } = {}) {
  if (blocked) return `<span class="hrv-unlinked">${innerHtml}</span>`;
  const link = linkFor(url);
  const cls = ['hrv-link', `hrv-link--${link.kind}`, className].filter(Boolean).join(' ');
  const title = link.title ? ` title="${escapeAttr(link.title)}"` : '';
  return `<a class="${cls}" href="${escapeAttr(link.href)}"${attrString(link.attrs)}${title}>${innerHtml}</a>`;
}

function codeSpan(raw) {
  const text = escapeHtml(raw);
  if (ARABIC_TEST.test(raw)) return `<span class="hrv-ar-inline" lang="ar" dir="rtl">${text}</span>`;
  if (/^[\d\s+\-−×=().,/%~≈]+$/.test(raw)) return `<span class="hrv-math">${text}</span>`;
  return `<span class="hrv-chain">${text}</span>`;
}

function emphasis(s) {
  // Bold may contain single-star italics (`**two bowings per *rakʿah***`, `***Ifrād* (Ḥajj Alone)**`),
  // so bold is resolved first and allows lone `*` inside; italics are resolved afterwards.
  return s
    .replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*((?:[^*]|\*(?!\*))+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*(?!\s)([^*]+?)(?<!\s)\*(?![\w*])/g, '$1<em>$2</em>')
    .replace(/(^|[^\w*])\*(?!\s)([^*]+?)(?<!\s)\*(?=<\/strong>)/g, '$1<em>$2</em>');
}

/** ʿayn/hamza → `.hrv-tlm` (Literata gives them a half-em advance; the Arabic face draws them tight). Text nodes only. */
function markTl(html) {
  return html.split(/(<[^>]+>)/g).map(part => (part.startsWith('<') ? part : part.replace(/[ʾʿ]+/g, '<span class="hrv-tlm">$&</span>'))).join('');
}

/** Plain string → safe HTML with transliteration marks fixed (for titles, labels, badges in templates). */
export function tl(text) {
  return markTl(escapeHtml(String(text ?? '')));
}

/** Wraps bare Arabic runs (outside tags and placeholders) so they get the Arabic font and direction. */
function wrapArabic(html) {
  return html.split(/(<[^>]+>|\u0000\d+\u0000)/g).map(part => {
    if (!part || part.startsWith('<') || part.startsWith('\u0000')) return part;
    return part.replace(ARABIC_RUN, m => `<span class="hrv-ar-inline" lang="ar" dir="rtl">${m}</span>`);
  }).join('');
}

/**
 * @param {object} [opts]
 * @param {(url: string) => boolean} [opts.isBlocked]  link verdict gate (blocked → plain text)
 * @param {(url: string) => void}    [opts.onBlocked]  reporting hook
 */
export function createRenderer({ isBlocked = () => false, onBlocked = () => {} } = {}) {
  function inline(md) {
    if (md == null) return '';
    const slots = [];
    const park = html => `\u0000${slots.push(html) - 1}\u0000`;
    let s = String(md).replace(/<br\s*\/?>/gi, () => park('<br>'));
    s = s.replace(CODE, (_, raw) => park(codeSpan(raw)));
    s = escapeHtml(s);
    s = s.replace(LINK, (_, text, url) => {
      const realUrl = url.replace(/&amp;/g, '&');
      const blocked = isBlocked(realUrl);
      if (blocked) onBlocked(realUrl);
      return park(anchor(realUrl, wrapArabic(emphasis(text)), { blocked }));
    });
    s = wrapArabic(emphasis(s));
    // Placeholders can nest (a code span inside link text), so restore until stable.
    let prev;
    do { prev = s; s = s.replace(PLACEHOLDER, (_, i) => slots[Number(i)]); } while (s !== prev);
    return markTl(s);
  }

  function block(md, { headingOffset = 0 } = {}) {
    if (md == null || md === '') return '';
    const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let para = [];
    let list = null; // { tag, items: string[][] }

    const flushPara = () => {
      if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
      para = [];
    };
    const flushList = () => {
      if (!list) return;
      const items = list.items.map(it => `<li>${inline(it.join(' '))}</li>`).join('');
      out.push(`<${list.tag}>${items}</${list.tag}>`);
      list = null;
    };

    for (const raw of lines) {
      const line = raw.replace(/\s+$/, '');
      const heading = line.match(/^(#{2,6})\s+(.*)$/);
      const bullet = line.match(/^\s{0,1}[-*]\s+(.*)$/);
      const ordered = line.match(/^\s{0,1}\d+\.\s+(.*)$/);
      if (!line.trim()) { flushPara(); continue; }
      if (heading) {
        flushPara(); flushList();
        const level = Math.min(6, heading[1].length + headingOffset);
        out.push(`<h${level} class="hrv-md-h">${inline(heading[2])}</h${level}>`);
        continue;
      }
      if (bullet || ordered) {
        flushPara();
        const tag = bullet ? 'ul' : 'ol';
        if (!list || list.tag !== tag) { flushList(); list = { tag, items: [] }; }
        list.items.push([(bullet || ordered)[1]]);
        continue;
      }
      if (list && /^\s{2,}\S/.test(line)) { list.items[list.items.length - 1].push(line.trim()); continue; }
      flushList();
      para.push(line.trim());
    }
    flushPara(); flushList();
    return out.join('\n');
  }

  /** Gate for links rendered outside markdown (chips, sources, showcase): records blocked URLs once. */
  function checkBlocked(url) {
    const blocked = isBlocked(url);
    if (blocked) onBlocked(url);
    return blocked;
  }

  return { inline, block, checkBlocked };
}

/** Markdown → plain text (meta descriptions, JSON-LD, aria labels). */
export function plainText(md) {
  if (md == null) return '';
  return String(md)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(LINK, '$1')
    .replace(CODE, '$1')
    .replace(/\*+/g, '')
    .replace(/\[\[(.+?)\]\]/g, '$1') // showcase highlight markers
    .replace(/^#+\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export { ARABIC_TEST };
