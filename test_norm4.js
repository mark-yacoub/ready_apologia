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

const w1 = "حَتَّى إِذَا اسْتَيْأَسَ الرُّسُلُ وَظَنُّوا أَنَّهُمْ قَدْ كُذِّبُوا جَاءَهُمْ نَصْرُنَا فَنُجِّيَ مَنْ نَشَاءُ وَلَا يُرَدُّ بَأْسُنَا عَنِ الْقَوْمِ الْمُجْرِمِينَ";
const w2 = "حَتَّىٰٓ إِذَا ٱسْتَيْـَٔسَ ٱلرُّسُلُ وَظَنُّوٓا۟ أَنَّهُمْ قَدْ كُذِبُوا۟ جَآءَهُمْ نَصْرُنَا فَنُجِّىَ مَن نَّشَآءُ ۖ وَلَا يُرَدُّ بَأْسُنَا عَنِ ٱلْقَوْمِ ٱلْمُجْرِمِينَ";

const arr1 = w1.split(" ");
const arr2 = w2.split(" ").filter(w => !/^[\u06D6-\u06DC]$/.test(w)); 

for(let i=0; i<Math.min(arr1.length, arr2.length); i++) {
  console.log(`${arr1[i]} (${normalizeArabic(arr1[i])})  vs  ${arr2[i]} (${normalizeArabic(arr2[i])})  MATCH: ${normalizeArabic(arr1[i]) === normalizeArabic(arr2[i])}`);
}
