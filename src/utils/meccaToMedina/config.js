/**
 * Presentation config for "From Mecca to Medina" (/discover/from-mecca-to-medina).
 *
 * COPY OVERRIDE LAYER. Every reader-facing string lives here, keyed by a stable id, over the read-only
 * dataset src/data/discover/islam/scripture/from_mecca_to_medina.json. Order, section membership,
 * showcase choice and copy are all config: reordering the page is an edit to START_HERE / SECTIONS.
 * `<review>/from-mecca-to-medina/data_proposals.md` (gen_data_proposals.mjs) prints this layer as
 * byte-identical proposals for the data agent.
 *
 * What the build checks (src/utils/meccaToMedina/model.js; it throws one error listing every problem):
 *   - every dataset path (`own`, `evidence[].from`, showcase `from` / `ref`, `printRefs`, quoteFixes `ref`)
 *     resolves to a node; every item id sits in exactly one place (START_HERE or one SECTIONS entry);
 *   - every dataset leaf is placed exactly once (claimed by an `own` / `evidence` / `printRefs` path), except
 *     the NOT_RENDERED allowlist (meta.*, directionToLLM, ids, numbers): nothing is dropped or doubled;
 *   - every `excerpt` / showcase `quote` / `arabic` is a verbatim substring of its source text (after
 *     quoteFixes and display normalisation: markdown `**`/`*`/`>` dropped, backtick ʿayn → ʿ, spaces tidied);
 *   - every quoteFix names a real node and field, has a reason and a sourceUrl, and changes the text;
 *   - every hadith has a Sunnah.com URL; every Qurʾān reference gets a Meccan/Medinan label from
 *     src/data/quran/arabic/meta.json (King Fahd classification); every `{placeholder}` is known.
 * Quotes, references and Arabic always come from the dataset or the repo's own Qurʾān / tafsīr / hadith
 * corpora; the only exceptions are `quoteFixes` and EXTRA_HADITH (each with reason + source).
 *
 * Source refs (evidence `from`, showcase `from` / `ref`):
 *   dataset path  `sections[1].stages[0].hadithEvidence`
 *   `quran:S:A` / `quran:S:A-B`        → repo Qurʾān English (Droge) + Arabic (Ḥafṣ)
 *   `tafsir:tabari:S:A` / `tafsir:ibn_kathir:S:A` → repo tafsīr English (excerpt required)
 *   `hadith:<key>`                     → EXTRA_HADITH[key] (verbatim mirror English, with reason)
 *   `item:<id>`                        → another item on this page (ref only)
 * Showcase parts: a string / `{ text }` is our voice (tone-tested); `{ quote, from }` / `{ arabic, from }`
 * are verbatim excerpts (checked); `mark` highlights substrings; `cite: true` appends the source link.
 *
 * Copy: written by the Phase 2 writer from cuj_ia.md (through Round 2) and factcheck.md (incl. primary checks);
 * every replaced string is logged before → after in `<review>/from-mecca-to-medina/copy.md`. Keep one object per item id.
 */

/** Site base ('' at the root). Every internal href goes through BASE so a non-root BASE_URL works. */
export const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');
/** Public URL (never change without a redirect). */
export const PAGE_PATH = '/discover/from-mecca-to-medina';
export const BASE_PATH = `${BASE}${PAGE_PATH}`;
export const OG_IMAGE = `${BASE}/media/mecca_to_medina/cover.jpg`;
export const OG_IMAGE_SIZE = { width: 620, height: 413 };
export const DATE_PUBLISHED = '2026-08-26';
/** Bump on every substantive copy or evidence change (JSON-LD dateModified). */
export const DATE_MODIFIED = '2026-10-24';
/** Pending user decision: FAQPage JSON-LD stays off (and the old 7 Q/As stay off the page) while false. */
export const EMIT_FAQ = false;

// ---------------------------------------------------------------------------------------------
// Dataset paths by name, so the specs below read as sources rather than paths.
// ---------------------------------------------------------------------------------------------
const ERAS = 'sections[0]';
const STAGES = 'sections[1]';
const ST = i => `${STAGES}.stages[${i}]`;
const JEWS = 'sections[2]';
const CONCORD = `${JEWS}.subsections[0]`;
const FRACTURE = `${JEWS}.subsections[1]`;
const CAMPAIGNS = `${JEWS}.subsections[2]`;
const QAYNUQA = `${CAMPAIGNS}.campaigns[0]`;
const NADIR = `${CAMPAIGNS}.campaigns[1]`;
const QURAYZA = `${CAMPAIGNS}.campaigns[2]`;
const KHAYBAR = `${CAMPAIGNS}.campaigns[3]`;
const QE = i => `${QURAYZA}.keyEvents[${i}]`;
const KE = i => `${KHAYBAR}.keyEvents[${i}]`;
const JESUS = 'sections[3]';
const TITLES = `${JESUS}.subsections[0]`;
const REBUTTALS = `${JESUS}.subsections[1]`;
const NASKH = 'sections[4]';
const SYNTHESIS = 'sections[5]';
const FRAMEWORKS = 'sections[6]';
const CONCLUSION = 'sections[7]';

/** Hadith nodes by Sunnah.com reference. */
const H = {
  nasai3086: `${ST(0)}.hadithEvidence`,
  bukhari25: `${ST(3)}.hadithEvidence[0]`,
  muslim22: `${ST(3)}.hadithEvidence[1]`,
  bukhari40: `${CONCORD}.points[0].citation`,
  bukhari4031: `${NADIR}.hadiths[0]`,
  muslim1746a: `${NADIR}.hadiths[1]`,
  bukhari4122: `${QE(0)}.hadiths[0]`,
  bukhari3043: `${QE(1)}.hadiths[0]`,
  bukhari4121: `${QE(1)}.hadiths[1]`,
  muslim1768a: `${QE(1)}.hadiths[2]`,
  abudawud4404: `${QE(2)}.hadiths[0]`,
  tirmidhi1584: `${QE(2)}.hadiths[1]`,
  ibnmajah2541: `${QE(2)}.hadiths[2]`,
  bukhari4028: `${QE(3)}.hadiths[0]`,
  muslim1766a: `${QE(3)}.hadiths[1]`,
  abudawud2671: `${QE(3)}.hadiths[2]`,
  bukhari371: `${KE(1)}.hadiths[0]`,
  bukhari4200: `${KE(1)}.hadiths[1]`,
  muslim1365e: `${KE(1)}.hadiths[2]`, // dataset says 3500 (see quoteFixes)
  muslim1365f: `${KE(1)}.hadiths[3]`, // dataset says 3501
  bukhari2235: `${KE(2)}.hadiths[0]`,
  bukhari4201: `${KE(2)}.hadiths[1]`,
  muslim1365c: `${KE(2)}.hadiths[2]`, // dataset says 3497
  muslim1365d: `${KE(2)}.hadiths[3]`, // dataset says 3498
  bukhari2338: `${KE(3)}.hadiths[0]`,
  muslim1551a: `${KE(3)}.hadiths[1]`,
  bukhari2222: `${REBUTTALS}.eschatology.hadiths[0]`,
  bukhari3448: `${REBUTTALS}.eschatology.hadiths[1]`,
  muslim155a: `${REBUTTALS}.eschatology.hadiths[2]`,
  bukhari6922: `${SYNTHESIS}.hadithCitation`,
};

/** Qurʾān nodes in the dataset. */
const Q = {
  q4_77: `${ST(0)}.primaryVerse`,
  q22_39: `${ST(1)}.primaryVerse`,
  q2_216: `${ST(2)}.primaryVerses[0]`,
  q2_190: `${ST(2)}.primaryVerses[1]`,
  q9_5: `${ST(3)}.keyMandates[0]`,
  q9_29: `${ST(3)}.keyMandates[1]`,
  q109_6: `${ERAS}.subsections[0].verses[0]`,
  q16_125: `${ERAS}.subsections[0].verses[1]`,
  q41_34: `${ERAS}.subsections[0].verses[2]`,
  q10_94: `${CONCORD}.points[2].verse`,
  q2_144: `${FRACTURE}.categories[0].verse`,
  q2_75: `${FRACTURE}.categories[1].verses[0]`,
  q2_79: `${FRACTURE}.categories[1].verses[1]`,
  q5_13: `${FRACTURE}.categories[1].verses[2]`,
  q2_61: `${FRACTURE}.categories[2].verses[0]`,
  q4_155: `${FRACTURE}.categories[2].verses[1]`,
  q5_82: `${FRACTURE}.categories[3].verses[0]`,
  q2_65: `${FRACTURE}.categories[3].verses[1]`,
  q5_60: `${FRACTURE}.categories[3].verses[2]`,
  q7_166: `${FRACTURE}.categories[3].verses[3]`,
  q59_2: `${NADIR}.verses[0]`,
  q59_5: `${NADIR}.verses[1]`,
  q33_26: `${QURAYZA}.verse`,
  q3_42: `${TITLES}.attributes[0].verses[0]`,
  q19_19: `${TITLES}.attributes[0].verses[1]`,
  q3_45: `${TITLES}.attributes[1].verses[0]`,
  q4_171: `${TITLES}.attributes[1].verses[1]`,
  q3_49: `${TITLES}.attributes[2].verses[0]`,
  q5_110: `${TITLES}.attributes[2].verses[1]`,
  q4_157: `${REBUTTALS}.polemicsTable[0]`,
  q5_72: `${REBUTTALS}.polemicsTable[1]`,
  q5_73: `${REBUTTALS}.polemicsTable[2]`,
  q9_30: `${REBUTTALS}.polemicsTable[3]`,
  q2_106: `${NASKH}.scripturalBasis[0]`,
  q16_101: `${NASKH}.scripturalBasis[1]`,
  q2_109: `${NASKH}.caseStudy.verse`,
};

/** Tafsīr excerpts in the dataset. */
const T = {
  ik4_77: `${ST(0)}.tafsirExcerpts[0]`,
  tb4_77: `${ST(0)}.tafsirExcerpts[1]`,
  tb9_29: `${ST(3)}.tafsirExcerpts[0]`,
  ik9_29: `${ST(3)}.tafsirExcerpts[1]`,
  tb2_106: `${NASKH}.classicalDefinitions[0]`,
  ik2_106: `${NASKH}.classicalDefinitions[1]`,
  ik2_109: `${NASKH}.caseStudy.scholarlyConsensus[0]`,
  tb2_109: `${NASKH}.caseStudy.scholarlyConsensus[1]`,
};

// ---------------------------------------------------------------------------------------------
// UI labels
// ---------------------------------------------------------------------------------------------
export const LABELS = {
  back: 'Discover',
  onThisPage: 'On this page',
  startHere: 'Start here',
  startHereOf: 'Start here · 1 of {total}',
  contextLine: '{n} of {total} · Question {q}',
  copyLink: 'Copy link',
  copyItemLink: 'Copy link to this item',
  copied: 'Link copied',
  next: 'Next',
  nextAfterLast: 'Next: how Muslims read these verses today',
  sources: 'The texts',
  moreSources: 'More texts ({n})',
  fullText: 'Read the full text',
  parallelText: 'Read this parallel report',
  arabicText: 'Original Arabic',
  classical: 'The classical explanation',
  comparison: 'Comparing with the text',
  checkSources: 'Check the sources',
  checkIntro: 'Every report, verse and commentary cited on this page, grouped by library.',
  othersSaying: 'What others are saying',
  othersNote: 'Opinions, not part of the evidence on this page.',
  meccan: 'Meccan sūra',
  medinan: 'Medinan sūra',
  tafsir: 'Tafsīr',
  sira: 'Sīra',
  translatorNote: 'Translator\u2019s addition',
  verifyQuran: 'Ṭabarī on {key}',
  verifyTafsir: 'Read on this site',
  verifySunnah: 'Sunnah.com',
  sunnahCount: '{n} on Sunnah.com',
  printNote: 'Printed sources',
  suraNote: 'Meccan/Medinan labels follow the standard Saudi printing of the Qurʾān (the King Fahd Complex muṣḥaf).',
  seeItem: 'See item {n}',
};

/** Showcase captions (the "kind of evidence" line above each showcase). */
export const SHOWCASE_LABELS = {
  number_fan: 'Numbers in the sources',
  versions: 'Wordings side by side',
  redline: 'Wording side by side',
  timeline: 'Step by step',
  bars: 'Counts',
  witnesses: 'In their own words',
  confrontation: 'Side by side',
  facts: 'What the texts say',
  highlight: 'In one verse',
};

/** Source groups in "Check the sources" (kinds come from model.js). Order is display order. */
export const SOURCE_GROUPS = [
  { kind: 'sunnah', label: 'Hadith collections', note: 'Opens Sunnah.com' },
  { kind: 'quran', label: 'Qurʾān', note: 'Opens Tafsir al-Ṭabarī on this site' },
  { kind: 'tafsir', label: 'Tafsīr', note: 'Opens al-Ṭabarī or Ibn Kathīr on this site' },
  { kind: 'classical', label: 'Classical works online', note: 'Opens Shamela, IslamWeb, Wikisource or archive.org' },
  {
    kind: 'print',
    label: 'Sīra and taʾrīkh in print',
    note: 'Printed works, no online link. Page numbers refer to A. Guillaume’s translation of Ibn Isḥāq, The Life of Muhammad (Oxford, 1955).',
  },
  { kind: 'bible', label: 'Bible', note: 'Opens the verse on this site' },
  { kind: 'other', label: 'Other references', note: '' },
];

// ---------------------------------------------------------------------------------------------
// SEO + catalog (NOTE: title, description and catalog card need user sign-off, JETSKI rule 5)
// ---------------------------------------------------------------------------------------------
export const SEO = {
  title: 'From Mecca to Medina: Pardon, Then Fight, in {items} Sets of Texts',
  description: 'Nasāʾī 3086: in Mecca, “I have been commanded to pardon, so do not fight”; in Medina, “He commanded us to fight.” {items} sets of verses, hadith and tafsīr, linked.',
  keywords: 'mecca to medina, meccan and medinan surahs, sword verse 9:5, 9:29 tafsir, 2:109 abrogation, naskh, stages of jihad ibn al-qayyim, banu qurayza, banu nadir, khaybar, jesus in the quran',
  breadcrumb: 'From Mecca to Medina',
  /** Wikidata entities for Article.about (ids checked with the wbgetentities API, Oct 2026). */
  about: [
    { name: 'Hijra', sameAs: 'https://www.wikidata.org/wiki/Q131482' },
    { name: 'Naskh', sameAs: 'https://www.wikidata.org/wiki/Q331511' },
    { name: 'Meccan surah', sameAs: 'https://www.wikidata.org/wiki/Q234280' },
    { name: 'Medinan surah', sameAs: 'https://www.wikidata.org/wiki/Q234300' },
    { name: 'Siege of Banu Qurayza', sameAs: 'https://www.wikidata.org/wiki/Q5500115' },
  ],
};

/** Discover card copy for src/data/discoverCatalog.json (slug "from-mecca-to-medina"); feeds data_proposals.md. */
export const CATALOG = {
  title: 'From Mecca to Medina: 15 Sets of Texts on the Command to Pardon, Then to Fight',
  description: 'Ibn ʿAbbās reports the Prophet in Mecca: “I have been commanded to pardon, so do not fight”; in Medina, “He commanded us to fight.” Qurʾān, hadith and tafsīr, each linked.',
};

// ---------------------------------------------------------------------------------------------
// Page opening
// ---------------------------------------------------------------------------------------------
export const INTRO = {
  own: ['abstract.summary', 'abstract.diagram', `${ERAS}.intro`],
  h1: 'From Mecca to Medina: {items} Sets of Texts on the Command to Pardon, Then to Fight',
  text: 'Many Muslims hold that the Qurʾān’s war verses are defensive and tied to their occasions: “Fight in the way of God against those who fight against you, but do not commit aggression” ([2:190](/quran/2/190/tafsir/tabari)). Bukhārī and Muslim, the collections they trust most after the Qurʾān, and the Qurʾān commentaries of al-Ṭabarī and Ibn Kathīr record commands that are not limited to self-defence: the Prophet’s words “I have been ordered (by Allah) to fight against the people until they testify”, and [9:29](/quran/9/29/tafsir/tabari)’s command to fight the People of the Book “until they pay tribute”. These are {items} sets of texts from before and after the Hijra, each linked to its source.',
  orientation: [{ label: 'Mecca', text: '610–622 · {meccanSuras} chapters (sūras)' }, { label: 'Medina', text: '622–632 · {medinanSuras} chapters (sūras)' }],
};

/** Rendered once, in full, before the first section (no section number). */
export const START_HERE = 'commanded-to-pardon-then-to-fight';

/** Reader-question sections, in reading order. Ordering lives here only. */
export const SECTIONS = [
  {
    id: 'pardon-replaced',
    own: ['abstract.coreThemes[3]'],
    question: 'What did the classical commentators say became of the command to pardon?',
    dek: 'Al-Ṭabarī (d. 923), whose Qurʾān commentary Ibn Taymiyya called “the soundest”, and Ibn Kathīr (d. 1373), whose works “spread through the lands in his lifetime” (Ibn Ḥajar), report what became of a Medinan pardon verse (2:109) and why 9:29 commands fighting; classical counts of cancelled (abrogated) verses run from 124 to about 20.',
    items: ['pardon-2-109', 'who-9-29-names', 'what-naskh-meant'],
  },
  {
    id: 'fighting-after-hijra',
    own: [`${STAGES}.title`, `${STAGES}.intro`, 'abstract.coreThemes[0]'],
    question: 'How do the Qurʾān’s commands on fighting move from Mecca to Sūrat al-Tawba?',
    dek: 'Ibn al-Qayyim (d. 1350), Ibn Taymiyya’s student, set out four steps in *Zād al-Maʿād*, his four-volume study of the Prophet’s practice, from “forbidden” to “commanded against all the polytheists”. The Meccan verses before them command patience and pardon.',
    items: ['four-stages', 'meccan-verses'],
  },
  {
    id: 'jewish-tribes',
    own: [`${JEWS}.title`, `${JEWS}.intro`, 'abstract.coreThemes[1]', `${CAMPAIGNS}.title`],
    question: 'What happened to the Jewish tribes of Medina?',
    dek: 'Bukhārī and Muslim report the exile of Banū al-Naḍīr, the verdict on Banū Qurayẓa and the terms at Khaybar. Details from the early biographies of the Prophet (sīra) are marked “Sīra”, with their page.',
    items: ['jews-of-medina-exiled', 'qurayza-judgment', 'banu-nadir-palms', 'khaybar-terms'],
  },
  {
    id: 'jews-and-christians',
    own: [`${FRACTURE}.title`, `${FRACTURE}.content`, 'abstract.coreThemes[2]', `${JESUS}.title`, `${JESUS}.intro`],
    question: 'Does the Qurʾān speak about the Jews and the Christians the same way throughout?',
    dek: 'Meccan 10:94 says to “ask those who have been reciting the Book”; Medinan 2:75 says “a group of them” heard “the word of God, (and) then altered it”. Some words stand in both periods; the rebuttals of “Three” and of the crucifixion are Medinan.',
    items: ['ask-the-readers-then-altered', 'qibla-jerusalem-to-kaaba', 'same-words-mecca-and-medina', 'jesus-verses-by-sura', 'jesus-return-and-jizya'],
  },
];

// ---------------------------------------------------------------------------------------------
// Items (one object per stable id; the id is the public #anchor)
//   evidence: [{ from, excerpt?, label?, note? (parts), grade?, parallel? } | { heading }]
//     - all cards are visible; a long text shows its `excerpt` and collapses the rest ("Read full
//       narration"); `parallel: true` collapses the whole text of a parallel chain (cuj_ia R2.1).
//   collapsed: [{ heading, badge?, body? (md), showcase?, evidence?, printRefs?: [path | { ref, note }] }]
//   Title placeholders: {cards} = the item's evidence count (so a counted title can never drift).
// ---------------------------------------------------------------------------------------------
const SIRA = 'Sīra (Ibn Isḥāq)';

export const ITEMS = {
  'commanded-to-pardon-then-to-fight': {
    own: [`${ST(0)}.name`, `${ST(0)}.period`, `${ST(0)}.summary`],
    title: '2 Sayings That Begin “I Have Been Commanded”: Pardon in Mecca, Fight in Medina',
    hook: 'In Mecca the Prophet says, “I have been commanded to pardon, so do not fight” (Nasāʾī 3086, a sound chain in one of the six Sunni hadith books). In a saying from the Medinan period (since fighting was not commanded in Mecca): “I have been ordered (by Allah) to fight against the people until they testify” (Bukhārī 25, Muslim 22), fighting that stops when they profess Islam, not when an attack is repelled.',
    takeaway: 'Al-Ṭabarī and Ibn Kathīr read 4:77, “Restrain your hands”, as the Qurʾān recalling that Meccan command; Ibn Kathīr places the move to fighting in Medina, “when they acquired a town, invulnerability, and supporters”.',
    showcase: {
      type: 'timeline',
      points: [
        {
          year: 'Mecca',
          parts: [
            { quote: 'I have been commanded to pardon, so do not fight.', from: H.nasai3086, cite: true },
            { text: 'To Companions who asked to fight, as al-Ṭabarī reports it:' },
            { quote: 'I have not been commanded to do that.', from: 'tafsir:tabari:4:77', cite: true },
          ],
        },
        {
          year: '622 · Medina',
          parts: [
            { quote: 'Then, when Allah caused us to move to Al-Madinah, He commanded us to fight, but they refrained.', from: H.nasai3086, cite: true },
            { text: 'Ibn Kathīr:' },
            { quote: 'they were not commanded with Jihad except in Al-Madinah, when they acquired a town, invulnerability, and supporters.', from: T.ik4_77, cite: true },
          ],
        },
        {
          year: 'Medina (after 622)',
          tag: 'Bukhārī · Muslim',
          parts: [
            { quote: 'I have been ordered (by Allah) to fight against the people until they testify that none has the right to be worshipped but Allah and that Muhammad is Allah\'s Messenger (ﷺ)', from: H.bukhari25, cite: true },
            { quote: 'I have been commanded to fight against people till they testify that there is no god but Allah', from: H.muslim22, cite: true },
          ],
        },
      ],
      note: [
        {
          text: 'Al-Nisāʾ 4:77 is a Medinan verse looking back on the Meccan command “Restrain your hands”. Bukhārī 25 and Muslim 22 sit in the Medinan period because, as Nasāʾī 3086 and Ibn Kathīr state, fighting was not commanded before the move to Medina.',
        },
      ],
    },
    evidence: [
      { from: H.nasai3086, grade: 'al-Albānī (20th-century hadith scholar): sound chain (ṣaḥīḥ isnād)' },
      { from: H.bukhari25 },
      { from: H.muslim22, parallel: true },
      { from: T.ik4_77 },
      { from: T.tb4_77 },
      { from: Q.q4_77 },
    ],
    classical: 'Ibn Kathīr (d. 1373) gives two reasons why fighting was not commanded in Mecca: “the Muslims were few in number compared to the multitude of their enemies”, and “the Muslims were in their city, which was a sacred one and the most honored area on the earth, and this is why an initial command to fight was not appropriate there” ([Ibn Kathīr on 4:77](/quran/4/77/tafsir/ibn_kathir) — cf. [item 4](#what-naskh-meant) on al-Suyūṭī’s postponement view). On “the people” in Bukhārī 25, Ibn Ḥajar (d. 1449), author of the standard Bukhārī commentary *Fatḥ al-Bārī*, lists six ways commentators reconciled it with the poll tax on non-Muslims under Muslim rule (*jizya*) and with treaties: one reads it as the polytheists, citing al-Nasāʾī’s wording “I have been commanded to fight the idolators” ([Nasāʾī 3966](https://sunnah.com/nasai:3966)); the one he calls best reads the jizya as a means “to drive them to Islam” ([*Fatḥ al-Bārī* on Bukhārī 25](https://www.islamweb.net/ar/library/content/52/48/)). Ibn Taymiyya (d. 1328), whom the biographer al-Dhahabī called “Shaykh al-Islām”, reads it as fighting combatants, “not those under treaty” ([*Majmūʿ al-Fatāwā* 19/20](https://shamela.ws/book/7289/9537)).',
    comparison: 'Ibn Kathīr places the change at the move to Medina, “when they acquired a town, invulnerability, and supporters”. For the Medinan saying, the narrower readings need “the people” to mean the idolaters, or combatants not under treaty. Ibn Ḥajar cites al-Nasāʾī’s “the idolators” and calls the jizya reading best; Ibn Taymiyya cites no report for “combatants”, and on the same page says that when the four months’ notice of 9:2 ended the Prophet ordered “the raiding of all the polytheists”.\n\nThe Meccan saying is from the Prophet’s cousin Ibn ʿAbbās, for whom the Prophet prayed, “O Allah! Bestow on him the knowledge of the Book” ([Bukhārī 75](https://sunnah.com/bukhari:75)), in al-Nasāʾī’s collection (Nasāʾī 3086; al-Albānī, the 20th-century hadith scholar whose gradings Sunnah.com shows, grades its chain sound). The Medinan saying is reported by ʿUmar’s son Ibn ʿUmar, whom the Prophet called “a pious man” ([Bukhārī 3740](https://sunnah.com/bukhari:3740)), along with Anas, the Prophet’s servant for ten years (Bukhārī 6038), and Abū Hurayra.\n\nEither “the people” are the idolaters, with the People of the Book under 9:29 ([item 3](#who-9-29-names)); or those not under treaty, raided when the four months ended; or everyone, with the jizya as Ibn Ḥajar’s step. On every one of those readings, the fighting stops at conversion or the jizya tax, not at an attacker standing down; Abū Bakr cited it against Arabs who withheld zakat ([Bukhārī 1399](https://sunnah.com/bukhari:1399)): “I have been ordered (by Allah) to fight against the people until they testify…”',
  },

  // ---- Question 1 ------------------------------------------------------------------------------
  'pardon-2-109': {
    own: [`${NASKH}.caseStudy.title`],
    title: 'Ibn ʿAbbās, 4 Early Commentators and al-Ṭabarī: 2:109’s “Pardon” Was Replaced by 9:5 and 9:29',
    hook: 'Medinan 2:109 tells the believers to pardon the People of the Book “until God brings His command”. Ibn ʿAbbās names 9:5 and 9:29, two commands to fight, as replacing (abrogating) it; al-Ṭabarī names 9:29.',
    takeaway: 'On 2:109’s command to pardon the People of the Book, others read the pardon as lasting “until God brings His command”; on either reading it ends with 9:29, fighting them “until they pay the Jizyah”.',
    showcase: {
      type: 'witnesses',
      lead: { quote: 'So pardon and excuse (them), until God brings His command.', from: Q.q2_109, cite: true },
      items: [
        { who: 'Ibn ʿAbbās', work: { text: 'The Prophet’s cousin (a Companion), in Ibn Kathīr' }, quote: 'was abrogated by His saying, {So kill the idolaters wherever you find them} (9:5), and His saying, {Fight those who do not believe in God, or in the Last Day...}', from: T.ik2_109, ref: T.ik2_109 },
        { who: 'Abū l-ʿĀliya, al-Rabīʿ b. Anas, Qatāda, al-Suddī', work: { text: 'Successors (the generation after the Companions), as Ibn Kathīr groups them' }, quote: 'It was abrogated by the Ayah of the Sword.', from: T.ik2_109, ref: T.ik2_109 },
        { who: 'al-Ṭabarī', work: { text: 'Tafsīr al-Ṭabarī (Jāmiʿ al-Bayān), on 2:109' }, quote: 'So God, may His praise be exalted, abrogated the pardoning and excusing of them by imposing fighting them upon the believers', from: T.tb2_109, ref: T.tb2_109 },
      ],
      note: [{ text: '6 named authorities in 3 quotations: a Companion and four Successors as Ibn Kathīr reports them (Ibn Kathīr identifies the “Ayah of the Sword” as 9:5), and al-Ṭabarī in his own words.' }],
    },
    evidence: [{ from: Q.q2_109 }, { from: T.ik2_109 }, { from: T.tb2_109 }],
    classical: [
      {
        text: 'Makkī b. Abī Ṭālib (d. 1045), a Qurʾān-reading scholar of Cordoba, reports that “a group” held 2:109 unabrogated because the verse sets its own limit, “until God brings His command”; he judged abrogation “clearer” and called “both views sound” ([Makkī, *al-Īḍāḥ*](https://archive.org/details/20201229_20201229_2352); quoted in [al-Suyūṭī, *al-Itqān* 3/69](https://shamela.ws/book/11728/833)). Ibn Kathīr reads the same phrase as support for abrogation:',
      },
      { quote: 'The statement, {until God brings His command.} gives further support for this view.', from: 'tafsir:ibn_kathir:2:109', cite: true },
    ],
    comparison: 'The time-limit reading needs the verse’s own words, “until God brings His command”, and no further report; it ends the pardon when that command comes.\n\nIbn Kathīr reports “abrogated” from Ibn ʿAbbās, whom ʿUmar seated with the elders of Badr ([Bukhārī 4970](https://sunnah.com/bukhari:4970)), and from four of the generation after the Companions (the Successors). Al-Ṭabarī (d. 923), whom al-Dhahabī calls “foremost in tafsīr” ([*Siyar* 14/270](https://www.islamweb.net/ar/library/content/60/2879/)) and whose commentary Ibn Taymiyya calls “the soundest” ([*Majmūʿ al-Fatāwā* 13/385](https://shamela.ws/book/7289/7024)), gives the same ruling, as does the Baghdad Ḥanbalī scholar Ibn al-Jawzī ([*Nawāsikh al-Qurʾān* 1/191](https://shamela.ws/book/2176/164)).\n\nEither the pardon was abrogated, as Ibn ʿAbbās, the four Successors and al-Ṭabarī say, or it was set to last until God’s command came. On both readings it ends with the command al-Ṭabarī names, 9:29: fighting the People of the Book “until they pay the Jizyah”.',
  },

  'who-9-29-names': {
    own: [],
    title: '9:29 in al-Ṭabarī and Ibn Kathīr: The Tabūk Occasion and the Command to Fight the People of the Book',
    hook: 'Al-Ṭabarī reports from Mujāhid, Ibn ʿAbbās’s student, that 9:29 came down before the Tabūk campaign against the Byzantines (630), and explains those to be fought as “the Jews and the Christians”. Ibn Kathīr says 9:29 came “at the beginning of the command to fight the People of the Book, after the affairs of the polytheists were settled”, when they “disbelieved in Muhammad”, adding that under the jizya “they are miserable, disgraced and humiliated”.',
    takeaway: 'In al-Ṭabarī and Ibn Kathīr, Tabūk is the occasion when 9:29 came down, while the command itself reaches “the Jews and the Christians” on the grounds the verse states: “those who do not believe in God or the Last Day”.',
    showcase: {
      type: 'confrontation',
      left: {
        title: { text: 'The occasion, and modern defensive readings' },
        items: [
          {
            quote: 'regarding His command to make war on the Romans. So the Messenger of God, peace and blessings of God be upon him, went on the expedition of Tabuk after its revelation.',
            from: 'tafsir:tabari:9:29',
            ref: 'tafsir:tabari:9:29',
          },
          {
            text: 'Modern defensive readings tie 9:29 to frontier clashes with Byzantium—the clash at Muʾta in 629 ([Bukhārī 4262](https://sunnah.com/bukhari:4262)) and the march to Tabūk in 630—or cite Rashīd Riḍā’s modern commentary [*Tafsīr al-Manār* on 9:5](https://www.islamweb.net/ar/library/index.php?page=bookcontents&flag=1&bk_no=65&surano=9&ayano=5), which reads 9:5 (on the Arab polytheists) as aimed at treaty-breakers.',
          },
        ],
      },
      right: {
        title: { text: 'The scope and grounds in al-Ṭabarī and Ibn Kathīr' },
        items: [
          { quote: '{from among those who have been given the Book}, and they are the Jews and the Christians.', from: T.tb9_29, ref: T.tb9_29 },
          { quote: 'when People of the Scriptures disbelieved in Muhammad (peace and blessings of Allah be upon him), they had no beneficial faith in any Messenger', from: T.ik9_29, ref: T.ik9_29 },
          { quote: 'Therefore, it is not allowed to honor the people of Dhimmah or elevate them above Muslims, rather they are miserable, disgraced and humiliated.', from: 'tafsir:ibn_kathir:9:29', ref: 'tafsir:ibn_kathir:9:29' },
        ],
      },
      note: [
        { text: '9:29 names no treaty. The treaty verses of the same sūra keep faith with those who kept theirs:' },
        { quote: 'Fulfill their treaty with them until their term.', from: 'quran:9:4', cite: true },
        { quote: 'So long as they go straight with you, go straight with them.', from: 'quran:9:7', cite: true },
      ],
    },
    evidence: [
      { from: Q.q9_29 },
      { from: T.tb9_29 },
      { from: T.ik9_29 },
      { from: 'tafsir:ibn_kathir:9:29', excerpt: 'Therefore, it is not allowed to honor the people of Dhimmah or elevate them above Muslims, rather they are miserable, disgraced and humiliated.' },
      { from: 'quran:9:4' },
      { from: 'quran:9:7' },
    ],
    classical: 'Al-Ṭabarī’s report of when the verse came down (*sabab al-nuzūl*), from Mujāhid, places 9:29 before the Tabūk expedition toward the Byzantine frontier in 630. A year earlier, in 629, the three commanders Zayd b. Ḥāritha, Jaʿfar b. Abī Ṭālib and ʿAbd Allāh b. Rawāḥa had fallen at Muʾta ([Bukhārī 4262](https://sunnah.com/bukhari:4262)), on an expedition that the sīra reports was sent toward the Syrian border after the killing of an envoy and met Byzantine and Ghassānid forces (Ibn Isḥāq, tr. Guillaume pp. 531–532). Modern defensive readings tie 9:29 to that frontier conflict with Byzantium, and *Tafsīr al-Manār*, begun from Muḥammad ʿAbduh’s lessons and continued by Rashīd Riḍā on 9:5, reads the fighting against the Arab polytheists in this sūra as resting on their having “started against the Muslims and broken their pacts”, citing 9:13 and 9:36 ([*Tafsīr al-Manār* on 9:5](https://www.islamweb.net/ar/library/index.php?page=bookcontents&flag=1&bk_no=65&surano=9&ayano=5)).',
    comparison: 'The defensive reading needs 9:29 to be limited to Byzantine border forces after Muʾta or to a rumoured Roman build-up at Tabūk. Neither the verse nor the two classical commentaries limits it that way. In Ibn Kathīr, 9:29 marks a new stage after the conquest of Mecca: “This honorable Ayah was revealed at the beginning of the command to fight the People of the Book, after the affairs of the polytheists were settled, the people entered Allah’s religion in large numbers, and the Arabian Peninsula was secured. Allah and His Messenger commanded fighting the People of the two Scriptures, Jews and Christians, in the ninth year” ([Ibn Kathīr on 9:29](/quran/9/29/tafsir/ibn_kathir)). Al-Ṭabarī likewise defines those to be fought as “the Jews and the Christians” until they embrace Islam or pay the jizya ([al-Ṭabarī on 9:29](/quran/9/29/tafsir/tabari)). At Tabūk itself, Ibn Kathīr records that the army stayed “close to twenty days” without meeting a Byzantine army and returned, while the early campaign historian al-Wāqidī (whom al-Dhahabī calls “weak … needed for the campaigns and history”) writes of the rumoured Roman build-up in Syria: “That did not happen” ([al-Wāqidī, *al-Maghāzī* 3/990](https://shamela.ws/book/23680/1029)).\n\nThe Tabūk occasion comes from Mujāhid, who went through the whole Qurʾān with Ibn ʿAbbās three times, through al-Ṭabarī. On 9:5, *al-Manār* makes its treaty argument for the Arab polytheists, whereas 9:29 names no treaty or border clash.\n\nEither 9:29 was restricted to a Byzantine frontier clash—though the verse names “those who have been given the Book” without mentioning Rome or a broken pact—or, as al-Ṭabarī and Ibn Kathīr explain it, Tabūk was the first campaign of a general command resting on the grounds the verse itself states: “those who do not believe in God or the Last Day… until they pay tribute out of hand, and they are disgraced.”',
  },

  'what-naskh-meant': {
    own: [`${NASKH}.title`, `${NASKH}.intro`, `${NASKH}.caseStudy.abrogationScope`],
    title: '3 Classical Counts of Cancelled (Abrogated) Verses: 124, 114 and About 20',
    hook: 'Whether the verses of pardon still apply turns on whether they were cancelled (abrogated, *naskh*) or tied to weakness. Two classical manuals count 124 and 114 verses cancelled by the Sword Verse (9:5). Al-Suyūṭī (d. 1505), co-author of *Tafsīr al-Jalālayn*, counts about twenty cancelled verses in all and treats the pardon verses as applying “in weakness and small numbers”, while postponing “the command to fight, until the Muslims are strong”.',
    takeaway: 'Al-Ṭabarī limits abrogation to commands and applies it to 2:109; al-Suyūṭī keeps the pardon verses for times of “weakness and small numbers” and postpones “the command to fight, until the Muslims are strong”.',
    showcase: {
      type: 'number_fan',
      unit: {
        text: 'They count different things: verses said to be abrogated by the Sword Verse (124, 114), and abrogated verses of any kind in the whole Qurʾān (about 20).',
      },
      items: [
        {
          value: '124',
          text: 'Hibat Allāh b. Salāma (d. 1019), a Qurʾān reciter of Baghdad: the Sword Verse “abrogated 124 verses”, 109:6 among them. Al-Suyūṭī quotes the Andalusian Mālikī judge Abū Bakr Ibn al-ʿArabī giving the same number.',
          ref: { url: 'https://shamela.ws/book/5515/82', label: 'Hibat Allāh, al-Nāsikh wa-l-mansūkh, p. 98' },
        },
        {
          value: '114',
          text: 'A treatise attributed to Ibn Ḥazm: 114 “verses of turning away from the polytheists” in 48 sūras, 109:6 among them, all abrogated by 9:5. Its editor names the author Abū ʿAbd Allāh Muḥammad b. Ḥazm, not the Andalusian ʿAlī b. Aḥmad b. Ḥazm.',
          ref: { url: 'https://shamela.ws/book/2216/10', label: 'Ibn Ḥazm (attr.), al-Nāsikh wa-l-mansūkh, p. 12' },
        },
        {
          value: '≈20',
          text: 'al-Suyūṭī (d. 1505): about twenty abrogated verses in the whole Qurʾān; he treats the pardon verses as postponed, not abrogated.',
          ref: { url: 'https://shamela.ws/book/11728/841', label: 'al-Suyūṭī, al-Itqān 3/77' },
        },
      ],
    },
    evidence: [
      { from: T.tb2_106 },
      { from: T.ik2_106 },
      { from: Q.q2_106 },
      { from: Q.q16_101 },
      { from: 'tafsir:tabari:2:190', excerpt: 'the claim of the one who claims the abrogation of an Ayah that has the possibility of being unabrogated, without evidence for the soundness of his claim, is an arbitrary assertion.' },
      {
        from: 'tafsir:ibn_kathir:2:190',
        lead: [{ text: 'On the view of early commentators who held 2:190 cancelled by 9:5:' }],
        excerpt: 'However, this view is questionable; because His statement: { ...those who fight you } is rather intended to incite and encourage fighting against the enemies whose intent is fighting Islam and its people.',
      },
    ],
    collapsed: [],
    comparison: 'The postponement reading avoids calling the pardon verses cancelled by making the ruling switch with Muslim strength. As al-Suyūṭī states it, what was postponed in Mecca was “the command to fight, until the Muslims are strong; in weakness the ruling is the duty to bear harm patiently” ([*al-Itqān* 3/68–69](https://shamela.ws/book/11728/833)). Al-Ṭabarī limits abrogation to commands and permissions, applies it to 2:109 ([item 2](#pardon-2-109)), and at 2:190 calls an abrogation claim made “without evidence” “an arbitrary assertion”.\n\nEither the pardon verses were cancelled outright by 9:5 and 9:29, as Hibat Allāh and the treatise attributed to Ibn Ḥazm list them, or, on al-Suyūṭī’s postponement reading, pardon is the rule for “weakness and small numbers” and gives way to “the command to fight” once the Muslims are strong.',
    classical: 'Al-Suyūṭī says the command to be patient “in weakness and small numbers” was “in reality not abrogation” but postponement, and that this “weakens what many repeat, that the verse … was abrogated by the Sword Verse” ([al-Suyūṭī, *al-Itqān* 3/68–69](https://shamela.ws/book/11728/832)). Ibn al-Jawzī (d. 1201) attributed to “some with no understanding among the transmitters of tafsīr” the dual claim that the Sword Verse “abrogated 124 verses” and that “its end then abrogated its beginning”, calling that claim “a misunderstanding” and rejecting the idea that the end of 9:5 cancelled its opening command ([*Nawāsikh al-Qurʾān* 2/465](https://shamela.ws/book/2176/430)). He himself reports that 2:109 was abrogated ([*Nawāsikh al-Qurʾān* 1/191](https://shamela.ws/book/2176/164)).',
  },

  // ---- Question 2 ------------------------------------------------------------------------------
  'four-stages': {
    own: [`${ST(1)}.name`, `${ST(1)}.period`, `${ST(1)}.summary`, `${ST(2)}.name`, `${ST(2)}.period`, `${ST(2)}.summary`, `${ST(3)}.name`, `${ST(3)}.period`, `${ST(3)}.summary`],
    title: '4 Steps From “Restrain Your Hands” to Sūrat al-Tawba, as Ibn al-Qayyim Summarised Them',
    hook: 'Ibn al-Qayyim, Ibn Taymiyya’s student, summarised the command on fighting in four steps: “forbidden, then permitted, then commanded against those who started fighting, then commanded against all the polytheists”. Verses 4:77, 22:39, 2:190 and 9:5 stand behind the four steps.',
    takeaway: 'Al-Ṭabarī keeps 2:190 unabrogated and reads its “aggression” as killing “a child, nor a woman, nor whoever gives you the Jizyah”; others held it cancelled by Sūrat al-Tawba.',
    showcase: {
      type: 'timeline',
      points: [
        { year: 'Step 1', quote: 'Restrain your hands', from: Q.q4_77, ref: 'item:commanded-to-pardon-then-to-fight' },
        { year: 'Step 2', quote: 'Permission is given to those who fight because they have been done evil', from: Q.q22_39, ref: Q.q22_39 },
        { year: 'Step 3', parts: [{ quote: 'Fighting is prescribed for you, though it is hateful to you.', from: Q.q2_216, cite: true }, { quote: 'Fight in the way of God against those who fight against you, but do not commit aggression.', from: Q.q2_190, cite: true }] },
        { year: 'Step 4', parts: [{ quote: 'kill the idolaters wherever you find them', from: Q.q9_5, cite: true }, { quote: 'until they pay tribute out of hand', from: Q.q9_29, cite: true }] },
      ],
      note: [
        {
          text: 'Steps as Ibn al-Qayyim set them out ([Ibn al-Qayyim, *Zād al-Maʿād*, vol. 3](https://ar.wikisource.org/wiki/زاد_المعاد/المجلد_الثالث)): «وكان محرَّمًا، ثم مأذونًا به، ثم مأمورًا به لمن بدأهم بالقتال، ثم مأمورًا به لجميع المشركين».',
        },
      ],
    },
    evidence: [
      { from: Q.q22_39 },
      { from: 'hadith:nasai:3085', excerpt: 'This is the first Verse that was revealed concerning fighting.', grade: 'al-Albānī: sound chain (ṣaḥīḥ isnād)' },
      { from: Q.q2_216 },
      { from: Q.q2_190 },
      { from: Q.q9_5 },
      { from: 'hadith:bukhari:4364', excerpt: 'The last Sura which was revealed in full was Baraa (i.e. Sura-at-Tauba)' },
    ],
    classical: 'At 2:190 al-Ṭabarī prefers the view that the verse is not abrogated, and reports from the Umayyad caliph ʿUmar b. ʿAbd al-ʿAzīz that the aggression it forbids is killing women and children ([al-Ṭabarī on 2:190](/quran/2/190/tafsir/tabari)); Ibn Kathīr calls the abrogation view “questionable”, reading “those who fight you” as “intended to incite and encourage fighting against the enemies whose intent is fighting Islam and its people” ([Ibn Kathīr on 2:190](/quran/2/190/tafsir/ibn_kathir)). Al-Ḍaḥḥāk, an early commentator quoted by Ibn Kathīr, said 9:5 “abrogated every agreement … every treaty, and every term” ([Ibn Kathīr on 9:5](/quran/9/5/tafsir/ibn_kathir)).',
    comparison: 'The defensive reading needs 2:190 both to stay unabrogated and to mean fighting those who attack first. Al-Ṭabarī and Ibn Kathīr report that those who read it so, three early commentators, held it “abrogated by Bara’ah” (another name for Sūrat al-Tawba). Al-Ṭabarī keeps it unabrogated: he reports Ibn ʿAbbās, “Do not kill women, nor children, nor the very old man, nor whoever offers peace to you and restrains his hand”, and explains it as fighting those who turn away “until they return to My obedience, or give you the Jizyah” ([al-Ṭabarī on 2:190](/quran/2/190/tafsir/tabari)). Ibn Kathīr likewise continues immediately after “against the enemies whose intent is fighting Islam and its people” by equating 2:190 with 9:36 (“Just as they fight you, you fight them”, “fight against the polytheists collectively as they fight against you collectively”) and 2:191 (“expelling them from their lands from which they expelled you, as a just retribution”; [Ibn Kathīr on 2:190](/quran/2/190/tafsir/ibn_kathir)).\n\nThe third step spans Badr, Uḥud and the Trench. Sūrat al-Tawba, the last sūra revealed in full ([Bukhārī 4364](https://sunnah.com/bukhari:4364)), renounces treaties with the polytheists after four months, except with those who kept their terms ([9:1–7](/quran/9/1/tafsir/tabari)).\n\nEither 2:190 restricted fighting to attackers and was abrogated by Sūrat al-Tawba, or it stands as a rule protecting non-combatants and jizya-payers within a command that, in Ibn al-Qayyim’s account, ends “commanded against all the polytheists”.',
  },

  'meccan-verses': {
    own: [`${ERAS}.title`, `${ERAS}.comparison`, `${ERAS}.subsections[0].title`, `${ERAS}.subsections[0].content`, `${ERAS}.subsections[1]`],
    title: '13 Years in Mecca, 10 in Medina: From Persecuted Minority (109:6, 16:125) to Ruler and Commander',
    hook: 'For thirteen years in Mecca (610–622), the Prophet led a small, persecuted minority without state power, and the Meccan sūras command patience, pardon (16:125, 41:34), a proportional reply (42:39–40) and disavowal (109:6, “To you your religion and to me my religion”). Across the ten years in Medina (622–632), as ruler and commander, the commands move step by step to fighting ([item 5](#four-stages)).',
    takeaway: 'In Mecca, without political power, every Meccan verse on how to deal with opponents counsels patience, pardon or disavowal; in Medina, classical books on abrogation treat 109:6 as cancelled by 9:5, while al-Bukhārī and Ibn Kathīr read it not as a rule of permanent coexistence, but as disavowing disbelief (“{To you be your religion} means disbelief”).',
    showcase: {
      type: 'bars',
      unit: { text: 'The two periods' },
      items: [
        { value: '13', text: 'Years in Mecca' },
        { value: '10', text: 'Years in Medina' },
        { value: '{meccanSuras}', text: 'Sūras labelled Meccan' },
        { value: '{medinanSuras}', text: 'Sūras labelled Medinan' },
      ],
      note: [{ text: 'Chapter counts follow the standard Saudi printing of the Qurʾān (the King Fahd Complex muṣḥaf).' }],
    },
    evidence: [
      { from: Q.q109_6 },
      { from: Q.q16_125 },
      { from: Q.q41_34 },
      { from: 'quran:42:39-40' },
      { from: 'tafsir:ibn_kathir:109:6', excerpt: 'Al-Bukhari said, "It has been said, { To you be your religion } means disbelief, { and to me my religion } means, Islam."' },
    ],
    tables: [
      {
        title: 'The two periods',
        headers: ['', 'Mecca', 'Medina'],
        rows: [
          ['Years', '13 (610–622)', '10 (622–632)'],
          ['His position', 'Leader of a small community facing boycott and persecution from Quraysh', 'Head of the community, judge and commander'],
          [
            'What the verses command',
            'Patience and pardon ([16:125](/quran/16/125/tafsir/tabari), [41:34](/quran/41/34/tafsir/tabari)), with a proportional reply ([42:39–40](/quran/42/39/tafsir/tabari))',
            'Fighting, in steps ([item 5](#four-stages))',
          ],
        ],
      },
    ],
    comparison: 'In 622 the Prophet was invited to Yathrib to mediate between its two Arab tribes, the Aws and the Khazraj, and Yathrib became Madīnat al-Nabī, “the City of the Prophet”; in Medina the verses address a governed state—armies, spoils, treaties, tribute and neighbouring tribes—matching the political shift from a powerless minority in Mecca to an armed polity in Medina.\n\nFor 109:6 (“To you your religion and to me my religion”) to serve as a permanent rule leaving non-Muslims in peace, it must be both unabrogated and a command of coexistence. Al-Suyūṭī notes that abrogation can reach a command “worded as a statement” ([*al-Itqān* 3/68](https://shamela.ws/book/11728/832)), and two classical abrogation manuals list 109:6 among the verses cancelled by 9:5 ([Hibat Allāh b. Salāma, *al-Nāsikh wa-l-mansūkh*, p. 206](https://shamela.ws/book/5515/190); [Ibn Ḥazm (attr.), *al-Nāsikh wa-l-mansūkh*, p. 67](https://shamela.ws/book/2216/63)). Commentators who keep 109:6 unabrogated do so by reading it as a statement of disavowal rather than a permission to leave idolaters unmolested after 9:5—as al-Bukhārī’s gloss, quoted by Ibn Kathīr, explains: “{To you be your religion} means disbelief, {and to me my religion} means, Islam.”\n\nEither the Meccan verses of patience and 109:6 were cancelled by 9:5 when the Muslims gained power in Medina, or 109:6 remains a declaration of separation while the legal ruling on fighting follows the Medinan commands.',
    classical: 'For 109:6, al-Qurṭubī (d. 1273) records two views in his legal commentary ([*al-Jāmiʿ li-aḥkām al-Qurʾān* on 109:6](https://www.islamweb.net/ar/library/index.php?page=bookcontents&flag=1&bk_no=48&surano=109&ayano=6)): that it was abrogated by the Sword Verse (9:5), or that “nothing in it is abrogated, because it is a statement of fact”. Al-Ṭabarī’s rule at 2:106 exempts statements of fact, as opposed to commands, from abrogation; accordingly, al-Ṭabarī and Ibn Kathīr keep 109:6 unabrogated as a statement of disavowal from idolatry.',
  },

  // ---- Question 3 ------------------------------------------------------------------------------
  'jews-of-medina-exiled': {
    // Dataset print refs for Qaynuqāʿ name works only; they are listed once, by work, in PRINT_SOURCES.
    own: [`${CONCORD}.points[1]`, `${QAYNUQA}.target`, `${QAYNUQA}.year`, `${QAYNUQA}.outcome`, `${QAYNUQA}.sources[0]`, `${QAYNUQA}.sources[1]`],
    title: 'From “One Community With the Believers” (622) to “If You Embrace Islam, You Will Be Safe … I Want to Expel You”',
    hook: 'In the earliest biography of the Prophet (Ibn Isḥāq, in Ibn Hishām’s edition), the Medina covenant includes: “The Jews of the B. ‘Auf are one community with the believers”. In Bukhārī 3167, the Prophet later goes to the Jewish study house (*Bayt al-Midrās*) and tells them: “If you embrace Islam, you will be safe. You should know that the earth belongs to Allah and His Apostle, and I want to expel you from this land.” Bukhārī 4028 and Muslim 1766a record that he “turned out all the Jews of Medina”.',
    takeaway: 'While Bukhārī 4028 says Banū al-Naḍīr and Banū Qurayẓa “fought”, the reason the Prophet gives in Bukhārī 3167 names no broken treaty: “If you embrace Islam, you will be safe … I want to expel you from this land”; and Bukhārī 4028 includes “the Jews of Banu Haritha and every other Jew who was in Medina”, for whom no breach is recorded.',
    showcase: {
      type: 'timeline',
      points: [
        {
          year: '622',
          tag: SIRA,
          text: 'The covenant: “The Jews of the B. ‘Auf are one community with the believers (the Jews have their religion and the Muslims have theirs)” (tr. Guillaume p. 233; Ibn Isḥāq names no source for it).',
        },
        {
          year: '624',
          tag: SIRA,
          text: 'Banū Qaynuqāʿ besieged and expelled. Ibn Isḥāq, from the Medinan Successor ʿĀṣim b. ʿUmar: “the first of the Jews to break their agreement” (p. 363).',
        },
        {
          year: '625',
          tag: 'Bukhārī · Muslim',
          quote: 'so the Prophet exiled Bani An-Nadir and allowed Bani Quraiza to remain at their places',
          from: H.bukhari4028,
          ref: 'item:banu-nadir-palms',
        },
        {
          year: '627',
          tag: 'Bukhārī · Muslim',
          quote: 'He then killed their men and distributed their women, children and property among the Muslims',
          from: H.bukhari4028,
          ref: 'item:qurayza-judgment',
        },
        {
          year: 'After 627',
          tag: 'Bukhārī · Muslim',
          parts: [
            { quote: 'turned out all the Jews of Medina. Banu Qainuqa\' (the tribe of \'Abdullah b. Salim) and the Jews of Banu Haritha and every other Jew who was in Medina', from: H.muslim1766a },
            { text: '(Summing up the full expulsion, including the remaining Jewish households—“remnants” in Ibn Ḥajar’s reading.)' },
          ],
          ref: H.muslim1766a,
        },
      ],
      note: [
        {
          text: '“(violating their peace treaty)” in Bukhārī 4028 is the translator’s gloss; the Arabic reads «حاربت النضير وقريظة», “al-Naḍīr and Qurayẓa fought”.',
        },
      ],
    },
    evidence: [
      { from: H.bukhari4028, note: 'The words in brackets after \u201cfought\u201d are the translator\u2019s; the Arabic has \u201cfought\u201d.' },
      { from: H.muslim1766a, parallel: true },
      { from: 'hadith:bukhari:3167', excerpt: 'If you embrace Islam, you will be safe. You should know that the earth belongs to Allah and His Apostle, and I want to expel you from this land.' },
    ],
    collapsed: [
      {
        heading: 'The covenant and Banū Qaynuqāʿ in the sīra',
        badge: SIRA,
        body: 'Ibn Isḥāq gives the covenant’s text without a chain of narrators (tr. Guillaume p. 233). Of Qaynuqāʿ he reports, from the Medinan Successor ʿĀṣim b. ʿUmar, that they were “the first of the Jews to break their agreement” (p. 363). The market incident comes from Ibn Hishām’s note, and the confiscated weapons and goldsmith tools from al-Wāqidī.',
      },
    ],
    classical: 'Bukhārī 4028 and Muslim 1766a state that Banū al-Naḍīr and Banū Qurayẓa “fought”, and Ibn Ḥajar reads the group addressed in Bukhārī 3167 at the study house (*Bayt al-Midrās*) as the “remnants” of the Medinan Jews ([*Fatḥ al-Bārī*, Kitāb al-Jizya](https://www.islamweb.net/ar/library/content/52/5758/)). “The Jews of Banu Haritha” in Bukhārī 4028 were the Jewish confederates living among the Arab clan of Banū Ḥāritha in Medina, named alongside the other Jewish groups in the Medina covenant (Ibn Isḥāq, tr. Guillaume p. 233; cf. [Ibn Kathīr on 59:5](/quran/59/5/tafsir/ibn_kathir)).',
    comparison: 'The treaty-breach reading needs every expelled Jewish group in Medina to have been exiled for breaking a pact. For al-Naḍīr and Qurayẓa, Bukhārī 4028 says they “fought”; for Qaynuqāʿ, a report in Ibn Isḥāq calls them “the first of the Jews to break their agreement” (tr. Guillaume p. 363). By contrast, in Bukhārī 3167 the Prophet walks into the Jewish study house and states the condition for remaining in Medina in his own words, naming no breach—conversion or expulsion—and Bukhārī 4028 records that the expulsion swept in “the Jews of Banu Haritha and every other Jew who was in Medina”, for whom neither Bukhārī, Muslim, Abū Dāwūd nor Ibn Isḥāq records a treaty violation.\n\nIbn ʿUmar narrates the full expulsion (Bukhārī 4028, Muslim 1766a), and Abū Hurayra was present with the Prophet at the study house (Bukhārī 3167).\n\nEither every Jewish resident of Medina broke a pact—which no source records for the Jews of Banū Ḥāritha or those addressed at the study house—or the governing rule in Medina became the one the Prophet stated to their faces in Bukhārī 3167: “If you embrace Islam, you will be safe. You should know that the earth belongs to Allah and His Apostle, and I want to expel you from this land.”',
  },

  'qurayza-judgment': {
    own: [
      `${QURAYZA}.target`, `${QURAYZA}.year`, `${QURAYZA}.outcome`,
      `${QE(0)}.title`, `${QE(0)}.details`, `${QE(1)}.title`, `${QE(1)}.details`,
      `${QE(2)}.title`, `${QE(2)}.details`, `${QE(3)}.title`, `${QE(3)}.details`,
      `${QE(4)}.title`, `${QE(4)}.details`,
      // Dataset print refs whose page numbers were not checked: claimed here, listed by work in PRINT_SOURCES.
      `${QE(3)}.historicalSources[1]`, `${QE(3)}.historicalSources[2]`, `${QE(4)}.sources[1]`, `${QE(4)}.sources[2]`,
    ],
    title: 'Banū Qurayẓa (627): Saʿd’s Verdict and the Prophet’s Reply in 3 Wordings From Bukhārī and Muslim',
    hook: 'Banū Qurayẓa, a Jewish tribe of Medina, accepted the verdict of Saʿd b. Muʿādh, chief of the Aws and one of the leading Companions of Medina, at whose death, the Prophet said, “the Throne shook” (Bukhārī 3803): “their warriors should be killed and their children and women should be taken as prisoners”. The Prophet replies in Bukhārī and Muslim that Saʿd judged “according to Allah’s Judgment”, or “the King’s judgment”.',
    takeaway: 'Of Banū Qurayẓa’s men killed after Saʿd’s verdict, the Companion Jābir counts 400 (Tirmidhī 1582) and Ibn Isḥāq 600–900; the spared captive ʿAṭiyya says “those who had begun to grow hair (pubes) were killed” (Abū Dāwūd 4404).',
    showcase: {
      type: 'versions',
      lead: { quote: 'I give the judgment that their warriors should be killed and their children and women should be taken as prisoners.', from: H.bukhari3043, cite: true },
      items: [
        { label: 'Bukhārī 3043', quote: 'O Sa`d! You have judged amongst them with (or similar to) the judgment of the King Allah', from: H.bukhari3043, arabic: 'لَقَدْ حَكَمْتَ فِيهِمْ بِحُكْمِ الْمَلِكِ' },
        { label: 'Bukhārī 4121', quote: 'You have judged according to Allah\'s Judgment," or said, "according to the King\'s judgment', from: H.bukhari4121 },
        { label: 'Muslim 1768a', quote: 'You have adjudged by the command of God. The narrator is reported to have said: Perhaps he said: You have adjudged by the decision of a king.', from: H.muslim1768a },
      ],
    },
    evidence: [
      { from: H.bukhari3043 },
      { from: H.bukhari4121, parallel: true },
      { from: H.muslim1768a },
      { from: 'hadith:bukhari:3804', excerpt: 'You have given a judgment similar to Allah\'s Judgment (or the King\'s judgment)', parallel: true },
      { from: Q.q33_26 },
      {
        from: H.bukhari4122,
        excerpt: [
          'Gabriel came to him while he (i.e. Gabriel) was shaking the dust off his head, and said, "You have laid down the arms?" By Allah, I have not laid them down. Go out to them (to attack them)."',
          'Sa`d said, "I give my judgment that their warriors should be killed, their women and children should be taken as captives, and their properties distributed."',
        ],
      },
      { heading: 'ʿAṭiyya al-Quraẓī: “I was among the captives of Banu Qurayzah”' },
      {
        from: H.abudawud4404,
        lead: [
          { text: 'Saʿd’s verdict names “the fighters” (' },
          { arabic: 'أَنْ تُقْتَلَ الْمُقَاتِلَةُ', from: H.bukhari3043 },
          { text: ', Bukhārī 3043). ʿAṭiyya, a boy among the captives who was spared and later counted a Companion, describes who was counted among them.' },
        ],
        note: [
          { text: 'Al-Tirmidhī adds after the same report:' },
          {
            quote: 'This is acted upon according to some of the people of knowledge. They consider pubic hair an indication of the age of responsibility, if it is not known whether he has had a wet dream, or his age. This is the view of Ahmad and Ishaq',
            from: H.tirmidhi1584,
            cite: true,
          },
          {
            text: 'The hadith scholars al-Ḥākim and al-Dhahabī judged ʿAṭiyya’s report sound by the conditions of al-Bukhārī and Muslim ([al-Ḥākim, *al-Mustadrak* 2569](https://shamela.ws/book/2266/2658)).',
          },
        ],
      },
      { from: H.tirmidhi1584, parallel: true },
      { from: H.ibnmajah2541, parallel: true },
    ],
    collapsed: [
      {
        heading: 'The one woman killed',
        evidence: [
          {
            from: H.abudawud2671,
            note: '“She said: I I asked” is how the published translation reads; the Arabic reads «قالت: أنا. قلت: وما شأنك؟», “She said: ‘Me.’ I asked: ‘What is the matter with you?’”. Ibn Hishām adds that she had thrown a millstone that killed Khallād b. Suwayd (tr. Guillaume n. 711).',
          },
        ],
      },
      {
        heading: 'In other hadith collections: the Prophet’s reply and the count',
        badge: 'Other hadith collections',
        body: '- **The reply:** al-Nasāʾī ([al-Nasāʾī, *al-Sunan al-Kubrā* 8166](https://shamela.ws/book/8361/11330)) reports the Prophet saying of Saʿd, “He has judged among them with the judgment of God, which He judged above His seven heavens”; the hadith scholar al-Ḥākim ([al-Ḥākim, *al-Mustadrak* 2570](https://shamela.ws/book/2266/2659), graded sound, *ṣaḥīḥ*, by al-Dhahabī) has “from above the heavens”. Both come through one chain. Al-Nasāʾī’s wording of the verdict is that “every one … on whom the razor had passed” be killed.\n- **The count:** [Tirmidhī 1582](https://sunnah.com/tirmidhi:1582), from Jābir, says “And they were four hundred.”',
        evidence: [
          {
            from: 'hadith:tirmidhi:1582',
            excerpt: 'He (the Prophet (ﷺ)) sent to him (Sa\'d) who judged that their men should be killed, their women should be spared, and that the Muslims may share them among themselves. With this, the Messenger of Allah (ﷺ) said: \'You have judged according to Allah\'s judgement for them.\' And they were four hundred.',
            grade: 'al-Albānī and Aḥmad Shākir: sound (ṣaḥīḥ)',
          },
        ],
      },
      {
        heading: 'In the sīra: the siege, the count, the executions and the captives',
        badge: 'Sīra (Ibn Isḥāq, al-Wāqidī)',
        body: '- **The siege:** “twenty-five nights” (Ibn Isḥāq, tr. Guillaume p. 461), after their chief Kaʿb b. Asad renounced his pact with the Prophet during the siege of the Trench (p. 453). In Ibn Isḥāq, Kaʿb offers his tribe three options (accept Islam, kill their women and children and fight to the death, or attack on the Sabbath), which they refuse (pp. 461–462), and when they consult Abū Lubāba on submitting to the Prophet’s judgment he points to his throat to signify slaughter (p. 462) before they come down to submit to the Prophet’s judgment (p. 463). In al-Wāqidī’s campaign history, their envoy Nabbāsh b. Qays first asked to leave Medina on the same terms as Banū al-Naḍīr, and when the Prophet refused, asked to leave with their families and no property at all—which he also refused ([al-Wāqidī, *al-Maghāzī* 2/501–502](https://shamela.ws/book/23680/541)).\n- **The reply:** Ibn Isḥāq has “above the seven heavens” (p. 464; the chain stops at ʿAlqama b. Waqqāṣ).\n- **The count:** “600 or 700 in all, though some put the figure as high as 800 or 900” (p. 464).\n- **The executions:** trenches were dug in the market of Medina and the men’s heads were struck off there; among them Ibn Isḥāq names Ḥuyayy b. Akhṭab and Kaʿb b. Asad, “their chief” (p. 464). He names no executioners; al-Wāqidī names ʿAlī and al-Zubayr as “those who carried out the killing” ([al-Wāqidī, *al-Maghāzī* 2/513](https://shamela.ws/book/23680/553)).\n- **The captives:** the property, wives and children were divided, “a horseman got three shares”, a man without a horse one; “some of the captive women” were sent to Najd and sold “for horses and weapons” (p. 466). Ibn Isḥāq says the Prophet chose Rayḥāna for himself; she declined marriage and “remained with him … in his power” (p. 466).',
        printRefs: [
          `${QE(3)}.historicalSources[0]`,
          `${QE(4)}.sources[0]`,
        ],
      },

    ],
    classical: 'Ibn Isḥāq reports that during the siege of the Trench Qurayẓa’s chief “Ka’b broke his promise and cut loose from the bond that was between him and the apostle” (tr. Guillaume p. 453), and Bukhārī 3043 says the tribe was “ready to accept Saʿd’s judgment”. On the biography’s narrative details and its count of 600–900 killed (p. 464), Imam Mālik (d. 795), founder of the Mālikī school, faulted Ibn Isḥāq for taking accounts of the Prophet’s campaigns “from sons of Jews who had become Muslim” ([Ibn Sayyid al-Nās, *ʿUyūn al-athar* 1/66](https://www.islamweb.net/ar/library/content/1048/7/)). Modern defenders also argue that Saʿd applied the Torah’s own war law in [Deuteronomy 20:10–14](/bible/dt/20#10), which speaks of striking “every male of it with the edge of the sword” and taking the women and children as spoil.',
    comparison: 'The reply that this was “Saʿd’s verdict, or the Torah’s law in [Deuteronomy 20:10–14](/bible/dt/20#10), not the Prophet’s” faces two difficulties in the sources, of which the first is decisive. First, no report in Bukhārī, Muslim, the Sunan collections or Ibn Isḥāq says that Saʿd cited the Torah; instead, in Bukhārī 4122 the tribe “surrendered to the Prophet’s judgment but he directed them to Saʿd”, and when Saʿd pronounced his sentence the Prophet declared it “Allah’s Judgment” or “the King’s judgment” (Bukhārī 3043, 4121; Muslim 1768a), while [33:26](/quran/33/26/tafsir/tabari) credits the outcome to God (“You killed a group (of them), and took captive (another) group”). Second, as a further point in the texts, [Deuteronomy 20:10–15](/bible/dt/20#10) commands an army approaching a distant city first to “call them out peaceably”, and if they accept peace and open the gates, “all the people found in it shall be tributary and subject to you”; killing the males applies if the city refuses peace and makes war against you (20:12–13). In Bukhārī 4121 and Ibn Isḥāq (tr. Guillaume pp. 462–463, where Abū Lubāba points to his throat when asked what submitting to the Prophet’s judgment will mean), Banū Qurayẓa came down from their fortresses to submit to judgment rather than being stormed in battle. In the campaign chronicle of al-Wāqidī (whom hadith critics call weak though used for campaign detail, as in [item 3](#who-9-29-names); [*al-Maghāzī* 2/501–502](https://shamela.ws/book/23680/541)), their envoy Nabbāsh b. Qays asked the Prophet to let them leave Medina on the same terms as Banū al-Naḍīr, and when he refused, asked to leave with their families and take none of their property at all, which he refused again, requiring unconditional submission to his judgment.\n\nAs for Mālik’s critique of Ibn Isḥāq, it touches the biography’s count of 600–900, whereas the core facts sit in the canonical hadith books: Tirmidhī 1582, graded “good and sound” (*ḥasan ṣaḥīḥ*) by al-Tirmidhī, gives the count as 400 from the Companion Jābir, and ʿAṭiyya al-Quraẓī, a boy among the captives who was spared, states how the line between men and boys was drawn: “those who had begun to grow hair (pubes) were killed” (Abū Dāwūd 4404). The referral is narrated by ʿĀʾisha (Bukhārī 4122), and the Prophet’s ratification by Abū Saʿīd al-Khudrī in both Bukhārī and Muslim.\n\nEither the verdict stood apart from the Prophet, or the Qurʾān ([33:26](/quran/33/26/tafsir/tabari)) and the hadith collections place the referral, the puberty inspection and the ratification squarely under his authority (with al-Wāqidī’s campaign history adding the refused departure): “You have judged according to Allah’s Judgment.”',
  },

  'banu-nadir-palms': {
    own: [`${NADIR}.target`, `${NADIR}.year`, `${NADIR}.outcome`],
    title: 'Banū al-Naḍīr (625): Cutting Down the Date Palms and the Verse That Approved It (59:5)',
    hook: 'Although cutting down fruit-bearing trees was ordinarily forbidden, a rule Banū al-Naḍīr appealed to during the siege (“you have prohibited wanton destruction”, Ibn Isḥāq p. 437), Bukhārī 4031 and Muslim 1746a record that the Prophet had Banū al-Naḍīr’s date palms burnt and cut down, and that 59:5 then came down declaring it “by the permission of God”.',
    takeaway: 'When Banū al-Naḍīr protested that the Prophet had previously forbidden destroying palm trees, 59:5 came down during the Medinan campaign to ratify cutting and burning them “by the permission of God, and (it was) so that He might disgrace the wicked”.',
    showcase: {
      type: 'versions',
      items: [
        { label: 'Bukhārī 4031', quote: 'Allah\'s Messenger (ﷺ) had the date-palm trees of Bani Al-Nadir burnt and cut down at a place called Al- Buwaira.', from: H.bukhari4031 },
        { label: 'Muslim 1746a', quote: 'the Messenger of Allah (ﷺ) ordered the date-palms of Banu Nadir to be burnt and cut.', from: H.muslim1746a },
        { label: 'Qurʾān 59:5', quote: 'Whatever palm trees you cut down, or left standing on their roots – (it was) by the permission of God', from: Q.q59_5 },
      ],
    },
    evidence: [
      { from: H.bukhari4031 },
      { from: H.muslim1746a },
      { from: Q.q59_5 },
      { from: Q.q59_2 },
      { from: 'hadith:abudawud:3004', excerpt: ['When their letter reached the Prophet (ﷺ), they gathered Banu an-Nadir to violate the treaty. They sent a message to the Prophet (ﷺ): Come out to us with thirty men from your companions, and thirty rabbis will come out from us', 'He fought with them until they agreed to expulsion.'], grade: 'al-Albānī: sound chain (ṣaḥīḥ isnād)' },
    ],
    classical: 'A Companion’s report in Abū Dāwūd ([Abū Dāwūd 3004](https://sunnah.com/abudawud:3004); al-Albānī: sound chain, *ṣaḥīḥ isnād*; Zubair ʿAlī Zaʾī: weak) says that after Quraysh wrote to the Jews, Banū al-Naḍīr gathered “to violate the treaty” and asked the Prophet to come out with thirty men to meet thirty rabbis. Ibn Isḥāq reports, from Yazīd b. Rūmān, a Medinan Successor, that when the Prophet came to them about a blood-money payment, they took counsel to “drop a rock on him”, and that he then ordered his men “to prepare for war and to march against them” (tr. Guillaume p. 437). Bukhārī 4028 says al-Naḍīr and Qurayẓa “fought” ([item 7](#jews-of-medina-exiled)).',
    comparison: 'A defender’s reading notes that Banū al-Naḍīr were besieged for treachery (Abū Dāwūd 3004; Ibn Isḥāq p. 437) and treats cutting their palms as a wartime measure during a siege. What makes the episode significant for the shift from Mecca to Medina is the contrast with the Prophet’s own earlier prohibition on wanton destruction: as Ibn Kathīr records on [59:5](/quran/59/5/tafsir/ibn_kathir), Banū al-Naḍīr sent word to the Prophet reminding him “that he used to outlaw mischief in the earth, so why did he order that their trees be cut down?”, and some Muslims hesitated over cutting them (cf. Abū Bakr’s later general rule in *Muwaṭṭaʾ Mālik* 21/10, “Do not cut down fruit-bearing trees”).\n\nThe burning and cutting of the palms and the revelation of 59:5 are narrated by ʿUmar’s son Ibn ʿUmar in both Bukhārī 4031 and Muslim 1746a.\n\nEither the prohibition on destroying fruit-bearing trees remained a fixed moral rule, or in Medina revelation stepped in after the palms were burned to authorize what had previously been forbidden, “so that He might disgrace the wicked” ([59:5](/quran/59/5/tafsir/ibn_kathir)).',
  },

  'khaybar-terms': {
    own: [
      `${KHAYBAR}.target`, `${KHAYBAR}.year`, `${KHAYBAR}.outcome`,
      `${KE(0)}.title`, `${KE(0)}.details`, `${KE(1)}.title`, `${KE(1)}.details`,
      `${KE(2)}.title`, `${KE(2)}.details`, `${KE(3)}.title`, `${KE(3)}.details`,
      // Dataset print refs whose page numbers were not checked (al-Bayhaqī's is cited online in the Kināna drawer).
      `${KE(0)}.sources[0]`, `${KE(0)}.sources[1]`, `${KE(0)}.sources[2]`,
      `${KE(2)}.historicalSources[0]`, `${KE(2)}.historicalSources[1]`, `${KE(2)}.historicalSources[2]`,
    ],
    title: 'Khaybar (628): Surrender on Terms (“As Long As We Wish”), Then Expulsion From the Hijaz',
    hook: 'When a Jewish community outside Medina surrendered on terms and worked the land for half its harvest, the arrangement was explicitly temporary: in Bukhārī 2338 and Muslim 1551a the Prophet tells the Jews of Khaybar, “We will let you stay on this condition, as long as we wish.” Under the caliph ʿUmar they were expelled from the Hijaz (western Arabia) under the Prophet’s directive: “I will expel the Jews and Christians from the Arabian Peninsula and will not leave any but Muslim” (Muslim 1767a).',
    takeaway: 'Khaybar shows the endpoint of the Medinan policy toward Jews and Christians in Arabia: a tributary farming arrangement held “as long as we wish” (Bukhārī 2338), followed by expulsion under the Prophet’s command to leave none in the Arabian Peninsula except Muslims (Muslim 1767a).',
    classical: 'In a sermon on expelling the Jews of Khaybar, ʿUmar gave two reasons: Ibn ʿUmar “went to his land and was attacked at night”, and the Prophet had told them, “We allow you (to stand in your land) as long as Allah allows you” ([Bukhārī 2730](https://sunnah.com/bukhari:2730)). ʿUmar also reports the Prophet’s order to expel the Jews and Christians from the Arabian Peninsula ([Muslim 1767a](https://sunnah.com/muslim:1767a)).',
    showcase: {
      type: 'timeline',
      points: [
        { year: '628', quote: 'The Prophet (ﷺ) had their warriors killed, their offspring and women taken as captives.', from: H.bukhari4200, ref: H.bukhari4200 },
        { year: 'Terms', parts: [{ quote: 'We will let you stay on this condition, as long as we wish.', from: H.bukhari2338, cite: true }, { quote: 'half the produce in fruits and harvest', from: H.muslim1551a, cite: true }] },
        { year: 'ʿUmar', quote: '`Umar expelled the Jews and the Christians from Hijaz.', from: H.bukhari2338, ref: H.bukhari2338 },
      ],
    },
    evidence: [
      { from: H.bukhari2338 },
      { from: H.muslim1551a },
      { from: H.bukhari4200, excerpt: 'The Prophet (ﷺ) had their warriors killed, their offspring and women taken as captives.' },
      { from: 'hadith:bukhari:2730', excerpt: ["made a contract with the Jews concerning their properties, and said to them, 'We allow you (to stand in your land) as long as Allah allows you.'", 'went to his land and was attacked at night, and his hands and feet were dislocated, and as we have no enemies there except those Jews, they are our enemies and the only people whom we suspect, I have made up my mind to exile them.'] },
      { from: 'hadith:muslim:1767a' },
    ],
    collapsed: [
      {
        heading: 'Ṣafiyya bint Ḥuyayy, the Prophet’s wife, in Bukhārī and Muslim',
        body: 'After the conquest of Khaybar, Ṣafiyya bint Ḥuyayy—daughter of the Naḍīr chief Ḥuyayy b. Akhṭab and widow of Kināna b. Abī l-Ḥuqayq, who was killed at Khaybar—was taken among the captives, fell first to Diḥya al-Kalbī, and was then selected, manumitted and married by the Prophet on the return march ([Bukhārī 371](https://sunnah.com/bukhari:371), [Bukhārī 2235](https://sunnah.com/bukhari:2235), [Bukhārī 4201](https://sunnah.com/bukhari:4201); Ibn Isḥāq, tr. Guillaume p. 517).',
        evidence: [
          {
            from: H.bukhari371,
            excerpt: [
              'Dihya came and said, \'O Allah\'s Prophet! Give me a slave girl from the captives.\' The Prophet said, \'Go and take any slave girl.\' He took Safiya bint Huyai.',
              'Anas added: The Prophet (ﷺ) then manumitted her and married her."',
            ],
          },
          { from: H.muslim1365c, parallel: true },
          {
            from: H.muslim1365e,
            excerpt: 'there fell to the lot of Dihya a beautiful girl, and Allah\'s Messenger (ﷺ) got her in exchange of seven heads, and then entrusted her to Umm Sulaim so that she might embellish her and prepare her (for marriage) with him.',
            parallel: true,
          },
          {
            from: H.muslim1365f,
            excerpt: 'Safiyya (Allah be pleased with her) fell to the lot of Dihya in the spoils of war, and they praised her in the presence of Allah\'s Messenger (ﷺ) and said: We have not seen the like of her among the captives of war.',
            parallel: true,
          },
          {
            from: H.bukhari2235,
            excerpt: 'the beauty of Safiya bint Huyai bin Akhtab was mentioned to him and her husband had been killed while she was a bride. Allah\'s Messenger (ﷺ) selected her for himself',
          },
          { from: H.bukhari4201 },
          { from: H.muslim1365d, parallel: true },
        ],
      },
      {
        heading: 'Ibn ʿUmar’s report on the hidden treasure, in Abū Dāwūd and al-Bayhaqī',
        badge: 'Other hadith collections',
        body: '- [Abū Dāwūd 3006](https://sunnah.com/abudawud:3006): the surrender terms voided their protection if they hid anything; the Prophet asked Saʿya about Ḥuyayy’s purse, it was found, and Ibn Abī l-Ḥuqayq was killed.\n- The fuller version in the later collection of al-Bayhaqī ([al-Bayhaqī, *al-Sunan al-Kubrā* 18387](https://shamela.ws/book/7861/20906)): the Prophet “handed [Ḥuyayy’s uncle] to al-Zubayr, who touched him with torment”, and killed the two sons of Abū l-Ḥuqayq, one of them Ṣafiyya’s husband, “because of the pact they had broken”.\n- [Bukhārī 6922](https://sunnah.com/bukhari:6922) reports that the Prophet forbade punishing with fire: “Do not punish anybody with Allah’s punishment (fire).”',
        evidence: [
          {
            from: 'hadith:abudawud:3006',
            excerpt: 'on condition that they would not hide and carry away anything. If they did (so), there would be no protection for them and no treaty (with Muslims).',
            grade: 'al-Albānī: good chain (ḥasan isnād)',
          },
        ],
      },
      {
        heading: 'Kināna and the treasure in the sīra',
        badge: 'Sīra (Ibn Isḥāq)',
        body: 'Ibn Isḥāq, tr. Guillaume p. 515 (he names no source): of Kināna, keeper of al-Naḍīr’s treasure, the Prophet told the Companion al-Zubayr, “Torture him until you extract what he has”; al-Zubayr “kindled a fire with flint and steel on his chest until he was nearly dead”, and Muḥammad b. Maslama then “struck off his head, in revenge for his brother Mahmud”.',
      },

    ],
    comparison: 'A defender’s reading points to the night attack on ʿUmar’s son Ibn ʿUmar at Khaybar as the trigger for ʿUmar’s expulsion order (Bukhārī 2730). In that same sermon, however, ʿUmar names no identified culprit—“as we have no enemies there except those Jews, they are our enemies and the only people whom we suspect, I have made up my mind to exile them”—and rests the right to expel them on the Prophet’s original proviso at the conquest, “We will let you stay on this condition, as long as we wish” (Bukhārī 2338).\n\nBoth the original proviso and ʿUmar’s sermon are narrated by Ibn ʿUmar in Bukhārī (2338, 2730) and Muslim (1551a), and ʿUmar himself narrates the Prophet’s Peninsula-wide command in Muslim 1767a.\n\nTaken together, the three steps show that in the Hijaz tributary surrender did not secure permanent residence: the expulsion reached beyond Khaybar to “the Jews and the Christians from Hijaz” (Bukhārī 2338), fulfilling the Prophet’s directive, “I will expel the Jews and Christians from the Arabian Peninsula and will not leave any but Muslim” (Muslim 1767a).',
  },

  // ---- Question 4 ------------------------------------------------------------------------------
  'ask-the-readers-then-altered': {
    own: [`${CONCORD}.points[2].topic`, `${CONCORD}.points[2].description`, `${FRACTURE}.categories[1].category`],
    title: '“Ask Those Who Read the Book Before You” (Meccan 10:94) Beside 3 Medinan Verses on Altering It',
    hook: 'Meccan 10:94 tells the Prophet, if in doubt, to “ask those who have been reciting the Book before you”. Medinan 2:75 says “a group of them” heard “the word of God, (and) then altered it”, 2:79 says “woe to those who write the Book with their (own) hands”, and 5:13 says “They alter words from their positions”.',
    takeaway: 'Al-Ṭabarī narrows Meccan 10:94 to converts like ʿAbd Allāh b. Salām, and commentators read the Medinan verses as charging distortion of meaning or text; in Bukhārī 7363 Ibn ʿAbbās cites them to forbid Muslims from asking the People of the Book.',
    showcase: {
      type: 'confrontation',
      left: { title: { text: 'Meccan sūra · 10:94' }, items: [{ quote: 'If you are in doubt about what We have sent down to you, ask those who have been reciting the Book before you.', from: Q.q10_94, ref: Q.q10_94 }] },
      right: { title: { text: 'Medinan sūra · 2:75' }, items: [{ quote: 'a group of them has already heard the word of God, (and) then altered it after they had understood it', from: Q.q2_75, ref: Q.q2_75 }] },
      note: [
        { text: '5:13 keeps its own qualifiers:' },
        { quote: 'except for a few of them. Yet pardon them and excuse (them).', from: Q.q5_13, cite: true },
      ],
    },
    evidence: [{ from: Q.q10_94 }, { from: Q.q2_75 }, { from: Q.q2_79 }, { from: Q.q5_13 }],
    classical: [
      { text: 'Al-Ṭabarī reads Meccan 10:94 as an Arabic form of address that implies no doubt, narrows “those who have been reciting the Book” to converts to Islam “like ʿAbdullah bin Salam and his like, from among the people of truth and belief in you”, and reports from the Successor Qatāda that the Prophet said:' },
      { quote: 'I neither doubt, nor do I ask.', from: 'tafsir:tabari:10:94', cite: true },
      {
        text: 'On the Medinan verses charging distortion (*taḥrīf*), commentators also cite two points from Ibn ʿAbbās: on 2:75, a report through Muḥammad b. Isḥāq that “heard the word of God” referred to “those who asked Musa to see their Lord, so they were struck by lightning” (the seventy chosen in 7:155), who went with Moses to the Mount, heard God’s speech, and “altered what He had ordered them with” ([Ibn Kathīr on 2:75](/quran/2/75/tafsir/ibn_kathir)); and in an un-chained chapter note in *Ṣaḥīḥ al-Bukhārī* (*Kitāb al-Tawḥīd*, before [Bukhārī 7553](https://sunnah.com/bukhari:7553); Ibn Ḥajar, [*Fatḥ al-Bārī* 13/523](https://shamela.ws/book/1673/8730)), the gloss that “no one removes the wording of one of the Books of God, Mighty and Majestic; rather they distort it by interpreting it contrary to its true interpretation” («وَلَيْسَ أَحَدٌ يُزِيلُ لَفْظَ كِتَابٍ مِنْ كُتُبِ اللَّهِ عَزَّ وَجَلَّ، وَلَكِنَّهُمْ يُحَرِّفُونَهُ يَتَأَوَّلُونَهُ عَلَى غَيْرِ تَأْوِيلِهِ»).',
      },
    ],
    comparison: 'Both classical replies are tested by the Medinan texts themselves and by Ibn ʿAbbās’s full chained (*musnad*) narration in [Bukhārī 7363](https://sunnah.com/bukhari:7363). First, while Ibn Isḥāq’s report ties 2:75 to “those who asked Musa to see their Lord” at the Mount, Ibn Kathīr notes on the same page that al-Suddī (“It is the Tawrah, they altered it”), Qatāda, Mujāhid and Abū l-ʿĀliya read 2:75 more generally of the Torah and the Jewish scholars ([Ibn Kathīr on 2:75](/quran/2/75/tafsir/ibn_kathir)). Second, four verses after 2:75, Medinan [2:79](/quran/2/79/tafsir/ibn_kathir) speaks explicitly of textual fabrication—“So woe to those who write the Book with their (own) hands, (and) then say, ‘This is from God’”—and al-Ṭabarī explains [5:13](/quran/5/13/tafsir/tabari) (“They alter words from their positions”) in the same terms: “they change it, and write with their hands other than what Allah, Majestic and Mighty, sent down upon their Prophet.” Third, in the chained narration of [Bukhārī 7363](https://sunnah.com/bukhari:7363) (also quoted by [Ibn Kathīr on 2:79](/quran/2/79/tafsir/ibn_kathir)), Ibn ʿAbbās himself echoes 2:79 word for word to forbid Muslims from consulting the People of the Book: “Allah has told you that the people of the scripture (Jews and Christians) changed their scripture and distorted it, and wrote the scripture with their own hands and said, ‘It is from Allah.’”\n\nAs for narrowing Meccan 10:94 to Medinan converts like ʿAbd Allāh b. Salām (a Jewish scholar of Banū Qaynuqāʿ who became Muslim in Medina, Bukhārī 3329, 4028), 10:94 is a Meccan verse addressed to the Prophet before the move to Medina, and Qatāda’s report gives no Companion between himself and the Prophet.\n\nWhether a commentator reads the Medinan charge as corrupting the meaning (Bukhārī’s chapter note before 7553; [Ibn Kathīr on 4:46](/quran/4/46/tafsir/ibn_kathir)) or altering the written text ([2:79](/quran/2/79/tafsir/ibn_kathir), [al-Ṭabarī on 5:13](/quran/5/13/tafsir/tabari), [Bukhārī 7363](https://sunnah.com/bukhari:7363)), the shift between the two periods is the same: Meccan 10:94 sends the Prophet to those who read the earlier Book to confirm what was sent down, whereas the Medinan verses and Ibn ʿAbbās’s rule treat them and their books as untrustworthy.',
  },

  'qibla-jerusalem-to-kaaba': {
    own: [`${CONCORD}.title`, `${CONCORD}.points[0].topic`, `${CONCORD}.points[0].description`, `${FRACTURE}.categories[0].category`],
    title: 'The Liturgical Break in Medina (624): From Facing Jerusalem to Facing the Kaʿba (2:142–144)',
    hook: 'When the Prophet arrived in Medina, he prayed facing Jerusalem for sixteen or seventeen months—“Jews and the people of the scriptures used to be pleased”—and then in 624, two months before Badr, turned in prayer away from Jerusalem to the Kaʿba in Mecca, which “they disapproved of” (Bukhārī 40). Medinan 2:142 calls those who objected to the change “the fools among the people”.',
    takeaway: 'In al-Ṭabarī and Ibn Kathīr on 2:142, facing Jerusalem at first in Medina sought to “reconcile the hearts of the People of the Scripture”; turning away from Jerusalem to the Kaʿba sixteen months later marked the visible liturgical break with the Jews of Medina, whom al-Ṭabarī identifies as “the fools among the people” in 2:142.',
    showcase: {
      type: 'timeline',
      points: [
        { year: 'Medina (622)', quote: 'He offered his prayers facing Baitul-Maqdis (Jerusalem) for sixteen or seventeen months', from: H.bukhari40, ref: H.bukhari40 },
        { year: '624 · The turn', parts: [{ quote: 'Turn your face in the direction of the Sacred Mosque', from: Q.q2_144, cite: true }, { quote: 'when he changed his direction towards the Ka\'ba, during the prayers, they disapproved of it.', from: H.bukhari40, cite: true }] },
      ],
    },
    evidence: [{ from: H.bukhari40 }, { from: 'hadith:muslim:525a', parallel: true }, { from: Q.q2_144 }],
    classical: 'In his commentary on [2:142](/quran/2/142/tafsir/tabari), al-Ṭabarī records two views on why the Prophet initially faced Jerusalem (*Bayt al-Maqdis*): from Ibn ʿAbbās, that God commanded it when the Prophet migrated to Medina, “and [the majority of] its people were the Jews … So the Jews rejoiced”; and from Abū l-ʿĀliya and al-Ḥasan al-Baṣrī, that the Prophet chose Jerusalem “in order to reconcile the hearts of the People of the Scripture” and “so that they might believe in him and follow him”. Sixteen or seventeen months after the arrival in Medina—two months before the battle of Badr, in al-Ṭabarī’s report from Ibn al-Musayyab—[2:144](/quran/2/144/tafsir/tabari) directed prayer to the Kaʿba instead.',
    comparison: 'On both classical explanations of the first qibla, the direction of daily prayer in early Medina was aligned with the Jewish direction of prayer toward Jerusalem, pleasing the People of the Book (Bukhārī 40, Muslim 525a).\n\nWhen the Jewish tribes of Medina did not accept the Prophet’s claim, [2:142–144](/quran/2/142/tafsir/tabari) turned the prayer away from Jerusalem to the Kaʿba in Mecca and answered the objectors as “the fools among the people”—whom al-Ṭabarī identifies, from Ibn ʿAbbās, Mujāhid and al-Barāʾ, as the Jews and the hypocrites ([al-Ṭabarī on 2:142](/quran/2/142/tafsir/tabari); [Ibn Kathīr on 2:142](/quran/2/142/tafsir/ibn_kathir)).\n\nAlongside the shift in how the earlier scriptures are spoken of ([item 11](#ask-the-readers-then-altered)), the change of the qibla marks the moment in 624 when early Medinan accommodation with the Jewish tribes gave way to a separate Meccan sanctuary and a public break.',
  },

  'same-words-mecca-and-medina': {
    own: [`${FRACTURE}.categories[2].category`, `${FRACTURE}.categories[3].category`],
    title: 'From a Past Story (7:166, 2:65) to Addressing the People of the Book in Medina (5:59–60, 5:82)',
    hook: 'In A. J. Droge’s translation (the English Qurʾān translation used on this site), “Become apes, skulking away!” (Arabic *khāsiʾīn*, usually rendered “despised and rejected”) appears word for word in a Meccan story about an ancient Sabbath-breaking town (7:166) and in a Medinan retelling (2:65). What changes in Medina is how that curse is used: 5:59–60 addresses the living People of the Book directly with “some of whom He made apes, and pigs”, and 5:82 calls the Jews and the idolaters “the most violent of people in enmity to the believers”.',
    takeaway: 'While the Sabbath-breakers’ curse (“Become apes, skulking away!”) is narrated as a past story in both Mecca (7:166) and Medina (2:65), the Medinan sūras turn that past punishment into a direct rebuke of the People of the Book around the Prophet (5:59–60) and rank the Jews alongside the idolaters as the believers’ fiercest enemies (5:82).',
    classical: 'Commentators take the two Sabbath-breaking verses (7:166, 2:65) to describe one ancient town whose offenders were transformed and died out without descendants; Ibn Kathīr reports from Ibn ʿAbbās: “The transformed have no offspring” ([Ibn Kathīr on 2:65](/quran/2/65/tafsir/ibn_kathir)). On [5:59–60](/quran/5/60/tafsir/ibn_kathir), Ibn Kathīr reports that when a group of Jews asked the Prophet which messengers he believed in and rejected Jesus, the verses answered them directly by recalling the curse and transformation upon their predecessors.',
    showcase: {
      type: 'versions',
      items: [
        { label: '7:166 · Meccan', quote: 'We said to them, ‘Become apes, skulking away!’', from: Q.q7_166, mark: 'Become apes, skulking away!' },
        { label: '2:65 · Medinan', quote: 'We said to them, ‘Become apes, skulking away!’', from: Q.q2_65, mark: 'Become apes, skulking away!' },
      ],
      note: [{ text: '5:82 (Medinan):' }, { quote: 'the most violent of people in enmity to the believers are the Jews and the idolaters. Certainly you will find that the closest of them in affection to the believers are those who say, ‘We are Christians.’', from: Q.q5_82, cite: true }],
    },
    evidence: [{ from: Q.q7_166 }, { from: Q.q2_65 }, { from: Q.q5_60 }],
    collapsed: [
      {
        heading: '3 more Medinan verses on enmity and killing the prophets (5:82, 2:61, 4:155)',
        evidence: [{ from: Q.q5_82 }, { from: Q.q2_61 }, { from: Q.q4_155 }],
      },
    ],
    comparison: 'A reading that points to Meccan [7:166](/quran/7/166/tafsir/tabari) and Medinan [2:65](/quran/2/65/tafsir/tabari) shows that the story of the ancient Sabbath-breakers was already told in Mecca in the same words (“Become apes, skulking away!”—*khāsiʾīn*, “despised”).\n\nWhat differs between the two periods is the target and framing. In Meccan 7:163–166, the episode is part of a historical narrative about Moses’ people, closing with the note that some of them are righteous (7:168). In the Medinan sūras, by contrast, [5:59–60](/quran/5/60/tafsir/tabari) addresses “People of the Book!” directly in present dispute—“Shall I inform you of (something) worse than that? Retribution with God! Whomever God has cursed, and whomever He is angry with – some of whom He made apes, and pigs”—while [2:61](/quran/2/61/tafsir/tabari) and [4:155](/quran/4/155/tafsir/tabari) charge them with killing the prophets, and [5:82](/quran/5/82/tafsir/tabari) declares “the Jews and the idolaters” the most hostile of people to the believers.\n\nThus the wording of the ancient Sabbath story stays constant across both periods, while in Medina it becomes part of a direct indictment of the Jewish community.',
  },

  'jesus-verses-by-sura': {
    own: [`${TITLES}.title`, `${TITLES}.attributes[0].attribute`, `${TITLES}.attributes[1].attribute`, `${TITLES}.attributes[2].attribute`, `${REBUTTALS}.title`, `${REBUTTALS}.content`],
    title: 'From Doctrinal Dispute on Jesus (19:35, 4:171) to Sūrat al-Tawba’s “(May) God Fight Them” (9:29–30)',
    hook: 'Both Meccan and Medinan sūras reject the Christian doctrine that Jesus is the Son of God (Meccan 19:35; Medinan 4:171, 5:72–73) while honouring him as Messiah, “a word from Him” and “a spirit from Him” (3:45, 4:171). What changes in Medina’s last full sūra, al-Tawba, is what follows from that doctrinal disagreement: immediately after 9:29 commands fighting the People of the Book until they pay tribute, 9:30 names the Christian confession—“the Christians say, ‘The Messiah is the son of God’”—and answers it with “(May) God fight them.”',
    takeaway: 'The theological disagreement over Jesus’ sonship begins in Mecca (19:35) and expands in Medina to denying the Trinity and the crucifixion (4:157, 4:171); in Sūrat al-Tawba (9:29–30), that doctrinal charge is paired directly with the military command to fight the People of the Book until they pay the jizya in humiliation.',
    showcase: {
      type: 'timeline',
      points: [
        { year: 'Meccan', parts: [{ quote: 'to make him a sign to the people and a mercy from Us', from: Q.q19_19, cite: true }, { quote: 'It is not for God to take any son.', from: 'quran:19:35', cite: true }] },
        { year: 'Medinan', parts: [{ quote: 'His word, which He cast into Mary, and a spirit from Him. So believe in God and His messengers, but do not say, ‘Three.’', from: Q.q4_171, cite: true, mark: ['His word, which He cast into Mary, and a spirit from Him', 'do not say, ‘Three.’'] }, { quote: 'they did not kill him, nor did they crucify him', from: Q.q4_157, cite: true }] },
        { year: 'al-Tawba', parts: [{ quote: 'the Christians say, ‘The Messiah is the son of God.’', from: Q.q9_30, cite: true }, { quote: '(May) God fight them.', from: Q.q9_30 }, { text: 'The verse after 9:29 ([item 3](#who-9-29-names)).' }] },
      ],
    },
    evidence: [
      { heading: 'Meccan sūra (Maryam)' },
      { from: 'quran:19:35' },
      { heading: 'Medinan sūras (Āl ʿImrān, al-Nisāʾ)' },
      { from: Q.q3_45 },
      { from: Q.q4_171 },
      { from: Q.q4_157 },
      { heading: 'Sūrat al-Tawba (9:30)' },
      { from: Q.q9_30 },
    ],
    collapsed: [
      {
        heading: '8 more passages on Jesus in Maryam, al-Ikhlāṣ, Āl ʿImrān and al-Māʾida',
        evidence: [
          { from: Q.q19_19 },
          { from: 'quran:19:88-92' },
          { from: 'quran:112:3' },
          { from: Q.q3_42 },
          { from: Q.q3_49 },
          { from: Q.q5_72 },
          { from: Q.q5_73 },
          { from: Q.q5_110 },
        ],
      },
    ],
    comparison: 'Ibn Isḥāq links the opening eighty verses of Medinan Āl ʿImrān (sūra 3) to a peaceful dispute with the sixty-man Christian delegation from Najrān (tr. Guillaume pp. 270–272; cf. Bukhārī 4380), where high titles for Jesus (3:42–49) sit beside theological rebuttal.\n\nRead across the whole Qurʾān, the denial that God has a son is already present in Mecca (19:35, 19:88–92, 112:3), while the explicit rebuttals of “Three” (4:171, 5:73) and of the crucifixion (4:157) belong to the Medinan sūras.\n\nThe decisive shift comes in Sūrat al-Tawba, the last sūra revealed in full (Bukhārī 4364): where Meccan and earlier Medinan passages answered Christian belief with argument and warning, [9:29–30](/quran/9/30/tafsir/tabari) commands fighting the People of the Book until they pay the jizya and immediately cites the confession “The Messiah is the son of God” with the imprecation, “(May) God fight them. How are they (so) deluded?”',
    classical: 'Ibn Isḥāq reports that a delegation of sixty riders from the Christians of Najrān, in southern Arabia, came to the Prophet in Medina, and that God sent down “the beginning of the sura of the Family of ‘Imran up to more than eighty verses” about their words (tr. Guillaume pp. 270–272); part of his account comes from the Medinan narrator Muḥammad b. Jaʿfar b. al-Zubayr, who was not a Companion. Ibn Kathīr repeats it ([Ibn Kathīr on 3:61](/quran/3/61/tafsir/ibn_kathir)), and [Bukhārī 4380](https://sunnah.com/bukhari:4380) records the delegation.',
  },

  'jesus-return-and-jizya': {
    own: [`${REBUTTALS}.eschatology.topic`],
    title: '3 Reports in Bukhārī and Muslim: Jesus Will “Break the Cross … and Abolish the Jizya”',
    hook: 'Abū Hurayra reports in Bukhārī and Muslim that the son of Mary will descend, “break the Cross and kill the pig and abolish the Jizya”, the tax of 9:29. Al-Nawawī, author of the *Forty Hadith* and *Riyāḍ al-Ṣāliḥīn*, explains that Jesus “will accept nothing from the unbelievers but Islam”.',
    takeaway: 'In Bukhārī and Muslim, the jizya arrangement of 9:29 is itself temporary: when Jesus returns at the end of time, he will “break the Cross and kill the pig and abolish the Jizya”, leaving Christians and Jews, as al-Nawawī explains, “only Islam or killing”.',
    classical: 'Al-Nawawī, in his commentary on Ṣaḥīḥ Muslim (following an earlier commentator, al-Khaṭṭābī), explains “abolish the Jizya”: Jesus “will accept nothing from the unbelievers but Islam”, and whoever offers the jizya will not be spared by it: “only Islam or killing” ([al-Nawawī, *Sharḥ Ṣaḥīḥ Muslim*](https://www.islamweb.net/ar/library/content/53/452/)).',
    comparison: 'The reply that these hadiths describe the end of time rather than ordinary Islamic law agrees with al-Nawawī on their timing, while confirming what the classical tradition sees as the final horizon of 9:29. Al-Nawawī rejects the suggestion of an earlier scholar, al-Qāḍī ʿIyāḍ, that the jizya would then be imposed on all unbelievers, calling it “not acceptable”, and answers the question of how Jesus can set aside today’s jizya law: the jizya ruling “is limited to the time before Jesus”, and “our Prophet is the one who announced the abrogation” ([al-Nawawī, *Sharḥ Ṣaḥīḥ Muslim*](https://www.islamweb.net/ar/library/content/53/452/)).\n\nAll three reports come from Abū Hurayra, who stayed close to the Prophet ([Bukhārī 118](https://sunnah.com/bukhari:118)), in both Bukhārī (2222, 3448) and Muslim (155a).\n\nIn the classical commentators’ own picture, then, the trajectory from Mecca to Medina does not stop at permanent coexistence under the jizya tax: 9:29’s tributary status lasts until the return of Jesus, when the cross is broken, the jizya is abolished, and the remaining choice is “only Islam or killing”.',
    showcase: {
      type: 'versions',
      items: [
        { label: 'Bukhārī 2222', quote: 'will break the Cross and kill the pig and abolish the Jizya', from: H.bukhari2222, mark: 'abolish the Jizya' },
        { label: 'Bukhārī 3448', quote: 'he will break the Cross and kill the pigs and there will be no Jizya', from: H.bukhari3448, mark: 'there will be no Jizya' },
        { label: 'Muslim 155a', quote: 'He will break crosses, kill swine and abolish Jizya', from: H.muslim155a, mark: 'abolish Jizya' },
      ],
      note: [{ text: 'The glosses on “Jizya” in the English are the translator’s. The jizya is the tribute of 9:29 ([item 3](#who-9-29-names)).' }],
    },
    evidence: [{ from: H.bukhari2222 }, { from: H.bukhari3448 }, { from: H.muslim155a }],
  },
};

// ---------------------------------------------------------------------------------------------
// Closing (not items; no count)
// ---------------------------------------------------------------------------------------------
export const CLOSING = {
  readToday: {
    id: 'how-read-today',
    own: [`${FRAMEWORKS}.title`, `${FRAMEWORKS}.frameworks`],
    title: 'How do Muslims read these verses today?',
    cards: [
      {
        who: 'A traditional reading',
        text: 'Ibn al-Qayyim’s fourth and final step: fighting “commanded against all the polytheists” (*Zād al-Maʿād*, vol. 3). Al-Ṭabarī and Ibn Kathīr read 9:29 as a general command to fight the Jews and the Christians until they embrace Islam or pay the jizya in humiliation. Ibn Taymiyya reads “I have been ordered to fight against the people” as fighting combatants, “not those under treaty” (*Majmūʿ al-Fatāwā* 19/20).',
      },
      {
        who: 'A modern reformist reading',
        text: '*Tafsīr al-Manār*, begun from Muḥammad ʿAbduh’s lessons and continued by Rashīd Riḍā on 9:5, reads 9:5 (on the Arab polytheists) as aimed at treaty-breakers, citing 9:13 and 9:36; Fazlur Rahman (d. 1988) proposed reading Medinan rulings for their underlying moral aims (*Islam and Modernity*, 1982). More radically, the Sudanese thinker Maḥmūd Muḥammad Ṭāhā (*The Second Message of Islam*, 1967) argued that the Meccan verses carry Islam’s permanent message while the Medinan laws applied to 7th-century society—a view condemned by mainstream Islamic bodies and for which he was executed for apostasy in Sudan in 1985.',
      },
      {
        who: 'Western historical scholarship',
        text: 'Since Theodor Nöldeke’s *Geschichte des Qorâns* (1860) and W. Montgomery Watt’s *Muhammad at Mecca* (1953) and *Muhammad at Medina* (1956), Western historians have traced how the Qurʾān’s rulings shift alongside the Prophet’s move from Meccan preacher to Medinan ruler, while later revisionist historians (such as John Wansbrough and Patricia Crone) questioned how far the later biographies can be relied on. None of the evidence on this page depends on a Western reconstruction: every Meccan and Medinan label here follows the standard Saudi printing of the Qurʾān (the King Fahd Complex muṣḥaf) and the classical Sunni commentaries.',
      },
    ],
    outro: 'The readings differ on what the Medinan verses on fighting rest on. On 9:5, *al-Manār* makes its treaty argument for the Arab polytheists; on 9:29, al-Ṭabarī and Ibn Kathīr read the verse as a general command to fight “the Jews and the Christians” once the affairs of the Arabian polytheists were settled ([item 3](#who-9-29-names)). And on the earlier pardon verse 2:109, al-Ṭabarī states the classical ruling in his own words: God “abrogated the pardoning and excusing of them by imposing fighting them upon the believers” ([item 2](#pardon-2-109)).',
  },
  textsShow: {
    id: 'what-the-texts-show',
    own: [`${CONCLUSION}.title`, `${CONCLUSION}.text`],
    title: 'What the texts on this page show',
    intro: 'One line per item; each links back to its texts.',
  },
  reflection: {
    id: 'reflection',
    own: [`${SYNTHESIS}.title`, `${SYNTHESIS}.comparisonRows`],
    disclosure: 'Ready Apologia is written by Christians. What follows is our perspective, not part of the evidence above.',
    title: 'A Christian reflection: Jesus and the sword',
    headers: ['', 'Jesus, in the Gospels', 'The texts on this page'],
    rows: [
      {
        theme: 'Power',
        jesus: '“My kingdom is not of this world” ([John 18:36](/bible/jn/18#36)).',
        other: '“I have been ordered (by Allah) to fight against the people until they testify” ([Bukhārī 25](https://sunnah.com/bukhari:25)); fight the People of the Book “until they pay tribute” ([9:29](/quran/9/29/tafsir/tabari)).',
      },
      {
        theme: 'The sword',
        jesus: '“Put your sword back” ([Matthew 26:52](/bible/mt/26#52)); do not strike back ([Matthew 5:39](/bible/mt/5#39)); “Love your enemies” ([Matthew 5:44](/bible/mt/5#44)).',
        other: 'Qurayẓa’s fighting men killed on a verdict the Prophet called Allah’s judgment ([Bukhārī 3043](https://sunnah.com/bukhari:3043)).',
      },
      {
        theme: 'Leaving the faith',
        jesus: 'Many disciples left him, and he asked the Twelve, “Do you also want to go away?” ([John 6:66–67](/bible/jn/6#66)).',
        other: '“Whoever changes his religion, kill him” ([Bukhārī 6922](https://sunnah.com/bukhari:6922)); “the deserter of his Din” ([Muslim 1676a](https://sunnah.com/muslim:1676a)).',
      },
      {
        theme: 'The end of the mission',
        jesus: 'In the Gospels he lays down his life ([John 10:18](/bible/jn/10#18)).',
        other: 'At his death he ruled most of Arabia.',
      },
    ],
    note: '[Luke 22:36–38](/bible/lk/22#36) and [Matthew 10:34](/bible/mt/10#34) also speak of a sword. We read them in their context, and the Gospels’ own answer to the sword is [Matthew 26:52](/bible/mt/26#52).',
    evidence: [
      { from: H.bukhari6922, note: 'Narrated by ʿIkrima, Ibn ʿAbbās’s freedman and student, from Ibn ʿAbbās. \u201cIslamic\u201d is the translator\u2019s addition; the Arabic is «من بدّل دينه فاقتلوه», \u201cwhoever changes his religion, kill him\u201d.' },
      { from: 'hadith:muslim:1676a', note: 'Narrated by ʿAbd Allāh b. Masʿūd, the first of the four men the Prophet named to learn the Qurʾān from ([Bukhārī 3808](https://sunnah.com/bukhari:3808)). Ibn Ḥajar explains “abandoning the community”: “he left them by apostatising; it describes the one who leaves, not a separate trait, or the cases would be four” ([Ibn Ḥajar, *Fatḥ al-Bārī* on Bukhārī 6878](https://www.islamweb.net/ar/library/content/52/12597/)).' },
      { from: 'hadith:bukhari:6878', parallel: true },
    ],
  },
  /** "What others are saying" (collapsed, nofollow): { title, url, type } rows. Empty = section hidden. */
  perspective: [],
};

// ---------------------------------------------------------------------------------------------
// Extra hadith (not in the dataset; proposed as new sources in data_proposals.md)
// `text` is the verbatim English of the fawazahmed0/hadith-api mirror of Sunnah.com (the mirror's leading
// "Narrated It was narrated…" artefact excepted). When the repo corpus (src/data/hadith) carries the same
// Bukhārī/Muslim number, the build checks `text` against it.
// ---------------------------------------------------------------------------------------------
const MIRROR = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';
export const EXTRA_HADITH = {
  'nasai:3085': {
    url: 'https://sunnah.com/nasai:3085',
    reference: 'Book 25, Hadith 1',
    text: 'It was narrated that Ibn Abbas said:“When the Prophet was expelled from Makkah, Abu Bakr said to him: ‘They have driven out their Prophet, verily to Allah we belong and to Him we return. They are surely doomed.’ Then it was revealed: ‘Permission to fight (against disbelievers) is given to those (believers) who are fought against, because they have been wronged; and surely, Allah is able to give them (believers) victory.’ Then I knew that there would be fighting.” Ibn Abbas said: “This is the first Verse that was revealed concerning fighting.”',
    mirror: `${MIRROR}/eng-nasai/3085.json`,
    reason: 'First verse revealed on fighting (22:39), per Ibn ʿAbbās; factcheck §4 and cuj_ia Round 1b item 5.',
  },
  'bukhari:4364': {
    url: 'https://sunnah.com/bukhari:4364',
    reference: 'Book 64, Hadith 398',
    text: 'Narrated Al-Bara:The last Sura which was revealed in full was Baraa (i.e. Sura-at-Tauba), and the last Sura (i.e. part of a Sura) which was revealed was the last Verses of Sura-an-Nisa\':-- "They ask you for a legal decision. Say: Allah directs (thus) About those who have No descendants or ascendants As heirs',
    mirror: `${MIRROR}/eng-bukhari/4364.json`,
    reason: 'Dates Sūrat al-Tawba (factcheck §4, Stage 4).',
  },
  'bukhari:3804': {
    url: 'https://sunnah.com/bukhari:3804',
    reference: 'Book 63, Hadith 47',
    text: 'Narrated Abu Sa`id Al-Khudri:Some people (i.e. the Jews of Bani Quraiza) agreed to accept the verdict of Sa`d bin Mu`adh so the Prophet (ﷺ) sent for him (i.e. Sa`d bin Mu`adh). He came riding a donkey, and when he approached the Mosque, the Prophet (ﷺ) said, "Get up for the best amongst you." or said, "Get up for your chief." Then the Prophet (ﷺ) said, "O Sa`d! These people have agreed to accept your verdict." Sa`d said, "I judge that their warriors should be killed and their children and women should be taken as captives." The Prophet said, "You have given a judgment similar to Allah\'s Judgment (or the King\'s judgment)',
    mirror: `${MIRROR}/eng-bukhari/3804.json`,
    reason: 'The hadith the old FAQ cited for "above the seven heavens"; its real wording (factcheck Top 6).',
  },
  'tirmidhi:1582': {
    url: 'https://sunnah.com/tirmidhi:1582',
    reference: 'Book 21, Hadith 44',
    text: 'Narrated Jabir:"On the day of (the battle of) Al-Ahzab, Sa\'d bin Mu\'adh was struck by an arrow such that the upper vein or lower vein of his forearm was severed. So the Messenger of Allah (ﷺ) tried to stop it with fire, but it made his arm bleed profusely so he left it. Then he did it another time but it caused it to bleed profusely. Upon seeing that he said: \'O Allah! Do not allow my soul depart until my eyes are comforted by elimination of Banu Quraizah.\' He pressed his vein closed and it did not bleed a drop before they surrendered to the arbitration of Sa\'d bin Mu\'adh. He (the Prophet (ﷺ)) sent to him (Sa\'d) who judged that their men should be killed, their women should be spared, and that the Muslims may share them among themselves. With this, the Messenger of Allah (ﷺ) said: \'You have judged according to Allah\'s judgement for them.\' And they were four hundred. Then when he finished killing them, his vein opened up and he died." [He said:] There are narrations on this topic from Abu Sa\'eed and \'Atiyyah Al-Qurazi. [Abu \'Eisa said:] This Hadith is Hasan Sahih',
    mirror: `${MIRROR}/eng-tirmidhi/1582.json`,
    reason: 'The only hadith count of Qurayẓa\u2019s men (400); graded ṣaḥīḥ by al-Albānī and Shākir (factcheck §5c).',
  },
  'abudawud:3006': {
    url: 'https://sunnah.com/abudawud:3006',
    reference: 'Book 20, Hadith 76',
    text: 'Narrated Abdullah Ibn Umar: The Prophet fought with the people of Khaybar, and captured their palm-trees and land, and forced them to remain confined to their fortresses. So they concluded a treaty of peace providing that gold, silver and weapons would go to the Messenger of Allah (ﷺ), and whatever they took away on their camels would belong to them, on condition that they would not hide and carry away anything. If they did (so), there would be no protection for them and no treaty (with Muslims). They carried away a purse of Huyayy ibn Akhtab who was killed before (the battle of) Khaybar. He took away the ornaments of Banu an-Nadir when they were expelled. The Prophet (ﷺ) asked Sa\'yah: Where is the purse of Huyayy ibn Akhtab? He replied: The contents of this purse were spent on battles and other expenses. (Later on) they found the purse. So he killed Ibn AbulHuqayq, captured their women and children, and intended to deport them. They said: Muhammad, leave us to work on this land; we shall have half (of the produce) as you wish, and you will have half. The Messenger of Allah (ﷺ) used to make a contribution of eighty wasqs of dates and twenty wasqs of wheat to each of his wives',
    mirror: `${MIRROR}/eng-abudawud/3006.json`,
    reason: 'Ibn ʿUmar\u2019s Khaybar report with an isnād (al-Albānī: ḥasan isnād), beside the sīra\u2019s Kināna story (factcheck §5d).',
  },
  'muslim:525a': {
    url: 'https://sunnah.com/muslim:525a',
    reference: 'Book 5, Hadith 16',
    text: 'Al-Bara\' b. \'Azib reported:I said prayer with the Apostle (ﷺ) turning towards Bait-ul-Maqdis for sixteen months till this verse of Surah Baqara wis revealed:" And wherever you are turn your faces towards it" (ii. 144). This verse was revealed when the Apostle (ﷺ) had said prayer. A person amongst his people passed by the people of Ansar as they were engaged in prayer. He narrated to them (this command of Allah) and they turned their faces towards the Ka\'ba',
    mirror: `${MIRROR}/eng-muslim.min.json`,
    reason: 'Muslim\u2019s parallel to Bukhārī 40 (both books; factcheck §5a). Mirror hadithnumber 1176 = arabicnumber 525.01.',
  },
  'muslim:1676a': {
    url: 'https://sunnah.com/muslim:1676a',
    reference: 'Book 28, Hadith 34',
    text: 'Abdullah (b. Mas\'ud) reported Allah\'s Messenger (ﷺ) as saying:It is not permissible to take the life of a Muslim who bears testimony (to the fact that there is no god but Allah, and I am the Messenger of Allah, but in one of the three cases: the married adulterer, a life for life, and the deserter of his Din (Islam), abandoning the community',
    mirror: `${MIRROR}/eng-muslim.min.json`,
    reason: 'Muslim\u2019s apostasy report, so the reflection\u2019s apostasy row rests on both books (factcheck §8).',
  },
  'bukhari:6878': {
    url: 'https://sunnah.com/bukhari:6878',
    reference: 'Book 87, Hadith 17',
    text: 'Narrated `Abdullah:Allah\'s Messenger (ﷺ) said, "The blood of a Muslim who confesses that none has the right to be worshipped but Allah and that I am His Apostle, cannot be shed except in three cases: In Qisas for murder, a married person who commits illegal sexual intercourse and the one who reverts from Islam (apostate) and leaves the Muslims',
    mirror: `${MIRROR}/eng-bukhari/6878.json`,
    reason: 'Bukhārī\u2019s parallel to Muslim 1676a (factcheck §8).',
  },
  'abudawud:3004': {
    url: 'https://sunnah.com/abudawud:3004',
    reference: 'Book 20, Hadith 77',
    text: "Narrated A man from the companions of the Prophet: AbdurRahman ibn Ka'b ibn Malik reported on the authority of a man from among the companions of the Prophet (ﷺ): The infidels of the Quraysh wrote (a letter) to Ibn Ubayy and to those who worshipped idols from al-Aws and al-Khazraj, while the Messenger of Allah (ﷺ) was at that time at Medina before the battle of Badr. (They wrote): You gave protection to our companion. We swear by Allah, you should fight him or expel him, or we shall come to you in full force, until we kill your fighters and appropriate your women. When this (news) reached Abdullah ibn Ubayy and those who were worshippers of idols, with him they gathered together to fight the Messenger of Allah (ﷺ). When this news reached the Messenger of Allah (ﷺ), he visited them and said: The threat of the Quraysh to you has reached its end. They cannot contrive a plot against you, greater than what you yourselves intended to harm you. Are you willing to fight your sons and brethren? When they heard this from the Prophet (ﷺ), they scattered. This reached the infidels of the Quraysh. The infidels of the Quraysh again wrote (a letter) to the Jews after the battle of Badr: You are men of weapons and fortresses. You should fight our companion or we shall deal with you in a certain way. And nothing will come between us and the anklets of your women. When their letter reached the Prophet (ﷺ), they gathered Banu an-Nadir to violate the treaty. They sent a message to the Prophet (ﷺ): Come out to us with thirty men from your companions, and thirty rabbis will come out from us till we meet at a central place where they will hear you. If they testify to you and believe in you, we shall believe in you. The narrator then narrated the whole story. When the next day came, the Messenger of Allah (ﷺ) went out in the morning with an army, and surrounded them. He told them: I swear by Allah, you will have no peace from me until you conclude a treaty with me. But they refused to conclude a treaty with him. He therefore fought them the same day. Next he attacked Banu Quraysh with an army in the morning, and left Banu an-Nadir. He asked them to sign a treaty and they signed it. He turned away from them and attacked Banu an-Nadir with an army. He fought with them until they agreed to expulsion. Banu an-Nadir were deported, and they took with them whatever their camels could carry, that is, their property, the doors of their houses, and their wood. Palm-trees were exclusively reserved for the Messenger of Allah (ﷺ). Allah bestowed them upon him and gave them him as a special portion. He (Allah), the Exalted, said: What Allah has bestowed on His Apostle (and taken away) from them, for this ye made no expedition with either camel corps or cavalry.\" He said: \"Without fighting.\" So the Prophet (ﷺ) gave most of it to the emigrants and divided it among them; and he divided some of it between two men from the helpers, who were needy, and he did not divide it among any of the helpers except those two. The rest of it survived as the sadaqah of the Messenger of Allah (ﷺ) which is in the hands of the descendants of Fatimah (Allah be pleased with her)",
    mirror: `${MIRROR}/eng-abudawud/3004.json`,
    reason: "Banū al-Naḍīr's planned treachery, from a Companion (al-Albānī: ṣaḥīḥ isnād); the defender's premise for item 9 (factcheck_rebuttals §8).",
  },
  'bukhari:3167': {
    url: 'https://sunnah.com/bukhari:3167',
    reference: 'Book 58, Hadith 9',
    text: "Narrated Abu Huraira:While we were in the Mosque, the Prophet (ﷺ) came out and said, \"Let us go to the Jews\" We went out till we reached Bait-ul-Midras. He said to them, \"If you embrace Islam, you will be safe. You should know that the earth belongs to Allah and His Apostle, and I want to expel you from this land. So, if anyone amongst you owns some property, he is permitted to sell it, otherwise you should know that the Earth belongs to Allah and His Apostle",
    mirror: `${MIRROR}/eng-bukhari/3167.json`,
    reason: "The reason given to the Jews remaining in Medina (factcheck_rebuttals §6).",
  },
  'bukhari:2730': {
    url: 'https://sunnah.com/bukhari:2730',
    reference: 'Book 54, Hadith 18',
    text: "Narrated Ibn `Umar:When the people of Khaibar dislocated `Abdullah bin `Umar's hands and feet, `Umar got up delivering a sermon saying, \"No doubt, Allah's Messenger (ﷺ) made a contract with the Jews concerning their properties, and said to them, 'We allow you (to stand in your land) as long as Allah allows you.' Now `Abdullah bin `Umar went to his land and was attacked at night, and his hands and feet were dislocated, and as we have no enemies there except those Jews, they are our enemies and the only people whom we suspect, I have made up my mind to exile them.\" When `Umar decided to carry out his decision, a son of Abu Al-Huqaiq's came and addressed `Umar, \"O chief of the believers, will you exile us although Muhammad allowed us to stay at our places, and made a contract with us about our properties, and accepted the condition of our residence in our land?\" `Umar said, \"Do you think that I have forgotten the statement of Allah's Messenger (ﷺ), i.e.: What will your condition be when you are expelled from Khaibar and your camel will be carrying you night after night?\" The Jew replied, \"That was a joke from Abul-Qasim.\" `Umar said, \"O the enemy of Allah! You are telling a lie.\" `Umar then drove them out and paid them the price of their properties in the form of fruits, money, camel saddles and ropes, etc",
    mirror: `${MIRROR}/eng-bukhari/2730.json`,
    reason: "ʿUmar's stated reasons for the Khaybar expulsion (factcheck_rebuttals §9).",
  },
  'muslim:1767a': {
    url: 'https://sunnah.com/muslim:1767a',
    reference: 'Book 32, Hadith 75',
    text: "It has been narrated by 'Umar b. al-Khattib that he heard the Messenger of Allah (ﷺ) say:I will expel the Jews and Christians from the Arabian Peninsula and will not leave any but Muslim",
    mirror: `${MIRROR}/eng-muslim.min.json`,
    reason: "ʿUmar's report of the Prophet's order to expel Jews and Christians from Arabia (factcheck_rebuttals §9). Mirror hadithnumber 4594 = arabicnumber 1767.01.",
  },
};

// ---------------------------------------------------------------------------------------------
// Quote / reference fixes on dataset nodes (shown until the dataset is corrected; each in data_proposals.md)
// { ref: dataset path, field, value | replace: [[from, to]] | prepend | append, reason, sourceUrl }
// ---------------------------------------------------------------------------------------------
export const QUOTE_FIXES = [
  { ref: H.nasai3086, field: 'text', replace: [['Narrated It was narrated from Ibn Abbas:that', 'It was narrated from Ibn Abbas that']], reason: 'Mirror artefact: "Narrated" is prepended to Sunnah.com\u2019s "It was narrated from Ibn \u2019Abbas that…" (factcheck §4).', sourceUrl: 'https://sunnah.com/nasai:3086' },
  { ref: H.nasai3086, field: 'reference', value: 'Book 25, Hadith 2', reason: 'In-book reference is Hadith 2 (Hadith 1 is 3085), per the mirror\u2019s Sunnah.com in-book numbering (factcheck §4).', sourceUrl: 'https://sunnah.com/nasai:3086' },
  { ref: T.tb9_29, field: 'text', replace: [['the people = **{who', 'the people **{who'], ['Fire (13) = **{', 'Fire **{'], ['Islam (14) = **{', 'Islam **{']], reason: 'The "=" linking marks and footnote numbers (13), (14) are the edition\u2019s apparatus copied into the quote (factcheck §4).', sourceUrl: 'https://www.islamweb.net/ar/library/index.php?page=bookcontents&flag=1&bk_no=50&surano=9&ayano=29' },
  { ref: T.ik4_77, field: 'text', replace: [['compared to the multitude of their enemies... Therefore', 'compared to the multitude of their enemies. Also, the Muslims were in their city, which was a sacred one and the most honored area on the earth, and this is why an initial command to fight was not appropriate there. Therefore']], reason: 'The excerpt\u2019s ellipsis drops the second of Ibn Kathīr\u2019s two reasons; restored from the site\u2019s Ibn Kathīr text (factcheck §4).', sourceUrl: 'https://quran.com/4:77/tafsirs/en-tafisr-ibn-kathir' },
  { ref: H.tirmidhi1584, field: 'text', prepend: 'Narrated \'Atiyyah Al-Qurazi: ', append: ' [Abu \'Eisa said:] This Hadith is Hasan Sahih. This is acted upon according to some of the people of knowledge. They consider pubic hair an indication of the age of responsibility, if it is not known whether he has had a wet dream, or his age. This is the view of Ahmad and Ishaq', reason: 'The narrator line and al-Tirmidhī\u2019s grading and fiqh note are cut, so the card has no speaker (factcheck §10; cuj_ia R2.1). Restored verbatim from the mirror of Sunnah.com.', sourceUrl: 'https://sunnah.com/tirmidhi:1584' },
  { ref: H.bukhari3448, field: 'text', append: ' …', reason: 'The quote stops before Abū Hurayra\u2019s 4:159 addendum without an ellipsis (factcheck §6).', sourceUrl: 'https://sunnah.com/bukhari:3448' },
  { ref: H.muslim1365c, field: 'url', value: 'https://sunnah.com/muslim:1365c', reason: '3497 is the mirror\u2019s sequence number, not Sunnah.com\u2019s; arabicnumber 1365.03 = 1365c, in-book 16/99 (factcheck, Link fixes).', sourceUrl: 'https://sunnah.com/muslim:1365c' },
  { ref: H.muslim1365c, field: 'collection', value: 'Sahih Muslim 1365c', reason: 'Label follows the URL fix (factcheck, Link fixes).', sourceUrl: 'https://sunnah.com/muslim:1365c' },
  { ref: H.muslim1365d, field: 'url', value: 'https://sunnah.com/muslim:1365d', reason: '3498 → arabicnumber 1365.04 = 1365d, in-book 16/100 (factcheck, Link fixes).', sourceUrl: 'https://sunnah.com/muslim:1365d' },
  { ref: H.muslim1365d, field: 'collection', value: 'Sahih Muslim 1365d', reason: 'Label follows the URL fix.', sourceUrl: 'https://sunnah.com/muslim:1365d' },
  { ref: H.muslim1365e, field: 'url', value: 'https://sunnah.com/muslim:1365e', reason: '3500 → arabicnumber 1365.05 = 1365e, in-book 16/102 (factcheck, Link fixes).', sourceUrl: 'https://sunnah.com/muslim:1365e' },
  { ref: H.muslim1365e, field: 'collection', value: 'Sahih Muslim 1365e', reason: 'Label follows the URL fix.', sourceUrl: 'https://sunnah.com/muslim:1365e' },
  { ref: H.muslim1365f, field: 'url', value: 'https://sunnah.com/muslim:1365f', reason: '3501 → arabicnumber 1365.06 = 1365f, in-book 16/104 (factcheck, Link fixes).', sourceUrl: 'https://sunnah.com/muslim:1365f' },
  { ref: H.muslim1365f, field: 'collection', value: 'Sahih Muslim 1365f', reason: 'Label follows the URL fix.', sourceUrl: 'https://sunnah.com/muslim:1365f' },
  { ref: Q.q59_5, field: 'text', replace: [['(it was) was by the permission', '(it was) by the permission']], reason: 'Doubled \u201cwas\u201d in the repo\u2019s Droge English (src/data/quran/english/droge_translation.json), copied into the dataset: the Arabic has a single \u00abفَبِإِذْنِ اللَّهِ\u00bb, and the parallel clause reads \u201c(it was) so that\u2026\u201d. Data proposal for both files.', sourceUrl: 'https://quran.com/59/5' },
  { ref: Q.q109_6, field: 'text', replace: [['religion.\u2019', 'religion.']], reason: '109:6 cited alone without 109:1 (\u201cSay: \u2018O disbelievers\u2026\u201d) has an unmatched closing single quote at the end of the verse.', sourceUrl: 'https://quran.com/109/6' },
];

/**
 * Printed sīra pages our copy cites (checked against the archive.org OCR of Guillaume, factcheck §5 and
 * "Primary checks"). Listed under "Sīra and taʾrīkh in print" with the dataset's own print references.
 */
export const PRINT_SOURCES = [
  'Ibn Isḥāq, The Life of Muhammad, tr. A. Guillaume (Oxford, 1955): pp. 233, 270–272, 363, 437, 453, 461–466, 515, 517, 531–532 and n. 711',
  'Ibn Hishām, al-Sīra al-nabawiyya',
  'al-Ṭabarī, Taʾrīkh al-rusul wa-l-mulūk',
  'Ibn Saʿd, Kitāb al-Ṭabaqāt al-kabīr',
];

/** Old section hashes → where that content lives now (an invisible <span id> is placed there). */
export const LEGACY_ANCHORS = {
  abstract: 'intro',
  'sociopolitical-backdrop': 'meccan-verses',
  'four-stages-of-warfare': 'four-stages',
  'relations-with-jewish-tribes': 'jewish-tribes',
  'christological-shift': 'jesus-verses-by-sura',
  'doctrine-of-naskh': 'pardon-replaced',
  'comparative-synthesis': 'reflection',
  'interpretive-frameworks': 'how-read-today',
  conclusion: 'what-the-texts-show',
};

/** Dataset leaves that are deliberately not placed (metadata, LLM directions, ids, numbering). */
export const NOT_RENDERED = [
  /^meta\./,
  /\.directionToLLM$/,
  /\.id$/,
  /\.sectionNumber$/,
  /\.stageNumber$/,
];

/**
 * Hadith whose repo-corpus Arabic is corrupt: Arabic stays verbatim (never patched here), so the card's
 * "Original Arabic" drawer is hidden instead. Keyed by Sunnah.com key; the build fails if the key has no
 * rendered evidence card or if `corrupt` is no longer in the corpus text (then the data agent fixed it:
 * delete the entry). Listed in data_proposals.md as a corpus fix.
 */
export const HIDE_HADITH_ARABIC = {
  'muslim:1766a': {
    corpus: 'src/data/hadith/sahih_fulltext.json muslim:4592 (same in the fawazahmed0/hadith-api mirror)',
    corrupt: 'أَنَّالله',
    reason: 'The corpus Arabic runs «أَنَّ» into «الله عليه وسلم» and drops the words between them, so the narration is not readable as given.',
  },
};

export const CONFIG = {
  BASE, PAGE_PATH, BASE_PATH, OG_IMAGE, OG_IMAGE_SIZE, DATE_PUBLISHED, DATE_MODIFIED, EMIT_FAQ,
  LABELS, SHOWCASE_LABELS, SOURCE_GROUPS, SEO, CATALOG, INTRO, START_HERE, SECTIONS, ITEMS, CLOSING,
  EXTRA_HADITH, QUOTE_FIXES, PRINT_SOURCES, LEGACY_ANCHORS, NOT_RENDERED, HIDE_HADITH_ARABIC,
};
