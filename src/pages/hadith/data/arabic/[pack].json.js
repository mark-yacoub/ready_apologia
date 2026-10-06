/**
 * Arabic excerpt pack per subcategory, fetched only when the reader switches to Arabic.
 * Generated at build time: /hadith/data/arabic/<category>--<subcategory>.json
 */
import { loadHadithModel } from '../../../../utils/hadithLoader.js';

export function getStaticPaths() {
  return loadHadithModel().categories.flatMap(c =>
    c.subcategories.map(s => ({ params: { pack: `${c.slug}--${s.slug}` } })),
  );
}

export function GET({ params }) {
  const [cat, sub] = params.pack.split('--');
  const pack = loadHadithModel().getArabicPack(cat, sub);
  return new Response(JSON.stringify(pack), {
    status: pack ? 200 : 404,
    headers: { 'Content-Type': 'application/json' },
  });
}
