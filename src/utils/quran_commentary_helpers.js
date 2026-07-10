import { parseMarkdown } from './markdown.js';
import { loadEnglishData, loadArabicSurah } from './quran_loader.js';

/**
 * Formats raw Ibn Kathir commentary markdown by isolating standalone quoted verses
 * into highlighted Quoted Scripture boxes and tightening paragraph spacing.
 * 
 * @param {string} text - Raw markdown commentary text
 * @returns {string} Formatted HTML string
 */
export function formatCommentaryWithVerseBoxes(text) {
  if (!text) return '';
  let norm = text.replace(/^(\{[^\}]+\}[\s\.,;]*)\n(?!\n)/gm, '$1\n\n');
  norm = norm.replace(/^((?:['"])\d+\.[^\n'"]+(?:['"]|\})[\s\.,;]*(?:\([^\)]+\))?)\n(?!\n)/gm, '$1\n\n');
  
  const paras = norm.split(/\n\n+/);
  const processed = [];
  let currentQuotes = [];

  for (const p of paras) {
    const pClean = p.trim();
    if (!pClean) continue;
    // Match standalone {...} blocks or '<digit>. verse quotes
    if (/^(\{[\s\S]*?\}[\s\.,;]*)+$/.test(pClean) || /^["']\d+\.[^\n]+$/.test(pClean)) {
      const cleanQuote = pClean.replace(/^[\{'"]|[\}'"]$/g, '').trim();
      currentQuotes.push(`"${cleanQuote}"`);
    } else {
      if (currentQuotes.length > 0) {
        processed.push(`<div class="ic-verse-box"><div class="ic-box-header">Quoted Scripture</div>${currentQuotes.join('<br/><br/>')}</div>`);
        currentQuotes = [];
      }
      processed.push(pClean);
    }
  }
  if (currentQuotes.length > 0) {
    processed.push(`<div class="ic-verse-box"><div class="ic-box-header">Quoted Scripture</div>${currentQuotes.join('<br/><br/>')}</div>`);
  }
  
  return processed.map(block => {
    if (block.startsWith('<div class="ic-verse-box">')) return block;
    return parseMarkdown(block);
  }).join('\n');
}

/**
 * Parses a multi-verse range string (e.g., "2:68-71" or "2:67") and returns an array
 * of verse objects containing their ayah number, Arabic text, and Droge English translation.
 * 
 * @param {string} rangeStr - The verse range string (e.g., "2:68-71")
 * @param {string|number} surah - The surah number
 * @returns {Array<{number: number, arabic: string, english: string}>}
 */
export function getRangeVerses(rangeStr, surah) {
  if (!rangeStr || !surah) return [];
  const [s, r] = rangeStr.split(':');
  if (!s || !r) return [];
  const [startStr, endStr] = r.split('-');
  const start = parseInt(startStr, 10);
  const end = endStr ? parseInt(endStr, 10) : start;
  if (isNaN(start) || isNaN(end) || start > end) return [];

  const arabicData = loadArabicSurah(surah);
  const englishData = loadEnglishData();

  const list = [];
  for (let v = start; v <= end; v++) {
    const key = `${s}:${v}`;
    const ar = arabicData.versesHTML ? (arabicData.versesHTML[String(v)] || arabicData.verses[String(v)] || '') : (arabicData.verses[String(v)] || '');
    const enObj = englishData[key];
    const en = enObj ? (enObj.html || enObj.text || '') : '';
    list.push({ number: v, arabic: ar, english: en });
  }
  return list;
}
