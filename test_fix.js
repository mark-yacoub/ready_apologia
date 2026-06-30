import { normalizeArabic } from './src/utils/diffUtils.js';

let w1 = "مُوسَىٰ";
let w2 = "مُوسۭيٰٓ";

let n1 = normalizeArabic(w1);
let n2 = normalizeArabic(w2);

console.log(n1 === n2, n1, n2);

w1 = "اتَّخَذْتُمُ";
w2 = "اَ۪تَّخَذتُّمُ";

n1 = normalizeArabic(w1);
n2 = normalizeArabic(w2);

console.log(n1 === n2, n1, n2);
