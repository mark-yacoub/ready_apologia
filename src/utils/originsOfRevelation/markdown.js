/**
 * Markdown → HTML for /discover/origins-of-revelation, on top of the hadith-reliability renderer.
 *
 * Copy (`*Md` fields): `*em*`, `**strong**`, `[text](href)`. Every link is resolved here, not by the
 * shared renderer, so one policy applies: internal hrefs get BASE and are validated (Bible book ids,
 * tafsir routes, in-page anchors), external links must pass config.HOSTS (https only), hadith-looking
 * link text must point at Sunnah.com, and external links get `linkAttrs` (new tab, noopener).
 *
 * Quotations (data and EXTRA_QUOTES texts) render with emphasis only: link syntax inside a quotation
 * stays literal text, a backtick used as an ASCII ʿayn before a letter displays as ʿ ("Ibn `Abbas"),
 * any other backtick stays a literal backtick, and the data's escaped apostrophe (`\'`) shows as '.
 */

import { createRenderer, escapeAttr, plainText, linkAttrs } from '../hadithReliability/render.js';
import { refFromHref, fail } from './refs.js';

const renderer = createRenderer();
const LINK = /\[((?:[^\[\]]|\[[^\[\]]*\])+)\]\(([^)\s]+)\)/g;
const SLOT = /\u0001(\d+)\u0001/g;

const attrString = attrs => Object.entries(attrs).map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join('');

/** One anchor builder for every link the model emits. */
export function anchorHtml(ref, innerHtml) {
  const cls = ref.external ? 'hrv-link hrv-link--external' : 'hrv-link hrv-link--internal';
  return `<a class="${cls}" href="${escapeAttr(ref.href)}"${attrString(linkAttrs({ external: ref.external }))}>${innerHtml}</a>`;
}

/**
 * @param {{ anchors?: Set<string>, where?: string }} ctx  `anchors` collects in-page targets (checked
 *   by the model once every id is known)
 */
function withLinks(src, render, ctx = {}) {
  if (src == null || src === '') return '';
  const slots = [];
  const parked = String(src).replace(LINK, (_, text, href) => {
    const label = plainText(text);
    let ref;
    if (href.startsWith('#')) { ctx.anchors?.add(href.slice(1)); ref = { href, external: false }; }
    else ref = refFromHref(href, label, ctx.where || 'markdown link');
    return `\u0001${slots.push(anchorHtml(ref, mdInline(text, ctx))) - 1}\u0001`;
  });
  const html = render(parked).replace(SLOT, (_, i) => slots[Number(i)]);
  if (/\]\(/.test(html)) fail(`${ctx.where || 'markdown'}: unparsed link syntax in "${String(src).slice(0, 80)}"`);
  return html;
}
export const mdInline = (s, ctx) => withLinks(s, renderer.inline, ctx);
export const mdBlock = (s, ctx) => withLinks(s, renderer.block, ctx);

/** The data escapes apostrophes inside double quotes (`\'`, Matt 4:6). */
export const unescapeQuote = s => String(s).replace(/\\'/g, "'");

/** Quotation → HTML (emphasis only; see the file header). The stored text stays verbatim. */
export function quoteHtml(text) {
  const s = unescapeQuote(text)
    .replace(/`(?=\p{L})/gu, 'ʿ')
    .replace(/`/g, '\u0002')
    .replace(/\]\(/g, ']\u0003(');
  return renderer.inline(s).replace(/\u0002/g, '`').replace(/\u0003/g, '');
}

/** Removes anchors (for copy rendered inside another link: glance rows, the header context row). */
export const unlink = html => String(html).replace(/<\/?a\b[^>]*>/g, '');
