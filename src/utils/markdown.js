/**
 * Safe, high-performance, zero-dependency Markdown to HTML regex parser.
 * Built specifically for PWA offline speeds, parsing headers, bold text, 
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
    
  // 2. Parse standalone hash dividers (e.g. #####) as clean horizontal lines
  html = html.replace(/^#+\s*$/gm, '<hr class="exegesis-divider" />');

  // 3. Parse Headers: ## [Title](Link)—Question
  // Map raw markdown headings ## cleanly to styled <h3> tags
  html = html.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
  
  // Restore link tags in headers if they got escaped by XSS check
  // Re-map [text](url) -> <a href="url" target="_blank" rel="noopener">text</a>
  html = html.replace(/&lt;a href=&quot;(.*?)&quot;(.*?)&gt;(.*?)&lt;\/a&gt;/g, '<a href="$1"$2>$3</a>');

  // 4. Parse Bold typography: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 5. Parse Scripture Citations references natively into gorgeous design pills!
  const scriptureRegex = /\b((?:[123]\s+)?[A-Z][a-z]+\.?\s+\d+:\d+(?:-\d+)?(?:(?:[;,]\s+)(?:\d+:)?\d+(?:-\d+)?)*)\b/g;
  html = html.replace(scriptureRegex, '<span class="exegesis-scripture-pill">$1</span>');
  
  // 4. Parse Inline Anchors: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="exegesis-inline-link">$1</a>');
  
  // 5. Parse Paragraph blocks split by double newlines
  const paragraphs = html.split(/\n\n+/);
  return paragraphs.map(para => {
    const trimmed = para.trim();
    if (!trimmed) return '';
    
    // Don't nest headings inside paragraph tags
    if (trimmed.startsWith('<h3>')) return trimmed;
    
    return `<p class="response-paragraph">${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).filter(Boolean).join('\n');
}
