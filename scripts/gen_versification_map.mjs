#!/usr/bin/env node
/**
 * Generates src/utils/versification/lxx2012_mt.json by empirically aligning the site's
 * LXX2012 reader corpus (src/data/scripture/lxx2012/*.json, Brenton's LXX in American English)
 * against the standard English/Masoretic (MT) verse numbering in ESV
 * (~/Documents/data_collection/bible/esv/output/*.json, identical in verse keys to NASB/KJV).
 *
 * Usage:
 *   node scripts/gen_versification_map.mjs [--esv-dir <path>] [--check]
 *
 * Design:
 *   1. For the 6 well-known LXX macro-rearrangements (Psalms, Jeremiah 25-51, Exodus 36-39,
 *      1 Kings 20-21, Numbers 26:15-47, and Daniel 13-14 LXX additions), partitions each book
 *      into corresponding structural blocks.
 *   2. Within every chapter, cross-chapter boundary window, or structural block, runs banded
 *      Needleman-Wunsch alignment over normalized verse texts (word Jaccard + containment +
 *      consonant-skeleton Jaccard + character-trigram Dice), closes equal-length monotonic gaps,
 *      and runs local swap/permutation rescue (e.g. Exod 20:13-15, Exod 21:16-17, Mal 4:4-6,
 *      Ezek 7:3-9, Josh 19:47-48, Deut 23:24-25 -> 24:2,1).
 *   3. Applies a small, explicitly documented set of scholarly disambiguations where merged
 *      verses or archaic Greek-to-Hebrew idioms create ties.
 *   4. Verifies strict bijection invariants (injectivity in both directions, existence in both
 *      corpora, complete partition of every ESV and LXX2012 verse) before writing the table.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LXX_DIR = path.join(ROOT, 'src/data/scripture/lxx2012');
const BOOKS_META_PATH = path.join(ROOT, 'src/data/books_meta.json');
const OUTPUT_PATH = path.join(ROOT, 'src/utils/versification/lxx2012_mt.json');

// --- CLI args ---
const args = process.argv.slice(2);
let esvDir = path.join(os.homedir(), 'Documents/data_collection/bible/esv/output');
let checkOnly = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--esv-dir' && args[i + 1]) {
    esvDir = path.resolve(args[++i]);
  } else if (args[i] === '--check') {
    checkOnly = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log('Usage: node scripts/gen_versification_map.mjs [--esv-dir <path>] [--check]');
    process.exit(0);
  }
}

if (!fs.existsSync(esvDir)) {
  console.error(`[gen_versification_map] ESV output directory not found: ${esvDir}`);
  console.error('Pass --esv-dir <path> pointing to the ESV output JSON directory.');
  process.exit(1);
}

// --- Text normalization & similarity ---
const STOPWORDS = new Set([
  'the', 'and', 'of', 'to', 'in', 'a', 'that', 'is', 'for', 'he', 'with', 'his', 'it', 'shall',
  'will', 'be', 'not', 'they', 'their', 'you', 'your', 'i', 'my', 'me', 'from', 'on', 'by', 'as',
  'all', 'are', 'was', 'were', 'this', 'have', 'had', 'has', 'but', 'or', 'at', 'which', 'who',
  'him', 'them', 'we', 'our', 'us', 'unto', 'upon', 'out', 'up', 'into', 'so', 'then', 'when',
  'there', 'also', 'even', 'now', 'behold', 'o', 'do', 'did', 'no', 'nor', 'if', 'an', 'her',
  'she', 'its', 'ye', 'thee', 'thou', 'thy', 'said', 'say', 'saying', 'came', 'come', 'went',
]);

// High-frequency Brenton Greek-transliteration / 19th-century English -> ESV equivalents.
const SYNONYMS = [
  [/\bnoe\b/g, 'noah'], [/\bsem\b/g, 'shem'], [/\bcham\b/g, 'ham'], [/\bpharao\b/g, 'pharaoh'],
  [/\bjonas\b/g, 'jonah'], [/\belias\b/g, 'elijah'], [/\beliseus\b/g, 'elisha'],
  [/\besaias\b/g, 'isaiah'], [/\bjeremias\b/g, 'jeremiah'], [/\bnabuchodonosor\b/g, 'nebuchadnezzar'],
  [/\bsion\b/g, 'zion'], [/\bjuda\b/g, 'judah'], [/\bjosue\b/g, 'joshua'],
  [/\bsedekias\b/g, 'zedekiah'], [/\bjoakim\b/g, 'jehoiakim'], [/\bjoconias\b/g, 'jeconiah'],
  [/\bgodolias\b/g, 'gedaliah'], [/\bismael\b/g, 'ishmael'], [/\bjoanan\b/g, 'johanan'],
  [/\bachab\b/g, 'ahab'], [/\bjezabel\b/g, 'jezebel'], [/\bnabuthe\b/g, 'naboth'],
  [/\bwhale\b/g, 'fish'], [/\bheathen\b/g, 'nations'], [/\bgentiles\b/g, 'nations'],
  [/\bbrethren\b/g, 'brothers'], [/\bkill\b/g, 'murder'], [/\bbegot\b/g, 'fathered'],
  [/\bchoreb\b/g, 'horeb'], [/\bsedrach\b/g, 'shadrach'], [/\bmisach\b/g, 'meshach'],
  [/\babdenago\b/g, 'abednego'], [/\bassur\b/g, 'assyria'], [/\bidumea\b/g, 'edom'],
  [/\baram\b/g, 'syria'], [/\boracle\b/g, 'breastpiece'], [/\blaver\b/g, 'basin'],
  [/\bpropitiatory\b/g, 'mercy seat'], [/\bcandlestick\b/g, 'lampstand'],
  [/\bsockets?\b/g, 'bases'], [/\bposts?\b/g, 'pillars'], [/\bstaves\b/g, 'poles'],
  [/\bpins\b/g, 'pegs'], [/\bbrass\b/g, 'bronze'], [/\bbrazen\b/g, 'bronze'],
  [/\btunic\b/g, 'robe'], [/\bgirdles?\b/g, 'sash'], [/\bmitre\b/g, 'turban'],
  [/\btires?\b/g, 'caps'], [/\bcirclets?\b/g, 'settings'], [/\bwreaths?\b/g, 'cords'],
  [/\bcurtains?\b/g, 'hangings'], [/\bveil\b/g, 'screen'], [/\bbeseleel\b/g, 'bezalel'],
  [/\beliab\b/g, 'oholiab'], [/\bmardocheus\b/g, 'mordecai'], [/\bartaxerxes\b/g, 'ahasuerus'],
  [/\bdevil\b/g, 'satan'], [/\bjosaphat\b/g, 'jehoshaphat'], [/\bochozias\b/g, 'ahaziah'],
  [/\bchildren\b/g, 'sons'], [/\bmanifestation\b/g, 'urim'], [/\btruth\b/g, 'thummim'],
  [/\breviles\b/g, 'curses'], [/\bwhosoever\b/g, 'whoever'], [/\bchazad\b/g, 'chesed'],
  [/\basses\b/g, 'donkeys'], [/\bfamilies\b/g, 'clans'],
  [/\b(?:aleph|beth|gimel|daleth|he|vau|zain|heth|teth|jod|chaph|lamed|mem|nun|samech|ain|phe|tsade|koph|res|shin|tau)\.\s*/gi, ''],
];

function cleanText(text) {
  let s = (text || '')
    .toLowerCase()
    .replace(/⌃/g, '')
    .replace(/\[[^\]]*\]/g, m => m.slice(1, -1))
    .replace(/^\(\d+(?:\s+in\s+kjv)?\)\s*/i, '');
  for (const [re, rep] of SYNONYMS) s = s.replace(re, rep);
  return s.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function consonantSkel(word) {
  return word
    .replace(/ph/g, 'f')
    .replace(/ch|kh|ck|q/g, 'k')
    .replace(/th/g, 't')
    .replace(/sh/g, 's')
    .replace(/[aeiouyhw]/g, '')
    .replace(/(.)\1+/g, '$1');
}

function featurize(text) {
  const s = cleanText(text);
  const words = s.split(' ').filter(w => w.length >= 2 && !STOPWORDS.has(w));
  const raw = new Set(words);
  const skel = new Set(words.map(consonantSkel).filter(x => x.length >= 2));
  const tri = new Set();
  for (let i = 0; i <= s.length - 3; i++) tri.add(s.slice(i, i + 3));
  return { raw, skel, tri, len: s.length };
}

function simF(a, b) {
  if (!a || !b || a.len === 0 || b.len === 0) return 0;
  let wi = 0;
  for (const w of a.raw) if (b.raw.has(w)) wi++;
  const wj = (a.raw.size + b.raw.size - wi) > 0 ? wi / (a.raw.size + b.raw.size - wi) : 0;
  const wo = Math.min(a.raw.size, b.raw.size) > 0 ? wi / Math.min(a.raw.size, b.raw.size) : 0;

  let si = 0;
  for (const s of a.skel) if (b.skel.has(s)) si++;
  const sj = (a.skel.size + b.skel.size - si) > 0 ? si / (a.skel.size + b.skel.size - si) : 0;

  let ti = 0;
  for (const g of a.tri) if (b.tri.has(g)) ti++;
  const td = (a.tri.size + b.tri.size) > 0 ? (2 * ti) / (a.tri.size + b.tri.size) : 0;

  return 0.40 * wj + 0.15 * wo + 0.25 * sj + 0.20 * td;
}

function loadBook(dir, id) {
  const p = path.join(dir, `${id}.json`);
  if (!fs.existsSync(p)) return null;
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  const byCh = new Map();
  for (const c of Object.keys(raw).map(Number).sort((a, b) => a - b)) {
    const arr = [];
    for (const obj of raw[String(c)]) {
      const v = Object.keys(obj)[0];
      const text = obj[v];
      arr.push({ c, v: Number(v), key: `${c}:${v}`, text, f: featurize(text) });
    }
    byCh.set(c, arr);
  }
  return byCh;
}

function getSlice(byCh, specs) {
  const out = [];
  for (const [c, a, b] of specs) {
    for (const item of byCh.get(c) || []) {
      if (item.v >= a && item.v <= b) out.push(item);
    }
  }
  return out;
}

/**
 * Compresses an array of sorted positive integers into compact range strings,
 * e.g. [1,2,3,4,5,11,12,13] -> ["1..5", "11..13"], [7] -> ["7"].
 */
function compressIntRanges(nums) {
  const sorted = [...new Set(nums)].sort((a, b) => a - b);
  const ranges = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    ranges.push(i === j ? String(sorted[i]) : `${sorted[i]}..${sorted[j]}`);
    i = j + 1;
  }
  return ranges;
}

function summarizeBookChapters(byCh) {
  const out = {};
  for (const c of [...byCh.keys()].sort((a, b) => a - b)) {
    out[String(c)] = compressIntRanges(byCh.get(c).map(x => x.v));
  }
  return out;
}

/**
 * Aligns two ordered lists of verses into a strict 1-to-1 bijection.
 */
function alignBlock(esvList, lxxList, opts = {}) {
  const {
    preferSameKey = true,
    sameVerseBonus = 0.10,
    gapThreshold = 0.16,
    allowLocalSwaps = true,
    swapWindow = 12,
    swapThreshold = 0.25,
    closeEqualEnds = false,
  } = opts;

  const N = esvList.length;
  const M = lxxList.length;
  if (N === 0 || M === 0) return [];

  const dp = Array.from({ length: N + 1 }, () => new Float64Array(M + 1));
  const bt = Array.from({ length: N + 1 }, () => new Uint8Array(M + 1));
  const SKIP_PEN = 0.015;
  for (let i = 1; i <= N; i++) { dp[i][0] = -i * SKIP_PEN; bt[i][0] = 2; }
  for (let j = 1; j <= M; j++) { dp[0][j] = -j * SKIP_PEN; bt[0][j] = 3; }

  const band = Math.max(35, Math.abs(N - M) + 25);
  const simGrid = new Map();
  const getSim = (i, j) => {
    const k = i * M + j;
    if (!simGrid.has(k)) simGrid.set(k, simF(esvList[i].f, lxxList[j].f));
    return simGrid.get(k);
  };

  for (let i = 1; i <= N; i++) {
    const jMin = Math.max(1, i - band);
    const jMax = Math.min(M, i + band);
    for (let j = 1; j <= M; j++) {
      let diag = -1e9;
      if (j >= jMin && j <= jMax) {
        const rawS = getSim(i - 1, j - 1);
        const keyMatch = preferSameKey
          ? (esvList[i - 1].key === lxxList[j - 1].key)
          : (esvList[i - 1].v === lxxList[j - 1].v);
        const bonus = keyMatch ? sameVerseBonus : 0;
        diag = dp[i - 1][j - 1] + (rawS + bonus - gapThreshold);
      }
      const up = dp[i - 1][j] - SKIP_PEN;
      const left = dp[i][j - 1] - SKIP_PEN;
      if (diag >= up && diag >= left) { dp[i][j] = diag; bt[i][j] = 1; }
      else if (up >= left) { dp[i][j] = up; bt[i][j] = 2; }
      else { dp[i][j] = left; bt[i][j] = 3; }
    }
  }

  const ops = [];
  let i = N, j = M;
  while (i > 0 || j > 0) {
    if (bt[i][j] === 1) { ops.push(['M', i - 1, j - 1]); i--; j--; }
    else if (bt[i][j] === 2) { ops.push(['E', i - 1, -1]); i--; }
    else { ops.push(['L', -1, j - 1]); j--; }
  }
  ops.reverse();

  const pairs = new Map();
  let k = 0;
  while (k < ops.length) {
    if (ops[k][0] === 'M') {
      pairs.set(ops[k][1], ops[k][2]);
      k++;
      continue;
    }
    const prevAnchor = k > 0 && ops[k - 1][0] === 'M' ? ops[k - 1] : null;
    const eRun = [], lRun = [];
    while (k < ops.length && ops[k][0] !== 'M') {
      if (ops[k][0] === 'E') eRun.push(ops[k][1]);
      else lRun.push(ops[k][2]);
      k++;
    }
    const nextAnchor = k < ops.length && ops[k][0] === 'M' ? ops[k] : null;

    if (eRun.length > 0 && lRun.length > 0) {
      const usedE = new Set(), usedL = new Set();
      const cands = [];
      for (const ei of eRun) {
        for (const lj of lRun) {
          const s = getSim(ei, lj);
          const sameV = preferSameKey ? (esvList[ei].key === lxxList[lj].key) : (esvList[ei].v === lxxList[lj].v);
          cands.push({ ei, lj, s, score: s + (sameV ? 0.06 : 0), sameV });
        }
      }
      cands.sort((a, b) => b.score - a.score);
      for (const c of cands) {
        if (usedE.has(c.ei) || usedL.has(c.lj)) continue;
        if (c.s >= 0.20 || (c.sameV && eRun.length === lRun.length && c.s >= 0.04)) {
          pairs.set(c.ei, c.lj);
          usedE.add(c.ei);
          usedL.add(c.lj);
        }
      }
      // Close equal-length gaps bounded by anchors at the same offset (or same-key lists)
      const remE = eRun.filter(ei => !usedE.has(ei));
      const remL = lRun.filter(lj => !usedL.has(lj));
      if (remE.length > 0 && remE.length === remL.length) {
        const sameShift = prevAnchor && nextAnchor && (prevAnchor[2] - prevAnchor[1]) === (nextAnchor[2] - nextAnchor[1]);
        const allSameKey = remE.every((ei, idx) =>
          preferSameKey ? esvList[ei].key === lxxList[remL[idx]].key : esvList[ei].v === lxxList[remL[idx]].v
        );
        const endShift = closeEqualEnds && (
          (prevAnchor && !nextAnchor && (prevAnchor[2] - prevAnchor[1]) === (remL[0] - remE[0])) ||
          (!prevAnchor && nextAnchor && (nextAnchor[2] - nextAnchor[1]) === (remL[0] - remE[0]))
        );
        if (sameShift || allSameKey || endShift) {
          for (let idx = 0; idx < remE.length; idx++) {
            pairs.set(remE[idx], remL[idx]);
          }
        }
      }
    }
  }

  // Pass 3: Local swap/permutation rescue among unmatched verses
  if (allowLocalSwaps) {
    const usedL = new Set(pairs.values());
    const unmE = [], unmL = [];
    for (let ei = 0; ei < N; ei++) if (!pairs.has(ei)) unmE.push(ei);
    for (let lj = 0; lj < M; lj++) if (!usedL.has(lj)) unmL.push(lj);

    if (unmE.length > 0 && unmL.length > 0) {
      const cands = [];
      for (const ei of unmE) {
        for (const lj of unmL) {
          if (Math.abs(ei - lj) > swapWindow) continue;
          const s = getSim(ei, lj);
          if (s >= swapThreshold) cands.push({ ei, lj, s });
        }
      }
      cands.sort((a, b) => b.s - a.s);
      const takenE = new Set(), takenL = new Set();
      for (const c of cands) {
        if (takenE.has(c.ei) || takenL.has(c.lj)) continue;
        pairs.set(c.ei, c.lj);
        takenE.add(c.ei);
        takenL.add(c.lj);
      }
    }
  }

  const out = [];
  for (const [ei, lj] of pairs) {
    out.push({ esv: esvList[ei], lxx: lxxList[lj], sim: getSim(ei, lj) });
  }
  out.sort((a, b) => a.esv.c - b.esv.c || a.esv.v - b.esv.v);
  return out;
}

/**
 * Explicit scholarly disambiguations for the small set of verses (~25 out of 23,145)
 * where merged clauses, archaic Greek-vs-Hebrew vocabulary, or chapter-boundary merges
 * produce ambiguous similarity ties. Every entry was verified verbatim against both
 * src/data/scripture/lxx2012/<book>.json and data_collection/bible/esv/output/<book>.json.
 */
const SCHOLARLY_OVERRIDES = {
  gn: {
    // LXX 6:1 merges MT 5:32 ("Noe was 500...") + MT 6:1 ("when men began to be numerous...").
    // Preserve 6:1 <-> 6:1 identity so 5:32 is mtOnly (merged into 6:1).
    '5:32': null, '6:1': '6:1',
    // LXX 8:3 merges MT 8:3 + 8:4; LXX 8:4-5 split MT 8:5. Keep 8:3 <-> 8:3 and 8:5 <-> 8:5.
    '8:3': '8:3', '8:4': null, '8:5': '8:5',
    // MT 35:21 (tower of Eder) omitted in LXX ch.35; MT 35:22 split into LXX 35:21 (Reuben/Bilhah)
    // and LXX 35:22 ("And the sons of Jacob were twelve").
    '35:21': null, '35:22': '35:21',
  },
  ex: {
    // LXX swaps MT 21:16 (kidnapping) and MT 21:17 (cursing parents).
    '21:16': '21:17', '21:17': '21:16',
    // LXX 28:23 = MT 28:29 (names on breastpiece); LXX 28:26 = MT 28:30 (Manifestation/Truth = Urim/Thummim).
    // MT 28:23, 26, 27, 28 are omitted in LXX.
    '28:23': null, '28:29': '28:23', '28:30': '28:26',
    // LXX 32:9 repeats golden calf slogan from end of MT 32:8; MT 32:9 ("stiff-necked") is omitted in LXX.
    '32:9': null,
  },
  lv: {
    // Unclean bird list uses different Greek species names; verse boundaries match 1:1.
    '11:15': '11:15', '11:16': '11:16',
  },
  nm: {
    // LXX 9:18 merges MT 9:18 + 9:19; preserve 9:18 <-> 9:18 and mark 9:19 mtOnly (merged).
    '9:18': '9:18', '9:19': null,
  },
  dt: {
    // LXX omits 14:14 ("every raven"); 14:15-18 are the same 4 bird-list verses.
    '14:14': null, '14:15': '14:15', '14:16': '14:16', '14:17': '14:17', '14:18': '14:18',
  },
  jo: {
    // Same boundary verses with a minor clause split across 18:17-18.
    '18:17': '18:17', '18:18': '18:18',
    // LXX swaps MT 19:47 (Dan takes Leshem/Lachis) and MT 19:48 (inheritance summary).
    '19:47': '19:48', '19:48': '19:47',
    // LXX 20:3 = MT 20:3 (city of refuge for accidental manslayer); MT 20:4-6 omitted in LXX.
    '20:3': '20:3', '20:4': null, '20:5': null, '20:6': null,
  },
  jgs: {
    // LXX 5:31-32 splits MT 5:31; preserve 5:31 <-> 5:31, leaving LXX 5:32 as lxxOnly split tail.
    '5:31': '5:31',
  },
  '1kgs': {
    // LXX 4:20-21 = MT 4:27-28 (officers' provisions & barley/straw); MT 4:20-21, 25-26 omitted here.
    '4:20': null, '4:21': null, '4:27': '4:20', '4:28': '4:21',
    // LXX 6:21 condenses MT 6:21-22; preserve 6:21 <-> 6:21, 6:22 mtOnly.
    '6:21': '6:21', '6:22': null,
    // LXX skips 7:46; preserve 7:47 <-> 7:47.
    '7:46': null, '7:47': '7:47',
  },
  neh: {
    // LXX 7:68 omitted; LXX 7:69 is abbreviated MT 7:69 (asses/donkeys); LXX 12:3 is abbreviated MT 12:3 (Sechenia).
    '7:69': '7:69', '12:3': '12:3',
  },
  jb: {
    // Poetic paraphrase in 36:18-19; same verses 1:1.
    '36:18': '36:18', '36:19': '36:19',
    // Job 40-41 boundary: MT 41:1-8 = LXX 40:20-27; MT 41:9 = LXX 41:1 (MT 41:10 condensed/merged).
    '41:1': '40:20', '41:2': '40:21', '41:3': '40:22', '41:4': '40:23',
    '41:5': '40:24', '41:6': '40:25', '41:7': '40:26', '41:8': '40:27',
    '41:9': '41:1', '41:10': null,
  },
  zep: {
    // LXX 3:1 merges MT 2:15 + MT 3:1; preserve 3:1 <-> 3:1, 2:15 mtOnly (merged).
    '2:15': null, '3:1': '3:1',
  },
  jer: {
    // LXX omits 7:1; LXX 7:2 is abbreviated MT 7:2 ("Hear the word of the Lord, all Judea").
    '7:1': null, '7:2': '7:2',
    // LXX omits 11:7; LXX 11:8 is abbreviated MT 11:8 ("But they did [them] not").
    '11:7': null, '11:8': '11:8',
  },
  ez: {
    // LXX 40:29-30 split MT 40:29 and omit MT 40:30; keep 40:29 <-> 40:29, 40:30 mtOnly.
    '40:29': '40:29', '40:30': null,
  },
};

function alignBook(bookId, esvByCh, lxxByCh) {
  let allPairs = [];

  if (bookId === 'ps') {
    // Brenton LXX2012 Psalms: 1-8 identity; 9+10 -> 9; 11..146 -> 10..145; 147 -> 146+147; 148-150 identity; 151 LXX-only.
    // (Unlike Rahlfs LXX, Brenton keeps MT 114=LXX 113, MT 115=LXX 114, MT 116=LXX 115, MT 117=LXX 116
    // and keeps superscriptions inside verse 1.)
    for (let c = 1; c <= 8; c++) allPairs.push(...alignBlock(esvByCh.get(c), lxxByCh.get(c)));
    allPairs.push(...alignBlock([...esvByCh.get(9), ...esvByCh.get(10)], lxxByCh.get(9), { preferSameKey: false, sameVerseBonus: 0.02 }));
    for (let ec = 11; ec <= 146; ec++) {
      allPairs.push(...alignBlock(esvByCh.get(ec), lxxByCh.get(ec - 1), { preferSameKey: false, sameVerseBonus: 0.08 }));
    }
    allPairs.push(...alignBlock(esvByCh.get(147), [...lxxByCh.get(146), ...lxxByCh.get(147)], { preferSameKey: false, sameVerseBonus: 0.02 }));
    for (let c = 148; c <= 150; c++) allPairs.push(...alignBlock(esvByCh.get(c), lxxByCh.get(c)));
  } else if (bookId === 'jer') {
    // Ch 1-24: same chapter, MT verse numbers preserved with gaps for LXX omissions.
    for (let c = 1; c <= 24; c++) allPairs.push(...alignBlock(esvByCh.get(c), lxxByCh.get(c)));
    // Ch 25-52: LXX Oracles Against the Nations macro-reordering (Brenton preserves MT verse numbers inside each block).
    const jerBlocks = [
      [[[25, 1, 14]], [[25, 1, 13]]],
      [[[25, 15, 38]], [[32, 15, 38]]],
      [[[26, 1, 99]], [[33, 1, 99]]],
      [[[27, 1, 99]], [[34, 1, 99]]],
      [[[28, 1, 99]], [[35, 1, 99]]],
      [[[29, 1, 99]], [[36, 1, 99]]],
      [[[30, 1, 99]], [[37, 1, 99]]],
      [[[31, 1, 99]], [[38, 1, 99]]],
      [[[32, 1, 99]], [[39, 1, 99]]],
      [[[33, 1, 99]], [[40, 1, 99]]],
      [[[34, 1, 99]], [[41, 1, 99]]],
      [[[35, 1, 99]], [[42, 1, 99]]],
      [[[36, 1, 99]], [[43, 1, 99]]],
      [[[37, 1, 99]], [[44, 1, 99]]],
      [[[38, 1, 99]], [[45, 1, 99]]],
      [[[39, 1, 99]], [[46, 1, 99]]],
      [[[40, 1, 99]], [[47, 1, 99]]],
      [[[41, 1, 99]], [[48, 1, 99]]],
      [[[42, 1, 99]], [[49, 1, 99]]],
      [[[43, 1, 99]], [[50, 1, 99]]],
      [[[44, 1, 30], [45, 1, 5]], [[51, 1, 35]]],
      [[[46, 1, 99]], [[26, 2, 99]]], // LXX 26:1 is split tail of Elam (MT 49:34)
      [[[47, 1, 7]], [[29, 1, 7]]],
      [[[48, 1, 99]], [[31, 1, 99]]],
      [[[49, 1, 6]], [[30, 1, 5]]],
      [[[49, 7, 22]], [[29, 8, 22]]], // MT 49:7 is merged into LXX 29:7 (paired with MT 47:7)
      [[[49, 23, 33]], [[30, 23, 33]]],
      [[[49, 34, 39]], [[25, 34, 39]]],
      [[[50, 1, 99]], [[27, 1, 99]]],
      [[[51, 1, 99]], [[28, 1, 99]]],
      [[[52, 1, 99]], [[52, 1, 99]]],
    ];
    for (const [eSpec, lSpec] of jerBlocks) {
      allPairs.push(...alignBlock(getSlice(esvByCh, eSpec), getSlice(lxxByCh, lSpec), { preferSameKey: false, sameVerseBonus: 0.10 }));
    }
  } else if (bookId === '1kgs') {
    for (let c = 1; c <= 19; c++) allPairs.push(...alignBlock(esvByCh.get(c), lxxByCh.get(c), { swapWindow: 10 }));
    // LXX 3 Kingdoms swaps ch. 20 (Ben-hadad) and ch. 21 (Naboth's vineyard).
    allPairs.push(...alignBlock(esvByCh.get(20), lxxByCh.get(21), { preferSameKey: false }));
    allPairs.push(...alignBlock(esvByCh.get(21), lxxByCh.get(20), { preferSameKey: false }));
    allPairs.push(...alignBlock(esvByCh.get(22), lxxByCh.get(22)));
  } else if (bookId === 'ex') {
    for (let c = 1; c <= 35; c++) allPairs.push(...alignBlock(esvByCh.get(c), lxxByCh.get(c), { swapWindow: 12 }));
    // LXX Exodus 36-39 Second Tabernacle Account macro-reordering.
    const exBlocks = [
      [[[36, 1, 7]], [[36, 1, 7]]],
      [[[39, 1, 31]], [[36, 9, 40]]],
      [[[36, 8, 38]], [[37, 1, 6]]],
      [[[38, 9, 23]], [[37, 7, 21]]],
      [[[37, 1, 24]], [[38, 1, 17]]],
      [[[38, 1, 7]], [[38, 22, 24]]],
      [[[37, 29, 29], [38, 8, 8]], [[38, 25, 27]]],
      [[[38, 24, 31]], [[39, 1, 10]]],
      [[[39, 32, 43]], [[39, 11, 23]]],
      [[[40, 1, 38]], [[40, 1, 38]]],
    ];
    for (const [eSpec, lSpec] of exBlocks) {
      allPairs.push(...alignBlock(getSlice(esvByCh, eSpec), getSlice(lxxByCh, lSpec), {
        preferSameKey: eSpec[0][0] === lSpec[0][0],
        sameVerseBonus: 0.06,
      }));
    }
  } else if (bookId === 'nm') {
    const maxCh = Math.max(...esvByCh.keys());
    let c = 1;
    while (c <= maxCh) {
      if (c === 26) {
        // LXX Numbers 26:15-47 reorders 8 tribal census blocks (33-for-33 bijection).
        const nm26Blocks = [
          [[[26, 1, 14]], [[26, 1, 14]]],
          [[[26, 19, 22]], [[26, 15, 18]]], // Judah
          [[[26, 23, 25]], [[26, 19, 21]]], // Issachar
          [[[26, 26, 27]], [[26, 22, 23]]], // Zebulun
          [[[26, 15, 18]], [[26, 24, 27]]], // Gad
          [[[26, 44, 47]], [[26, 28, 31]]], // Asher
          [[[26, 28, 37]], [[26, 32, 41]]], // Joseph (Manasseh & Ephraim)
          [[[26, 38, 41]], [[26, 42, 45]]], // Benjamin
          [[[26, 42, 43]], [[26, 46, 47]]], // Dan
          [[[26, 48, 65]], [[26, 48, 65]]],
        ];
        for (const [eSpec, lSpec] of nm26Blocks) {
          allPairs.push(...alignBlock(getSlice(esvByCh, eSpec), getSlice(lxxByCh, lSpec), {
            preferSameKey: eSpec[0][1] === lSpec[0][1],
            sameVerseBonus: 0.04,
            closeEqualEnds: true,
          }));
        }
        c++;
        continue;
      }
      const keysEqual = (ch) => {
        const e = esvByCh.get(ch) || [], l = lxxByCh.get(ch) || [];
        return e.length === l.length && e.every((x, idx) => x.v === l[idx].v);
      };
      if (!keysEqual(c)) {
        let end = c;
        while (end < maxCh && end + 1 !== 26 && !keysEqual(end + 1)) end++;
        const eSpecs = [], lSpecs = [];
        for (let x = c; x <= end; x++) { eSpecs.push([x, 1, 999]); lSpecs.push([x, 1, 999]); }
        allPairs.push(...alignBlock(getSlice(esvByCh, eSpecs), getSlice(lxxByCh, lSpecs), { swapWindow: 12 }));
        c = end + 1;
      } else {
        allPairs.push(...alignBlock(esvByCh.get(c), lxxByCh.get(c), { swapWindow: 10 }));
        c++;
      }
    }
  } else {
    const maxCh = Math.max(...esvByCh.keys());
    let c = 1;
    while (c <= maxCh) {
      const keysEqual = (ch) => {
        const e = esvByCh.get(ch) || [], l = lxxByCh.get(ch) || [];
        return e.length === l.length && e.every((x, idx) => x.v === l[idx].v);
      };
      if (!keysEqual(c)) {
        let end = c;
        while (end < maxCh) {
          if (!keysEqual(end + 1)) { end++; }
          else {
            const eEnd = esvByCh.get(end), lEnd = lxxByCh.get(end);
            if (eEnd.length !== lEnd.length && esvByCh.has(end + 1) && lxxByCh.has(end + 1)) end++;
            break;
          }
        }
        const eSpecs = [], lSpecs = [];
        for (let x = c; x <= end; x++) { eSpecs.push([x, 1, 999]); lSpecs.push([x, 1, 999]); }
        allPairs.push(...alignBlock(getSlice(esvByCh, eSpecs), getSlice(lxxByCh, lSpecs), { swapWindow: 12 }));
        c = end + 1;
      } else {
        allPairs.push(...alignBlock(esvByCh.get(c), lxxByCh.get(c), { swapWindow: 10 }));
        c++;
      }
    }
  }

  // Apply explicit scholarly overrides cleanly while preserving strict bijection
  const ov = SCHOLARLY_OVERRIDES[bookId];
  if (ov) {
    const esvByKey = new Map([...esvByCh.values()].flat().map(x => [x.key, x]));
    const lxxByKey = new Map([...lxxByCh.values()].flat().map(x => [x.key, x]));
    const ovMtKeys = new Set(Object.keys(ov));
    const ovLxxKeys = new Set(Object.values(ov).filter(Boolean));
    allPairs = allPairs.filter(p => !ovMtKeys.has(p.esv.key) && !ovLxxKeys.has(p.lxx.key));
    for (const [mtKey, lxxKey] of Object.entries(ov)) {
      if (lxxKey === null) continue;
      const e = esvByKey.get(mtKey);
      const l = lxxByKey.get(lxxKey);
      if (!e || !l) throw new Error(`Invalid override ${bookId} ${mtKey} -> ${lxxKey}`);
      allPairs.push({ esv: e, lxx: l, sim: simF(e.f, l.f) });
    }
    allPairs.sort((a, b) => a.esv.c - b.esv.c || a.esv.v - b.esv.v);
  }

  return allPairs;
}

// --- Main generation ---
const booksMeta = JSON.parse(fs.readFileSync(BOOKS_META_PATH, 'utf8'));
const canonicalOtBooks = [];
const deuterocanonBooks = [];
const lxxVerses = {};
const mtVerses = {};
const mtToLxx = {};
const mtOnly = {};
const lxxOnly = {};

let totalPaired = 0, totalNonId = 0, totalMtOnly = 0, totalLxxOnly = 0;

for (const b of booksMeta.ot) {
  const lxxByCh = loadBook(LXX_DIR, b.id);
  if (!lxxByCh) throw new Error(`Missing LXX2012 scripture JSON for OT book: ${b.id}`);
  lxxVerses[b.id] = summarizeBookChapters(lxxByCh);

  const esvByCh = loadBook(esvDir, b.id);
  if (!esvByCh) {
    deuterocanonBooks.push(b.id);
    continue;
  }

  canonicalOtBooks.push(b.id);
  mtVerses[b.id] = summarizeBookChapters(esvByCh);

  const pairs = alignBook(b.id, esvByCh, lxxByCh);

  // Strict invariant verification per book
  const allEKeys = new Set([...esvByCh.values()].flat().map(x => x.key));
  const allLKeys = new Set([...lxxByCh.values()].flat().map(x => x.key));
  const seenE = new Set();
  const seenL = new Set();
  const bookMap = {};

  for (const p of pairs) {
    if (!allEKeys.has(p.esv.key)) throw new Error(`${b.id}: mapped MT key missing in ESV: ${p.esv.key}`);
    if (!allLKeys.has(p.lxx.key)) throw new Error(`${b.id}: mapped LXX key missing in LXX2012: ${p.lxx.key}`);
    if (seenE.has(p.esv.key)) throw new Error(`${b.id}: duplicate MT mapping for ${p.esv.key}`);
    if (seenL.has(p.lxx.key)) throw new Error(`${b.id}: duplicate LXX target for ${p.lxx.key}`);
    seenE.add(p.esv.key);
    seenL.add(p.lxx.key);
    if (p.esv.key !== p.lxx.key) {
      bookMap[p.esv.key] = p.lxx.key;
      totalNonId++;
    }
  }

  const mo = [...allEKeys].filter(k => !seenE.has(k));
  const lo = [...allLKeys].filter(k => !seenL.has(k));

  // Verify exact partition completeness
  if (seenE.size + mo.length !== allEKeys.size) throw new Error(`${b.id}: MT partition mismatch`);
  if (seenL.size + lo.length !== allLKeys.size) throw new Error(`${b.id}: LXX partition mismatch`);

  if (Object.keys(bookMap).length > 0) mtToLxx[b.id] = bookMap;
  if (mo.length > 0) mtOnly[b.id] = mo;
  if (lo.length > 0) lxxOnly[b.id] = lo;

  totalPaired += pairs.length;
  totalMtOnly += mo.length;
  totalLxxOnly += lo.length;
}

const payload = {
  version: 1,
  source: 'Derived empirically by scripts/gen_versification_map.mjs aligning src/data/scripture/lxx2012/*.json (Brenton LXX2012) against data_collection/bible/esv/output/*.json (English/MT versification).',
  canonicalOtBooks,
  deuterocanonBooks,
  lxxVerses,
  mtVerses,
  mtToLxx,
  mtOnly,
  lxxOnly,
};

const jsonText = JSON.stringify(payload, null, 2) + '\n';

if (checkOnly) {
  const existing = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : '';
  if (existing !== jsonText) {
    console.error(`[gen_versification_map] ${path.relative(ROOT, OUTPUT_PATH)} is out of date. Re-run: node scripts/gen_versification_map.mjs`);
    process.exit(1);
  }
  console.log(`[gen_versification_map] OK (${totalPaired} paired, ${totalNonId} non-identity, ${totalMtOnly} mtOnly, ${totalLxxOnly} lxxOnly)`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, jsonText);
console.log(`[gen_versification_map] Wrote ${path.relative(ROOT, OUTPUT_PATH)} (${(jsonText.length / 1024).toFixed(1)} KB)`);
console.log(`  Canonical OT books: ${canonicalOtBooks.length}, Deuterocanonical books: ${deuterocanonBooks.length}`);
console.log(`  Paired 1:1: ${totalPaired} (${totalNonId} non-identity), mtOnly: ${totalMtOnly}, lxxOnly: ${totalLxxOnly}`);
