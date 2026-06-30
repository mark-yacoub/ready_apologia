function normalizeArabic(word) {
  let norm = word
    // Remove Tajweed/Uthmani specific diacritics, waqf marks, and Sukoon
    .replace(/[\u06D6-\u06DC\u06DF-\u06ED\u0653\u0670\u0640\u0652]/g, '')
    // Normalize Alif Wasla to regular Alif
    .replace(/\u0671/g, '\u0627')
    // Normalize Ya/Alif Maqsura to just Ya
    .replace(/\u0649/g, '\u064A')
    // Normalize all Hamza carriers and independent Hamza to a standard Hamza
    .replace(/[\u0621\u0623\u0624\u0625\u0626\u0654\u0655]/g, '\u0621');
    
  // Remove Idgham Shadda (Shadda on the very first letter of the word)
  norm = norm.replace(/^([^\u064B-\u0651])\u0651/, '$1');
  
  return norm;
}

function renderDiffHTML(diffArray, highlightType) {
  return diffArray.map(item => {
    if (item.type === 'common' || normalizeArabic(item.text) === '') {
      return item.text;
    } else {
      const bgColor = highlightType === 'removed' ? 'rgba(230, 100, 100, 0.2)' : 'rgba(100, 230, 100, 0.2)';
      const color = highlightType === 'removed' ? 'var(--color-secondary)' : 'var(--color-primary)';
      return `<span class="diff">${item.text}</span>`;
    }
  }).join(' ');
}

console.log(renderDiffHTML([
  { text: 'نَّشَآءُ', type: 'common' },
  { text: 'ۖ', type: 'added' },
  { text: 'وَلَا', type: 'common' }
], 'added'));
