/**
 * A utility class to robustly strip HTML tags from strings.
 */
export const sanitizeHTML = (str) => {
  if (!str) return "";
  return str.replace(/<[^>]*>?/gm, '').replace(/"/g, '&quot;').replace(/\n/g, ' ').trim();
};

/**
 * Safely stringifies JSON to prevent XSS breakout in <script> tags.
 */
const safeJsonStringify = (obj) => {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
};

const buildFaqSchema = (items, getQuestionText, getAnswerText) => {
  if (!items || items.length === 0) return undefined;
  const faqs = items.map(item => ({
    "@type": "Question",
    "name": sanitizeHTML(getQuestionText(item)),
    "acceptedAnswer": { "@type": "Answer", "text": sanitizeHTML(getAnswerText(item)) }
  }));
  return safeJsonStringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqs });
};

const formatList = (items) => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

const buildManuscriptLocationAndDates = (ms, isNT) => {
  let details = [];

  // Bible OT
  if (!isNT) {
    if (ms.language) details.push(`is written in ${ms.language}`);
    if (ms.form && ms.material) details.push(`was crafted as a ${ms.form.toLowerCase()} from ${ms.material.toLowerCase()}`);
    else if (ms.form) details.push(`was crafted as a ${ms.form.toLowerCase()}`);
    else if (ms.material) details.push(`was crafted from ${ms.material.toLowerCase()}`);
  }

  // Quran & Bible Overlap
  if (ms.latest_date) details.push(`dates to roughly AD ${ms.latest_date}`);
  else if (ms.date_range_english) details.push(`dates back to ${ms.date_range_english}`);

  // Quran specfic
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
 * Factory for creating SEO properties for Bible Verse Tabs
 */
export const generateBibleTabSEO = (data) => {
  const { tab, bookName, chapter, verse, isNT } = data;
  const verseRef = `${bookName} ${chapter}:${verse}`;

  const strategy = {
    'manuscripts': {
      title: `${verseRef} - Ancient Manuscripts`,
      keywords: `${verseRef} manuscripts, ancient bible manuscripts, biblical textual criticism`,
      dynamic: (d) => {
        if (!d.manuscripts || d.manuscripts.length === 0) return {};
        const msNames = d.manuscripts.slice(0, 3).map(m => m.name || m.ms_id).join(', ');
        const uniqueMs = getUniqueManuscripts(d.manuscripts);

        const faqs = [];
        faqs.push({
          "@type": "Question",
          "name": `Which ancient manuscripts contain ${verseRef}?`,
          "acceptedAnswer": { "@type": "Answer", "text": sanitizeHTML(`Some of the earliest ancient manuscripts that preserve ${verseRef} include: ${uniqueMs.map(m => m.name || m.ms_id).join(', ')}.`) }
        });

        uniqueMs.slice(0, 4).forEach(ms => {
          const msName = ms.name || ms.ms_id;
          const answerText = `The ${msName} is an ancient manuscript that contains ${verseRef}.${buildManuscriptLocationAndDates(ms, isNT)}`;
          faqs.push({
            "@type": "Question",
            "name": `What is the ${msName} manuscript?`,
            "acceptedAnswer": { "@type": "Answer", "text": sanitizeHTML(answerText) }
          });
        });

        return {
          description: `Examine ${d.manuscripts.length} ancient manuscripts containing ${verseRef}, including ${msNames}. View high-definition scans and dating evidence from the Greek New Testament and the Old Testament.`,
          schema: safeJsonStringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqs })
        };
      }
    },
    'contradictions': {
      title: `${verseRef} - Alleged Contradictions Answered`,
      keywords: `${verseRef} contradictions, bible contradictions answered, patristic harmonization`,
      dynamic: (d) => {
        if (!d.contradictions || d.contradictions.length === 0) {
            return { description: `Explore responses to alleged contradictions involving ${verseRef}. Read solutions from early church fathers and modern theologians reconciling biblical texts.` };
        }
        return {
          description: `Explore responses to alleged contradictions involving ${verseRef}, including: ${sanitizeHTML(d.contradictions[0].title)}. Read solutions from early church fathers and modern theologians reconciling biblical texts.`,
          schema: buildFaqSchema(d.contradictions, c => c.title, c => c.answer)
        };
      }
    },
    'apologetics': {
      title: `${verseRef} - Biblical Apologetics`,
      keywords: `${verseRef} apologetics, defend the bible verse, patristic commentary`,
      dynamic: (d) => {
        if (!d.apologetics || d.apologetics.length === 0) {
            return { description: `Read comprehensive apologetics defenses for ${verseRef}. Discover how early church fathers and modern scholars defend the theology of this scripture.` };
        }
        return {
           description: `Read comprehensive apologetics defenses for ${verseRef}, including: ${sanitizeHTML(d.apologetics[0].title)}. Discover how early church fathers and modern scholars defend the theology of this scripture.`,
           schema: buildFaqSchema(d.apologetics, a => a.title, a => a.answer)
        };
      }
    },
    'videos': {
      title: `${verseRef} - Apologetics Videos`,
      description: `Watch shorts and apologetics videos unpacking the meaning, history, and defense of ${verseRef}.`,
      keywords: `${verseRef} video, christian apologetics shorts`
    }
  };

  const defaultTitle = `Evidence: ${verseRef}`;
  const defaultDesc = `Explore apologetics, alleged contradictions, and ancient manuscript evidence for ${verseRef} in Ready Apologia.`;
  const defaultKeywords = `${verseRef} evidence, christian apologetics`;

  if (!strategy[tab]) {
    return { seoTitle: defaultTitle, seoDescription: defaultDesc, seoKeywords: defaultKeywords, seoSchema: undefined };
  }

  const { title, description, keywords, dynamic } = strategy[tab];
  const dynamicResults = dynamic ? dynamic(data) : {};

  return {
    seoTitle: title || defaultTitle,
    seoDescription: dynamicResults.description || description || defaultDesc,
    seoKeywords: keywords || defaultKeywords,
    seoSchema: dynamicResults.schema
  };
};

/**
 * Factory for creating SEO properties for Quran Verse Tabs
 */
export const generateQuranTabSEO = (data) => {
  const { tab, surah, ayah } = data;
  const verseRef = `Surah ${surah}:${ayah}`;

  const strategy = {
    'manuscripts': {
      title: `${verseRef} - Ancient Quran Manuscripts`,
      keywords: `${verseRef} manuscripts, carbon dated quran, qiraat variants, quran textual corruption`,
      dynamic: (d) => {
        if (!d.manuscripts || d.manuscripts.length === 0) {
            return { description: `Examine the earliest ancient Quranic manuscripts mentioning ${verseRef}. Discover carbon-dated folios and variant manuscript evidence (Qiraat), showing textual errors and variations by the scribes.` };
        }
        const msNames = d.manuscripts.slice(0, 3).map(m => m.name || m.ms_id).join(', ');
        const uniqueMs = getUniqueManuscripts(d.manuscripts);

        const faqs = [];
        faqs.push({
          "@type": "Question",
          "name": `Which ancient manuscripts contain ${verseRef}?`,
          "acceptedAnswer": { "@type": "Answer", "text": sanitizeHTML(`Some of the earliest ancient Quranic manuscripts that preserve ${verseRef} include: ${uniqueMs.map(m => m.name || m.ms_id).join(', ')}.`) }
        });

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
            "acceptedAnswer": { "@type": "Answer", "text": sanitizeHTML(answerText) }
          });
        });

        return {
          description: `Examine ${d.manuscripts.length} ancient Quranic manuscripts mentioning ${verseRef}, including ${msNames}. Discover carbon-dated folios and variant manuscript evidence (Qiraat), showing textual errors and variations by the scribes.`,
          schema: safeJsonStringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqs })
        };
      }
    },
    'christian-footnotes': {
      title: `${verseRef} - Christian Commentary`,
      description: `Read scholarly Christian footnotes and comparative theological commentary on ${verseRef}, highlighting historical context and biblical differences.`,
      keywords: `${verseRef} christian commentary, bible vs quran, biblical response to quran`
    },
    'contradictions': {
      title: `${verseRef} - Quranic Contradictions`,
      keywords: `${verseRef} contradictions, quran internal contradictions, quran mistakes`,
      dynamic: (d) => {
        if (!d.verseContradictions || d.verseContradictions.length === 0) {
            return { description: `Explore verses that contradict ${verseRef} internally within the Quran. Analyze opposing texts and evaluate the consistency of the Quranic narrative.` };
        }
        return {
          description: `Explore verses that contradict ${verseRef} internally within the Quran: ${sanitizeHTML(d.verseContradictions[0].evidence)}. Analyze opposing texts and evaluate the consistency of the Quranic narrative.`,
          schema: buildFaqSchema(d.verseContradictions, vc => vc.evidence, vc => vc.explanation)
        };
      }
    },
    'scientific-errors': {
      title: `${verseRef} - Scientific Errors`,
      keywords: `${verseRef} scientific errors, historical errors in quran, debunking quran miracles`,
      dynamic: (d) => {
        if (!d.parsedScientificErrors || d.parsedScientificErrors.length === 0) {
            return { description: `Analyze scientific and historical errors found in ${verseRef}.` };
        }
        return {
          description: `Analyze scientific and historical errors found in ${verseRef}, including: ${sanitizeHTML(d.parsedScientificErrors[0].label)}.`,
          schema: buildFaqSchema(d.parsedScientificErrors, se => `What is the scientific error concerning ${verseRef} (${sanitizeHTML(se.label)})?`, se => se.content)
        };
      }
    },
    'islamic-commentaries': {
      title: `${verseRef} - Tafsir Ibn Kathir`,
      keywords: `${verseRef} tafsir ibn kathir, islamic commentary, sahih hadith context`,
      dynamic: (d) => {
        if (!d.islamicCommentaries || d.islamicCommentaries.length === 0) {
            return { description: `Read the un-abridged English version of the authoritative Islamic commentary (Tafsir bil-Ma'thur) from Ibn Kathir for ${verseRef}, relying on early Hadith and the statements of the Sahabah.` };
        }
        return {
            description: `Read the un-abridged English version of Ibn Kathir's authoritative Islamic commentary for ${verseRef}: ${sanitizeHTML(d.islamicCommentaries[0].title || "Commentary context")}.`
        };
      }
    },
    'debunking-miracles': {
      title: `${verseRef} - Debunking Claimed Miracles`,
      keywords: `${verseRef} debunked miracles, quran mathematical miracles debunked`,
      dynamic: (d) => {
        if (!d.verseDebunking || d.verseDebunking.length === 0) {
            return { description: `Review exegesis exposing linguistic and historical flaws in modern apologist claims regarding mathematical or scientific miracles in ${verseRef}.` };
        }
        return {
          description: `Review exegesis exposing linguistic and historical flaws in modern apologist claims regarding miracles in ${verseRef}, including: ${sanitizeHTML(d.verseDebunking[0].miracle_category || "Mathematical/Scientific Claims")}.`,
          schema: buildFaqSchema(d.verseDebunking, vd => vd.claim, vd => vd.debunking)
        };
      }
    },
    'videos': {
      title: `${verseRef} - Apologetics Videos`,
      description: `Watch critical apologetics shorts and videos discussing the theology, errors, or historical context of ${verseRef}.`,
      keywords: `${verseRef} apologetics video, christian answering islam videos`
    }
  };

  const defaultTitle = `Evidence: ${verseRef}`;
  const defaultDesc = `Explore evidence and analysis for Quran ${verseRef} in Ready Apologia.`;
  const defaultKeywords = `surah ${surah}:${ayah} evidence, quran analysis`;

  if (!strategy[tab]) {
    return { seoTitle: defaultTitle, seoDescription: defaultDesc, seoKeywords: defaultKeywords, seoSchema: undefined };
  }

  const { title, description, keywords, dynamic } = strategy[tab];
  const dynamicResults = dynamic ? dynamic(data) : {};

  return {
    seoTitle: title || defaultTitle,
    seoDescription: dynamicResults.description || description || defaultDesc,
    seoKeywords: keywords || defaultKeywords,
    seoSchema: dynamicResults.schema
  };
};
