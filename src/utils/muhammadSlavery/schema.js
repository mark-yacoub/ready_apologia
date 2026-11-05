/**
 * JSON-LD for /discover/muhammad-and-slavery, modelled on hadithReliability/schema.js:
 * Article (with a `citation` list of the Sunnah.com pages quoted) + BreadcrumbList (+ ItemList of the
 * page's items). Deliberately no FAQPage (restricted since 2023; the old /counter-apologetics shipped
 * one: dropped pending user sign-off) and no ClaimReview.
 */
import { buildBreadcrumbSchema, SITE_NAME, DEFAULT_LOGO_URL } from '../seoFactory.js';
import { BASE, BASE_PATH, DATE_PUBLISHED, DATE_MODIFIED, LABELS } from './config.js';

const publisher = { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: DEFAULT_LOGO_URL } };

function article({ url, headline, description, image, citations = [] }) {
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
    dateModified: DATE_MODIFIED,
    citation: citations.length ? citations.map(c => ({ '@type': 'CreativeWork', name: c.name, url: c.url })) : undefined,
  };
}

function itemList(site, items) {
  return {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.title, url: `${site}${it.href}` })),
  };
}

/**
 * Breadcrumbs: Ready Apologia → Discover → hub (→ page), names from the copy (breadcrumbs.jsonLd: first,
 * second and last entries). An intermediate "#panel" crumb is visible-only: in JSON-LD it would repeat the
 * Discover URL once the fragment is dropped.
 */
function crumbs(site, model, extra = []) {
  const names = model.breadcrumbs?.jsonLd || [];
  const [home = 'Ready Apologia', discover = 'Discover'] = names;
  const hub = names.length > 2 ? names[names.length - 1] : (model.hub.breadcrumb || LABELS.hub);
  return buildBreadcrumbSchema([
    { name: home, url: `${site}${BASE}/` },
    { name: discover, url: `${site}${BASE}/discover` },
    { name: hub, url: `${site}${BASE_PATH}` },
    ...extra,
  ]);
}

export function hubSchema({ site, model, image }) {
  const url = `${site}${BASE_PATH}`;
  const items = [...model.pages.hadith.items, ...model.pages.quran.items, ...model.pages.answers.items];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      crumbs(site, model),
      article({ url, headline: model.seo.hub.title, description: model.seo.hub.description, image }),
      itemList(site, items),
    ],
  };
}

export function pageSchema({ site, model, key, image }) {
  const p = model.pages[key];
  const url = `${site}${p.path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      crumbs(site, model, [{ name: model.breadcrumbs?.jsonLdPages?.[key] || p.breadcrumb, url }]),
      article({ url, headline: p.seo.title, description: p.seo.description, image, citations: p.citations }),
      itemList(site, p.items),
    ],
  };
}
