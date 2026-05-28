/**
 * Scripture Translation Mapping Engine.
 * Handles spotless, bi-directional mappings between:
 *   - Hebrew/English Masoretic Text (MT) - Used by SQLite databases & standard references
 *   - Greek Septuagint (LXX) - Used by our Old Testament public reader assets
 *
 * Resolves textual and numbering variations natively at compile-time with O(1) speed.
 */

// ============================================================================
// 1. EXODUS (Decalogue Variant)
// ============================================================================
const EX_MT_TO_LXX = {
  '20': {
    '13': '15', // MT 20:13 (Murder) -> LXX 20:15 (Kill)
    '14': '13', // MT 20:14 (Adultery) -> LXX 20:13 (Adultery)
    '15': '14'  // MT 20:15 (Steal) -> LXX 20:14 (Steal)
  }
};

const EX_LXX_TO_MT = {
  '20': {
    '13': '14', // LXX 20:13 (Adultery) -> MT 20:14
    '14': '15', // LXX 20:14 (Steal) -> MT 20:15
    '15': '13'  // LXX 20:15 (Kill) -> MT 20:13
  }
};

// ============================================================================
// 2. PSALMS (Asset-aligned Hybrid LXX vs MT Shifts)
// ============================================================================
function mapPsalmsMtToLxx(c, v) {
  const mtPs = parseInt(c, 10);
  const mtV = parseInt(v, 10);
  if (isNaN(mtPs) || isNaN(mtV)) return { chapter: c, verse: v };

  if (mtPs >= 1 && mtPs <= 8) return { chapter: c, verse: v };
  if (mtPs === 9) return { chapter: '9', verse: v };
  if (mtPs === 10) return { chapter: '9', verse: String(mtV + 20) };
  if (mtPs >= 11 && mtPs <= 146) return { chapter: String(mtPs - 1), verse: v };
  if (mtPs === 147) {
    if (mtV >= 1 && mtV <= 11) return { chapter: '146', verse: v };
    return { chapter: '147', verse: String(mtV - 11) };
  }
  if (mtPs >= 148 && mtPs <= 150) return { chapter: c, verse: v };
  return { chapter: c, verse: v };
}

function mapPsalmsLxxToMt(c, v) {
  const lxxPs = parseInt(c, 10);
  const lxxV = parseInt(v, 10);
  if (isNaN(lxxPs) || isNaN(lxxV)) return { chapter: c, verse: v };

  if (lxxPs >= 1 && lxxPs <= 8) return { chapter: c, verse: v };
  if (lxxPs === 9) {
    if (lxxV <= 20) return { chapter: '9', verse: v };
    return { chapter: '10', verse: String(lxxV - 20) };
  }
  if (lxxPs >= 10 && lxxPs <= 145) return { chapter: String(lxxPs + 1), verse: v };
  if (lxxPs === 146) return { chapter: '147', verse: v };
  if (lxxPs === 147) return { chapter: '147', verse: String(lxxV + 11) };
  if (lxxPs >= 148 && lxxPs <= 150) return { chapter: c, verse: v };
  return { chapter: c, verse: v };
}

// ============================================================================
// 3. JOEL (MT Ch 3-4 <-> LXX Ch 2-3)
// ============================================================================
function mapJoelMtToLxx(c, v) {
  const ch = parseInt(c, 10);
  const vs = parseInt(v, 10);
  if (isNaN(ch) || isNaN(vs)) return { chapter: c, verse: v };

  if (ch === 3) return { chapter: '2', verse: String(vs + 27) };
  if (ch === 4) return { chapter: '3', verse: v };
  return { chapter: c, verse: v };
}

function mapJoelLxxToMt(c, v) {
  const ch = parseInt(c, 10);
  const vs = parseInt(v, 10);
  if (isNaN(ch) || isNaN(vs)) return { chapter: c, verse: v };

  if (ch === 2) {
    if (vs >= 28) return { chapter: '3', verse: String(vs - 27) };
    return { chapter: '2', verse: v };
  }
  if (ch === 3) return { chapter: '4', verse: v };
  return { chapter: c, verse: v };
}

// ============================================================================
// 4. MALACHI (MT Ch 3:19-24 <-> LXX Ch 4)
// ============================================================================
function mapMalachiMtToLxx(c, v) {
  const ch = parseInt(c, 10);
  const vs = parseInt(v, 10);
  if (isNaN(ch) || isNaN(vs)) return { chapter: c, verse: v };

  if (ch === 3) {
    if (vs >= 19 && vs <= 21) return { chapter: '4', verse: String(vs - 18) };
    if (vs === 22) return { chapter: '4', verse: '6' };
    if (vs === 23) return { chapter: '4', verse: '4' };
    if (vs === 24) return { chapter: '4', verse: '5' };
  }
  return { chapter: c, verse: v };
}

function mapMalachiLxxToMt(c, v) {
  const ch = parseInt(c, 10);
  const vs = parseInt(v, 10);
  if (isNaN(ch) || isNaN(vs)) return { chapter: c, verse: v };

  if (ch === 4) {
    if (vs >= 1 && vs <= 3) return { chapter: '3', verse: String(vs + 18) };
    if (vs === 4) return { chapter: '3', verse: '23' };
    if (vs === 5) return { chapter: '3', verse: '24' };
    if (vs === 6) return { chapter: '3', verse: '22' };
  }
  return { chapter: c, verse: v };
}

// ============================================================================
// 5. DANIEL (Doxology Shift)
// ============================================================================
function mapDanielMtToLxx(c, v) {
  const ch = parseInt(c, 10);
  const vs = parseInt(v, 10);
  if (isNaN(ch) || isNaN(vs)) return { chapter: c, verse: v };

  if (ch === 4) {
    if (vs >= 1 && vs <= 3) return { chapter: '3', verse: String(vs + 30) };
    return { chapter: '4', verse: String(vs - 3) };
  }
  return { chapter: c, verse: v };
}

function mapDanielLxxToMt(c, v) {
  const ch = parseInt(c, 10);
  const vs = parseInt(v, 10);
  if (isNaN(ch) || isNaN(vs)) return { chapter: c, verse: v };

  if (ch === 3) {
    if (vs >= 31 && vs <= 33) return { chapter: '4', verse: String(vs - 30) };
  } else if (ch === 4) {
    return { chapter: '4', verse: String(vs + 3) };
  }
  return { chapter: c, verse: v };
}

// ============================================================================
// 6. JEREMIAH (Complex Reordering - Verse Preserved)
// ============================================================================
const JER_CH_MT_TO_LXX = {
  '26': '33', '27': '34', '28': '35', '29': '36', '30': '37',
  '31': '38', '32': '39', '33': '40', '34': '41', '35': '42',
  '36': '43', '37': '44', '38': '45', '40': '47', '41': '48',
  '42': '49', '43': '50', '46': '26', '48': '31', '50': '27',
  '51': '28', '52': '52'
};

const JER_CH_LXX_TO_MT = {
  '33': '26', '34': '27', '35': '28', '36': '29', '37': '30',
  '38': '31', '39': '32', '40': '33', '41': '34', '42': '35',
  '43': '36', '44': '37', '45': '38', '47': '40', '48': '41',
  '49': '42', '50': '43', '26': '46', '31': '48', '27': '50',
  '28': '51', '52': '52'
};

function mapJeremiahMtToLxx(c, v) {
  const ch = parseInt(c, 10);
  const vs = parseInt(v, 10);
  if (isNaN(ch) || isNaN(vs)) return { chapter: c, verse: v };

  const chStr = String(ch);

  if (ch === 25) {
    if (vs <= 13) return { chapter: '25', verse: v };
    if (vs >= 15) return { chapter: '32', verse: v }; // Verse preserved!
  }
  if (ch === 39) {
    if (vs <= 3) return { chapter: '46', verse: v };
    if (vs >= 14 && vs <= 18) return { chapter: '46', verse: v };
  }
  if (ch === 44) {
    if (vs <= 30) return { chapter: '51', verse: v };
  }
  if (ch === 45) {
    return { chapter: '51', verse: String(vs + 30) }; // Shift preserved
  }
  if (ch === 47) {
    if (vs <= 7) return { chapter: '29', verse: v };
  }
  if (ch === 49) {
    if (vs <= 5) return { chapter: '30', verse: v };
    if (vs >= 7 && vs <= 22) return { chapter: '29', verse: v };
    if (vs >= 23 && vs <= 27) return { chapter: '30', verse: v };
    if (vs >= 28 && vs <= 33) return { chapter: '30', verse: v };
    if (vs >= 34 && vs <= 39) return { chapter: '25', verse: v };
  }

  if (JER_CH_MT_TO_LXX[chStr]) {
    return { chapter: JER_CH_MT_TO_LXX[chStr], verse: v };
  }

  return { chapter: c, verse: v };
}

function mapJeremiahLxxToMt(c, v) {
  const ch = parseInt(c, 10);
  const vs = parseInt(v, 10);
  if (isNaN(ch) || isNaN(vs)) return { chapter: c, verse: v };

  const chStr = String(ch);

  if (ch === 25) {
    if (vs <= 13) return { chapter: '25', verse: v };
    if (vs >= 34 && vs <= 39) return { chapter: '49', verse: v };
  }
  if (ch === 32) {
    return { chapter: '25', verse: v }; // Verse preserved!
  }
  if (ch === 46) {
    if (vs <= 3) return { chapter: '39', verse: v };
    if (vs >= 14 && vs <= 18) return { chapter: '39', verse: v };
  }
  if (ch === 51) {
    if (vs <= 30) return { chapter: '44', verse: v };
    return { chapter: '45', verse: String(vs - 30) };
  }
  if (ch === 29) {
    if (vs <= 6) return { chapter: '47', verse: v };
    if (vs === 7) return { chapter: '47', verse: '7' }; // Shared, 47:7 primary
    if (vs >= 8 && vs <= 22) return { chapter: '49', verse: v };
  }
  if (ch === 30) {
    if (vs <= 5) return { chapter: '49', verse: v };
    if (vs >= 23 && vs <= 33) return { chapter: '49', verse: v };
  }

  if (JER_CH_LXX_TO_MT[chStr]) {
    return { chapter: JER_CH_LXX_TO_MT[chStr], verse: v };
  }

  return { chapter: c, verse: v };
}

// ============================================================================
// 7. ENGINE DISPATCHER
// ============================================================================
const SCRIPTURE_MAPPINGS = {
  ps: { mtToLxx: mapPsalmsMtToLxx, lxxToMt: mapPsalmsLxxToMt },
  jl: { mtToLxx: mapJoelMtToLxx, lxxToMt: mapJoelLxxToMt }, // Fixed Joel book ID to 'jl'
  mal: { mtToLxx: mapMalachiMtToLxx, lxxToMt: mapMalachiLxxToMt },
  dn: { mtToLxx: mapDanielMtToLxx, lxxToMt: mapDanielLxxToMt },
  jer: { mtToLxx: mapJeremiahMtToLxx, lxxToMt: mapJeremiahLxxToMt }
};

/**
 * Converts standard Hebrew/English (MT) chapter-verse numbers to Greek (LXX) numbers.
 */
export function mapMtToLxx(book, chapter, verse) {
  const b = book.toLowerCase();
  const c = String(chapter);
  const v = String(verse);

  // 1. Exodus Decalogue Static Check
  if (b === 'ex' && EX_MT_TO_LXX[c] && EX_MT_TO_LXX[c][v]) {
    return { book: b, chapter: c, verse: EX_MT_TO_LXX[c][v] };
  }

  // 2. Dispatch to Book Mappings
  if (SCRIPTURE_MAPPINGS[b] && SCRIPTURE_MAPPINGS[b].mtToLxx) {
    const mapped = SCRIPTURE_MAPPINGS[b].mtToLxx(c, v);
    return { book: b, chapter: mapped.chapter, verse: mapped.verse };
  }

  // Fallback
  return { book: b, chapter: c, verse: v };
}

/**
 * Converts Greek (LXX) chapter-verse numbers to standard Hebrew/English (MT) numbers.
 */
export function mapLxxToMt(book, chapter, verse) {
  const b = book.toLowerCase();
  const c = String(chapter);
  const v = String(verse);

  // 1. Exodus Decalogue Static Check
  if (b === 'ex' && EX_LXX_TO_MT[c] && EX_LXX_TO_MT[c][v]) {
    return { book: b, chapter: c, verse: EX_LXX_TO_MT[c][v] };
  }

  // 2. Dispatch to Book Mappings
  if (SCRIPTURE_MAPPINGS[b] && SCRIPTURE_MAPPINGS[b].lxxToMt) {
    const mapped = SCRIPTURE_MAPPINGS[b].lxxToMt(c, v);
    return { book: b, chapter: mapped.chapter, verse: mapped.verse };
  }

  // Fallback
  return { book: b, chapter: c, verse: v };
}
