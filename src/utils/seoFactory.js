/**
 * A utility class to robustly strip HTML tags from strings.
 * We prefer this over raw regex to ensure we handle edge cases appropriately.
 * While a full AST parser like `sanitize-html` is best, this handles SSG performance cleanly.
 */
export const sanitizeHTML = (str) => {
  if (!str) return "";
  // Strip HTML tags and normalize double quotes safely.
  return str.replace(/<[^>]*>?/gm, '').replace(/"/g, '&quot;').replace(/\n/g, ' ').trim();
};

/**
 * Factory for creating SEO properties for Bible Verse Tabs
 */
export const generateBibleTabSEO = ({ tab, bookName, chapter, verse, manuscripts, contradictions, apologetics }) => {
  let seoTitle = `Evidence: ${bookName} ${chapter}:${verse}`;
  let seoDescription = `Explore apologetics, alleged contradictions, and ancient manuscript evidence for ${bookName} ${chapter}:${verse} in Ready Apologia.`;
  let seoSchema = undefined;

  const seoMaps = {
    'manuscripts': {
      title: `${bookName} ${chapter}:${verse} - Manuscripts & Textual Variants`,
      description: `Explore ancient Greek and Hebrew manuscript evidence, scans, and textual variants for ${bookName} ${chapter}:${verse}.`
    },
    'contradictions': {
      title: `${bookName} ${chapter}:${verse} - Contradictions & Analysis`,
      description: `Answers to alleged contradictions and skeptic claims regarding ${bookName} ${chapter}:${verse}.`
    },
    'apologetics': {
      title: `${bookName} ${chapter}:${verse} - Apologetics & Defenses`,
      description: `Christian apologetic defenses and critical exegesis for ${bookName} ${chapter}:${verse}.`
    }
  };

  if (seoMaps[tab]) {
    seoTitle = seoMaps[tab].title;
    seoDescription = seoMaps[tab].description;
  }

  // Dynamic Data Injections & Schema Generation
  if (tab === 'apologetics' && apologetics && apologetics.length > 0) {
    seoDescription = `Apologetic defenses for ${bookName} ${chapter}:${verse}. Evidence include: ${sanitizeHTML(apologetics[0].title)}.`;
    
    // Rich FAQ Schema for Google Search
    const faqs = apologetics.map(ap => ({
      "@type": "Question",
      "name": sanitizeHTML(ap.title),
      "acceptedAnswer": { "@type": "Answer", "text": sanitizeHTML(ap.answer) }
    }));
    seoSchema = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqs });

  } else if (tab === 'contradictions' && contradictions && contradictions.length > 0) {
    seoDescription = `Answers to alleged contradictions in ${bookName} ${chapter}:${verse}. Evidence include: ${sanitizeHTML(contradictions[0].title)}.`;
    
    // Rich FAQ Schema for Google Search
    const faqs = contradictions.map(ct => ({
      "@type": "Question",
      "name": sanitizeHTML(ct.title),
      "acceptedAnswer": { "@type": "Answer", "text": sanitizeHTML(ct.answer) }
    }));
    seoSchema = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqs });

  } else if (tab === 'manuscripts' && manuscripts && manuscripts.length > 0) {
    const msNames = manuscripts.slice(0, 3).map(m => m.name || m.ms_id).join(', ');
    seoDescription = `Explore ${manuscripts.length} ancient manuscript scans and textual variants for ${bookName} ${chapter}:${verse}, including ${msNames}.`;
  }

  return { seoTitle, seoDescription, seoSchema };
};

/**
 * Factory for creating SEO properties for Quran Verse Tabs
 */
export const generateQuranTabSEO = ({ tab, surah, ayah, manuscripts, verseContradictions, parsedScientificErrors, verseDebunking, islamicCommentaries }) => {
  let seoTitle = `Evidence: Surah ${surah}:${ayah}`;
  let seoDescription = `Explore evidence and analysis for Quran Surah ${surah}:${ayah} in Ready Apologia.`;

  const seoMaps = {
    'manuscripts': {
      title: `Surah ${surah}:${ayah} - Manuscripts & Analysis`,
      description: `Explore ancient manuscript evidence, scans, and textual variants for Quran Surah ${surah}:${ayah}.`
    },
    'christian-footnotes': {
      title: `Surah ${surah}:${ayah} - Christian Footnotes & Analysis`,
      description: `Read Christian apologetics and critical commentaries for Quran Surah ${surah}:${ayah}.`
    },
    'contradictions': {
      title: `Surah ${surah}:${ayah} - Contradictions & Analysis`,
      description: `Analyze internal and external contradictions or scriptural issues within Quran Surah ${surah}:${ayah}.`
    },
    'scientific-errors': {
      title: `Surah ${surah}:${ayah} - Scientific Errors & Analysis`,
      description: `Review critical assessments of scientific errors and claims made in Quran Surah ${surah}:${ayah}.`
    },
    'islamic-commentaries': {
      title: `Surah ${surah}:${ayah} - Islamic Commentaries & Analysis`,
      description: `Read classical Islamic exegesis (Tafsir Ibn Kathir) and context for Quran Surah ${surah}:${ayah}.`
    },
    'debunking-miracles': {
      title: `Surah ${surah}:${ayah} - Debunked Miracles & Analysis`,
      description: `Analyze and debunk claimed scientific or mathematical miracles in Quran Surah ${surah}:${ayah}.`
    }
  };

  if (seoMaps[tab]) {
    seoTitle = seoMaps[tab].title;
    seoDescription = seoMaps[tab].description;
  }

  // Inject critical data dynamically into Descriptions
  if (tab === 'contradictions' && verseContradictions && verseContradictions.length > 0) {
    seoDescription = `Answers to alleged contradictions in Surah ${surah}:${ayah}. Evidence include: ${sanitizeHTML(verseContradictions[0].evidence)}.`;
  } else if (tab === 'scientific-errors' && parsedScientificErrors && parsedScientificErrors.length > 0) {
    seoDescription = `Review and analysis of alleged scientific errors in Surah ${surah}:${ayah}: ${sanitizeHTML(parsedScientificErrors[0].label)}.`;
  } else if (tab === 'debunking-miracles' && verseDebunking && verseDebunking.length > 0) {
    seoDescription = `Analysis and refutation of claimed miracles in Surah ${surah}:${ayah}. Evidence include: ${sanitizeHTML(verseDebunking[0].miracle_category || "Mathematical/Scientific Claims")}.`;
  } else if (tab === 'manuscripts' && manuscripts && manuscripts.length > 0) {
    const msNames = manuscripts.slice(0, 3).map(m => m.name || m.ms_id).join(', ');
    seoDescription = `Explore ${manuscripts.length} ancient manuscript scans and textual variants for Quran Surah ${surah}:${ayah}, including ${msNames}.`;
  } else if (tab === 'islamic-commentaries' && islamicCommentaries && islamicCommentaries.length > 0) {
    seoDescription = `Read Tafsir Ibn Kathir's classical Islamic exegesis for Surah ${surah}:${ayah}: ${sanitizeHTML(islamicCommentaries[0].title || "Commentary context")}.`;
  }

  return { seoTitle, seoDescription };
};
