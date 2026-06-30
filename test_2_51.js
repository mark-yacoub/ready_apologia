import { normalizeArabic } from './src/utils/diffUtils.js';

const w1 = "مُوسَىٰ";
const w2 = "مُوسۭيٰٓ";
console.log(normalizeArabic(w1) === normalizeArabic(w2), normalizeArabic(w1), normalizeArabic(w2));

const w3 = "اتَّخَذْتُمُ";
const w4 = "اَ۪تَّخَذتُّمُ";
console.log(normalizeArabic(w3) === normalizeArabic(w4), normalizeArabic(w3), normalizeArabic(w4));

const w5 = "وٰعَدْنَا";
const w6 = "وَعَدۡنَا";
console.log(normalizeArabic(w5) === normalizeArabic(w6), normalizeArabic(w5), normalizeArabic(w6));

