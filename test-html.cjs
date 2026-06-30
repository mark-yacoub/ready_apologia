const fs = require('fs');

async function test() {
  const mod = await import('./src/utils/topicsLoader.js');
  const allTopics = mod.loadAllTopicsData();
  
  const book = 'gn';
  const chapter = '1';
  
  const topicMap = {};
  allTopics.forEach(({ topicId, topicData }) => {
    ['Old Testament', 'New Testament'].forEach(test => {
      const bank = topicData.Scripture?.[test]?.verse_bank;
      if (bank) {
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

  console.log("TopicMap for gn 1:", topicMap);
}
test();
