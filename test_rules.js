function testNorm(norm) {
  // Tanween before Alif -> after Alif
  norm = norm.replace(/([\u064B\u064C\u064D])\u0627/g, '\u0627$1');
  
  // Terminal Mim Al-Jam' short vowel stripping (e.g. قلوبهمُ -> قلوبهم)
  // [هكت] matches Ha, Kaf, Ta. Optional Kasra \u0650. Then Meem \u0645.
  // Then terminal Damma \u064F or Kasra \u0650.
  norm = norm.replace(/([هكت]\u0650?\u0645)[\u064F\u0650]$/g, '$1');
  
  // Word-initial Hamza to Alif (for Naql)
  norm = norm.replace(/^\u0621/g, '\u0627');
  
  return norm;
}

const words = [
  "ضًۭا", // wait, ۭ is stripped first. "ضًا"
  "قُلُوبِهِمُ",
  "ءَلِيمٌ"
];

console.log(testNorm("ضًا"));
console.log(testNorm("قُلُوبِهِمُ"));
console.log(testNorm("ءَلِيمٌ"));
