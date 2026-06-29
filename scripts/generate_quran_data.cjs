const fs = require('fs');
const path = require('path');

const srcData = path.join(__dirname, '..', 'src', 'data');
const outDir = path.join(srcData, 'quran');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Load Hafs Arabic
const hafsArabic = JSON.parse(fs.readFileSync(path.join(srcData, 'scripture', 'hafs_arabic.json'), 'utf8'));

// Load Droge Translation
const droge = JSON.parse(fs.readFileSync(path.join(srcData, 'quran_datasets', 'droge_translation.json'), 'utf8'));

// Load Master Variants (Companions)
const masterVariantsRaw = JSON.parse(fs.readFileSync(path.join(srcData, 'quran_datasets', 'master_variants.json'), 'utf8'));
// Group by surah:ayah
const masterVariants = {};
for (const item of masterVariantsRaw) {
  const surah = item.surah;
  const ayah = item.ayah;
  const key = `${surah}:${ayah}`;
  if (!masterVariants[key]) masterVariants[key] = [];
  masterVariants[key].push(...item.variants);
}

// Load Canonical
const canonicalQaris = [
  'abu_amr', 'abu_jafar', 'al-kisai', 'asim', 'hamzah', 
  'ibn_amir', 'ibn_kathir', 'khalaf', 'nafi', 'yaqub'
];

const canonicalData = {};
for (const qari of canonicalQaris) {
  const qariData = JSON.parse(fs.readFileSync(path.join(srcData, 'quran_datasets', `${qari}.json`), 'utf8'));
  for (const [verseId, vData] of Object.entries(qariData)) {
    if (!canonicalData[verseId]) canonicalData[verseId] = [];
    
    // Extract rawis dynamically based on keys
    const rawis = new Set();
    for (const key of Object.keys(vData)) {
      if (key.endsWith('_text') && key !== 'base_text' && !key.endsWith('_ar_text')) {
        rawis.add(key.replace('_text', ''));
      }
    }
    
    for (const rawi of Array.from(rawis)) {
      if (vData[`${rawi}_ar_text`]) {
        canonicalData[verseId].push({
          qari: qari,
          rawi: rawi,
          arabic: vData[`${rawi}_ar_text`].replace(/\uFEFF/g, ''),
          english: vData[`${rawi}_text`],
          reason: vData[`${rawi}_reason_of_change`] || '',
          category: vData[`${rawi}_change_category`] || ''
        });
      }
    }
  }
}

// Generate surah JSONs (1-114) and 0 for unknown
for (let s = 0; s <= 114; s++) {
  const surahId = s === 0 ? "unknown" : String(s);
  
  const surahDir = path.join(outDir, `qr-${s}`);
  if (!fs.existsSync(surahDir)) fs.mkdirSync(surahDir, { recursive: true });
  
  const verses = [];
  
  if (s > 0) {
    // For standard surahs, find all ayahs in hafs_arabic
    const hafsKeys = Object.keys(hafsArabic).filter(k => k.startsWith(`${s}:`));
    // Sort ayahs numerically
    hafsKeys.sort((a, b) => parseInt(a.split(':')[1]) - parseInt(b.split(':')[1]));
    
    for (const k of hafsKeys) {
      const ayahNum = parseInt(k.split(':')[1]);
      const arText = hafsArabic[k].replace(/\uFEFF/g, '');
      const enText = droge[k] ? droge[k].text : "";
      
      const compVars = masterVariants[k] || [];
      const canVars = canonicalData[k] || [];
      
      verses.push({
        verse: ayahNum,
        quran_arabic: arText,
        text: enText,
        canonical_variants: canVars,
        competing_variants: compVars
      });
    }
    
    // Are there any master variants for this surah with ayah 0?
    if (masterVariants[`${s}:0`]) {
      verses.unshift({
        verse: 0,
        quran_arabic: "",
        text: "",
        canonical_variants: [],
        competing_variants: masterVariants[`${s}:0`]
      });
    }
  } else {
    // For surah 0 (unknown/lost verses)
    const unknownKeys = Object.keys(masterVariants).filter(k => k.startsWith('unknown:'));
    let verseIndex = 1;
    for (const k of unknownKeys) {
      verses.push({
        verse: verseIndex++, // Just assign a sequential number
        quran_arabic: "",
        text: "",
        canonical_variants: [],
        competing_variants: masterVariants[k]
      });
    }
  }
  
  fs.writeFileSync(path.join(surahDir, '1.json'), JSON.stringify({ verses }, null, 2));
  console.log(`Generated qr-${s}/1.json with ${verses.length} verses.`);
}

console.log("Quran data generation complete.");
