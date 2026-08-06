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
 * while stripping scripts, styles, event handlers, and dangerous URIs.
 */
export const sanitizeAnswerHTML = (str) => {
  if (!str) return "";
  return String(str)
    // Strip scripts, styles, and iframes completely
    .replace(/<(script|style|iframe)[^>]*>[\s\S]*?<\/\1>/gi, '')
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
const safeJsonStringify = (obj) => {
  if (!obj) return undefined;
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
};

/**
 * Generates Google Search FAQPage JSON-LD schema with canonical webpage binding.
 */
const buildFaqSchema = (items, getQuestionText, getAnswerText, canonicalUrl) => {
  if (!Array.isArray(items) || items.length === 0) return undefined;

  const faqs = items
    .map(item => {
      if (!item) return null;
      try {
        const q = sanitizeQuestionText(getQuestionText(item));
        const a = sanitizeAnswerHTML(getAnswerText(item));
        if (!q || !a) return null;
        return {
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a }
        };
      } catch (err) {
        return null;
      }
    })
    .filter(Boolean);

  if (faqs.length === 0) return undefined;

  return safeJsonStringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(canonicalUrl && {
      "@id": `${canonicalUrl}#faqpage`,
      "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl }
    }),
    "mainEntity": faqs
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
 * L6 Higher-Order Resolver Factory: Eliminates duplicated SEO resolution boilerplate.
 */
function createTabSEOResolver(defaultStrategy, tabStrategies) {
  return (data) => {
    const { tab } = data;
    const fallback = defaultStrategy(data);

    if (!tabStrategies[tab]) {
      return {
        seoTitle: fallback.title,
        seoDescription: fallback.description,
        seoKeywords: fallback.keywords,
        seoSchema: undefined
      };
    }

    const config = tabStrategies[tab];
    const dynamicResults = config.dynamic ? config.dynamic(data) : {};

    return {
      seoTitle: dynamicResults.title || config.title || fallback.title,
      seoDescription: dynamicResults.description || config.description || fallback.description,
      seoKeywords: dynamicResults.keywords || config.keywords || fallback.keywords,
      seoSchema: dynamicResults.schema
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
      title: `Evidence: ${verseRef}`,
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
            title: `${verseRef} - Ancient Manuscripts`,
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
          title: `${verseRef} - Ancient Manuscripts`,
          description: `Examine ${data.manuscripts.length} ancient manuscripts containing ${verseRef}, including ${msNames}. View high-definition scans and dating evidence.`,
          keywords: `${verseRef} manuscripts, ancient bible manuscripts, biblical textual criticism`,
          schema: safeJsonStringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            ...(data.canonicalUrl && { "@id": `${data.canonicalUrl}#faqpage`, "mainEntityOfPage": { "@type": "WebPage", "@id": data.canonicalUrl } }),
            "mainEntity": faqs
          })
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
          schema: hasData
            ? buildFaqSchema(data.contradictions, c => c.title, c => c.summary || c.answer, data.canonicalUrl)
            : undefined
        };
      }
    },
    'apologetics': {
      dynamic: (data) => {
        const verseRef = `${data.bookName} ${data.chapter}:${data.verse}`;
        const hasData = Array.isArray(data.apologetics) && data.apologetics.length > 0;
        return {
          title: `${verseRef} - Biblical Apologetics`,
          description: hasData
            ? `Read comprehensive apologetics defenses for ${verseRef}, including: ${sanitizeHTML(data.apologetics[0].title)}.`
            : `Read comprehensive apologetics defenses for ${verseRef} from early church fathers and modern theologians.`,
          keywords: `${verseRef} apologetics, defend the bible verse, patristic commentary`,
          schema: hasData
            ? buildFaqSchema(data.apologetics, a => a.title, a => a.summary || a.answer, data.canonicalUrl)
            : undefined
        };
      }
    },
    'videos': {
      dynamic: (data) => {
        const verseRef = `${data.bookName} ${data.chapter}:${data.verse}`;
        return {
          title: `${verseRef} - Apologetics Videos`,
          description: `Watch shorts and apologetics videos unpacking the meaning, history, and defense of ${verseRef}.`,
          keywords: `${verseRef} video, christian apologetics shorts`
        };
      }
    }
  }
);

/**
 * Quran Verse Tab SEO Resolver (Fixed Quran Property Bugs: vc.description, se.text, vd.refutation)
 */
export const generateQuranTabSEO = createTabSEOResolver(
  (data) => {
    const verseRef = `Surah ${data.surah}:${data.ayah}`;
    return {
      title: `Evidence: ${verseRef}`,
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
            title: `${verseRef} - Ancient Quran Manuscripts`,
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
          title: `${verseRef} - Ancient Quran Manuscripts`,
          description: `Examine ${data.manuscripts.length} ancient Quranic manuscripts mentioning ${verseRef}, including ${msNames}. Discover carbon-dated folios and variant manuscript evidence (Qiraat).`,
          keywords: `${verseRef} manuscripts, carbon dated quran, qiraat variants`,
          schema: safeJsonStringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            ...(data.canonicalUrl && { "@id": `${data.canonicalUrl}#faqpage`, "mainEntityOfPage": { "@type": "WebPage", "@id": data.canonicalUrl } }),
            "mainEntity": faqs
          })
        };
      }
    },
    'christian-footnotes': {
      dynamic: (data) => {
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        return {
          title: `${verseRef} - Christian Commentary`,
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
          title: `${verseRef} - Quranic Contradictions`,
          description: hasData
            ? `Explore verses that contradict ${verseRef} internally within the Quran: ${sanitizeHTML(data.verseContradictions[0].evidence)}.`
            : `Explore verses that contradict ${verseRef} internally within the Quran.`,
          keywords: `${verseRef} contradictions, quran internal contradictions, quran mistakes`,
          schema: hasData
            ? buildFaqSchema(data.verseContradictions, vc => vc.evidence, vc => vc.description || vc.evidence, data.canonicalUrl)
            : undefined
        };
      }
    },
    'scientific-errors': {
      dynamic: (data) => {
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        const hasData = Array.isArray(data.parsedScientificErrors) && data.parsedScientificErrors.length > 0;
        return {
          title: `${verseRef} - Scientific Errors`,
          description: hasData
            ? `Analyze scientific and historical errors found in ${verseRef}, including: ${sanitizeHTML(data.parsedScientificErrors[0].label)}.`
            : `Analyze scientific and historical errors found in ${verseRef}.`,
          keywords: `${verseRef} scientific errors, historical errors in quran`,
          schema: hasData
            ? buildFaqSchema(
                data.parsedScientificErrors,
                se => `What is the scientific error concerning ${verseRef} (${sanitizeQuestionText(se.label)})?`,
                se => se.text || se.label,
                data.canonicalUrl
              )
            : undefined
        };
      }
    },
    'islamic-commentaries': {
      dynamic: (data) => {
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        const hasData = Array.isArray(data.islamicCommentaries) && data.islamicCommentaries.length > 0;
        return {
          title: `${verseRef} - Islamic Commentaries (Tafsir)`,
          description: hasData
            ? `Read authoritative Islamic commentaries for ${verseRef} (including Tafsir Al-Tabari and Tafsir Ibn Kathir) in both un-abridged English translations and the original Arabic text.`
            : `Read authoritative Islamic commentaries for ${verseRef} in both English and Arabic.`,
          keywords: `english tafsir al tabari ${data.surah}:${data.ayah}, arabic tafsir al-tabari ${data.surah}:${data.ayah}, al tabari ${data.surah}:${data.ayah}, english tafsir ibn kathir ${data.surah}:${data.ayah}, arabic tafsir ibn kathir ${data.surah}:${data.ayah}, quran ${verseRef} explanation, islamic exegesis, sahih hadith context`,
          schema: hasData
            ? buildFaqSchema(
                data.islamicCommentaries.flatMap(ic => {
                  const items = [{
                    q: `What does ${ic.title || 'Tafsir'} say about ${verseRef} in English?`,
                    a: ic.commentary
                  }];
                  if (ic.commentary_arabic) {
                    items.push({
                      q: `What does ${ic.title_arabic || ic.title || 'Tafsir'} say about ${verseRef} in the original Arabic?`,
                      a: ic.commentary_arabic
                    });
                  }
                  return items;
                }),
                item => item.q,
                item => item.a,
                data.canonicalUrl
              )
            : undefined
        };
      }
    },
    'debunking-miracles': {
      dynamic: (data) => {
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        const hasData = Array.isArray(data.verseDebunking) && data.verseDebunking.length > 0;
        return {
          title: `${verseRef} - Debunking Claimed Miracles`,
          description: hasData
            ? `Review exegesis exposing linguistic and historical flaws in modern apologist claims regarding miracles in ${verseRef}, including: ${sanitizeHTML(data.verseDebunking[0].miracle_category || "Mathematical/Scientific Claims")}.`
            : `Review exegesis exposing linguistic and historical flaws in modern apologist claims regarding miracles in ${verseRef}.`,
          keywords: `${verseRef} debunked miracles, quran mathematical miracles debunked`,
          schema: hasData
            ? buildFaqSchema(data.verseDebunking, vd => vd.claim, vd => vd.refutation || vd.claim, data.canonicalUrl)
            : undefined
        };
      }
    },
    'videos': {
      dynamic: (data) => {
        const verseRef = `Surah ${data.surah}:${data.ayah}`;
        return {
          title: `${verseRef} - Apologetics Videos`,
          description: `Watch critical apologetics shorts and videos discussing the theology, errors, or historical context of ${verseRef}.`,
          keywords: `${verseRef} apologetics video, christian answering islam videos`
        };
      }
    }
  }
);
