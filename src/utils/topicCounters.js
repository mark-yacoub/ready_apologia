export const getSourceCount = (sData) => {
  if (!sData || typeof sData !== 'object') return 0;
  let count = 0;
  Object.values(sData.works || {}).forEach(work => {
    count += (work?.quotes?.length || 0);
  });
  return count;
};

export const getCenturyCount = (centuryObj) => {
  if (!centuryObj || typeof centuryObj !== 'object') return 0;
  let count = 0;
  Object.values(centuryObj).forEach(father => {
    count += getSourceCount(father);
  });
  return count;
};

export const getAnfCount = (anfData) => {
  if (!anfData || typeof anfData !== 'object') return 0;
  let count = 0;
  Object.values(anfData).forEach(century => {
    count += getCenturyCount(century);
  });
  return count;
};

export const getAncientJudaismCount = getAnfCount; // Structure is the same: era -> author -> work

export const getTestamentCount = (tData) => {
  if (!tData || !Array.isArray(tData.structure)) return 0;
  return tData.structure.reduce((acc, cat) => acc + (cat.verses?.length || 0), 0);
};

export const getTopicTotalCount = (t) => {
  if (t.totalCount !== undefined) return t.totalCount;
  const tData = t.topicData;
  if (!tData) return 0;
  let count = getTestamentCount(tData.Scripture?.['New Testament']) +
         getTestamentCount(tData.Scripture?.['Old Testament']) +
         getAnfCount(tData['Ante-Nicene Fathers']) +
         getAncientJudaismCount(tData['Ancient Judaism']);
  if (Array.isArray(tData.prophecies)) count += tData.prophecies.length;
  return count;
};
