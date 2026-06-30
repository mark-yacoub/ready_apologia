import('./src/utils/topicsLoader.js').then(m => {
  const allTopics = m.loadAllTopicsData();
  const gn1Topics = {};
  allTopics.forEach(t => {
    ['Old Testament', 'New Testament'].forEach(test => {
      const bank = t.topicData.Scripture?.[test]?.verse_bank;
      if (bank) {
        Object.keys(bank).forEach(vId => {
          if (vId.startsWith('gn_1_')) {
            if (!gn1Topics[vId]) gn1Topics[vId] = [];
            gn1Topics[vId].push(t.topicId);
          }
        });
      }
    });
    if (Array.isArray(t.topicData.prophecies)) {
      t.topicData.prophecies.forEach(p => {
        (p.ot_verses || []).forEach(vId => {
          if (vId.startsWith('gn_1_')) {
            if (!gn1Topics[vId]) gn1Topics[vId] = [];
            gn1Topics[vId].push(t.topicId);
          }
        });
      });
    }
  });
  console.log("gn1 topics:", gn1Topics);
});
