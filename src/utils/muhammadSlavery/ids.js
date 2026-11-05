/**
 * Stable ids for /discover/muhammad-and-slavery. This is the ONLY place that knows how dataset
 * entries map to ids. Ids are never derived from titles or copy: they survive title rewrites and
 * reordering, and the build fails loudly when the data moves (model.js).
 *
 *   HADITH_ITEM_IDS  raw dataset anchor reference → item id. The model finds the one item whose
 *                    hadiths[] contains that reference (0 or 2+ matches fail the build). Matching is
 *                    on the RAW dataset (before ITEM_MUTATIONS in config.js move reports around).
 *   verseId          `verse-${verse_key with ':' → '-'}` (identical to the old island ids, so old
 *                    `#verse-4-24` links still land).
 *   ANSWER_IDS       faq_id → answer id (+ an alias span `faq-${faq_id}` on the page).
 *   CATEGORY_ALIAS   category_id → hadith-page section id carrying the legacy `#cat-${id}` anchor.
 */

export const HADITH_ITEM_IDS = {
  // categories[0] (category_id 1)
  'Sahih al-Bukhari 4234': 'midam',
  'Sahih al-Bukhari 4913': 'rabah',
  'Sahih al-Bukhari 3074': 'karkara',
  'Sahih al-Bukhari 6149': 'anjasha',
  'Sahih al-Bukhari 2739': 'household-slaves',
  'Sahih Muslim 29:53': 'prophets-slave-woman',
  // categories[1] (category_id 2)
  'Sahih Muslim 22:152': 'two-slaves-for-one',
  'Sahih al-Bukhari 6716': 'mudabbar-sold',
  'Sahih Muslim 16:102': 'safiyya-seven-heads',
  'Sahih al-Bukhari 3144': 'captives-exchanged',
  'Sahih Muslim 22:81': 'abu-tayba',
  // categories[2] (category_id 3)
  'Sahih al-Bukhari 5387': 'safiyya-veil',
  'Sahih al-Bukhari 371': 'safiyya',
  'Sahih Muslim 32:1': 'juwayriyya',
  'Sahih al-Bukhari 7214': 'right-hand-touch',
  // categories[3] (category_id 4)
  'Sahih al-Bukhari 4121': 'banu-qurayza',
  'Sahih al-Bukhari 2583': 'hawazin-captives',
  'Sahih al-Bukhari 4350': 'ali-khums',
  'Sahih al-Bukhari 3113': 'fatima-servant',
  'Sahih Muslim 33:33': 'captives-ghulul',
  // categories[4] (category_id 5)
  'Sahih al-Bukhari 4138': 'azl-captives',
  'Sahih Muslim 17:41': 'awtas-4-24',
  // categories[5] (category_id 6)
  'Sahih Muslim 27:82': 'six-slaves-lots',
  'Sahih al-Bukhari 2592': 'maymuna',
  // categories[6] (category_id 7)
  'Sahih al-Bukhari 2555': 'slave-woman-sold',
  'Sahih Muslim 1:134': 'runaway-slave',
  'Sahih al-Bukhari 5758': 'ghurra',
  'Sahih al-Bukhari 5368': 'kaffara',
  'Sahih al-Bukhari 2745': 'walad-lil-firash',
  'Sahih Muslim 5:39': 'where-is-allah',
  'Sahih Muslim 32:166': 'booty-share',
  'Sahih al-Bukhari 6827': 'ransom-returned',
  'Sahih al-Bukhari 6858': 'master-duties',
  'Sahih al-Bukhari 2560': 'barira',
};

export const verseId = verseKey => `verse-${String(verseKey).replace(':', '-')}`;

export const ANSWER_IDS = {
  1: 'gradual-abolition',
  2: 'servants-or-slaves',
  3: 'captive-wives',
  4: 'captives-without-marriage',
  5: 'prophet-owned-slaves',
  6: 'who-was-enslaved',
  7: 'equal-rights',
  8: 'freeing-slaves',
  9: 'classical-law',
};

/** category_id → the hadith-page section that carries `#cat-${category_id}` (1:1). */
export const CATEGORY_ALIAS = {
  1: 'owned',
  2: 'bought-and-sold',
  3: 'married-captives',
  4: 'captives',
  5: 'captive-women',
  6: 'freeing-stopped',
  7: 'in-law',
};

/** The dataset's 8th category is a stub that duplicates quran_slavery_tafsir.verses (model checks it). */
export const QURAN_STUB_CATEGORY_ID = 8;
