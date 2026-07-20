import fs from 'node:fs';
import path from 'node:path';
import { mapMtToLxx } from './scripture_mapper.js';
import booksMeta from '../data/books_meta.json';
import { NT_TRANSLATION_ID } from './bible_config.js';

/**
 * Isolated module cache to aggressively memoize JSON filesystem reads.
 * Being inside a standard ES module keeps it safely separated from the Astro render contexts or globals.
 */
const fileCache = new Map();

/**
 * Retrieves the localized scripture text for a specific biblical verse.
 * Transparently manages bidirectional translations mappings (e.g., retrieving LXX text when presented with MT standard IDs).
 *
 * @param {string} book - Standard book ID (e.g., 'mt', 'jn', 'gen')
 * @param {string|number} chapter - Chapter number
 * @param {string|number} verse - Verse number
 * @returns {string} The raw scripture text
 */
export function getScriptureVerseText(book, chapter, verse) {
  if (!book || !chapter || !verse) return "";

  let b = book;
  let c = String(chapter);
  let v = String(verse);

  const isNt = booksMeta.nt.some(bk => bk.id === b);

  // Intercept OT requests and map from standard Masoretic Text numbering to LXX
  if (!isNt && booksMeta.ot.some(bk => bk.id === b)) {
    const m = mapMtToLxx(b, c, v);
    b = m.book;
    c = m.chapter;
    v = m.verse;
  }

  const folder = isNt ? NT_TRANSLATION_ID : 'lxx2012';
  const filePath = path.join(process.cwd(), 'src/data/scripture', folder, `${b}.json`);

  if (!fileCache.has(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      fileCache.set(filePath, JSON.parse(content));
    } catch (e) {
      console.error(`[ScriptureService] Failed to read cached file mapping for: ${filePath}`, e);
      fileCache.set(filePath, {}); // Cache an empty object to prevent continuous FS blocks on invalid paths
    }
  }

  const bookData = fileCache.get(filePath);
  const chapterVerses = bookData[c] || [];

  // Find the verse string payload in the array
  const verseObj = chapterVerses.find(x => Object.keys(x)[0] === v);

  return verseObj ? verseObj[v] : "";
}

/**
 * Helper to fetch a verse immediately when provided an assembled ID.
 * @param {string} id - Formatted like "book_chapter_verse" (e.g. 'mr_16_9')
 */
export function getScriptureVerseTextById(id) {
  if (!id) return "";
  const parts = id.split('_');
  if (parts.length !== 3) return "";
  return getScriptureVerseText(parts[0], parts[1], parts[2]);
}
