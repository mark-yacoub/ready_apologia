/**
 * Shared splitter for long-form scholarly Markdown authored as:
 *
 *   <intro / abstract paragraphs>
 *   ---
 *   ### 1. First Section Title
 *   ...
 *   ### 2. Second Section Title
 *   ...
 *
 * Used by both the Scientific Errors and Debunking Miracles loaders so the two
 * tabs parse their content identically.
 */

const SECTION_HEADING_RE = /^###\s+(\d+)\.\s+(.+)$/gm;

/** Removes a leading and/or trailing `---` horizontal rule that only served as a visual divider. */
function trimDividers(markdown) {
  return markdown
    .replace(/^\s*---\s*\n+/, '')
    .replace(/(?:^|\n+)\s*---\s*$/, '')
    .trim();
}

/**
 * @param {string} markdown - Full body Markdown
 * @param {object} options
 * @param {string} options.idPrefix - Anchor id prefix; section ids become `${idPrefix}-${number}`
 * @param {(num: number, title: string) => string} options.deriveShortLabel - TOC pill label builder
 * @returns {{ introMarkdown: string, sections: Array<{ id: string, number: number, title: string, shortLabel: string, bodyMarkdown: string }> }}
 */
export function splitNumberedSections(markdown, { idPrefix, deriveShortLabel }) {
  const source = String(markdown || '').trim();
  const matches = [...source.matchAll(SECTION_HEADING_RE)];

  if (matches.length === 0) {
    return { introMarkdown: source, sections: [] };
  }

  const introMarkdown = trimDividers(source.slice(0, matches[0].index));

  const sections = matches.map((match, idx) => {
    const number = Number(match[1]);
    const title = match[2].trim();
    const contentStart = match.index + match[0].length;
    const contentEnd = idx + 1 < matches.length ? matches[idx + 1].index : source.length;
    return {
      id: `${idPrefix}-${number}`,
      number,
      title,
      shortLabel: deriveShortLabel(number, title),
      bodyMarkdown: trimDividers(source.slice(contentStart, contentEnd)),
    };
  });

  return { introMarkdown, sections };
}
