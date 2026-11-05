/**
 * JSON-LD for /discover/quran-preservation, modelled on hadithReliability/schema.js:
 * Article (with a `citation` list of the Sunnah.com pages quoted) + BreadcrumbList.
 * Deliberately no FAQPage (restricted since 2023) and no ClaimReview.
 */
import { buildBreadcrumbSchema, SITE_NAME, DEFAULT_LOGO_URL } from '../seoFactory.js';
import { BASE, BASE_PATH, DATE_PUBLISHED, DATE_MODIFIED } from './config.js';

export function pageSchema({ site, model, image }) {
  const url = `${site}${BASE_PATH}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
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
        citation: model.citations.map(c => ({ '@type': 'CreativeWork', name: c.name, url: c.url })),
      },
    ],
  };
}
