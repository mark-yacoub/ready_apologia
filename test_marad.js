import { normalizeArabic } from './src/utils/diffUtils.js';

let w1 = "مَرَضًۭا";
let w2 = "مَرَضاٗۖ";

let n1 = normalizeArabic(w1);
let n2 = normalizeArabic(w2);

console.log("n1:", n1);
for(let i=0; i<n1.length; i++) console.log(n1[i], n1.charCodeAt(i).toString(16));

console.log("n2:", n2);
for(let i=0; i<n2.length; i++) console.log(n2[i], n2.charCodeAt(i).toString(16));
