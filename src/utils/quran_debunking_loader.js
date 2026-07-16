import debunkingMiracles from '../data/quran/debunking/scientific_miracles_debunked.json' with { type: 'json' };

export function loadDebunkingMiracles() {
  return debunkingMiracles || {};
}
