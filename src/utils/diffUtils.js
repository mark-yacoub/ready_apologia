export function normalizeArabic(word) {
  let norm = word;
  
  // 0. Remove dagger alif if it's on top of an Alif Maqsura (ىٰ -> ى)
  // This matches Uthmani's ىٰ with Imla'i's ى
  norm = norm.replace(/\u0649\u0670/g, '\u0649');

  // 1. Convert Waw+DaggerAlif and Ya+DaggerAlif to Alif
  norm = norm.replace(/[\u0648\u064A]\u0670/g, '\u0627');
  
  // 2. Convert standalone Dagger Alif to regular Alif
  norm = norm.replace(/\u0670/g, '\u0627');

  // 3. Remove Tajweed/Uthmani specific diacritics, waqf marks, and Sukoon
  norm = norm.replace(/[\u06D6-\u06DC\u06DF-\u06ED\u0653\u0640\u0652]/g, '');

  // 4. Normalize Alif Wasla to regular Alif
  norm = norm.replace(/\u0671/g, '\u0627');

  // 5. Normalize Ya/Alif Maqsura to just Ya
  norm = norm.replace(/\u0649/g, '\u064A');

  // 6. Normalize all Hamza carriers and independent Hamza to a standard Hamza
  norm = norm.replace(/[\u0621\u0623\u0624\u0625\u0626\u0654\u0655]/g, '\u0621');
  
  // 7. Remove Idgham Shadda (Shadda on the very first letter of the word)
  norm = norm.replace(/^([^\u064B-\u0651])\u0651/, '$1');
  
  // 8. Fix ordering of Fatha and Alif (Uthmanic sometimes puts Fatha before Alif, Imla'i after)
  norm = norm.replace(/\u064E\u0627/g, '\u0627\u064E');
  
  // 9. Standardize specific words that are spelled differently in Imla'i vs Uthmanic but mean the same
  norm = norm.replace(/^ذ[اَ]*ل[ِ]*ك[َ]*$/g, 'ذلك'); // ذلك
  norm = norm.replace(/^ه[اَ]*ذ[اَ]*$/g, 'هذا'); // هذا
  norm = norm.replace(/^الرَّحْم[اَ]*ن[ِ]*$/g, 'الرحمن'); // الرحمن
  norm = norm.replace(/^الَّي[َُِ]*ل/g, 'اللَّيل'); // الليل
  
  return norm;
}

export function diffArabicWords(text1, text2) {
  if (!text1) text1 = '';
  if (!text2) text2 = '';
  
  // Split by whitespace
  const originalWords1 = text1.trim().split(/\s+/).filter(w => w);
  const originalWords2 = text2.trim().split(/\s+/).filter(w => w);
  
  const words1 = originalWords1.map(normalizeArabic);
  const words2 = originalWords2.map(normalizeArabic);
  
  // Simple LCS (Longest Common Subsequence) matrix
  const matrix = Array(words1.length + 1).fill(null).map(() => Array(words2.length + 1).fill(0));
  
  for (let i = 1; i <= words1.length; i++) {
    for (let j = 1; j <= words2.length; j++) {
      if (words1[i - 1] === words2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find differences
  let i = words1.length;
  let j = words2.length;
  const result1 = [];
  const result2 = [];
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && words1[i - 1] === words2[j - 1]) {
      result1.unshift({ text: originalWords1[i - 1], type: 'common' });
      result2.unshift({ text: originalWords2[j - 1], type: 'common' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      result2.unshift({ text: originalWords2[j - 1], type: 'added' });
      j--;
    } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
      result1.unshift({ text: originalWords1[i - 1], type: 'removed' });
      i--;
    }
  }
  
  return {
    rendered1: renderDiffHTML(result1, 'removed'),
    rendered2: renderDiffHTML(result2, 'added')
  };
}

function renderDiffHTML(diffArray, highlightType) {
  return diffArray.map(item => {
    if (item.type === 'common' || normalizeArabic(item.text) === '') {
      return item.text;
    } else {
      const bgColor = highlightType === 'removed' ? 'rgba(230, 100, 100, 0.2)' : 'rgba(100, 230, 100, 0.2)';
      const color = highlightType === 'removed' ? 'var(--color-secondary)' : 'var(--color-primary)';
      return `<span style="background-color: ${bgColor}; color: ${color}; border-radius: 4px; padding: 0 4px; margin: 0 2px;">${item.text}</span>`;
    }
  }).join(' ');
}
