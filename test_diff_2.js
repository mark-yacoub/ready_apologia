import { diffArabicWords, normalizeArabic } from './src/utils/diffUtils.js';
const t1 = "يُخَـٰدِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُوا۟ وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ";
const t2 = "يُخَـٰدِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُوا۟ وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمُۥ وَمَا يَشْعُرُونَ";
console.log(diffArabicWords(t1, t2));
