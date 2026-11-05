#!/usr/bin/env node
/**
 * Static output audit for "From Mecca to Medina" (run after `astro build`).
 *
 *   node scripts/test_mecca_to_medina.mjs [--dist dist] [--allow-sliced] [--proposals FILE]
 *
 * Checks the built HTML, not the source, so it catches what readers actually get (playbook §6). Each
 * concern is a named check group; a failure prints `  ✗ where: [group] message`, a warning prints
 * `  ! where: [group] message` and does not fail the run.
 *
 * `--allow-sliced` permits a partial BUILD_BOOKS / BUILD_SURAHS for local development builds (and then
 * only warns about internal pages missing from dist/). Without it the audit fails, so a sliced config
 * cannot be committed by accident (workspace rule).
 *
 * `--proposals FILE` also fails unless FILE (data_proposals.md) is byte-identical to a fresh run of
 * scripts/gen_mecca_to_medina_data_proposals.mjs, i.e. to the overrides in config.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG, BASE, BASE_PATH, LEGACY_ANCHORS, EMIT_FAQ, CATALOG, SOURCE_GROUPS, ITEMS } from '../src/utils/meccaToMedina/config.js';
import { buildModel } from '../src/utils/meccaToMedina/model.js';
import { repoProviders } from '../src/utils/meccaToMedina/providers.js';
import { BODY, HEADLINE, ourVoice } from '../src/utils/meccaToMedina/tone.js';
import { loadIslamicCommentaries } from '../src/utils/islamic_commentaries_loader.js';
import { BUILD_BOOKS, BUILD_SURAHS } from '../src/utils/build_config.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT); // providers read src/data relative to the working directory
const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? (process.argv[i + 1] ?? true) : null; };
const DIST = path.resolve(ROOT, arg('--dist') || 'dist');
const ALLOW_SLICED = process.argv.includes('--allow-sliced');
const DATASET = path.join(ROOT, 'src/data/discover/islam/scripture/from_mecca_to_medina.json');

const model = buildModel(JSON.parse(fs.readFileSync(DATASET, 'utf8')), CONFIG, repoProviders());
const tafsir = loadIslamicCommentaries();

// ---- tiny harness -------------------------------------------------------------------------------
let failures = 0;
let warnings = 0;
let checks = 0;
function group(name, where) {
  const ok = (cond, msg) => { checks++; if (!cond) { failures++; console.error(`  ✗ ${where}: [${name}] ${msg}`); } };
  ok.warn = (cond, msg) => { if (!cond) { warnings++; console.warn(`  ! ${where}: [${name}] ${msg}`); } };
  return ok;
}

// ---- helpers ------------------------------------------------------------------------------------
const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const strip = html => decode(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const voice = html => strip(ourVoice(html));
const all = (re, s) => [...s.matchAll(re)];
const len = s => [...s].length;

const route = BASE_PATH.slice(BASE.length).replace(/^\//, '');
const file = path.join(DIST, route, 'index.html');
const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
const where = BASE_PATH;
console.log(`Auditing ${where} in ${DIST}`);

const CHECKS = {
  meta(ok) {
    const d = decode(html);
    ok(d.includes(`<title>${model.seo.title} | Ready Apologia</title>`), `title should be "${model.seo.title} | Ready Apologia"`);
    ok(d.includes(`<meta name="description" content="${model.seo.description}"`), 'meta description does not match the SEO spec');
    ok(d.includes(`<link rel="canonical" href="https://readyapologia.com${BASE_PATH}"`), 'canonical URL should be the page path');
    ok(/<meta property="og:image" content="[^"]*\/media\/mecca_to_medina\/cover\.jpg"/.test(d), 'og:image should stay the article cover');
    const t = len(model.seo.title), n = len(model.seo.description);
    ok(t >= 20 && t <= 90, `SEO title length ${t} is outside 20–90`);
    ok(n >= 50 && n <= 200, `meta description length ${n} is outside 50–200`);
    ok.warn(t <= 70, `SEO title is ${t} characters; search results truncate after about 60–70`);
    ok.warn(n <= 160, `meta description is ${n} characters; search results truncate after about 160`);
    ok(!/onboarding/i.test(html.slice(html.indexOf('<body'))) || !/Tap on any verse/.test(html), 'the site onboarding tip must be off (showOnboarding={false})');
  },

  leaks(ok, { text }) {
    for (const [re, what] of [
      [/\]\(https?:/, 'raw markdown link'], [/\]\([#/][^)\s]*\)/, 'unrendered markdown link'], [/\*\*/, 'raw ** emphasis'],
      [/(^|\s)>\s?\{/, 'raw markdown blockquote'], [/\b(?:quran|tabari|ibnkathir)\/\d+\/\d+/, 'raw dataset reference key'],
      [/\{[a-zA-Z]+\}/, 'unfilled {placeholder}'], [/\bundefined\b|\bnull\b|\[object Object\]|\bNaN\b/, 'stringified empty value'],
      [/[\u0000\u0001]/, 'renderer placeholder'], [/directionToLLM|scholarlyConsensus|keyMandates|hadithEvidence/, 'dataset key'],
      [/\(1[34]\) =/, 'tafsīr apparatus "(13) =" in a quote'], [/Narrated It was narrated/, 'mirror artefact "Narrated It was narrated"'],
      [/(^|\s)#{2,6}\s/, 'raw markdown heading'], [/`/, 'ASCII backtick (ʿayn should display as ʿ)'],
      [/\u201c[^\u201d]*\u201c/, 'doubled opening quote (a quote inside a quote must be ‘…’)'],
    ]) { const m = text.match(re); ok(!m, `leak: ${what}${m ? ` ("${m[0]}")` : ''}`); }
  },

  links(ok, { body }) {
    const others = (body.match(/<section[^>]*id="others"[\s\S]*?<\/section>/) || [''])[0];
    for (const [tag, attrs] of all(/<a\b([^>]*)>/g, body).map(m => [m[0], m[1]])) {
      const href = decode((attrs.match(/href="([^"]*)"/) || [])[1] || '');
      ok(href, `link without href: ${tag}`);
      if (!href) continue;
      if (/^https?:/.test(href)) {
        const rel = (attrs.match(/rel="([^"]*)"/) || [])[1] || '';
        ok(/target="_blank"/.test(attrs) && /\bnoopener\b/.test(rel) && /\bnoreferrer\b/.test(rel), `external link without target/rel: ${href}`);
        ok(others.includes(tag) === /\bnofollow\b/.test(rel), `nofollow must mark exactly the "What others are saying" links: ${href}`);
        ok(!/quran\.com\/\d/.test(href), `Qurʾān link should be internal: ${href}`);
        ok(href.startsWith('https://'), `insecure link: ${href}`);
        const sk = href.match(/^https:\/\/sunnah\.com\/([a-z]+):([\w.]+)$/);
        if (/sunnah\.com/.test(href)) ok(sk, `malformed Sunnah.com link: ${href}`);
        if (sk && sk[1] === 'muslim') ok(!/^3[0-9]{3}$/.test(sk[2]) || Number(sk[2]) <= 3033, `Muslim number ${sk[2]} is past Sunnah.com's range (mirror numbering?)`);
      } else if (href.startsWith('#')) {
        continue; // checked by `anchors`
      } else {
        ok(href.startsWith(`${BASE}/`), `internal link without the site base: ${href}`);
        const p = href.slice(BASE.length).split('#')[0];
        const tab = p.match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/);
        if (tab) { ok(tafsir[`${tab[1]}:${tab[2]}`]?.some(t => t.id === tab[3]), `no ${tab[3]} tafsīr page for ${tab[1]}:${tab[2]}`); continue; }
        const target = path.join(DIST, p.replace(/^\//, ''), 'index.html');
        const htmlTarget = path.join(DIST, `${p.replace(/^\//, '')}.html`);
        const exists = fs.existsSync(target) || fs.existsSync(htmlTarget);
        (ALLOW_SLICED ? ok.warn : ok)(exists, `internal link to a page missing from dist/: ${href}`);
      }
    }
  },

  anchors(ok, { body, html: page }) {
    const ids = all(/\sid="([^"]+)"/g, page).map(m => m[1]);
    const seen = new Set();
    for (const id of ids) { ok(!seen.has(id), `duplicate id "${id}"`); seen.add(id); }
    for (const [, id] of all(/href="#([^"]*)"/g, body)) ok(seen.has(decode(id)), `href="#${id}" points to no element`);
    for (const legacy of Object.keys(LEGACY_ANCHORS)) ok(seen.has(legacy), `legacy anchor #${legacy} is missing`);
    for (const it of model.items) ok(seen.has(it.id), `item anchor #${it.id} is missing`);
  },

  tone(ok, { body }) {
    const page = body.replace(/<section[^>]*id="others"[\s\S]*?<\/section>/, ''); // others' titles, verbatim
    const cls = 'hrv-intro|mm-dek|hrv-hook|mm-takeaway|mm-disclosure|hrv-further-note|hrv-sc__note|mm-sc__note|mm-ev__note|mm-ev__lead|mm-outro|mm-suranote';
    const prose = [
      ...all(new RegExp(`<p\\b[^>]*class="[^"]*\\b(?:${cls})\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/p>`, 'g'), page).map(m => m[1]),
      ...all(/<div class="mm-block__body">([\s\S]*?)<\/div>/g, page).map(m => m[1]),
      ...all(/<div class="mm-prose">([\s\S]*?)<\/div>/g, page).map(m => m[1]),
      ...all(/<div class="mm-card">([\s\S]*?)<\/div>/g, page).map(m => m[1]),
      ...all(/<div class="hrv-tl__body">([\s\S]*?)<\/div>\s*<\/li>/g, page).map(m => m[1]),
      ...all(/<div class="hrv-disclosure__body mm-reflection__body">([\s\S]*?)<\/details>/g, page).map(m => m[1].replace(/<article class="hrv-ev[\s\S]*?<\/article>/g, '')),
    ].map(voice);
    const heads = [
      ...all(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/g, page).map(m => m[2]),
      ...all(/<summary\b[^>]*>([\s\S]*?)<\/summary>/g, page).map(m => m[1]),
      ...all(/<div class="hrv-sc__cap">([\s\S]*?)<\/div>/g, page).map(m => m[1]),
      ...all(/<a class="mm-next"[^>]*>([\s\S]*?)<\/a>/g, page).map(m => m[1]),
      ...all(/<span class="mm-tag[^"]*"[^>]*>([\s\S]*?)<\/span>/g, page).map(m => m[1]),
    ].map(voice);
    ok(prose.length > 40 && heads.length > 60, `tone gate found too little text (${prose.length} prose, ${heads.length} heads) — selectors out of date?`);
    for (const s of [...prose, ...heads]) { const m = s.match(BODY); ok(!m, `"${m?.[0]}" in: ${s.slice(0, 90)}`); }
    for (const s of [...heads, model.seo.title, model.seo.description].map(x => ourVoice(x))) { const m = s.match(HEADLINE); ok(!m, `headline word "${m?.[0]}" in: ${s.slice(0, 90)}`); }
  },

  sources(ok, { body }) {
    // Every source the page links to is listed in "Check the sources", and every listed source is linked.
    const cut = (re) => (body.match(re) || [''])[0];
    const listed = cut(/<section class="hrv-sec mm-sources" id="check-sources"[\s\S]*?<\/section>/);
    const rest = body.replace(listed, '').replace(cut(/<section[^>]*id="others"[\s\S]*?<\/section>/), '');
    const hrefs = html => new Set(all(/<a\b[^>]*href="([^"#][^"]*)"/g, html).map(m => decode(m[1])).filter(h => /^https:\/\//.test(h) || new RegExp(`^${BASE}/(quran|bible)/`).test(h)));
    const linked = hrefs(rest), inList = hrefs(listed);
    for (const h of linked) ok(inList.has(h), `linked on the page but missing from "Check the sources": ${h}`);
    for (const h of inList) ok(linked.has(h), `listed in "Check the sources" but never linked from the page: ${h}`);
    ok(inList.size > 50, `"Check the sources" lists only ${inList.size} links — selector out of date?`);
  },

  jsonld(ok, { html: page }) {
    const blocks = all(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g, page).map(m => m[1]);
    ok(blocks.length === 1, `expected one JSON-LD block, found ${blocks.length}`);
    for (const raw of blocks) {
      let j;
      try { j = JSON.parse(raw); } catch { ok(false, 'JSON-LD does not parse'); continue; }
      const graph = j['@graph'] || [j];
      const article = graph.find(x => x['@type'] === 'Article');
      const crumbs = graph.find(x => x['@type'] === 'BreadcrumbList');
      const list = graph.find(x => x['@type'] === 'ItemList');
      ok(article && crumbs && list, 'must contain Article, BreadcrumbList and ItemList');
      ok(graph.filter(x => x['@type'] === 'Article').length === 1, 'exactly one Article');
      ok(!/"ClaimReview"/.test(raw), 'must not contain ClaimReview');
      ok(EMIT_FAQ || !/"FAQPage"/.test(raw), 'FAQPage must stay off while EMIT_FAQ is false');
      if (!article) continue;
      ok(article.headline === model.seo.title, 'Article.headline must equal the SEO title (no "| Ready Apologia")');
      ok(article.url === `https://readyapologia.com${BASE_PATH}`, `Article.url is ${article.url}`);
      ok(article.datePublished <= article.dateModified, 'dateModified must not precede datePublished');
      ok((article.about || []).length > 0 && article.about.every(a => /^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/.test(a.sameAs)), 'Article.about needs Wikidata entities');
      // Expected citations counted from the rendered "Check the sources" groups, not from the model.
      const listed = (page.match(/<section class="hrv-sec mm-sources"[\s\S]*?<\/section>/) || [''])[0];
      const citeLabels = new Set(SOURCE_GROUPS.filter(g => g.kind === 'sunnah' || g.kind === 'tafsir').map(g => g.label));
      const want = listed.split('<div class="hrv-srcgroup">').slice(1)
        .filter(g => citeLabels.has(decode((g.match(/<h3 class="hrv-srcgroup__h">([^<]*)/) || [])[1] || '').trim()))
        .reduce((n, g) => n + (g.match(/<a class="hrv-src"/g) || []).length, 0);
      ok((article.citation || []).length === want, `Article.citation lists ${(article.citation || []).length} works; the page cites ${want} Sunnah.com + tafsīr pages`);
      ok((article.citation || []).every(c => c.name && /^https:\/\/(sunnah\.com|readyapologia\.com)\//.test(c.url)), 'every citation needs a name and an absolute Sunnah.com or tafsīr URL');
      ok((crumbs?.itemListElement || []).every(c => /^https:\/\//.test(c.item)), 'breadcrumb items need absolute URLs');
      ok(list?.numberOfItems === model.items.length && list.itemListElement.every((e, i) => e.url === `${article.url}#${model.items[i].id}`), 'ItemList must list every item as page#id, in reading order');
    }
  },

  structure(ok, { body }) {
    const count = re => (body.match(re) || []).length;
    ok(count(/<h1\b/g) === 1, 'exactly one <h1>');
    ok(count(/<article class="mm-item[ "]/g) === model.items.length, `expected ${model.items.length} items`);
    ok(count(/data-mm-copy=/g) === model.items.length, 'every item needs a copy-link button');
    ok(count(/data-mm-copy="[^"]+"[^>]*aria-describedby="[^"]+-h"/g) === model.items.length, 'copy buttons must be described by their item title');
    ok(count(/<article class="hrv-ev mm-ev/g) === model.counts.evidence, `expected ${model.counts.evidence} evidence cards`);
    ok(/class="hrv-sec mm-sources" id="check-sources"/.test(body), 'missing "Check the sources"');
    ok(/data-mm-index/.test(body) && /data-hrv-copy/.test(body), 'sticky bar needs the index and the page copy link');
    ok(!/<astro-island|client:(load|visible|idle)/.test(body), 'no React islands on this page');
    // Item titles with {cards} must show the number of cards in the item's main list (not its collapsed parts).
    for (const it of model.items) {
      if (!/\{cards\}/.test(String(ITEMS[it.id]?.title?.text ?? ITEMS[it.id]?.title))) continue;
      const title = strip((body.match(new RegExp(`<h3 class="mm-item__title"[^>]*id="${it.id}-h"[^>]*>([\\s\\S]*?)<\\/h3>`)) || [])[1] || '');
      const main = (body.match(new RegExp(`<article class="mm-item[^>]*id="${it.id}"[\\s\\S]*?(?=<div class="mm-parts"|<div class="hrv-scholar|<div class="hrv-eval|<a class="mm-next")`)) || [''])[0];
      const shown = (main.match(/<article class="hrv-ev mm-ev/g) || []).length;
      ok(new RegExp(`(^|\\D)${shown}(\\D|$)`).test(title), `item ${it.number}'s title should count ${shown} passages: "${title}"`);
    }
    // Outline inside items: only the title is h3, and nothing above h3 except the Start-here eyebrow.
    for (const [, art] of all(/<article class="mm-item[^>]*>([\s\S]*?)<a class="mm-next"/g, body)) {
      const hs = all(/<h([23])\b([^>]*)>/g, art).filter(([, lv, attrs]) => !(lv === '3' && /mm-item__title/.test(attrs)) && !(lv === '2' && /mm-ctx/.test(attrs)));
      ok(hs.length === 0, `an item contains a stray h${hs[0]?.[1]} (${(hs[0]?.[2] || '').slice(0, 60)}); sub-heads are h4 and below`);
    }
    const refl = (body.match(/<section[^>]*mm-reflection[\s\S]*?<\/section>/) || [''])[0];
    if (refl) ok(/<h2\b/.test(refl), 'the reflection needs its own h2 (otherwise its cards sit under "Check the sources")');
    // Accessible names: visually separated parts must be separated in the text layer too.
    for (const [re, what] of [
      [/class="mm-index__n">[^<]*<\/span><span(?![^>]*hrv-sr)/, 'index/list number runs into its title'],
      [/[^\s>]<\/span><span class="mm-tag/, 'a tag runs into the text before it'],
      [/<\/span><\/span><span class="mm-tag/, 'a tag runs into the text before it'],
      [/<h3 class="hrv-srcgroup__h">[^<]*<span class="hrv-disclosure__meta(?![^"]*mm-srccount)/, 'a source-group count runs into its heading'],
    ]) { const m = body.match(re); ok(!m, `${what}: ${m ? m[0].slice(0, 80) : ''}`); }
    // Heading outline: never skip a level going down (h2 → h4 hides structure from heading navigation).
    let prev = 1;
    for (const [, lv] of all(/<h([1-6])\b/g, body)) { ok(Number(lv) <= prev + 1, `heading jumps from h${prev} to h${lv}`); prev = Number(lv); }
  },
};

if (!html) group('exists', where)(false, 'page missing from dist (run astro build first)');
else {
  // The page's own markup: from its root to the layout footer / end of <main> (the layout's nav islands come after).
  const start = html.indexOf('class="hrv mm"');
  const end = Math.min(...['<footer', '</main>'].map(t => html.indexOf(t, start)).filter(i => i > start));
  const body = html.slice(start, end > start ? end : undefined);
  const ctx = { html, body, text: strip(body) };
  for (const [name, run] of Object.entries(CHECKS)) run(group(name, where), ctx);
}

// ---- outside the page -----------------------------------------------------------------------------
{
  const ok = group('stateless', 'client scripts');
  for (const f of ['src/components/discover/mecca-to-medina/client.js', 'src/components/discover/hadith-reliability/client.js']) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(src), `${f} must be stateless`);
  }
  const page = fs.readFileSync(path.join(ROOT, 'src/pages/discover/from-mecca-to-medina.astro'), 'utf8');
  ok(!/\.jsx['"]/.test(page) && !/client:/.test(page), 'the page must not import React components');
  ok(/showOnboarding=\{false\}/.test(page), 'the page must pass showOnboarding={false}');
}
{
  const ok = group('scroll-container', 'mecca-to-medina.css');
  const css = fs.readFileSync(path.join(ROOT, 'src/styles/mecca-to-medina.css'), 'utf8');
  ok(/\.hrv\.mm\s*\{[^}]*position:\s*relative/.test(css), '.hrv.mm must be position: relative');
  ok(!/#(?:974543|dc2626|b91c1c|991b1b)\b/i.test(css), 'no alarm red / terracotta in this page\'s CSS');
}
{
  // The Discover card is the first thing a reader sees. The copy change is a pending data proposal,
  // so this only warns until the catalog is updated.
  const ok = group('catalog', 'discoverCatalog.json');
  const entry = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/discoverCatalog.json'), 'utf8')).find(e => e.slug === 'from-mecca-to-medina');
  ok(entry, 'missing catalog entry');
  if (entry) {
    const s = `${entry.title} ${entry.description}`;
    const hit = s.match(BODY) || s.match(HEADLINE);
    ok.warn(!hit, `card copy uses "${hit?.[0]}": "${s}" (see CATALOG in meccaToMedina/config.js)`);
    ok.warn(entry.title === CATALOG.title, `card title differs from CATALOG.title (pending data proposal): "${entry.title}"`);
  }
}
{
  const file = arg('--proposals');
  if (file && file !== true) {
    const ok = group('proposals', path.basename(file));
    const { generateProposals } = await import('./gen_mecca_to_medina_data_proposals.mjs');
    ok(fs.existsSync(file) && fs.readFileSync(file, 'utf8') === generateProposals({ root: ROOT }), `${file} is not byte-identical to config.js (regenerate: node scripts/gen_mecca_to_medina_data_proposals.mjs --out ${file})`);
  }
}
{
  const ok = group('build-config', 'build_config.js');
  if (!ALLOW_SLICED) ok(BUILD_BOOKS === null && BUILD_SURAHS === null, 'BUILD_BOOKS / BUILD_SURAHS must be null before commit (pass --allow-sliced for local builds)');
}

console.log(failures ? `\n${failures} of ${checks} checks failed${warnings ? `, ${warnings} warnings` : ''}` : `\nAll ${checks} checks passed${warnings ? ` (${warnings} warnings)` : ''}`);
process.exit(failures ? 1 : 0);
