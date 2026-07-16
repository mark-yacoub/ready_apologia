import unifiedCatenaLookup from '../data/quran/contradictions/unified_catena_lookup.json' with { type: 'json' };

export function loadQuranContradictions() {
  return unifiedCatenaLookup || {};
}

