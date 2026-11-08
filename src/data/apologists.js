/**
 * Apologist registry: who a clip is credited to, and which YouTube channels are theirs.
 *
 * Slugs and aliases agree with the shared pipeline registry `data_collection/common/apologists.json`
 * (fields there: slug, name, kind → type, aliases, own_channel_ids → channels), so this file can later
 * be generated from it. Shape:
 *   APOLOGISTS: [{ slug, name, type?, alternateName?, aliases: [], channels: [] }]
 *   CHANNELS:   { <channel key>: { name, handle } }   key = channel_id lowercased, without '@'
 *
 * Rules:
 * - `slug` is a PUBLIC URL (/apologists/<slug>). Never rename one without a 301 (CLOUDFLARE.md).
 * - `aliases` are the exact `shorts_metadata.apologist_name` strings (case-insensitive) that mean this
 *   person. Multi-speaker labels ("A & B", "A / B", "A, B", "A and B") are split and each part is
 *   resolved on its own; labels that cannot be split mechanically live in COMBINED_LABELS.
 * - `channels` are the person's OWN channels: the header button and "via <uploader>" (shown when the
 *   uploader is not one of them) both come from here.
 * - Labels that do not name an apologist (unknown, generic, uploader names, non-apologists) are in
 *   EXCLUDED_LABELS and get no page until the pipeline re-labels them.
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
  jonathanpageauclips: { name: 'Jonathan Pageau Clips', handle: 'JonathanPageauClips' },
  weshuff: { name: 'Wes Huff', handle: 'WesHuff' },
  oneforisrael: { name: 'ONE FOR ISRAEL', handle: 'ONEFORISRAEL' },
};

const P = (slug, name, aliases = [name], channels = [], extra = {}) => ({ slug, name, aliases, channels, ...extra });
const ORG = { type: 'Organization' };

/** Ordered roughly by clip count; order has no effect on the site. */
export const APOLOGISTS = [
  P('sam-shamoun', 'Sam Shamoun', ['Sam Shamoun'], ['shamounian']),
  P('david-wood', 'David Wood', ['David Wood'], ['apologeticsroadshow']),
  P('godlogic', 'GodLogic', ['GodLogic', 'GodLogic (Avery Austin)', 'GodLogic (Avery)', 'Avery (GodLogic)', 'Avery Austin (GodLogic)', 'Avery Austin'],
    ['godlogicapologetics', 'godlogic2.0'], { alternateName: 'Avery Austin' }),
  P('frank-turek', 'Frank Turek', ['Frank Turek', 'Dr. Frank Turek', 'CrossExamined', 'Cross Examined'], ['crossexamined']),
  P('inspiringphilosophy', 'InspiringPhilosophy',
    ['InspiringPhilosophy', 'Michael Jones', 'Michael Jones (InspiringPhilosophy)', 'Michael Jones (Inspiring Philosophy)', 'InspiringPhilosophy (Michael Jones)'],
    ['inspiringphilosophy'], { alternateName: 'Michael Jones' }),
  P('erik-manning', 'Erik Manning', ['Erik Manning', 'Erik Manning (Testify)', 'Erik Manning (Testify Apologetics)'], ['testifyapologetics']),
  P('vocab-malone', 'Vocab Malone', ['Vocab Malone'], ['vocabmalone']),
  P('stuart-knechtle', 'Stuart Knechtle', ['Stuart Knechtle'], ['givemeananswer']),
  P('mike-winger', 'Mike Winger', ['Mike Winger'], ['mikewinger']),
  P('cliffe-knechtle', 'Cliffe Knechtle', ['Cliffe Knechtle', 'Cliff Knechtle'], ['givemeananswer']),
  P('wes-huff', 'Wes Huff', ['Wes Huff', 'Wesley Huff'], ['weshuff']),
  P('al-fadi', 'Al Fadi', ['Al Fadi', 'Al Fadi (CIRA International)', 'CIRA International', 'Al-Fadi'], ['cirainternational']),
  P('one-for-israel', 'ONE FOR ISRAEL', ['ONE FOR ISRAEL', 'Pod for Israel'], ['oneforisrael'], ORG),
  P('tim-barnett', 'Tim Barnett', ['Tim Barnett'], ['redpenlogic']),
  P('jeannie-constantinou', 'Dr. Jeannie Constantinou', ['Dr. Jeannie Constantinou', 'Jeannie Constantinou']),
  P('nabeel-qureshi', 'Nabeel Qureshi'),
  P('jonathan-pageau', 'Jonathan Pageau', ['Jonathan Pageau'], ['jonathanpageauclips']),
  P('apostate-prophet', 'Apostate Prophet', ['Apostate Prophet', 'Apostate Prophet (Ridvan Aydemir)', 'Ridvan Aydemir (Apostate Prophet)', 'Ridvan Aydemir'],
    [], { alternateName: 'Ridvan Aydemir' }),
  P('coptic-orthodox-answers', 'Coptic Orthodox Answers', ['Coptic Orthodox Answers'], ['copticorthodoxanswers'], ORG),
  P('stephen-de-young', 'Fr. Stephen De Young', ['Fr. Stephen De Young', 'Stephen De Young']),
  P('lee-strobel', 'Lee Strobel'),
  P('bobby-conway', 'Bobby Conway'),
  P('mike-licona', 'Mike Licona', ['Mike Licona', 'Michael Licona']),
  P('melissa-dougherty', 'Melissa Dougherty'),
  P('tom-soroka', 'Fr. Tom Soroka'),
  P('anthony-mourad', 'Fr. Anthony Mourad'),
  P('seth-postell', 'Dr. Seth Postell', ['Dr. Seth Postell', 'Seth Postell', 'Seth Postell (ONE FOR ISRAEL)', 'Dr. Seth Postell (ONE FOR ISRAEL)']),
  P('bob-of-speakers-corner', 'Bob of Speakers Corner', ['Bob of Speakers Corner', 'Bob (Speakers Corner)']),
  P('lady-logic', 'Lady Logic', ['Lady Logic', 'LadyLogic']),
  P('jay-smith', 'Jay Smith'),
  P('gary-habermas', 'Gary Habermas'),
  P('gabriel-wissa', 'Fr. Gabriel Wissa'),
  P('titus-kennedy', 'Dr. Titus Kennedy', ['Dr. Titus Kennedy', 'Titus Kennedy']),
  P('christopher-yuan', 'Christopher Yuan'),
  P('capturing-christianity', 'Capturing Christianity', ['Capturing Christianity', 'Cameron Bertuzzi', 'Cameron Bertuzzi (Capturing Christianity)'], ['capturingchristianity'], ORG),
  P('william-lane-craig', 'William Lane Craig'),
  P('tytus-jones', 'Tytus Jones'),
  P('tim-stratton', 'Tim Stratton'),
  P('than-christopoulos', 'Than Christopoulos'),
  P('shanda-fulbright', 'Shanda Fulbright'),
  P('robert-gagnon', 'Robert Gagnon'),
  P('raymond-ibrahim', 'Raymond Ibrahim'),
  P('ramin-parsa', 'Ramin Parsa'),
  P('paul-copan', 'Paul Copan'),
  P('nicholas-bowling', 'Nicholas Bowling'),
  P('natasha-crain', 'Natasha Crain'),
  P('musa-madas-musa', 'Musa Madas Musa'),
  P('martin-sedra', 'Martin Sedra'),
  P('mario-joseph', 'Mario Joseph'),
  P('mar-mari-emmanuel', 'Mar Mari Emmanuel'),
  P('lydia-mcgrew', 'Lydia McGrew'),
  P('josh-mcdowell', 'Josh McDowell'),
  P('john-lennox', 'John Lennox'),
  P('j-warner-wallace', 'J. Warner Wallace'),
  P('greg-koukl', 'Greg Koukl'),
  P('glen-scrivener', 'Glen Scrivener'),
  P('joel-kramer', 'Joel Kramer'),
  P('allen-parr', 'Allen Parr'),
  P('harry-linsinbigler', 'Fr. Harry Linsinbigler'),
  P('andrew-stephen-damick', 'Fr. Andrew Stephen Damick'),
  P('erez-soref', 'Dr. Erez Soref'),
  P('chip-bennett', 'Dr. Chip Bennett'),
  P('carmen-imes', 'Dr. Carmen Imes'),
  P('dinesh-dsouza', "Dinesh D'Souza"),
  P('anthony-rogers', 'Anthony Rogers'),
  P('alisa-childers', 'Alisa Childers'),
  P('charlie-kirk', 'Charlie Kirk'),
];

/** Labels that cannot be split mechanically: exact label → slugs. */
export const COMBINED_LABELS = {
  'Sam Shamoun & David Wood': ['sam-shamoun', 'david-wood'],
  'Michael Jones & Bobby Finn': ['inspiringphilosophy'],
  'Stuart & Cliffe Knechtle': ['stuart-knechtle', 'cliffe-knechtle'],
  'David Wood (feat. Bart Ehrman)': ['david-wood'],
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
  'Tobias (Towards Jesus)',
  'Thaddeus (Towards Jesus)',
  'Mike',
  // Not apologists
  'Bart Ehrman',
  'Tom Holland',
];

/** Registry slugs (pipeline `speaker_slugs`) that get no page: uploaders, panels, non-apologists. */
export const EXCLUDED_SLUGS = new Set(['unknown', 'towards-jesus', 'tobias', 'thaddeus', 'bart-ehrman', 'tom-holland']);

const EXCLUDED_PATTERNS = [/\bunknown\b/i, /^christian apologists?\b/i];

const norm = (s) => String(s || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();

export const APOLOGIST_BY_SLUG = new Map(APOLOGISTS.map((a) => [a.slug, a]));
const ALIAS_INDEX = new Map();
for (const a of APOLOGISTS) for (const alias of [a.name, ...a.aliases]) ALIAS_INDEX.set(norm(alias), a.slug);
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

/**
 * Resolve the pipeline's `speaker_slugs` column (JSON array text) when present.
 * @returns {{ slug: string, name: string, registered: boolean }[] | null} null = column empty/unusable,
 *   so the caller falls back to `resolveApologistLabel(apologist_name)`.
 */
export function resolveSpeakerSlugs(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  let list;
  try { list = Array.isArray(raw) ? raw : JSON.parse(raw); } catch { return null; }
  if (!Array.isArray(list)) return null;
  const slugs = [...new Set(list.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean))];
  if (!slugs.length) return null;
  return slugs
    .filter((slug) => !EXCLUDED_SLUGS.has(slug) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    .map((slug) => ({ slug, name: APOLOGIST_BY_SLUG.get(slug)?.name || slug, registered: APOLOGIST_BY_SLUG.has(slug) }));
}
