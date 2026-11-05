/**
 * Phase 2 of the model: quotations, prose and showcases, each checked as it is rendered.
 *   quote(text, ref)     a verbatim quotation of one source (fails unless containsQuote)
 *   prose(md, where, { pool })
 *                        our voice: tone (tone.js), links (https or site-internal only), and every
 *                        quotation of 12+ characters verified: against the reference written next to it
 *                        (within 60 characters after it, else before it) when there is one, otherwise
 *                        against the field's own sources (`pool`) or a Qurʾān phrase of the article
 *   plainCopy(s)         a plain string in our voice (titles, labels): tone only
 *   showcase(sc)         the hrv archetype view models; every line with a `ref` is a quotation
 *   poolOf(obj)          texts of every source a copy object references (its `ref` keys, recursively)
 */
import { createRenderer, escapeAttr, plainText, tl } from '../hadithReliability/render.js';
import { bannedHit, QUOTE_MIN } from './tone.js';
import { ayn, containsQuote, displayText, labelRefs, nestQuotes, parseRef, quotedSpans, th } from './text.js';

export function createQuoting(k, src) {
  const { C, L, fail, BASE, fillTok } = k;
  const renderer = createRenderer();
  let quotedSources = null; // set while a showcase is being built: every source it quotes

  /** Texts of every source the object references through `ref` keys (recursively). */
  function poolOf(obj) {
    const out = [];
    const walk = o => {
      if (Array.isArray(o)) o.forEach(walk);
      else if (o && typeof o === 'object') for (const [key, v] of Object.entries(o)) { if (key === 'ref' && typeof v === 'string') out.push(v); else walk(v); }
    };
    walk(obj);
    return [...out.map(r => textOfKey(r)), ...poolOfLinks(obj?.classical?.sources)].filter(Boolean);
  }
  /** Texts behind source links (classical.sources): Sunnah.com pages in the source map, site tafsir routes. */
  function poolOfLinks(list) {
    return (list || []).map(x => {
      let m = String(x.url || '').match(/^https:\/\/sunnah\.com\/(\w+):(\w+)$/);
      if (m) return textOfKey(`${m[1]}:${m[2]}`);
      m = String(x.url || '').match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/);
      if (m) return textOfKey(`${m[3] === 'tabari' ? 'tabari' : 'ibnkathir'}:${m[1]}:${m[2]}`);
      return '';
    }).filter(Boolean);
  }
  /** Text of a reference key without failing (prose lookups); tafsir keys resolve to the whole commentary. */
  function textOfKey(key) {
    const p = parseRef(key);
    if (!p) return '';
    if (p.kind === 'hadith') return src.sources.get(p.key)?.text || '';
    if (p.kind === 'quran') { const a = []; for (let x = p.ayah; x <= (p.ayahEnd || p.ayah); x++) a.push(src.verseText(`${p.surah}:${x}`) || ''); return a.join(' '); }
    return k.tafsir[p.who]?.[p.key] || '';
  }
  /** Qurʾān phrases a prose line may quote without a reference ("what your right (hands) own"). */
  let quranPhrases = null;
  const quranPool = () => (quranPhrases ||= (k.data.quran_slavery_tafsir?.verses || []).flatMap(v => {
    const [s, r] = v.verse_key.split(':'); const [a, b] = r.split('-').map(Number); const out = [];
    for (let x = a; x <= (b || a); x++) out.push(src.verseText(`${s}:${x}`));
    return out;
  }).filter(Boolean));

  function quote(text, ref, where, { marks = false } = {}) {
    const s = src.resolveSource(ref, where);
    if (!s) return null;
    quotedSources?.push(s);
    if (!containsQuote(s.text, text)) fail(`${where}: quote is not verbatim in ${s.label}: "${String(text).slice(0, 90)}…"`);
    const markCount = (String(text).match(/\[\[/g) || []).length;
    if (!marks && markCount) fail(`${where}: highlight marks are allowed in showcase excerpts only`);
    if (markCount > 1) fail(`${where}: at most one highlighted span per card`);
    const html = th(displayText(text)).replace(/\[\[(.+?)\]\]/g, '<mark>$1</mark>');
    // .ms-vq marks verbatim text for the built-HTML tone gate (it is not our voice).
    return { html: `<span class="ms-vq">${html}</span>`, plain: plainText(text), ref: s.link, src: s, hasMark: markCount > 0 };
  }

  /**
   * The reference written next to a quotation: a parenthesis right after it (“…” (Bukhārī 4234)), else an
   * attribution right before it in the same clause (Bukhārī 6707 records: “…”). Returns structured keys.
   */
  function adjacentRefs(s, span) {
    const after = s.slice(span.end, span.end + 80).match(/^\s*[,.;:]?\s*(?:\(([^)]*)\)|(?:in|from)\s+([^,.;(]{0,40}))/);
    const refsAfter = after ? labelRefs(after[0]) : [];
    if (refsAfter.length) return refsAfter;
    // Before: the same clause only; a parenthesis that closes the previous quotation belongs to that one.
    const before = s.slice(Math.max(0, span.start - 60), span.start).split(/[\u201d"\u2019]|[.;]\s/).pop().replace(/^\s*[,.;:]?\s*\([^)]*\)/, '');
    return labelRefs(before);
  }

  function prose(md, where, { pool = [], headline = false, paragraphs = false } = {}) {
    if (md == null || md === '') return '';
    const s = ayn(fillTok(md));
    const hit = bannedHit(s, { headline });
    if (hit) fail(`${where}: banned word "${hit}" in our voice: "${s.slice(0, 90)}"`);
    for (const span of quotedSpans(s, { min: QUOTE_MIN })) {
      const refs = adjacentRefs(s, span);
      if (refs.length) {
        const texts = refs.map(textOfKey);
        if (!texts.some(t => t && containsQuote(t, span.text))) fail(`${where}: quotation is not in ${refs.join(' / ')}, the source cited beside it: "${span.text.slice(0, 80)}"`);
      } else if (!pool.some(t => t && containsQuote(t, span.text)) && !quranPool().some(t => containsQuote(t, span.text))) {
        fail(`${where}: quotation not found in the item's sources (cite its source beside it): "${span.text.slice(0, 80)}"`);
      }
    }
    // Site-internal links ("[90:11](/quran/90/11/tafsir/tabari)") get the site base; the shared renderer only links https.
    const internal = [];
    const parked = s.replace(/\[([^\[\]]+)\]\((\/[^)\s]*)\)/g, (m, text, href) => {
      if (!/^\/[\w\-/#.]*$/.test(href)) fail(`${where}: malformed internal link ${href}`);
      return `\u0001${internal.push({ text, href }) - 1}\u0001`;
    });
    if (/\]\((?!https:\/\/)[^)]*\)/.test(parked)) fail(`${where}: relative or non-https link in copy`);
    // `paragraphs`: a blank line starts a new <p> (the 4-move comparison blocks); otherwise one inline run.
    const inlineHtml = paragraphs
      ? parked.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${renderer.inline(p)}</p>`).join('')
      : renderer.inline(parked);
    const html = inlineHtml.replace(/\u0001(\d+)\u0001/g, (m, i) => `<a class="hrv-link" href="${escapeAttr(BASE + internal[i].href)}">${th(internal[i].text)}</a>`);
    if (/href="(?!https:\/\/|\/|#)/.test(html)) fail(`${where}: relative link in rendered copy`);
    return nestQuotes(html);
  }

  const plainCopy = (s0, where, opts = {}) => {
    if (s0 == null) return '';
    const s = ayn(fillTok(s0));
    const hit = bannedHit(s, opts);
    if (hit) fail(`${where}: banned word "${hit}" in our voice: "${String(s).slice(0, 90)}"`);
    return String(s);
  };

  /** Classical block: our prose plus https source links (the build gate, not only the audit). */
  function classical(c, where, pool) {
    if (!c?.text) return null;
    return {
      html: prose(c.text, `${where}.text`, { pool, paragraphs: true }),
      sources: (c.sources || []).map((x, i) => {
        const label = plainCopy(x.label, `${where}.sources[${i}].label`);
        const route = String(x.url || '').match(/^\/quran\/(\d+)\/(\d+)\/(tafsir\/(?:tabari|ibn_kathir))$/);
        if (route) {
          if (!textOfKey(`${route[3].endsWith('tabari') ? 'tabari' : 'ibnkathir'}:${route[1]}:${route[2]}`)) fail(`${where}.sources[${i}]: no commentary page for ${x.url}`);
          return { label, ...k.int(k.quranUrl(route[1], route[2], route[3])) };
        }
        if (!/^https:\/\//.test(x.url || '')) fail(`${where}.sources[${i}]: neither an https URL nor a site tafsir route: ${x.url}`);
        return { label, ...k.ext(x.url) };
      }),
    };
  }

  function showcase(sc, where, id, anchor = id, pool = []) {
    if (!sc || !sc.type) return null;
    const note = (t, w) => prose(t, w, { pool });
    quotedSources = [];
    // A line with a ref is a quotation: verbatim as a whole, or (when it carries “…” spans with our framing
    // around them, e.g. Ibn Kathīr: “…”) each span verbatim and the framing checked as our voice.
    const q = (it, w) => {
      if (!it.ref) return { html: prose(it.text, w), ref: null, hasMark: false };
      const spans = [...String(it.text ?? '').matchAll(/\u201c([^\u201d]+)\u201d/g)].map(m => m[1]);
      if (!spans.length) return { ...quote(it.text, it.ref, w, { marks: true }), framed: false };
      const s = src.resolveSource(it.ref, w);
      if (!s) return null;
      quotedSources.push(s);
      for (const sp of spans) if (!containsQuote(s.text, sp)) fail(`${w}: quote is not verbatim in ${s.label}: "${sp.slice(0, 90)}…"`);
      const marks = (String(it.text).match(/\[\[/g) || []).length;
      if (marks > 1) fail(`${w}: at most one highlighted span per card`);
      return { html: prose(it.text, w, { pool: [s.text] }).replace(/\[\[(.+?)\]\]/g, '<mark>$1</mark>'), ref: s.link, src: s, hasMark: marks > 0, framed: true };
    };
    // Quote marks around a whole-line quotation; a framed line (our words + “…” spans) already has its own.
    // Inner ASCII quotes of the source become ‘…’ inside our “…” (display only).
    const qm = (it, r) => (it.ref && !r.framed ? nestQuotes(`“${r.html}”`) : r.html);
    const items = list => list || [];
    let hasMark = false;
    const mark = x => { if (x?.hasMark) hasMark = true; return x; };
    let out;
    switch (sc.type) {
      case 'versions':
        out = { type: 'versions', noteHtml: note(sc.note, `${where}.note`), items: items(sc.items).map((it, i) => {
          const r = mark(q(it, `${where}.items[${i}]`));
          return r && { labelHtml: tl(plainCopy(it.label || r.ref?.label, `${where}.items[${i}].label`, { headline: true })), wordingHtml: r.html, arabic: null, ref: r.ref };
        }).filter(Boolean) };
        break;
      case 'witnesses':
        out = { type: 'witnesses', noteHtml: note(sc.note, `${where}.note`), items: items(sc.items).map((it, i) => {
          const r = mark(q(it, `${where}.items[${i}]`));
          return r && { scholar: plainCopy(it.who, `${where}.items[${i}].who`, { headline: true }), deathAh: it.deathAh ?? null, workHtml: it.work ? tl(plainCopy(it.work, `${where}.items[${i}].work`)) : '', englishHtml: r.html, ref: r.ref };
        }).filter(Boolean) };
        break;
      case 'confrontation': {
        const side = (sd, w) => ({ titleHtml: tl(plainCopy(sd?.title, `${w}.title`, { headline: true })), items: items(sd?.items).map((it, i) => { const r = mark(q(it, `${w}.items[${i}]`)); return r && { html: r.html, ref: r.ref }; }).filter(Boolean) });
        out = { type: 'confrontation', left: side(sc.left, `${where}.left`), right: side(sc.right, `${where}.right`), noteHtml: note(sc.note, `${where}.note`) };
        break;
      }
      case 'number_fan':
        out = { type: 'number_fan', unitHtml: note(sc.unit, `${where}.unit`), noteHtml: note(sc.note, `${where}.note`), items: items(sc.items).map((it, i) => {
          const r = mark(q(it, `${where}.items[${i}]`));
          const cap = it.caption ? `<span class="ms-fan__cap">${th(plainCopy(it.caption, `${where}.items[${i}].caption`))}</span> ` : '';
          // Quote marks only around a quotation (a line with a ref); a line without one is our prose.
          return r && { value: String(it.value), labelHtml: `${cap}<span class="ms-fan__q">${qm(it, r)}</span>`, ref: r.ref, anchor: null };
        }).filter(Boolean) };
        break;
      case 'timeline':
        out = { type: 'timeline', noteHtml: note(sc.note, `${where}.note`), gapHtml: '', points: items(sc.points).map((p, i) => {
          const r = mark(q(p, `${where}.points[${i}]`));
          return r && { year: plainCopy(String(p.step ?? ''), `${where}.points[${i}].step`, { headline: true }), labelHtml: qm(p, r), ref: r.ref };
        }).filter(Boolean) };
        break;
      case 'facts':
        // A quoted fact shows its source (no jump link: the ref is the citation); our own line jumps to the texts.
        out = { type: 'facts', noteHtml: note(sc.note, `${where}.note`), items: items(sc.items).map((it, i) => { const r = mark(q(it, `${where}.items[${i}]`)); return r && { html: qm(it, r), ref: r.ref, anchor: it.ref ? null : anchor }; }).filter(Boolean) };
        break;
      default:
        fail(`${where}: unknown showcase type "${sc.type}"`);
        quotedSources = null;
        return null;
    }
    out.quotesTabari = quotedSources.some(x => x.kind === 'tafsir' && x.who === 'tb');
    quotedSources = null;
    out.id = `sc-${id}`;
    out.caption = L.showcase?.[out.type] || null;
    out.hasMark = hasMark;
    return out;
  }

  return { quote, prose, plainCopy, classical, showcase, poolOf, textOfKey };
}
