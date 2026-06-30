const w = "وَاَلَّذِينَ";
let norm = w.replace(/\u0627[\u064E\u064F\u0650]/g, '\u0627');
console.log(norm);
