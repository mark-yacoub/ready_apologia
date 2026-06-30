import { normalizeArabic } from './src/utils/diffUtils.js';

const w1 = "مُوسَىٰ";
const w2 = "مُوسۭيٰٓ";
const n1 = normalizeArabic(w1);
const n2 = normalizeArabic(w2);
console.log(n1 === n2, n1, n2);
for(let i=0; i<n1.length; i++) console.log(n1[i], n1.charCodeAt(i).toString(16));
console.log('---');
for(let i=0; i<n2.length; i++) console.log(n2[i], n2.charCodeAt(i).toString(16));
