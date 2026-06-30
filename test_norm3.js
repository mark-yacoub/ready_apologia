import { normalizeArabic } from './src/utils/diffUtils.js';

let w = "وَاَلَّذِينَ";
console.log("Original length:", w.length);
for(let i=0; i<w.length; i++) console.log(w[i], w.charCodeAt(i).toString(16));

w = normalizeArabic(w);
console.log("After normalizeArabic:", w);
for(let i=0; i<w.length; i++) console.log(w[i], w.charCodeAt(i).toString(16));

w = w.replace(/\u0627[\u064E\u064F\u0650]/g, '\u0627');
console.log("After replace:", w);
for(let i=0; i<w.length; i++) console.log(w[i], w.charCodeAt(i).toString(16));
