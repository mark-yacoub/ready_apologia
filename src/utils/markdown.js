import { getBaseUrl, getBibleUrl, getQuranUrl } from './urlFactory.js';

/**
 * Markdown inline link: [label](url), where url may contain one level of
 * balanced parentheses (e.g. Wikipedia-style URLs). Shared by the HTML parser
 * and the plain-text stripper so both agree on what counts as a link.
 */
// One character per repetition: the old `(?:[^()\s]+|…)+` nested quantifier backtracked
// exponentially on unclosed links and hung the build (/bible/heb/5/7/apologetics).
const MD_LINK_SOURCE = String.raw`\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)`;

/**
 * Strips inline Markdown formatting (links, bold/italics, inline code) into
 * clean plain text suitable for clipboard copy, SEO descriptions, and FAQ schema.
 * @param {string} markdown
 * @returns {string}
 */
export function stripMarkdownToPlainText(markdown) {
  if (!markdown) return '';
  return String(markdown)
    .replace(new RegExp(MD_LINK_SOURCE, 'g'), '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(?!\s)(.+?)(?<!\s)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** quran.com tafsir slug fragments -> Ready Apologia tafsir tab ids (see tafseer_config.js). */
const QURAN_COM_TAFSIR_TO_TAB = [
  [/tabari/i, 'tafsir/tabari'],
  [/kathir/i, 'tafsir/ibn_kathir'],
];

/**
 * Rewrites quran.com verse and tafsir URLs to Ready Apologia's in-app reader
 * and tafsir viewer so citations never bounce readers off-site.
 * Supported shapes:
 *   https://quran.com/2/22            -> /quran/2#22
 *   https://quran.com/2/22-23         -> /quran/2#22
 *   https://quran.com/2:22/tafsirs/en-tafisr-ibn-kathir -> /quran/2/22/tafsir/ibn_kathir
 * Returns null for any quran.com URL we cannot map (left as an external link).
 * @param {string} url
 * @returns {string|null}
 */
export function resolveQuranComUrl(url) {
  const m = /^https?:\/\/(?:www\.)?quran\.com\/(\d+)[/:](\d+)(?:-\d+)?(?:\/tafsirs\/([\w-]+))?\/?$/i.exec(url);
  if (!m) return null;
  const [, surah, ayah, tafsirSlug] = m;
  if (!tafsirSlug) return getQuranUrl({ surah, ayah });
  const mapped = QURAN_COM_TAFSIR_TO_TAB.find(([re]) => re.test(tafsirSlug));
  return mapped ? getQuranUrl({ surah, ayah, tab: mapped[1] }) : null;
}

/**
 * Safe, high-performance, zero-dependency Markdown to HTML regex parser.
 * Built specifically for high-performance speeds, parsing headers, bold text,
 * inline links, tables, blockquotes (including indented/multi-line), nested lists,
 * and dual paragraph line breaks error-free.
 */
export function parseMarkdown(text) {
  if (!text) return '';

  // Clean up visual horizontal divider noise at the absolute start and end of data
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^#+\s*\n+/g, '');
  cleaned = cleaned.replace(/\n+#+\s*$/g, '');

  // 1. Escape raw HTML inputs to strictly defend against XSS natively
  let html = cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 1b. Tokenize inline code spans (`...`) so inner symbols/letters are untouched by regexes
  const codeSpans = [];
  html = html.replace(/`([^`\n]+)`/g, (_, codeText) => {
    const idx = codeSpans.length;
    codeSpans.push(codeText);
    return `\uE000CODE_${idx}\uE001`;
  });

  // 2. Parse standalone dividers (e.g. --- or *** or ###)
  html = html.replace(/^[ \t]*(?:-{3,}|\*{3,}|_{3,}|#+\s*$)[ \t]*$/gm, '<hr class="exegesis-divider" />');

  // 3. Parse Blockquotes: supports leading indentation and multi-line blockquote groups
  html = html.replace(/(?:^[ \t]*(?:\*\s*)?(?:&gt;|>)[ \t]*.*(?:\n|$))+/gm, match => {
    const innerLines = match
      .trimEnd()
      .split('\n')
      .map(line => line.replace(/^[ \t]*(?:\*\s*)?(?:&gt;|>)[ \t]?/, '').trim());
    const joined = innerLines
      .map(line => (line === '' ? '<br/>' : line))
      .join('<br/>')
      .replace(/(?:<br\/>){2,}/g, '<br/><br/>');
    return `\n\n<blockquote class="exegesis-blockquote">${joined}</blockquote>\n\n`;
  });

  // 4. Parse Headers
  html = html.replace(/^#####\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^###\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');

  // 5. Parse Bold and Italic typography
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(?!\s)(.*?)(?<!\s)\*/g, '<em>$1</em>');

  // 6. Parse Inline Anchors: [text](url) (tokenized before scriptureRegex so URLs are never mutated)
  const anchorTokens = [];
  // Unicode-aware (\p{Lu}/\p{Ll}) so transliterations like "Tafsīr al-Ṭabarī 2:22" are styled too.
  // Lookarounds replace \b, which is ASCII-only and fails next to letters such as "ī".
  const scriptureRegex = /(?<![\p{L}\p{N}])((?:Tafs[iī]r\s+(?:Ibn\s+|al-)?|(?:[123]\s+)?)\p{Lu}[\p{Ll}\p{M}]+\.?\s+\d+:\d+(?:[-–—]\d+)?(?:(?:[;,]\s+)(?:\d+:)?\d+(?:[-–—]\d+)?)*)(?![\p{L}\p{N}])/gu;

  html = html.replace(new RegExp(MD_LINK_SOURCE, 'g'), (_, labelText, url) => {
    let finalUrl = url.trim();
    let targetAttrs = 'target="_blank" rel="noopener noreferrer"';
    const inAppQuranUrl = resolveQuranComUrl(finalUrl);

    if (inAppQuranUrl) {
      finalUrl = inAppQuranUrl;
      targetAttrs = '';
    } else if (finalUrl.startsWith('bible://')) {
      const rawPath = finalUrl.slice('bible://'.length).replace(/^\/+|\/+$/g, '');
      const [book, chapter, ...rest] = rawPath.split('/').filter(Boolean);
      const verseStr = rest.join('/');

      if (book && chapter) {
        finalUrl = getBibleUrl({ book, chapter, verse: verseStr, isMt: true });
      } else if (book) {
        finalUrl = getBibleUrl({ book, isMt: true });
      } else {
        finalUrl = getBibleUrl();
      }
      targetAttrs = '';
    } else if (finalUrl.startsWith('quran://') || finalUrl.startsWith('quran/') || finalUrl.startsWith('/quran/')) {
      const rawPath = finalUrl.replace(/^(\/)?quran:\/\//, '').replace(/^(\/)?quran\//, '').replace(/^\/+|\/+$/g, '');
      const [surah, ...rest] = rawPath.split('/').filter(Boolean);
      const ayahStr = rest.join('/');

      if (surah && ayahStr) {
        finalUrl = getQuranUrl({ surah, ayah: ayahStr });
      } else if (surah) {
        finalUrl = getQuranUrl({ surah });
      } else {
        finalUrl = getQuranUrl();
      }
      targetAttrs = '';
    } else if (finalUrl.startsWith('tafseer/') || finalUrl.startsWith('/tafseer/')) {
      const rawPath = finalUrl.replace(/^(\/)?tafseer\//, '').replace(/^\/+|\/+$/g, '');
      const [surah, ...rest] = rawPath.split('/').filter(Boolean);
      const ayahStr = rest.join('/');

      if (surah && ayahStr) {
        finalUrl = getQuranUrl({ surah, ayah: ayahStr, tab: 'tafsir/tabari' });
      } else if (surah) {
        finalUrl = getQuranUrl({ surah });
      } else {
        finalUrl = getQuranUrl();
      }
      targetAttrs = '';
    } else if (finalUrl.startsWith('ibnkathir://') || finalUrl.startsWith('tabari://')) {
      const commentary = finalUrl.startsWith('ibnkathir://') ? 'ibn_kathir' : 'tabari';
      const [surah, ayah] = finalUrl.replace(/^\w+:\/\//, '').split('/').filter(Boolean);
      finalUrl = surah && ayah
        ? getQuranUrl({ surah, ayah, tab: `tafsir/${commentary}` })
        : getQuranUrl({ surah });
      targetAttrs = '';
    } else if (finalUrl.startsWith('/hadith/')) {
      finalUrl = `${getBaseUrl()}${finalUrl}`;
      targetAttrs = '';
    } else if (!/^(?:https?:\/\/|mailto:|\/|#)/i.test(finalUrl)) {
      // Block unsafe schemes (e.g., javascript:, data:, vbscript:)
      return labelText;
    }

    const safeUrl = finalUrl.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const styledLabel = labelText.replace(scriptureRegex, '<span class="exegesis-scripture-pill">$1</span>');
    const idx = anchorTokens.length;
    anchorTokens.push(`<a href="${safeUrl}" ${targetAttrs} class="exegesis-inline-link">${styledLabel}</a>`);
    return `\uE000LINK_${idx}\uE001`;
  });

  // 7. Parse standalone Scripture Citations in non-linked prose
  html = html.replace(scriptureRegex, '<span class="exegesis-scripture-pill">$1</span>');

  // Restore tokenized inline anchors
  html = html.replace(/\uE000LINK_(\d+)\uE001/g, (_, idx) => anchorTokens[Number(idx)]);

  // 8a. Parse Markdown Tables (| Header | ... |)
  html = html.replace(/(?:^[ \t]*\|.*\|[ \t]*(?:\n|$)){2,}/gm, match => {
    const lines = match.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2 || !/^\|(?:\s*:?-{2,}:?\s*\|)+$/.test(lines[1])) {
      return match;
    }
    const parseRow = rowStr =>
      rowStr
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim());
    const headers = parseRow(lines[0]);
    const bodyRows = lines.slice(2).map(parseRow);
    const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${bodyRows
      .map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`)
      .join('')}</tbody>`;
    return `\n\n<div class="exegesis-table-wrapper"><table class="exegesis-table">${thead}${tbody}</table></div>\n\n`;
  });

  // 8b. Parse Unordered Lists (bullet points starting with "* " or "- ")
  html = html.replace(/(?:^[ \t]*[\*\-]\s+.*(?:\n|$))+/gm, match => {
    const items = match
      .trimEnd()
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const m = line.match(/^([ \t]*)[\*\-]\s+(.*)$/);
        if (!m) return `<li class="response-list-item">${line.trim()}</li>`;
        const isSub = m[1].length >= 2;
        return `<li class="response-list-item${isSub ? ' response-sublist-item' : ''}">${m[2]}</li>`;
      })
      .join('');
    return `\n\n<ul class="response-list">\n${items}\n</ul>\n\n`;
  });

  // 8c. Parse Ordered Lists (numbered items starting with "1. ", "2. ", etc., preserving explicit value="N")
  html = html.replace(/(?:^[ \t]*\d+\.\s+.*(?:\n|$))+/gm, match => {
    const items = match
      .trimEnd()
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const m = line.match(/^([ \t]*)(\d+)\.\s+(.*)$/);
        if (!m) return `<li class="response-list-item">${line.trim()}</li>`;
        const isSub = m[1].length >= 2;
        return `<li value="${m[2]}" class="response-list-item${isSub ? ' response-sublist-item' : ''}">${m[3]}</li>`;
      })
      .join('');
    return `\n\n<ol class="response-list">\n${items}\n</ol>\n\n`;
  });

  // 9. Parse Paragraph blocks split by double newlines
  const paragraphs = html.split(/\n\n+/);
  const assembled = paragraphs.map(para => {
    const trimmed = para.trim();
    if (!trimmed) return '';

    // Don't nest block-level HTML structure tags inside paragraph tags
    if (
      trimmed.startsWith('<h3') ||
      trimmed.startsWith('<h4') ||
      trimmed.startsWith('<h5') ||
      trimmed.startsWith('<h6') ||
      trimmed.startsWith('<hr') ||
      trimmed.startsWith('<blockquote') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') ||
      trimmed.startsWith('<div class="exegesis-table-wrapper"')
    ) {
      return trimmed;
    }

    return `<p class="response-paragraph">${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).filter(Boolean).join('\n');

  // 10. Restore tokenized inline code spans
  return assembled.replace(/\uE000CODE_(\d+)\uE001/g, (_, idx) => `<code class="exegesis-inline-code">${codeSpans[Number(idx)]}</code>`);
}
