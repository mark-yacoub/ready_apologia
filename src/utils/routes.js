/** Site-wide route constants shared by Astro pages and client components (paths exclude BASE_URL). */

/** Where the Scripture tab and the root redirect send a reader who has no saved scripture page. */
export const DEFAULT_SCRIPTURE_PATH = '/bible/jn/1';

/** The "How Reliable Are the Hadith?" article (linked from the /hadith hub intro). */
export const HADITH_RELIABILITY_PATH = '/discover/hadith-reliability';

/** The "How was the Qurʾān preserved?" article (one page; items are `#id` anchors). Public URL: never change without a redirect. */
export const QURAN_PRESERVATION_PATH = '/discover/quran-preservation';

/** "12 Occasions of Revelation" (URL slug kept from the article's earlier name for inbound links). */
export const CONVENIENT_REVELATIONS_PATH = '/discover/convenient-revelations';

/** "Muḥammad and slavery" (cross-pointer target from the occasions-of-revelation article). */
export const MUHAMMAD_AND_SLAVERY_PATH = '/discover/muhammad-and-slavery';

/**
 * "Muhammad and slavery": a hub and three sub-pages (items are `#id` anchors on the sub-pages).
 * Public URLs (shared and indexed): never change without a redirect.
 */
export const MUHAMMAD_SLAVERY_PATH = '/discover/muhammad-and-slavery';
export const MUHAMMAD_SLAVERY_PAGES = {
  hub: '',
  hadith: '/prophets-practice',
  quran: '/quranic-witness',
  answers: '/counter-apologetics',
};
