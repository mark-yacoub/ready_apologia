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

console.log(normalizeArabic('ٱلَّيْلِ') === normalizeArabic('اللَّيْلِ'), normalizeArabic('ٱلَّيْلِ'), normalizeArabic('اللَّيْلِ'));
