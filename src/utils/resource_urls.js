/**
 * Centralized utility for resolving external resource URLs.
 * Abstracting this logic out of Astro components ensures that if
 * a third-party site changes its routing structure, we only need to update it here.
 */

/**
 * Resolves the verification URL for a specific Qira'at variant.
 * Relies on quran.com's numeric redirection logic.
 * 
 * @param {string|number} surah - The Surah number.
 * @param {string|number} ayah - The Ayah (verse) number.
 * @returns {string} The URL to the qiraat source.
 */
export const getQiraatVerificationUrl = (surah, ayah) => {
  return `https://quran.com/${surah}/${ayah}/qiraat`;
};
