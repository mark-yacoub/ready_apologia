/**
 * Apologist registry: who a clip is credited to, and which YouTube channels are theirs.
 *
 * Slugs and aliases agree with the shared pipeline registry `data_collection/common/apologists.json`
 * (fields there: slug, name, kind → type, aliases, own_channel_ids → channels), so this file can later
 * be generated from it. Shape:
 *   APOLOGISTS: [{ slug, name, type?, alternateName?, aliases: [], channels: [] }]
 *   CHANNELS:   { <channel key>: { name, handle } }   key = channel_id lowercased, without '@'
 *
 * APOLOGISTS is the full person registry: it names everyone a clip credits (credit text on the verse
 * /videos tabs). Only the people in FEATURED_APOLOGISTS (below) get a page.
 *
 * Rules:
 * - `slug` is the person's key. For a featured person it is also a PUBLIC URL (/apologists/<slug>):
 *   never rename or un-feature a live one without a 301 (CLOUDFLARE.md).
 * - `aliases` are the exact `shorts_metadata.apologist_name` strings (case-insensitive) that mean this
 *   person. Multi-speaker labels ("A & B", "A / B", "A, B", "A and B") are split and each part is
 *   resolved on its own; labels that cannot be split mechanically live in COMBINED_LABELS.
 * - `channels` are the person's OWN channels: the header button and "via <uploader>" (shown when the
 *   uploader is not one of them) both come from here.
 *   Every channel URL must be one of the registry's `own_channel_urls` for that slug (never added by
 *   hand); `apologistsLoader.test.mjs` checks this, and that every registry alias resolves here, when
 *   the registry is available (APOLOGIST_REGISTRY=<path>, or ~/Documents/data_collection/common/).
 * - Labels that do not name a speaker (unknown, generic, uploader/panel names) are in EXCLUDED_LABELS:
 *   their clips show no credit until the pipeline re-labels them.
 */

/** @type {Record<string, { name: string, handle: string }>} */
export const CHANNELS = {
  towardsjesus: { name: 'Towards Jesus', handle: 'towardsjesus' },
  shamounian: { name: 'Sam Shamoun', handle: 'Shamounian' },
  apologeticsroadshow: { name: 'Apologetics Roadshow', handle: 'apologeticsroadshow' },
  godlogicapologetics: { name: 'GodLogic', handle: 'GodLogicApologetics' },
  'godlogic2.0': { name: 'GodLogic 2.0', handle: 'GodLogic2.0' },
  givemeananswer: { name: 'Give Me An Answer', handle: 'GiveMeAnAnswer' },
  crossexamined: { name: 'CrossExamined', handle: 'CrossExamined' },
  mikewinger: { name: 'Mike Winger', handle: 'MikeWinger' },
  inspiringphilosophy: { name: 'InspiringPhilosophy', handle: 'InspiringPhilosophy' },
  capturingchristianity: { name: 'Capturing Christianity', handle: 'CapturingChristianity' },
  redpenlogic: { name: 'Red Pen Logic', handle: 'RedPenLogic' },
  vocabmalone: { name: 'Vocab Malone', handle: 'VocabMalone' },
  cirainternational: { name: 'CIRA International', handle: 'CIRAInternational' },
  testifyapologetics: { name: 'Testify', handle: 'TestifyApologetics' },
  copticorthodoxanswers: { name: 'Coptic Orthodox Answers', handle: 'CopticOrthodoxAnswers' },
  ancientfaithministries: { name: 'Ancient Faith Ministries', handle: 'AncientFaithMinistries' },
  christianprince1: { name: 'Christian Prince', handle: 'ChristianPrince1' },
  jonathanpageauclips: { name: 'Jonathan Pageau Clips', handle: 'JonathanPageauClips' },
  weshuff: { name: 'Wes Huff', handle: 'WesHuff' },
  oneforisrael: { name: 'ONE FOR ISRAEL', handle: 'ONEFORISRAEL' },
  apostateprophet: { name: 'Apostate Prophet', handle: 'ApostateProphet' },
};

const P = (slug, name, aliases = [name], channels = [], extra = {}) => ({ slug, name, aliases, channels, ...extra });
const ORG = { type: 'Organization' };

/** Ordered roughly by clip count; order has no effect on the site. */
export const APOLOGISTS = [
  P('sam-shamoun', 'Sam Shamoun', ['Sam Shamoun', 'Shamounian', 'Sam Shamoun (Shamounian)'], ['shamounian']),
  P('david-wood', 'David Wood', ['David Wood', 'Dr. David Wood', 'David Wood (Acts 17 Apologetics)', 'Acts 17 Apologetics', 'Apologetics Roadshow'], ['apologeticsroadshow']),
  P('godlogic', 'GodLogic', ['GodLogic', 'GodLogic (Avery Austin)', 'GodLogic (Avery)', 'Avery (GodLogic)', 'Avery Austin (GodLogic)', 'Avery Austin', 'GodLogic Apologetics', 'GodLogic Back-up'],
    ['godlogicapologetics', 'godlogic2.0'], { alternateName: 'Avery Austin' }),
  P('frank-turek', 'Frank Turek', ['Frank Turek', 'Dr. Frank Turek', 'CrossExamined', 'Cross Examined'], ['crossexamined']),
  P('inspiringphilosophy', 'InspiringPhilosophy',
    ['InspiringPhilosophy', 'Michael Jones', 'Michael Jones (InspiringPhilosophy)', 'Michael Jones (Inspiring Philosophy)', 'InspiringPhilosophy (Michael Jones)', 'Inspiring Philosophy', 'IP'],
    ['inspiringphilosophy'], { alternateName: 'Michael Jones' }),
  P('erik-manning', 'Erik Manning', ['Erik Manning', 'Erik Manning (Testify)', 'Erik Manning (Testify Apologetics)', 'Testify', 'Testify Apologetics'], ['testifyapologetics']),
  P('vocab-malone', 'Vocab Malone', ['Vocab Malone', 'Street Apologist'], ['vocabmalone']),
  P('stuart-knechtle', 'Stuart Knechtle', ['Stuart Knechtle', 'Pastor Stuart Knechtle', 'Stuart'], ['givemeananswer']),
  P('mike-winger', 'Mike Winger', ['Mike Winger', 'Pastor Mike Winger', 'BibleThinker'], ['mikewinger']),
  P('cliffe-knechtle', 'Cliffe Knechtle', ['Cliffe Knechtle', 'Cliff Knechtle', 'Pastor Cliffe Knechtle', 'Give Me An Answer', 'Cliffe', 'Cliff'], ['givemeananswer']),
  P('wes-huff', 'Wes Huff', ['Wes Huff', 'Wesley Huff', 'Wes Huff (Compilation)'], ['weshuff']),
  P('al-fadi', 'Al Fadi', ['Al Fadi', 'Al Fadi (CIRA International)', 'CIRA International', 'Al-Fadi'], ['cirainternational']),
  P('one-for-israel', 'ONE FOR ISRAEL', ['ONE FOR ISRAEL', 'Pod for Israel', 'ONE FOR ISRAEL Ministry'], ['oneforisrael'], ORG),
  P('tim-barnett', 'Tim Barnett', ['Tim Barnett', 'Red Pen Logic', 'Tim Barnett (Red Pen Logic)'], ['redpenlogic']),
  P('jeannie-constantinou', 'Dr. Jeannie Constantinou', ['Dr. Jeannie Constantinou', 'Jeannie Constantinou', 'Presbytera Jeannie Constantinou']),
  P('nabeel-qureshi', 'Nabeel Qureshi', ['Nabeel Qureshi', 'Dr. Nabeel Qureshi']),
  P('jonathan-pageau', 'Jonathan Pageau', ['Jonathan Pageau', 'The Symbolic World'], ['jonathanpageauclips']),
  P('apostate-prophet', 'Apostate Prophet', ['Apostate Prophet', 'Apostate Prophet (Ridvan Aydemir)', 'Ridvan Aydemir (Apostate Prophet)', 'Ridvan Aydemir'],
    ['apostateprophet'], { alternateName: 'Ridvan Aydemir' }),
  P('coptic-orthodox-answers', 'Coptic Orthodox Answers', ['Coptic Orthodox Answers', 'COA'], ['copticorthodoxanswers'], ORG),
  P('stephen-de-young', 'Fr. Stephen De Young', ['Fr. Stephen De Young', 'Stephen De Young', 'Father Stephen De Young']),
  P('lee-strobel', 'Lee Strobel'),
  P('bobby-conway', 'Bobby Conway', ['Bobby Conway', 'Dr. Bobby Conway', 'One Minute Apologist']),
  P('mike-licona', 'Mike Licona', ['Mike Licona', 'Michael Licona', 'Dr. Mike Licona', 'Dr. Michael Licona']),
  P('melissa-dougherty', 'Melissa Dougherty'),
  P('tom-soroka', 'Fr. Tom Soroka', ['Fr. Tom Soroka', 'Tom Soroka', 'Father Tom Soroka']),
  P('anthony-mourad', 'Fr. Anthony Mourad', ['Fr. Anthony Mourad', 'Anthony Mourad', 'Father Anthony Mourad']),
  P('seth-postell', 'Dr. Seth Postell', ['Dr. Seth Postell', 'Seth Postell', 'Seth Postell (ONE FOR ISRAEL)', 'Dr. Seth Postell (ONE FOR ISRAEL)']),
  P('bob-of-speakers-corner', 'Bob of Speakers Corner', ['Bob of Speakers Corner', 'Bob (Speakers Corner)', 'Bob Speakers Corner']),
  P('lady-logic', 'Lady Logic', ['Lady Logic', 'LadyLogic']),
  P('jay-smith', 'Jay Smith', ['Jay Smith', 'Dr. Jay Smith', 'Pfander', 'Pfander Centre']),
  P('gary-habermas', 'Gary Habermas', ['Gary Habermas', 'Dr. Gary Habermas']),
  P('gabriel-wissa', 'Fr. Gabriel Wissa', ['Fr. Gabriel Wissa', 'Gabriel Wissa', 'Father Gabriel Wissa']),
  P('titus-kennedy', 'Dr. Titus Kennedy', ['Dr. Titus Kennedy', 'Titus Kennedy']),
  P('christopher-yuan', 'Christopher Yuan', ['Christopher Yuan', 'Dr. Christopher Yuan']),
  P('capturing-christianity', 'Capturing Christianity', ['Capturing Christianity', 'Cameron Bertuzzi', 'Cameron Bertuzzi (Capturing Christianity)'], ['capturingchristianity'], ORG),
  P('william-lane-craig', 'William Lane Craig', ['William Lane Craig', 'Dr. William Lane Craig']),
  P('tytus-jones', 'Tytus Jones'),
  P('tim-stratton', 'Tim Stratton', ['Tim Stratton', 'Dr. Tim Stratton']),
  P('than-christopoulos', 'Than Christopoulos'),
  P('shanda-fulbright', 'Shanda Fulbright'),
  P('robert-gagnon', 'Robert Gagnon', ['Robert Gagnon', 'Dr. Robert Gagnon']),
  P('raymond-ibrahim', 'Raymond Ibrahim'),
  P('ramin-parsa', 'Ramin Parsa'),
  P('paul-copan', 'Paul Copan', ['Paul Copan', 'Dr. Paul Copan']),
  P('nicholas-bowling', 'Nicholas Bowling', ['Nicholas Bowling', 'Nick Bowling']),
  P('natasha-crain', 'Natasha Crain'),
  P('musa-madas-musa', 'Musa Madas Musa', ['Musa Madas Musa', 'Mus B Madas Musa']),
  P('martin-sedra', 'Martin Sedra'),
  P('mario-joseph', 'Mario Joseph'),
  P('mar-mari-emmanuel', 'Mar Mari Emmanuel', ['Mar Mari Emmanuel', 'Bishop Mar Mari Emmanuel']),
  P('lydia-mcgrew', 'Lydia McGrew', ['Lydia McGrew', 'Dr. Lydia McGrew']),
  P('josh-mcdowell', 'Josh McDowell'),
  P('john-lennox', 'John Lennox', ['John Lennox', 'Prof. John Lennox', 'Dr. John Lennox']),
  P('j-warner-wallace', 'J. Warner Wallace', ['J. Warner Wallace', 'Jim Wallace']),
  P('greg-koukl', 'Greg Koukl', ['Greg Koukl', 'Gregory Koukl']),
  P('glen-scrivener', 'Glen Scrivener'),
  P('joel-kramer', 'Joel Kramer'),
  P('allen-parr', 'Allen Parr'),
  P('harry-linsinbigler', 'Fr. Harry Linsinbigler', ['Fr. Harry Linsinbigler', 'Harry Linsinbigler', 'Father Harry Linsinbigler']),
  P('andrew-stephen-damick', 'Fr. Andrew Stephen Damick', ['Fr. Andrew Stephen Damick', 'Andrew Stephen Damick', 'Father Andrew Stephen Damick']),
  P('erez-soref', 'Dr. Erez Soref', ['Dr. Erez Soref', 'Erez Soref']),
  P('chip-bennett', 'Dr. Chip Bennett', ['Dr. Chip Bennett', 'Chip Bennett']),
  P('carmen-imes', 'Dr. Carmen Imes', ['Dr. Carmen Imes', 'Carmen Imes', 'Carmen Joy Imes']),
  P('dinesh-dsouza', "Dinesh D'Souza", ["Dinesh D'Souza", 'Dinesh D’Souza', 'Dinesh DSouza']),
  P('anthony-rogers', 'Anthony Rogers', ['Anthony Rogers', 'Pastor Anthony Rogers']),
  P('alisa-childers', 'Alisa Childers'),
  P('charlie-kirk', 'Charlie Kirk'),
  P('bart-ehrman', 'Bart Ehrman', ['Bart Ehrman', 'Dr. Bart Ehrman']),
  P('tom-holland', 'Tom Holland'),
  P('tobias', 'Tobias', ['Tobias', 'Tobias (Towards Jesus)']),
  P('thaddeus', 'Thaddeus', ['Thaddeus', 'Thaddeus (Towards Jesus)']),
  // In the pipeline registry, not (yet) credited in data.db; kept in sync so `speaker_slugs` resolves to names.
  P('bobby-finn', 'Bobby Finn'),
  P('christian-prince', 'Christian Prince', ['Christian Prince', 'CP'], ['christianprince1']),
  P('ancient-faith-ministries', 'Ancient Faith Ministries', ['Ancient Faith Ministries', 'Ancient Faith'], ['ancientfaithministries'], ORG),
  P('abdu-murray', 'Abdu Murray'),
  P('stephen-meyer', 'Stephen C. Meyer', ['Stephen C. Meyer', 'Stephen Meyer', 'Dr. Stephen Meyer']),
  P('hugh-ross', 'Hugh Ross', ['Hugh Ross', 'Dr. Hugh Ross']),
  P('sean-mcdowell', 'Sean McDowell', ['Sean McDowell', 'Dr. Sean McDowell']),
  P('gavin-ortlund', 'Gavin Ortlund', ['Gavin Ortlund', 'Dr. Gavin Ortlund', 'Truth Unites']),
  P('trent-horn', 'Trent Horn', ['Trent Horn', 'Counsel of Trent']),
  P('jimmy-akin', 'Jimmy Akin'),
  P('ruslan-kd', 'Ruslan KD', ['Ruslan KD', 'Ruslan']),
  P('golan-broshi', 'Dr. Golan Broshi', ['Dr. Golan Broshi', 'Golan Broshi']),
  P('mottel-baleston', 'Mottel Baleston'),
  P('yisca-harani', 'Yisca Harani'),
  P('evan-armatas', 'Fr. Evan Armatas', ['Fr. Evan Armatas', 'Evan Armatas', 'Father Evan Armatas']),
  P('josiah-trenham', 'Fr. Josiah Trenham', ['Fr. Josiah Trenham', 'Josiah Trenham', 'Father Josiah Trenham']),
  P('barnabas-powell', 'Fr. Barnabas Powell', ['Fr. Barnabas Powell', 'Barnabas Powell', 'Father Barnabas Powell']),
  P('moses-samaan', 'Fr. Moses Samaan', ['Fr. Moses Samaan', 'Moses Samaan', 'Father Moses Samaan']),
  P('lazarus-el-anthony', 'Fr. Lazarus El Anthony', ['Fr. Lazarus El Anthony', 'Lazarus El Anthony', 'Father Lazarus El Anthony']),
  P('zakaria-botros', 'Fr. Zakaria Botros', ['Fr. Zakaria Botros', 'Father Zakaria Botros', 'Zakaria Botros']),
  P('brother-rachid', 'Brother Rachid', ['Brother Rachid', 'Rachid']),
  P('rob-christian', 'Rob Christian'),
  P('david-pallmann', 'David Pallmann', ['David Pallmann', 'Faith Because of Reason']),
];

/**
 * The people who get a page (/apologists/<slug>). Order is for reading only; the index sorts itself.
 * Pages, the /apologists index and its filters, "first answer" verses, the credit links on verse
 * /videos tabs and the sitemap all come from this list; everyone else in APOLOGISTS is credited by
 * name, as plain text.
 *
 * To feature someone later: add `{ slug }` here (the slug must be in APOLOGISTS and in the pipeline
 * registry data_collection/common/apologists.json with the same name; the unit test checks both).
 * `includeSlugs` folds other registry people into this page: their clips count and appear here, and
 * their credit reads "<their name> · <this name>".
 * @type {{ slug: string, includeSlugs?: string[] }[]}
 */
export const FEATURED_APOLOGISTS = [
  { slug: 'sam-shamoun' },
  { slug: 'godlogic' },
  { slug: 'inspiringphilosophy' },
  { slug: 'david-wood' },
  { slug: 'frank-turek' },
  { slug: 'erik-manning' },
  // Vocab Malone: not featured (owner, Nov 2026). Credited as plain text.
  { slug: 'stuart-knechtle' },
  { slug: 'mike-winger' },
  { slug: 'wes-huff' },
  { slug: 'apostate-prophet' },
  { slug: 'al-fadi' },
  { slug: 'cliffe-knechtle' },
  { slug: 'one-for-israel', includeSlugs: ['seth-postell'] },
  { slug: 'nabeel-qureshi' },
  { slug: 'tim-barnett' },
  { slug: 'jeannie-constantinou' },
  { slug: 'jonathan-pageau' },
  { slug: 'coptic-orthodox-answers' },
  { slug: 'stephen-de-young' },
];

/** Labels that cannot be split mechanically: exact label → slugs. */
export const COMBINED_LABELS = {
  'Sam Shamoun & David Wood': ['sam-shamoun', 'david-wood'],
  'Michael Jones & Bobby Finn': ['inspiringphilosophy', 'bobby-finn'],
  'Stuart & Cliffe Knechtle': ['stuart-knechtle', 'cliffe-knechtle'],
  'David Wood (feat. Bart Ehrman)': ['david-wood', 'bart-ehrman'],
  'Christian Apologists (Compilation featuring David Wood and Sam Shamoun)': ['david-wood', 'sam-shamoun'],
};

/** Labels (or parts of a multi-speaker label) that do not name an apologist. */
export const EXCLUDED_LABELS = [
  'Unknown',
  'Unknown (Towards Jesus Panel)',
  'Christian Apologist',
  'Christian Apologist (via Vocab Malone)',
  'Ex-Muslim Apologist',
  // Uploader / panel names written as the speaker (pipeline re-labels these, plan §5)
  'Towards Jesus',
  'TowardsJesus',
  'Towards Jesus Panel',
  'Mike',
];

/** Registry slugs (pipeline `speaker_slugs`) that name no speaker: unknown, uploader/panel names. */
export const EXCLUDED_SLUGS = new Set(['unknown', 'towards-jesus']);

const EXCLUDED_PATTERNS = [/\bunknown\b/i, /^christian apologists?\b/i];

const norm = (s) => String(s || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();

export const APOLOGIST_BY_SLUG = new Map(APOLOGISTS.map((a) => [a.slug, a]));
const ALIAS_INDEX = new Map();
for (const a of APOLOGISTS) for (const alias of [a.name, ...a.aliases]) ALIAS_INDEX.set(norm(alias), a.slug);

/** Featured page slug → `{ slug, name, includeSlugs }`. */
export const FEATURED_BY_SLUG = new Map();
/** Any registry slug → the featured page that shows its clips (itself, or the page that includes it). */
const PAGE_OF = new Map();
// A typo here would render "undefined" credits on every verse page, so fail at import, not at render.
for (const f of FEATURED_APOLOGISTS) {
  const includeSlugs = f.includeSlugs || [];
  for (const s of [f.slug, ...includeSlugs]) {
    if (!APOLOGIST_BY_SLUG.has(s)) throw new Error(`[apologists] FEATURED_APOLOGISTS: "${s}" is not in APOLOGISTS (src/data/apologists.js)`);
    if (PAGE_OF.has(s)) throw new Error(`[apologists] FEATURED_APOLOGISTS: "${s}" is listed twice (featured or included)`);
    PAGE_OF.set(s, f.slug);
  }
  FEATURED_BY_SLUG.set(f.slug, { slug: f.slug, includeSlugs, name: APOLOGIST_BY_SLUG.get(f.slug).name });
}

/** The featured page slug that shows this person's clips, or null (no page: credited as plain text). */
export function pageSlugFor(slug) {
  return PAGE_OF.get(slug) || null;
}

const COMBINED_INDEX = new Map(Object.entries(COMBINED_LABELS).map(([k, v]) => [norm(k), v]));
const EXCLUDED_INDEX = new Set(EXCLUDED_LABELS.map(norm));

const SPLIT_RE = /\s*(?:&|\/|,|\band\b)\s*/i;

/** Lowercase, ASCII, hyphenated; drops honorifics. Used for names missing from the registry. */
export function slugifyName(name) {
  return String(name || '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/^(?:dr|fr|rev|prof)\.?\s+/i, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function channelKey(channelId) {
  return String(channelId || '').trim().replace(/^@/, '').toLowerCase();
}

export function channelUrl(key) {
  const ch = CHANNELS[key];
  return ch ? `https://www.youtube.com/@${ch.handle}` : null;
}

function isExcluded(label) {
  const n = norm(label);
  return !n || EXCLUDED_INDEX.has(n) || EXCLUDED_PATTERNS.some((re) => re.test(label));
}

/**
 * Resolve a raw `apologist_name` to the people it credits.
 * @param {string} raw
 * @returns {{ slug: string, name: string, registered: boolean }[]} empty when the label names nobody.
 */
export function resolveApologistLabel(raw) {
  const label = String(raw || '').replace(/\s+/g, ' ').trim();
  const n = norm(label);
  if (!n) return [];
  const out = [];
  const add = (slug, name, registered) => { if (!out.some((p) => p.slug === slug)) out.push({ slug, name, registered }); };
  const fromSlug = (slug) => add(slug, APOLOGIST_BY_SLUG.get(slug)?.name || slug, APOLOGIST_BY_SLUG.has(slug));

  if (COMBINED_INDEX.has(n)) { COMBINED_INDEX.get(n).forEach(fromSlug); return out; }
  if (ALIAS_INDEX.has(n)) { fromSlug(ALIAS_INDEX.get(n)); return out; }
  if (isExcluded(label)) return out;

  const parts = label.split(SPLIT_RE).map((p) => p.trim()).filter(Boolean);
  for (const part of parts.length > 1 ? parts : [label]) {
    const pn = norm(part);
    if (ALIAS_INDEX.has(pn)) fromSlug(ALIAS_INDEX.get(pn));
    else if (!isExcluded(part)) {
      const slug = slugifyName(part);
      if (slug) add(slug, part, false);
    }
  }
  return out;
}

/** "john-doe" → "John Doe": last-resort display name for a slug that is in neither registry copy nor label. */
function nameFromSlug(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Resolve the pipeline's `speaker_slugs` column (JSON array text) when present.
 * A slug missing from APOLOGISTS (e.g. a person the pipeline auto-added to its registry since this
 * file was last synced) is named from `label` (the row's `apologist_name`, which the pipeline writes
 * as the registry display names joined with " & "), else from the slug itself; never the raw slug.
 * @param {unknown} raw  column value
 * @param {string} [label]  the row's `apologist_name`
 * @returns {{ slug: string, name: string, registered: boolean }[] | null} null = column empty/unusable,
 *   so the caller falls back to `resolveApologistLabel(apologist_name)`.
 */
export function resolveSpeakerSlugs(raw, label = '') {
  if (raw === null || raw === undefined || raw === '') return null;
  let list;
  try { list = Array.isArray(raw) ? raw : JSON.parse(raw); } catch { return null; }
  if (!Array.isArray(list)) return null;
  const slugs = [...new Set(list.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean))];
  if (!slugs.length) return null;
  let labelNames = null; // slug → name from the label, computed only when needed
  const nameOf = (slug) => {
    const reg = APOLOGIST_BY_SLUG.get(slug);
    if (reg) return reg.name;
    labelNames ??= new Map(resolveApologistLabel(label).map((p) => [p.slug, p.name]));
    return labelNames.get(slug) || nameFromSlug(slug);
  };
  return slugs
    .filter((slug) => !EXCLUDED_SLUGS.has(slug) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    .map((slug) => ({ slug, name: nameOf(slug), registered: APOLOGIST_BY_SLUG.has(slug) }));
}
