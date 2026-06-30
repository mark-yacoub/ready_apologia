import fs from 'fs';
import { diffArabicWords, normalizeArabic } from './src/utils/diffUtils.js';

const file = './src/data/quran/qr-0/1.json';
const data = JSON.parse(fs.readFileSync(file));
const v9 = data.verses.find(v => v.verse === 9);
console.log("Found verse 9:", !!v9);
if (v9 && v9.canonical_variants) {
  const baseText = v9.quran_arabic;
  console.log("Base:", baseText);
  v9.canonical_variants.forEach(cv => {
     console.log(`\n=== Variant ${cv.rawi} ===`);
     console.log("Arabic:", cv.arabic);
     const res = diffArabicWords(baseText, cv.arabic);
     console.log("Diff2:", res.rendered2);
  });
}
