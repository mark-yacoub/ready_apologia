// Minimal build-time inline markdown renderer for `/discover/divinity-timeline`.
// Supports `**bold**`, `*italic*`, `` `ancient-script / shelfmark` ``, and
// `[label](href)` while HTML-escaping all raw text, rendering Greek/Latin
// nomina sacra overbars, spacing Greek capital breathings cleanly, avoiding
// monospace `<code>` tags in reader-facing prose, and validating every `href`.

import { MD_LINK_URL_SOURCE } from '../markdown.js';
import { sitePath, validateHref } from './config.js';

// Supports one level of editorial brackets in link labels and one level of
// balanced parentheses in URLs without nested-quantifier backtracking.
const LINK_SOURCE = String.raw`\[((?:[^\[\]]|\[[^\[\]]*\])+)\]\((${MD_LINK_URL_SOURCE})\)`;

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatNominaSacraHtml(escapedText) {
  // 1. Replace runs of Greek or Latin characters carrying combining overline
  //    (U+0305) or combining double macron (U+035E) with a continuous CSS
  //    supralinear bar (`<span class="dtl-ns">...</span>`) so neither Greek `Ι̅`
  //    nor Latin-context `I̅H̅ X̅P̅` (Frankfurt silver foil) collides into `Τ`.
  const withBars = String(escapedText).replace(
    /((?:[A-Za-z\u0370-\u03FF\u1F00-\u1FFF][\u0305\u035E])+)/g,
    (match) =>
      `<span class="dtl-ns">${match.replace(/[\u0305\u035E]/g, '')}</span>`,
  );

  // 2. Pad precomposed Greek capital vowels/rho carrying rough or smooth
  //    breathings after whitespace (`Θ(ε)ῷ Ἰ(ησο)ῦ`, `Ἀκεπτοῦς`) so the
  //    overhanging psili/daseia never visually collides into the preceding
  //    glyph, wrapping the full token so a line break never splits the initial
  //    breathing capital from the rest of its word.
  return withBars.replace(
    /(\s)([\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59-\u1F5F\u1F68-\u1F6F\u1FEC][^\s<]*)/g,
    '$1<span class="dtl-br">$2</span>',
  );
}

export function renderPlainEpigraphicHtml(text) {
  return formatNominaSacraHtml(escapeHtml(text));
}

export function renderFormattedEpigraphicHtml(text) {
  return renderFormatting(escapeHtml(text));
}

function renderBacktickSpan(_, inner) {
  if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(inner)) {
    return `<span lang="grc" class="dtl-grc">${inner}</span>`;
  }
  if (/[\u0590-\u05FF]/.test(inner)) {
    return `<span lang="arc" class="dtl-grc">${inner}</span>`;
  }
  return `<span class="dtl-cite">${inner}</span>`;
}

function renderFormatting(escapedText) {
  return formatNominaSacraHtml(
    escapedText
      .replace(/`([^`]+)`/g, renderBacktickSpan)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>'),
  );
}

export function renderInlineMarkdown(markdown, context = 'markdown', anchors = null) {
  const src = String(markdown ?? '');
  const linkRx = new RegExp(LINK_SOURCE, 'g');
  let out = '';
  let lastIndex = 0;
  let match;

  while ((match = linkRx.exec(src)) !== null) {
    out += renderFormatting(escapeHtml(src.slice(lastIndex, match.index)));
    const [, rawLabel, rawHref] = match;
    const check = validateHref(rawHref);
    if (!check.ok) {
      throw new Error(`[${context}] invalid link (${check.reason})`);
    }
    if (check.kind === 'anchor' && anchors) {
      anchors.add(rawHref.slice(1));
    }
    const labelHtml = renderFormatting(escapeHtml(rawLabel));
    const resolvedHref = check.kind.startsWith('internal-')
      ? sitePath(rawHref)
      : rawHref;
    const safeHref = escapeHtml(resolvedHref);
    const attrs =
      check.kind === 'external'
        ? ' target="_blank" rel="noopener noreferrer"'
        : check.kind === 'internal-bible' || check.kind === 'internal-quran'
          ? ' data-astro-prefetch="false"'
          : '';
    out += `<a href="${safeHref}"${attrs}>${labelHtml}</a>`;
    lastIndex = linkRx.lastIndex;
  }

  out += renderFormatting(escapeHtml(src.slice(lastIndex)));
  if (/\]\(/.test(out)) {
    throw new Error(`[${context}] unparsed markdown link syntax in: ${src.slice(0, 80)}`);
  }
  return out;
}

export function extractMarkdownLinks(markdown) {
  const src = String(markdown ?? '');
  const links = [];
  const linkRx = new RegExp(LINK_SOURCE, 'g');
  let match;
  while ((match = linkRx.exec(src)) !== null) {
    links.push({ label: match[1], href: match[2] });
  }
  return links;
}
