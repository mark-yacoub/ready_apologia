const { loadAllTopicsData } = require('./src/utils/topics.js');

const book = 'gn';
const chapter = '1';
const topicMap = {};

loadAllTopicsData().forEach(({ topicId, topicData }) => {
  ['Old Testament', 'New Testament'].forEach(test => {
    const bank = topicData?.Scripture?.[test]?.verse_bank;
    if (bank && typeof bank === 'object') {
      Object.keys(bank).forEach(vId => {
        const parts = vId.split('_');
        if (parts[0] === book && parts[1] === chapter) {
          const vNum = parts.slice(2).join('_');
          if (!topicMap[vNum]) topicMap[vNum] = [];
          topicMap[vNum].push(topicId);
        }
      });
    }
  });
});
console.log(topicMap);
