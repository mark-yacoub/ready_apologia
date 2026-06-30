import { diffArabicWords, normalizeArabic } from './src/utils/diffUtils.js';

let t1 = "يُخَـٰدِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُوا۟ وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ";
let t2 = "يُخَٰدِعُونَ اَ۬للَّهَ وَاَلَّذِينَ ءَامَنُواْ وَمَا يُخَٰدِعُونَ إِلَّآ أَنفُسَهُمۡ وَمَا يَشۡعُرُونَ";
let t3 = "يُخَٰدِعُونَ اَ۬للَّهَ وَالذِينَ ءَامَنُواْ وَمَا يُخَٰدِعُونَ إِلَّا أَنفُسَهُمْ وَمَا يَشْعُرُونَۖ";

function myNormalize(norm) {
  norm = normalizeArabic(norm);
  // Strip Fatha, Kasra, Damma from standalone Alif
  norm = norm.replace(/\u0627[\u064E\u064F\u0650]/g, '\u0627');
  
  // Hardcode orthographic normalization for 'Allah' and 'Alladhi'
  norm = norm.replace(/لَّه/g, 'له'); // l-l-shadda-fatha-h -> l-h
  norm = norm.replace(/لَّذ/g, 'لذ'); // l-shadda-fatha-dh -> l-dh
  
  return norm;
}

const w1 = t1.split(/\s+/).map(myNormalize);
const w2 = t2.split(/\s+/).map(myNormalize);
const w3 = t3.split(/\s+/).map(myNormalize);

console.log("w1:", w1);
console.log("w2:", w2);
console.log("w3:", w3);
