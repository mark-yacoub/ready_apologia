import booksMeta from '../data/books_meta.json';

export const formatBookName = (bookId) => {
  const ntBook = booksMeta.nt.find(b => b.id === bookId);
  if (ntBook) return ntBook.name;
  const otBook = booksMeta.ot.find(b => b.id === bookId);
  if (otBook) return otBook.name;
  return bookId.charAt(0).toUpperCase() + bookId.slice(1);
};

export const sortCanonicalVerses = (verseIds, testamentName) => {
  const metaList = testamentName === 'New Testament' ? booksMeta.nt : booksMeta.ot;
  return [...verseIds].sort((a, b) => {
    const partsA = a.split('_');
    const partsB = b.split('_');
    const bookA = partsA[0];
    const bookB = partsB[0];
    const idxA = metaList.findIndex(x => x.id === bookA);
    const idxB = metaList.findIndex(x => x.id === bookB);
    if (idxA !== idxB) {
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    }
    const chapA = parseInt(partsA[1], 10) || 0;
    const chapB = parseInt(partsB[1], 10) || 0;
    if (chapA !== chapB) return chapA - chapB;
    const vA = parseInt(partsA[2], 10) || 0;
    const vB = parseInt(partsB[2], 10) || 0;
    return vA - vB;
  });
};

export const formatEvidenceTitle = (evidenceId, evidenceData) => {
  if (!evidenceData) return evidenceId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return evidenceData.name 
    || evidenceData.Scripture?.['New Testament']?.title?.replace('New Testament ', '') 
    || evidenceId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
