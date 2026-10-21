/**
 * JSON-LD for the Hadith Reliability pages, per the agreed SEO spec:
 * Article (+ citation, about → Wikidata) and BreadcrumbList on every page; ItemList on list pages.
 * No FAQPage (restricted since 2023) and no ClaimReview (deprecated June 2025; polemic framing).
 */
import { buildBreadcrumbSchema, SITE_NAME, DEFAULT_LOGO_URL } from '../seoFactory.js';
import { WIKIDATA_ABOUT } from './seo.js';
import { BASE, BASE_PATH } from './config.js';

export const DATE_PUBLISHED = '2026-10-20';

const publisher = { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: DEFAULT_LOGO_URL } };

function article({ url, headline, description, image, citations = [], dateModified }) {
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline,
    description,
    url,
    mainEntityOfPage: url,
    image: image ? [image] : undefined,
    inLanguage: 'en',
    author: { '@type': 'Organization', name: SITE_NAME, url: 'https://readyapologia.com' },
    publisher,
    datePublished: DATE_PUBLISHED,
    dateModified: dateModified || DATE_PUBLISHED,
    about: WIKIDATA_ABOUT,
    citation: citations.length ? citations : undefined,
  };
}

function crumbs(site, extra) {
  return buildBreadcrumbSchema([
    { name: 'Ready Apologia', url: `${site}${BASE}/` },
    { name: 'Discover', url: `${site}${BASE}/discover` },
    { name: 'Hadith reliability', url: `${site}${BASE_PATH}` },
    ...extra,
  ]);
}

function itemList(site, cases) {
  return {
    '@type': 'ItemList',
    numberOfItems: cases.length,
    itemListElement: cases.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.seoTitle || c.shortTitle, url: `${site}${c.href}` })),
  };
}

export function hubSchema({ site, model, image }) {
  const url = `${site}${BASE_PATH}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildBreadcrumbSchema([
        { name: 'Ready Apologia', url: `${site}${BASE}/` },
        { name: 'Discover', url: `${site}${BASE}/discover` },
        { name: 'Hadith reliability', url },
      ]),
      article({ url, headline: model.meta.seo.hub.title, description: model.meta.seo.hub.description, image }),
      itemList(site, model.cases.map(c => ({ ...c, seoTitle: c.seo.title }))),
    ],
  };
}

export function glanceSchema({ site, model, image, path }) {
  const url = `${site}${path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      crumbs(site, [{ name: 'At a glance', url }]),
      article({ url, headline: model.meta.seo.glance.title, description: model.meta.seo.glance.description, image }),
      itemList(site, model.cases.map(c => ({ ...c, seoTitle: c.seo.title }))),
    ],
  };
}

export function caseSchema({ site, c, image }) {
  const url = `${site}${c.href}`;
  const citations = c.sources.sunnah.slice(0, 12).map(s => ({ '@type': 'CreativeWork', name: s.label, url: s.href }));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      crumbs(site, [{ name: c.seo.title, url }]),
      article({ url, headline: c.seo.title, description: c.seo.description, image, citations }),
    ],
  };
}
