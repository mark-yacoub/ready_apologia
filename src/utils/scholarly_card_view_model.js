/**
 * Normalizes Debunking Miracles and Scientific Errors entries into one card view model so
 * the Quran ayah page renders both tabs through a single template (Quick Summary +
 * optional methodology + TOC jump bar + collapsible numbered sections).
 */
import { parseDebunkingItem } from './quran_debunking_loader.js';

/** SVG path data for the card header icons. */
const ICON_PATHS = {
  miracle: 'M12 2l2 4 4-1-2 4 3 3-4 1 1 4-4-2-3 3-1-4-4 1 2-4-4-2 4-1-1-4 4 2 3-4z',
  science: 'M6 18h8 M3 22h18 M14 22a7 7 0 1 0 0-14h-1 M9 14h2 M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z M12 6V3 M20 4v4m0 3v.01',
};

/**
 * @typedef {object} ScholarlyCard
 * @property {string} cardId - Unique id shared by `data-debunking-card` and `data-toggle-pillars`
 * @property {string} iconPath
 * @property {string|null} iconColor
 * @property {string} headerTitle
 * @property {string|null} headerBadge
 * @property {string|null} claimMarkdown - Quoted claim box (debunking only)
 * @property {{ classification: string, explanationMarkdown: string }|null} methodology
 * @property {string} summaryText
 * @property {string} summaryPlainText
 * @property {string} analysisHeading
 * @property {string} tocAriaLabel
 * @property {string} introMarkdown
 * @property {Array<{ id: string, number: number, title: string, shortLabel: string, bodyMarkdown: string }>} sections
 */

/** @returns {ScholarlyCard} */
export function buildDebunkingCard(item, itemIdx) {
  const parsed = parseDebunkingItem(item, itemIdx);
  const hasMethodology = Boolean(item.classification || item.classification_explanation);
  return {
    cardId: String(itemIdx),
    iconPath: ICON_PATHS.miracle,
    iconColor: 'var(--color-secondary)',
    headerTitle: `Claimed Miracle: ${item.miracle_category || 'General'}`,
    headerBadge: item.classification || null,
    claimMarkdown: item.claim ? `"${item.claim}"` : null,
    methodology: hasMethodology
      ? {
          classification: item.classification || 'Scholarly Analysis',
          explanationMarkdown: item.classification_explanation || '',
        }
      : null,
    summaryText: parsed.summaryText,
    summaryPlainText: parsed.summaryPlainText,
    analysisHeading: 'Full Scholarly & Primary-Source Analysis',
    tocAriaLabel: 'Academic Paper Sections',
    introMarkdown: parsed.abstractMarkdown,
    sections: parsed.pillars,
  };
}

/**
 * @param {object} parsedError - Output item of parseScientificErrorItem()
 * @returns {ScholarlyCard}
 */
export function buildScientificErrorCard(parsedError, errIdx) {
  return {
    cardId: `sci-${errIdx}`,
    iconPath: ICON_PATHS.science,
    iconColor: null,
    headerTitle: parsedError.title || parsedError.label,
    headerBadge: parsedError.category || null,
    claimMarkdown: null,
    methodology: null,
    summaryText: parsedError.summaryText,
    summaryPlainText: parsedError.summaryPlainText,
    analysisHeading: 'Scholarly, Tafsir & Ancient-Source Analysis',
    tocAriaLabel: 'Scientific Error Sections',
    introMarkdown: parsedError.introMarkdown,
    sections: parsedError.sections,
  };
}
