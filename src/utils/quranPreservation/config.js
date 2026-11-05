/**
 * Presentation config for "How was the Qurʾān preserved?" (/discover/quran-preservation).
 *
 * COPY OVERRIDE LAYER (temporary). Reader-facing rewritten copy lives here, keyed by stable item id,
 * until the dataset (src/data/discover/islam/scripture/quran_preservation.json, read-only for the
 * UI) carries it. `<review>/quran-preservation/data_proposals.md` holds byte-identical text for the
 * data agent. Once the data absorbs it, delete the overrides wholesale (ITEMS[*].title/hook/
 * takeaway/classical/comparison, SECTIONS[*].question/dek, INTRO, CLOSING.reflection, quoteFixes)
 * and read the fields from the dataset instead.
 *
 * Rules the loader enforces at build time (src/utils/quranPreservation/model.js):
 *   - every `source` / `evidence` / `ref` / `from` path must resolve to a dataset node;
 *   - every item id sits in exactly one place (START_HERE or one SECTIONS entry);
 *   - every dataset stage, child and hadith is reachable from some item, section, INTRO or CLOSING
 *     (or listed in INTENTIONALLY_MERGED), so content can never be dropped silently;
 *   - every showcase `quote` / `arabic` excerpt appears verbatim in its source hadith;
 *   - every rendered hadith has a Sunnah.com URL and English text; `quoteFixes` are well formed
 *     (an Arabic fix has a `value` or `hide: true`; an `href` fix is a Sunnah.com URL; a label `ref`
 *     matches only this item's own evidence);
 *   - every image has `alt`, `credit` and its intrinsic `width` / `height`;
 *   - every `{placeholder}` in copy is a known count (`items`, `total`, `qiraatPairs`, `sanaaRows`).
 * Quotes, references, Arabic and variants always come from the dataset; the only exception is an
 * explicit `quoteFixes` entry (with a reason), used for quote-integrity fixes until the data is fixed.
 *
 * Dataset paths: `[5].children[0]`, `[2].hadiths[1]`, `[3].children[0].codices[2]` (JS-style).
 * Showcase parts: `{ text }` is our voice (tone-tested); `{ quote, ref }` / `{ arabic, ref }` are
 * verbatim excerpts of the hadith at `ref` (checked); `mark` highlights a substring.
 * `ref` is a hadith path, `quran:S:A`, or `item:<id>` (jumps to another item on this page).
 *
 * Copy is the Phase 2 language pass (`<review>/quran-preservation/copy.md` logs every change and
 * its source). Open questions are marked `// NOTE:`.
 */

import { QURAN_PRESERVATION_PATH } from '../routes.js';

/** Site base ('' at the root). Every internal href goes through BASE so a non-root BASE_URL works. */
export const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');
export const BASE_PATH = `${BASE}${QURAN_PRESERVATION_PATH}`;
export const OG_IMAGE = `${BASE}/media/quran_preservation/cover.jpg`;
export const DATE_PUBLISHED = '2026-10-22';
/** Bump on every substantive copy or evidence change (JSON-LD dateModified). */
export const DATE_MODIFIED = '2026-11-05';

/** Hadith nodes by name, so the item specs below read as sources rather than paths. */
const H = {
  bukhari5038: '[1].children[0].hadiths[0]',
  bukhari5037: '[1].children[0].hadiths[1]',
  muslim788a: '[1].children[0].hadiths[2]',
  bukhari5039: '[1].children[0].hadiths[3]',
  muslim790c: '[1].children[0].hadiths[4]',
  bukhari7550: '[1].children[1].hadiths[0]',
  bukhari4986: '[2].children[0].hadiths[0]',
  bukhari5003: '[2].hadiths[0]',
  bukhari3808: '[2].hadiths[1]',
  bukhari5004: '[2].hadiths[2]',
  bukhari4977: '[3].children[0].hadiths[0]',
  muslim1050dup: '[3].children[0].hadiths[1]',
  bukhari4987a: '[4].children[0].hadiths[0]',
  bukhari4987b: '[4].children[1].hadiths[0]',
  bukhari4987c: '[4].children[2].hadiths[0]',
  bukhari5005: '[4].children[3].hadiths[0]',
  muslim1452a: '[5].children[0].hadiths[0]',
  muslim1050: '[5].children[1].hadiths[0]',
  bukhari6829: '[5].children[2].hadiths[0]',
  muslim1698: '[5].children[2].hadiths[1]',
  bukhari6438: '[5].children[3].hadiths[0]',
  muslim629: '[5].children[4].hadiths[0]',
  bukhari4727: '[5].children[5].hadiths[0]',
  muslim208a: '[5].children[5].hadiths[1]',
  muslim824a: '[5].children[6].hadiths[0]',
};

export const LABELS = {
  back: 'Discover',
  onThisPage: 'On this page',
  startHere: 'Start here · Question 1',
  startHereOf: '1 of {total} · Question 1 · Start here',
  contextLine: '{n} of {total} · Question {q}',
  backToStart: 'Start here: {title}',
  copyLink: 'Copy link',
  appLinks: 'More on this in Ready Apologia',
  copyItemLink: 'Copy link to this item',
  copied: 'Link copied',
  next: 'Next',
  nextSources: 'Next: what the {total} texts show together',
  sources: 'What the sources say',
  moreSources: 'More sources ({n})',
  classical: 'The classical explanation',
  comparison: 'Comparing with the primary text',
  checkSources: 'Sources',
  checkIntro: 'Every report, verse and commentary cited on this page, grouped by library.',
  othersSaying: 'What others are saying',
  othersNote: 'Videos on the Bible’s own history. They are opinions, not part of the evidence on this page.',
  sanaaAbsent: 'Not in the erased text',
  sanaaStandard: 'Today’s text',
  sanaaLower: 'Ṣanʿāʾ erased text',
  verse: 'Verse',
  hafs: 'Ḥafṣ',
  warsh: 'Warsh',
  note: 'Note',
  named: 'Named',
  notNamed: '—',
  notNamedSr: 'Not named',
  name: 'Name',
  codex: 'Whose text',
  chapters: 'Sūrahs',
  readMore: 'More on this copy',
  excerptOf: 'excerpt {i} of {n}',
  seeItem: 'Item {n}',
};

/** Showcase captions (the "kind of evidence" line above each showcase). */
export const SHOWCASE_LABELS = {
  number_fan: 'Numbers in the report',
  versions: 'Wordings side by side',
  redline: 'Wording across versions',
  timeline: 'Step by step',
  bars: 'Counts',
  witnesses: 'In their own words',
  confrontation: 'Side by side',
  facts: 'What the report says',
};

/** Source groups in "Check the sources" (kinds come from hadithReliability/render.js `linkFor`). */
export const SOURCE_GROUPS = [
  { kind: 'sunnah', label: 'Hadith collections', note: 'Opens Sunnah.com' },
  { kind: 'quran', label: 'Qurʾān', note: 'Opens Tafsir al-Ṭabarī on this site' },
  { kind: 'classical', label: 'Classical commentaries', note: 'Opens IslamWeb and other libraries' },
  { kind: 'other', label: 'Other references', note: '' },
];

export const SEO = {
  // NOTE: title and description need user sign-off (JETSKI rule 5).
  title: 'How Was the Qurʾān Preserved? {items} Texts From Bukhārī, Muslim and Ṣanʿāʾ',
  description: 'Bukhārī and Muslim record verses Companions recited that are not in today’s written Qurʾān. {items} texts, with Ḥafṣ, Warsh and Ṣanʿāʾ, each linked to its source.',
  keywords: 'quran preservation, has the quran been changed, uthman quran compilation, suckling verse muslim 1452, stoning verse umar, ibn masud muawwidhatayn, ubayy ibn kab, abrogation naskh, qiraat hafs warsh, sanaa palimpsest',
  breadcrumb: 'Qurʾān preservation',
};

/**
 * Discover card copy for src/data/discoverCatalog.json (slug "quran-preservation"). Not rendered by
 * this page; it feeds data_proposals.md. NOTE: needs user sign-off with SEO.
 */
export const CATALOG = {
  title: 'How Was the Qurʾān Preserved? 18 Texts to Check',
  description: 'Bukhārī and Muslim record Companions reciting verses not in today’s written Qurʾān and readings that differ from it. 18 texts, each linked to its source.',
};

export const INTRO = {
  source: ['[0]'],
  h1: 'How was the Qurʾān preserved?',
  // Markdown; {items} is filled from the counts.
  text: 'Muslims hold that the Qurʾān has been preserved letter for letter since it was revealed ([15:9](/quran/15/9/tafsir/tabari)). Bukhārī and Muslim, the collections they trust most after the Qurʾān, record Companions describing verses that are not in today’s written Qurʾān (*muṣḥaf*), readings that differ from it, and how the text was collected and copied. These are those texts, with the two readings most printed today and an early manuscript from Ṣanʿāʾ in Yemen, each linked to its source. Two standard commentaries appear throughout: al-Nawawī’s (d. 676/1277, author of the *Forty Hadith*) on Ṣaḥīḥ Muslim (*Sharḥ Muslim*), and Ibn Ḥajar’s (d. 852/1449) on Ṣaḥīḥ al-Bukhārī (*Fatḥ al-Bārī*).',
};

export const SUMMARY = {
  id: 'what-they-show',
  title: 'What the {items} texts show together',
  text: 'The opening claim is that the Qurʾān has been kept letter for letter since it was revealed ([15:9](/quran/15/9/tafsir/tabari)). Across these {items} texts, Bukhārī and Muslim record verses and sūrahs Companions say were recited until or at the Prophet’s death that are not in today’s *muṣḥaf* ([items 1](/discover/quran-preservation#aisha-suckling-verse)–[5](/discover/quran-preservation#naskh-recitation-removed)), wordings that named Companions swore to or dictated into their own copies ([items 6](/discover/quran-preservation#aisha-afternoon-prayer)–[10](/discover/quran-preservation#ibn-abbas-18-79)), and disagreements among the four teachers the Prophet chose ([items 11](/discover/quran-preservation#ibn-masud-muawwidhatayn)–[13](/discover/quran-preservation#readers-lists)). They then record a collection after battle losses, a verse found with one man, a standardisation that burned other whole copies, and verses brought back to the Prophet’s memory by another man’s recitation ([items 14](/discover/quran-preservation#uthman-copies)–[16](/discover/quran-preservation#prophet-reminded-of-verses)). Finally, today’s printed readings differ in letters, dots and words whose disputed points rest on single chains or a transmitter Bukhārī and Muslim rejected in hadith, while the erased text of the Ṣanʿāʾ manuscript differs by whole words ([items 17](/discover/quran-preservation#hafs-warsh-readings)–[18](/discover/quran-preservation#sanaa-lower-text)).',
};

/** Rendered once, in full, before the first section (no section number). */
export const START_HERE = 'aisha-suckling-verse';

/** Reader-question sections, in reading order. Ordering lives here only. */
export const SECTIONS = [
  {
    id: 'verses-not-in-todays-quran',
    source: ['[5]'],
    question: 'Did the Companions recite verses that are not in today’s Qurʾān?',
    dek: { text: 'Companions in Bukhārī and Muslim describe verses and sūrahs they recited as Qurʾān that today’s written Qurʾān (*muṣḥaf*) does not contain. Classical scholars explain them as abrogated, that is, withdrawn by Allah (*naskh*).' },
    backLinkToStart: true,
    items: ['umar-stoning-verse', 'abu-musa-two-surahs', 'ubayy-valley-of-gold', 'naskh-recitation-removed'],
  },
  {
    id: 'same-words',
    source: [],
    question: 'Did the Companions recite the same words in the same verse?',
    dek: { text: 'In five reports in Bukhārī and Muslim, Companions recite a verse in words that differ from today’s written Qurʾān, or from each other.' },
    items: ['aisha-afternoon-prayer', 'abu-darda-92-3', 'muslim-26-214', 'umar-hisham-furqan', 'ibn-abbas-18-79'],
  },
  {
    id: 'named-teachers',
    source: ['[3]'],
    question: 'Did the teachers the Prophet named recite the same Qurʾān?',
    dek: { quote: 'Learn the recitation of Qur\'an from four: from Abdullah bin Masʿud -- he started with him--Salim, the freed slave of Abu Hudaifa, Muʿadh bin Jabal and Ubai bin Kaʿb.', ref: H.bukhari3808 },
    items: ['ibn-masud-muawwidhatayn', 'ubayy-left-out', 'readers-lists'],
  },
  {
    id: 'one-book',
    source: ['[1]', '[4]'],
    question: 'How did the Qurʾān become one book?',
    dek: { text: 'Bukhārī and Muslim record the first collection under Abū Bakr, the copies sent out under ʿUthmān, and verses the Prophet was reminded of by a man’s recitation.' },
    items: ['uthman-copies', 'abu-khuzaima-last-verses', 'prophet-reminded-of-verses'],
  },
  {
    id: 'readings-and-manuscripts',
    source: [],
    question: 'What do today’s printed readings and the earliest manuscripts show?',
    dek: { text: 'Ḥafṣ and Warsh, the two standard readings (*qirāʾāt*) most printed today, differ by a letter, a dot, a vowel or a word in the twenty verses compared; the erased first text of an early manuscript from Ṣanʿāʾ in Yemen differs from today’s written Qurʾān in the three passages quoted.' },
    items: ['hafs-warsh-readings', 'sanaa-lower-text'],
  },
];

/** Exact dataset category names → reader-facing labels (an unmapped category fails the build). */
export const QIRAAT_CATEGORY_LABELS = {
  'Extra Words': 'An extra word',
  'Graphical / Basic Letter Differences': 'A different letter',
  'Diacritical Differences (Missing/Moved Dots)': 'Different dots on the same letters',
  'Vowel Differences (Tashkil)': 'Different vowels',
};

export const ITEMS = {
  'aisha-suckling-verse': {
    source: ['[5].children[0]'],
    title: 'ʿĀʾishah’s Report of 10, Then 5 Sucklings, Recited When the Prophet Died',
    hook: 'In Islamic law, nursing a child creates milk kinship (*raḍāʿah*) that makes marriage unlawful, as blood kinship does. In Ṣaḥīḥ Muslim, ʿĀʾishah reports a verse of ten sucklings, replaced by five, and says the five were still recited as Qurʾān when the Prophet died. Today’s written Qurʾān has no such verse.',
    takeaway: 'Her clause places the five among what was recited at the Prophet’s death; al-Nawawī reads it as a late abrogation, while al-Ṭaḥāwī (author of *al-ʿAqīda al-Ṭaḥāwiyya*) and al-Sarakhsī reject the clause as a narrator’s mistake.',
    showcase: {
      type: 'number_fan',
      unit: { text: 'Nursings that establish milk kinship (raḍāʿah) and make marriage unlawful, as ʿĀʾishah reports it' },
      items: [
        { value: '10', text: 'first revealed', ref: H.muslim1452a, evidence: 1 },
        { value: '5', text: 'replaced the ten', ref: H.muslim1452a, evidence: 1 },
        { value: '0', text: 'number given in today’s written Qurʾān (4:23 forbids nursing kin, with no number)', ref: 'quran:4:23' },
      ],
      note: [
        { arabic: 'فَتُوُفِّيَ رَسُولُ اللَّهِ صلى الله عليه وسلم وَهُنَّ فِيمَا يُقْرَأُ مِنَ الْقُرْآنِ', ref: H.muslim1452a },
        { quote: 'Allah\'s Apostle (ﷺ) died and it was before that time (found) in the Holy Qur\'an (and recited by the Muslims).', ref: H.muslim1452a },
        { text: 'Literally: “and they were among what was recited of the Qurʾān.” “Before that time” is the translator’s addition.' },
      ],
    },
    classical: 'Classical jurists agree that nothing of the Qurʾān could be abrogated after the Prophet’s death ([the Ḥanafī jurist al-Sarakhsī, Uṣūl 2/78](https://shamela.ws/book/6301/449)). Al-Nawawī classes the five sucklings as a verse whose recitation was abrogated while its ruling was kept, and reads ʿĀʾishah’s closing clause to mean that this abrogation “came very late, so when the Prophet died some people still recited ‘five sucklings’ as Qurʾān because news of the abrogation had not reached them; when it did, they stopped and agreed it is not recited” ([Sharḥ Muslim 10/24–25, IslamWeb 53/4327](https://www.islamweb.net/ar/library/content/53/4327/)). The Shāfiʿī scholars al-Bayhaqī and al-Zarkashī read it the same way. Al-Ṭaḥāwī and al-Sarakhsī applied the rule against post-prophetic abrogation the other way: al-Ṭaḥāwī held the closing clause to be a narrator’s mistake (*wahm*), noting that other chains from ʿĀʾishah lack it ([Sharḥ Mushkil al-Āthār, IslamWeb 1002/333](https://www.islamweb.net/ar/library/content/1002/333/); [Muslim 1452b](https://sunnah.com/muslim:1452b)), and al-Sarakhsī concluded that the report is “anomalous” (*shādhdh*) and “hardly sound” (*lā yakādu yaṣiḥḥ*, [Uṣūl 2/79–80](https://shamela.ws/book/6301/450)).',
    comparison: 'Three premises meet in this report: (1) Muslim jurists agree that no verse of the Qurʾān could be abrogated after the Prophet’s death ([al-Sarakhsī, Uṣūl 2/78](https://shamela.ws/book/6301/449)); (2) ʿĀʾishah says that when the Prophet died the five sucklings “were among what is recited of the Qurʾān” ([Muslim 1452a](https://sunnah.com/muslim:1452a)); (3) today’s written Qurʾān (*muṣḥaf*) does not contain the verse. To keep the first premise and today’s muṣḥaf, al-Nawawī posits a late abrogation and news of it spreading after the Prophet’s death, though no report records either ([Sharḥ Muslim 53/4327](https://www.islamweb.net/ar/library/content/53/4327/)), while al-Ṭaḥāwī and al-Sarakhsī fault the narrator in a chain Muslim placed in his Ṣaḥīḥ.\n\nʿĀʾishah reports both the revelation of the ten and their replacement by the five herself, and the Prophet died in her house, on her day, with his head on her chest ([Bukhārī 4450](https://sunnah.com/bukhari:4450)). If one asks why she did not press ʿUthmān to write the five in his muṣḥaf during the decades she lived after him, this report itself is her testimony after the Prophet’s death; in Mālik’s *Muwaṭṭaʾ* ([30/12](https://sunnah.com/malik/30/12); [Fatḥ al-Bārī 52/9328](https://www.islamweb.net/ar/library/content/52/9328/)) she continued to apply the five-nursing rule (following the Prophet’s ruling for Sālim in the same report, while [30/7](https://sunnah.com/malik/30/7) has her send Sālim ibn ʿAbdullāh for ten and Mālik adds in [30/18](https://sunnah.com/malik/30/18) that Medina did not act on it), and in [Item 6](/discover/quran-preservation#aisha-afternoon-prayer) ([Muslim 629](https://sunnah.com/muslim:629)) she dictates her own muṣḥaf with a wording not in ʿUthmān’s copy. The hadith critic al-Dhahabī counts 2,210 hadith in her collection, 174 of them in both Bukhārī and Muslim ([Siyar 2/139](https://www.islamweb.net/ar/library/content/60/143/)).\n\nShe names the abrogation of the ten (*thumma nusikhna*) and gives no sign that the five were removed. Either the five were recited as Qurʾān when he died, as she says, and are not in today’s muṣḥaf; or a sound chain from ʿĀʾishah in Ṣaḥīḥ Muslim must be read against her plain words or set aside as a narrator’s mistake whenever it conflicts with the muṣḥaf—a test that reaches the 2,210 other hadith resting on her memory. Her words: “the Messenger of Allah died and they were among what is recited of the Qurʾān” (*fa-tuwuffiya rasūlu llāhi ﷺ wa-hunna fīmā yuqraʾu mina l-qurʾān*).',
    appLinks: [
      { label: 'The suckling verse among the Qurʾān’s lost verses', href: '/quran/0#codex-lost-suckling-aisha' },
      { label: 'ʿĀʾishah’s copy: its readings and the verses she reported', href: '/quran/codex/aisha' },
    ],
  },

  'ibn-masud-muawwidhatayn': {
    source: ['[3].children[0]', '[3].children[0].codices[0]', '[3].children[0].codices[1]'],
    evidence: [H.bukhari4977],
    title: 'Ibn Masʿūd’s View of Sūrahs 113 and 114, Put to Ubayy ibn Kaʿb',
    hook: 'The Prophet named four men to learn the Qurʾān from, ʿAbdullāh ibn Masʿūd first and Ubayy ibn Kaʿb among them (Bukhārī 3808). These two differed over the last two sūrahs, al-Falaq and al-Nās; if teachers the Prophet chose differed over what belongs in the Qurʾān, the claim that it was kept letter for letter has to account for that.',
    takeaway: 'Bukhārī 4977 gives Ibn Masʿūd’s words as “so-and-so”; the reports that Ibn Ḥajar calls authentic have him erase the two sūrahs and say “they are not from Allah’s Book”.',
    showcase: {
      type: 'confrontation',
      left: {
        title: { text: 'Ibn Masʿūd, as reported to Ubayy' },
        items: [
          { quote: 'Your brother, Ibn Masʿud said so-and-so (i.e., the two Mu\'awwidhat do not belong to the Qur\'an).', ref: H.bukhari4977 },
          { arabic: 'إِنَّ أَخَاكَ ابْنَ مَسْعُودٍ يَقُولُ كَذَا وَكَذَا', ref: H.bukhari4977 },
        ],
      },
      right: {
        title: { text: 'Ubayy ibn Kaʿb' },
        items: [
          { quote: 'I asked Allah\'s Messenger about them, and he said, \'They have been revealed to me, and I have recited them (as a part of the Qur\'an)...', ref: H.bukhari4977 },
        ],
      },
      note: [
        { text: '“So-and-so” translates the Arabic *kadhā wa-kadhā*; the words in brackets are the translator’s, and “the two Mu’awwidhat” are the two refuge sūrahs, al-Falaq and al-Nās (113 and 114). The version in the hadith collection of Imam Aḥmad (*Musnad Aḥmad*) reads “your brother erases them from the written copy (*muṣḥaf*)” (cited by Ibn Ḥajar).' },
      ],
    },
    tables: [
      {
        builder: 'codices', from: '[3].children[0]', title: 'Today’s written Qurʾān beside what the reports say of two Companions',
        overrides: {
          0: { owner: 'Today’s written Qurʾān (ʿUthmān’s copies)', chapter_count: '114 sūrahs' },
          1: { owner: 'Ibn Masʿūd’s copy', chapter_count: 'Without sūrahs 113 and 114, as Musnad Aḥmad and al-Ṭabarānī report; Bukhārī 4977 gives his words as “so-and-so”' },
          2: { owner: 'Abū Mūsā al-Ashʿarī (no copy is described)', chapter_count: 'Two further sūrahs “we used to recite”, which he says he was made to forget (Muslim 1050)', link: 'item:abu-musa-two-surahs' },
        },
      },
    ],
    classical: 'In *Fatḥ al-Bārī*, his commentary on Bukhārī, Ibn Ḥajar cites reports in Imam Aḥmad’s *Musnad* and in al-Ṭabarānī: Ibn Masʿūd “used to erase the two refuge sūrahs from his written copies (*muṣḥafs*) and say they are not from Allah’s Book”. Al-Bazzār, in a report Ibn Ḥajar also cites, gives his reason, that the Prophet “was commanded to seek refuge with them”, and adds that no Companion followed him and that the Prophet recited them in prayer. Al-Bāqillānī, a leading Ashʿarī theologian who wrote a defence of the Qurʾān’s transmission, read it as a refusal to write them in the written Qurʾān (*muṣḥaf*), not a denial that they are Qurʾān. Al-Nawawī and the Andalusian jurist Ibn Ḥazm dismissed the report as false; Ibn Ḥajar answered, “the report is authentic; the interpretation is open” ([Fatḥ al-Bārī, IslamWeb 52/9097](https://www.islamweb.net/ar/library/content/52/9097/), [Fatḥ al-Bārī 52/9098](https://www.islamweb.net/ar/library/content/52/9098/)).',
    comparison: 'Al-Bāqillānī’s reading needs Ibn Masʿūd to have held the two sūrahs to be Qurʾān and to have left them out of his muṣḥaf because, “it seems”, the Prophet’s permission to write them had not reached him. No report quotes Ibn Masʿūd saying so; al-Bāqillānī offers it to reconcile the report with the muṣḥaf. Ibn Ḥajar calls it a good interpretation, “except that the authentic, explicit report… repels it”, unless “Allah’s Book” there means the written copy ([Fatḥ al-Bārī 52/9098](https://www.islamweb.net/ar/library/content/52/9098/)).\n\nIbn Masʿūd is the first of the four teachers the Prophet named ([Bukhārī 3808](https://sunnah.com/bukhari:3808): “he started with him”), he says he took over seventy sūrahs directly from the Prophet’s mouth ([Bukhārī 5000](https://sunnah.com/bukhari:5000)), and Ubayy is among the four too. That other Companions did not follow him is the point at issue: the disagreement is between teachers the Prophet himself named.\n\nEither the teacher the Prophet named first held that two sūrahs of today’s muṣḥaf were not from Allah’s Book; or his words “they are not from Allah’s Book” mean the written copy, on a permission no report records (al-Bāqillānī), or the reports Ibn Ḥajar calls authentic misreport him (al-Nawawī, Ibn Ḥazm). Ubayy, asked about it, answered with the Prophet’s words: “They have been revealed to me, and I have recited them.”',
    appLinks: [
      { label: 'Ibn Masʿūd’s copy: its readings and the sūrahs it lacked', href: '/quran/codex/abdullah-bin-masud' },
      { label: 'Sūrahs 113 and 114 in Ibn Masʿūd’s copy', href: '/quran/0#codex-113-114-0-abdullah-bin-masud' },
    ],
  },

  'ubayy-left-out': {
    source: ['[4].children[3]'],
    title: 'ʿUmar Calls Ubayy the Best Reciter and Leaves Some of His Recitation, Citing 2:106',
    hook: 'Allah told the Prophet to recite the Qurʾān to Ubayy ibn Kaʿb by name (Bukhārī 4959), and ʿUmar called him the best reciter among them. In Bukhārī, ʿUmar says they leave some of what Ubayy recites, though Ubayy says he took it from the Prophet’s mouth, so recitation from a teacher the Prophet chose was set aside.',
    takeaway: 'ʿUmar’s reason, at the end of Bukhārī 5005, is 2:106, on verses abrogated or caused to be forgotten; the report does not name the words set aside.',
    showcase: {
      type: 'witnesses',
      items: [
        { who: 'ʿUmar ibn al-Khaṭṭāb', quote: 'Ubayy was the best of us in the recitation (of the Qur\'an) yet we leave some of what he recites.', ref: H.bukhari5005 },
        { who: 'Ubayy ibn Kaʿb', quote: 'I have taken it from the mouth of Allah\'s Messenger (ﷺ) and will not leave for anything whatever.', ref: H.bukhari5005 },
        { who: 'ʿUmar, citing Qurʾān 2:106 at the end of the same report', quote: 'None of Our Revelations do We abrogate or cause to be forgotten but We substitute something better or similar.', ref: H.bukhari5005 },
      ],
    },
    quoteFixes: [
      { ref: H.bukhari5005, field: 'arabic', value: 'قَالَ عُمَرُ أُبَىٌّ أَقْرَؤُنَا وَإِنَّا لَنَدَعُ مِنْ لَحَنِ أُبَىٍّ، وَأُبَىٌّ يَقُولُ أَخَذْتُهُ مِنْ فِي رَسُولِ اللَّهِ صلى الله عليه وسلم فَلاَ أَتْرُكُهُ لِشَىْءٍ قَالَ اللَّهُ تَعَالَى ‏{‏مَا نَنْسَخْ مِنْ آيَةٍ أَوْ نَنْسَأْهَا نَأْتِ بِخَيْرٍ مِنْهَا أَوْ مِثْلِهَا‏}‏', reason: 'The dataset prints the Arabic of Bukhārī 4481, not 5005 (factcheck §1, Bukhārī 5005); replaced with 5005\'s Arabic (matn) from the fawazahmed0/hadith-api mirror of Sunnah.com (ara-bukhari 5005).', sourceUrl: 'https://sunnah.com/bukhari:5005' },
      {
        ref: H.bukhari5005, field: 'english',
        replace: [
          [' yet we leave out some of what he recites.', ' yet we leave some of what he recites.'],
          ['will not leave it for anything whatever.\'', 'will not leave for anything whatever.\' But Allah said \'None of Our Revelations do We abrogate or cause to be forgotten but We substitute something better or similar.\''],
        ],
        reason: 'The dataset adds "out" and "it" and drops the report\'s last sentence, where ʿUmar cites 2:106; restored to the Sunnah.com English quoted in factcheck §1 (Bukhārī 5005).',
        sourceUrl: 'https://sunnah.com/bukhari:5005',
      },
    ],
    classical: 'Ibn Ḥajar (*Fatḥ al-Bārī*) explains that Ubayy kept what he had heard from the Prophet when others told him its recitation had been abrogated, that is, withdrawn by Allah, “and ʿUmar argued against him with the verse showing abrogation” ([Fatḥ al-Bārī, IslamWeb 52/9149](https://www.islamweb.net/ar/library/content/52/9149/)). Ibn Sīrīn reports that Ubayy was later one of the twelve men ʿUthmān gathered to copy the written Qurʾān (*muṣḥaf*) ([Fatḥ al-Bārī 52/9115](https://www.islamweb.net/ar/library/content/52/9115/)).',
    comparison: 'Ibn Ḥajar’s reading needs the parts ʿUmar left to have been abrogated, and Ubayy to have kept them against the news because he had heard them from the Prophet himself ([Fatḥ al-Bārī 52/9149](https://www.islamweb.net/ar/library/content/52/9149/)). ʿUmar cites [quran/2/106], which speaks of abrogation in general; neither the report nor Ibn Ḥajar names the words that were abrogated or a report of their abrogation. Ubayy is one of the four teachers the Prophet named ([Bukhārī 3808](https://sunnah.com/bukhari:3808)), the man Allah told the Prophet to recite to ([Bukhārī 4959](https://sunnah.com/bukhari:4959)), and ʿUmar calls him “the best of us in the recitation”. Either the Prophet’s own named teacher held on to recitation that had been abrogated, or ʿUmar set aside recitation that Ubayy took from the Prophet. Ubayy: “I have taken it from the mouth of Allah\'s Messenger (ﷺ) and will not leave for anything whatever.”',
    appLinks: [
      { label: 'Ubayy ibn Kaʿb’s copy: its readings and verses', href: '/quran/codex/ubayy-bin-kab' },
    ],
  },

  'readers-lists': {
    source: ['[2]'],
    evidence: [H.bukhari3808, H.bukhari5003, H.bukhari5004],
    // NOTE: display names in the page's transliteration; keys are the dataset's readers_table cells.
    extra: {
      readerNames: {
        "Abdullah bin Mas'ud": 'ʿAbd Allāh ibn Masʿūd',
        'Salim, freed slave': 'Sālim, freed slave of Abū Ḥudhayfah',
        "Mu'adh bin Jabal": 'Muʿādh ibn Jabal',
        "Ubai bin Ka'b": 'Ubayy ibn Kaʿb',
        'Zaid bin Thabit': 'Zayd ibn Thābit',
        'Abu Zaid': 'Abū Zayd',
        "Abu Ad-Darda'": 'Abū al-Dardāʾ',
      },
    },
    title: '3 Lists in Bukhārī of Who Taught or Collected the Qurʾān: 7 Names, 1 on All 3',
    hook: 'Popular presentations often say hundreds of Companions had memorised the entire Qurʾān when the Prophet died. Bukhārī records three lists of the men to learn the Qurʾān from, or who had collected (learned the whole of) it: one in the Prophet’s words, two from Anas, his servant for ten years (Bukhārī 6038). The lists differ, and the Prophet’s own list leaves out Zayd ibn Thābit, the man who later compiled the Qurʾān.',
    takeaway: 'Muʿādh ibn Jabal is the one name on all three lists; Anas’s two lists (5003, 5004) differ by one name, Ubayy in one and Abū al-Dardāʾ in the other.',
    showcase: { type: 'bars', builder: 'readers', from: '[2]', unit: { text: 'Named in how many of the 3 lists' }, note: [{ text: 'Bukhārī 3808 gives the Prophet’s words; 5003 and 5004 give Anas’s.' }] },
    tables: [{ builder: 'readers', from: '[2]', title: 'Who is named in each list' }],
    classical: 'On Anas’s “four”, Ibn Ḥajar (*Fatḥ al-Bārī*) reports the view of al-Māzarī, a Mālikī jurist who wrote an early commentary on Ṣaḥīḥ Muslim, that Anas’s words do not establish that no one else had collected the Qurʾān, and the answer of the Ashʿarī theologian al-Bāqillānī that the number “is not restrictive” ([Fatḥ al-Bārī, IslamWeb 52/9146](https://www.islamweb.net/ar/library/content/52/9146/)).',
    comparison: 'Al-Māzarī’s reading needs Anas’s “none… but four” to mean “none that I know of”: he asks how Anas could know, “with the Companions so many and scattered in the lands”, and Ibn Ḥajar adds that a number of imams found the restrictive wording objectionable ([Fatḥ al-Bārī 52/9146](https://www.islamweb.net/ar/library/content/52/9146/)). That is a reason, not a report; no report has Anas qualify his words. Anas served the Prophet for ten years ([Bukhārī 6038](https://sunnah.com/bukhari:6038)), and when Qatādah asks him in [Bukhārī 3810](https://sunnah.com/bukhari:3810) who “Abū Zayd” on his list is, Anas says “one of my uncles”—a man over whose name and identity later scholars differed ([Fatḥ al-Bārī 52/9146](https://www.islamweb.net/ar/library/content/52/9146/)).\n\nEither Anas’s restriction stands as he said it—four men, not hundreds—while leaving out Ibn Masʿūd and Sālim from the Prophet’s own list ([Bukhārī 3808](https://sunnah.com/bukhari:3808)) and differing between his two reports ([Bukhārī 5003](https://sunnah.com/bukhari:5003), [Bukhārī 5004](https://sunnah.com/bukhari:5004)) on the fourth name; or his count is incomplete, while the Prophet’s list of four teachers still leaves out Zayd ibn Thābit, who compiled the text under Abū Bakr and ʿUthmān. Anas in 5004: “none had collected the Qur\'an but four persons” (*lam yajmaʿi l-qurʾāna ghayru arbaʿatin*).',
  },

  'umar-stoning-verse': {
    source: ['[5].children[2]'],
    title: '2 Texts on Stoning and “the Book of Allah”: ʿUmar in Bukhārī, the Prophet in Muslim',
    hook: 'In Bukhārī, ʿUmar fears that people will one day say they do not find the stoning verse in the Book of Allah; in Muslim, the Prophet judges “according to the Book of Allah” and orders stoning. A verse ʿUmar says was revealed and recited is not in today’s written Qurʾān.',
    takeaway: 'Al-Nawawī classes it as a verse whose words were withdrawn while its rule stays; in Bukhārī 6830 and Abū Dāwūd 4418 ʿUmar says it was revealed, recited and memorised, and that he would have written it.',
    showcase: {
      type: 'confrontation',
      left: {
        title: { text: 'ʿUmar, Bukhārī 6829' },
        items: [
          { quote: 'I am afraid that after a long time has passed, people may say, "We do not find the Verses of the Rajam (stoning to death) in the Holy Book,"', ref: H.bukhari6829 },
          { arabic: 'لاَ نَجِدُ الرَّجْمَ فِي كِتَابِ اللَّهِ', ref: H.bukhari6829 },
        ],
      },
      right: {
        title: { text: 'The Prophet, Muslim 1698' },
        items: [
          { quote: 'I will decide between you according to the Book of Allah', ref: H.muslim1698 },
          { quote: 'if she makes a confession, then stone her', ref: H.muslim1698 },
        ],
      },
      note: [{ text: 'In [Bukhārī 6830](https://sunnah.com/bukhari:6830) ʿUmar adds: “among what Allah revealed, was the Verse of the Rajam… we did recite this Verse and understood and memorized it.” Al-Nawawī lists several meanings of “the Book of Allah” in Muslim 1698: Allah’s ruling, a pointer to [quran/4/15], or the stoning verse, “whose recitation was abrogated and ruling kept” ([Sharḥ Muslim 53/5212](https://www.islamweb.net/ar/library/content/53/5212/)).' }],
    },
    quoteFixes: [
      { ref: H.bukhari6829, field: 'arabic', value: 'لَقَدْ خَشِيتُ أَنْ يَطُولَ بِالنَّاسِ زَمَانٌ حَتَّى يَقُولَ قَائِلٌ لاَ نَجِدُ الرَّجْمَ فِي كِتَابِ اللَّهِ', reason: 'The dataset\'s Arabic blends several narrations; this is 6829\'s wording (factcheck §1, Bukhārī 6829).', sourceUrl: 'https://sunnah.com/bukhari:6829' },
      { ref: H.muslim1698, field: 'english', strip: 'brackets', reason: 'The bracketed sentence "[Proving stoning was in the Book of Allah itself]" is our commentary, not the source (factcheck §1, Muslim 1698).', sourceUrl: 'https://www.islamweb.net/ar/library/content/53/5212/' },
    ],
    classical: 'Al-Nawawī classes the stoning verse as recitation abrogated while its ruling is kept ([Sharḥ Muslim, IslamWeb 53/4327](https://www.islamweb.net/ar/library/content/53/4327/)). On the Prophet’s “I will decide between you according to the Book of Allah” he gives “Allah’s ruling” as the first meaning ([53/5212](https://www.islamweb.net/ar/library/content/53/5212/)); the same judgment orders a hundred lashes (which [24:2](/quran/24/2/tafsir/tabari) prescribes) together with a year’s exile for the unmarried young man, and the year’s exile is not in the Qurʾān ([Bukhārī 2695](https://sunnah.com/bukhari:2695)).',
    comparison: 'The classical category needs the stoning verse to have been withdrawn from recitation by Allah while its ruling stayed. Al-Nawawī gives it as an example of that category ([Sharḥ Muslim 53/4327](https://www.islamweb.net/ar/library/content/53/4327/)) and cites no report that it was withdrawn; on the Prophet’s judgment in [Muslim 1698](https://sunnah.com/muslim:1698) he reads “the Book of Allah” first as Allah’s ruling.\n\nʿUmar spoke as caliph, from the pulpit of the Prophet’s mosque, on a Friday after his last pilgrimage ([Bukhārī 6830](https://sunnah.com/bukhari:6830)), saying that “among what Allah revealed, was the Verse of the Rajam” and “we did recite this Verse and understood and memorized it”. If one asks why ʿUmar, as caliph, did not write the verse if its recitation had not been abrogated, ʿUmar himself gives his reason under oath—not that Allah withdrew its recitation, which he never mentions, but that people would say “ʿUmar made an addition to Allah’s Book” ([Abū Dāwūd 4418](https://sunnah.com/abudawud:4418); “ʿUmar has added to the Book of Allah” in the [Muwaṭṭaʾ 41/10](https://sunnah.com/malik/41/10) of Mālik, imam of Medina).\n\nEither the verse was withdrawn from recitation, which ʿUmar does not say and no report records, and the caliph swore he would have written a withdrawn verse but for what people would say; or it was part of the Book of Allah as ʿUmar describes it, and is not in today’s written Qurʾān (*muṣḥaf*). ʿUmar (Bukhārī 6830): “I am afraid that after a long time has passed, somebody will say, \'By Allah, we do not find the Verse of the Rajam in Allah\'s Book\'.”',
    appLinks: [
      { label: 'The stoning verse among the Qurʾān’s lost verses', href: '/quran/0#codex-lost-stoning-umar' },
      { label: 'ʿUmar’s readings and the verses he reported', href: '/quran/codex/umar-bin-al-khattab' },
    ],
  },

  'abu-musa-two-surahs': {
    source: ['[5].children[1]', '[3].children[0].codices[2]'],
    evidence: [H.muslim1050],
    title: 'Abū Mūsā Tells Basra’s 300 Reciters of 2 Sūrahs “We Used to Recite” and He Forgot',
    hook: 'The Prophet praised Abū Mūsā al-Ashʿarī’s recitation as a voice “of the family of David” (Bukhārī 5048). In Ṣaḥīḥ Muslim he tells the three hundred reciters of Basra of two sūrahs they used to recite, neither in today’s Qurʾān, and says he was made to forget both apart from a few lines.',
    takeaway: 'He compares them to Barāʾah (Sūrah 9) and to the Musabbiḥāt, the sūrahs that open by glorifying Allah. One line he kept matches Qurʾān 61:2; the other two, on two valleys of riches and a witness “recorded in your necks”, are not in today’s Qurʾān in that wording.',
    showcase: {
      type: 'facts',
      items: [
        { quote: 'Abu Musa al-Ash\'ari sent for the reciters of Basra... three hundred in number...', ref: H.muslim1050 },
        { quote: 'We used to recite a surah which resembled in length and severity to (Surah) Bara\'at.', ref: H.muslim1050 },
        { quote: 'I have, however, forgotten it with the exception of this which I remember out of it', ref: H.muslim1050 },
        { quote: 'If there were two valleys full of riches, for the son of Adam, he would long for a third valley', ref: H.muslim1050 },
        { quote: 'And we used to recite a surah which resembled one of the surahs of Musabbihat, and I have forgotten it', ref: H.muslim1050 },
        { quote: 'that is recorded in your necks as a witness (against you) and you would be asked about it on the Day of Resurrection', ref: H.muslim1050 },
      ],
    },
    quoteFixes: [
      {
        ref: H.muslim1050, field: 'english',
        replace: [
          ['which I remember out of it... And we used to recite', 'which I remember out of it: \'If there were two valleys full of riches, for the son of Adam, he would long for a third valley, and nothing would fill the stomach of the son of Adam but dust.\' And we used to recite'],
          ['and I have forgotten it..."', 'and I have forgotten it, but remember (this much) out of it: \'Oh people who believe, why do you say that which you do not practise\' (lxi 2.) and \'that is recorded in your necks as a witness (against you) and you would be asked about it on the Day of Resurrection\' (xvii)."'],
        ],
        reason: 'The dataset\'s ellipses cut the lines Abū Mūsā says he remembered (factcheck §1, Muslim 1050: "Keep \'except what I remember\'"); restored from the Siddiqui English in the fawazahmed0/hadith-api mirror of Sunnah.com (eng-muslim, arabicnumber 1050), inner quotation marks made single.',
        sourceUrl: 'https://sunnah.com/muslim:1050',
      },
      { ref: H.muslim1050, field: 'arabic', value: 'بَعَثَ أَبُو مُوسَى الأَشْعَرِيُّ إِلَى قُرَّاءِ أَهْلِ الْبَصْرَةِ فَدَخَلَ عَلَيْهِ ثَلاَثُمِائَةِ رَجُلٍ قَدْ قَرَءُوا الْقُرْآنَ فَقَالَ أَنْتُمْ خِيَارُ أَهْلِ الْبَصْرَةِ وَقُرَّاؤُهُمْ فَاتْلُوهُ وَلاَ يَطُولَنَّ عَلَيْكُمُ الأَمَدُ فَتَقْسُوَ قُلُوبُكُمْ كَمَا قَسَتْ قُلُوبُ مَنْ كَانَ قَبْلَكُمْ وَإِنَّا كُنَّا نَقْرَأُ سُورَةً كُنَّا نُشَبِّهُهَا فِي الطُّولِ وَالشِّدَّةِ بِبَرَاءَةَ فَأُنْسِيتُهَا غَيْرَ أَنِّي قَدْ حَفِظْتُ مِنْهَا لَوْ كَانَ لاِبْنِ آدَمَ وَادِيَانِ مِنْ مَالٍ لاَبْتَغَى وَادِيًا ثَالِثًا وَلاَ يَمْلأُ جَوْفَ ابْنِ آدَمَ إِلاَّ التُّرَابُ ‏.‏ وَكُنَّا نَقْرَأُ سُورَةً كُنَّا نُشَبِّهُهَا بِإِحْدَى الْمُسَبِّحَاتِ فَأُنْسِيتُهَا غَيْرَ أَنِّي حَفِظْتُ مِنْهَا ‏{‏ يَا أَيُّهَا الَّذِينَ آمَنُوا لِمَ تَقُولُونَ مَا لاَ تَفْعَلُونَ‏}‏ فَتُكْتَبُ شَهَادَةً فِي أَعْنَاقِكُمْ فَتُسْأَلُونَ عَنْهَا يَوْمَ الْقِيَامَةِ ‏.‏', reason: 'The dataset\'s Arabic is elided; full matn from the fawazahmed0/hadith-api mirror (ara-muslim, arabicnumber 1050), so the restored English has its Arabic.', sourceUrl: 'https://sunnah.com/muslim:1050' },
    ],
    classical: 'Classical scholars read [quran/2/106], “or cause it to be forgotten”, as one way abrogation takes place: the hadith master al-Ismāʿīlī, cited by Ibn Ḥajar (*Fatḥ al-Bārī*), describes Allah lifting a passage from the heart because He intends to abrogate its recitation ([Fatḥ al-Bārī, IslamWeb 52/9207](https://www.islamweb.net/ar/library/content/52/9207/)).',
    comparison: 'The classical reading needs both sūrahs to have been withdrawn by Allah, in the sense of [quran/2/106], “or cause it to be forgotten” ([Fatḥ al-Bārī 52/9207](https://www.islamweb.net/ar/library/content/52/9207/)). No report in Bukhārī, Muslim or al-Tirmidhī says these two sūrahs were abrogated. Abū Mūsā still recalls three lines from them: one matches [quran/61/2], while the saying about two valleys of riches ([Ubayy’s valley-of-gold report](/discover/quran-preservation#ubayy-valley-of-gold)) and the line about a witness “recorded in your necks” are not in today’s written Qurʾān (*muṣḥaf*) in that wording (the translator’s note “(xvii)” points to [17:13](/quran/17/13/tafsir/tabari), “We have fastened every man’s deeds to his neck”, which shares the image of the neck in different Arabic words).\n\nThe Prophet sent Abū Mūsā to govern part of Yemen ([Bukhārī 4341](https://sunnah.com/bukhari:4341)) and praised his recitation: “You have been given one of the mazamir (sweet melodious voices) of the family of David” ([Bukhārī 5048](https://sunnah.com/bukhari:5048)). Addressing the three hundred reciters of Basra, he speaks of the reciting in the plural (“we used to recite”), comparing the first sūrah in length to Barāʾah (Sūrah 9, which has 129 verses), and speaks of the forgetting in the first-person singular (*fa-unsītuhā*, “I was made to forget it”) while still quoting three lines from memory—describing one Companion losing most of two sūrahs from memory while retaining fragments, rather than two whole sūrahs being erased cleanly from the community at once.\n\nEither Allah withdrew two sūrahs the Companions used to recite and left three of their lines in one man’s memory, one of them in today’s muṣḥaf, with no report recording the withdrawal; or two sūrahs they recited were lost to memory apart from those lines. From the first he kept: “If there were two valleys full of riches, for the son of Adam, he would long for a third valley”.',
    appLinks: [
      { label: 'Abū Mūsā’s two forgotten sūrahs among the lost verses', href: '/quran/0#codex-lost-two-surahs-abu-musa' },
    ],
  },

  'ubayy-valley-of-gold': {
    source: ['[5].children[3]'],
    title: 'Ubayy on a Valley-of-Gold Saying They Held to Be Qurʾān Until Sūrah 102',
    hook: 'Allah told the Prophet to recite the Qurʾān to Ubayy ibn Kaʿb by name (Bukhārī 4959). In Bukhārī, Ubayy says the Companions held a saying about a valley of gold to be Qurʾān until Sūrah 102 (al-Takāthur) was revealed; today’s Qurʾān does not contain it.',
    takeaway: 'Ibn Baṭṭāl, author of an early commentary on Bukhārī, read it as words of the Prophet taken for Qurʾān; Ibn Ḥajar cites a report from al-Tirmidhī in which the Prophet recites it within Sūrah 98 (al-Bayyinah).',
    showcase: {
      type: 'witnesses',
      items: [
        { who: 'Ubayy ibn Kaʿb', quote: 'We considered this as a saying from the Qur\'an till the Surah (beginning with): "The mutual rivalry (for piling up of worldly things) diverts you" (102:1) was revealed.', mark: 'as a saying from the Qur\'an', arabic: 'كُنَّا نَرَى هَذَا مِنَ الْقُرْآنِ', ref: H.bukhari6438 },
      ],
    },
    quoteFixes: [
      { ref: H.bukhari6438, field: 'href', value: 'https://sunnah.com/bukhari:6440', reason: 'Ubayy\'s words and the Arabic shown are Bukhārī 6440, not 6438 (factcheck §1, Bukhārī 6438).', sourceUrl: 'https://sunnah.com/bukhari:6440' },
      {
        ref: H.bukhari6438, field: 'english',
        value: 'Ubayy said (referring to the hadith above), \'We considered this as a saying from the Qur\'an till the Surah (beginning with): "The mutual rivalry (for piling up of worldly things) diverts you" (102:1) was revealed.\'',
        reason: 'Removes our interpolation "(the valley of gold text)" and restores the verbatim Sunnah.com Bukhārī 6440 English (factcheck §1, Bukhārī 6438/6440; fawazahmed0/hadith-api mirror eng-bukhari 6440).',
        sourceUrl: 'https://sunnah.com/bukhari:6440',
      },
    ],
    classical: 'Ibn Ḥajar reports two readings. Ibn Baṭṭāl: when [Sūrah 102](/quran/102/1/tafsir/tabari) came, “they knew the earlier text was the Prophet’s own words”. Others read it as a verse whose recitation was abrogated, and al-Tirmidhī has Ubayy report the Prophet reciting it within [Sūrah 98](/quran/98/1/tafsir/tabari), al-Bayyinah ([Fatḥ al-Bārī, IslamWeb 52/11788](https://www.islamweb.net/ar/library/content/52/11788/)).',
    comparison: 'The two classical readings need different things. Ibn Baṭṭāl’s needs the Companions to have mistaken words of the Prophet for Qurʾān until [Sūrah 102](/quran/102/1/tafsir/tabari) (al-Takāthur) came. The second reading needs the saying to have been revealed as Qurʾān and then removed from recitation when Sūrah 102 came, though no report records that removal ([Fatḥ al-Bārī 52/11788](https://www.islamweb.net/ar/library/content/52/11788/)).\n\nUbayy is one of the four teachers the Prophet named ([Bukhārī 3808](https://sunnah.com/bukhari:3808)), and in [Bukhārī 4959](https://sunnah.com/bukhari:4959) the sūrah Allah ordered the Prophet to recite to Ubayy by name is [Sūrah 98](/quran/98/1/tafsir/tabari) (*al-Bayyinah*, “Those who disbelieve…”). In al-Tirmidhī’s report—whose chain Ibn Ḥajar grades “good” (*jayyid*, [Fatḥ al-Bārī 52/11788](https://www.islamweb.net/ar/library/content/52/11788/))—the Prophet recites the valley-of-gold saying to Ubayy inside that very recitation of Sūrah 98.\n\nEither the chief reciter Allah named to hear Sūrah 98 from the Prophet, together with the Companions he speaks for (“We considered this…”), mistook the Prophet’s own words for Qurʾān until Sūrah 102 came—meaning the Companions’ memory could confuse prophetic speech with Qurʾān—or the saying was recited as Qurʾān and is missing from today’s written Qurʾān (*muṣḥaf*), as [Abū Mūsā’s line](/discover/quran-preservation#abu-musa-two-surahs) also indicates. Ubayy: “We considered this as a saying from the Qur\'an till the Surah… was revealed.”',
    appLinks: [
      { label: 'The valley-of-gold saying among the lost verses', href: '/quran/0#codex-lost-valley-of-gold-ubayy' },
      { label: 'Ubayy ibn Kaʿb’s copy: its readings and verses', href: '/quran/codex/ubayy-bin-kab' },
    ],
  },

  'naskh-recitation-removed': {
    source: ['[8]', '[8].children[0]'],
    evidence: [],
    title: 'Abrogation in 2 Columns: Verses Still Recited With Rulings Replaced, and the Reverse',
    hook: 'Classical scholars explain verses the Companions recited but today’s Qurʾān lacks as abrogated, that is, withdrawn by Allah (*naskh*). Al-Nawawī names three kinds, among them rules still applied whose verse is no longer recited.',
    takeaway: 'For “recitation abrogated, ruling kept”, al-Nawawī gives two examples, the five sucklings and the stoning verse; both are known from reports, not from the written Qurʾān.',
    showcase: {
      type: 'confrontation',
      left: {
        title: { text: 'Still recited, ruling replaced' },
        items: [
          { text: 'Verses on wine in 2:219 and 4:43 remain in the written Qurʾān', ref: 'quran:2:219' },
          { text: 'after the prohibition in 5:90', ref: 'quran:5:90' },
        ],
      },
      right: {
        title: { text: 'Ruling kept, no longer recited' },
        items: [
          { text: 'Stoning (ʿUmar, Bukhārī 6829)', ref: 'item:umar-stoning-verse' },
          { text: 'Five sucklings (ʿĀʾishah, Muslim 1452a)', ref: 'item:aisha-suckling-verse' },
        ],
      },
      note: [{ text: '[quran/2/106] speaks of verses abrogated or caused to be forgotten. Al-Nawawī calls the second column *naskh al-tilāwa dūna al-ḥukm*: recitation abrogated, ruling kept.' }],
    },
    classical: 'Al-Nawawī: “Abrogation is of three kinds: ruling and recitation both abrogated, like the ten sucklings; recitation abrogated but ruling kept, like the five sucklings and ‘the older man and woman, if they commit adultery, stone them’; and ruling abrogated with recitation kept, which is the most common” ([Sharḥ Muslim, IslamWeb 53/4327](https://www.islamweb.net/ar/library/content/53/4327/)). Al-Zarkashī, citing the Ḥanbalī scholar Ibn ʿAqīl, explains the second kind—withdrawing the wording while keeping the law—as a test of the community’s obedience in acting “by way of probability” (*bi-ṭarīq al-ẓann*) without demanding a path that is “certain” (*maqṭūʿ bihi*, [al-Burhān, IslamWeb 67/234](https://www.islamweb.net/ar/library/content/67/234/)). The Companions’ reports use abrogation language for other passages: ʿĀʾishah’s “then they were abrogated” ([Muslim 1452a](https://sunnah.com/muslim:1452a)), the Companion al-Barāʾ ibn ʿĀzib’s “Allah, then, abrogated it” ([Muslim 630](https://sunnah.com/muslim:630)), and that of Anas, the Prophet’s servant for ten years, “We used to read a verse of the Qur\'an revealed in their connection, but later the verse was cancelled” (*rufiʿa*, literally “lifted”, [Bukhārī 4090](https://sunnah.com/bukhari:4090)).',
    comparison: 'The second column needs a kind of abrogation in which Allah removes a verse from recitation and keeps its ruling. Al-Nawawī states the category and illustrates it with the five sucklings and the stoning verse ([Sharḥ Muslim 53/4327](https://www.islamweb.net/ar/library/content/53/4327/)); he cites no report in which the Prophet or a Companion says a verse’s recitation was removed while its ruling stayed. Where the reports themselves say “abrogated” or “cancelled”, the ruling went with the words or no legal rule was involved: the ten sucklings ([Muslim 1452a](https://sunnah.com/muslim:1452a)), the ʿAṣr wording ([Muslim 630](https://sunnah.com/muslim:630)), and the verse about the seventy reciters killed at the well of Maʿūnah ([Bukhārī 4090](https://sunnah.com/bukhari:4090)). And Ibn ʿAqīl’s “test of obedience” explanation ([al-Burhān 67/234](https://www.islamweb.net/ar/library/content/67/234/)) itself concedes that once the wording is gone, these laws rest on probable evidence (*ẓann*), not on a certain (*maqṭūʿ bihi*) Qurʾānic text.\n\nLater scholars such as al-Bayhaqī answer that the proof of abrogation is the Companions’ consensus (*ijmāʿ*) on ʿUthmān’s written Qurʾān (*muṣḥaf*) without those verses ([al-Zarkashī, al-Baḥr al-Muḥīṭ, IslamWeb 35/931](https://www.islamweb.net/ar/library/content/35/931/)). In the canonical reports on this page, however, named Companions after the Prophet’s death—[ʿĀʾishah](/discover/quran-preservation#aisha-afternoon-prayer) dictating her own muṣḥaf ([Muslim 629](https://sunnah.com/muslim:629)), [Abū al-Dardāʾ](/discover/quran-preservation#abu-darda-92-3) swearing “I do not yield to their desire” ([Muslim 824a](https://sunnah.com/muslim:824a)), [Ibn Masʿūd](/discover/quran-preservation#ibn-masud-muawwidhatayn) refusing sūrahs 113–114 (Musnad Aḥmad via [Fatḥ al-Bārī 52/9098](https://www.islamweb.net/ar/library/content/52/9098/); [Bukhārī 4977](https://sunnah.com/bukhari:4977)), and [Ubayy ibn Kaʿb](/discover/quran-preservation#ubayy-left-out) saying “I will not leave for anything whatever” ([Bukhārī 5005](https://sunnah.com/bukhari:5005))—held to their readings, so the general claim that every Companion agreed on the contents of the muṣḥaf is not what these reports show.\n\nMeanwhile, today’s muṣḥaf retains verses whose legal ruling was cancelled ([2:219](/quran/2/219/tafsir/tabari) and [4:43](/quran/4/43/tafsir/tabari) on wine, superseded by [5:90](/quran/5/90/tafsir/tabari)) and verses addressing one-time episodes in the Prophet’s household ([66:1–5](/quran/66/1/tafsir/tabari), whose occasion [Bukhārī 4912](https://sunnah.com/bukhari:4912) gives, and [33:37](/quran/33/37/tafsir/tabari), on his marriage to Zaynab), while the two permanent rulings in the second column ([stoning](/discover/quran-preservation#umar-stoning-verse) and [five sucklings](/discover/quran-preservation#aisha-suckling-verse)) have no words in the muṣḥaf at all. Either Allah kept superseded and household verses in the muṣḥaf and removed the words of two laws that stayed in force, with no report recording the removal; or those rulings rest on verses the Companions recited that are missing from today’s muṣḥaf.',
    appLinks: [
      { label: 'Lost verses and forgotten sūrahs reported in the hadith collections and commentaries', href: '/quran/0' },
      { label: 'The verse about the reciters killed at Maʿūnah', href: '/quran/0#codex-lost-bir-mauna-anas' },
    ],
  },

  'abu-darda-92-3': {
    source: ['[5].children[6]'],
    title: 'Abū al-Dardāʾ Swears the Prophet Recited 92:3 Without “And by Him Who Created”',
    hook: 'Anas ibn Mālik, the Prophet’s servant for ten years (Bukhārī 6038), names Abū al-Dardāʾ as one of four men who had collected the whole Qurʾān when the Prophet died (Bukhārī 5004). In Ṣaḥīḥ Muslim, Abū al-Dardāʾ recites 92:3 without “and by Him Who created”, the wording in today’s Qurʾān, and swears he heard the Prophet recite it so.',
    takeaway: 'Bukhārī 4944 records Ibn Masʿūd reciting 92:3 the same way; al-Māzarī, a Mālikī jurist who wrote an early commentary on Muslim, holds that the shorter wording was abrogated, and cites no report of it.',
    showcase: {
      type: 'redline',
      a: { label: 'Qurʾān 92:3 today', ref: 'quran:92:3', text: 'and by Him Who created the male and the female', mark: 'and by Him Who created' },
      b: { label: 'Abū al-Dardāʾ, Muslim 824a', ref: H.muslim824a, arabic: 'وَالذَّكَرِ وَالأُنْثَى', quote: 'and by the males and the females.' },
      note: [{ quote: 'By Allah, I heard the Messenger of Allah (ﷺ) reciting in this way, but they (the Muslims of Syria) desire us to recite: (and by Him Who created), but I do not yield to their desire.', ref: H.muslim824a }],
    },
    quoteFixes: [
      { ref: H.muslim824a, field: 'english', replace: [[' (Uthman\'s committee)', ' (the Muslims of Syria)']], reason: '"(Uthman\'s committee)" is our interpolation; the source\'s own gloss is "(the Muslims of Syria)" (factcheck §1, Muslim 824a).', sourceUrl: 'https://sunnah.com/muslim:824a' },
    ],
    classical: 'Al-Māzarī, cited by al-Nawawī, holds that the shorter wording “was Qurʾān, then abrogated, and whoever differed had not learned of the abrogation”, and suggests this happened before ʿUthmān’s muṣḥaf reached them ([Sharḥ Muslim, IslamWeb 53/2318](https://www.islamweb.net/ar/library/content/53/2318/)).',
    comparison: 'Al-Māzarī’s reading needs the shorter wording to have been abrogated in the Prophet’s lifetime, and Abū al-Dardāʾ not to have learned of it. Al-Māzarī states it as what “must be believed” and cites no report of that abrogation ([Sharḥ Muslim 53/2318](https://www.islamweb.net/ar/library/content/53/2318/)). Abū al-Dardāʾ is one of the four men Anas says had collected the Qurʾān when the Prophet died ([Bukhārī 5004](https://sunnah.com/bukhari:5004)), and ʿAlqamah, one of Ibn Masʿūd’s students, reports that Ibn Masʿūd, first of the four Qurʾān teachers the Prophet named ([Bukhārī 3808](https://sunnah.com/bukhari:3808)), recited the verse the same way ([Bukhārī 4944](https://sunnah.com/bukhari:4944)). Either two Companions known for the Qurʾān kept a wording abrogated in the Prophet’s lifetime, though their words give no sign of an abrogation and no report records one; or the Prophet recited [92:3](/quran/92/3/tafsir/tabari) as Abū al-Dardāʾ swears, and today’s wording differs. Abū al-Dardāʾ: “By Allah, I heard the Messenger of Allah (ﷺ) reciting in this way, but they (the Muslims of Syria) desire us to recite: (and by Him Who created), but I do not yield to their desire.”',
    appLinks: [
      { label: 'Abū al-Dardāʾ’s reading of 92:3', href: '/quran/codex/abu-ad-darda' },
      { label: '92:3 as Ibn Masʿūd recited it, among readings of verses still in the Qurʾān', href: '/quran/0#codex-92-3-abdullah-bin-masud' },
    ],
  },

  'aisha-afternoon-prayer': {
    source: ['[5].children[4]'],
    title: 'ʿĀʾishah Dictates 2:238 for Her Copy of the Qurʾān With “and the Afternoon Prayer”',
    hook: 'In Ṣaḥīḥ Muslim, ʿĀʾishah dictates 2:238 for her copy of the Qurʾān with “and the afternoon prayer” after “the middle prayer”, and says she heard it so from the Prophet. Today’s Qurʾān has “the middle prayer” and not “the afternoon prayer”.',
    takeaway: 'In the next report, Muslim 630, the Companion al-Barāʾ ibn ʿĀzib says a first wording with “the ʿAṣr prayer” was abrogated for “the middle prayer”; ʿĀʾishah’s wording has both.',
    showcase: {
      type: 'redline',
      a: { label: 'Qurʾān 2:238 today', ref: 'quran:2:238', text: 'Guard the prayers and the middle prayer' },
      b: { label: 'ʿĀʾishah’s dictation, Muslim 629', ref: H.muslim629, arabic: 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلاَةِ الْوُسْطَى وَصَلاَةِ الْعَصْرِ', quote: 'Guard the prayers and the middle prayer and the afternoon prayer', mark: 'and the afternoon prayer' },
      note: [{ quote: 'This is how I have heard from the Messenger of Allah (ﷺ)', ref: H.muslim629 }],
    },
    quoteFixes: [
      { ref: H.muslim629, field: 'href', value: 'https://sunnah.com/muslim:629', reason: 'Muslim 629 has no letter suffix; muslim:629b does not resolve (factcheck §1, Muslim 629).', sourceUrl: 'https://sunnah.com/muslim:629' },
      {
        ref: H.muslim629, field: 'english',
        replace: [['**and the afternoon prayer**...\' [The words \'**and the afternoon prayer**\' are missing today in 2:238]', '**and the afternoon prayer**, and stand up truly obedient to Allah.\' \'A\'isha said: This is how I have heard from the Messenger of Allah (ﷺ).']],
        reason: 'Removes our bracket "[The words \'and the afternoon prayer\' are missing today in 2:238]" (factcheck §1, Muslim 629) and restores the end of the report, where ʿĀʾishah names the Prophet as her source; verbatim from the Siddiqui English in the fawazahmed0/hadith-api mirror (eng-muslim, arabicnumber 629).',
        sourceUrl: 'https://sunnah.com/muslim:629',
      },
      { ref: H.muslim629, field: 'arabic', value: 'فَأَمْلَتْ عَلَىَّ حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلاَةِ الْوُسْطَى وَصَلاَةِ الْعَصْرِ ‏.‏ وَقُومُوا لِلَّهِ قَانِتِينَ ‏.‏ قَالَتْ عَائِشَةُ سَمِعْتُهَا مِنْ رَسُولِ اللَّهِ صلى الله عليه وسلم ‏.‏', reason: 'The dataset\'s Arabic stops at the added phrase; extended to the end of the report (ʿĀʾishah\'s closing sentence) from the fawazahmed0/hadith-api mirror (ara-muslim, arabicnumber 629).', sourceUrl: 'https://sunnah.com/muslim:629' },
    ],
    classical: 'The next report in Ṣaḥīḥ Muslim gives the classical answer in a Companion’s words. Al-Barāʾ ibn ʿĀzib: “This verse was revealed (in this way): ‘Guard the prayers and the ʿAṣr prayer.’ We recited it (in this very way) so long as Allah desired. Allah, then, abrogated it and it was revealed: ‘Guard the prayers, and the middle prayer’” ([Muslim 630](https://sunnah.com/muslim:630)).',
    comparison: 'Three different wordings appear across these texts: (1) al-Barāʾ’s abrogated first version ([Muslim 630](https://sunnah.com/muslim:630)) had “the ʿAṣr prayer” in place of “the middle prayer”; (2) today’s [2:238](/quran/2/238/tafsir/tabari) has “the middle prayer” alone; (3) ʿĀʾishah’s dictation ([Muslim 629](https://sunnah.com/muslim:629)) has both—“the middle prayer and the afternoon prayer”. Al-Barāʾ’s report therefore does not explain ʿĀʾishah’s wording, which is neither his abrogated first version nor today’s text, and no report records the withdrawal of the combined wording she dictated.\n\nBecause [Muslim 627](https://sunnah.com/muslim:627) identifies the middle prayer as the ʿAṣr prayer, some suggest ʿĀʾishah was adding an explanatory note (*tafsīr*) in her personal copy. Two details in the report tell against that: first, she does not present it as her explanation—she dictates it into the verse text of her written copy (*muṣḥaf*) and says, “This is how I have heard from the Messenger of Allah (ﷺ)”; second, joining the two phrases with *wa-* (“the middle prayer *and* the afternoon prayer”) coordinates them as two items in the clause rather than defining one as the other.\n\nShe was the Prophet’s wife, and he died in her house, leaning against her chest ([Bukhārī 4449](https://sunnah.com/bukhari:4449)). Either her copy kept a wording the Prophet had replaced or blended an explanation into the verse, though she names him as her source for the exact words; or she dictated what she heard from him, and it is not in today’s 2:238. ʿĀʾishah: “This is how I have heard from the Messenger of Allah (ﷺ).”',
    appLinks: [
      { label: '2:238 with “and the afternoon prayer”, among readings of verses still in the Qurʾān', href: '/quran/0#codex-2-238-aisha' },
      { label: 'ʿĀʾishah’s copy: its readings and the verses she reported', href: '/quran/codex/aisha' },
    ],
  },

  'muslim-26-214': {
    source: ['[5].children[5]'],
    evidence: [H.muslim208a],
    title: '26:214 as Muslim 208a Quotes It, With a Phrase Not in Today’s Qurʾān',
    hook: 'The Prophet prayed for his cousin Ibn ʿAbbās: “O Allah! Bestow on him the knowledge of the Book” (Bukhārī 75). In Muslim 208a, Ibn ʿAbbās quotes 26:214 as revealed with a phrase today’s Qurʾān does not have, “and thy group of selected people among them”; the Arabic of Bukhārī 4971 has it too.',
    takeaway: 'Al-Nawawī reads the phrase as revealed Qurʾān whose recitation was later withdrawn, and cites no report of the withdrawal.',
    showcase: {
      type: 'redline',
      a: { label: 'Qurʾān 26:214 today', ref: 'quran:26:214', from: H.muslim208a, arabic: 'وَأَنْذِرْ عَشِيرَتَكَ الأَقْرَبِينَ', text: 'And warn thy nearest kindred' },
      b: { label: 'Muslim 208a', ref: H.muslim208a, arabic: 'وَرَهْطَكَ مِنْهُمُ الْمُخْلَصِينَ', quote: ['And warn thy nearest kindred', 'and thy group of selected people among them'], mark: 'and thy group of selected people among them' },
    },
    quoteFixes: [
      {
        ref: H.muslim208a, field: 'english',
        replace: [['\'And warn thy nearest kindred\', [it originally also contained] \'**and thy group of selected people among them**\'. [Missing from 26:214 today].', '\'And warn thy nearest kindred\' (**and thy group of selected people among them**) the Messenger of Allah (ﷺ) set off till he climbed Safa\'...']],
        reason: 'Removes our brackets "[it originally also contained]" and "[Missing from 26:214 today]" (factcheck §1, Muslim 208a) and restores the source\'s own punctuation; verbatim from the Siddiqui English in the fawazahmed0/hadith-api mirror (eng-muslim, arabicnumber 208.01).',
        sourceUrl: 'https://sunnah.com/muslim:208a',
      },
    ],
    classical: 'Al-Nawawī: “on its face, ‘and your chosen clan among them’ (*wa-rahṭaka minhumu l-mukhlaṣīn*, the same Arabic phrase translated above as ‘and thy group of selected people among them’) was Qurʾān that was revealed and whose recitation was then abrogated” ([Sharḥ Muslim, IslamWeb 53/600](https://www.islamweb.net/ar/library/content/53/600/)).',
    comparison: 'Al-Nawawī’s reading needs the phrase to have been revealed and then removed from recitation. He gives that as the plain sense (*ẓāhir*) of the wording and cites no report of the removal; he also says the phrase is not in Bukhārī’s versions, though the Arabic of [Bukhārī 4971](https://sunnah.com/bukhari:4971) has it (*wa-rahṭaka minhumu l-mukhlaṣīn*; the Sunnah.com English translation leaves the phrase untranslated) ([Sharḥ Muslim 53/600](https://www.islamweb.net/ar/library/content/53/600/)). The narrator is Ibn ʿAbbās, for whom the Prophet prayed for knowledge of the Book ([Bukhārī 75](https://sunnah.com/bukhari:75)). Either the phrase was revealed and later withdrawn, which no report records; or the verse as Ibn ʿAbbās quotes it had words that today’s [26:214](/quran/26/214/tafsir/tabari) lacks. The report: “And warn thy nearest kindred (and thy group of selected people among them)”.',
    appLinks: [
      { label: '26:214 with the longer phrase, among readings of verses still in the Qurʾān', href: '/quran/0#codex-26-214-ibn-abbas' },
      { label: 'Ibn ʿAbbās’s readings: where his wording differs from today’s Qurʾān', href: '/quran/codex/ibn-abbas' },
    ],
  },

  'umar-hisham-furqan': {
    source: ['[1].children[1]'],
    title: '4 Steps in Bukhārī: ʿUmar Hears Hishām Recite al-Furqān in Ways He Was Not Taught',
    hook: 'In Bukhārī, ʿUmar hears Hishām ibn Ḥakīm, a Companion of Quraysh, the Prophet’s tribe, recite Sūrat al-Furqān in ways he had not been taught, and takes him to the Prophet. The Prophet calls both readings revealed, so one sūrah was recited in more than one wording.',
    takeaway: 'In Bukhārī 7550 the Prophet hears both men, says of each reading “It was revealed like this”, and adds that the Qurʾān was revealed to be recited in seven ways.',
    showcase: {
      type: 'timeline',
      points: [
        { year: 'He hears', quote: 'I heard Hisham bin Hakim reciting Surat al-Furqan... in a way that Allah\'s Messenger had not taught me.', ref: H.bukhari7550 },
        { year: 'He waits', quote: 'I was about to jump over him while he was still in prayer, but I waited patiently and when he finished his prayer', ref: H.bukhari7550 },
        { year: 'To the Prophet', quote: 'Then I dragged him to Allah\'s Messenger...', ref: H.bukhari7550 },
        { year: 'The answer', quote: 'The Qur\'an has been revealed to be recited in seven different ways, so recite of it whichever is easy for you.', ref: H.bukhari7550 },
      ],
    },
    quoteFixes: [
      {
        ref: H.bukhari7550, field: 'english',
        replace: [
          ['while he was still in prayer... I pulled him', 'while he was still in prayer, but I waited patiently and when he finished his prayer, I put my sheet round his neck (and pulled him)'],
          ['The Prophet said, \'...**The Qur\'an has been revealed to be recited in seven different ways**.\'', 'The Prophet said, \'(O `Umar) release him! Recite, O Hisham.\' Hisham recited in the way I heard him reciting. Allah\'s Messenger (ﷺ) said, \'It was revealed like this.\' Then Allah\'s Messenger (ﷺ) said, \'Recite, O `Umar!\' I recited in the way he had taught me, whereupon he said, \'It was revealed like this,\' and added, \'**The Qur\'an has been revealed to be recited in seven different ways**, so recite of it whichever is easy for you.\''],
        ],
        reason: 'The dataset\'s ellipses cut ʿUmar\'s waiting and the Prophet\'s approval of both readings (factcheck Top 10 #10 and §1, Bukhārī 7550); restored verbatim from the Khan English in the fawazahmed0/hadith-api mirror (eng-bukhari 7550), inner quotation marks made single.',
        sourceUrl: 'https://sunnah.com/bukhari:7550',
      },
      { ref: H.bukhari7550, field: 'arabic', value: 'سَمِعْتُ هِشَامَ بْنَ حَكِيمٍ، يَقْرَأُ سُورَةَ الْفُرْقَانِ فِي حَيَاةِ رَسُولِ اللَّهِ صلى الله عليه وسلم فَاسْتَمَعْتُ لِقِرَاءَتِهِ، فَإِذَا هُوَ يَقْرَأُ عَلَى حُرُوفٍ كَثِيرَةٍ لَمْ يُقْرِئْنِيهَا رَسُولُ اللَّهِ صلى الله عليه وسلم، فَكِدْتُ أُسَاوِرُهُ فِي الصَّلاَةِ، فَتَصَبَّرْتُ حَتَّى سَلَّمَ، فَلَبَبْتُهُ بِرِدَائِهِ فَقُلْتُ مَنْ أَقْرَأَكَ هَذِهِ السُّورَةَ الَّتِي سَمِعْتُكَ تَقْرَأُ قَالَ أَقْرَأَنِيهَا رَسُولُ اللَّهِ صلى الله عليه وسلم فَقُلْتُ كَذَبْتَ، أَقْرَأَنِيهَا عَلَى غَيْرِ مَا قَرَأْتَ‏.‏ فَانْطَلَقْتُ بِهِ أَقُودُهُ إِلَى رَسُولِ اللَّهِ صلى الله عليه وسلم فَقُلْتُ إِنِّي سَمِعْتُ هَذَا يَقْرَأُ سُورَةَ الْفُرْقَانِ عَلَى حُرُوفٍ لَمْ تُقْرِئْنِيهَا‏.‏ فَقَالَ ‏"‏ أَرْسِلْهُ، اقْرَأْ يَا هِشَامُ ‏"‏‏.‏ فَقَرَأَ الْقِرَاءَةَ الَّتِي سَمِعْتُهُ‏.‏ فَقَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم ‏"‏ كَذَلِكَ أُنْزِلَتْ ‏"‏‏.‏ ثُمَّ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم ‏"‏ اقْرَأْ يَا عُمَرُ ‏"‏‏.‏ فَقَرَأْتُ الَّتِي أَقْرَأَنِي فَقَالَ ‏"‏ كَذَلِكَ أُنْزِلَتْ، إِنَّ هَذَا الْقُرْآنَ أُنْزِلَ عَلَى سَبْعَةِ أَحْرُفٍ فَاقْرَءُوا مَا تَيَسَّرَ مِنْهُ ‏"‏‏.‏', reason: 'The dataset\'s Arabic stops before the Prophet\'s answer; extended to the end of the report from the fawazahmed0/hadith-api mirror (ara-bukhari 7550).', sourceUrl: 'https://sunnah.com/bukhari:7550' },
    ],
    classical: 'The Prophet approved both readings, and classical scholars explain the difference by the seven modes of recitation (*aḥruf*) in which the Qurʾān was revealed. They distinguish these from today’s seven readings: Abū Shāma, a scholar of the Qurʾān readings cited by Ibn Ḥajar (*Fatḥ al-Bārī*), calls that identification “against the consensus of all scholars”. Al-Ṭabarī, author of the earliest great commentary on the Qurʾān, held that ʿUthmān kept one mode (*ḥarf*); others held that the written Qurʾān (*muṣḥaf*) keeps some of the points on which the aḥruf differed ([Fatḥ al-Bārī, IslamWeb 52/9123](https://www.islamweb.net/ar/library/content/52/9123/)).',
    comparison: 'The aḥruf explanation needs both readings to be revealed, and the report says so in the Prophet’s words. Al-Ṭabarī’s further view needs ʿUthmān to have kept one of the seven ways and set aside the rest; Ibn Ḥajar presents it as al-Ṭabarī’s own argument, with no saying of the Prophet or ʿUthmān to that effect, while others held that the muṣḥaf keeps some of the aḥruf ([Fatḥ al-Bārī 52/9123](https://www.islamweb.net/ar/library/content/52/9123/)).\n\nʿUmar and Hishām were both of Quraysh, so the difference was not between tribal dialects, and the Arabic says Hishām recited “in many ways” (*ʿalā ḥurūfin kathīratin*, the plural of *ḥarf*) without listing them. Ibn Ḥajar writes that he found no chain of ʿUmar’s report that names the letters on which the two men differed in Sūrat al-Furqān (same page).\n\nEither ʿUthmān set aside six of the seven revealed modes (*aḥruf*) the Prophet approved, as al-Ṭabarī held—meaning today’s muṣḥaf keeps one of several revealed wordings and drops the rest—or those wordings remain in today’s readings, a claim this report cannot confirm because, as Ibn Ḥajar notes, no chain records a single word on which ʿUmar and Hishām differed. The Prophet to both men: “It was revealed like this,” and “so recite of it whichever is easy for you.”',
  },

  'ibn-abbas-18-79': {
    source: ['[5].children[5]'],
    evidence: [H.bukhari4727],
    title: 'Ibn ʿAbbās Recites 18:79 With 1 Word Not in Today’s Qurʾān: “Serviceable”',
    hook: 'The Prophet prayed for his cousin Ibn ʿAbbās: “O Allah! Bestow on him the knowledge of the Book” (Bukhārī 75). In Bukhārī, Ibn ʿAbbās recites 18:79 with a word today’s Qurʾān does not have: “every (serviceable) boat”.',
    takeaway: 'The same report adds a second phrase at 18:80 (“and as for the boy he was a disbeliever”); Ibn ʿAmmār al-Mahdawī, a scholar of the Qurʾān readings, suggests such readings “may be” explanation joined to the text.',
    showcase: {
      type: 'redline',
      a: { label: 'Qurʾān 18:79 today', ref: 'quran:18:79', text: 'seize every boat by force' },
      b: { label: 'Ibn ʿAbbās, Bukhārī 4727', ref: H.bukhari4727, arabic: 'يَأْخُذُ كُلَّ سَفِينَةٍ صَالِحَةٍ غَصْبًا', quote: 'And in front of them there was a king who used to seize every (serviceable) boat by force.', mark: '(serviceable)' },
      note: [{ text: 'The parentheses are the translator’s; the word itself, *ṣāliḥatin*, is in the Arabic.' }],
    },
    quoteFixes: [
      { ref: H.bukhari4727, field: 'english', strip: 'brackets', reason: 'The bracketed sentence "[Adding the word \'serviceable\', which is missing in today\'s Quran 18:79]" is our commentary, not the source (factcheck §1, Bukhārī 4727).', sourceUrl: 'https://sunnah.com/bukhari:4727' },
    ],
    classical: 'Ibn Ḥajar (*Fatḥ al-Bārī*) cites Ibn ʿAmmār al-Mahdawī: many readings outside the written text of the Qurʾān (*muṣḥaf*) “may be interpretation joined to the revealed text” ([Fatḥ al-Bārī, IslamWeb 52/9123](https://www.islamweb.net/ar/library/content/52/9123/)).',
    comparison: 'Ibn ʿAmmār’s reading needs Ibn ʿAbbās to have recited an explanation as if it were part of the verse, and his hearers to have taken it as recitation. Ibn ʿAmmār puts it as a possibility (“may be”) about many such readings, and cites no report that Ibn ʿAbbās marked this word as explanation ([Fatḥ al-Bārī 52/9123](https://www.islamweb.net/ar/library/content/52/9123/)). The report says he “used to recite” it, and the same sentence adds a second phrase at [18:80](/quran/18/80/tafsir/tabari): “and as for the boy he was a disbeliever”.\n\nEither the Companion for whom the Prophet asked knowledge of the Book ([Bukhārī 75](https://sunnah.com/bukhari:75)) recited his own glosses as the verse, with no sign in the report that he said so; or [18:79](/quran/18/79/tafsir/tabari) and 18:80 as he recited them had words that today’s muṣḥaf lacks. The report: “And in front of them there was a king who used to seize every (serviceable) boat by force.”',
    appLinks: [
      { label: '18:79 with “serviceable”, among readings of verses still in the Qurʾān', href: '/quran/0#codex-18-79-ibn-abbas' },
      { label: 'Ibn ʿAbbās’s readings: where his wording differs from today’s Qurʾān', href: '/quran/codex/ibn-abbas' },
    ],
  },

  'uthman-copies': {
    source: ['[4]', '[4].children[0]', '[4].children[1]', '[4].children[2]', '[3].children[0].codices[0]'],
    evidence: [
      { path: H.bukhari4987a, anchor: 'hudhayfa-differences' },
      { path: H.bukhari4987b, anchor: 'quraysh-dialect-rule' },
      { path: H.bukhari4987c, anchor: 'uthman-burning' },
    ],
    title: '4 Steps in Bukhārī: Abū Bakr’s Collection, ʿUthmān’s Copies and the Burning of the Rest',
    hook: 'Bukhārī records how the Qurʾān became one book: collected under Abū Bakr after many reciters were killed at the battle of Yamāmah, then copied under ʿUthmān when Muslims differed over its recitation. ʿUthmān sent one copy to each province and ordered all other copies burnt; his copies are the basis of the written Qurʾān today.',
    takeaway: 'In Bukhārī 4987 ʿUthmān has the sheets kept by Ḥafṣah, the Prophet’s wife and ʿUmar’s daughter, copied, and tells the copyists to write in the dialect of Quraysh, the Prophet’s tribe, wherever they disagree with Zayd; the “Qurra’” in the first step are the Companions who knew the Qurʾān by heart.',
    showcase: {
      type: 'timeline',
      points: [
        { year: 'After Yamāmah', quote: 'more heavy casualties may take place among the Qurra\' on other battlefields, whereby a large part of the Qur\'an may be lost.', ref: H.bukhari4986 },
        { year: 'Under ʿUthmān', quote: 'Hudhaifa was afraid of their (the people of Sham and Iraq) differences in the recitation of the Qur\'an', ref: H.bukhari4987a },
        { year: 'The copyists', quote: 'In case you disagree with Zaid bin Thabit on any point in the Qur\'an, then write it in the dialect of Quraish, the Qur\'an was revealed in their tongue.', ref: H.bukhari4987b },
        { year: 'The other copies', quote: 'ordered that all the other Qur\'anic materials, whether written in fragmentary manuscripts or whole copies, be burnt.', ref: H.bukhari4987c },
      ],
    },
    quoteFixes: [
      {
        ref: H.bukhari4987a, field: 'english',
        replace: [['were waging war... **Hudhaifa', 'were waging war to conquer Arminya and Adharbijan. **Hudhaifa']],
        reason: 'The ellipsis hid "to conquer Arminya and Adharbijan", which shows the people of Sham and Iraq were campaigning together, not against each other (factcheck §1, Bukhārī 4987 part 1).',
        sourceUrl: 'https://sunnah.com/bukhari:4987',
      },
    ],
    classical: 'Ibn Ḥajar (*Fatḥ al-Bārī*) quotes ʿAlī saying that ʿUthmān acted on the written copies (*muṣḥafs*) with the counsel of all of them, and a report from Ibn Sīrīn that ʿUthmān gathered twelve men of Quraysh and the Anṣār (the Medinan Companions), Ubayy ibn Kaʿb among them. The example reported of a dialect point in the copying is the spelling of the word for the Ark, *al-tābūt* or *al-tābūh* ([Fatḥ al-Bārī, IslamWeb 52/9115](https://www.islamweb.net/ar/library/content/52/9115/)). Al-Baghawī, a Shāfiʿī hadith scholar and Qurʾān commentator, held that ʿUthmān’s text is “the last review” the Prophet recited with Gabriel, who reviewed the Qurʾān with him every year ([Fatḥ al-Bārī 52/9123](https://www.islamweb.net/ar/library/content/52/9123/)).',
    comparison: 'Al-Baghawī’s explanation needs ʿUthmān’s copies to match the Prophet’s last review of the Qurʾān with Gabriel. Bukhārī records the reviews, twice in the year the Prophet died ([Bukhārī 4998](https://sunnah.com/bukhari:4998)); in Ibn Ḥajar’s quotation al-Baghawī cites no report tying ʿUthmān’s copies to that last review ([Fatḥ al-Bārī 52/9123](https://www.islamweb.net/ar/library/content/52/9123/)), and Bukhārī 4987 does not mention it.\n\nIn Bukhārī 4987 ʿUthmān acts on the alarm of Ḥudhayfah—whom Abū al-Dardāʾ calls “the Keeper of the secret which nobody else knows” ([Bukhārī 3743](https://sunnah.com/bukhari:3743))—that the people of Syria and Iraq would “differ about the Book”, has Ḥafṣah’s sheets copied, and tells the three Qurashī copyists that wherever they disagree with Zayd ibn Thābit they are to write it in the dialect of Quraysh.\n\nEither ʿUthmān’s copies reproduce the Prophet’s final review with Gabriel, a link the report itself never states; or the text was fixed as Bukhārī 4987 describes—by copying Ḥafṣah’s sheets under the Quraysh dialect rule and burning “all the other Qur\'anic materials, whether written in fragmentary manuscripts or whole copies”, including the kind of personal copies [Item 6](/discover/quran-preservation#aisha-afternoon-prayer) and [Item 11](/discover/quran-preservation#ibn-masud-muawwidhatayn) describe, so that ʿUthmān’s text became the one standard to check against.',
  },

  'abu-khuzaima-last-verses': {
    source: ['[2].children[0]'],
    title: 'Zayd Finds the Last Verse of al-Tawbah With Abū Khuzaymah and “Nobody Other Than Him”',
    hook: 'Zayd ibn Thābit wrote down the revelation for the Prophet, and Abū Bakr chose him to collect the Qurʾān (Bukhārī 4986). Zayd says he found the last verse of Sūrat al-Tawbah with Abū Khuzaymah, a Medinan Companion, and “did not find it with anybody other than him”: the verse rested on one man.',
    takeaway: 'Ibn Ḥajar reads “not found” as “not found written”; the report lists written materials and “the men who knew it by heart” among Zayd’s sources.',
    showcase: {
      type: 'confrontation',
      left: {
        title: { text: 'Ibn Ḥajar, Fatḥ al-Bārī' },
        items: [{ text: '“That is, written”: Zayd “did not settle for memory without writing”, and others had the verse by heart' }],
      },
      right: {
        title: { text: 'Zayd ibn Thābit, Bukhārī 4986' },
        items: [
          { quote: 'I found the last Verse of Surat at-Tauba with Abi Khuzaima Al-Ansari, and I did not find it with anybody other than him.', ref: H.bukhari4986 },
          { arabic: 'وَجَدْتُ آخِرَ سُورَةِ التَّوْبَةِ مَعَ أَبِي خُزَيْمَةَ الأَنْصَارِيِّ لَمْ أَجِدْهَا مَعَ أَحَدٍ غَيْرَهُ', ref: H.bukhari4986 },
        ],
      },
    },
    quoteFixes: [
      {
        ref: H.bukhari4986, field: 'english',
        replace: [
          ['and **I am afraid that** **a large part of the Qur\'an may be lost**.', 'and **I am afraid that** more heavy casualties may take place among the Qurra\' on other battlefields, whereby **a large part of the Qur\'an may be lost**.'],
          ['So I started looking for the Qur\'an... till I found', 'So I started looking for the Qur\'an and collecting it from (what was written on) palm stalks, thin white stones and also from the men who knew it by heart, till I found'],
        ],
        reason: 'The dataset splices "I am afraid that" onto "a large part of the Qur\'an may be lost" with no ellipsis, and its second ellipsis cuts Zayd\'s sources; both restored verbatim from the Khan English (factcheck §1, Bukhārī 4986; fawazahmed0/hadith-api mirror eng-bukhari 4986, whose "palme" typo is read as "palm").',
        sourceUrl: 'https://sunnah.com/bukhari:4986',
      },
    ],
    classical: 'Ibn Ḥajar reads Zayd’s words as “that is, written, since he did not settle for memory without writing”, and adds: “the correct view: what is denied is finding it written, not its being memorised”; it does not follow, he says, that the verse was not mass-transmitted (*mutawātir*), that is, passed on by so many that error is ruled out. Al-Khaṭṭābī, whom Ibn Ḥajar cites, notes that Zayd, Abū Khuzaymah and ʿUmar all had the verse, and Ibn Abī Dāwūd reports, in his book on the early copies (*al-Maṣāḥif*), that Zayd and ʿUmar accepted nothing “until two witnesses testified” ([Fatḥ al-Bārī, IslamWeb 52/9113](https://www.islamweb.net/ar/library/content/52/9113/)).',
    comparison: 'Ibn Ḥajar’s and al-Khaṭṭābī’s reading needs Zayd’s “I did not find it with anybody other than him” to mean “not found written”, on the assumption that Zayd, ʿUmar and others already knew the verse by heart and required two witnesses—memory and writing—before writing it down ([Fatḥ al-Bārī 52/9113](https://www.islamweb.net/ar/library/content/52/9113/)). In the very same sentence of [Bukhārī 4986](https://sunnah.com/bukhari:4986), however, Zayd states that he was collecting from palm stalks, thin white stones “and also from the men who knew it by heart, till I found the last Verse of Surat at-Tauba with Abi Khuzaima Al-Ansari, and I did not find it with anybody other than him”—so reading “not found” as “not found written” inserts a restriction Zayd’s own sentence omits right after naming memorisers.\n\nZayd had written the revelation for the Prophet ([Bukhārī 4986](https://sunnah.com/bukhari:4986)), while Abū Khuzaymah is on none of [the three lists](/discover/quran-preservation#readers-lists) of whole-Qurʾān collectors. A common reply is that the holder’s testimony counted as two witnesses (*dhū al-shahādatayn*); that title, however, belongs to Khuzaymah ibn Thābit when bringing a different missing verse ([33:23](/quran/33/23/tafsir/tabari) in *al-Aḥzāb*) during ʿUthmān’s copying ([Bukhārī 4988](https://sunnah.com/bukhari:4988), [2807](https://sunnah.com/bukhari:2807)), whom popular replies often mix up with Abū Khuzaymah here under Abū Bakr (while [Bukhārī 4679](https://sunnah.com/bukhari:4679) has “Khuzaʿima” with two verses of *al-Tawbah*, [9:128–129](/quran/9/128/tafsir/tabari); [Fatḥ al-Bārī 52/9113](https://www.islamweb.net/ar/library/content/52/9113/)). In those *al-Aḥzāb* reports ([2807](https://sunnah.com/bukhari:2807), [4988](https://sunnah.com/bukhari:4988)), Zayd says he remembered hearing the Prophet recite 33:23 and searched for it “when the Qur\'an was compiled from various written manuscripts” (ʿUthmān’s copying from written sheets), whereas here in 4986 (under Abū Bakr) Zayd explicitly collects “from the men who knew it by heart” as well and still finds the end of *al-Tawbah* with one man.\n\nEither Zayd meant he found no second written copy, a qualifier his words omit right after he lists memorisers among his sources; or, collecting from both writing and memory, he found the end of Sūrat al-Tawbah with one man. Zayd: “I found the last Verse of Surat at-Tauba with Abi Khuzaima Al-Ansari, and I did not find it with anybody other than him.”',
  },

  'prophet-reminded-of-verses': {
    source: ['[1].children[0]'],
    title: '3 Wordings of the Night a Man’s Recitation Reminded the Prophet of Verses',
    hook: 'Bukhārī and Muslim record, in three wordings, a night when a man’s recitation reminded the Prophet of verses. The Prophet is the first link in the Qurʾān’s transmission, and here verses come back to him through another man’s recitation.',
    takeaway: 'Bukhārī 5038 says the Prophet had been caused to forget the verses, Muslim 788a says he had missed them, and Bukhārī 5037 says neither.',
    showcase: {
      type: 'versions',
      items: [
        { label: 'Bukhārī 5038', quote: 'as he has reminded me of such-and-such Verses of such-and-such Suras, which I was caused to forget.', mark: 'which I was caused to forget', arabic: 'لَقَدْ أَذْكَرَنِي كَذَا وَكَذَا آيَةً كُنْتُ أُنْسِيتُهَا مِنْ سُورَةِ كَذَا وَكَذَا', ref: H.bukhari5038 },
        { label: 'Muslim 788a', quote: 'he has reminded me of such and such a verse which I had missed in such and such a surah.', mark: 'which I had missed', arabic: 'لَقَدْ أَذْكَرَنِي كَذَا وَكَذَا آيَةً كُنْتُ أَسْقَطْتُهَا مِنْ سُورَةِ كَذَا وَكَذَا', ref: H.muslim788a },
        { label: 'Bukhārī 5037', quote: 'as he has reminded me of such-and-such Verses of such a Surah.', arabic: 'لَقَدْ أَذْكَرَنِي كَذَا وَكَذَا آيَةً مِنْ سُورَةِ كَذَا', ref: H.bukhari5037 },
      ],
    },
    quoteFixes: [
      { ref: H.bukhari5038, field: 'arabic', value: 'حَدَّثَنَا أَحْمَدُ بْنُ أَبِي رَجَاءٍ، حَدَّثَنَا أَبُو أُسَامَةَ، عَنْ هِشَامِ بْنِ عُرْوَةَ، عَنْ أَبِيهِ، عَنْ عَائِشَةَ، قَالَتْ سَمِعَ رَسُولُ اللَّهِ صلى الله عليه وسلم رَجُلاً يَقْرَأُ فِي سُورَةٍ بِاللَّيْلِ فَقَالَ ‏ "‏ يَرْحَمُهُ اللَّهُ لَقَدْ أَذْكَرَنِي كَذَا وَكَذَا آيَةً كُنْتُ أُنْسِيتُهَا مِنْ سُورَةِ كَذَا وَكَذَا ‏"‏‏.‏', reason: 'Removes a stray trailing "." after the closing quotation mark in the dataset\'s Arabic (factcheck §1, Bukhārī 5038: "the trailing ‏.‏.‏ is a typo"); text otherwise unchanged.', sourceUrl: 'https://sunnah.com/bukhari:5038' },
    ],
    classical: 'Ibn Ḥajar (*Fatḥ al-Bārī*), citing the hadith master al-Ismāʿīlī, separates two kinds of forgetting: one the Prophet “soon recalls, which belongs to human nature”, and one in which Allah lifts a passage from his heart because He intends to abrogate its recitation ([quran/2/106], [quran/87/6-7]). The first is possible, Ibn Ḥajar adds, on two conditions: “after he has already conveyed it, and he does not stay forgetful” ([Fatḥ al-Bārī, IslamWeb 52/9207](https://www.islamweb.net/ar/library/content/52/9207/)).',
    comparison: 'Ibn Ḥajar’s reading needs the verses to have been conveyed before the Prophet forgot them, which the reports support, since a man was already reciting them. It also needs “caused to forget” (*unsītuhā*) here to be the passing, human kind of forgetting, and not Allah lifting a verse to abrogate it ([Fatḥ al-Bārī 52/9207](https://www.islamweb.net/ar/library/content/52/9207/)).\n\nThe word does not settle which kind: Abū Mūsā uses the same form, *fa-unsītuhā*, for the two sūrahs in [Muslim 1050](https://sunnah.com/muslim:1050) ([Abū Mūsā’s report](/discover/quran-preservation#abu-musa-two-surahs)), and [Bukhārī 5039](https://sunnah.com/bukhari:5039) and [Muslim 790c](https://sunnah.com/muslim:790c) use a passive (*nussiya*) for anyone who forgets a verse. ʿĀʾishah narrates [Bukhārī 5038](https://sunnah.com/bukhari:5038) and [Muslim 788a](https://sunnah.com/muslim:788a), and the three wordings differ on the Prophet’s words: “caused to forget”, “missed” (*asqaṭtuhā*), or no clause at all ([Bukhārī 5037](https://sunnah.com/bukhari:5037)).\n\nEither *unsītuhā* describes ordinary forgetting, ended when the Prophet heard another man recite, and the same word in Abū Mūsā’s report does not by itself show abrogation; or it describes Allah lifting a verse, and here the verse came back when a man recited it at night. Bukhārī 5038: “May Allah bestow His Mercy on him, as he has reminded me of such-and-such Verses of such-and-such Suras, which I was caused to forget.”',
  },

  'hafs-warsh-readings': {
    source: ['[7]', '[8].children[1]'],
    evidence: [],
    title: '20 Differences Between the Ḥafṣ and Warsh Readings Printed Today',
    hook: 'Ḥafṣ and Warsh are the two standard readings (*qirāʾāt*) most printed today, named after the men who passed on the readings of ʿĀṣim and Nāfiʿ, Qurʾān teachers of the 2nd century AH. They differ in these 20 places, from a single letter to a different word; both are printed and recited as the Qurʾān.',
    takeaway: 'Some differences change who acts or who speaks, as with “fought” and “was killed” in 3:146; while classical scholars hold both readings revealed, Abū Shāma and al-Zarkashī state that the chains for the disputed wordings come through single narrators, and Ibn al-Jazarī drops the requirement of mass transmission (*tawātur*).',
    primer: {
      title: 'What the readings (qirāʾāt) are',
      text: 'The canonical readings (*qirāʾāt*) are those of teachers in five cities, each following ʿUthmān’s copy for that city; Ibn Mujāhid, a Baghdad reader, fixed seven around 300 AH. They are not the seven modes (*aḥruf*) of the hadith: Abū Shāma, a scholar of the readings, calls that view “against the consensus of all scholars”. Popular sites such as AboutIslam call the *aḥruf* tribal dialects; Ibn ʿAbd al-Barr, an Andalusian hadith master, reports that most scholars rejected this, as ʿUmar and Hishām, both of Quraysh, recited differently.\n\nNearly all differences are in [dots](/quran/variant/category-diacritical-difference-dots) and vowels left open by ʿUthmān’s undotted script (*rasm*); a few, such as “He” in [57:24](/quran/57/24/tafsir/tabari), differ between his copies.\n\nAl-Subkī and the majority held all ten readings passed on by many at every stage (*mutawātir*). Abū Shāma (“except a little”) and al-Zarkashī (“one from one”) held that their chains from the readers back to the Prophet are single for the disputed wordings. Ibn al-Jazarī, author of *al-Nashr*, the standard work on the ten readings, required a sound chain instead, since otherwise “much… would be excluded”.',
    },
    showcase: { type: 'confrontation', builder: 'qiraat', from: '[7]', verses: ['3:146', '43:19', '4:152'] },
    tables: [{ builder: 'qiraat', from: '[7]' }],
    // Transliteration and gloss fixes from factcheck §3, keyed by "S:A" (fields hafs, warsh, note).
    rowFixes: {
      '57:24': { hafs: 'inna llāha huwa l-ghaniyyu (Allah, He is the Self-Sufficient)', warsh: 'inna llāha l-ghaniyyu (Allah is the Self-Sufficient)', note: 'Ḥafṣ has the pronoun *huwa* (“He”), which adds emphasis; Warsh reads without it.' },
      '3:133': { hafs: 'wa-sāriʿū (And hasten)', warsh: 'sāriʿū (Hasten)', note: 'Ḥafṣ begins with *wa-* (“and”); the meaning does not change.' },
      '2:132': { hafs: 'wa-waṣṣā (And Ibrāhīm enjoined on his sons)', warsh: 'wa-awṣā (And Ibrāhīm enjoined on his sons)', note: 'Two related forms of the same verb, both meaning “enjoined”: Ḥafṣ doubles the middle letter (*waṣṣā*); Warsh adds an alif at the start (*awṣā*).' },
      '5:54': { hafs: 'yartadda (turns back)', warsh: 'yartadid (turns back)', note: 'Two ways of pronouncing the same verb, “turns back”: Ḥafṣ merges the two d sounds (*yartadda*); Warsh keeps them apart (*yartadid*).' },
      '21:4': { hafs: 'qāla (He said, “My Lord knows”)', warsh: 'qul (Say, “My Lord knows”)', note: 'Ḥafṣ *qāla*, “he said”, reports the Prophet’s words; Warsh *qul*, “say”, is God telling him to say them.' },
      '91:15': { hafs: 'wa-lā yakhāfu (and He does not fear its outcome)', warsh: 'fa-lā yakhāfu (so He does not fear its outcome)', note: 'One letter at the start changes the link from “and” (*wa-*) to “so” (*fa-*).' },
      '2:58': { hafs: 'naghfir (We will forgive)', warsh: 'yughfar (will be forgiven)', note: 'One letter at the start: Ḥafṣ *naghfir*, “We will forgive”; Warsh *yughfar*, “your sins will be forgiven”.' },
      '2:140': { hafs: 'am taqūlūna (or do you say)', warsh: 'am yaqūlūna (or do they say)', note: 'The verb changes from “you” to “they”.' },
      '2:259': { hafs: 'nunshizuhā (how We raise them up)', warsh: 'nunshiruhā (how We bring them to life)', note: 'One dot differs: *zāy* in Ḥafṣ (raise up), *rāʾ* in Warsh (bring to life).' },
      '3:81': { hafs: 'ātaytukum (I gave you)', warsh: 'ātaynākum (We gave you)', note: 'The speaker changes from “I” to “We”.' },
      '4:152': { hafs: 'yuʾtīhim (He will give them)', warsh: 'nūtīhimū (We will give them)', note: 'The speaker changes from “He” to “We”. Classical grammar calls such a change of speaker *iltifāt*; both refer to God.' },
      '43:19': { hafs: 'hum ʿibādu l-raḥmāni (they are servants of the Most Merciful)', warsh: 'hum ʿinda l-raḥmāni (they are with the Most Merciful)', note: 'One letter differs: Ḥafṣ *ʿibādu*, “servants of”; Warsh *ʿinda*, “with”. Both describe the angels.' },
      '1:4': { hafs: 'māliki yawmi l-dīn (Owner of the Day of Judgement)', warsh: 'maliki yawmi l-dīn (King of the Day of Judgement)', note: 'Ḥafṣ reads a long *ā* (*māliki*, owner); Warsh a short *a* (*maliki*, king).' },
      '2:9': { hafs: 'yakhdaʿūna (they deceive)', warsh: 'yukhādiʿūna (they seek to deceive)', note: 'Ḥafṣ has the simple verb, “they deceive”; Warsh adds a long ā (*yukhādiʿūna*, “they seek to deceive”), as in the first verb of the verse. This is its second occurrence in the verse.' },
      '2:10': { hafs: 'yakdhibūna (they lie)', warsh: 'yukadhdhibūna (they deny)', note: 'Ḥafṣ *yakdhibūna*, “they lie”; Warsh doubles the middle letter, *yukadhdhibūna*, “they deny” the truth.' },
      '2:214': { hafs: 'ḥattā yaqūla (until the Messenger said)', warsh: 'ḥattā yaqūlu (until the Messenger says)', note: 'The subject is the Messenger. One vowel on the last letter changes “until the Messenger said” (*yaqūla*, Ḥafṣ) to “until the Messenger says” (*yaqūlu*, Warsh), telling it as a scene in progress.' },
      '2:184': { hafs: 'fidyatun ṭaʿāmu miskīnin (a ransom: feeding a poor person)', warsh: 'fidyatu ṭaʿāmi masākīna (a ransom of feeding poor persons)', note: 'Singular (*miskīn*) in Ḥafṣ, plural (*masākīn*) in Warsh, which also joins “ransom” and “feeding” as one phrase.' },
      '3:146': { hafs: 'qātala (how many a prophet fought, with many devoted men)', warsh: 'qutila (how many a prophet was killed, many devoted men with him)', note: 'Ḥafṣ: “fought”; Warsh: “was killed”. *Ka-ayyin* means “how many a prophet”, so the verse speaks of many prophets; commentators also allow the devoted men as the subject of *qutila*.' },
      '28:48': { hafs: 'siḥrāni (two works of magic)', warsh: 'sāḥirāni (two magicians)', note: 'Ḥafṣ *siḥrāni*, “two works of magic”; Warsh adds an alif, *sāḥirāni*, “two magicians”.' },
      '66:12': { hafs: 'rabbihā wa-kutubihi (her Lord and His books)', warsh: 'rabbihā wa-kitābihi (her Lord and His book)', note: 'Ḥafṣ is plural (books), Warsh singular (book); the singular can mean scripture in general.' },
    },
    classical: 'Classical scholars hold that the standard readings go back to the Prophet. Ibn Ḥajar (*Fatḥ al-Bārī*) says that differences among ʿUthmān’s own regional copies, such as a *wāw* present in some and not in others, are “taken to mean it was revealed both ways” ([Fatḥ al-Bārī, IslamWeb 52/9123](https://www.islamweb.net/ar/library/content/52/9123/)).',
    comparison: 'The classical view needs both wordings of each pair to go back to the Prophet. Ibn Ḥajar gives this as a general rule for differences among ʿUthmān’s regional copies ([Fatḥ al-Bārī 52/9123](https://www.islamweb.net/ar/library/content/52/9123/)), while Abū Shāma (“except a little”, [al-Murshid al-Wajīz, Shamela 22676/181](https://shamela.ws/book/22676/181)) and al-Zarkashī (“one from one”, [al-Burhān, IslamWeb 67/134](https://www.islamweb.net/ar/library/content/67/134/)) note that the chains from the readers to the Prophet for the disputed wordings are single chains (*āḥād*), and Ibn al-Jazarī replaced the requirement of mass transmission (*tawātur*) with a sound chain because otherwise “much… would be excluded” ([al-Nashr 1/13, IslamWeb 70/5](https://www.islamweb.net/ar/library/content/70/5/)).\n\nThe reading printed across most of the Muslim world today comes through [Ḥafṣ ibn Sulaymān](/discover/hadith-reliability/hafs-ibn-sulayman) (90–180 AH) from ʿĀṣim. In hadith criticism, al-Bukhārī recorded that “they abandoned him” (*tarakūhu*), Muslim and Aḥmad ibn Ḥanbal graded him “abandoned in hadith” (*matrūk al-ḥadīth*), and Yaḥyā ibn Maʿīn called him “not trustworthy” ([al-Mizzī, Tahdhīb al-Kamāl 7/14–15, IslamWeb 1001/1479](https://www.islamweb.net/ar/library/content/1001/1479/); [Ibn Ḥajar, Tahdhīb al-Tahdhīb 2/400–401, Shamela 3310/916](https://shamela.ws/book/3310/916)). Classical biographers such as al-Dhahabī reply that Ḥafṣ was “reliable and precise in recitation, unlike his state in hadith” ([Maʿrifat al-Qurrāʾ al-Kibār 1/84, Shamela 8349/80](https://shamela.ws/book/8349/80))—so the reading most Muslims recite rests, for its exact letters and vowels, on a narrator from whom Bukhārī and Muslim would not take a single hadith.\n\nEither both wordings of each pair were revealed, and a text said to be mass-transmitted letter for letter rests at its disputed words on single chains and on a transmitter graded *matrūk* in hadith; or not every variant between Ḥafṣ and Warsh goes back to the Prophet. In [3:146](/quran/3/146/tafsir/tabari) Ḥafṣ reads *qātala*, “how many a prophet fought”, and Warsh reads *qutila*, “how many a prophet was killed”.',
    appLinks: [
      { label: 'The Qurʾān evidence hub: readings, early copies and lost verses', href: '/quran' },
      { label: 'Readings that change who is speaking', href: '/quran/variant/effect-change-of-person' },
      { label: 'Readings that switch between “did” and “was done”, as in 3:146', href: '/quran/variant/effect-active-to-passive-passive-to-active' },
      { label: 'Readings that differ in the dots on the letters', href: '/quran/variant/category-diacritical-difference-dots' },
    ],
  },

  'sanaa-lower-text': {
    source: ['[6]'],
    evidence: [],
    title: '3 Places Where the Erased Ṣanʿāʾ Text Differs From Today’s Qurʾān',
    hook: 'The Ṣanʿāʾ palimpsest is an early Qurʾān manuscript, found in Yemen in 1972, whose first text was erased and written over. In 9:74, 2:196 and 63:7 the erased text reads differently from today’s written Qurʾān.',
    takeaway: 'Behnam Sadeghi, a Stanford scholar of early Islam, and Uwe Bergmann, a physicist at the SLAC National Accelerator Laboratory who led the X-ray imaging (2010), identify the erased text as a 1st-century AH Qurʾān copy outside ʿUthmān’s line, with a different sūrah order and word-level differences.',
    showcase: { type: 'redline', builder: 'sanaa', from: '[6]' },
    // The showcase already lists all three rows with Arabic and English; a table would repeat them verbatim.
    extra: {
      sanaa: {
        // The dataset's 2:196 row ("the fast of three days is completely missing") is in neither Sadeghi
        // paper; this is the 2:196 variant Sadeghi & Bergmann 2010 list (factcheck §2, sanaa_variants[1]),
        // in their transliteration. The standard Arabic is the muṣḥaf's; no Arabic is given for the lower
        // text because SB2010 prints it in transliteration.
        '2:196': {
          standard: '…a ransom of fasting or charity or sacrifice (min ṣiyāmin aw ṣadaqatin aw nusukin)',
          standard_arabic: 'مِّن صِيَامٍ أَوْ صَدَقَةٍ أَوْ نُسُكٍ',
          sanaa: '…of fasting or sacrifice (min ṣiyāmin aw nusukin, as Sadeghi and Bergmann transliterate it)',
          sanaa_arabic: null,
          standard_mark: ['or charity', 'aw ṣadaqatin'],
        },
        // Highlights only (wording stays the dataset's).
        '9:74': { standard_mark: 'yaḥlifūna', sanaa_mark: 'yuqsimūna' },
        '63:7': { sanaa_mark: 'from around him' },
      },
    },
    images: [
      { src: '/images/discover/sanaa_double_versions.jpg', width: 456, height: 342, alt: 'A Ṣanʿāʾ Qurʾān fragment with Q 20:3–10', caption: 'A Ṣanʿāʾ fragment, Q 20:3–10', credit: 'Photo: Gerd R. Puin, via Wikimedia Commons' }, // NOTE: licence check
      { src: '/images/discover/sanaa_stanford.jpg', width: 1077, height: 1380, alt: 'The Stanford ’07 folio of the Ṣanʿāʾ palimpsest, recto, in normal light', caption: 'The Stanford ’07 folio, recto: the upper text is Q 2:265 onward; the erased lower text is Q 2:191–196', credit: 'Photo: SLAC / Behnam Sadeghi' }, // NOTE: licence check
    ],
    comparison: 'Sadeghi and Uwe Bergmann (*Arabica* 57, 2010), who recovered the erased lower text with X-ray fluorescence imaging, found that its consonant dots, verse dividers and decorated sūrah separators are in the original ink, and that its sūrah order differs from today’s and is “over-all much nearer to Ubayy b. Kaʿb than it is to Ibn Masʿūd”. Its wording differs from today’s written Qurʾān (*muṣḥaf*) by whole words and phrases: in [9:74](/quran/9/74/tafsir/tabari) it lacks “a painful punishment… and in the Hereafter” and reads *yuqsimūna* for *yaḥlifūna*; in [2:196](/quran/2/196/tafsir/tabari) it lacks “or charity”; and in [63:7](/quran/63/7/tafsir/tabari) it adds “from around him”, matching a speaker’s words reported in [Bukhārī 4900](https://sunnah.com/bukhari:4900).\n\nUsing stemmatic analysis (comparing how copies branch from an ancestor), Sadeghi and Bergmann conclude that “the ʿUthmānic tradition is better than [the lower text] in reproducing the Prophetic prototype”, and that why the first text was erased “remains open”. Here “better” means closer to a reconstructed ancestor, not identical: either the erased Ṣanʿāʾ text preserves some early wording that ʿUthmān’s standard lacks, or ʿUthmān’s text is right at every point while Muslims in the first century were already copying and reciting a Qurʾān that differed by whole words—so “letter for letter” describes ʿUthmān’s standard, not every Qurʾān Muslims recited before it.',
  },
};

export const CLOSING = {
  source: ['[9]'],
  id: 'closing',
  disclosure: 'Ready Apologia is written by Christians. What follows is our perspective, not part of the evidence above.',
  reflectionTitle: 'A Christian reflection on the Word of God',
  // Markdown; our rewrite of the dataset's [9].content.
  reflectionBody: [
    'Standard Islamic theology holds that the Qurʾān is the uncreated speech of God (*kalām Allāh*), eternal and perfect. The reports on this page describe a text recited from memory, collected after a battle, and copied into one standard.',
    'How can the uncreated be forgotten?',
    'The longing to know the uncreated Word is a good one. In the Orthodox Christian tradition we agree that the Word of God is uncreated, eternal and divine. We do not believe this Word became a book. **We believe the Word became a Person: Jesus Christ, the eternal Word (*Logos*).**',
    'A book is subject to ink, paper and scribes. Christ entered history, took on flesh, died and rose again, which no manuscript can do. The Bible is the inspired, trustworthy witness to that Person; it does not claim to be God on paper, which frees us to be open about its own history.',
    'We invite you to consider that the uncreated Word you seek is found in the living Christ.',
  ].join('\n\n'),
  // Markdown sentence; the link is the reader's way on.
  crossPointer: {
    text: 'The Bible’s manuscripts have textual variants too—and because Christians hold that the eternal Word is Christ Himself rather than a book dictated letter for letter, modern Bibles print those variants openly in the footnotes. How was the Bible preserved?',
    href: '/discover/trustworthiness-of-the-bible',
  },
};

/**
 * Old `#stage-N` links (shared before the October 2026 rebuild) → the element that now carries that
 * content. Values are item ids, section ids, 'intro' or 'closing'.
 */
export const LEGACY_ANCHORS = {
  'stage-0': 'intro',
  'stage-1': 'prophet-reminded-of-verses',
  'stage-2': 'abu-khuzaima-last-verses',
  'stage-3': 'ibn-masud-muawwidhatayn',
  'stage-4': 'uthman-copies',
  'stage-5': 'verses-not-in-todays-quran',
  'stage-6': 'sanaa-lower-text',
  'stage-7': 'hafs-warsh-readings',
  'stage-8': 'naskh-recitation-removed',
  'stage-9': 'closing',
};

/**
 * Dataset nodes that are deliberately not rendered on their own:
 *   mode 'drop'  — a duplicate of `into`, which is rendered instead;
 *   mode 'parts' — one excerpt of a narration shown as several cards in the same item.
 */
export const INTENTIONALLY_MERGED = {
  [H.muslim1050dup]: { into: H.muslim1050, mode: 'drop', why: 'Muslim 1050 is quoted twice in the dataset; the fuller quotation is shown once, in abu-musa-two-surahs.' },
  [H.bukhari4987b]: { into: H.bukhari4987a, mode: 'parts', why: 'Bukhārī 4987, second excerpt of one narration (uthman-copies).' },
  [H.bukhari4987c]: { into: H.bukhari4987a, mode: 'parts', why: 'Bukhārī 4987, third excerpt of one narration (uthman-copies).' },
};

/** The config as one object (what the model builder consumes; tests pass modified copies). */
export const CONFIG = {
  BASE, BASE_PATH, LABELS, SHOWCASE_LABELS, SOURCE_GROUPS, SEO, INTRO, SUMMARY, START_HERE, SECTIONS, ITEMS,
  CLOSING, LEGACY_ANCHORS, INTENTIONALLY_MERGED, QIRAAT_CATEGORY_LABELS,
};
