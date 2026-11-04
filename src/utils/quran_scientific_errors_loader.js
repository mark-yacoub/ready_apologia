import scientificErrors from '../data/quran/scientific_errors/scientific_errors.json' with { type: 'json' };
import { stripMarkdownToPlainText } from './markdown.js';
import { splitNumberedSections } from './scholarly_sections.js';

export function loadScientificErrors() {
  return scientificErrors || {};
}

/** Short TOC labels keyed off the canonical 3-section headings authored in the dataset. */
function deriveShortSectionLabel(num, title = '') {
  const lower = title.toLowerCase();
  if (lower.includes('tafsir') || lower.includes('hadith')) return `${num}. Tafsir & Hadith`;
  if (lower.includes('ancient') || lower.includes('parallel') || lower.includes('misconception')) {
    return `${num}. Ancient Parallels`;
  }
  if (lower.includes('scientific error') || lower.includes('textual')) return `${num}. Scientific Error`;
  const firstWords = title.split(/[:—–-]/)[0].trim().split(/\s+/).slice(0, 3).join(' ');
  return `${num}. ${firstWords}`;
}

/**
 * Parses one verse's scientific-error entry ({ category, title, summary, explanation })
 * into the Two-Tier UI view model:
 * - Tier 1: Quick Summary (`summaryText` Markdown + `summaryPlainText` for copy/SEO)
 * - Tier 2: `introMarkdown` + `sections[]` split on `### N. Heading`
 *   (1. Scientific Error, 2. Tafsir & Hadith, 3. Ancient Parallels)
 *
 * @param {object} rawErrorObj - Entry from scientific_errors.json
 * @param {number} [itemIdx=0] - Card index, used to build unique section anchor ids
 * @returns {Array<object>} Zero or one parsed card (array keeps the multi-card render path uniform)
 */
export function parseScientificErrorItem(rawErrorObj, itemIdx = 0) {
  if (!rawErrorObj || typeof rawErrorObj !== 'object') return [];

  const rawExplanation = String(rawErrorObj.explanation || '').trim();
  const category = String(rawErrorObj.category || 'Scientific Error').trim();
  const title = String(rawErrorObj.title || category).trim();
  const summaryText = String(rawErrorObj.summary || '').trim();
  const summaryPlainText = stripMarkdownToPlainText(summaryText);

  // The dataset prefixes explanation with "<category>. " for the evidence explorer; drop it here
  // so the body does not repeat the header badge.
  const categoryPrefix = `${category.toLowerCase()}.`;
  const body = rawExplanation.toLowerCase().startsWith(categoryPrefix)
    ? rawExplanation.slice(categoryPrefix.length).trim()
    : rawExplanation;

  const { introMarkdown, sections } = splitNumberedSections(body, {
    idPrefix: `sci-error-pillar-${itemIdx}`,
    deriveShortLabel: deriveShortSectionLabel,
  });

  return [
    {
      label: title,
      category,
      title,
      // Plain-text field consumed by seoFactory (meta description / FAQ answer).
      text: summaryPlainText || stripMarkdownToPlainText(introMarkdown),
      summaryText,
      summaryPlainText,
      introMarkdown,
      sections,
    },
  ];
}
