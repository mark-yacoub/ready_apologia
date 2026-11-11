// Academic register and non-polemical tone gate for `/discover/divinity-timeline`.
//
// Enforces:
// 1. Playbook §2.3 banned sensationalist, combative, and reader-guiding phrases.
// 2. Christian Rigour Playbook Rule 1 / Board #5 binding academic attribution rules:
//    - Zero unnamed strawmen ("skeptics claim", "critics argue", "detractors",
//      "modern critics", "popular timelines", "popular summaries", "popular dawah").
//      Counter-positions must name specific scholars, historical schools, or dated
//      primary texts.
//    - Zero first-person apologetic voice ("we", "us", "our", "ours", "ourselves")
//      anywhere in authorial prose, headings, captions, or assessments.
// 3. Pass 3 adversarial register rules (M13): zero rhetorical nudges, intensifying
//    adverbs ("crucially", "notably", "unequivocally", "unselfconsciously"), or
//    self-congratulatory meta-commentary ("rigor/candor/transparency requires",
//    "essential to sound historiography").

export const BANNED = Object.freeze([
  // Unnamed strawmen & polemical framing (Rule 1 / Board #5 / M6)
  /\bskeptics?\b/i,
  /\bskeptical\b/i,
  /\bsceptics?\b/i,
  /\bsceptical\b/i,
  /\bcritics\s+(?:claim|say|argue|allege|assert|object|dismiss|insist|propose|suggest|maintain|contend|deny|attempt|try)\b/i,
  /\b(?:some|many|modern|popular)\s+critics\b/i,
  /\bpopular\s+(?:timelines?|summaries|claims|accounts|views|narratives)\b/i,
  /\boften\s+(?:conflate\w*|allege\w*)\b/i,
  /\broutinely\s+blur\w*\b/i,
  /\bfrequent\s+textual\s+question\b/i,
  /\bdetractors?\b/i,
  /\bapologists?\b/i,
  /\bpolemic\w*\b/i,
  /\bdawah\b/i,

  // Combative, triumphalist, and overclaiming vocabulary
  /\bblunder\w*\b/i,
  /\bdevastating\w*\b/i,
  /\bfraud\w*\b/i,
  /\bhoax\w*\b/i,
  /\bwhitewash\w*\b/i,
  /\bcensorship\b/i,
  /\bsmoking[- ]gun\b/i,
  /\btrap(?:ped|s)?\b/i,
  /\bimpal\w*\b/i,
  /\bdemolish\w*\b/i,
  /\bshatter\w*\b/i,
  /\bcrush(?:es|ed|ing)\b/i,
  /\bdestroys\s+(?:the|their|this|any|every)\b/i,
  /\bcaught\s+red[- ]handed\b/i,
  /\bexcuses?\b/i,
  /\bmyths?\b/i,
  /\bmythical\b/i,
  /\bundeniabl\w*\b/i,
  /\bironclad\b/i,
  /\birrefutabl\w*\b/i,
  /\bunmistakabl\w*\b/i,
  /\bbulletproof\b/i,
  /\bairtight\b/i,
  /\bslam[- ]dunk\b/i,
  /\bcase\s+closed\b/i,
  /\bbeyond\s+(?:a\s+shadow\s+of\s+a\s+|any\s+)?doubt\b/i,
  /\bproves?\s+(?:that|beyond|conclusively|definitively)\b/i,
  /\bproving\s+that\b/i,
  /\bbombshell\b/i,
  /\bshocking\w*\b/i,
  /\bstunning\w*\b/i,
  /\bastonishing\w*\b/i,
  /\bbreathtaking\w*\b/i,
  /\bgame[- ]chang\w*\b/i,
  /\bfatal\s+flaw\b/i,
  /\bnail\s+in\s+the\s+coffin\b/i,
  /\bpropaganda\b/i,
  /\bagenda\b/i,
  /\bdecepti\w*\b/i,

  // Rhetorical nudges, Editorializing Adverbs & Meta-Commentary (M13)
  /\bcrucially\b/i,
  /\bnotably\b/i,
  /\bunselfconsciously\b/i,
  /\bunequivocally\b/i,
  /\bimmovable\b/i,
  /\bwithout\s+hesitation\b/i,
  /\bwithout\s+christian\s+theological\s+coaching\b/i,
  /\bzero\s+trace\s+of\b/i,
  /\bstark\s+ontological\s+terms\b/i,
  /\b(?:rigor|rigour|candor|candour|transparency)\s+requires\b/i,
  /\bessential\s+to\s+sound\s+historiography\b/i,
  /\bfiercely\s+monotheistic\b/i,
  /\bcollapsed\s+philologically\b/i,
  /\bproved\s+aramaic[- ]speaking\b/i,
  /\bcomplete\s+unanimity\b/i,
  /\bevery\s+social\s+class\b/i,
  /\bexternal\s+observers\s+consistently\b/i,
  /\bfar\s+from\s+treating\b/i,

  // Reader-guiding / conversational meta-prose (Rule 2 & Playbook §2.3)
  /\blet['’]s\b/i,
  /\bhere\s+you(?:'ll|’ll|\s+will)\s+see\b/i,
  /\bnotice\s+how\b/i,
  /\bas\s+you\s+read\b/i,
  /\bin\s+this\s+(?:article|section|essay|guide)\b/i,
  /\bthis\s+(?:article|page|section)\s+(?:examines|explores|shows|proves|demonstrates)\b/i,
  /\bas\s+shown\s+below\b/i,
  /\bas\s+noted\s+above\b/i,
]);

// First-person plural pronouns forbidden anywhere in authorial prose (Rule 1).
export const FIRST_PERSON_AUTHORIAL = Object.freeze([
  /\bwe\b/i,
  /\bus\b/i,
  /\bour\b/i,
  /\bours\b/i,
  /\bourselves\b/i,
]);

// Extra headline constraints (eyebrow, H1, H2, card titles, glance titles).
export const HEADLINE_BANNED = Object.freeze([
  /[!?]/,
  /\bdebunk\w*\b/i,
  /\bexpos\w*\b/i,
  /\brefut\w*\b/i,
  /\btruth\s+about\b/i,
]);

function stripMarkdownFormatting(text) {
  return String(text || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '');
}

/**
 * Scan a text string against academic register rules.
 *
 * @param {string} text
 * @param {{ context?: string, isHeadline?: boolean, isVerbatimAncientQuote?: boolean }} [opts]
 * @returns {string[]} Array of violation descriptions (empty when clean).
 */
export function scanTone(text, opts = {}) {
  const {
    context = 'prose',
    isHeadline = false,
    isVerbatimAncientQuote = false,
  } = opts;
  const cleaned = stripMarkdownFormatting(text);
  const issues = [];

  for (const rx of BANNED) {
    const match = cleaned.match(rx);
    if (match) {
      issues.push(
        `[${context}] banned register term "${match[0]}" matching ${rx}`,
      );
    }
  }

  if (!isVerbatimAncientQuote) {
    // Strip short double-quoted ancient citations (e.g., Deuteronomy 6:4 "The
    // Lord our God, the Lord is one") so first-person pronouns inside quoted
    // primary texts do not false-positive, while all unquoted authorial prose
    // remains strictly third-person.
    const authorialVoice = cleaned.replace(/(?:"[^"]*"|“[^”]*”)/g, ' ');
    for (const rx of FIRST_PERSON_AUTHORIAL) {
      const match = authorialVoice.match(rx);
      if (match) {
        issues.push(
          `[${context}] first-person authorial pronoun "${match[0]}" matching ${rx}`,
        );
      }
    }
  }

  if (isHeadline) {
    for (const rx of HEADLINE_BANNED) {
      const match = cleaned.match(rx);
      if (match) {
        issues.push(
          `[${context}] banned headline token "${match[0]}" matching ${rx}`,
        );
      }
    }
  }

  return issues;
}
