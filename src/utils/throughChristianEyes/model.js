/**
 * View model for /discover/through-christian-eyes: renders the copy in `content.js` to HTML and
 * validates every editorial and structural invariant. Pure and memoised; the page and the homepage
 * card read only from here.
 *
 * Build-time checks (they throw once, listing every problem with its exact field path):
 *   - every block has a known `kind`, every "Go deeper" names a known LINKS key;
 *   - section ids are unique, URL-safe anchors;
 *   - every link target is `https://` or a site path (no bare /quran/S/A verse URL);
 *   - no unrendered markup (`**`, `==`, `](`, `` ` ``) reaches any HTML field;
 *   - every quotation “…” is balanced and wrapped in `.tce-q`;
 *   - our own words (everything outside “…”) pass the playbook's banned-word gate (incl. print-only fields).
 */
import { createRenderer, tl, plainText } from '../hadithReliability/render.js';
import { BASE } from '../hadithReliability/config.js';
import { BODY as TONE_BODY, HEADLINE as TONE_HEADLINE } from '../quranPreservation/tone.js';
import { ASIDE, CATALOG, CLOSING, HERO, HOME_CARD, LABELS, LINKS, SECTIONS, SEO, SITE_HOST, SLUG } from './content.js';

const KINDS = new Set(['subhead', 'lead', 'entry', 'list', 'answer', 'deeper']);
const PANELS = new Set(['p2', 'p3', 'back']);
const md = createRenderer({ rootLinks: true });

/** A quotation from a source, “…”, set in the quotation face. Never spans an `<a>` boundary. */
const QUOTE = /“([^“”<]*(?:<(?!\/?a\b)[^>]*>[^“”<]*)*)”/g;

/**
 * Inline markdown → HTML: links/emphasis/Arabic via the shared renderer, then lift parentheses around
 * `ﷺ` into the upright Arabic span (avoiding nested spans or italicised parens inside `.tce-q`), plus
 * highlights and quotations.
 */
export function inlineHtml(text) {
  return md
    .inline(text)
    .replace(/\(<span class="hrv-ar-inline"([^>]*)>ﷺ<\/span>\)/g, '<span class="hrv-ar-inline"$1>(ﷺ)</span>')
    .replace(/==([^=]+?)==/g, '<mark class="tce-hl">$1</mark>')
    .replace(QUOTE, '<span class="tce-q">“$1”</span>');
}

/** Bracket-safe markdown link in the copy (supports one level of editorial `[…]` inside the label, matching render.js). */
export const COPY_LINK_RE = /\[((?:[^\[\]]|\[[^\[\]]*\])+)\]\(([^)\s]+)\)/g;

/** Our own voice: the text with every quotation (“…”) removed. */
export const ownVoice = (text) =>
  plainText(String(text).replace(COPY_LINK_RE, '$1')).replace(/==/g, '').replace(/“[^”]*”/g, ' ');

/** Copy keys that carry metadata/layout rather than reader-facing prose (skipped by the tone gate). */
const NOT_COPY = new Set([
  'id', 'kind', 'link', 'href', 'datePublished', 'keywords',
  'panel', 'side', 'qrSpan', 'pdfSize', 'slidesSize',
  'category', 'subcategory', 'slug', 'thumbnail', 'site',
]);

/** Every reader-facing string in a copy object, with its path, e.g. `SECTIONS[2].blocks[0].text`. */
function copyStrings(value, at, out = []) {
  if (typeof value === 'string') out.push({ at, text: value });
  else if (Array.isArray(value)) value.forEach((v, i) => copyStrings(v, `${at}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) if (!NOT_COPY.has(k)) copyStrings(v, `${at}.${k}`, out);
  }
  return out;
}

const DEFAULT_COPY = {
  SLUG, SITE_HOST, LINKS, SEO, CATALOG, LABELS, HERO, SECTIONS, ASIDE, CLOSING, HOME_CARD,
};

/** Copy fields that are titles, headings, labels or SEO/catalog copy: the stricter HEADLINE list applies too. */
const HEADLINE_FIELD = /^(SEO\.(title|description)|CATALOG\.(title|description)|HERO\.(h1|subtitle|printSubtitle)|SECTIONS\[\d+\]\.title|ASIDE\.title|HOME_CARD\.(title|subtitle)|.*\.label)$/;

/** Every link target written in the copy (both inline `[label](target)` and structured `href`), in page order. */
function copyLinks(copy) {
  const inline = copyStrings(copy, 'COPY').flatMap(({ at, text }) =>
    [...text.matchAll(COPY_LINK_RE)].map((m) => ({ at: at.replace(/^COPY\./, ''), label: m[1], target: m[2] })),
  );
  const structured = [];
  copy.SECTIONS.forEach((s, si) => {
    s.blocks.forEach((b, bi) => {
      if (b.webMore) {
        structured.push({ at: `SECTIONS[${si}].blocks[${bi}].webMore.href`, label: b.webMore.label, target: b.webMore.href });
      }
    });
  });
  if (copy.CLOSING?.readGospel?.href) {
    structured.push({ at: 'CLOSING.readGospel.href', label: copy.CLOSING.readGospel.label, target: copy.CLOSING.readGospel.href });
  }
  return [...inline, ...structured];
}

/** Collects every rendered HTML string in the built view model with its path `at` for leak & quote checks. */
function htmlFields(value, at, out = []) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => {
      if (typeof v === 'string') out.push({ at: `${at}[${i}]`, html: v });
      else htmlFields(v, `${at}[${i}]`, out);
    });
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === 'string' && (k === 'html' || k.endsWith('Html'))) out.push({ at: `${at}.${k}`, html: v });
      else if (Array.isArray(v) && (k === 'paras' || k === 'items' || k.endsWith('Html'))) htmlFields(v, `${at}.${k}`, out);
      else if (v && typeof v === 'object') htmlFields(v, `${at}.${k}`, out);
    }
  }
  return out;
}

function lint(copy, model, problems) {
  const ids = new Set();
  for (const s of copy.SECTIONS) {
    if (!/^[a-z0-9-]+$/.test(s.id)) problems.push(`section id "${s.id}" is not a URL-safe anchor`);
    if (ids.has(s.id)) problems.push(`duplicate section id "${s.id}"`);
    ids.add(s.id);
    if (s.panel && !PANELS.has(s.panel)) problems.push(`${s.id}: unknown panel "${s.panel}"`);
    for (const [i, b] of s.blocks.entries()) {
      if (!KINDS.has(b.kind)) problems.push(`${s.id} block ${i}: unknown kind "${b.kind}"`);
      if (b.kind === 'deeper' && !copy.LINKS[b.link]) problems.push(`${s.id} block ${i}: unknown link "${b.link}"`);
    }
  }
  if (!copy.LINKS[copy.ASIDE.deeper.link]) problems.push(`aside: unknown link "${copy.ASIDE.deeper.link}"`);

  for (const { at, target } of copyLinks(copy)) {
    if (!/^(https:\/\/|\/(?!\/))/.test(target)) problems.push(`${at}: link target "${target}" must be https:// or a site path`);
    if (/^\/quran\/\d+\/\d+\/?$/.test(target)) problems.push(`${at}: Qurʾān link "${target}" has no tab; use a drawer tab (e.g. /tafsir/tabari) or /quran/S#A`);
  }

  for (const { at, html } of htmlFields(model, 'model')) {
    for (const leak of ['**', '==', '](', '`']) {
      if (html.includes(leak)) problems.push(`${at}: unrendered markup "${leak}" in HTML`);
    }
    const opened = (html.match(/“/g) || []).length;
    const closed = (html.match(/”/g) || []).length;
    const styled = (html.match(/<span class="tce-q">“/g) || []).length;
    if (opened !== closed) problems.push(`${at}: unbalanced curly quotes (${opened} “ vs ${closed} ”)`);
    else if (opened !== styled) problems.push(`${at}: ${opened - styled} quotation(s) “…” not set in the quotation face (a link inside a quotation?)`);
  }

  const proseRoot = {
    SEO: copy.SEO, CATALOG: copy.CATALOG, LABELS: copy.LABELS, HERO: copy.HERO,
    SECTIONS: copy.SECTIONS, ASIDE: copy.ASIDE, CLOSING: copy.CLOSING, HOME_CARD: copy.HOME_CARD,
  };
  for (const { at, text } of copyStrings(proseRoot, 'COPY')) {
    const own = ownVoice(text);
    const field = at.replace(/^COPY\./, '');
    const hit = own.match(TONE_BODY) || (HEADLINE_FIELD.test(field) && own.match(TONE_HEADLINE));
    if (hit) problems.push(`${field}: banned word "${hit[0]}" in our voice: "${text.slice(0, 80)}…"`);
  }
}

function deeper(links, b) {
  return { href: `${BASE}${links[b.link]}`, path: links[b.link], labelHtml: tl(b.label) };
}

function renderBlock(links, b) {
  switch (b.kind) {
    case 'subhead':
    case 'lead':
      return { kind: b.kind, html: inlineHtml(b.text) };
    case 'answer':
      return { kind: 'answer', paras: b.text.split(/\n\n+/).map(inlineHtml) };
    case 'entry':
    case 'list': {
      const moreMd = b.webMore ? ` [${b.webMore.label}](${b.webMore.href}).` : '';
      return {
        kind: b.kind,
        html: inlineHtml(`${b.lead ? `**${b.lead}**` : ''}${b.text || ''}${moreMd}`),
        items: (b.items || []).map(inlineHtml),
      };
    }
    case 'deeper':
      return { kind: 'deeper', ...deeper(links, b) };
    default:
      return { kind: b.kind };
  }
}

/** Builds and validates a view model from `copy` (exported for negative guardrail unit tests). */
export function buildThroughChristianEyes(copy = DEFAULT_COPY) {
  const sections = copy.SECTIONS.map((s, i) => ({
    id: s.id,
    number: i + 1,
    titleHtml: tl(s.title),
    titleText: s.title,
    claimHtml: s.claim ? inlineHtml(s.claim) : null,
    leadHtml: s.lead ? inlineHtml(s.lead) : null,
    pull: s.pull ? { quoteHtml: inlineHtml(s.pull.quote), citeHtml: inlineHtml(s.pull.cite) } : null,
    blocks: s.blocks.map((b) => renderBlock(copy.LINKS, b)),
  }));
  const model = {
    slug: copy.SLUG,
    siteHost: copy.SITE_HOST,
    path: `/discover/${copy.SLUG}`,
    seo: copy.SEO,
    catalog: copy.CATALOG,
    labels: copy.LABELS,
    hero: {
      kicker: copy.HERO.kicker,
      h1Html: tl(copy.HERO.h1),
      h1Text: copy.HERO.h1,
      subtitleHtml: tl(copy.HERO.subtitle),
      subtitleText: copy.HERO.subtitle,
      introHtml: copy.HERO.intro.map(inlineHtml),
      sourcesLabel: copy.HERO.sourcesLabel,
      sourcesHtml: tl(copy.HERO.sources),
    },
    homeCard: {
      eyebrow: copy.HOME_CARD.eyebrow,
      titleHtml: inlineHtml(copy.HOME_CARD.title),
      subtitleHtml: inlineHtml(copy.HOME_CARD.subtitle),
      bodyHtml: inlineHtml(copy.HOME_CARD.body),
      cta: copy.HOME_CARD.cta,
    },
    sections,
    aside: {
      titleHtml: inlineHtml(copy.ASIDE.title),
      html: inlineHtml(copy.ASIDE.text),
      deeper: deeper(copy.LINKS, copy.ASIDE.deeper),
    },
    closing: {
      inviteHtml: inlineHtml(copy.CLOSING.invite),
      readGospel: { href: `${BASE}${copy.CLOSING.readGospel.href}`, label: copy.CLOSING.readGospel.label },
      label: copy.CLOSING.label,
    },
    /** Every site path the page links to (for the built-HTML audit). */
    internalPaths: [...new Set([
      ...Object.values(copy.LINKS),
      ...copyLinks(copy).map((l) => l.target).filter((t) => t.startsWith('/')),
    ])],
  };
  const problems = [];
  lint(copy, model, problems);
  if (problems.length) {
    throw new Error(`[throughChristianEyes] ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  }
  return model;
}

let cached = null;

/** @returns the page's view model (memoised). Throws once, listing every problem. */
export function loadThroughChristianEyes() {
  if (!cached) cached = buildThroughChristianEyes(DEFAULT_COPY);
  return cached;
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
