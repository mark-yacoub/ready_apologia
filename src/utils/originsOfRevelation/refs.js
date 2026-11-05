/**
 * References → readable, link-policy-checked chips for /discover/origins-of-revelation.
 *
 * A data reference (`bible/mk/9/17-18`, `quran/22/52`, `ibnkathir/5/1`, a Sunnah.com URL or an
 * archive.org work) or an href written in the copy (`/bible/rv/1#17`, `https://…`) becomes
 * `{ label, href, external, attrs, group, sortKey, kind }`. Labels come from book / collection / work
 * names, never from codes. Every rule that can mislead a reader fails the build instead:
 *   - an unknown Bible book id (e.g. `rev`), an unknown collection or archive.org work
 *   - a protocol-relative (`//host`) or non-https external link, or a host not in config.HOSTS
 *   - a hadith label ("Ṣaḥīḥ al-Bukhārī 3", "Sahih Bukhari 3", "Muslim 160a") not linking to Sunnah.com
 */

import * as C from './config.js';
import { linkAttrs } from '../hadithReliability/render.js';
import { mapLxxToMt } from '../scripture_mapper.js';
import BOOKS_META from '../../data/books_meta.json' with { type: 'json' };

export class OrvModelError extends Error {
  constructor(msg) { super(`[originsOfRevelation] ${msg}`); this.name = 'OrvModelError'; }
}
export const fail = msg => { throw new OrvModelError(msg); };

// ---- books ---------------------------------------------------------------------------------------
/** Site book ids → { name, testament, order } (canonical order: OT then NT). */
export const BOOKS = (() => {
  const m = new Map();
  let order = 0;
  for (const t of ['ot', 'nt']) for (const b of BOOKS_META[t] || []) m.set(b.id, { name: b.name, testament: t, order: order++ });
  return m;
})();
/** Reader-facing book name: no LXX alias in brackets ("1 Kings (3 Kingdoms)" → "1 Kings"). */
const bookName = (name, single) => {
  const n = name.replace(/\s*\(.*\)$/, '');
  return n === 'Psalms' && single ? 'Psalm' : n;
};
const bookOf = (id, where) => BOOKS.get(id) || fail(`${where} uses unknown Bible book id "${id}"`);

/**
 * Label for a Bible passage. The reader uses LXX numbering; when the familiar (MT) number differs,
 * it comes first: "Psalm 91:11–12 (LXX 90:11–12)". A range crossing an MT chapter keeps both chapters.
 */
export function bibleLabel(book, ch, v1, v2 = null) {
  const meta = bookOf(book, `Bible label ${book} ${ch}:${v1}`);
  const name = bookName(meta.name, true);
  const lxx = `${ch}:${v1}${v2 ? `–${v2}` : ''}`;
  if (meta.testament !== 'ot') return `${name} ${lxx}`;
  const a = mapLxxToMt(book, ch, v1);
  const b = v2 ? mapLxxToMt(book, ch, v2) : null;
  const same = String(a.chapter) === String(ch) && String(a.verse) === String(v1) && (!b || (String(b.chapter) === String(ch) && String(b.verse) === String(v2)));
  if (same) return `${name} ${lxx}`;
  const mt = `${a.chapter}:${a.verse}${b ? (String(b.chapter) === String(a.chapter) ? `–${b.verse}` : `–${b.chapter}:${b.verse}`) : ''}`;
  return `${name} ${mt} (LXX ${lxx})`;
}

// ---- hosts / works / hadith labels ---------------------------------------------------------------
const deaccent = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[ʿʾ‘’'`]/g, '');
/** "Ṣaḥīḥ al-Bukhārī 3", "Sahih al-Bukhari 3", "Bukhari 3", "Sahih Muslim 160a", "Muslim 2114" … */
const HADITH_LABEL = /^(?:sahih\s+)?(?:al-)?(?:bukhari|muslim)\s+\d/i;
export const isHadithLabel = label => HADITH_LABEL.test(deaccent(label).trim());

export function findWork(url) {
  return C.WORKS.find(w => url === w.root || url.startsWith(`${w.root}/`) || url.startsWith(`${w.root}#`)) || null;
}

/** https URL → { host, group } per config.HOSTS (subdomains allowed). Fails on anything else. */
export function hostPolicy(url, where = 'link') {
  if (/^\/\//.test(url)) fail(`${where}: protocol-relative link "${url}" is not allowed`);
  let u;
  try { u = new URL(url); } catch { return fail(`${where}: malformed URL "${url}"`); }
  if (u.protocol !== 'https:') fail(`${where}: external links must be https (got "${url}")`);
  const host = u.hostname.replace(/^www\./, '');
  const key = Object.keys(C.HOSTS).find(h => host === h || host.endsWith(`.${h}`));
  if (!key) fail(`${where}: host "${host}" is not in config.HOSTS (add it there with its source group if it is a source we vouch for)`);
  return { host, group: C.HOSTS[key] };
}

const withAttrs = r => ({ ...r, attrs: linkAttrs({ external: r.external }) });

// ---- data references -----------------------------------------------------------------------------
/** A data reference → chip. Fails when no readable label can be derived. */
export function refFromData(reference, where = 'data reference') {
  let m;
  if ((m = reference.match(/^bible\/([a-z0-9]+)\/(\d+)\/(\d+)(?:-(\d+))?$/))) {
    const book = C.BOOK_ID_FIX[m[1]] || m[1];
    const meta = bookOf(book, `${where} "${reference}"`);
    const [, , ch, v1, v2] = m;
    return withAttrs({ kind: 'bible', label: bibleLabel(book, ch, v1, v2 || null), href: C.bibleHref(book, ch, v1), external: false, group: 'bible', sortKey: [meta.order, +ch, +v1], book, ch: +ch, v1: +v1, v2: v2 ? +v2 : null });
  }
  if ((m = reference.match(/^quran\/(\d+)\/(\d+)$/))) {
    return withAttrs({ kind: 'quran', label: `Qurʾān ${m[1]}:${m[2]} with al-Ṭabarī`, href: C.tafsirHref(m[1], m[2], 'tabari'), external: false, group: 'quran', sortKey: [0, +m[1], +m[2]] });
  }
  if ((m = reference.match(/^ibnkathir\/(\d+)\/(\d+)$/))) {
    return withAttrs({ kind: 'tafsir', label: `Ibn Kathīr on ${m[1]}:${m[2]}`, href: C.tafsirHref(m[1], m[2], 'ibn_kathir'), external: false, group: 'quran', sortKey: [1, +m[1], +m[2]] });
  }
  if ((m = reference.match(/^https:\/\/sunnah\.com\/([a-z]+):(\w+)$/))) {
    const name = C.COLLECTIONS[m[1]] || fail(`${where}: Sunnah.com reference "${reference}" uses an unknown collection`);
    return withAttrs({ kind: 'hadith', label: `${name} ${m[2]}`, href: reference, external: true, group: 'hadith', sortKey: [Object.keys(C.COLLECTIONS).indexOf(m[1]), parseInt(m[2], 10), m[2]], hadith: { collection: m[1], num: m[2] } });
  }
  const work = findWork(reference);
  if (work) { hostPolicy(reference, where); return withAttrs({ kind: 'work', label: work.label, href: reference, external: true, group: work.group, sortKey: [C.WORKS.indexOf(work)] }); }
  return fail(`${where}: cannot derive a readable label for "${reference}" (add the work to config.WORKS or fix the data)`);
}

// ---- hrefs written in the copy -------------------------------------------------------------------
/**
 * An href from content.js (card chip, EXTRA_QUOTES, markdown link) → chip.
 * `label` is required where it cannot be derived (other external works, in-page anchors).
 */
export function refFromHref(href, label = null, where = 'reference') {
  if (!href) return fail(`${where}: "${label}" has no href`);
  if (/^\/\//.test(href) || /^\/\\/.test(href)) fail(`${where}: protocol-relative link "${href}" is not allowed`);
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
    const { group } = hostPolicy(href, where);
    const sunnah = href.match(/^https:\/\/sunnah\.com\/([a-z]+):(\w+)$/);
    if (sunnah) { const r = refFromData(href, where); return { ...r, label: label || r.label }; }
    const quranCom = href.match(/^https:\/\/(?:www\.)?quran\.com\/(\d+)\/(\d+)/);
    if (quranCom) { const r = refFromData(`quran/${quranCom[1]}/${quranCom[2]}`, where); return { ...r, label: label || r.label }; }
    const work = findWork(href);
    if (work) return withAttrs({ kind: 'work', label: label || work.label, href, external: true, group: work.group, sortKey: [C.WORKS.indexOf(work)] });
    if (!label) fail(`${where}: external link "${href}" needs a label`);
    if (isHadithLabel(label)) fail(`${where}: hadith reference "${label}" must link to Sunnah.com (got ${href})`);
    return withAttrs({ kind: 'external', label, href, external: true, group, sortKey: [label] });
  }
  if (href.startsWith('#')) {
    if (!label) fail(`${where}: in-page reference "${href}" needs a label`);
    return withAttrs({ kind: 'anchor', label, href, external: false, group: null, sortKey: [label] });
  }
  if (!href.startsWith('/')) fail(`${where}: href "${href}" must be https://, /path or #anchor`);
  const p = C.BASE && href.startsWith(`${C.BASE}/`) ? href.slice(C.BASE.length) : href;
  let m;
  if ((m = p.match(/^\/bible\/([a-z0-9]+)\/(\d+)(?:\/(\d+))?(?:#(\d+))?$/))) {
    const meta = bookOf(m[1], `${where}: internal Bible link "${href}"`);
    const v = m[3] || m[4];
    return withAttrs({ kind: 'bible', label: label || (v ? bibleLabel(m[1], m[2], v) : `${bookName(meta.name, false)} ${m[2]}`), href: C.bibleHref(m[1], m[2], v), external: false, group: 'bible', sortKey: [meta.order, +m[2], +(v || 0)], book: m[1] });
  }
  if (/^\/bible\//.test(p)) fail(`${where}: internal Bible link "${href}" is not /bible/<book>/<ch>[#v]`);
  if ((m = p.match(/^\/quran\/(\d+)\/(\d+)(?:\/tafsir\/(tabari|ibn_kathir))?$/))) {
    const r = refFromData(m[3] === 'ibn_kathir' ? `ibnkathir/${m[1]}/${m[2]}` : `quran/${m[1]}/${m[2]}`, where);
    return { ...r, label: label || r.label };
  }
  if ((m = p.match(/^\/hadith\/(bukhari|muslim)\/(\w+)$/))) {
    if (!label) fail(`${where}: internal hadith link "${href}" needs a label`);
    return withAttrs({ kind: 'hadith-internal', label, href: C.sitePath(p), external: false, group: null, sortKey: [label] });
  }
  if (!label) fail(`${where}: internal link "${href}" needs a label`);
  return withAttrs({ kind: 'internal', label, href: C.sitePath(p), external: false, group: null, sortKey: [label] });
}

/**
 * Where a repo source file + key should link: scripture → the Bible reader passage, Droge / tafsir
 * JSON → the tafsir page. Null when the file is not a recognised route source.
 */
export function routeForSource(sourceFile, sourceKey) {
  let m;
  if ((m = String(sourceFile).match(/^src\/data\/scripture\/(?:nasb|lxx2012)\/([a-z0-9]+)\.json$/))) {
    const k = String(sourceKey).match(/^(\d+):(\d+)(?:-(\d+))?$/);
    if (!k) return null;
    return refFromData(`bible/${m[1]}/${k[1]}/${k[2]}${k[3] ? `-${k[3]}` : ''}`, `source ${sourceFile}@${sourceKey}`);
  }
  const k = String(sourceKey).match(/^(\d+):(\d+)/);
  if (!k) return null;
  if (/^src\/data\/quran\/english\/droge_translation\.json$/.test(sourceFile) || /tafsir_tabari/.test(sourceFile)) return refFromData(`quran/${k[1]}/${k[2]}`);
  if (/tafsir_ibn_kathir/.test(sourceFile)) return refFromData(`ibnkathir/${k[1]}/${k[2]}`);
  return null;
}
