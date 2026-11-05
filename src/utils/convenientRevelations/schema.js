/**
 * JSON-LD for `/discover/convenient-revelations`:
 *   hub   → CollectionPage + ItemList (4 chapters → 3 items each) + BreadcrumbList
 *   part  → Article (+ citation: the chapter's primary sources) + BreadcrumbList
 * Named with the reader-facing titles, never the URL slug's old name. No FAQPage / ClaimReview.
 */
import { buildBreadcrumbSchema, DEFAULT_LOGO_URL } from '../seoFactory.js';
import { BASE, BASE_PATH, ARTICLE_NAME, HUB, DATE_PUBLISHED, LABELS } from './config.js';

const SITE_NAME = LABELS.siteName;

const publisher = { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: DEFAULT_LOGO_URL } };

const crumbs = (site, extra = []) => buildBreadcrumbSchema([
  { name: SITE_NAME, url: `${site}${BASE}/` },
  { name: LABELS.hubCrumb, url: `${site}${BASE}/discover` },
  { name: ARTICLE_NAME, url: `${site}${BASE_PATH}` },
  ...extra,
]);

export function hubSchema({ site, model }) {
  const url = `${site}${BASE_PATH}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      crumbs(site),
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        name: HUB.h1,
        headline: HUB.seo.title,
        description: HUB.seo.description,
        url,
        inLanguage: 'en',
        publisher,
        datePublished: DATE_PUBLISHED,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: model.parts.length,
          itemListElement: model.parts.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${site}${p.href}`,
            item: {
              '@type': 'ItemList',
              name: p.label,
              url: `${site}${p.href}`,
              numberOfItems: p.items.length,
              itemListElement: p.items.map((it, j) => ({ '@type': 'ListItem', position: j + 1, name: it.copy.title.text, url: `${site}${it.href}` })),
            },
          })),
        },
      },
    ],
  };
}

export function partSchema({ site, part }) {
  const url = `${site}${part.href}`;
  const citation = part.citations.slice(0, 30).map(c => ({ '@type': 'CreativeWork', name: c.label, url: c.href.startsWith('http') ? c.href : `${site}${c.href}` }));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      crumbs(site, [{ name: part.label, url }]),
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: part.seo.title,
        description: part.seo.description,
        url,
        mainEntityOfPage: url,
        inLanguage: 'en',
        author: { '@type': 'Organization', name: SITE_NAME, url: `${site}${BASE}/` },
        publisher,
        datePublished: DATE_PUBLISHED,
        dateModified: DATE_PUBLISHED,
        isPartOf: { '@type': 'CollectionPage', name: HUB.h1, url: `${site}${BASE_PATH}` },
        citation: citation.length ? citation : undefined,
      },
    ],
  };
}
