import { diffArabicWords, normalizeArabic } from './src/utils/diffUtils.js';

let norm = "اَ۬للَّهَ وَاَلَّذِينَ";
norm = norm.replace(/[\u06D6-\u06DC\u06DF-\u06ED\u0653\u0640\u0652]/g, '');
console.log("After tajweed strip:", norm);
// \u06EC is in \u06DF-\u06ED? 
// \u06DF is 1759. \u06EC is 1772. Yes, \u06EC is between DF and ED.
