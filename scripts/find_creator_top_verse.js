import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import fs from 'node:fs';

const dbPath = join(process.cwd(), 'data.db');
const db = new DatabaseSync(dbPath);

// Tiers from src/utils/video_service.js
const TIER_1 = new Set(['copticorthodoxanswers']);
const TIER_2 = new Set(['inspiringphilosophy', 'capturingchristianity', 'testifyapologetics']);
const TIER_3 = new Set(['davidwood', 'cirainternational', 'crossexamined', 'redpenlogic', 'givemeananswer', 'mikewinger', 'livingwaters']);
const TIER_4 = new Set(['shamounian', 'towardsjesus', '@towardsjesus', 'godlogic', 'godlogic2.0', '@godlogicapologetics']);
const TIER_5 = new Set(['apologiastudios', 'vocabmalone']);

const JESUS_TOPICS_REGEX = /\b(trinity|deity|resurrection|jewish|jehovah|son of god|hebrew israelites?|mormons?)\b/i;
const ISLAM_TOPICS_REGEX = /\b(islam|muslim|quran|muhammad|allah|hadith|sura)\b/i;

function getTopicScore(summary) {
  if (!summary) return 2;
  if (ISLAM_TOPICS_REGEX.test(summary)) return 3;
  if (JESUS_TOPICS_REGEX.test(summary)) return 1;
  return 2;
}

function getTierScore(channelId, apologistName) {
  if (!channelId && !apologistName) return 6;
  const cId = channelId ? channelId.toLowerCase() : '';
  const aName = apologistName ? apologistName.toLowerCase() : '';
  if (TIER_1.has(cId) || TIER_1.has(aName)) return 1;
  if (TIER_2.has(cId) || TIER_2.has(aName)) return 2;
  if (TIER_3.has(cId) || TIER_3.has(aName)) return 3;
  if (TIER_4.has(cId) || TIER_4.has(aName)) return 4;
  if (TIER_5.has(cId) || TIER_5.has(aName)) return 5;
  return 6;
}

function sortVideos(videos) {
  return videos.sort((a, b) => {
    const rigorA = a.rigor_score || 0;
    const rigorB = b.rigor_score || 0;
    if (rigorA !== rigorB) return rigorB - rigorA;

    const versesA = a.versesCount || 0;
    const versesB = b.versesCount || 0;
    if (versesA !== versesB) return versesA - versesB;

    const tierA = getTierScore(a.channel_id, a.apologist_name);
    const tierB = getTierScore(b.channel_id, b.apologist_name);
    if (tierA !== tierB) return tierA - tierB;

    const topicA = getTopicScore(a.summary);
    const topicB = getTopicScore(b.summary);
    if (topicA !== topicB) return topicA - topicB;

    const titleA = a.title || '';
    const titleB = b.title || '';
    return titleA.localeCompare(titleB);
  });
}

function formatBookName(bookId) {
  const map = {
    'gn': 'Genesis', 'gen': 'Genesis', 'ex': 'Exodus', 'exo': 'Exodus', 'lv': 'Leviticus', 'nu': 'Numbers', 'dt': 'Deuteronomy',
    'js': 'Joshua', 'jg': 'Judges', 'rt': 'Ruth', '1sa': '1 Samuel', '2sa': '2 Samuel',
    '1ki': '1 Kings', '2ki': '2 Kings', '1ch': '1 Chronicles', '2ch': '2 Chronicles',
    'ez': 'Ezra', 'ne': 'Nehemiah', 'es': 'Esther', 'jb': 'Job', 'ps': 'Psalms', 'psa': 'Psalms',
    'pr': 'Proverbs', 'pro': 'Proverbs', 'ec': 'Ecclesiastes', 'ca': 'Song of Solomon', 'is': 'Isaiah', 'isa': 'Isaiah',
    'jr': 'Jeremiah', 'jer': 'Jeremiah', 'lm': 'Lamentations', 'eze': 'Ezekiel', 'dn': 'Daniel', 'dan': 'Daniel',
    'ho': 'Hosea', 'jl': 'Joel', 'am': 'Amos', 'ob': 'Obadiah', 'jn_ot': 'Jonah', 'jon': 'Jonah',
    'mi': 'Micah', 'na': 'Nahum', 'hk': 'Habakkuk', 'zp': 'Zephaniah', 'hg': 'Haggai',
    'zc': 'Zechariah', 'ml': 'Malachi',
    'mt': 'Matthew', 'mat': 'Matthew', 'mk': 'Mark', 'mar': 'Mark', 'lk': 'Luke', 'luk': 'Luke', 'jn': 'John', 'joh': 'John', 'ac': 'Acts', 'act': 'Acts',
    'rom': 'Romans', '1co': '1 Corinthians', '2co': '2 Corinthians', 'ga': 'Galatians',
    'eph': 'Ephesians', 'php': 'Philippians', 'col': 'Colossians', '1th': '1 Thessalonians',
    '2th': '2 Thessalonians', '1ti': '1 Timothy', '2ti': '2 Timothy', 'tit': 'Titus',
    'phm': 'Philemon', 'heb': 'Hebrews', 'jm': 'James', 'jas': 'James', '1pe': '1 Peter', '2pe': '2 Peter',
    '1jn': '1 John', '2jn': '2 John', '3jn': '3 John', 'jd': 'Jude', 're': 'Revelation', 'rev': 'Revelation'
  };
  return map[bookId.toLowerCase()] || bookId.toUpperCase();
}

const targetCreator = process.argv[2] ? process.argv[2].toLowerCase() : '';

// 1. Get all videos
const allVideos = db.prepare('SELECT * FROM shorts_metadata').all();
const videoMap = new Map();
allVideos.forEach(v => {
  v.versesCount = v.verses ? v.verses.split(',').length : 0;
  videoMap.set(v.video_id, v);
});

// 2. Get all short_per_verse mappings for Bible verses (three parts: book_chap_verse)
const mappings = db.prepare('SELECT verse_id, video_id FROM short_per_verse').all();
const verseVideosMap = new Map();

mappings.forEach(row => {
  if (!row.verse_id || row.verse_id.split('_').length !== 3) return;
  if (!verseVideosMap.has(row.verse_id)) {
    verseVideosMap.set(row.verse_id, []);
  }
  const vid = videoMap.get(row.video_id);
  if (vid) {
    verseVideosMap.get(row.verse_id).push(vid);
  }
});

// 3. For each verse, sort videos and check who is at index 0
const winningVerses = [];
for (const [verseId, videos] of verseVideosMap.entries()) {
  const sorted = sortVideos([...videos]);
  const topVideo = sorted[0];
  if (!topVideo) continue;

  const apName = (topVideo.apologist_name || '').toLowerCase();
  const chId = (topVideo.channel_id || '').toLowerCase();

  const isMatch = !targetCreator || apName.includes(targetCreator) || chId.includes(targetCreator);
  if (isMatch) {
    const parts = verseId.split('_');
    const bookName = formatBookName(parts[0]);
    winningVerses.push({
      verseId,
      bookId: parts[0],
      chapter: parts[1],
      verse: parts[2],
      displayVerse: `${bookName} ${parts[1]}:${parts[2]}`,
      urlPath: `/bible/${parts[0]}/${parts[1]}/${parts[2]}/videos`,
      fullUrl: `https://readyapologia.com/bible/${parts[0]}/${parts[1]}/${parts[2]}/videos`,
      topVideoId: topVideo.video_id,
      topVideoTitle: topVideo.title,
      topVideoRigor: topVideo.rigor_score,
      topVideoApologist: topVideo.apologist_name,
      topVideoChannel: topVideo.channel_id,
      totalVideosInVerse: sorted.length
    });
  }
}

// 4. Sort winning verses by most impressive (highest rigor score, then highest total videos in verse so they beat competition!)
winningVerses.sort((a, b) => {
  if (b.topVideoRigor !== a.topVideoRigor) return b.topVideoRigor - a.topVideoRigor;
  return b.totalVideosInVerse - a.totalVideosInVerse;
});

if (targetCreator) {
  if (winningVerses.length > 0) {
    console.log(JSON.stringify(winningVerses[0], null, 2));
  } else {
    console.log(JSON.stringify({ error: `No top-ranked Bible verse found for ${targetCreator}` }, null, 2));
  }
} else {
  // If no target provided, print summary of top winners per creator
  console.log(`Found ${winningVerses.length} total winning verse instances.`);
}
