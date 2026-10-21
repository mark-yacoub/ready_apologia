/**
 * Build-time view model for the Hadith Reliability article (hub, at-a-glance, one page per case; 25 as of v3.2).
 *
 * Reads the imported dataset (never edits it) and produces plain objects with pre-rendered HTML.
 * Internal ranking data (cuj_score, cuj_tier, rubric_breakdown, ranking_rationale,
 * dropped_items_log, directionToLlm) never leaves this module.
 *
 * Problems are collected and printed once per build as a single `[hadithReliability]` summary.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRenderer, linkFor, plainText, escapeAttr } from './render.js';
import {
  BASE_PATH, QUESTION_FALLBACKS, HUB_INTRO_FALLBACK, ARCHETYPE_BY_CASE, ANGLES, HOST_LABELS,
  HIDDEN_HOSTS, REFERENCE_HOSTS, COLLECTION_SHORT, SCHOLAR_ALIASES, SOURCE_GROUPS,
} from './config.js';
import { SEO_CASES, SEO_HUB, SEO_GLANCE, PAA } from './seo.js';
import { validateDataset } from './validate.js';

// Resolved from the project root (Astro and the node scripts both run there). Not import.meta.url:
// this module is bundled into dist/chunks at build time, which would move the relative base.
const DATA_DIR = path.join(process.cwd(), 'src/data/discover/islam/scripture/hadith_reliability');
const DATASET_PATH = path.join(DATA_DIR, 'hadith_reliability_overview.json');
const REPORT_PATH = path.join(DATA_DIR, 'verification_report.json');
// Broken pages are hidden. A `mismatch` usually means the sentence misdescribes a correct page, so
// hiding the link would remove valid evidence; mismatches fail the static audit instead and are fixed
// in the dataset by the data agent.
const BLOCKING_VERDICTS = new Set(['broken']);

/** Memoised per dataset file version (mtime), so `astro dev` picks up a fresh import without a restart. */
let cache = null;
let cacheKey = null;

function loadVerdicts() {
  try {
    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    return new Map(Object.entries(report.verdicts || {}).map(([url, v]) => [url, v.verdict]));
  } catch {
    return new Map();
  }
}

const hostOf = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };
const isHidden = url => HIDDEN_HOSTS.some(h => hostOf(url).endsWith(h));
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

/** "Ṣaḥīḥ al-Bukhārī 3902 (…)" → "Bukhārī" (or null), using the one collection table in config. */
function collectionOf(label) {
  const s = String(label);
  for (const [re, short] of COLLECTION_SHORT) if (re.test(s)) return short;
  return null;
}

/** "https://sunnah.com/bukhari:6511" → "Bukhārī 6511" (used when the dataset gives no label). */
function sunnahLabel(url) {
  const m = String(url).match(/sunnah\.com\/([a-z]+):([\w.-]+)/i);
  if (!m) return '';
  const names = { bukhari: 'Bukhārī', muslim: 'Muslim', tirmidhi: 'Tirmidhī', abudawud: 'Abū Dāwūd', ibnmajah: 'Ibn Mājah', nasai: 'Nasāʾī', malik: 'Muwaṭṭaʾ', ahmad: 'Musnad Aḥmad' };
  return `${names[m[1].toLowerCase()] || m[1]} ${m[2]}`;
}

/** "Ṣaḥīḥ al-Bukhārī 3902 (13 years / age 63)" → "Bukhārī 3902"; Qurʾān → "Qurʾān 9:101". */
export function shortRefLabel(label, url) {
  const link = linkFor(url);
  if (link.kind === 'quran') {
    const m = url.match(/quran\.com\/(\d+)(?:\/(\d+(?:-\d+)?))?/);
    if (m) return m[2] ? `Qurʾān ${m[1]}:${m[2]}` : `Qurʾān ${m[1]}`;
  }
  if (!label && link.kind === 'sunnah') return sunnahLabel(url);
  let s = String(label ?? '').replace(/\s*\([^)]*\)\s*$/, '').trim();
  for (const [re, short] of COLLECTION_SHORT) {
    if (re.test(s)) { s = s.replace(re, short); break; }
  }
  return s.length > 34 ? `${s.slice(0, 32).trim()}…` : s;
}

function scholarOf(label) {
  const head = String(label).split(',')[0].trim();
  for (const [re, short] of SCHOLAR_ALIASES) if (re.test(head)) return short;
  return null;
}

function readDataset() {
  if (!fs.existsSync(DATASET_PATH)) {
    throw new Error(`[hadithReliability] dataset not found at ${DATASET_PATH}. Run from the project root, after scripts/import_hadith_reliability.js.`);
  }
  const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
  const { errors } = validateDataset(dataset);
  if (errors.length) {
    throw new Error(`[hadithReliability] dataset violates the contract (${errors.length}):\n  ${errors.slice(0, 20).join('\n  ')}${errors.length > 20 ? '\n  …' : ''}`);
  }
  return dataset;
}

function buildModel() {
  const dataset = readDataset();
  const verdicts = loadVerdicts();
  const issues = { blocked: new Set(), missingQuote: [], missingShowcase: [], missingTakeaway: [], unknownHost: new Set() };
  const md = createRenderer({
    isBlocked: url => BLOCKING_VERDICTS.has(verdicts.get(url)),
    onBlocked: url => issues.blocked.add(url),
  });

  const meta = dataset.article_meta;
  const args = [...dataset.arguments].sort((a, b) => a.rank - b.rank);

  // ---- cases in reading order (question order, then intra-question rank) -------------------
  const cases = [];
  const questions = args.map((arg, qi) => {
    const number = qi + 1;
    const q = {
      id: arg.id,
      number,
      anchor: `q-${number}`,
      question: arg.reader_question || QUESTION_FALLBACKS[arg.id] || arg.short_title,
      shortTitle: arg.short_title,
      hookHtml: md.inline(arg.plain_english_hook),
      aboutHtml: md.block(arg.executive_summary),
      significanceHtml: md.block(arg.methodological_significance),
      cases: [],
    };
    q.href = `${BASE_PATH}#${q.anchor}`;
    for (const s of [...arg.subpoints].sort((a, b) => a.rank - b.rank)) {
      const c = buildCase(s, q, md, issues);
      q.cases.push(c);
      cases.push(c);
    }
    return q;
  });
  cases.forEach((c, i) => { c.number = i + 1; });

  // ---- linear reading order: prev / next ---------------------------------------------------
  cases.forEach((c, i) => {
    c.prev = i > 0 ? summary(cases[i - 1]) : null;
    c.next = i < cases.length - 1 ? summary(cases[i + 1]) : null;
  });

  // ---- article-level stats -------------------------------------------------------------------
  const hostCounts = new Map();
  let citationCount = 0;
  for (const c of cases) {
    for (const group of Object.values(c.sources)) {
      for (const s of group) {
        citationCount++;
        const label = HOST_LABELS[s.host] || HOST_LABELS[s.host.replace(/^www\./, '')];
        if (label) hostCounts.set(label, (hostCounts.get(label) || 0) + 1);
        else issues.unknownHost.add(s.host);
      }
    }
  }

  const angles = ANGLES
    .map(a => ({ ...a, count: cases.filter(c => c.archetype === a.id).length }))
    .filter(a => a.count > 0);

  reportIssues(issues);

  return {
    meta: {
      title: meta.title,
      shortTitle: meta.short_title,
      introText: plainText(meta.hub_intro || fill(HUB_INTRO_FALLBACK, { n: cases.length })),
      counts: { cases: cases.length, questions: questions.length, citations: citationCount },
      sourceStats: [...hostCounts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
      seo: { hub: SEO_HUB, glance: SEO_GLANCE },
    },
    questions: questions.map(q => ({ ...q, cases: q.cases.map(summary) })),
    angles,
    cases,
    startHere: cases[0],
  };
}

/** The subset of a case that lists, rows and cards need. */
function summary(c) {
  return {
    id: c.id, slug: c.slug, href: c.href, number: c.number, shortTitle: c.shortTitle,
    hook: c.hook, takeaway: c.takeaway, archetype: c.archetype, badges: c.badges,
    questionNumber: c.questionNumber, showcase: c.showcase,
  };
}

function buildCase(s, q, md, issues) {
  const seo = SEO_CASES[s.id];
  const slug = seo?.slug || s.id.replace(/_/g, '-');
  const archetype = s.showcase?.type || ARCHETYPE_BY_CASE[s.id] || 'facts';

  // Sources: case-level + evidence-level primary references, deduped by resolved href.
  const sources = { sunnah: [], quran: [], classical: [], other: [] };
  const seen = new Set();
  const addSource = ref => {
    if (!ref?.url || isHidden(ref.url) || md.checkBlocked(ref.url)) return;
    const link = linkFor(ref.url);
    if (seen.has(link.href)) return;
    seen.add(link.href);
    sources[link.kind].push({
      label: ref.label, short: shortRefLabel(ref.label, ref.url), href: link.href, external: link.external,
      attrs: link.attrs, kind: link.kind, host: hostOf(ref.url), title: link.title,
    });
  };
  s.primary_references.forEach(addSource);
  s.evidence_items.forEach(e => e.primary_references.forEach(addSource));

  // Badges: collections first, then the classical scholars most cited in this case.
  const badges = [];
  const labels = [...s.primary_references, ...s.evidence_items.flatMap(e => e.primary_references)].map(r => r.label);
  const collections = new Set(labels.map(collectionOf));
  for (const name of ['Bukhārī', 'Muslim']) if (collections.has(name)) badges.push(name);
  if (sources.quran.length) badges.push('Qurʾān');
  const scholarCounts = new Map();
  for (const l of labels) { const sc = scholarOf(l); if (sc) scholarCounts.set(sc, (scholarCounts.get(sc) || 0) + 1); }
  [...scholarCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, Math.max(1, 4 - badges.length)).forEach(([n]) => badges.push(n));

  const evidence = [...s.evidence_items].sort((a, b) => a.rank - b.rank).map((e, i) => {
    const structured = e.key_arabic_quote_structured;
    if (!structured) issues.missingQuote.push(`${s.id}#${i + 1}`);
    const chips = [];
    const chipSeen = new Set();
    for (const r of e.primary_references) {
      if (!r.url || isHidden(r.url) || md.checkBlocked(r.url)) continue;
      const link = linkFor(r.url);
      if (chipSeen.has(link.href)) continue;
      chipSeen.add(link.href);
      chips.push({ label: shortRefLabel(r.label, r.url), href: link.href, external: link.external, attrs: link.attrs, kind: link.kind, title: link.title || r.label });
    }
    return {
      n: i + 1,
      anchor: `evidence-${i + 1}`,
      labelHtml: md.inline(e.label),
      bodyHtml: md.block(e.content_markdown),
      quote: structured
        ? {
          arabic: structured.arabic,
          englishHtml: md.inline(structured.english),
          ref: structured.ref_label,
          refLink: structured.url ? linkFor(structured.url) : null,
        }
        : (e.key_arabic_quote ? { rawHtml: md.inline(e.key_arabic_quote) } : null),
      chips,
    };
  });

  const tables = (s.comparison_tables || []).map(t => ({
    titleHtml: md.inline(t.title),
    headers: t.headers.map(h => ({ html: md.inline(h), label: escapeAttr(plainText(h)) })),
    rows: t.rows.map(r => r.map(cell => md.inline(cell))),
  }));

  // Further reading: academic/neutral works only from allowlisted hosts; everything else (blogs,
  // videos, advocacy sites) is "what others are saying", listed with nofollow, whatever role the
  // dataset assigned.
  const further = { reference: [], perspective: [] };
  const furtherSeen = new Set();
  for (const l of [...s.dive_deeper_links, ...s.evidence_items.flatMap(e => e.dive_deeper_links || [])]) {
    if (!l?.url || isHidden(l.url) || furtherSeen.has(l.url) || md.checkBlocked(l.url)) continue;
    furtherSeen.add(l.url);
    const role = REFERENCE_HOSTS.some(h => hostOf(l.url).endsWith(h)) ? 'reference' : 'perspective';
    const link = linkFor(l.url, { nofollow: role === 'perspective' });
    further[role].push({
      label: l.label, href: link.href, attrs: link.attrs, host: hostOf(l.url),
      type: /youtube\.com|youtu\.be/.test(l.url) ? 'video' : (l.type || l.resource_type || 'article'),
    });
  }

  if (!s.showcase) issues.missingShowcase.push(s.id);
  if (!s.takeaway) issues.missingTakeaway.push(s.id);

  const c = {
    id: s.id,
    slug,
    href: `${BASE_PATH}/${slug}`,
    globalRank: s.global_rank,
    questionId: q.id,
    questionNumber: q.number,
    question: { number: q.number, text: q.question, href: q.href, aboutHtml: q.aboutHtml, significanceHtml: q.significanceHtml },
    shortTitle: s.short_title,
    title: s.title,
    hook: s.plain_english_hook,
    hookHtml: md.inline(s.plain_english_hook),
    takeaway: s.takeaway || s.plain_english_hook,
    paa: PAA[s.id] || null,
    archetype,
    badges,
    summaryHtml: md.block(s.summary_markdown),
    evidence,
    tables,
    scholars: {
      harmonizationHtml: md.block(s.scholarly_discussion?.classical_harmonization),
      evaluationHtml: md.block(s.scholarly_discussion?.primary_source_evaluation),
    },
    deepDive: { html: md.block(s.deep_dive_markdown, { headingOffset: 0 }), words: s.deep_dive_word_count },
    arabic: (s.arabic_blockquotes || []).map(b => ({
      n: b.index,
      arabic: b.arabic_text,
      englishHtml: md.inline(b.english_translation),
      citationHtml: md.inline(b.citation),
    })),
    sources,
    sourceGroups: SOURCE_GROUPS.map(g => ({ ...g, items: sources[g.kind] })).filter(g => g.items.length),
    further,
    seo: {
      title: seo?.title || plainText(s.short_title),
      description: seo?.description || plainText(s.plain_english_hook),
    },
  };
  c.showcase = resolveShowcase(s, c, md);
  return c;
}

/** Normalises the dataset showcase for the archetype components (all text pre-rendered). */
function resolveShowcase(s, c, md) {
  const sc = s.showcase;
  const ref = (label, url) => {
    if (!url || md.checkBlocked(url)) return null;
    const link = linkFor(url);
    return { ...link, label: shortRefLabel(label, url) || link.host };
  };
  const marked = text => md.inline(String(text || '')).replace(/\[\[(.+?)\]\]/g, '<mark>$1</mark>');
  // Fallback when a case has no showcase: its first evidence labels as a numbered list.
  const factsFallback = () => ({
    type: 'facts',
    items: c.evidence.slice(0, 3).map(e => ({ html: e.labelHtml, anchor: e.anchor, ref: e.chips[0] || null })),
  });
  if (!sc) return factsFallback();
  switch (sc.type) {
    case 'number_fan':
    case 'bars':
      return {
        type: sc.type,
        unitHtml: md.inline(sc.unit),
        items: (sc.items || []).map((it, i) => ({
          value: String(it.value), numeric: Number(String(it.value).replace(/[^\d.]/g, '')) || 0,
          labelHtml: md.inline(it.label || it.who || ''), ref: ref(it.ref_label, it.url),
          anchor: it.evidence ? `evidence-${it.evidence}` : null, key: i,
        })),
      };
    case 'versions':
      return {
        type: 'versions',
        items: (sc.items || []).map((it, i) => ({
          labelHtml: md.inline(it.label), wordingHtml: marked(it.wording_en), arabic: it.wording_ar || null,
          ref: ref(it.ref_label, it.url), key: i,
        })),
      };
    case 'redline':
      return {
        type: 'redline',
        a: { ref: ref(sc.a?.ref_label, sc.a?.url), html: marked(sc.a?.text) },
        b: { ref: ref(sc.b?.ref_label, sc.b?.url), html: marked(sc.b?.text) },
        noteHtml: md.inline(sc.note || ''),
      };
    case 'timeline':
      return {
        type: 'timeline',
        gapHtml: md.inline(sc.gap_label || ''),
        points: (sc.points || []).map(p => ({
          year: p.year_ce, yearAh: p.year_ah ?? null, labelHtml: md.inline(p.label), ref: ref(p.ref_label, p.url),
        })),
      };
    case 'chain':
      return {
        type: 'chain',
        noteHtml: md.inline(sc.note || ''),
        narrators: (sc.narrators || []).map(n => ({
          name: n.name, deathAh: n.death_ah ?? null, verdictHtml: md.inline(n.verdict || ''),
          ref: ref(n.verdict_ref_label || 'Source', n.verdict_source_url), gapAfter: !!n.gap_after,
        })),
      };
    case 'witnesses':
      return {
        type: 'witnesses',
        items: (sc.items || []).map(w => ({
          scholar: w.scholar, deathAh: w.death_ah ?? null, workHtml: md.inline(w.work || ''),
          arabic: w.arabic || null, englishHtml: md.inline(w.english || ''), ref: ref(w.ref_label || w.work, w.url),
        })),
      };
    case 'confrontation': {
      const side = x => ({
        titleHtml: md.inline(x?.title || ''),
        items: (x?.items || []).map(it => ({ html: md.inline(it.text), ref: ref(it.ref_label, it.url) })),
      });
      return { type: 'confrontation', left: side(sc.left), right: side(sc.right), noteHtml: md.inline(sc.note || '') };
    }
    default:
      return factsFallback();
  }
}

function reportIssues(issues) {
  const lines = [];
  if (issues.blocked.size) lines.push(`  - links rendered as plain text (verdict: ${[...BLOCKING_VERDICTS].join('/')}): ${issues.blocked.size}`);
  if (issues.missingShowcase.length) lines.push(`  - cases without dataset showcase (using fallback): ${issues.missingShowcase.length}`);
  if (issues.missingTakeaway.length) lines.push(`  - cases without takeaway (using hook): ${issues.missingTakeaway.length}`);
  if (issues.missingQuote.length) lines.push(`  - evidence items without key_arabic_quote_structured: ${issues.missingQuote.length}`);
  if (issues.unknownHost.size) lines.push(`  - primary-reference hosts without a label: ${[...issues.unknownHost].join(', ')}`);
  if (lines.length) console.warn(`[hadithReliability]\n${lines.join('\n')}`);
}

export function loadHadithReliability() {
  const key = fs.existsSync(DATASET_PATH) ? fs.statSync(DATASET_PATH).mtimeMs : null;
  if (!cache || key !== cacheKey) {
    cache = buildModel();
    cacheKey = key;
  }
  return cache;
}
