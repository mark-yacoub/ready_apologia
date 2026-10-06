/**
 * Lazy per-hadith payload for "Read full hadith", the Muslim-response drawer and parallels.
 * Generated at build time: /hadith/data/muslim-1422a.json
 */
import { loadHadithModel } from '../../../utils/hadithLoader.js';

export function getStaticPaths() {
  return loadHadithModel().allSlugs.map(id => ({ params: { id } }));
}

export function GET({ params }) {
  const payload = loadHadithModel().getHadithJson(params.id);
  return new Response(JSON.stringify(payload), {
    status: payload ? 200 : 404,
    headers: { 'Content-Type': 'application/json' },
  });
}
