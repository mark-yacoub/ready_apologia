/**
 * Shape contract for the copy JSON (copy/{hadith,quran,answers}.json). Fails with JSON paths on missing
 * required fields, unknown keys (a typo is never silently ignored) and malformed reference keys, like
 * hadithReliability/validate.js does for its dataset. Content checks (verbatim quotes, tone, counts)
 * are the model's job; this only guarantees the model reads what the writer meant.
 */
import { parseRef } from './text.js';

const str = v => typeof v === 'string';
const S = { type: 'string' };
const OPT = s => ({ ...s, optional: true });
const ARR = item => ({ type: 'array', item });
const OBJ = (fields, opts = {}) => ({ type: 'object', fields, ...opts });
const MAP = value => ({ type: 'map', value });
const REF = { type: 'ref' };

const TEXT = OBJ({ text: S, ref: OPT(REF) });
const SHOWCASES = {
  versions: OBJ({ type: S, note: OPT(S), items: ARR(OBJ({ label: S, text: S, ref: REF })) }),
  witnesses: OBJ({ type: S, note: OPT(S), items: ARR(OBJ({ who: S, work: OPT(S), deathAh: OPT({ type: 'number' }), text: S, ref: REF })) }),
  confrontation: OBJ({ type: S, note: OPT(S), left: OBJ({ title: S, items: ARR(TEXT) }), right: OBJ({ title: S, items: ARR(TEXT) }) }),
  number_fan: OBJ({ type: S, unit: OPT(S), note: OPT(S), items: ARR(OBJ({ value: S, caption: OPT(S), text: S, ref: OPT(REF) })) }),
  timeline: OBJ({ type: S, note: OPT(S), points: ARR(OBJ({ step: S, text: S, ref: OPT(REF) })) }),
  facts: OBJ({ type: S, note: OPT(S), items: ARR(TEXT) }),
};
const SHOWCASE = { type: 'showcase' };
const CLASSICAL = { type: 'nullable', of: OBJ({ text: S, sources: ARR(OBJ({ label: S, url: S })) }) };
const CROSS = OPT(ARR(OBJ({ to: S, label: OPT(S) })));
const SEO = OBJ({ title: S, description: S });
const SECTION = OBJ({ question: S, dek: OPT(S) });
const PAGE = OBJ({ seo: SEO, h1: S, intro: S, breadcrumb: OPT(S), sections: OPT(MAP(SECTION)) });

const ITEM = OBJ({
  title: S, context: S, hook: S, takeaway: S, showcase: SHOWCASE,
  keyQuote: OBJ({ text: S, ref: REF }), classical: CLASSICAL, comparison: S, crossLinks: CROSS,
});
const VERSE = OBJ({
  title: S, context: S, hook: S, takeaway: S, showcase: SHOWCASE,
  tafsirQuotes: ARR(OBJ({ who: S, lead: OPT(S), text: S, ref: REF })),
  classical: CLASSICAL, comparison: S, crossLinks: CROSS,
  verifyChips: OPT(ARR(OBJ({ label: S, ref: REF }))),
  relatedNote: OPT(OBJ({ title: S, intro: OPT(S), items: ARR(OBJ({ lead: OPT(S), ref: REF, parts: ARR(OBJ({ text: S, ref: REF })) })) })),
});
const CARD = OBJ({ text: OPT(S), ref: OPT(REF), label: OPT(S), grade: OPT(S), itemId: OPT(S) });
const ANSWER = OBJ({
  question: S, context: S, answer: S, answerTexts: ARR(CARD), takeaway: S, showcase: SHOWCASE,
  texts: ARR(CARD), classical: CLASSICAL, comparison: S, crossLinks: CROSS,
});

export const COPY_SCHEMAS = {
  hadith: OBJ({ page: PAGE, reportNotes: MAP(S), items: MAP(ITEM) }),
  quran: OBJ({ page: PAGE, items: MAP(VERSE) }),
  answers: OBJ({
    hub: OBJ({
      seo: SEO, h1: S, intro: S, breadcrumb: OPT(S),
      sections: MAP(OBJ({ question: S, dek: OPT(S), rows: ARR(S), more: ARR(S) })),
      startHere: OBJ({ title: S, hook: S, showcase: SHOWCASE, test: OPT(S) }),
      browseLabel: S,
      browse: OBJ({ hadith: OBJ({ title: S, text: S, description: S }), quran: OBJ({ title: S, text: S, description: S }), answers: OBJ({ title: S, text: S, description: S }) }),
      sectionAll: OBJ({ mixed: S, accounts: S, passages: S }),
      sourcesFooter: OBJ({ label: S, items: MAP(S) }),
    }),
    page: PAGE,
    items: MAP(ANSWER),
    labels: MAP(S),
    catalog: OBJ({ title: S, description: S }),
    otherParts: MAP(OBJ({ title: S, description: S })),
    breadcrumbs: OBJ({ hub: S, jsonLd: ARR(S), jsonLdPages: MAP(S) }),
  }),
};

function check(v, schema, path, out) {
  if (v === undefined) { if (!schema.optional) out.push(`${path}: missing`); return; }
  switch (schema.type) {
    case 'string': if (!str(v)) out.push(`${path}: expected a string`); return;
    case 'number': if (typeof v !== 'number') out.push(`${path}: expected a number`); return;
    case 'ref': if (!str(v) || !parseRef(v)) out.push(`${path}: not a reference key ("bukhari:4234", "muslim:1456a", "quran:4:24", "tabari:4:24"): ${JSON.stringify(v)}`); return;
    case 'nullable': if (v !== null) check(v, schema.of, path, out); return;
    case 'array':
      if (!Array.isArray(v)) { out.push(`${path}: expected an array`); return; }
      v.forEach((x, i) => check(x, schema.item, `${path}[${i}]`, out));
      return;
    case 'map':
      if (!v || typeof v !== 'object' || Array.isArray(v)) { out.push(`${path}: expected an object`); return; }
      for (const [k, x] of Object.entries(v)) check(x, schema.value, `${path}.${k}`, out);
      return;
    case 'showcase': {
      const s = SHOWCASES[v?.type];
      if (!s) { out.push(`${path}.type: unknown showcase type ${JSON.stringify(v?.type)}`); return; }
      check(v, s, path, out);
      return;
    }
    case 'object':
      if (!v || typeof v !== 'object' || Array.isArray(v)) { out.push(`${path}: expected an object`); return; }
      for (const k of Object.keys(v)) if (!(k in schema.fields)) out.push(`${path}.${k}: unknown key`);
      for (const [k, s] of Object.entries(schema.fields)) check(v[k], s, `${path}.${k}`, out);
      return;
    default: out.push(`${path}: bad schema`);
  }
}

/** @returns {string[]} problems, each prefixed with its JSON path (empty when the copy is well formed) */
export function validateCopy(copy) {
  const out = [];
  for (const [part, schema] of Object.entries(COPY_SCHEMAS)) check(copy[part], schema, `copy/${part}.json`, out);
  return out;
}
