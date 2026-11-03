import debunkingMiracles from '../data/quran/debunking/scientific_miracles_debunked.json' with { type: 'json' };

export function loadDebunkingMiracles() {
  return debunkingMiracles || {};
}

const DEFAULT_PILLAR_SHORT_LABELS = {
  1: '1. Philology & Context',
  2: '2. Empirical Analysis',
  3: '3. Classical Tafsir & Hadith',
  4: '4. Pre-Islamic Sources',
  5: '5. Harmonizations',
};

function deriveShortLabel(num, fullTitle) {
  const lower = String(fullTitle || '').toLowerCase();
  if (lower.includes('harmonization') || lower.includes('evaluation') || lower.includes('secondary') || lower.includes('defense')) {
    return `${num}. Harmonizations`;
  }
  if (lower.includes('pre-islamic') || lower.includes('precedent') || lower.includes('late antique') || lower.includes('literary parallel')) {
    return `${num}. Pre-Islamic Sources`;
  }
  if (lower.includes('tafsir') || lower.includes('tafsīr') || lower.includes('exegesis') || lower.includes('hadith') || lower.includes('exegetical')) {
    return `${num}. Classical Exegesis`;
  }
  if (lower.includes('table') || lower.includes('empirical') || lower.includes('scientific') || lower.includes('epigraphic') || lower.includes('archaeolog')) {
    return `${num}. Empirical & Table`;
  }
  if (lower.includes('philology') || lower.includes('lexic') || lower.includes('context') || lower.includes('grammar')) {
    return `${num}. Philology & Context`;
  }
  return DEFAULT_PILLAR_SHORT_LABELS[num] || `Section ${num}`;
}

/**
 * Strips inline Markdown formatting (links, bold/italics, inline code) into
 * clean conversational plain text suitable for clipboard copy/paste.
 */
export function stripMarkdownToPlainText(markdown) {
  if (!markdown) return '';
  return String(markdown)
    .replace(/\[([^\]]+)\]\((?:[^()\s]+|\([^()\s]*\))+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Separates a debunking entry into:
 * 1. summaryText: Conversational-yet-scholarly Quick Summary (3-5 sentences, Markdown)
 * 2. summaryPlainText: Clean plain-text Quick Summary for 1-tap clipboard copy
 * 3. abstractMarkdown: Opening academic synthesis before ### 1.
 * 4. pillars[]: Structured array of { id, number, title, shortLabel, bodyMarkdown } for ### 1. .. ### 5.
 */
export function parseDebunkingItem(item, itemIdx = 0) {
  if (!item) {
    return {
      summaryText: '',
      summaryPlainText: '',
      abstractMarkdown: '',
      pillars: [],
    };
  }

  const rawRefutation = String(item.refutation || '').trim();
  const summaryText = String(item.summary || '').trim();
  const summaryPlainText = stripMarkdownToPlainText(summaryText);

  const sectionRegex = /^###\s+(\d+)\.\s+(.+)$/gm;
  const matches = [...rawRefutation.matchAll(sectionRegex)];

  if (matches.length === 0) {
    return {
      summaryText,
      summaryPlainText,
      abstractMarkdown: rawRefutation,
      pillars: [],
    };
  }

  const abstractMarkdown = rawRefutation
    .slice(0, matches[0].index)
    .replace(/(?:^|\n)\s*---\s*$/g, '')
    .trim();

  const pillars = matches.map((match, idx) => {
    const num = Number(match[1]);
    const title = match[2].trim();
    const contentStart = match.index + match[0].length;
    const contentEnd = idx + 1 < matches.length ? matches[idx + 1].index : rawRefutation.length;
    const bodyMarkdown = rawRefutation
      .slice(contentStart, contentEnd)
      .replace(/^\s*---\s*\n+/g, '')
      .replace(/\n+\s*---\s*$/g, '')
      .trim();

    return {
      id: `debunking-pillar-${itemIdx}-${num}`,
      number: num,
      title,
      shortLabel: deriveShortLabel(num, title),
      bodyMarkdown,
    };
  });

  return {
    summaryText,
    summaryPlainText,
    abstractMarkdown,
    pillars,
  };
}
