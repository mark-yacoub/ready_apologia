import fs from 'fs';
import path from 'path';

const quranDir = path.join(process.cwd(), 'src/data/quran');
const surahs = fs.readdirSync(quranDir).filter(d => d.startsWith('qr-'));

for (let surah of surahs) {
  const surahPath = path.join(quranDir, surah);
  const files = fs.readdirSync(surahPath).filter(f => f.endsWith('.json'));
  for (let file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(surahPath, file), 'utf8'));
    for (let verse of data.verses) {
      if (verse.canonical_variants && verse.canonical_variants.length > 0 &&
          verse.competing_variants && verse.competing_variants.length > 0) {
        console.log(`Found: Surah ${surah.replace('qr-', '')}, Verse ${verse.verse}`);
        process.exit(0);
      }
    }
  }
}
