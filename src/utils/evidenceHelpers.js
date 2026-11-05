import booksMeta from '../data/books_meta.json';
import { CANON_LISTS_BOOK_ID } from './evidenceCounters.js';

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

const toListItems = (entries) => entries.map(({ name, description }, idx) => ({
  "@type": "ListItem",
  "position": idx + 1,
  name,
  description,
}));

// Schema.org ItemList entries for an evidence page: one per NT book for the
// authorship topic, otherwise the first 10 scripture categories.
export const buildEvidenceItemList = (evidenceData, title) => {
  const authorship = evidenceData?.authorship_data;
  if (authorship) {
    return toListItems(
      Object.entries(authorship)
        .filter(([, entry]) => entry.book_meta?.book_id !== CANON_LISTS_BOOK_ID)
        .map(([bookTitle, entry]) => {
          const author = entry.book_meta?.traditional_author;
          return {
            name: author ? `${bookTitle} - ${author}` : bookTitle,
            description: author
              ? `Early Christian sources attributing the ${bookTitle} to ${author}.`
              : `Early Christian sources on the authorship of the ${bookTitle}.`,
          };
        })
    );
  }

  const scripture = evidenceData?.Scripture || {};
  const categories = [
    ...(scripture['New Testament']?.structure || []),
    ...(scripture['Old Testament']?.structure || []),
  ];
  return toListItems(
    categories.slice(0, 10).map(cat => {
      const catName = cat?.title || 'General Evidence';
      return {
        name: `${catName} - ${title}`,
        description: `Biblical evidence and verses regarding ${catName.toLowerCase()} demonstrating the ${title.toLowerCase()}.`,
      };
    })
  );
};
