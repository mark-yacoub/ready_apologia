/**
 * Build-time entry for /discover/quran-preservation: imports the dataset (an ES import, so Vite
 * watches it and `astro dev` picks up a fresh import) and memoises the view model built by the pure
 * `buildModel` in model.js. The dataset is read-only; copy overrides live in config.js.
 */
import dataset from '../../data/discover/islam/scripture/quran_preservation.json';
import { CONFIG } from './config.js';
import { buildModel } from './model.js';

let cache = null;

export function loadQuranPreservation() {
  if (!cache) {
    cache = buildModel(dataset, CONFIG);
    if (cache.warnings.length) console.warn(`[quranPreservation]\n  - ${cache.warnings.join('\n  - ')}`);
  }
  return cache;
}
