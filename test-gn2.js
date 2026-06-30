import fs from 'node:fs';
const base = './src/data/scripture/lxx2012/gn.json';
const data = JSON.parse(fs.readFileSync(base, 'utf8'));
const verse1 = data['1'].find(v => Object.keys(v)[0] === '1');
const verse2 = data['1'].find(v => Object.keys(v)[0] === '2');
console.log('verse1:', verse1);
console.log('verse2:', verse2);
