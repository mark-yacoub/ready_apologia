function testNormalize(word) {
  let norm = word;
  
  // 11. Normalize Tajweed-specific Tanween encodings to standard Tanween
  norm = norm.replace(/[\u0657\u065C]/g, '\u064B'); // Variant Fathatan
  norm = norm.replace(/[\u065E\u065D]/g, '\u064C'); // Variant Dammatan
  norm = norm.replace(/[\u0656]/g, '\u064D'); // Variant Kasratan
  
  // Normalize Iqlab (changing tanween to vowel+meem)
  norm = norm.replace(/\u064E\u06E2/g, '\u064B'); // Fatha + Meem -> Fathatan
  norm = norm.replace(/\u064F\u06E2/g, '\u064C'); // Damma + Meem -> Dammatan
  norm = norm.replace(/\u0650\u06E2/g, '\u064D'); // Kasra + Meem -> Kasratan

  // 3. Remove Tajweed/Uthmani specific diacritics, waqf marks, and Sukoon
  norm = norm.replace(/[\u06D6-\u06DC\u06DF-\u06ED\u0653\u0640\u0652]/g, '');
  
  return norm;
}

const pairs = [
  ["مَّرَضٞ", "مَّرَضٌۭ"],
  ["مَرَضٗاۖ", "مَرَضًۭا"],
  ["أَلِيمُۢ", "أَلِيمٌۢ"],
  ["فِے", "فِى"]
];

pairs.forEach(([w1, w2]) => {
  console.log(`Original: ${w1} vs ${w2}`);
  console.log(`Normalized: ${testNormalize(w1)} vs ${testNormalize(w2)}`);
  console.log(`Match: ${testNormalize(w1) === testNormalize(w2)}\n`);
});
