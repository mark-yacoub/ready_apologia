import fs from 'fs';
import { diffArabicWords, normalizeArabic } from './src/utils/diffUtils.js';

const baseText = "يُخَـٰدِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُوا۟ وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ";

const file = './src/data/quran/qr-1/2.json';
const data = JSON.parse(fs.readFileSync(file));
const v9 = data.verses.find(v => v.verse === 9);
if (v9 && v9.canonical_variants) {
  v9.canonical_variants.forEach(cv => {
     console.log(`\n=== Variant ${cv.rawi} ===`);
     console.log("Arabic:", cv.arabic);
     const res = diffArabicWords(baseText, cv.arabic);
     console.log("Diff2:", res.rendered2);
  });
}
