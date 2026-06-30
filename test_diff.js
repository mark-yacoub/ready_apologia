import { diffArabicWords, normalizeArabic } from './src/utils/diffUtils.js';

const t1 = "يُخَـٰدِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُوا۟ وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ";
const t2 = "يُخَادِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُوا۟ وَمَا يُخَـٰدِعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ";

const w1 = t1.split(/\s+/);
const w2 = t2.split(/\s+/);
console.log("Normalized 1:", w1.map(normalizeArabic));
console.log("Normalized 2:", w2.map(normalizeArabic));
console.log("Diff:", diffArabicWords(t1, t2));
