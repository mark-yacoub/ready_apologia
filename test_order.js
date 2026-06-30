function normalizeArabic(word) {
  let norm = word;
  
  // 0. Remove dagger alif if it's on top of an Alif Maqsura (ىٰ -> ى)
  norm = norm.replace(/\u0649\u0670/g, '\u0649');

  // 1. Convert Waw+DaggerAlif and Ya+DaggerAlif to Alif
  norm = norm.replace(/[\u0648\u064A]\u0670/g, '\u0627');
  
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

  // 3c. Remove Tajweed/Uthmani specific diacritics, waqf marks, small waw/yaa, and Sukoon
  norm = norm.replace(/[\u06D6-\u06DC\u06DF-\u06ED\u0653\u0640\u0652\u06E5\u06E6]/g, '');

  // 4. Normalize Alif Wasla to regular Alif
  norm = norm.replace(/\u0671/g, '\u0627');

  // 5. Normalize Ya/Alif Maqsura/Yeh Barree to just Ya
  norm = norm.replace(/[\u0649\u06D2]/g, '\u064A');

  // 6. Normalize all Hamza carriers and independent Hamza to a standard Hamza
  norm = norm.replace(/[\u0621\u0623\u0624\u0625\u0626\u0654\u0655]/g, '\u0621');
  
  // 6b. Word-initial Hamza to Alif (handles Naql variant where Hamza is dropped but vowel is transferred)
  norm = norm.replace(/^\u0621/g, '\u0627');

  // 6c. Swap Tanween+Alif to Alif+Tanween for consistent matching (orthographic variance)
  norm = norm.replace(/([\u064B\u064C\u064D])\u0627/g, '\u0627$1');

  // 7. Remove Idgham Shadda (Shadda on the very first letter of the word)
  norm = norm.replace(/^([^\u064B-\u0651])\u0651/, '$1');
  
  // 8. Remove all diacritics from regular Alifs (Alif Wasla or Mater Lectionis shouldn't have vowels differing that matter for diffing)
  norm = norm.replace(/\u0627[\u064B-\u0651]+/g, '\u0627');
  
  // 9. Standardize specific words that are spelled differently in Imla'i vs Uthmanic but mean the same
  norm = norm.replace(/^ذ[اَ]*ل[ِ]*ك[َ]*$/g, 'ذلك'); // ذلك
  norm = norm.replace(/^ه[اَ]*ذ[اَ]*$/g, 'هذا'); // هذا
  norm = norm.replace(/^الرَّحْم[اَ]*ن[ِ]*$/g, 'الرحمن'); // الرحمن
  norm = norm.replace(/^الَّي[َُِ]*ل/g, 'اللَّيل'); // الليل

  // 10. Standardize orthographic quirks of Allah/Lillah and Alladhi
  norm = norm.replace(/لَّه/g, 'له'); // الله, لله
  norm = norm.replace(/لَّذ/g, 'لذ'); // الذي, الذين
  
  // 11. Strip terminal Damma/Kasra from Mim Al-Jam' (Silah variant)
  norm = norm.replace(/([هكت][\u064B-\u0652]?\u0645)[\u064F\u0650]$/g, '$1');
  
  return norm;
}

const w1 = "مَرَضًۭا";
const w2 = "مَرَضاٗۖ";

const w3 = "اَلِيمُۢ";
const w4 = "أَلِيمٌۢ";

console.log(normalizeArabic(w1) === normalizeArabic(w2), normalizeArabic(w1), normalizeArabic(w2));
console.log(normalizeArabic(w3) === normalizeArabic(w4), normalizeArabic(w3), normalizeArabic(w4));
