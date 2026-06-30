import { normalizeArabic } from './src/utils/diffUtils.js';

let w3 = "اَلِيمُۢ";
let w4 = "أَلِيمٌۢ";

let n3 = normalizeArabic(w3);
let n4 = normalizeArabic(w4);

console.log("n3:", n3);
for(let i=0; i<n3.length; i++) console.log(n3[i], n3.charCodeAt(i).toString(16));

console.log("n4:", n4);
for(let i=0; i<n4.length; i++) console.log(n4[i], n4.charCodeAt(i).toString(16));
