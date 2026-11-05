/**
 * JSON-LD for /discover/from-mecca-to-medina, modelled on hadithReliability/schema.js:
 * BreadcrumbList + Article (with `citation`: every Sunnah.com page and tafsīr page quoted, and Wikidata
 * `about`) + ItemList of the page's items (`url` = page#id). No ClaimReview.
 * FAQPage is a pending user decision: it is emitted only when config `EMIT_FAQ` is true, and then only
 * from questions that are visible on the page (the section questions with their items' takeaways).
 */
import { buildBreadcrumbSchema, SITE_NAME, DEFAULT_LOGO_URL } from '../seoFactory.js';
import { BASE, BASE_PATH, DATE_PUBLISHED, DATE_MODIFIED } from './config.js';

export function pageSchema({ site, model, image }) {
  const url = `${site}${BASE_PATH}`;
  const abs = href => (/^https?:/.test(href) ? href : `${site}${href}`);
  const graph = [
    buildBreadcrumbSchema([
      { name: 'Ready Apologia', url: `${site}${BASE}/` },
      { name: 'Discover', url: `${site}${BASE}/discover` },
      { name: model.seo.breadcrumb || model.seo.title, url },
    ]),
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: model.seo.title,
      description: model.seo.description,
      url,
      mainEntityOfPage: url,
      image: image ? [image] : undefined,
      inLanguage: 'en',
      author: { '@type': 'Organization', name: SITE_NAME, url: 'https://readyapologia.com' },
      publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: DEFAULT_LOGO_URL } },
      datePublished: DATE_PUBLISHED,
      dateModified: DATE_MODIFIED,
      about: model.seo.about.map(a => ({ '@type': 'Thing', name: a.name, sameAs: a.sameAs })),
      citation: model.citations.map(c => ({ '@type': 'CreativeWork', name: c.name, url: abs(c.url) })),
    },
    {
      '@type': 'ItemList',
      numberOfItems: model.items.length,
      itemListElement: model.items.map(it => ({ '@type': 'ListItem', position: it.number, name: it.title, url: `${url}#${it.id}` })),
    },
  ];
  if (model.emitFaq) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: model.sections.map(s => ({
        '@type': 'Question',
        name: s.question,
        acceptedAnswer: { '@type': 'Answer', text: s.items.map(i => i.takeaway).join(' ') },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
