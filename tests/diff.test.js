import { diffArabicWords } from '../src/utils/diffUtils.js';

const tests = [
  {
    desc: "2:9 - Yakdha'una vs Yukhaadi'una",
    base: "يُخَـٰدِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُوا۟ وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ",
    variant: "يُخَٰدِعُونَ اَ۬للَّهَ وَاَلَّذِينَ ءَامَنُواْ وَمَا يُخَٰدِعُونَ إِلَّآ أَنفُسَهُمۡ وَمَا يَشۡعُرُونَ", // duri_abu_amr
    expectedHighlights: ["يُخَٰدِعُونَ"]
  },
  {
    desc: "2:10 - Yakdhibuna vs Yukadhdhibuna (duri)",
    base: "فِى قُلُوبِهِم مَّرَضٌۭ فَزَادَهُمُ ٱللَّهُ مَرَضًۭا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌۢ بِمَا كَانُوا۟ يَكْذِبُونَ",
    variant: "فِي قُلُوبِهِم مَّرَضٞ فَزَادَهُمُ اُ۬للَّهُ مَرَضٗاۖ وَلَهُمۡ عَذَابٌ أَلِيمُۢ بِمَا كَانُواْ يُكَذِّبُونَ",
    expectedHighlights: ["يُكَذِّبُونَ"]
  },
  {
    desc: "2:10 - Bazzi (Silah Mim Al-Jam)",
    base: "فِى قُلُوبِهِم مَّرَضٌۭ فَزَادَهُمُ ٱللَّهُ مَرَضًۭا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌۢ بِمَا كَانُوا۟ يَكْذِبُونَ",
    variant: "فِي قُلُوبِهِمُۥ مَرَضٞ فَزَادَهُمُ ٱللَّهُ مَرَضٗاۖ وَلَهُمُۥ عَذَابٌ أَلِيمُۢ بِمَا كَانُواْ يُكَذِّبُونَ",
    expectedHighlights: ["يُكَذِّبُونَ"]
  },
  {
    desc: "2:10 - Qalun (Yeh Barree and Tanween position)",
    base: "فِى قُلُوبِهِم مَّرَضٌۭ فَزَادَهُمُ ٱللَّهُ مَرَضًۭا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌۢ بِمَا كَانُوا۟ يَكْذِبُونَ",
    variant: "فِے قُلُوبِهِم مَّرَضٞ فَزَادَهُمُ اُ۬للَّهُ مَرَضاٗۖ وَلَهُمْ عَذَابٌ أَلِيمُۢ بِمَا كَانُواْ يُكَذِّبُونَۖ",
    expectedHighlights: ["يُكَذِّبُونَۖ"] // Allow the waqf mark attached to it if any, we just check if it contains the word
  },
  {
    desc: "2:10 - Warsh (Naql on Alim)",
    base: "فِى قُلُوبِهِم مَّرَضٌۭ فَزَادَهُمُ ٱللَّهُ مَرَضًۭا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌۢ بِمَا كَانُوا۟ يَكْذِبُونَ",
    variant: "فِے قُلُوبِهِم مَّرَضٞۖ فَزَادَهُمُ اُ۬للَّهُ مَرَضاٗۖ وَلَهُمْ عَذَابٌ اَلِيمُۢ بِمَا كَانُواْ يُكَذِّبُونَۖ",
    expectedHighlights: ["يُكَذِّبُونَۖ"]
  },
  {
    desc: "2:58 - Qalun (Hamza carriers)",
    base: "وَإِذْ قُلْنَا ٱدْخُلُوا۟ هَٰذِهِ ٱلْقَرْيَةَ فَكُلُوا۟ مِنْهَا حَيْثُ شِئْتُمْ رَغَدًۭا وَٱدْخُلُوا۟ ٱلْبَابَ سُجَّدًۭا وَقُولُوا۟ حِطَّةٌۭ نَّغْفِرْ لَكُمْ خَطَٰيَٰكُمْ ۚ وَسَنَزِيدُ ٱلْمُحْسِنِينَ",
    variant: "وَإِذْ قُلْنَا اَ۟دْخُلُواْ هَٰذِهِ اِ۬لْقَرْيَةَ فَكُلُواْ مِنْهَا حَيْثُ شِئْتُمْ رَغَداٗ وَادْخُلُواْ اُ۬لْبَابَ سُجَّداٗ وَقُولُواْ حِطَّةٞ يُغْفَرْ لَكُمْ خَطَٰيَٰكُمْۖ وَسَنَزِيدُ اُ۬لْمُحْسِنِينَۖ",
    expectedHighlights: ["يُغْفَرْ"]
  }
];

let allPassed = true;

tests.forEach(t => {
  const res = diffArabicWords(t.base, t.variant);
  // Extract all text inside span tags in rendered2
  const matches = [...res.rendered2.matchAll(/<span[^>]*>(.*?)<\/span>/g)].map(m => m[1]);
  
  // We want exact match of the arrays (or at least, the highlighted words should only be what we expect)
  // Since we might have punctuation attached, we just strip punctuation for the assertion
  const cleanMatches = matches.map(w => w.replace(/[\u06D6-\u06DC\u06DF-\u06ED\u0653\u0640\u0652ۖ]/g, ''));
  const cleanExpected = t.expectedHighlights.map(w => w.replace(/[\u06D6-\u06DC\u06DF-\u06ED\u0653\u0640\u0652ۖ]/g, ''));
  
  const passed = JSON.stringify(cleanMatches) === JSON.stringify(cleanExpected);
  if (!passed) {
    console.error(`❌ ${t.desc}`);
    console.error(`   Expected highlights:`, cleanExpected);
    console.error(`   Actual highlights:  `, cleanMatches);
    allPassed = false;
  } else {
    console.log(`✅ ${t.desc}`);
  }
});

if (!allPassed) {
  process.exit(1);
} else {
  console.log("All tests passed!");
}
