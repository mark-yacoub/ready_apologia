import fs from 'node:fs';
const allTopics = [];
const topicsDir = './src/data/topics';
fs.readdirSync(topicsDir).filter(f => f.endsWith('.json')).forEach(file => {
  allTopics.push({ topicId: file.replace('.json', ''), topicData: JSON.parse(fs.readFileSync(topicsDir + '/' + file, 'utf8')) });
});
const book = 'gn';
const chapter = '1';
const topicMap = {};
allTopics.forEach(({ topicId, topicData }) => {
  ['Old Testament', 'New Testament'].forEach(test => {
    const bank = topicData?.Scripture?.[test]?.verse_bank;
    if (bank && typeof bank === 'object') {
      Object.keys(bank).forEach(vId => {
        const parts = vId.split('_');
        if (parts[0] === book && parts[1] === chapter) {
          const vNum = parts.slice(2).join('_');
          if (!topicMap[vNum]) topicMap[vNum] = [];
          if (!topicMap[vNum].includes(topicId)) topicMap[vNum].push(topicId);
        }
      });
    }
  });
});
console.log('topicMap:', topicMap);
