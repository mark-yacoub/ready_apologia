import fs from 'fs';
import { diffArabicWords } from './src/utils/diffUtils.js';

const file = './src/data/quran/qr-2/1.json';
const data = JSON.parse(fs.readFileSync(file));
const v10 = data.verses.find(v => v.verse === 10);
if (v10 && v10.canonical_variants) {
  const baseText = v10.quran_arabic;
  console.log("Base:", baseText);
  v10.canonical_variants.forEach(cv => {
     console.log(`\n=== Variant ${cv.rawi} ===`);
     console.log("Arabic:", cv.arabic);
     const res = diffArabicWords(baseText, cv.arabic);
     console.log("Diff2:", res.rendered2);
  });
}
