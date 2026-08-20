export const SITE_ORIGIN = (typeof process !== 'undefined' && process.env?.SITE_URL) ? process.env.SITE_URL.replace(/\/$/, '') : 'https://readyapologia.com';
export const DEFAULT_LOGO_URL = `${SITE_ORIGIN}/assets/logo.png`;
export const SITE_NAME = 'Ready Apologia';

/**
 * L6 Robust string sanitization for plain-text schema requirements (e.g. FAQ Question.name).
 */
export const sanitizeQuestionText = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
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

export const sanitizeHTML = (str) => sanitizeQuestionText(str);

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


const formatList = (items) => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

const buildManuscriptLocationAndDates = (ms, isNT) => {
  let details = [];
  if (!isNT) {
    if (ms.language) details.push(`is written in ${ms.language}`);
    if (ms.form && ms.material) details.push(`was crafted as a ${ms.form.toLowerCase()} from ${ms.material.toLowerCase()}`);
    else if (ms.form) details.push(`was crafted as a ${ms.form.toLowerCase()}`);
    else if (ms.material) details.push(`was crafted from ${ms.material.toLowerCase()}`);
  }
  if (ms.latest_date) details.push(`dates to roughly AD ${ms.latest_date}`);
  else if (ms.date_range_english) details.push(`dates back to ${ms.date_range_english}`);
  if (ms.script_style) details.push(`features the ${ms.script_style} script style`);

  let text = '';
  if (details.length > 0) text += ` It ${formatList(details)}.`;
  if (ms.found_location) text += ` Originally discovered in ${ms.found_location},`;
  if (ms.current_location) {
    text += ` ${ms.found_location ? 'it' : 'It'} is currently housed at ${ms.current_location}.`;
  } else if (ms.found_location) {
    text += `.`;
  }
  return text;
};

const getUniqueManuscripts = (manuscripts) => Array.from(new Map((manuscripts || []).map(m => [m.ms_id, m])).values());

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
    let resolvedFaqEntity = null;

    if (tabStrategies[tab]) {
      const config = tabStrategies[tab];
      const dynamicResults = config.dynamic ? config.dynamic(data) : {};
      resolvedTitle = dynamicResults.title || config.title || fallback.title;
      resolvedDescription = dynamicResults.description || config.description || fallback.description;
      resolvedKeywords = dynamicResults.keywords || config.keywords || fallback.keywords;
      
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
      seoSchema: finalSchema
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
      title: `${verseRef} - Biblical Evidence & Apologetics`,
      description: `Explore apologetics, alleged contradictions, and ancient manuscript evidence for ${verseRef} in Ready Apologia.`,
      keywords: `${verseRef} evidence, christian apologetics`
    };
  },
  {
    'manuscripts': {
      dynamic: (data) => {
        const verseRef = `${data.bookName} ${data.chapter}:${data.verse}`;
        if (!data.manuscripts || data.manuscripts.length === 0) {
          return {
            title: `${verseRef} - Ancient Manuscripts & Scans`,
            description: `Explore ancient biblical manuscript scans and textual metadata for ${verseRef}.`,
            keywords: `${verseRef} manuscripts, ancient bible manuscripts`
          };
        }
        const msNames = data.manuscripts.slice(0, 3).map(m => m.name || m.ms_id).join(', ');
        const uniqueMs = getUniqueManuscripts(data.manuscripts);
        const faqs = [
          {
            "@type": "Question",
            "name": `Which ancient manuscripts contain ${verseRef}?`,
            "acceptedAnswer": { "@type": "Answer", "text": sanitizeAnswerHTML(`Some of the earliest ancient manuscripts that preserve ${verseRef} include: ${uniqueMs.map(m => m.name || m.ms_id).join(', ')}.`) }
          }
        ];

        uniqueMs.slice(0, 4).forEach(ms => {
          const msName = ms.name || ms.ms_id;
          const answerText = `The ${msName} is an ancient manuscript that contains ${verseRef}.${buildManuscriptLocationAndDates(ms, data.isNT)}`;
          faqs.push({
            "@type": "Question",
            "name": `What is the ${msName} manuscript?`,
            "acceptedAnswer": { "@type": "Answer", "text": sanitizeAnswerHTML(answerText) }
          });
        });

        return {
          title: `${verseRef} - Ancient Manuscripts & Scans`,
          description: `Examine ${data.manuscripts.length} ancient manuscripts containing ${verseRef}, including ${msNames}. View high-definition scans and dating evidence.`,
          keywords: `${verseRef} manuscripts, ancient bible manuscripts, biblical textual criticism`,
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
        const hasData = Array.isArray(data.contradictions) && data.contradictions.length > 0;
        return {
          title: `${verseRef} - Alleged Contradictions Answered`,
          description: hasData
            ? `Explore responses to alleged contradictions involving ${verseRef}, including: ${sanitizeHTML(data.contradictions[0].title)}.`
            : `Explore responses to alleged contradictions involving ${verseRef} from early church fathers and modern scholars.`,
          keywords: `${verseRef} contradictions, bible contradictions answered, patristic harmonization`,
          faqEntity: hasData
            ? buildFaqEntity(data.contradictions, c => c.title, c => c.summary || c.answer, data.canonicalUrl)
            : undefined
        };
      }
    },
    'apologetics': {
      dynamic: (data) => {
        const verseRef = `${data.bookName} ${data.chapter}:${data.verse}`;
        const hasData = Array.isArray(data.apologetics) && data.apologetics.length > 0;
        return {
          title: `${verseRef} - Biblical Apologetics & Defenses`,
          description: hasData
            ? `Read comprehensive apologetics defenses for ${verseRef}, including: ${sanitizeHTML(data.apologetics[0].title)}.`
            : `Read comprehensive apologetics defenses for ${verseRef} from early church fathers and modern theologians.`,
          keywords: `${verseRef} apologetics, defend the bible verse, patristic commentary`,
          faqEntity: hasData
            ? buildFaqEntity(data.apologetics, a => a.title, a => a.summary || a.answer, data.canonicalUrl)
            : undefined
        };
      }
    },
    'videos': {
      dynamic: (data) => {
        const verseRef = `${data.bookName} ${data.chapter}:${data.verse}`;
        return {
          title: `${verseRef} - Apologetics Videos & Shorts`,
          description: `Watch shorts and apologetics videos unpacking the meaning, history, and defense of ${verseRef}.`,
          keywords: `${verseRef} video, christian apologetics shorts`
        };
      }
    }
  },
  (data) => {
    const bibleTabLabels = {
      'manuscripts': 'Ancient Manuscripts',
      'contradictions': 'Alleged Contradictions',
      'apologetics': 'Biblical Apologetics',
      'videos': 'Apologetics Videos'
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
    const verseRef = `Surah ${data.surah}:${data.ayah}`;
    return {
      title: `${verseRef} - Quranic Evidence & Analysis`,
      description: `Explore evidence and analysis for Quran ${verseRef} in Ready Apologia.`,
      keywords: `surah ${data.surah}:${data.ayah} evidence, quran analysis`
    };
  },
  {
    'manuscripts': {
      dynamic: (data) => {
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        if (!data.manuscripts || data.manuscripts.length === 0) {
          return {
            title: `${verseRef} - Ancient Quran Manuscripts & Folios`,
            description: `Examine the earliest ancient Quranic manuscripts mentioning ${verseRef}. Discover carbon-dated folios and variant manuscript evidence (Qiraat).`,
            keywords: `${verseRef} manuscripts, carbon dated quran, qiraat variants`
          };
        }
        const msNames = data.manuscripts.slice(0, 3).map(m => m.name || m.ms_id).join(', ');
        const uniqueMs = getUniqueManuscripts(data.manuscripts);
        const faqs = [
          {
            "@type": "Question",
            "name": `Which ancient manuscripts contain ${verseRef}?`,
            "acceptedAnswer": { "@type": "Answer", "text": sanitizeAnswerHTML(`Some of the earliest ancient Quranic manuscripts that preserve ${verseRef} include: ${uniqueMs.map(m => m.name || m.ms_id).join(', ')}.`) }
          }
        ];

        uniqueMs.slice(0, 4).forEach(ms => {
          const msName = ms.name || ms.ms_id;
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

        return {
          title: `${verseRef} - Ancient Quran Manuscripts & Folios`,
          description: `Examine ${data.manuscripts.length} ancient Quranic manuscripts mentioning ${verseRef}, including ${msNames}. Discover carbon-dated folios and variant manuscript evidence (Qiraat).`,
          keywords: `${verseRef} manuscripts, carbon dated quran, qiraat variants`,
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
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        return {
          title: `${verseRef} - Christian Commentary & Biblical Comparison`,
          description: `Read scholarly Christian footnotes and comparative theological commentary on ${verseRef}, highlighting historical context and biblical differences.`,
          keywords: `${verseRef} christian commentary, bible vs quran`
        };
      }
    },
    'contradictions': {
      dynamic: (data) => {
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        const hasData = Array.isArray(data.verseContradictions) && data.verseContradictions.length > 0;
        return {
          title: `${verseRef} - Quranic Contradictions & Textual Issues`,
          description: hasData
            ? `Explore verses that contradict ${verseRef} internally within the Quran: ${sanitizeHTML(data.verseContradictions[0].evidence)}.`
            : `Explore verses that contradict ${verseRef} internally within the Quran.`,
          keywords: `${verseRef} contradictions, quran internal contradictions, quran mistakes`,
          faqEntity: hasData
            ? buildFaqEntity(data.verseContradictions, vc => vc.evidence, vc => vc.description || vc.evidence, data.canonicalUrl)
            : undefined
        };
      }
    },
    'scientific-errors': {
      dynamic: (data) => {
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        const hasData = Array.isArray(data.parsedScientificErrors) && data.parsedScientificErrors.length > 0;
        return {
          title: `${verseRef} - Scientific & Historical Errors Analyzed`,
          description: hasData
            ? `Analyze scientific and historical errors found in ${verseRef}, including: ${sanitizeHTML(data.parsedScientificErrors[0].label)}.`
            : `Analyze scientific and historical errors found in ${verseRef}.`,
          keywords: `${verseRef} scientific errors, historical errors in quran`,
          faqEntity: hasData
            ? buildFaqEntity(
                data.parsedScientificErrors,
                se => `What is the scientific error concerning ${verseRef} (${sanitizeQuestionText(se.label)})?`,
                se => se.text || se.label,
                data.canonicalUrl
              )
            : undefined
        };
      }
    },
    'tafsir': {
      dynamic: (data) => {
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
          return {
            title: `Tafsir ${cleanName} - ${verseRef} (English & Arabic)`,
            description: `Read ${ac.title || cleanName} for Quran ${verseRef} in both English translation and the original Arabic text (${ac.era || 'Classical Exegesis'}).`,
            keywords: `${cleanName} ${verseRef}, english ${cleanName} ${verseRef}, arabic ${cleanName}, quran ${verseRef} explanation, islamic exegesis`,
            faqEntity: schemaItems.length > 0 
              ? buildFaqEntity(schemaItems, item => item.q, item => item.a, data.canonicalUrl)
              : undefined
          };
        }
        
        return {
          title: `${verseRef} - Classical Islamic Tafsir & Commentary`,
          description: `Read authoritative Islamic commentaries for ${verseRef} in both English and Arabic.`,
          keywords: `english tafsir ${verseRef}, quran ${verseRef} explanation, islamic exegesis, sahih hadith context`,
          faqEntity: undefined
        };
      }
    },
    'debunking-miracles': {
      dynamic: (data) => {
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        const hasData = Array.isArray(data.verseDebunking) && data.verseDebunking.length > 0;
        return {
          title: `${verseRef} - Debunking Claimed Scientific Miracles`,
          description: hasData
            ? `Review exegesis exposing linguistic and historical flaws in modern apologist claims regarding miracles in ${verseRef}, including: ${sanitizeHTML(data.verseDebunking[0].miracle_category || "Mathematical/Scientific Claims")}.`
            : `Review exegesis exposing linguistic and historical flaws in modern apologist claims regarding miracles in ${verseRef}.`,
          keywords: `${verseRef} debunked miracles, quran mathematical miracles debunked`,
          faqEntity: hasData
            ? buildFaqEntity(data.verseDebunking, vd => vd.claim, vd => vd.refutation || vd.claim, data.canonicalUrl)
            : undefined
        };
      }
    },
    'videos': {
      dynamic: (data) => {
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        return {
          title: `${verseRef} - Apologetics Videos & Analysis`,
          description: `Watch critical apologetics shorts and videos discussing the theology, errors, or historical context of ${verseRef}.`,
          keywords: `${verseRef} apologetics video, christian answering islam videos`
        };
      }
    }
  },
  (data) => {
    const quranTabLabels = {
      'manuscripts': 'Ancient Manuscripts',
      'christian-footnotes': 'Christian Commentary',
      'contradictions': 'Quranic Contradictions',
      'scientific-errors': 'Scientific & Historical Errors',
      'tafsir': (data.activeCommentary?.name ? `Tafsir ${data.activeCommentary.name}` : 'Tafsir Commentary'),
      'debunking-miracles': 'Debunked Miracles',
      'videos': 'Apologetics Videos'
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

