/**
 * Our own voice on /discover/muhammad-and-slavery (playbook §2 rule 3, plus the article-specific list in
 * cuj_ia.md §F.4 #7 and WRITER_BRIEF.md). ONE definition shared by the model (copy strings) and
 * scripts/test_muhammad_slavery.mjs (rendered HTML).
 *   BODY      never in our copy (body, labels, headings).
 *   HEADLINE  additionally never in titles, headings, labels or SEO.
 *   ARTICLE   this article's extra list (verdict labels on a sensitive subject), body and headings.
 *   ourVoice  removes quotations (verbatim sources) before a tone check. Only quotations of 12+ characters
 *             are removed: a quoted single word ("myth", “only a myth”) is a scare quote in our voice,
 *             not a source, so it is still checked. Quotations: “curly double”, "straight double",
 *             ‘curly single’ (an apostrophe, ’ followed by a letter, never closes one).
 */
export const BODY = /\b(really|actually|yet|only|even|admit(?:s|ted|ting)?|blunders?|errors|wrong|failed|edited out|blanked out|waived|surviv\w*|guessing|myths?|exposed?|debunk\w*|supposedly|polemic\w*|leap of faith)\b/i;
export const HEADLINE = /\b(contradictions?|conflicting|problematic|under scrutiny|absurd\w*|self-serving|defects?|conceded|misogyn\w*)\b/i;
export const ARTICLE = /\b(chattel|traffick\w*|exploit\w*|extort\w*|sex[- ]slaves?|rap(?:e|ed|ing)|schemes?|criminali[sz]\w*|refut\w*|deconstruct\w*|unsoftened|verdicts?)\b/i;

/** Quotations long enough to be a source (shorter ones stay in our voice). */
export const QUOTE_MIN = 12;

export function ourVoice(s) {
  return String(s ?? '')
    .replace(/\u201c([^\u201d]*)\u201d/g, (m, q) => (q.length >= QUOTE_MIN ? ' ' : q))
    .replace(/"([^"]*)"/g, (m, q) => (q.length >= QUOTE_MIN ? ' ' : q))
    .replace(/\u2018([^\u2018]*?)\u2019(?![\p{L}])/gu, (m, q) => (q.length >= QUOTE_MIN ? ' ' : q));
}

/** First banned hit in a string of our own voice (null when clean). Quotations are removed first. */
export function bannedHit(text, { headline = false } = {}) {
  const s = ourVoice(text);
  const m = s.match(BODY) || s.match(ARTICLE) || (headline ? s.match(HEADLINE) : null);
  return m ? m[0] : null;
}
