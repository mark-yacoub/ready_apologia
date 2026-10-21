/**
 * The dataset contract for the Hadith Reliability article, enforced at the boundary.
 *
 * Runs in two places so a bad drop never reaches readers:
 *   - scripts/import_hadith_reliability.js: before the file is copied into src/data (exit 1 on errors)
 *   - loader.js: at build time (the build fails with these messages instead of a stack trace)
 *
 * `errors` are structural problems the site cannot render correctly. `warnings` need a human (or the
 * adversarial reader) to judge, e.g. a title count that may legitimately count pairs or groups.
 *
 * @param {any} data parsed hadith_reliability_overview.json
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateDataset(data) {
  const errors = [];
  const warnings = [];
  const err = (path, msg) => errors.push(`${path}: ${msg}`);
  const warn = (path, msg) => warnings.push(`${path}: ${msg}`);
  const isStr = v => typeof v === 'string' && v.trim() !== '';
  const isInt = v => Number.isInteger(v);
  const needStr = (obj, key, path) => { if (!isStr(obj?.[key])) err(`${path}.${key}`, 'required non-empty string'); };
  const needArr = (obj, key, path, { nonEmpty = false } = {}) => {
    const v = obj?.[key];
    if (!Array.isArray(v)) { err(`${path}.${key}`, 'required array'); return []; }
    if (nonEmpty && !v.length) err(`${path}.${key}`, 'must not be empty');
    return v;
  };
  const contiguous = (ranks, path, what) => {
    const sorted = [...ranks].sort((a, b) => a - b);
    if (!sorted.every((r, i) => r === i + 1)) err(path, `${what} must be 1..${ranks.length} with no gaps or repeats (got ${sorted.join(', ')})`);
  };

  if (!data || typeof data !== 'object') return { errors: ['<root>: not an object'], warnings };
  if (!data.article_meta || typeof data.article_meta !== 'object') err('article_meta', 'required object');

  const args = needArr(data, 'arguments', '<root>', { nonEmpty: true });
  const caseIds = new Set();
  const sectionIds = new Set();
  const readingOrder = [];

  args.forEach((a, ai) => {
    const ap = `arguments[${ai}](${a?.id ?? '?'})`;
    needStr(a, 'id', ap);
    needStr(a, 'reader_question', ap);
    needStr(a, 'short_title', ap);
    if (!isInt(a?.rank)) err(`${ap}.rank`, 'required integer');
    if (sectionIds.has(a?.id)) err(`${ap}.id`, 'duplicate section id');
    sectionIds.add(a?.id);

    const subs = needArr(a, 'subpoints', ap, { nonEmpty: true });
    if (subs.every(s => isInt(s?.rank))) contiguous(subs.map(s => s.rank), `${ap}.subpoints[].rank`, 'case ranks');
    subs.forEach((s, si) => validateCase(s, `${ap}.subpoints[${si}](${s?.id ?? '?'})`));
    [...subs].sort((x, y) => x.rank - y.rank).forEach(s => readingOrder.push({ s, sectionRank: a?.rank }));
  });

  if (args.every(a => isInt(a?.rank))) contiguous(args.map(a => a.rank), 'arguments[].rank', 'section ranks');

  // global_rank must agree with reading order (section rank, then case rank): the hub, pager and
  // at-a-glance all depend on it.
  readingOrder.sort((x, y) => x.sectionRank - y.sectionRank);
  readingOrder.forEach(({ s }, i) => {
    if (s?.global_rank !== i + 1) err(`case ${s?.id}`, `global_rank is ${s?.global_rank}, but reading order puts it at ${i + 1}`);
  });

  // Every markdown link target anywhere in the dataset must be absolute https or site-relative.
  walkStrings(data, '<root>', (str, path) => {
    for (const m of str.matchAll(/\]\(([^)\s]*)\)/g)) {
      if (!/^(https:\/\/|\/)/.test(m[1])) err(path, `markdown link target is not https:// or /: "${m[1]}"`);
    }
  });

  return { errors, warnings };

  function validateCase(s, sp) {
    ['id', 'short_title', 'plain_english_hook', 'title', 'summary_markdown'].forEach(k => needStr(s, k, sp));
    if (!isInt(s?.rank)) err(`${sp}.rank`, 'required integer');
    if (!isInt(s?.global_rank)) err(`${sp}.global_rank`, 'required integer');
    if (caseIds.has(s?.id)) err(`${sp}.id`, 'duplicate case id');
    caseIds.add(s?.id);

    needArr(s, 'primary_references', sp).forEach((r, i) => checkRef(r, `${sp}.primary_references[${i}]`));
    needArr(s, 'dive_deeper_links', sp).forEach((l, i) => { if (!/^https:\/\//.test(l?.url || '')) err(`${sp}.dive_deeper_links[${i}].url`, 'must be https://'); });

    const seenBodies = new Map();
    needArr(s, 'evidence_items', sp, { nonEmpty: true }).forEach((e, i) => {
      const ep = `${sp}.evidence_items[${i}]`;
      needStr(e, 'label', ep);
      needStr(e, 'content_markdown', ep);
      needArr(e, 'primary_references', ep).forEach((r, j) => checkRef(r, `${ep}.primary_references[${j}]`));
      const key = String(e?.content_markdown || '').replace(/\s+/g, ' ').trim();
      if (key && seenBodies.has(key)) err(ep, `duplicate of evidence_items[${seenBodies.get(key)}]`);
      else seenBodies.set(key, i);
    });

    (s?.comparison_tables || []).forEach((t, i) => {
      const tp = `${sp}.comparison_tables[${i}]`;
      const headers = needArr(t, 'headers', tp, { nonEmpty: true });
      needArr(t, 'rows', tp).forEach((r, j) => {
        if (!Array.isArray(r) || r.length !== headers.length) err(`${tp}.rows[${j}]`, `must be an array of ${headers.length} cells`);
      });
    });

    validateShowcase(s?.showcase, `${sp}.showcase`, s);
  }

  function checkRef(r, path) {
    needStr(r, 'label', path);
    if (r?.url != null && !/^https:\/\//.test(r.url)) err(`${path}.url`, 'must be https://');
  }

  function validateShowcase(sc, path, s) {
    if (!sc || typeof sc !== 'object') { err(path, 'required object'); return; }
    const items = key => needArr(sc, key, path, { nonEmpty: true });
    let count = null;
    switch (sc.type) {
      case 'number_fan':
      case 'bars':
        count = items('items').length;
        sc.items?.forEach((it, i) => { if (it?.value == null) err(`${path}.items[${i}].value`, 'required'); });
        break;
      case 'versions':
        count = items('items').length;
        sc.items?.forEach((it, i) => needStr(it, 'wording_en', `${path}.items[${i}]`));
        break;
      case 'witnesses':
        count = items('items').length;
        sc.items?.forEach((it, i) => needStr(it, 'scholar', `${path}.items[${i}]`));
        break;
      case 'timeline':
        count = items('points').length;
        sc.points?.forEach((p, i) => needStr(p, 'label', `${path}.points[${i}]`));
        break;
      case 'chain':
        items('narrators').forEach((n, i) => needStr(n, 'name', `${path}.narrators[${i}]`));
        break;
      case 'redline':
        needStr(sc.a, 'text', `${path}.a`);
        needStr(sc.b, 'text', `${path}.b`);
        break;
      case 'confrontation':
        needArr(sc.left, 'items', `${path}.left`, { nonEmpty: true });
        needArr(sc.right, 'items', `${path}.right`, { nonEmpty: true });
        break;
      default:
        err(`${path}.type`, `unknown showcase type "${sc.type}"`);
    }

    // Titles lead with what the reader will see ("3 Ṣaḥīḥ Reports …"). A title may count groups or
    // pairs ("2 Sayings" shown as 4 versions), so a mismatch is a warning for a human to check.
    const lead = String(s?.short_title || '').match(/^\D{0,2}(\d+)\s/);
    if (lead && count != null) {
      const nums = [...String(s.short_title).matchAll(/(?:^|\s)(\d+)\s+(?=\p{L})/gu)].map(m => Number(m[1]));
      const sum = nums.reduce((a, b) => a + b, 0);
      if (count !== Number(lead[1]) && count !== sum) {
        warn(path, `title says ${lead[1]}${nums.length > 1 ? ` (numbers sum to ${sum})` : ''} but the showcase shows ${count} items`);
      }
    }
  }
}

/** Calls fn(string, jsonPath) for every string value in a JSON tree. */
function walkStrings(node, path, fn) {
  if (typeof node === 'string') fn(node, path);
  else if (Array.isArray(node)) node.forEach((v, i) => walkStrings(v, `${path}[${i}]`, fn));
  else if (node && typeof node === 'object') Object.entries(node).forEach(([k, v]) => walkStrings(v, `${path}.${k}`, fn));
}

/** Formats a result for console output; returns true when there are no errors. */
export function printValidation({ errors, warnings }, log = console) {
  warnings.forEach(w => log.warn(`  warn   ${w}`));
  errors.forEach(e => log.error(`  ERROR  ${e}`));
  return errors.length === 0;
}
