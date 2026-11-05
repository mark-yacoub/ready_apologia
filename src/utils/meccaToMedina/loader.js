/**
 * Build-time entry for /discover/from-mecca-to-medina: imports the read-only dataset (an ES import, so
 * Vite watches it), wires the repo's own Qurʾān / tafsīr / hadith corpora in as `providers`, and
 * memoises the view model built by the pure `buildModel` in model.js. Copy overrides live in config.js.
 */
import dataset from '../../data/discover/islam/scripture/from_mecca_to_medina.json';
import { CONFIG } from './config.js';
import { buildModel } from './model.js';
import { repoProviders } from './providers.js';

let cache = null;

export function loadMeccaToMedina() {
  if (!cache) {
    cache = buildModel(dataset, CONFIG, repoProviders());
    if (cache.warnings.length) console.warn(`[meccaToMedina]\n  - ${cache.warnings.join('\n  - ')}`);
  }
  return cache;
}
