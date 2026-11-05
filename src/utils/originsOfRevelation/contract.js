/**
 * The copy contract for /discover/origins-of-revelation (`content.js`), checked at the start of every
 * build. The contract is closed: an unknown field (a typo such as `evaluationMD`) fails instead of
 * silently dropping a box; a card or reference must name exactly one source; required LABELS must be
 * present, so no control renders without a name.
 *
 * Shape (all `*Md` fields are inline Markdown: `*em*`, `**strong**`, `[text](href)`; internal hrefs
 * are written without BASE):
 *   SEO { title, description, keywords?, ogAlt? }      HEADER { eyebrow, h1, hookMd, contextLine, framingMd? }
 *   CATALOG? { title, description }                    CLOSING { heading, md }
 *   LABELS { …config.REQUIRED_LABELS, sourcesGroups{…}, sourcesGroupNotes?{…}, classicalDeeper?, evaluationDeeper? }
 *   SECTIONS[] { id, aliases[], dataItemId|null, nav, number?, h2, glance?, showcase?, witnesses?, introMd?,
 *                groups[] { key, label, cards[], collapsed?[], collapsedSummary? },
 *                classicalMd?, classicalDeeperMd?, evaluationMd?, evaluationDeeperMd?, deeper?[] { summary, md } }
 *     glance { title, takeawayMd, chips[] }   showcase { caption?, ariaLabel?, left, right, noteMd? }
 *     side { title, items[] { textMd, ref } }   witnesses { caption, items[] { name, meta?, position?, quoteMd?, ref } }
 *     card { data | extra, label?, noteMd?, chips?[ref] }   ref { data | extra | href, label? }
 *     data pointer { itemId, group, index }  (itemId = the data item id; group ∈ config.DATA_GROUPS)
 *   EXTRA_QUOTES { key: { text, label?, href, sourceFile, sourceKey?, lang?, url?, note?, edits?, arabic?, arabicSourceFile?, arabicSourceKey? } }
 *     sourceFile is a repo path or 'external' (then `url` names the checked page and must equal `href`)
 *   REPEATS[] { itemId, group, index, sections[] }  (a data quote deliberately shown in several sections)
 */

import * as C from './config.js';
import { fail } from './refs.js';

const K = list => new Set(list);
const ALLOWED = {
  exports: K(['SEO', 'HEADER', 'LABELS', 'SECTIONS', 'EXTRA_QUOTES', 'CLOSING', 'REPEATS', 'CATALOG']),
  SEO: K(['title', 'description', 'keywords', 'ogAlt']),
  HEADER: K(['eyebrow', 'h1', 'hookMd', 'contextLine', 'framingMd', 'whosWhoSummary', 'whosWhoMd']),
  CLOSING: K(['heading', 'md']),
  CATALOG: K(['title', 'description']),
  LABELS: K([...C.REQUIRED_LABELS, 'sourcesGroups', 'sourcesGroupNotes', 'classicalDeeper', 'evaluationDeeper', 'onThisPage', 'further']),
  section: K(['id', 'aliases', 'dataItemId', 'nav', 'number', 'h2', 'glance', 'showcase', 'witnesses', 'introMd', 'groups', 'classicalMd', 'classicalDeeperMd', 'evaluationMd', 'evaluationDeeperMd', 'deeper']),
  glance: K(['title', 'takeawayMd', 'chips']),
  showcase: K(['caption', 'ariaLabel', 'left', 'right', 'noteMd']),
  side: K(['title', 'items']),
  scItem: K(['textMd', 'ref']),
  witnesses: K(['caption', 'items']),
  witness: K(['name', 'meta', 'position', 'quoteMd', 'glossMd', 'ref']),
  group: K(['key', 'label', 'cards', 'collapsed', 'collapsedSummary']),
  card: K(['data', 'extra', 'label', 'noteMd', 'chips']),
  ref: K(['data', 'extra', 'href', 'label']),
  pointer: K(['itemId', 'group', 'index']),
  deeper: K(['summary', 'md']),
  extra: K(['text', 'label', 'href', 'sourceFile', 'sourceKey', 'lang', 'url', 'note', 'edits', 'arabic', 'arabicSourceFile', 'arabicSourceKey']),
  repeat: K(['itemId', 'group', 'index', 'sections']),
};
// islamic / angel / spirit in the five accounts; nt / quran in the closing method section.
const GROUP_KEYS = new Set(['islamic', 'angel', 'spirit', 'nt', 'quran']);

export function assertKeys(obj, kind, where) {
  if (obj == null) return;
  if (typeof obj !== 'object' || Array.isArray(obj)) fail(`${where}: expected an object`);
  for (const k of Object.keys(obj)) if (!ALLOWED[kind].has(k)) fail(`${where}: unknown field "${k}" (allowed: ${[...ALLOWED[kind]].join(', ')})`);
}

function assertPointer(d, where) {
  assertKeys(d, 'pointer', where);
  if (typeof d.itemId !== 'string' || !C.DATA_GROUPS.includes(d.group) || !Number.isInteger(d.index)) fail(`${where}: data pointer must be { itemId, group (${C.DATA_GROUPS.join('|')}), index }`);
}
function assertRef(r, where) {
  assertKeys(r, 'ref', where);
  const n = ['data', 'extra', 'href'].filter(k => r[k] != null).length;
  if (n !== 1) fail(`${where}: a reference names exactly one of data / extra / href (has ${n})`);
  if (r.data) assertPointer(r.data, `${where}.data`);
}
function assertCard(c, where) {
  assertKeys(c, 'card', where);
  const n = ['data', 'extra'].filter(k => c[k] != null).length;
  if (n !== 1) fail(`${where}: a card names exactly one source, data or extra (has ${n})`);
  if (c.data) assertPointer(c.data, `${where}.data`);
  (c.chips || []).forEach((r, i) => assertRef(r, `${where}.chips[${i}]`));
}

/** Required LABELS present and non-empty. */
export function checkLabels(LABELS) {
  for (const k of C.REQUIRED_LABELS) if (typeof LABELS[k] !== 'string' || !LABELS[k].trim()) fail(`LABELS.${k} is required`);
  for (const [k, keys] of Object.entries(C.REQUIRED_LABEL_GROUPS)) {
    for (const g of keys) if (typeof LABELS[k]?.[g] !== 'string' || !LABELS[k][g].trim()) fail(`LABELS.${k}.${g} is required`);
  }
}

/** Closed-contract check of the whole content module. */
export function validateContent(T) {
  for (const k of Object.keys(T)) if (!ALLOWED.exports.has(k)) fail(`content.js exports unknown "${k}"`);
  for (const k of ['SEO', 'HEADER', 'LABELS', 'SECTIONS', 'CLOSING']) if (!T[k]) fail(`content.js is missing export ${k}`);
  assertKeys(T.SEO, 'SEO', 'SEO'); assertKeys(T.HEADER, 'HEADER', 'HEADER'); assertKeys(T.CLOSING, 'CLOSING', 'CLOSING');
  assertKeys(T.CATALOG, 'CATALOG', 'CATALOG'); assertKeys(T.LABELS, 'LABELS', 'LABELS');
  checkLabels(T.LABELS);
  T.SECTIONS.forEach((s, si) => {
    const w = `SECTIONS[${si}] (${s.id})`;
    assertKeys(s, 'section', w);
    assertKeys(s.glance, 'glance', `${w}.glance`);
    if (s.showcase) {
      assertKeys(s.showcase, 'showcase', `${w}.showcase`);
      for (const side of ['left', 'right']) {
        assertKeys(s.showcase[side], 'side', `${w}.showcase.${side}`);
        (s.showcase[side]?.items || []).forEach((it, i) => { assertKeys(it, 'scItem', `${w}.showcase.${side}[${i}]`); if (it.ref) assertRef(it.ref, `${w}.showcase.${side}[${i}].ref`); });
      }
    }
    if (s.witnesses) {
      assertKeys(s.witnesses, 'witnesses', `${w}.witnesses`);
      s.witnesses.items.forEach((x, i) => { assertKeys(x, 'witness', `${w}.witnesses[${i}]`); if (x.ref) assertRef(x.ref, `${w}.witnesses[${i}].ref`); });
    }
    (s.groups || []).forEach((g, gi) => {
      const gw = `${w}.groups[${gi}]`;
      assertKeys(g, 'group', gw);
      if (!GROUP_KEYS.has(g.key)) fail(`${gw}: group key must be one of ${[...GROUP_KEYS].join(', ')}`);
      (g.cards || []).forEach((c, ci) => assertCard(c, `${gw}.cards[${ci}]`));
      (g.collapsed || []).forEach((c, ci) => assertCard(c, `${gw}.collapsed[${ci}]`));
    });
    (s.deeper || []).forEach((d, i) => assertKeys(d, 'deeper', `${w}.deeper[${i}]`));
  });
  for (const [k, x] of Object.entries(T.EXTRA_QUOTES || {})) {
    const w = `EXTRA_QUOTES["${k}"]`;
    assertKeys(x, 'extra', w);
    if (typeof x.text !== 'string' || !x.text) fail(`${w}: text is required`);
    if (!x.href) fail(`${w}: href is required`);
    if (!x.sourceFile) fail(`${w}: sourceFile is required (a repo path, or 'external')`);
    if (x.url != null && (x.sourceFile !== 'external' || x.url !== x.href)) fail(`${w}: url is only for external sources and must equal href`);
    if (x.lang != null && !['ar', 'en'].includes(x.lang)) fail(`${w}: lang must be 'ar' or 'en'`);
  }
  const seen = new Set();
  (T.REPEATS || []).forEach((r, i) => {
    assertKeys(r, 'repeat', `REPEATS[${i}]`);
    const k = `${r.itemId}/${r.group}/${r.index}`;
    if (seen.has(k)) fail(`REPEATS lists ${k} twice`);
    seen.add(k);
  });
}
