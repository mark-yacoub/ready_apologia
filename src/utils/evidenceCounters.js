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

// NT Authorship schema: authorship_data[bookTitle] = { book_meta, centuries: { century: { father: { works: [{ quotes }] } } } }
export const CANON_LISTS_BOOK_ID = 'canon_lists';

export const getBookCenturies = (bookEntry) => bookEntry?.centuries || {};

// Counts unique patristic passages. A single passage may attribute several books
// (e.g. a canon list), so this is intentionally smaller than the sum of per-book counts.
export const getAuthorshipCount = (authorshipData) => {
  const uniqueQuoteIds = new Set();
  Object.values(authorshipData || {}).forEach(bookEntry => {
    Object.values(getBookCenturies(bookEntry)).forEach(fathers => {
      Object.values(fathers).forEach(father => {
        (father.works || []).forEach(work => {
          (work.quotes || []).forEach(q => uniqueQuoteIds.add(q.quote_id));
        });
      });
    });
  });
  return uniqueQuoteIds.size;
};

export const getTestamentCount = (tData) => {
  if (!tData || !Array.isArray(tData.structure)) return 0;
  return new Set(tData.structure.flatMap(cat => cat.verses || [])).size;
};

export const getEvidenceTotalCount = (t) => {
  if (t.totalCount !== undefined) return t.totalCount;
  const tData = t.evidenceData;
  if (!tData) return 0;
  let count = getTestamentCount(tData.Scripture?.['New Testament']) +
         getTestamentCount(tData.Scripture?.['Old Testament']) +
         getAnfCount(tData['Ante-Nicene Fathers']) +
         getAncientJudaismCount(tData['Ancient Judaism']);
  if (Array.isArray(tData.prophecies)) count += tData.prophecies.length;
  count += getAuthorshipCount(tData.authorship_data);
  return count;
};
