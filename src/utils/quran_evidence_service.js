import { query } from '../db.js';
import { loadChristianFootnotes } from './christian_footnotes_loader.js';
import { loadQuranContradictions } from './quran_contradictions_loader.js';
import { loadScientificErrors } from './quran_scientific_errors_loader.js';
import { loadIslamicCommentaries } from './islamic_commentaries_loader.js';
import { loadDebunkingMiracles } from './quran_debunking_loader.js';

// Memoized Sets of verse IDs for fast O(1) lookup during SSG build
let memoizedSets = null;

export function getEvidenceSets() {
  if (memoizedSets) return memoizedSets;

  const msQuranSet = new Set(
    query("SELECT DISTINCT verse_id FROM manuscript_per_verse_quran").map(r => r.verse_id)
  );
  const footnotesSet = new Set(Object.keys(loadChristianFootnotes()));
  const contradictionsSet = new Set(Object.keys(loadQuranContradictions()));
  const scientificErrorsSet = new Set(Object.keys(loadScientificErrors()));
  const islamicCommentariesSet = new Set(Object.keys(loadIslamicCommentaries()));
  const debunkingSet = new Set(Object.keys(loadDebunkingMiracles()));

  memoizedSets = {
    msQuranSet,
    footnotesSet,
    contradictionsSet,
    scientificErrorsSet,
    islamicCommentariesSet,
    debunkingSet
  };
  return memoizedSets;
}

export function getAllEvidenceVerseIds() {
  const sets = getEvidenceSets();
  const allIds = new Set([
    ...sets.msQuranSet,
    ...sets.footnotesSet,
    ...sets.contradictionsSet,
    ...sets.scientificErrorsSet,
    ...sets.islamicCommentariesSet,
    ...sets.debunkingSet
  ].filter(Boolean));
  return allIds;
}

export function getEvidenceFlagsForVerse(verseId) {
  const sets = getEvidenceSets();
  return {
    hasManuscript: sets.msQuranSet.has(verseId),
    hasChristianFootnotes: sets.footnotesSet.has(verseId),
    hasContradictions: sets.contradictionsSet.has(verseId),
    hasScientificErrors: sets.scientificErrorsSet.has(verseId),
    hasIslamicCommentary: sets.islamicCommentariesSet.has(verseId),
    hasDebunkingMiracles: sets.debunkingSet.has(verseId),
    hasEvidence: sets.msQuranSet.has(verseId) ||
                 sets.footnotesSet.has(verseId) ||
                 sets.contradictionsSet.has(verseId) ||
                 sets.scientificErrorsSet.has(verseId) ||
                 sets.islamicCommentariesSet.has(verseId) ||
                 sets.debunkingSet.has(verseId)
  };
}

export function getAvailableTabsForVerse(verseId) {
  const flags = getEvidenceFlagsForVerse(verseId);
  return [
    flags.hasDebunkingMiracles ? 'debunking-miracles' : null,
    flags.hasScientificErrors ? 'scientific-errors' : null,
    flags.hasContradictions ? 'contradictions' : null,
    flags.hasChristianFootnotes ? 'christian-footnotes' : null,
    flags.hasIslamicCommentary ? 'islamic-commentaries' : null,
    flags.hasManuscript ? 'manuscripts' : null,
  ].filter(Boolean);
}

export function getEvidenceSetsForSurahPrefix(surahNum) {
  const sets = getEvidenceSets();
  const prefix = `${surahNum}:`;
  const filterPrefix = (set) => new Set(Array.from(set).filter(k => k.startsWith(prefix)));

  return {
    msQuranSet: filterPrefix(sets.msQuranSet),
    christianFootnotesSet: filterPrefix(sets.footnotesSet),
    quranContradictionsSet: filterPrefix(sets.contradictionsSet),
    scientificErrorsSet: filterPrefix(sets.scientificErrorsSet),
    islamicCommentariesSet: filterPrefix(sets.islamicCommentariesSet),
    debunkingMiraclesSet: filterPrefix(sets.debunkingSet)
  };
}
