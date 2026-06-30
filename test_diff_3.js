import fs from 'fs';
import { diffArabicWords, normalizeArabic } from './src/utils/diffUtils.js';

const baseText = "يُخَـٰدِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُوا۟ وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ";

const dirs = fs.readdirSync('./src/data/quran');
dirs.forEach(dir => {
  if (dir.startsWith('qr-')) {
    const file = `./src/data/quran/${dir}/2.json`;
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file));
      const v9 = data.verses.find(v => v.verse === 9);
      if (v9) {
        console.log(`\n=== ${dir} ===`);
        console.log("Variant:", v9.text);
        const res = diffArabicWords(baseText, v9.text);
        console.log("Diff2:", res.rendered2);
      }
    }
  }
});
