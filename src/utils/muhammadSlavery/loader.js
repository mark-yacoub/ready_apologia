/**
 * Build-time entry for /discover/muhammad-and-slavery. Imports the read-only dataset (an ES import,
 * so `astro dev` picks up a fresh import), gathers the repo sources the model verifies against, and
 * memoises the view model built by the pure `buildModel` in model.js.
 *
 *   droge       src/data/quran/english/droge_translation.json (the Qurʾān translation the site uses)
 *   tafsir      loadIslamicCommentaries(): the same commentary the /quran/S/A/tafsir/* pages publish
 *   permalinks  /hadith/<collection>/<number> pages that exist (annotated hadiths, loadHadithModel)
 *   arabic      key-quote Arabic (arabic.js)
 *
 * A model error fails the build (it lists every problem). Warnings print once as a summary.
 */
import dataset from '../../data/discover/islam/prophet/slavery.json';
import drogeData from '../../data/quran/english/droge_translation.json';
import quranMeta from '../../data/quran/arabic/meta.json';
import { loadIslamicCommentaries } from '../islamic_commentaries_loader.js';
import { loadHadithModel } from '../hadithLoader.js';
import { CONFIG } from './config.js';
import { buildContext } from './context.js';
import { buildModel } from './model.js';

export function loadContext() {
  return buildContext({ droge: drogeData, meta: quranMeta, commentaries: loadIslamicCommentaries(), hadithModel: loadHadithModel() });
}

let cache = null;

export function loadMuhammadSlavery() {
  if (!cache) {
    cache = buildModel(dataset, CONFIG, loadContext());
    if (cache.warnings.length) console.warn(`[muhammadSlavery] ${cache.warnings.length} warning(s)\n  - ${cache.warnings.slice(0, 12).join('\n  - ')}${cache.warnings.length > 12 ? `\n  - … ${cache.warnings.length - 12} more` : ''}`);
  }
  return cache;
}
