/**
 * Safe, high-performance, zero-dependency Markdown to HTML regex parser.
 * Built specifically for high-performance speeds, parsing headers, bold text,
 * inline links, and dual paragraph line breaks error-free.
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

  // 2. Parse standalone dividers (e.g. --- or *** or ###)
  html = html.replace(/^(?:-{3,}|\*{3,}|_{3,}|#+\s*$)/gm, '<hr class="exegesis-divider" />');

  // 3. Parse Blockquotes: > "quote" or &gt; "quote" (resilient to leading *> or >)
  html = html.replace(/^(?:\*\s*)?(?:&gt;|>)\s*(.+)$/gm, '<blockquote class="exegesis-blockquote">$1</blockquote>');

  // 4. Parse Headers
  html = html.replace(/^#####\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^###\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');

  // Restore link tags in headers if they got escaped by XSS check
  // Re-map [text](url) -> <a href="url" target="_blank" rel="noopener">text</a>
  html = html.replace(/&lt;a href=&quot;(.*?)&quot;(.*?)&gt;(.*?)&lt;\/a&gt;/g, '<a href="$1"$2>$3</a>');

  // 5. Parse Bold and Italic typography
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(?!\s)(.*?)(?<!\s)\*/g, '<em>$1</em>');

  // 6. Parse Scripture Citations references natively into gorgeous design pills!
  const scriptureRegex = /\b((?:[123]\s+)?[A-Z][a-z]+\.?\s+\d+:\d+(?:[-–—]\d+)?(?:(?:[;,]\s+)(?:\d+:)?\d+(?:[-–—]\d+)?)*)\b/g;
  html = html.replace(scriptureRegex, '<span class="exegesis-scripture-pill">$1</span>');

  // 7. Parse Inline Anchors: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (_, text, url) => {
    let finalUrl = url;
    let targetAttrs = 'target="_blank" rel="noopener noreferrer"';

    if (url.startsWith('bible://')) {
      const rawPath = url.slice('bible://'.length).replace(/^\/+|\/+$/g, '');
      const [book, chapter, ...rest] = rawPath.split('/').filter(Boolean);
      const verseStr = rest.join('/');

      const baseUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
        ? import.meta.env.BASE_URL
        : '/';
      const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      if (book && chapter) {
        const firstVerseMatch = (verseStr.match(/\d+/) || [])[0];
        const anchor = firstVerseMatch ? `#${firstVerseMatch}` : '';
        finalUrl = `${base}/bible/${encodeURIComponent(book)}/${encodeURIComponent(chapter)}${anchor}`;
      } else if (book) {
        finalUrl = `${base}/bible/${encodeURIComponent(book)}`;
      } else {
        finalUrl = `${base}/bible`;
      }
      targetAttrs = ''; // open internal links in the same tab
    } else if (url.startsWith('quran://') || url.startsWith('quran/') || url.startsWith('/quran/')) {
      const rawPath = url.replace(/^(\/)?quran:\/\//, '').replace(/^(\/)?quran\//, '').replace(/^\/+|\/+$/g, '');
      const [surah, ...rest] = rawPath.split('/').filter(Boolean);
      const ayahStr = rest.join('/');

      const baseUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
        ? import.meta.env.BASE_URL
        : '/';
      const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      if (surah && ayahStr) {
        const firstAyahMatch = (ayahStr.match(/\d+/) || [])[0];
        const anchor = firstAyahMatch ? `#${firstAyahMatch}` : '';
        finalUrl = `${base}/quran/${encodeURIComponent(surah)}${anchor}`;
      } else if (surah) {
        finalUrl = `${base}/quran/${encodeURIComponent(surah)}`;
      } else {
        finalUrl = `${base}/quran`;
      }
      targetAttrs = ''; // open internal links in the same tab
    } else if (url.startsWith('tafseer/') || url.startsWith('/tafseer/')) {
      const rawPath = url.replace(/^(\/)?tafseer\//, '').replace(/^\/+|\/+$/g, '');
      const [surah, ...rest] = rawPath.split('/').filter(Boolean);
      const ayahStr = rest.join('/');

      const baseUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
        ? import.meta.env.BASE_URL
        : '/';
      const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      if (surah && ayahStr) {
        const firstAyahMatch = (ayahStr.match(/\d+/) || [])[0];
        finalUrl = firstAyahMatch
          ? `${base}/quran/${encodeURIComponent(surah)}/${encodeURIComponent(firstAyahMatch)}/tafsir/tabari`
          : `${base}/quran/${encodeURIComponent(surah)}`;
      } else if (surah) {
        finalUrl = `${base}/quran/${encodeURIComponent(surah)}`;
      } else {
        finalUrl = `${base}/quran`;
      }
      targetAttrs = ''; // open internal links in the same tab
    }

    // Defensive attribute escaping against XSS injection
    const safeUrl = finalUrl.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    return `<a href="${safeUrl}" ${targetAttrs} class="exegesis-inline-link">${text}</a>`;
  });

  // 8. Parse Unordered Lists (bullet points starting with "* ")
  // Execute BEFORE paragraph splitting so lists get isolated cleanly
  html = html.replace(/(?:^\*\s+.*(?:\n|$))+/gm, match => {
    const items = match.trim().split('\n').map(line => `<li class="response-list-item">${line.replace(/^\*\s+/, '')}</li>`).join('');
    return `\n\n<ul class="response-list">\n${items}\n</ul>\n\n`;
  });

  // 9. Parse Paragraph blocks split by double newlines
  const paragraphs = html.split(/\n\n+/);
  return paragraphs.map(para => {
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
      trimmed.startsWith('<ul')
    ) {
      return trimmed;
    }

    return `<p class="response-paragraph">${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).filter(Boolean).join('\n');
}
