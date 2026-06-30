const w1 = "يُكَذِّبُونَ";
const w2 = "يَكْذِبُونَ";

const stripVowels = w => w.replace(/[\u064B-\u0650\u0652]/g, '');

console.log(stripVowels(w1));
console.log(stripVowels(w2));
console.log(stripVowels(w1) === stripVowels(w2));
