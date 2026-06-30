export function normalizeArabic(word) {
  let norm = word;
  
  // 0. Remove dagger alif if it's on top of an Alif Maqsura or Ya (ىٰ -> ى, يٰ -> ي)
  norm = norm.replace(/([\u0649\u064A])\u0670/g, '$1');

  // 1. Specific words where Waw is used as Alif (صَلَوٰة -> صلاة)
  norm = norm.replace(/صل[وؤ][\u0670\u0627]?ة/g, 'صلاة');
  norm = norm.replace(/زك[وؤ][\u0670\u0627]?ة/g, 'زكاة');
  norm = norm.replace(/حي[وؤ][\u0670\u0627]?ة/g, 'حياة');
  
  // 2. Convert standalone Dagger Alif to regular Alif
  norm = norm.replace(/\u0670/g, '\u0627');

  // 3. Normalize Tajweed-specific Tanween encodings to standard Tanween
  norm = norm.replace(/[\u0657\u065C]/g, '\u064B'); // Variant Fathatan
  norm = norm.replace(/[\u065E\u065D]/g, '\u064C'); // Variant Dammatan
  norm = norm.replace(/[\u0656]/g, '\u064D'); // Variant Kasratan
  
  // 3b. Normalize Iqlab (changing tanween to vowel+meem)
  norm = norm.replace(/\u064E\u06E2/g, '\u064B'); // Fatha + Meem -> Fathatan
  norm = norm.replace(/\u064F\u06E2/g, '\u064C'); // Damma + Meem -> Dammatan
  norm = norm.replace(/\u0650\u06E2/g, '\u064D'); // Kasra + Meem -> Kasratan

  // 3c. Convert Imala/Taqlil marks to Fatha (often used instead of Fatha or alongside it)
  // 06EA is Empty Centre Low Stop. 06ED is Small Low Meem (used for Taqlil in Warsh, but also Iqlab after vowels).
  // Only convert 06ED to Fatha if it's the sole vowel on a consonant (not following another vowel/tanween).
  norm = norm.replace(/([^\u064B-\u0650])\u06ED/g, '$1\u064E');
  norm = norm.replace(/\u06EA/g, '\u064E');
  norm = norm.replace(/\u064E+/g, '\u064E');

  // 3d. Remove Tajweed/Uthmani specific diacritics, waqf marks, small waw/yaa, and Sukoon
  norm = norm.replace(/[\u06D6-\u06DC\u06DE-\u06EC\u06EE-\u06F0\u0653\u0640\u0652\u06E5\u06E6\u06ED]/g, '');

  // 4. Normalize Alif Wasla to regular Alif
  norm = norm.replace(/\u0671/g, '\u0627');

  // 5. Normalize Ya/Alif Maqsura/Yeh Barree to just Ya
  norm = norm.replace(/[\u0649\u06D2]/g, '\u064A');

  // 6. Normalize all Hamza carriers and independent Hamza to a standard Hamza
  norm = norm.replace(/[\u0648\u064A\u0649\u0627]?[\u0654\u0655]/g, '\u0621');
  norm = norm.replace(/[\u0621\u0623\u0624\u0625\u0626]/g, '\u0621');
  
  // 6b. Word-initial Hamza to Alif (handles Naql variant where Hamza is dropped but vowel is transferred)
  norm = norm.replace(/^\u0621/g, '\u0627');

  // 6c. Swap Tanween+Alif to Alif+Tanween for consistent matching (orthographic variance)
  norm = norm.replace(/([\u064B\u064C\u064D])\u0627/g, '\u0627$1');

  // 7. Remove Idgham Shadda (Shadda on the very first letter of the word)
  norm = norm.replace(/^([^\u064B-\u0651])\u0651/, '$1');
  
  // 7b. Remove internal Idgham Shadda (e.g. ذتّ -> ذت, دتّ -> دت, etc.)
  norm = norm.replace(/([ذدثطظب][\u064B-\u0650]?)([تطدكم])\u0651/g, '$1$2');
  
  // 8. Remove all diacritics from regular Alifs (Alif Wasla or Mater Lectionis shouldn't have vowels differing that matter for diffing)
  norm = norm.replace(/\u0627[\u064B-\u0651]+/g, '\u0627');
  
  // 9. Standardize specific words that are spelled differently in Imla'i vs Uthmanic but mean the same
  norm = norm.replace(/^ذ[اَ]*ل[ِ]*ك[َ]*$/g, 'ذلك'); // ذلك
  norm = norm.replace(/^ه[اَ]*ذ[اَ]*$/g, 'هذا'); // هذا
  norm = norm.replace(/^الرَّحْم[اَ]*ن[ِ]*$/g, 'الرحمن'); // الرحمن
  norm = norm.replace(/^الَّي[َُِ]*ل/g, 'اللَّيل'); // الليل

  // 10. Standardize orthographic quirks of Allah/Lillah and Alladhi
  // Some orthographies put Shadda on Lam, some don't. We strip the shadda and fatha from the Lam in these specific words.
  norm = norm.replace(/لَّه/g, 'له'); // الله, لله
  norm = norm.replace(/لَّذ/g, 'لذ'); // الذي, الذين
  
  // 11. Strip terminal Damma/Kasra from Mim Al-Jam' (Silah variant)
  norm = norm.replace(/([هكت][\u064B-\u0652]?\u0645)[\u064F\u0650]$/g, '$1');
  
  // 12. Ignore vowel variance on "Huwa" and "Hiya" after prefixes (e.g. Wa-Huwa vs Wa-Hwa)
  norm = norm.replace(/^([وفل][\u064E]?)?ه[\u064F\u0650]?(و|ي)[\u064E]?$/g, '$1ه$2');
  
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
