/**
 * View model for /discover/through-christian-eyes: renders the copy in `content.js` to HTML and
 * checks it. Pure and memoised; the page and the homepage card read only from here.
 *
 * Build-time checks (they throw, listing every problem):
 *   - every block has a known `kind`, every "Go deeper" names a known LINKS key;
 *   - section ids are unique, URL-safe anchors;
 *   - every link target is `https://` or a site path (no bare /quran/S/A verse URL);
 *   - no unrendered markup (`**`, `==`, `](`) reaches the HTML;
 *   - our own words (everything outside “…”) pass the playbook's banned-word gate.
 */
import { createRenderer, tl, plainText } from '../hadithReliability/render.js';
import { BASE } from '../hadithReliability/config.js';
import { BODY as TONE_BODY, HEADLINE as TONE_HEADLINE } from '../quranPreservation/tone.js';
import { ASIDE, CLOSING, HERO, HOME_CARD, LABELS, LINKS, SECTIONS, SEO, SLUG } from './content.js';

const KINDS = new Set(['subhead', 'lead', 'entry', 'list', 'answer', 'deeper']);
const md = createRenderer({ rootLinks: true });

/** A quotation from a source, “…”, set in the quotation face. Never spans a tag boundary. */
const QUOTE = /“([^“”<]*(?:<(?!\/?a\b)[^>]*>[^“”<]*)*)”/g;

/** Inline markdown → HTML: links/emphasis via the shared renderer, then highlights and quotations. */
export function inlineHtml(text) {
  return md
    .inline(text)
    .replace(/==([^=]+?)==/g, '<mark class="tce-hl">$1</mark>')
    .replace(QUOTE, '<span class="tce-q">“$1”</span>');
}

/** Any markdown link in the copy: `[label](target)`. */
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Our own voice: the text with every quotation (“…”) removed. */
export const ownVoice = (text) =>
  plainText(String(text).replace(LINK, '$1')).replace(/==/g, '').replace(/“[^”]*”/g, ' ');

/** Copy keys that are data, not reader-facing text (skipped by the tone gate). */
const NOT_COPY = new Set(['id', 'kind', 'link', 'href', 'datePublished', 'keywords']);

/** Every reader-facing string in a copy object, with its path, e.g. `SECTIONS[2].blocks[0].text`. */
function copyStrings(value, at, out = []) {
  if (typeof value === 'string') out.push({ at, text: value });
  else if (Array.isArray(value)) value.forEach((v, i) => copyStrings(v, `${at}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) if (!NOT_COPY.has(k)) copyStrings(v, `${at}.${k}`, out);
  }
  return out;
}

const COPY = { SEO, LABELS, HERO, SECTIONS, ASIDE, CLOSING, HOME_CARD };
/** Copy fields that are titles, headings or SEO: the stricter HEADLINE list applies too. */
const HEADLINE_FIELD = /^(SEO\.(title|description)|HERO\.(h1|subtitle)|SECTIONS\[\d+\]\.title|ASIDE\.title|HOME_CARD\.(title|subtitle)|.*\.label)$/;

/** Every link target written in the copy, in page order. */
const copyLinks = () =>
  copyStrings(COPY, 'COPY').flatMap(({ at, text }) => [...text.matchAll(LINK)].map((m) => ({ at, label: m[1], target: m[2] })));

function lint(model, problems) {
  const ids = new Set();
  for (const s of SECTIONS) {
    if (!/^[a-z0-9-]+$/.test(s.id)) problems.push(`section id "${s.id}" is not a URL-safe anchor`);
    if (ids.has(s.id)) problems.push(`duplicate section id "${s.id}"`);
    ids.add(s.id);
    for (const [i, b] of s.blocks.entries()) {
      if (!KINDS.has(b.kind)) problems.push(`${s.id} block ${i}: unknown kind "${b.kind}"`);
      if (b.kind === 'deeper' && !LINKS[b.link]) problems.push(`${s.id} block ${i}: unknown link "${b.link}"`);
    }
  }
  if (!LINKS[ASIDE.deeper.link]) problems.push(`aside: unknown link "${ASIDE.deeper.link}"`);

  for (const { at, target } of copyLinks()) {
    if (!/^(https:\/\/|\/(?!\/))/.test(target)) problems.push(`${at}: link target "${target}" must be https:// or a site path`);
    if (/^\/quran\/\d+\/\d+\/?$/.test(target)) problems.push(`${at}: Qurʾān link "${target}" has no tab; use a drawer tab (e.g. /tafsir/tabari) or /quran/S#A`);
  }

  const html = JSON.stringify(model);
  for (const leak of ['**', '==', '](']) {
    if (html.includes(leak)) problems.push(`unrendered markup "${leak}" in the HTML`);
  }
  // A quotation the QUOTE pattern could not wrap (e.g. one containing a link) would lose its face silently.
  const opened = (html.match(/“/g) || []).length;
  const styled = (html.match(/class=\\"tce-q\\">“/g) || []).length;
  if (opened !== styled) problems.push(`${opened - styled} quotation(s) “…” not set in the quotation face (a link inside a quotation?)`);

  for (const { at, text } of copyStrings(COPY, 'COPY')) {
    const own = ownVoice(text);
    const field = at.replace(/^COPY\./, '');
    const hit = own.match(TONE_BODY) || (HEADLINE_FIELD.test(field) && own.match(TONE_HEADLINE));
    if (hit) problems.push(`${field}: banned word "${hit[0]}" in our voice: "${text.slice(0, 80)}…"`);
  }
}

function deeper(b) {
  return { href: `${BASE}${LINKS[b.link]}`, path: LINKS[b.link], labelHtml: tl(b.label) };
}

function block(b) {
  switch (b.kind) {
    case 'subhead':
    case 'lead':
    case 'answer':
      return { kind: b.kind, html: inlineHtml(b.text) };
    case 'entry':
    case 'list':
      return {
        kind: b.kind,
        html: inlineHtml(`${b.lead ? `**${b.lead}**` : ''}${b.text || ''}`),
        items: (b.items || []).map(inlineHtml),
      };
    case 'deeper':
      return { kind: b.kind, ...deeper(b) };
    default:
      return { kind: b.kind };
  }
}

let cached = null;

/** @returns the page's view model (memoised). Throws once, listing every problem. */
export function loadThroughChristianEyes() {
  if (cached) return cached;
  const sections = SECTIONS.map((s, i) => ({
    id: s.id,
    number: i + 1,
    titleHtml: tl(s.title),
    titleText: s.title,
    claimHtml: s.claim ? inlineHtml(s.claim) : null,
    leadHtml: s.lead ? inlineHtml(s.lead) : null,
    pull: s.pull ? { quoteHtml: inlineHtml(s.pull.quote), citeHtml: inlineHtml(s.pull.cite) } : null,
    blocks: s.blocks.map(block),
  }));
  const model = {
    slug: SLUG,
    path: `/discover/${SLUG}`,
    seo: SEO,
    labels: LABELS,
    hero: {
      kicker: HERO.kicker,
      h1Html: tl(HERO.h1),
      h1Text: HERO.h1,
      subtitleHtml: tl(HERO.subtitle),
      subtitleText: HERO.subtitle,
      introHtml: HERO.intro.map(inlineHtml),
      sourcesLabel: HERO.sourcesLabel,
      sourcesHtml: tl(HERO.sources),
    },
    sections,
    aside: { titleHtml: inlineHtml(ASIDE.title), html: inlineHtml(ASIDE.text), deeper: deeper(ASIDE.deeper) },
    closing: {
      inviteHtml: inlineHtml(CLOSING.invite),
      readGospel: { href: `${BASE}${CLOSING.readGospel.href}`, label: CLOSING.readGospel.label },
      label: CLOSING.label,
    },
    /** Every site path the page links to (for the built-HTML audit). */
    internalPaths: [...new Set([
      ...Object.values(LINKS),
      CLOSING.readGospel.href,
      ...copyLinks().map((l) => l.target).filter((t) => t.startsWith('/')),
    ])],
  };
  const problems = [];
  lint(model, problems);
  if (problems.length) {
    throw new Error(`[throughChristianEyes] ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  }
  cached = model;
  return model;
}

/** Article + BreadcrumbList JSON-LD. */
export function pageSchema({ site, model }) {
  const url = `${site}${BASE}${model.path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: `${model.hero.h1Text}: ${model.hero.subtitleText}`,
        description: model.seo.description,
        url,
        mainEntityOfPage: url,
        datePublished: model.seo.datePublished,
        inLanguage: 'en',
        author: { '@type': 'Organization', name: 'Ready Apologia', url: `${site}${BASE}/` },
        publisher: { '@type': 'Organization', name: 'Ready Apologia', logo: { '@type': 'ImageObject', url: `${site}${BASE}/assets/logo.png` } },
        about: [
          { '@type': 'Thing', name: 'Christianity', sameAs: 'https://www.wikidata.org/wiki/Q5043' },
          { '@type': 'Thing', name: 'Islam', sameAs: 'https://www.wikidata.org/wiki/Q432' },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ready Apologia', item: `${site}${BASE}/` },
          { '@type': 'ListItem', position: 2, name: 'Discover', item: `${site}${BASE}/discover` },
          { '@type': 'ListItem', position: 3, name: model.hero.h1Text, item: url },
        ],
      },
    ],
  };
}
