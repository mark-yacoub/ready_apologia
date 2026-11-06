import booksMeta from '../data/books_meta.json';
import { mapMtToLxx } from './scripture_mapper.js';
import {
  formatDate,
  formatMsDateRange,
  cleanMsName,
  conciseMsName,
  conciseLocation,
  getUniqueManuscripts,
  buildManuscriptLocationAndDates,
  buildManuscriptTitle
} from './manuscriptFormat.js';
import {
  sanitizeQuestionText,
  sanitizeHTML,
  fitText,
  clampDescription,
  cleanItemTitle,
  cleanVideoTitle,
  quoteTail,
  formatList
} from './seo/text.js';

export {
  formatDate,
  formatMsDateRange,
  cleanMsName,
  conciseMsName,
  conciseLocation,
  sanitizeQuestionText,
  sanitizeHTML
};

export const SITE_ORIGIN = (typeof process !== 'undefined' && process.env?.SITE_URL) ? process.env.SITE_URL.replace(/\/$/, '') : 'https://readyapologia.com';
export const DEFAULT_LOGO_URL = `${SITE_ORIGIN}/assets/logo.png`;
export const SITE_NAME = 'Ready Apologia';

/** Nickel footnotes open with a heading line ("10.71 – Recite to them the story of Noah"),
 *  separated by a real or literal "\\n". Drop it so descriptions don't read "Noah Noah". */
const stripFootnoteHeading = (content) => {
  const lines = String(content).split(/\\n|\n/);
  return (lines.length > 1 && /^\s*\**\d+\.\d+/.test(lines[0]) ? lines.slice(1) : lines).join(' ');
};


const BOOKS_META_MAP = {};
const OT_BOOK_SET = new Set();
(booksMeta?.nt || []).forEach(b => { BOOKS_META_MAP[b.id] = b; });
(booksMeta?.ot || []).forEach(b => { BOOKS_META_MAP[b.id] = b; OT_BOOK_SET.add(b.id); });

export const formatBibleVerseIdToLabel = (id) => {
  if (!id) return '';
  const p = String(id).split('_');
  const bMeta = BOOKS_META_MAP[p[0]];
  if (!bMeta) return '';
  if (OT_BOOK_SET.has(p[0])) {
    const m = mapMtToLxx(p[0], p[1], p[2]);
    return `${bMeta.name} ${m.chapter}:${m.verse}`;
  }
  return `${bMeta.name} ${p[1]}:${p.slice(2).join('_')}`;
};

/**
 * L6 HTML Sanitizer for Google Search FAQPage Answer.text.
 * Retains safe semantic tags (<p>, <br>, <ul>, <ol>, <li>, <a>, <b>, <i>, <strong>, <em>)
 * converts common Markdown formatting safely, while stripping scripts, styles, event handlers, and dangerous URIs.
 */
export const sanitizeAnswerHTML = (str) => {
  if (!str) return "";
  return String(str)
    // Strip scripts, styles, and iframes completely
    .replace(/<(script|style|iframe)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Convert Markdown links [text](url) to safe <a href="url">text</a>
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
    // Convert Markdown bold **text** to <strong>text</strong>
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Convert Markdown italic *text* or _text_ to <em>text</em>
    .replace(/(?:^|\s)\*([^*]+)\*(?:\s|$)/g, ' <em>$1</em> ')
    .replace(/(?:^|\s)_([^_]+)_(?:\s|$)/g, ' <em>$1</em> ')
    // Convert Markdown headings to strong paragraphs
    .replace(/^#{1,6}\s+(.*)$/gm, '<p><strong>$1</strong></p>')
    // Strip inline event handlers (e.g., onclick=...) and javascript: URIs
    .replace(/\son[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*")/gi, 'href="#"')
    // Remove unsupported tags while preserving allowed semantic elements
    .replace(/<\/?(?!p|br|ul|ol|li|a|b|i|strong|em)(?:[a-z0-9]+)(?:[^>]*)>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Industrial-grade JSON-LD stringifier protecting against XSS breakout in script tags.
 */
export const safeJsonStringify = (obj) => {
  if (!obj) return undefined;
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
};

/**
 * Generates Schema.org BreadcrumbList entity with URL normalization and deduplication.
 */
export const buildBreadcrumbSchema = (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  // Filter and normalize items
  const validItems = items.filter(item => item && item.name && item.url);
  if (validItems.length === 0) return null;

  return {
    "@type": "BreadcrumbList",
    "itemListElement": validItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": sanitizeQuestionText(item.name),
      "item": item.url.startsWith('http') ? item.url : `${SITE_ORIGIN}${item.url.startsWith('/') ? '' : '/'}${item.url}`
    }))
  };
};

/**
 * Generates Google Search FAQPage JSON-LD schema entity with canonical webpage binding and question deduplication.
 */
export const buildFaqEntity = (items, getQuestionText, getAnswerText, canonicalUrl) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  const seenQuestions = new Set();
  const faqs = [];

  for (const item of items) {
    if (!item) continue;
    try {
      const q = sanitizeQuestionText(getQuestionText(item));
      const a = sanitizeAnswerHTML(getAnswerText(item));
      if (!q || !a || seenQuestions.has(q.toLowerCase())) continue;
      
      seenQuestions.add(q.toLowerCase());
      faqs.push({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": { "@type": "Answer", "text": a }
      });
    } catch (err) {
      // Graceful error isolation
    }
  }

  if (faqs.length === 0) return null;

  return {
    "@type": "FAQPage",
    ...(canonicalUrl && {
      "@id": `${canonicalUrl}#faqpage`,
      "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl }
    }),
    "mainEntity": faqs
  };
};

/**
 * Generates Google Search FAQPage JSON-LD schema with canonical webpage binding.
 */
const buildFaqSchema = (items, getQuestionText, getAnswerText, canonicalUrl) => {
  const entity = buildFaqEntity(items, getQuestionText, getAnswerText, canonicalUrl);
  if (!entity) return undefined;
  return safeJsonStringify({
    "@context": "https://schema.org",
    ...entity
  });
};

/**
 * L6 Higher-Order Resolver Factory: Eliminates duplicated SEO resolution boilerplate and auto-injects breadcrumbs.
 */
function createTabSEOResolver(defaultStrategy, tabStrategies, getBreadcrumbs) {
  return (data) => {
    const { tab } = data;
    const fallback = defaultStrategy(data);

    let resolvedTitle = fallback.title;
    let resolvedDescription = fallback.description;
    let resolvedKeywords = fallback.keywords;
    let resolvedOpeningLine = fallback.openingLine || '';
    let resolvedFaqEntity = null;

    if (tabStrategies[tab]) {
      const config = tabStrategies[tab];
      const dynamicResults = config.dynamic ? config.dynamic(data) : {};
      resolvedTitle = dynamicResults.title || config.title || fallback.title;
      resolvedDescription = dynamicResults.description || config.description || fallback.description;
      resolvedKeywords = dynamicResults.keywords || config.keywords || fallback.keywords;
      resolvedOpeningLine = dynamicResults.openingLine || config.openingLine || fallback.openingLine || '';
      
      if (dynamicResults.faqEntity) {
        resolvedFaqEntity = dynamicResults.faqEntity;
      } else if (dynamicResults.schema) {
        resolvedFaqEntity = typeof dynamicResults.schema === 'string'
          ? JSON.parse(dynamicResults.schema)
          : dynamicResults.schema;
      }
    }

    // Automatically construct Breadcrumbs & combined @graph
    const breadcrumbItems = getBreadcrumbs ? getBreadcrumbs(data) : null;
    const breadcrumbEntity = buildBreadcrumbSchema(breadcrumbItems);

    let schemaGraph = [];
    if (breadcrumbEntity) schemaGraph.push(breadcrumbEntity);
    if (resolvedFaqEntity) {
      if (resolvedFaqEntity['@graph']) {
        schemaGraph.push(...resolvedFaqEntity['@graph']);
      } else {
        const { '@context': _ctx, ...faqObj } = resolvedFaqEntity;
        schemaGraph.push(faqObj);
      }
    }

    const finalSchema = schemaGraph.length > 0
      ? { "@context": "https://schema.org", "@graph": schemaGraph }
      : undefined;

    return {
      seoTitle: resolvedTitle,
      seoDescription: resolvedDescription,
      seoKeywords: resolvedKeywords,
      seoSchema: finalSchema,
      openingLine: resolvedOpeningLine
    };
  };
}

/**
 * Bible Verse Tab SEO Resolver
 */
export const generateBibleTabSEO = createTabSEOResolver(
  (data) => {
    const verseRef = `${data.bookName} ${data.chapter}:${data.verse}`;
    return {
      title: `${verseRef}: Biblical Evidence & Commentary`,
      description: `Explore ancient manuscripts, Early Church Father commentary, and cross-reference answers for ${verseRef}.`,
      keywords: `${verseRef} evidence, ${verseRef} meaning`,
      openingLine: `Primary manuscript, patristic, and exegetical evidence for ${verseRef}.`
    };
  },
  {
    'manuscripts': {
      dynamic: (data) => {
        const verseRef = `${data.bookName} ${data.chapter}:${data.verse}`;
        if (!data.manuscripts || data.manuscripts.length === 0) {
          return {
            title: `${verseRef} Manuscripts & Earliest Copies`,
            description: `Explore ancient biblical manuscript scans and dating metadata for ${verseRef}.`,
            keywords: `${verseRef} manuscripts, earliest manuscript of ${verseRef.toLowerCase()}`,
            openingLine: `Ancient manuscript catalog for ${verseRef}.`
          };
        }
        const uniqueMs = getUniqueManuscripts(data.manuscripts);
        const totalScans = data.manuscripts.length;
        const earliest = uniqueMs[0];
        const earliestName = conciseMsName(earliest);
        const dateStr = formatMsDateRange(earliest);
        const loc = conciseLocation(earliest.current_location);

        const faqs = [
          {
            "@type": "Question",
            "name": `Which ancient manuscripts contain ${verseRef}?`,
            "acceptedAnswer": { "@type": "Answer", "text": sanitizeAnswerHTML(`Some of the earliest ancient manuscripts that preserve ${verseRef} include: ${uniqueMs.map(cleanMsName).join(', ')}.`) }
          }
        ];

        uniqueMs.slice(0, 4).forEach(ms => {
          const msName = cleanMsName(ms);
          const answerText = `The ${msName} is an ancient manuscript that contains ${verseRef}.${buildManuscriptLocationAndDates(ms, data.isNT)}`;
          faqs.push({
            "@type": "Question",
            "name": `What is the ${msName} manuscript?`,
            "acceptedAnswer": { "@type": "Answer", "text": sanitizeAnswerHTML(answerText) }
          });
        });

        const openingLine = uniqueMs.length === 1
          ? `${verseRef} is attested in 1 ancient manuscript${totalScans > 1 ? ` (${totalScans} scans)` : ''}: ${earliestName} (${dateStr})${loc ? `, held at ${loc}` : ''}.`
          : `${verseRef} is attested in ${uniqueMs.length} ancient manuscripts${totalScans > uniqueMs.length ? ` (${totalScans} scans)` : ''}; the earliest is ${earliestName} (${dateStr})${loc ? `, held at ${loc}` : ''}.`;

        const descBase = uniqueMs.length === 1
          ? `Earliest manuscript of ${verseRef}: ${earliestName} (${dateStr})${loc ? `, held at ${loc}` : ''}. View high-resolution scan and dating notes.`
          : `Earliest manuscript of ${verseRef}: ${earliestName} (${dateStr})${loc ? ` at ${loc}` : ''}. Compare ${uniqueMs.length} ancient manuscripts${totalScans > uniqueMs.length ? ` (${totalScans} scans)` : ''}.`;

        return {
          title: buildManuscriptTitle(verseRef, uniqueMs, `${verseRef} Manuscripts & Earliest Copies`),
          description: clampDescription(descBase),
          keywords: `${verseRef} manuscripts, earliest manuscript of ${data.bookName.toLowerCase()}, ${earliestName}`,
          openingLine,
          faqEntity: {
            "@type": "FAQPage",
            ...(data.canonicalUrl && { "@id": `${data.canonicalUrl}#faqpage`, "mainEntityOfPage": { "@type": "WebPage", "@id": data.canonicalUrl } }),
            "mainEntity": faqs
          }
        };
      }
    },
    'contradictions': {
      dynamic: (data) => {
        const verseRef = `${data.bookName} ${data.chapter}:${data.verse}`;
        const items = Array.isArray(data.contradictions) ? data.contradictions : [];
        const hasData = items.length > 0;
        const first = items[0];
        const checkId = data.checkId || `${data.book}_${data.chapter}_${data.verse}`;
        const otherId = first ? (first.verse1 === checkId ? first.verse2 : first.verse1) : '';
        const otherLabel = formatBibleVerseIdToLabel(otherId);
        const firstClean = cleanItemTitle(first?.title, verseRef, otherLabel);

        let title = `${verseRef}: Cross-Reference Questions Answered`;
        if (otherLabel) {
          // LXX book names carry an alias ("1 Kings (3 Kingdoms)"); drop it before giving up on length.
          const noAlias = (s) => s.replace(/\s*\([^)]*\)/g, '');
          const a = verseRef, b = otherLabel, sa = noAlias(verseRef), sb = noAlias(otherLabel);
          const n = items.length;
          const candidates = n === 1
            ? [`Does ${a} Contradict ${b}? Answer`, `${a} vs ${b}: Question Answered`, `${a} vs ${b}: Answer`,
               `${sa} vs ${sb}: Question Answered`, `${sa} vs ${sb}: Answer`, `${sa} vs ${sb}`]
            : [`${a} vs ${b}: ${n} Questions Answered`, `${a} vs ${b} (${n} Answers)`,
               `${sa} vs ${sb}: ${n} Questions Answered`, `${sa} vs ${sb} (${n} Answers)`, `${sa} vs ${sb}`];
          title = candidates.find(c => c.length <= 60) || fitText(`${sa} vs ${sb}`, 60);
        } else if (firstClean) {
          const prefix = `${verseRef}: `;
          title = `${prefix}${fitText(firstClean, 60 - prefix.length)}`;
        }

        const description = hasData
          ? clampDescription(
              otherLabel
                ? `How does ${verseRef} fit with ${otherLabel}${firstClean ? ` (“${firstClean}”)` : ''}? Read ${items.length} textual and historical ${items.length === 1 ? 'answer' : 'answers'} comparing the passages in context.`
                : `Read ${items.length} textual and historical ${items.length === 1 ? 'answer' : 'answers'} on ${verseRef}${firstClean ? `, starting with ${quoteTail(firstClean, true)}` : '.'}`
            )
          : `Read textual and historical answers to cross-reference questions involving ${verseRef}.`;

        const openingLine = hasData
          ? (otherLabel && items.length === 1
              ? `Comparing ${verseRef} with ${otherLabel}${firstClean ? ` on ${quoteTail(firstClean, true)}` : '.'}`
              : otherLabel
                ? `${items.length} cross-reference questions comparing ${verseRef} with ${otherLabel} and related passages${firstClean ? `, starting with ${quoteTail(firstClean, true)}` : '.'}`
                : `${items.length} cross-reference ${items.length === 1 ? 'question' : 'questions'} on ${verseRef}${firstClean ? `, starting with ${quoteTail(firstClean, true)}` : '.'}`)
          : `Cross-reference questions and contextual answers for ${verseRef}.`;

        return {
          title,
          description,
          keywords: `${verseRef}${otherLabel ? `, ${otherLabel}` : ''}, bible cross-reference answers, patristic harmonization`,
          openingLine,
          faqEntity: hasData
            ? buildFaqEntity(data.contradictions, c => c.title, c => c.summary || c.answer, data.canonicalUrl)
            : undefined
        };
      }
    },
    'apologetics': {
      dynamic: (data) => {
        const verseRef = `${data.bookName} ${data.chapter}:${data.verse}`;
        const items = Array.isArray(data.apologetics) ? data.apologetics : [];
        const hasData = items.length > 0;
        const count = items.length;
        const fathers = [...new Set(items.map(a => a.father_name).filter(Boolean))];
        const hasPatristic = fathers.length > 0;
        const hasModern = items.some(a => !a.father_name);
        const firstClean = cleanItemTitle(items[0]?.title, verseRef);

        const prefix = `${verseRef} Meaning: `;
        let title = `${verseRef} Meaning & Commentary`;
        if (hasData) {
          if (count === 1 && firstClean && `${prefix}${firstClean}`.length <= 60) {
            title = `${prefix}${firstClean}`;
          } else if (hasPatristic && hasModern) {
            const c1 = `${prefix}${count} Ancient & Modern Answers`;
            title = c1.length <= 60 ? c1 : `${prefix}${count} Commentaries`;
          } else if (hasPatristic) {
            const c1 = `${prefix}${count} Church Father ${count === 1 ? 'Answer' : 'Answers'}`;
            const c2 = `${prefix}${count} Patristic ${count === 1 ? 'Answer' : 'Answers'}`;
            title = c1.length <= 60 ? c1 : c2;
          } else if (firstClean) {
            title = `${prefix}${fitText(firstClean, 60 - prefix.length)}`;
          }
        }

        const description = hasData
          ? clampDescription(
              `What does ${verseRef} mean? Read ${count} ${hasPatristic && hasModern ? 'Early Church Father and modern ' : hasPatristic ? 'Early Church Father ' : ''}${count === 1 ? 'commentary' : 'commentaries'}${fathers.length > 0 ? ` (including ${fathers.slice(0, 2).join(' and ')})` : ''}${firstClean ? ` on ${quoteTail(firstClean, true)}` : '.'}`
            )
          : `What does ${verseRef} mean? Read Early Church Father and modern theological commentary on ${verseRef}.`;

        const openingLine = hasData
          ? (hasPatristic && hasModern
              ? `${count} ancient and modern commentaries on ${verseRef} (including ${fathers.slice(0, 2).join(' and ')})${firstClean ? `, starting with ${quoteTail(firstClean, true)}` : '.'}`
              : hasPatristic
                ? `${count} Early Church Father ${count === 1 ? 'commentary' : 'commentaries'} on ${verseRef} (${fathers.slice(0, 2).join(' and ')})${firstClean ? `, starting with ${quoteTail(firstClean, true)}` : '.'}`
                : `${count} ${count === 1 ? 'commentary' : 'commentaries'} on ${verseRef}${firstClean ? ` examining ${quoteTail(firstClean, true)}` : '.'}`)
          : `Early Church Father and modern commentary on ${verseRef}.`;

        return {
          title,
          description,
          keywords: `${verseRef} meaning, ${verseRef} commentary, patristic commentary`,
          openingLine,
          faqEntity: hasData
            ? buildFaqEntity(data.apologetics, a => a.title, a => a.summary || a.answer, data.canonicalUrl)
            : undefined
        };
      }
    },
    'videos': {
      dynamic: (data) => {
        const verseRef = `${data.bookName} ${data.chapter}:${data.verse}`;
        const vids = Array.isArray(data.videos) ? data.videos : [];
        const count = vids.length;
        const firstClean = cleanVideoTitle(vids[0]?.title);

        let title = `${verseRef} Explained: Short Videos & Transcripts`;
        if (count > 0) {
          const c1 = `${verseRef} Explained: ${count} Short ${count === 1 ? 'Video' : 'Videos'} & Transcripts`;
          const c2 = `${verseRef} Explained: ${count} Short ${count === 1 ? 'Video' : 'Videos'}`;
          title = c1.length <= 60 ? c1 : c2;
        }

        const description = count > 0
          ? clampDescription(`Watch ${count} short ${count === 1 ? 'video' : 'videos'} on ${verseRef} with full transcripts and linked cross-references.`)
          : `Watch short videos on ${verseRef} with full transcripts and linked scripture references.`;

        const openingLine = count > 0
          ? `${count} short ${count === 1 ? 'video' : 'videos'} on ${verseRef} with transcripts and linked cross-references.`
          : `Short videos and transcripts explaining ${verseRef}.`;

        return {
          title,
          description,
          keywords: `${verseRef} video, ${verseRef} explained`,
          openingLine
        };
      }
    }
  },
  (data) => {
    const bibleTabLabels = {
      'manuscripts': 'Ancient Manuscripts',
      'contradictions': 'Cross-Reference Questions',
      'apologetics': 'Meaning & Commentary',
      'videos': 'Short Videos'
    };
    const bookCode = data.book || 'jn';
    return [
      { name: SITE_NAME, url: `${SITE_ORIGIN}/` },
      { name: "Bible", url: `${SITE_ORIGIN}/bible/jn/1` },
      { name: data.bookName, url: `${SITE_ORIGIN}/bible/${bookCode}/1` },
      { name: `${data.bookName} ${data.chapter}`, url: `${SITE_ORIGIN}/bible/${bookCode}/${data.chapter}` },
      { name: `${data.bookName} ${data.chapter}:${data.verse}`, url: data.canonicalUrl || `${SITE_ORIGIN}/bible/${bookCode}/${data.chapter}/${data.verse}/${data.tab}` },
      { name: bibleTabLabels[data.tab] || data.tab, url: data.canonicalUrl }
    ];
  }
);

/**
 * Quran Verse Tab SEO Resolver (Fixed Quran Property Bugs: vc.description, se.text, vd.refutation)
 */
export const generateQuranTabSEO = createTabSEOResolver(
  (data) => {
    const verseRef = `Quran ${data.surah}:${data.ayah}`;
    return {
      title: `${verseRef}: Text, Tafsir & Manuscripts`,
      description: `Read ${verseRef} in Arabic and English with unabridged classical tafsir, early manuscripts, and primary-source analysis.`,
      keywords: `quran ${data.surah}:${data.ayah}, surah ${data.surah}:${data.ayah}`,
      openingLine: `Primary textual, manuscript, and classical commentary sources for ${verseRef}.`
    };
  },
  {
    'manuscripts': {
      dynamic: (data) => {
        const qRef = `Quran ${data.surah}:${data.ayah}`;
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        if (!data.manuscripts || data.manuscripts.length === 0) {
          return {
            title: `${qRef} Manuscripts & Earliest Folios`,
            description: `Examine early Quranic manuscripts and variant readings (Qira'at) for ${qRef}.`,
            keywords: `${qRef} manuscripts, earliest quran manuscripts, qiraat variants`,
            openingLine: `Early Quranic manuscript catalog for ${qRef}.`
          };
        }
        const uniqueMs = getUniqueManuscripts(data.manuscripts);
        const totalScans = data.manuscripts.length;
        const earliest = uniqueMs[0];
        const earliestName = conciseMsName(earliest);
        const dateStr = formatMsDateRange(earliest);
        const loc = conciseLocation(earliest.current_location);

        const faqs = [
          {
            "@type": "Question",
            "name": `Which ancient manuscripts contain ${verseRef}?`,
            "acceptedAnswer": { "@type": "Answer", "text": sanitizeAnswerHTML(`Some of the earliest ancient Quranic manuscripts that preserve ${verseRef} include: ${uniqueMs.map(cleanMsName).join(', ')}.`) }
          }
        ];

        uniqueMs.slice(0, 4).forEach(ms => {
          const msName = cleanMsName(ms);
          let answerText = `The ${msName} is an ancient Quranic manuscript that contains ${verseRef}.`;
          if (ms.variants_and_typos) {
            answerText += ` Crucially, it contains major historical textual variants and typos compared to the modern standard Uthmanic text: ${ms.variants_and_typos}.`;
          }
          answerText += buildManuscriptLocationAndDates(ms, true);
          faqs.push({
            "@type": "Question",
            "name": `What is the ${msName} manuscript?`,
            "acceptedAnswer": { "@type": "Answer", "text": sanitizeAnswerHTML(answerText) }
          });
        });

        const openingLine = uniqueMs.length === 1
          ? `${qRef} is attested in 1 ancient manuscript${totalScans > 1 ? ` (${totalScans} folios)` : ''}: ${earliestName} (${dateStr})${loc ? `, held at ${loc}` : ''}.`
          : `${qRef} is attested in ${uniqueMs.length} ancient manuscripts${totalScans > uniqueMs.length ? ` (${totalScans} folios)` : ''}; the earliest is ${earliestName} (${dateStr})${loc ? `, held at ${loc}` : ''}.`;

        const descBase = uniqueMs.length === 1
          ? `Earliest manuscript of ${qRef}: ${earliestName} (${dateStr})${loc ? `, held at ${loc}` : ''}. View high-resolution folio scan and dating notes.`
          : `Earliest manuscript of ${qRef}: ${earliestName} (${dateStr})${loc ? ` at ${loc}` : ''}. Compare ${uniqueMs.length} early Quranic manuscripts${totalScans > uniqueMs.length ? ` (${totalScans} folios)` : ''}.`;

        return {
          title: buildManuscriptTitle(qRef, uniqueMs, `${qRef} Manuscripts & Earliest Folios`),
          description: clampDescription(descBase),
          keywords: `${qRef} manuscripts, ${verseRef} manuscripts, carbon dated quran, qiraat variants`,
          openingLine,
          faqEntity: {
            "@type": "FAQPage",
            ...(data.canonicalUrl && { "@id": `${data.canonicalUrl}#faqpage`, "mainEntityOfPage": { "@type": "WebPage", "@id": data.canonicalUrl } }),
            "mainEntity": faqs
          }
        };
      }
    },
    'christian-footnotes': {
      dynamic: (data) => {
        const qRef = `Quran ${data.surah}:${data.ayah}`;
        const notes = Array.isArray(data.christianFootnotes) ? data.christianFootnotes : [];
        const count = notes.length;
        // Verse-tab page = generic template copy (owner policy: only single-item pages quote their source).
        const title = `${qRef} Meaning: Christian Commentary & Context`;
        const description = `Read ${count > 1 ? `${count} comparative commentary notes` : 'comparative commentary'} on ${qRef} beside the related Bible passages, with the verse in Arabic and English and its historical context.`;
        const openingLine = `${count || 1} comparative commentary ${count === 1 ? 'note' : 'notes'} on ${qRef} examining its historical context and biblical parallels.`;

        return {
          title,
          description,
          keywords: `${qRef} christian commentary, surah ${data.surah}:${data.ayah} meaning, bible vs quran`,
          openingLine
        };
      }
    },
    'contradictions': {
      dynamic: (data) => {
        const qRef = `Quran ${data.surah}:${data.ayah}`;
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        const items = Array.isArray(data.verseContradictions) ? data.verseContradictions : [];
        const hasData = items.length > 0;
        const first = items[0];
        const selfId = `${data.surah}:${data.ayah}`;
        const opp = (first?.opposite_verses || []).find(v => v !== selfId) || (first?.supporting_verses || []).find(v => v !== selfId);
        const topic = sanitizeQuestionText(first?.evidence || 'Parallel Passages');

        const prefix = opp ? `${qRef} vs ${opp}: ` : `${qRef} Comparison: `;
        const title = `${prefix}${fitText(topic, 60 - prefix.length)}`;

        const description = hasData
          ? clampDescription(`Read ${qRef}${opp ? ` and Surah ${opp}` : ''} side by side on "${topic}" and compare the two passages in context.`)
          : `Compare ${qRef} side by side with related passages across the Quran.`;

        const openingLine = hasData
          ? (items.length === 1
              ? `Side-by-side comparison of ${qRef}${opp ? ` and Surah ${(first.opposite_verses || [opp]).slice(0, 3).join(', ')}` : ''} on “${topic}.”`
              : `${items.length} side-by-side passage comparisons involving ${qRef}, starting with Surah ${opp || selfId} on “${topic}.”`)
          : `Side-by-side comparison of ${qRef} with parallel Quranic passages.`;

        return {
          title,
          description,
          keywords: `${qRef}${opp ? `, quran ${opp}` : ''}, ${verseRef} comparison, ${topic.toLowerCase()}`,
          openingLine,
          faqEntity: hasData
            ? buildFaqEntity(data.verseContradictions, vc => vc.evidence, vc => vc.description || vc.evidence, data.canonicalUrl)
            : undefined
        };
      }
    },
    'scientific-errors': {
      dynamic: (data) => {
        const qRef = `Quran ${data.surah}:${data.ayah}`;
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        const items = Array.isArray(data.parsedScientificErrors) ? data.parsedScientificErrors : [];
        const hasData = items.length > 0;
        const first = items[0];
        const rawLabel = sanitizeQuestionText(first?.title || first?.label || '')
          .replace(/\s*\([^)]*\)/g, '')
          .replace(new RegExp(`\\s*in\\s+Quran\\s+${data.surah}:${data.ayah}$`, 'i'), '')
          .replace(/\s+/g, ' ')
          .trim();

        const prefix = `${qRef} Analysis: `;
        const title = `${prefix}${fitText(rawLabel || 'Cosmology & Natural World', 60 - prefix.length)}`;

        // Verse-tab page = generic template copy (owner policy: only single-item pages quote their source).
        const description = hasData && rawLabel
          ? clampDescription(`Read ${qRef} on “${rawLabel}” beside classical Arabic lexicons, Tafsir al-Tabari and Ibn Kathir, and modern scholarship.`)
          : `Examine ${qRef} in classical Arabic lexicons and early tafsir on the natural world.`;

        const openingLine = hasData && rawLabel
          ? `Textual, classical tafsir, and historical analysis of ${qRef}: “${rawLabel}.”`
          : `Textual, classical tafsir, and historical analysis of ${qRef}.`;

        return {
          title,
          description,
          keywords: `${qRef} analysis, ${verseRef} cosmology, classical tafsir ${qRef}`,
          openingLine,
          faqEntity: hasData
            ? buildFaqEntity(
                data.parsedScientificErrors,
                se => `What does ${verseRef} say regarding ${sanitizeQuestionText(se.label)}?`,
                se => se.text || se.label,
                data.canonicalUrl
              )
            : undefined
        };
      }
    },
    'tafsir': {
      dynamic: (data) => {
        const qRef = `Quran ${data.surah}:${data.ayah}`;
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        const ac = data.activeCommentary;
        if (ac) {
          const schemaItems = [];
          if (ac.commentary) {
            schemaItems.push({
              q: `What does ${ac.title || 'Tafsir'} say about ${verseRef} in English?`,
              a: ac.commentary
            });
          }
          if (ac.commentary_arabic) {
            schemaItems.push({
              q: `What does ${ac.title_arabic || ac.title || 'Tafsir'} say about ${verseRef} in the original Arabic?`,
              a: ac.commentary_arabic
            });
          }
          const cleanName = ac.name || 'Tafsir';
          const candidateTitle = `${cleanName} on ${qRef}: Unabridged English & Arabic`;
          const title = candidateTitle.length <= 60
            ? candidateTitle
            : `${cleanName}, ${qRef}: Unabridged English & Arabic`;

          const description = ac.id === 'tabari'
            ? `Complete, unabridged Tafsir al-Tabari (AD 883) on ${qRef}: full original Arabic from Jami' al-Bayan beside a complete English translation.`
            : ac.id === 'ibn_kathir'
              ? `Complete, unabridged Tafsir Ibn Kathir (AD 1373) on ${qRef} in English and original Arabic, including sections omitted from abridged editions.`
              : `Read the complete, unabridged ${ac.title || cleanName} on ${qRef} in English translation beside the original Arabic text.`;

          const openingLine = ac.id === 'tabari'
            ? `Complete, unabridged Tafsir al-Tabari (AD 883) on ${qRef} — full original Arabic text from Jami' al-Bayan beside a complete generated English translation.`
            : ac.id === 'ibn_kathir'
              ? `Complete, unabridged Tafsir Ibn Kathir (AD 1373) on ${qRef} — full original Arabic text beside the complete English commentary.`
              : `Complete, unabridged ${ac.title || cleanName} on ${qRef} in English translation and original Arabic.`;

          return {
            title,
            description: clampDescription(description),
            keywords: `${cleanName} ${qRef}, unabridged ${cleanName} english, arabic ${cleanName}, ${qRef} tafsir`,
            openingLine,
            faqEntity: schemaItems.length > 0 
              ? buildFaqEntity(schemaItems, item => item.q, item => item.a, data.canonicalUrl)
              : undefined
          };
        }
        
        return {
          title: `${qRef}: Unabridged Classical Tafsir (English & Arabic)`,
          description: `Read complete, unabridged classical Sunni tafsir on ${qRef} in English translation beside the original Arabic.`,
          keywords: `english tafsir ${qRef}, ${qRef} explanation, islamic exegesis`,
          openingLine: `Complete, unabridged classical Sunni commentary on ${qRef} in English and original Arabic.`,
          faqEntity: undefined
        };
      }
    },
    'debunking-miracles': {
      dynamic: (data) => {
        const qRef = `Quran ${data.surah}:${data.ayah}`;
        const items = Array.isArray(data.verseDebunking) ? data.verseDebunking : [];
        const hasData = items.length > 0;
        const first = items[0];
        const rawCat = sanitizeQuestionText(first?.miracle_category || 'Scientific');
        const catParts = rawCat.split(/\s*[\/&]\s*/).filter(Boolean);
        const shortCat = catParts.length > 1 ? catParts[catParts.length - 1] : rawCat;

        const c1 = `${qRef} ${shortCat} Claim: Classical Tafsir & Text`;
        const c2 = `${qRef} ${shortCat} Claim: Classical Tafsir`;
        const title = c1.length <= 60 ? c1 : c2.length <= 60 ? c2 : `${qRef} Miracle Claim: ${fitText(shortCat, 60 - `${qRef} Miracle Claim: `.length)}`;

        const summaryStr = sanitizeQuestionText(first?.summary || first?.classification_explanation || first?.claim || '');
        const description = hasData && summaryStr
          ? clampDescription(summaryStr)
          : `Compare modern scientific claims about ${qRef} with classical Arabic lexicons, Tafsir al-Tabari, and Tafsir Ibn Kathir.`;

        const openingLine = `Comparing the modern ${rawCat.toLowerCase()} claim on ${qRef} with classical Arabic lexicons, Tafsir al-Tabari, and Tafsir Ibn Kathir.`;

        return {
          title,
          description,
          keywords: `${qRef} ${shortCat.toLowerCase()} claim, ${qRef} classical tafsir, quran scientific claims context`,
          openingLine,
          faqEntity: hasData
            ? buildFaqEntity(data.verseDebunking, vd => vd.claim, vd => vd.summary || vd.classification_explanation || vd.refutation || vd.claim, data.canonicalUrl)
            : undefined
        };
      }
    },
    'videos': {
      dynamic: (data) => {
        const qRef = `Quran ${data.surah}:${data.ayah}`;
        const vids = Array.isArray(data.videos) ? data.videos : [];
        const count = vids.length;
        const firstClean = cleanVideoTitle(vids[0]?.title);

        let title = `${qRef} Explained: Short Videos & Transcripts`;
        if (count > 0) {
          const c1 = `${qRef} Explained: ${count} Short ${count === 1 ? 'Video' : 'Videos'} & Transcripts`;
          const c2 = `${qRef} Explained: ${count} Short ${count === 1 ? 'Video' : 'Videos'}`;
          title = c1.length <= 60 ? c1 : c2;
        }

        const description = count > 0
          ? clampDescription(`Watch ${count} short ${count === 1 ? 'video' : 'videos'} on ${qRef} with full transcripts and source references.`)
          : `Watch short videos on ${qRef} with full transcripts and primary-source references.`;

        const openingLine = count > 0
          ? `${count} short ${count === 1 ? 'video' : 'videos'} on ${qRef} with transcripts and linked references.`
          : `Short videos and transcripts examining ${qRef}.`;

        return {
          title,
          description,
          keywords: `${qRef} video, surah ${data.surah}:${data.ayah} explained`,
          openingLine
        };
      }
    }
  },
  (data) => {
    const quranTabLabels = {
      'manuscripts': 'Ancient Manuscripts',
      'christian-footnotes': 'Christian Commentary',
      'contradictions': 'Passage Comparisons',
      'scientific-errors': 'Text & Natural World',
      'tafsir': (data.activeCommentary?.name || 'Tafsir Commentary'),
      'debunking-miracles': 'Miracle Claims',
      'videos': 'Short Videos'
    };
    return [
      { name: SITE_NAME, url: `${SITE_ORIGIN}/` },
      { name: "Quran", url: `${SITE_ORIGIN}/quran` },
      { name: `Surah ${data.surah}`, url: `${SITE_ORIGIN}/quran/${data.surah}` },
      { name: `Surah ${data.surah}:${data.ayah}`, url: data.canonicalUrl || `${SITE_ORIGIN}/quran/${data.surah}/${data.ayah}/${data.tab}` },
      { name: quranTabLabels[data.tab] || data.tab, url: data.canonicalUrl }
    ];
  }
);

/**
 * Generates title, description, opening line, and Schema.org graph for Bible Chapter pages
 */
export const generateBibleChapterSEO = ({
  bookName,
  bookId,
  chapter,
  verseCount = 0,
  msVerseCount = 0,
  apVerseCount = 0,
  ctVerseCount = 0,
  earliestMs = null,
  canonicalUrl
}) => {
  const ref = `${bookName} ${chapter}`;
  const c1 = `${ref}: Text, Earliest Manuscripts & Commentary`;
  const c2 = `${ref}: Text, Manuscripts & Commentary`;
  const seoTitle = c1.length <= 60 ? c1 : c2.length <= 60 ? c2 : `${ref}: Text & Commentary`;

  const earliestLabel = earliestMs ? `${conciseMsName(earliestMs)} (${formatMsDateRange(earliestMs)})` : '';
  const seoDescription = clampDescription(
    `Read ${ref} (${verseCount} verses) with ancient manuscript scans${earliestLabel ? ` from ${earliestLabel}` : ''}, Early Church Father commentary (${apVerseCount} verses), and cross-reference answers.`
  );

  const parts = [];
  if (msVerseCount > 0) {
    parts.push(`${msVerseCount} ${msVerseCount === 1 ? 'verse' : 'verses'} with ancient manuscript scans${earliestLabel ? ` (earliest: ${earliestLabel})` : ''}`);
  }
  if (apVerseCount > 0) {
    parts.push(`${apVerseCount} with patristic and modern commentary`);
  }
  if (ctVerseCount > 0) {
    parts.push(`${ctVerseCount} with cross-reference questions answered`);
  }
  const openingLine = parts.length > 0
    ? `${ref} (${verseCount} verses) — ${formatList(parts)}.`
    : `${ref} (${verseCount} verses) with interlinear evidence and commentary.`;

  return {
    seoTitle,
    seoDescription,
    openingLine,
    chapterSchema: generateBibleChapterSchema({ bookName, bookId, chapter, seoDescription, canonicalUrl })
  };
};

/**
 * Generates title, description, opening line, and Schema.org graph for Quran Surah pages
 */
export const generateQuranSurahSEO = ({
  transliteration,
  surahNum,
  revelationType = '',
  totalVerses = 0,
  msVerseCount = 0,
  variantCount = 0,
  canonicalUrl
}) => {
  const ref = `Surah ${transliteration} (${surahNum})`;
  const c1 = `${ref}: English, Arabic, Tafsir & Manuscripts`;
  const c2 = `${ref}: English, Arabic, Tafsir & Variants`;
  const c3 = `${ref}: Arabic, English & Tafsir`;
  const seoTitle = c1.length <= 60 ? c1 : c2.length <= 60 ? c2 : c3;

  const seoDescription = clampDescription(
    `Read ${ref} in English and Arabic (${totalVerses} ${totalVerses === 1 ? 'verse' : 'verses'}) with unabridged Tafsir al-Tabari and Ibn Kathir, early manuscripts (${msVerseCount} ${msVerseCount === 1 ? 'verse' : 'verses'}), and Qira'at variants.`
  );

  const typeLabel = revelationType ? `${revelationType.charAt(0).toUpperCase() + revelationType.slice(1)} ` : '';
  const tail = [
    'English and Arabic text',
    'unabridged Tafsir al-Tabari and Ibn Kathir',
    ...(msVerseCount > 0 ? [`early manuscripts (${msVerseCount} ${msVerseCount === 1 ? 'verse' : 'verses'})`] : []),
    ...(variantCount > 0 ? [`recorded textual variants (${variantCount} ${variantCount === 1 ? 'verse' : 'verses'})`] : [])
  ];
  const openingLine = `${ref} · ${totalVerses} ${typeLabel}${totalVerses === 1 ? 'verse' : 'verses'} with ${formatList(tail)}.`;

  return {
    seoTitle,
    seoDescription,
    openingLine,
    surahSchema: generateQuranSurahSchema({ transliteration, surahNum, seoDescription, canonicalUrl })
  };
};

/**
 * Generates Schema.org graph for Bible Chapter pages
 */
export const generateBibleChapterSchema = ({ bookName, bookId, chapter, seoDescription, canonicalUrl }) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": SITE_NAME, "item": `${SITE_ORIGIN}/` },
        { "@type": "ListItem", "position": 2, "name": "Bible", "item": `${SITE_ORIGIN}/bible/jn/1` },
        { "@type": "ListItem", "position": 3, "name": bookName, "item": `${SITE_ORIGIN}/bible/${bookId}/1` },
        { "@type": "ListItem", "position": 4, "name": `${bookName} ${chapter}`, "item": canonicalUrl }
      ]
    },
    {
      "@type": "ItemPage",
      "@id": canonicalUrl,
      "url": canonicalUrl,
      "name": `${bookName} ${chapter}`,
      "description": seoDescription,
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "name": SITE_NAME,
        "url": `${SITE_ORIGIN}/`
      },
      "publisher": {
        "@type": "Organization",
        "name": SITE_NAME,
        "url": `${SITE_ORIGIN}/`,
        "logo": {
          "@type": "ImageObject",
          "url": DEFAULT_LOGO_URL
        }
      }
    }
  ]
});

/**
 * Generates Schema.org graph for Quran Surah pages
 */
export const generateQuranSurahSchema = ({ transliteration, surahNum, seoDescription, canonicalUrl }) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": SITE_NAME, "item": `${SITE_ORIGIN}/` },
        { "@type": "ListItem", "position": 2, "name": "Quran", "item": `${SITE_ORIGIN}/quran` },
        { "@type": "ListItem", "position": 3, "name": `Surah ${transliteration} (${surahNum})`, "item": canonicalUrl }
      ]
    },
    {
      "@type": "ItemPage",
      "@id": canonicalUrl,
      "url": canonicalUrl,
      "name": `Surah ${transliteration} (${surahNum})`,
      "description": seoDescription,
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "name": SITE_NAME,
        "url": `${SITE_ORIGIN}/`
      },
      "publisher": {
        "@type": "Organization",
        "name": SITE_NAME,
        "url": `${SITE_ORIGIN}/`,
        "logo": {
          "@type": "ImageObject",
          "url": DEFAULT_LOGO_URL
        }
      }
    }
  ]
});

/**
 * Generates Schema.org graph for Discover deep-dive articles
 */
export const generateDiscoverArticleSchema = ({ title, description, url, imageUrl, subcategory, breadcrumbTitle }) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": SITE_NAME, "item": `${SITE_ORIGIN}/` },
        { "@type": "ListItem", "position": 2, "name": "Discover", "item": `${SITE_ORIGIN}/discover` },
        ...(subcategory ? [{ "@type": "ListItem", "position": 3, "name": subcategory, "item": `${SITE_ORIGIN}/discover` }] : []),
        { "@type": "ListItem", "position": subcategory ? 4 : 3, "name": breadcrumbTitle || title, "item": url }
      ]
    },
    {
      "@type": "Article",
      "@id": `${url}#article`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      },
      "headline": title,
      "description": description,
      "image": imageUrl,
      "inLanguage": "en-US",
      "author": {
        "@type": "Organization",
        "name": SITE_NAME,
        "url": `${SITE_ORIGIN}/`
      },
      "publisher": {
        "@type": "Organization",
        "name": SITE_NAME,
        "url": `${SITE_ORIGIN}/`,
        "logo": {
          "@type": "ImageObject",
          "url": DEFAULT_LOGO_URL
        }
      }
    }
  ]
});

/**
 * Article Schema.org JSON-LD Generator
 */
export function generateArticleSchema({
  title,
  description,
  url,
  imageUrl,
  siteName = SITE_NAME,
  logoUrl = DEFAULT_LOGO_URL
}) {
  const absoluteLogo = logoUrl || (url && url.startsWith('http') ? new URL('/assets/logo.png', url).href : DEFAULT_LOGO_URL);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "headline": title,
    "description": description,
    "image": imageUrl,
    "inLanguage": "en-US",
    "author": {
      "@type": "Organization",
      "name": siteName,
      "url": `${SITE_ORIGIN}/`
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "url": `${SITE_ORIGIN}/`,
      "logo": {
        "@type": "ImageObject",
        "url": absoluteLogo
      }
    }
  };
}

