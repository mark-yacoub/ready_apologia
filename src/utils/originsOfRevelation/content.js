/**
 * Every reader-facing string on /discover/origins-of-revelation, keyed by stable ids.
 *
 * Copy only: the model (model.js) validates the shape (contract.js), resolves data positions
 * against the data lock (dataLock.js) and render-time fixes (quoteFixes.js), and checks quotations
 * verbatim. Voice: docs/article_and_ux_playbook.md §2.
 *
 * Conventions
 *  - `*Md` fields are inline Markdown: `*em*`, `**strong**`, `[text](href)`. Internal hrefs are written
 *    without BASE (`/quran/22/52/tafsir/tabari`, `/bible/rv/1#17`, `/hadith/bukhari/3`); the model adds it.
 *  - Words quoted inside our own sentences use “…” (curly double quotes) and are verbatim from the
 *    named source (a card on the page, a repo text, or an EXTRA_QUOTES entry). The tone gate strips
 *    them before matching.
 *  - Apostrophes in our own voice are straight ('), so the tone gate never mistakes them for quotes.
 *  - Cards: `{ data: { itemId, group, index } }` (itemId = the OLD data id; index after quoteFixes),
 *    or `{ extra: '<EXTRA_QUOTES key>' }`. Every EXTRA_QUOTES text is verbatim from `sourceFile`
 *    (`sourceKey` = "C:V[-W]" for scripture, a top-level key or dotted path for other JSON);
 *    `sourceFile: 'external'` texts carry a `url` and are flagged for human check.
 */

const II = 'initial-encounter';
const PM = 'physiological-manifestations';
const BM = 'vulnerability-to-black-magic';
const IR = 'interception-of-revelation';
const SD = 'suicidal-despair';
const ISL = 'islamic_quotes';
const PAR = 'biblical_parallels';
const EXP = 'biblical_expectations';
const d = (itemId, group, index) => ({ itemId, group, index });

/** Head. SEO strings are plain ASCII (hadithReliability/seo.js rule); Layout appends " | Ready Apologia". */
export const SEO = {
  title: '5 Accounts of How Revelation Came, Read Beside the Bible',
  description:
    'Bukhari, Muslim and al-Tabari record the angel pressing the Prophet at Hira, a spell on him, and Satan casting words onto his tongue (Quran 22:52). Five accounts beside the Bible.',
  keywords:
    'origins of revelation, cave of hira, bukhari 3, bukhari 6982, how revelation came to the prophet, bukhari 2 ringing of a bell, sihr labid bukhari 5765, quran 22:52 tafsir, gharaniq, satanic verses tabari, test the spirits 1 john 4:1',
  ogAlt: '5 Accounts of How Revelation Came, Read Beside the Bible',
};

/** Catalog card (slug `origins-of-revelation` unchanged). Proposed for data_proposals.md; plain ASCII. */
export const CATALOG = {
  title: '5 Accounts of How Revelation Came, Read Beside the Bible',
  description:
    'Muslims hold that Gabriel brought the Quran down (2:97) and no satan did (26:210). Bukhari, Muslim and al-Tabari record the pressing at Hira, a spell on him, and Satan casting into his speech (22:52), set beside the Bible.',
};

/** Header (cold landing). The H1 promises 5 accounts: the 5 glance rows = sections 1–5. */
export const HEADER = {
  eyebrow: 'Origins of revelation · Qurʾān, hadith and Bible',
  h1: '5 Classical Accounts of Revelation, Beside the Bible\'s Angels and Spirits',
  hookMd:
    "Muslims hold that the angel Gabriel brought the Qurʾān down from God ([2:97](/quran/2/97/tafsir/tabari)): “The satans have not brought it down” ([26:210](/quran/26/210/tafsir/tabari)). Bukhārī, Muslim and the early commentaries record five accounts of how revelation came: the angel pressing the Prophet three times at Ḥirāʾ, the physical weight and sounds the Companions witnessed, a spell that made him imagine doing things he had not done, [Qurʾān 22:52](/quran/22/52/tafsir/tabari) on Satan casting words into a prophet's recitation, and his going to the mountains after Ḥirāʾ. Each account sits beside how the Bible describes angels and spirits, with the classical scholars' explanation tested against the texts. How do the two books tell a messenger from God apart from another spirit?",
  contextLine:
    "Every quotation links to its source. [Check the sources](#sources)",
  framingMd:
    "Both books warn of a voice not from God: [Qurʾān 22:52](/quran/22/52/tafsir/tabari) on what “Satan cast”, and [1 John 4:1](/bible/1jn/4#1) on testing “the spirits”.",
  whosWhoSummary:
    "Who's who in the classical Sunni explanations",
  whosWhoMd:
    "**al-Ṭabarī** (d. 923) and **Ibn Kathīr** (d. 1373), the two standard Qurʾān commentators; **Ibn Ḥajar** (d. 1449, *Fatḥ al-Bārī*), the standard commentator on Bukhārī; **al-Nawawī** (d. 1277), the standard commentator on Muslim; and **al-Qāḍī ʿIyāḍ** (d. 1149, *al-Shifāʾ*), on the Prophet's standing.",
};

/** UI labels. `{n}` / `{refs}` are filled by the model. */
export const LABELS = {
  glance: 'At a glance',
  onThisPage: 'On this page',
  navAria: 'Sections of this page',
  back: 'Discover',
  copyLink: 'Copy link',
  copied: 'Link copied',
  backToTop: 'Back to top',
  coldContext: 'Part of {n} accounts · Back to top',
  emphasisNote: 'Bold inside quotations is ours (emphasis added).',
  sideBySide: 'Side by side',
  sourcesWhat: 'What the sources say',
  classical: 'The classical explanation',
  evaluation: 'Comparing with the primary text',
  deeper: 'Go deeper',
  moreParallels: '{n} more: {refs}',
  repeatNote: 'Also quoted in section {n}',
  sources: 'Check the sources',
  sourcesNav: 'Sources',
  sourcesGroups: {
    quran: 'Qurʾān and commentary (tafsīr)',
    hadith: 'Hadith collections',
    sira: 'Biography (sīra) and history',
    classical: 'Classical commentaries',
    bible: 'Bible text',
  },
  sourcesGroupNotes: {
    quran: 'Opens Tafsir al-Ṭabarī or Ibn Kathīr on this site',
    hadith: 'Opens Sunnah.com, or the annotated page on this site',
    sira: 'Opens the scanned translation on archive.org',
    classical: 'Opens the commentary in an online library',
    bible: 'Opens the Bible reader on this site (NASB; Old Testament in the Septuagint)',
  },
  further: 'Academic references',
  closingHeading: 'The texts in full',
  // Appended by the implementer (r3, labels only): copy-link fallback, chip-row name, internal hadith
  // chip, and distinct summaries for the two collapsed panels under the classical / comparing boxes.
  copyFailed: 'Copy the address from your browser bar',
  verifyAria: 'Sources for this quotation',
  internalHadith: '{ref} on this site',
  classicalDeeper: 'The full classical discussion',
  evaluationDeeper: 'The full comparison',
};

/* ------------------------------------------------------------------------------------------------
 * Sections, in reading order (strongest first, playbook §3). Groups render in order: what the Islamic sources
 * record, then the angel/Spirit texts, then the spirit texts. `cards` are open; `collapsed` holds
 * parallel narrations, repeats and the passages Muslim writers cite (all quoted in full).
 * ---------------------------------------------------------------------------------------------- */
export const SECTIONS = [
  // §1 ------------------------------------------------------------------------------------------
  {
    id: 'hira',
    aliases: ['initial-encounter'],
    dataItemId: II,
    nav: 'Ḥirāʾ',
    number: 1,
    h2: 'What happened at Ḥirāʾ, in the words of the first reports?',
    glance: {
      title: 'The first night at Ḥirāʾ',
      takeawayMd: 'Bukhārī 3: the angel “pressed me so hard that I could not bear it any more,” three times. Luke 1:13 and 1:30: Gabriel says “Do not be afraid.”',
      chips: ['Bukhārī 3', 'Ibn Isḥāq', 'Luke 1:13'],
    },
    showcase: {
      caption: 'Side by side',
      ariaLabel: 'The Ḥirāʾ reports beside angels meeting Zacharias and Daniel in the Bible',
      left: {
        title: 'The Ḥirāʾ reports',
        items: [
          { textMd: '“The angel caught me (forcefully) and pressed me so hard that I could not bear it any more.”', ref: { data: d(II, ISL, 0) } },
          { textMd: '“He pressed me with it so tightly that I thought it was death”', ref: { data: d(II, ISL, 3) } },
        ],
      },
      right: {
        title: 'Angels meeting prophets in the Bible',
        items: [
          { textMd: '“Do not be afraid, Zacharias”', ref: { data: d(II, EXP, 2) } },
          { textMd: '“he strengthened me, and said to me, Fear not, man greatly beloved”', ref: { data: d(II, EXP, 1) } },
        ],
      },
      noteMd: 'Because the Ḥirāʾ reports describe what the visitor did and how the Prophet felt before Waraqa named him, the cards below set them beside both biblical patterns: angels calming and strengthening a prophet (Luke 1, Daniel 10) and a spirit seizing a boy (“whenever it seizes him, it slams him to the ground,” Mark 9:18).',
    },
    witnesses: null,
    introMd:
      'Muslims date the first revealed verses of the Qurʾān to this night at Ḥirāʾ, so how the visitor met the Prophet here is the first evidence of who brought the revelation. Ṣaḥīḥ al-Bukhārī records it in the Prophet\'s own words, through ʿĀʾisha: the visitor gave no name, pressed him three times until he could not bear it, and left him afraid. (The continuation of this same report, when revelation paused after Ḥirāʾ, is in [Section 5: After Ḥirāʾ](#after-hira), where its chain note is examined separately.)',
    groups: [
      {
        key: 'islamic',
        label: 'What the reports record',
        cards: [
          { data: d(II, ISL, 0), label: 'The Prophet, in ʿĀʾisha\'s narration', chips: [{ label: 'Ibn Ḥajar on the pressing (Fatḥ al-Bārī 8:589)', href: 'https://www.islamweb.net/ar/library/content/52/9033/' }, { label: 'Ibn Ḥajar on Bukhārī 3 (Fatḥ al-Bārī 1:33)', href: 'https://www.islamweb.net/ar/library/content/52/5/' }] },
          { data: d(II, ISL, 2), label: 'The same night, in Ṣaḥīḥ Muslim' },
          { data: d(II, ISL, 3), label: 'The Prophet, in Ibn Isḥāq\'s early biography of him (*Sīra*)', noteMd: 'In this account (translated by Guillaume, p. 106) the visitor comes “while I was asleep”, and “it” is a brocade coverlet.' },
        ],
        collapsed: [
          { data: d(II, ISL, 1), label: 'The same narration in Bukhārī 4953' },
        ],
        collapsedSummary: '1 parallel narration of the same night (Bukhārī 4953)',
      },
      {
        key: 'angel',
        label: 'How the Bible describes angels meeting prophets',
        cards: [
          { data: d(II, EXP, 0), label: 'Gabriel explains a vision to Daniel' },
          { data: d(II, EXP, 1), label: 'Daniel, in a later vision' },
          { data: d(II, EXP, 2), label: 'Gabriel to Zacharias in the temple' },
          { data: d(II, EXP, 3), label: 'Gabriel to Mary' },
        ],
        collapsed: [
          { extra: 'dn-8-27', label: 'Daniel, after the vision of chapter 8' },
          { extra: 'gn-32-24-26', label: 'Jacob wrestles through the night' },
          { extra: 'lk-1-18-20', label: 'Gabriel answers Zacharias' },
        ],
        collapsedSummary: '3 passages Muslim writers point to (Daniel 8:27, Genesis 32:24–26, Luke 1:18–20)',
      },
      {
        key: 'spirit',
        label: 'How the Gospels describe a spirit seizing a boy',
        cards: [
          { data: d(II, PAR, 0), label: 'A father to Jesus, about his son' },
          { data: d(II, PAR, 1), label: 'The same father, in Luke' },
        ],
        collapsed: [],
      },
    ],
    classicalMd:
      "Ibn Ḥajar gives the reasons offered for the pressing: to turn the Prophet's attention from all else; to show the weight of the “heavy word” to come ([Qurʾān 73:5](/quran/73/5/tafsir/tabari)); to show that reciting was not in his own power; and to let him know from his own body, which imagination does not touch, that it was from God ([Fatḥ al-Bārī 8:589](https://www.islamweb.net/ar/library/content/52/9033/)). He adds that someone he met held the pressing to be particular to the Prophet, since nothing like it is reported of any other prophet at the start of revelation. In the same report Waraqa, Khadīja's Christian cousin, tells him, “This is the same one who keeps the secrets (angel Gabriel) whom Allah had sent to Moses” ([Bukhārī 3](https://sunnah.com/bukhari:3)). Muslim writers also compare the episode with Daniel 8:27, Genesis 32:24–26 and Luke 1:18–20.",
    classicalDeeperMd:
      "On “I fear that something may happen to me”, Ibn Ḥajar records twelve views. The first, madness or soothsaying, he says is stated outright in several routes; the early hadith scholar al-Ismāʿīlī placed it before the Prophet knew for certain that it was an angel, and the Mālikī judge Abū Bakr b. al-ʿArabī rejected it, rightly in Ibn Ḥajar's view. Others include inability to bear the burdens of prophethood and fear of his people's harm. Ibn Ḥajar judges the third view and the two after it the most correct: that he feared death from terror, illness, or lasting illness ([Fatḥ al-Bārī 1:33](https://www.islamweb.net/ar/library/content/52/5/)).",
    evaluationMd:
      "Ibn Ḥajar's explanation needs the pressing to have prepared the Prophet for revelation or let him know from his body that the visitor was from God. No report states that purpose: in Bukhārī 3, Muslim 160a and Ibn Isḥāq neither the Prophet nor the visitor explains the pressing, and Ibn Ḥajar cites no report for those reasons. The verse his second reason alludes to, [Qurʾān 73:5](/quran/73/5/tafsir/tabari), calls revelation “a heavy word” and does not mention the pressing. The narrator is ʿĀʾisha, the wife closest to the Prophet ([Bukhārī 4450](https://sunnah.com/bukhari:4450)) and one of the most prolific narrators in Sunni Islam (2,210 hadith in al-Dhahabī's count, [Siyar 2/139](https://www.islamweb.net/ar/library/content/60/143/)), so a Sunni reader cannot set the account aside as a weak transmission.\n\nIn the biblical passages Muslim writers compare with Ḥirāʾ, the angel in Daniel does not press or squeeze him: Daniel faints at the vision, and the messenger “touched me, and set me on my feet” (8:18) and “strengthened me” (10:18), after which Daniel “was sick: then I arose, and did the king's business” (8:27). In [Genesis 32:24–30](/bible/gn/32#24), where the figure touches Jacob's thigh and numbs it, Jacob holds on (“I will not let you go, except you bless me,” 32:26), receives a blessing and the new name Israel (32:28–29), and leaves knowing whom he has met — “I have seen God face to face, and my life was preserved” (32:30) — without going home afraid or needing someone else to identify the visitor. And in Luke 1:19–20 Gabriel names himself (“I am Gabriel”) and states the reason Zacharias is made silent (“because you did not believe my words”).\n\nIf the pressing at Ḥirāʾ was meant to prove to the Prophet that the visitor was from God, the report shows the opposite result: he went home trembling, told Khadīja, “I fear that something may happen to me” — a fear Ibn Ḥajar reads as fear of death or illness — and did not know who had come until Waraqa told him. Either the pressing did not give him that assurance, or the reasons offered for it are the commentators' later inference, and the reports record the act and its effect: three pressings “so that I thought it was death” (Ibn Isḥāq), “till I could not bear it any more” (Bukhārī 3).",
    evaluationDeeperMd:
      "In Mark 9:18 a father says of the spirit in his son, “whenever it seizes him, it slams him to the ground”; in Luke 9:39 it is “mauling him” as it leaves. After the third pressing, Ibn Isḥāq's account adds: “this I said only to deliver myself from him, lest he should do the same to me again.”",
    deeper: [
      {
        summary: 'The Arabic word for “pressed”',
        md: 'Bukhārī 3 reads «فَأَخَذَنِي فَغَطَّنِي حَتَّى بَلَغَ مِنِّي الْجَهْدَ». The English translator of Bukhārī, Muhsin Khan, renders it “The angel caught me (forcefully) and pressed me so hard that I could not bear it any more”; Muslim 160a renders the same narration “He took hold of me … and pressed me, till I was hard pressed.” [Bukhārī 3 on Sunnah.com](https://sunnah.com/bukhari:3)',
      },
      {
        summary: 'Who narrated these reports (all via ʿĀʾisha)',
        md: 'Bukhārī 3, Bukhārī 4953, Bukhārī 6982 and Muslim 160a come through the early hadith master Ibn Shihāb al-Zuhrī, from ʿĀʾisha\'s nephew ʿUrwa b. al-Zubayr, from ʿĀʾisha. Ibn Isḥāq gives a separate account (translated by Guillaume, p. 106). Section 5 continues the same report after the night at Ḥirāʾ: [After Ḥirāʾ](#after-hira).',
      },
    ],
  },

  // §2 ------------------------------------------------------------------------------------------
  {
    id: 'what-they-saw',
    aliases: ['physiological-manifestations'],
    dataItemId: PM,
    nav: 'What they saw',
    number: 2,
    h2: 'What did the Companions see and hear when revelation came?',
    glance: {
      title: 'What the Companions saw',
      takeawayMd: 'Zayd b. Thābit, who wrote down revelation for the Prophet: “it became so heavy for me that I feared that my thigh would be broken” (Bukhārī 2832). Muslim 1180a: “he was emitting a sound of snorting.”',
      chips: ['Bukhārī 2832', 'Muslim 1180a', 'Bukhārī 2'],
    },
    showcase: {
      caption: 'Side by side',
      ariaLabel: 'What the Companions saw when revelation came, beside Daniel and John before a vision in the Bible',
      left: {
        title: 'What the Companions saw',
        items: [
          { textMd: '“it became so heavy for me that I feared that my thigh would be broken”', ref: { data: d(PM, ISL, 2) } },
          { textMd: '“he was emitting a sound of snorting”', ref: { data: d(PM, ISL, 5) } },
          { textMd: '“Sometimes it is (revealed) like the ringing of a bell, this form of Inspiration is the hardest of all”', ref: { data: d(PM, ISL, 0) } },
        ],
      },
      right: {
        title: 'Prophets before a vision, in the Bible',
        items: [
          { textMd: '“a hand touched me, and it raised me on my knees … stand upright”', ref: { data: d(PM, EXP, 0) } },
          { textMd: '“I fell at His feet like a dead man. And He placed His right hand on me”', ref: { data: d(PM, EXP, 1) } },
        ],
      },
      noteMd: 'Because the Companions describe visible bodily strain when revelation came, the cards below set those accounts beside both biblical patterns: a messenger lifting and strengthening a prophet (Daniel 10:10–19, Revelation 1:17) and a spirit throwing a boy into convulsions (“threw him into a convulsion, and falling to the ground, he began rolling around,” Mark 9:20).',
    },
    witnesses: null,
    introMd:
      "What the Companions saw and heard as revelation came to the Prophet is the outward evidence the reports give of who brought it. Across Bukhārī and Muslim, they describe a weight on Zayd b. Thābit's thigh so heavy he feared it would break, the Prophet's face changing colour, sweat on a cold day, and snorting like a young camel under a cloth, while the Prophet calls the form that came “like the ringing of a bell” the hardest of all.",
    groups: [
      {
        key: 'islamic',
        label: 'What the Prophet and his Companions describe',
        cards: [
          { data: d(PM, ISL, 2), label: 'Zayd b. Thābit, writing down Qurʾān 4:95', noteMd: 'Zayd wrote down revelation for the Prophet, and Abū Bakr later chose him to collect the Qurʾān ([Bukhārī 4986](https://sunnah.com/bukhari:4986)).' },
          { data: d(PM, ISL, 1), label: 'ʿUbāda b. al-Ṣāmit, who fought at Badr' },
          { data: d(PM, ISL, 5), label: 'Yaʿlā b. Umayya, a Companion to whom ʿUmar showed the Prophet as revelation came' },
          { data: d(PM, ISL, 0), label: 'The Prophet on how it came; then ʿĀʾisha', chips: [{ label: 'Ibn Ḥajar on Bukhārī 2 (Fatḥ al-Bārī 1:28)', href: 'https://www.islamweb.net/ar/library/content/52/3/' }] },
        ],
        collapsed: [
          { data: d(PM, ISL, 3), label: 'Asmāʾ bint Yazīd, a woman Companion from Medina, in a report Ibn Kathīr cites from Imam Aḥmad\'s *Musnad* (on 5:1)' },
          { data: d(PM, ISL, 4), label: 'A separate saying, about bells (Muslim 2114)', noteMd: 'Not about revelation: Muslim places it beside “Angels do not accompany the travellers who have with them a dog and a bell” ([Muslim 2113a](https://sunnah.com/muslim:2113a)).', chips: [{ label: 'al-Nawawī on Muslim 2114 (Sharḥ Muslim 14:278)', href: 'https://www.islamweb.net/ar/library/content/53/6419/' }] },
        ],
        collapsedSummary: '2 more reports: the camel\'s leg (Ibn Kathīr on 5:1) and the saying on bells (Muslim 2114)',
      },
      {
        key: 'angel',
        label: 'How the Bible describes prophets before a vision',
        cards: [
          { data: d(PM, EXP, 0), label: 'Daniel, in his vision by the great river' },
          { data: d(PM, EXP, 1), label: 'John, before the risen Christ' },
        ],
        collapsed: [
          { extra: 'dn-10-8', label: 'Daniel, just before this passage' },
        ],
        collapsedSummary: '1 passage Muslim writers point to (Daniel 10:8)',
      },
      {
        key: 'spirit',
        label: 'How the Gospels describe a spirit\'s seizures',
        cards: [
          { data: d(PM, PAR, 0), label: 'The boy brought to Jesus' },
        ],
        collapsed: [
          { data: d(PM, PAR, 1), label: 'The same boy, in Luke' },
        ],
        collapsedSummary: 'Luke 9:39, also quoted in section 1',
      },
    ],
    classicalMd:
      "Ibn Kathīr reads [Qurʾān 73:5](/quran/73/5/tafsir/ibn_kathir), “Surely We shall cast upon you a heavy word,” as revelation that “will be heavy at the time of its revelation due to its magnificence,” and gives Zayd's thigh report as an example. Bukhārī 2 also names a second way revelation came, the angel “in the form of a man”. On the bell simile in Bukhārī 2, Ibn Ḥajar raises the question himself from the hadith that angels do not accompany a bell, and answers that a simile needs to share one quality: revelation is likened to the bell for the strength of its sound, whereas the bell is disliked for its music ([Fatḥ al-Bārī 1:28](https://www.islamweb.net/ar/library/content/52/3/)).",
    evaluationMd:
      "Ibn Kathīr's explanation of the physical weight appeals to [Qurʾān 73:5](/quran/73/5/tafsir/ibn_kathir) (“a heavy word”). In that same commentary, however, Ibn Kathīr records first the reading of the early commentators al-Ḥasan al-Baṣrī and Qatāda — that the weight of the word lies in acting on its commands — and gives physical weight at its coming second, as another view. More importantly, taking 73:5 as physical weight states the contrast with the biblical prophets rather than removing it: in both traditions the encounter taxes the prophet and then passes off, and in Daniel the prophet meets a visible messenger who touches him, names his errand, and speaks words of peace, whereas in the hadith revelation arrives as a ringing sound like a bell, weighs on the Prophet and nearly breaks the thigh of the scribe sitting beside him, and is heard by onlookers as snorting under a cloth.\n\nThe witnesses here are the Prophet's own scribe Zayd b. Thābit, whom Abū Bakr chose to collect the Qurʾān because “you used to write the Divine Inspiration for Allah's Messenger” ([Bukhārī 4986](https://sunnah.com/bukhari:4986)), alongside ʿĀʾisha, ʿUbāda b. al-Ṣāmit and Yaʿlā b. Umayya.\n\nIn Daniel 10:8 and 10:16–17, which Muslim writers compare with these reports, Daniel says “there was no strength left in me” and “there is no breath left in me” at the sight of the vision; what he receives in that encounter is a visible messenger who touches him, raises him to his knees, explains why he was sent, and says, “Fear not, man greatly beloved: peace be to you, quit yourself like a man, and be strong,” until Daniel says, “Let my lord speak; for you have strengthened me” (Daniel 10:10–19). In Revelation 1:17 John falls at Christ's feet, and Christ lays His right hand on him saying, “Do not be afraid.” In the Islamic reports, though the state “passes off after I have grasped what is inspired” (Bukhārī 2), the hardest form of revelation arrives “like the ringing of a bell” (Bukhārī 2), with the heavy weight on the scribe beside him (“I feared that my thigh would be broken,” Bukhārī 2832), the distressed face (“he felt a burden on that account and the colour of his face underwent a change,” Muslim 2334), and “a sound of snorting” under a cloth (Muslim 1180a).",
    evaluationDeeperMd:
      "The reports also record a weight that “almost broke the camel's leg” (Ibn Kathīr on 5:1). On the bell simile in Bukhārī 2 (“like the ringing of a bell, this form of Inspiration is the hardest of all”), Ibn Ḥajar's answer that a simile shares one quality (strength of sound) fits “the hardest of all,” though Bukhārī 2 itself names the ringing sound and states no limit, while Muslim 2114 calls the bell (*jaras*) “the musical instrument of the Satan.” In Mark 9:20 the spirit “threw him into a convulsion,” and in Luke 9:39 it “throws him into a convulsion with foaming at the mouth.”",
    deeper: [
      {
        summary: 'The Arabic of Bukhārī 2 and Muslim 2114',
        md: 'Bukhārī 2: «أَحْيَانًا يَأْتِينِي مِثْلَ صَلْصَلَةِ الْجَرَسِ ـ وَهُوَ أَشَدُّهُ عَلَىَّ» and «وَأَحْيَانًا يَتَمَثَّلُ لِيَ الْمَلَكُ رَجُلاً فَيُكَلِّمُنِي». Muslim 2114: «الْجَرَسُ مَزَامِيرُ الشَّيْطَانِ». [Bukhārī 2](https://sunnah.com/bukhari:2) · [Muslim 2114](https://sunnah.com/muslim:2114)',
      },
      {
        summary: 'Why a bell, in al-Nawawī\'s commentary on Muslim 2114',
        md: 'al-Nawawī gives the reasons proposed for the angels\' dislike of the bell: it resembles the clappers of churches (*nawāqīs*); or it is one of the forbidden hangings; or its sound, which the report\'s wording, “the musical instrument of the Satan” (*mazāmīr al-shayṭān*), supports. His school holds the bell disliked in general. [Sharḥ Muslim 14:278](https://www.islamweb.net/ar/library/content/53/6419/)',
      },
      {
        summary: 'Another report on the ringing sound (Ibn Kathīr on 73:5)',
        md: 'From Imam Aḥmad\'s hadith collection (*Musnad*), through the Companion ʿAbdullāh b. ʿAmr: “I hear a ringing, then I remain quiet when that occurs. There has not been a single time that revelation has come to me except that I thought that my soul was about to depart.” Ibn Kathīr adds, “Ahmad was alone in narrating this.” [Ibn Kathīr on 73:5](/quran/73/5/tafsir/ibn_kathir)',
      },
      {
        summary: 'Chain of Zayd\'s report on the weight (Bukhārī 2832)',
        md: 'In Bukhārī 2832 the Companion Sahl b. Saʿd heard it from Marwān b. al-Ḥakam, later an Umayyad caliph, who had it from Zayd. [Bukhārī 2832](https://sunnah.com/bukhari:2832)',
      },
      {
        summary: 'Chain of the report on the camel\'s leg (Asmāʾ bint Yazīd)',
        md: 'Ibn Kathīr cites it from Imam Aḥmad\'s *Musnad* through two narrators of the generations after the Companions, Layth b. Abī Sulaym and Shahr b. Ḥawshab, from the Companion Asmāʾ bint Yazīd, and gives it no grade. In the same place he cites the Companion ʿAbdullāh b. ʿAmr: “Surat Al-Ma\'idah was revealed to the Messenger of Allah while he was riding his camel.” [Ibn Kathīr on 5:1](/quran/5/1/tafsir/ibn_kathir)',
      },
      {
        summary: 'Note on the Arabic for “sound of a camel” (Muslim 1180a)',
        md: 'The narrator hedges: «لَهُ غَطِيطٌ - قَالَ وَأَحْسِبُهُ قَالَ - كَغَطِيطِ الْبَكْرِ». The middle words mean *and I think he said*: like the snoring of a young camel. The same event is in [Bukhārī 1789](https://sunnah.com/bukhari:1789).',
      },
    ],
  },

  // §3 ------------------------------------------------------------------------------------------
  {
    id: 'sihr',
    aliases: ['vulnerability-to-black-magic'],
    dataItemId: BM,
    nav: 'The spell',
    number: 3,
    h2: 'What do Bukhārī and Muslim record about a spell cast on the Prophet?',
    glance: {
      title: 'A spell cast on the Prophet',
      takeawayMd: 'Muslim 2189a: he “felt that he had been doing something whereas in fact he had not been doing that.” Bukhārī 5765 ends: “Allah has cured me.”',
      chips: ['Bukhārī 5765', 'Muslim 2189a', 'Qurʾān 17:47'],
    },
    showcase: {
      caption: 'Side by side',
      ariaLabel: 'The reports of a spell cast on the Prophet beside what the Bible says about magic and God\'s people',
      left: {
        title: 'Bukhārī and Muslim',
        items: [
          { textMd: '“he used to think that he had sexual relations with his wives while he actually had not”', ref: { data: d(BM, ISL, 0) } },
          { textMd: '“cast a spell upon Allah\'s Messenger (ﷺ)”', ref: { data: d(BM, ISL, 1) } },
        ],
      },
      right: {
        title: 'What the Bible says about magic and God\'s people',
        items: [
          { textMd: '“For there is no divination in Jacob, nor enchantment in Israel”', ref: { data: d(BM, EXP, 0) } },
          { textMd: '“over all the power of the enemy, and nothing will injure you”', ref: { data: d(BM, EXP, 1) } },
        ],
      },
      noteMd: 'Qurʾān 17:47 and 25:8 record that “the evildoers say, ‘You are only following a man (who is) bewitched.’”',
    },
    witnesses: null,
    introMd:
      'Bukhārī and Muslim both record, from ʿĀʾisha, that a man named Labīd b. al-Aʿṣam worked magic (*siḥr*) on the Prophet, until he imagined he had done things he had not done. If a spell could make him imagine things, the question follows whether it could reach what he passed on as revelation, and the classical scholars raised it themselves.',
    groups: [
      {
        key: 'islamic',
        label: 'What the reports and the Qurʾān record',
        cards: [
          { data: d(BM, ISL, 0), label: 'ʿĀʾisha, in Bukhārī', chips: [{ label: 'al-Māzarī and Ibn Ḥajar on the report (Fatḥ al-Bārī 10:237)', href: 'https://www.islamweb.net/ar/library/content/52/10529/' }] },
          { data: d(BM, ISL, 1), label: 'ʿĀʾisha, in Muslim' },
          { extra: 'ik-113-4-six-months', label: 'ʿĀʾisha, in Imam Aḥmad\'s Musnad, via Ibn Kathīr' },
          { extra: 'q-17-47', label: 'The Qurʾān, on what his opponents said', chips: [{ label: 'Qurʾān 25:8 with al-Ṭabarī', href: '/quran/25/8/tafsir/tabari' }], noteMd: 'Qurʾān 25:8 ends with the same charge.' },
        ],
        collapsed: [],
      },
      {
        key: 'angel',
        label: 'What the Bible says about magic and God\'s people',
        cards: [
          { data: d(BM, EXP, 0), label: 'Balaam, hired to curse Israel, blesses it', noteMd: 'King Balak hired Balaam to curse Israel ([Numbers 23:7–8](/bible/nm/23#7)); where this Greek (Septuagint) wording reads “no divination in Jacob”, the Hebrew, which most English Bibles follow, reads that no omen or divination works against Jacob.' },
          { data: d(BM, EXP, 1), label: 'Jesus to the seventy he sent out' },
        ],
        collapsed: [],
      },
      {
        key: 'spirit',
        label: 'How the Bible describes magic and false signs',
        cards: [
          { data: d(BM, PAR, 0), label: 'Simon, a magician in Samaria' },
          { data: d(BM, PAR, 1), label: 'Paul, on “the lawless one”' },
        ],
        collapsed: [
          { extra: '2cor-12-7-8', label: 'Paul, on his “thorn in the flesh”' },
          { extra: 'jb-2-7', label: 'Job, struck by the devil' },
        ],
        collapsedSummary: '2 passages Muslim writers point to (2 Corinthians 12:7–8, Job 2:7)',
      },
    ],
    classicalMd:
      "Al-Māzarī, quoted by Ibn Ḥajar in *Fatḥ al-Bārī*, first states the objection of the report's critics: if it were allowed, the Prophet might imagine he saw Gabriel when Gabriel was not there. He rejects it: proof establishes the Prophet's truthfulness and protection from error in what he conveys from God; in worldly matters, for which he was not sent, he was open to what befalls any human, like illness. Al-Qāḍī ʿIyāḍ, quoted in the same place, says the magic had power over his body and outward limbs, not over his discernment and belief ([Fatḥ al-Bārī 10:237](https://www.islamweb.net/ar/library/content/52/10529/)). Bukhārī 5765 ends with the Prophet saying, “Allah has cured me.” Muslim writers also point to 2 Corinthians 12:7, Job 2:7, and the devil setting Jesus on the pinnacle of the temple ([Matthew 4:5](/bible/mt/4#5)).",
    evaluationMd:
      "Al-Māzarī's answer needs the spell to have reached worldly matters and never what the Prophet conveyed. Part of it has a text: Bukhārī 5765 names relations with his wives, and Ibn Ḥajar cites that version for the reading. No report says that revelation was untouched; al-Māzarī grounds it in the proof of the Prophet's truthfulness, not in a report, and four of Bukhārī's chains say he imagined “that he had done a thing that he had not really done” ([Bukhārī 5763](https://sunnah.com/bukhari:5763); also 3175, 3268, 6391). Ibn Ḥajar adds that the six months is found with a sound, connected chain ([Fatḥ al-Bārī 10:237](https://www.islamweb.net/ar/library/content/52/10529/)).\n\nEvery Ṣaḥīḥ version comes from ʿĀʾisha, who was with the Prophet when he told her of the cure ([Bukhārī 5763](https://sunnah.com/bukhari:5763); [al-Dhahabī, *Siyar* 2/139](https://www.islamweb.net/ar/library/content/60/143/)). The passages Muslim writers cite describe bodily affliction or outward temptation: Paul receives “a thorn in the flesh” (2 Corinthians 12:7), Job is struck with “sore boils” (Job 2:7), and in [Matthew 4:5–7](/bible/mt/4#5) Jesus knows who is speaking to him and answers the tempter from Scripture. None of them makes a prophet believe for months that he has done what he has not done.\n\nWhether a reader narrows the general wording (“that he had done a thing that he had not really done,” Bukhārī 5763; Muslim 2189a) to the wives version (“he used to think that he had sexual relations with his wives while he actually had not,” Bukhārī 5765) or reads the general chains as they stand, the reports themselves set no boundary between worldly thoughts and revelation. The critics' question that al-Māzarī records — whether the Prophet might imagine he saw Gabriel when Gabriel was not there — is answered by assuming beforehand that revelation could not be touched, rather than from any limit in the reports. Al-Qāḍī ʿIyāḍ adds an argument from the record itself: no report has the Prophet say something under the spell that proved other than he said ([Fatḥ al-Bārī 10:238](https://www.islamweb.net/ar/library/content/52/10529/)). The very next section, however, records what al-Bukhārī's own chapter note on Qurʾān 22:52 states from Ibn ʿAbbās — “When he spoke, the Shaytan threw (some falsehood) into his speech” — and what Gabriel says in al-Ṭabarī's report: “You have recited to the people what I did not bring you from Allah” ([section 4](#quran-22-52)).",
    evaluationDeeperMd:
      "Ibn Ḥajar also cites two reports in the collection of the early hadith compiler ʿAbd al-Razzāq that name no Companion (*mursal*) and say the spell affected his sight ([Fatḥ al-Bārī 10:237–238](https://www.islamweb.net/ar/library/content/52/10529/)). A report in Imam Aḥmad's *Musnad*, cited by Ibn Kathīr on Sūrat al-Falaq (Qurʾān 113), says he “remained for six months thinking that he was having relations (with his wives) when he was not.” Qurʾān 17:47 and 25:8 record that “the evildoers say, ‘You are only following a man (who is) bewitched.’” Paul gives the purpose of his thorn, “to keep me from exalting myself” (2 Corinthians 12:7), and in Luke 10:19 Jesus tells the seventy he sent out, “nothing will injure you.”",
    deeper: [
      {
        summary: 'A narrator\'s note in Bukhārī 5765',
        md: 'One of the narrators in Bukhārī\'s chain, Sufyān b. ʿUyayna, adds a note inside the report: “(Sufyan said: That is the hardest kind of magic as it has such an effect).” [Bukhārī 5765](https://sunnah.com/bukhari:5765)',
      },
      {
        summary: 'How long it lasted',
        md: 'Bukhārī and Muslim give no length. Ibn Kathīr cites Imam Aḥmad\'s *Musnad* for six months. Ibn Ḥajar cites the early hadith scholar al-Ismāʿīlī for forty nights and reconciles the two: six months from the start, forty days at its height ([Fatḥ al-Bārī 10:237](https://www.islamweb.net/ar/library/content/52/10529/)). A report from the Companion Zayd b. Arqam, also in Imam Aḥmad\'s *Musnad*, says “he suffered from that for several days” ([Ibn Kathīr on 113:4](/quran/113/4/tafsir/ibn_kathir)).',
      },
      {
        summary: 'How the spell was found',
        md: 'In both reports two men tell the Prophet who cast the spell and with what: “A comb and the hair stuck to it” (Bukhārī 5765). Ibn Kathīr gives these reports in his commentary on Sūrat al-Falaq (Qurʾān 113). [Ibn Kathīr on 113:4](/quran/113/4/tafsir/ibn_kathir)',
      },
    ],
  },

  // §4 ------------------------------------------------------------------------------------------
  {
    id: 'quran-22-52',
    aliases: ['interception-of-revelation'],
    dataItemId: IR,
    nav: 'Qurʾān 22:52',
    number: 4,
    h2: 'What does Qurʾān 22:52 say happens when a prophet recites?',
    glance: {
      title: 'Qurʾān 22:52',
      takeawayMd: 'Ibn ʿAbbās, the Prophet\'s cousin, as al-Bukhārī cites him: “When he spoke, the Shaytan threw (some falsehood) into his speech, but Allah abolished that which the Shaytan threw in.” The Qurʾān commentator Ibn Kathīr found that every chain of the story of Satan\'s words about three goddesses stops short of a Companion (*mursal*).',
      chips: ['Qurʾān 22:52', 'Ibn Kathīr', 'al-Ṭabarī', 'Bukhārī 1071'],
    },
    showcase: {
      caption: 'Side by side',
      ariaLabel: 'Qurʾān 22:52 and its commentators beside the Bible on deceiving spirits and testing them',
      left: {
        title: 'Qurʾān 22:52 and its commentators',
        items: [
          { textMd: '“Satan cast (something) into his wishful thinking. But God cancels what Satan casts”', ref: { data: d(IR, ISL, 0) } },
          { textMd: '“When he spoke, the Shaytan threw (some falsehood) into his speech.”', ref: { data: d(IR, ISL, 1) } },
        ],
      },
      right: {
        title: 'The Bible on spirits and prophets',
        items: [
          { textMd: '“I will go forth, and will be a false spirit in the mouth of all his prophets”', ref: { data: d(IR, PAR, 2) } },
          { textMd: '“do not believe every spirit, but test the spirits to see whether they are from God”', ref: { data: d(IR, PAR, 1) } },
        ],
      },
      noteMd: 'Where the translation above renders 22:52 literally as “began to wish” and “into his wishful thinking,” most classical commentators read those words as “reciting the Book of Allah” and “in his recitation.” On the reports that Satan put words praising three goddesses on the Prophet\'s tongue, Ibn Kathīr found every chain missing its Companion (*mursal*); Ibn Ḥajar held that their number gives the story a basis, with its wording to be interpreted.',
    },
    witnesses: {
      caption: 'Four classical scholars on the reports of Satan\'s words about the goddesses (the gharānīq reports)',
      items: [
        {
          name: 'al-Ṭabarī',
          meta: 'Commentary on the Qurʾān (*Tafsīr*), on 22:52',
          position: 'Records the reports as the occasion of the verse',
          quoteMd: '“Satan had cast onto his tongue, during some of what he was reciting from what Allah had revealed to him of the Qur’an, that which Allah had not revealed to him.”',
          ref: { extra: 'tabari-22-52-opening' },
        },
        {
          name: 'al-Qāḍī ʿIyāḍ',
          meta: '*al-Shifāʾ*, his book on the Prophet\'s standing, as quoted by Ibn Ḥajar',
          position: 'Rejected it: no compiler of sound hadith recorded it, and no reliable narrator passed it on with a sound, connected chain',
          quoteMd: '«هذا الحديث لم يخرجه أحد من أهل الصحة ولا رواه ثقة بسند سليم متصل»',
          glossMd: '*English rendering of the Arabic:* None of the compilers of sound hadith included this report, nor did any reliable narrator relate it with a sound, connected chain.',
          ref: { extra: 'iyad-shifa-gharaniq' },
        },
        {
          name: 'Ibn Kathīr',
          meta: 'Commentary on the Qurʾān (*Tafsīr*), on 22:52',
          position: 'Every chain stops short of a Companion (*mursal*); none sound',
          quoteMd: '“these reports all come through Mursal chains of narration and I do not think that any of them may be regarded as Sahih.”',
          ref: { data: d(IR, ISL, 1) },
        },
        {
          name: 'Ibn Ḥajar',
          meta: '*Fatḥ al-Bārī*, his commentary on Bukhārī, at Sūrat al-Ḥajj',
          position: 'Each route weak or broken, but their number shows the story has a basis; the words about the idols must then be interpreted, since the Prophet could not add to the Qurʾān',
          quoteMd: '«وكلها سوى طريق سعيد بن جبير إما ضعيف وإلا منقطع ، لكن كثرة الطرق تدل على أن للقصة أصلا»',
          glossMd: '*English rendering of the Arabic:* All of them except the route of Saʿīd b. Jubayr are either weak or broken, though the large number of routes indicates that the story has a basis.',
          ref: { extra: 'ibn-hajar-gharaniq-asl' },
        },
      ],
    },
    introMd:
      'Qurʾān 22:52 is the verse that speaks of Satan casting into a prophet\'s recitation: when a prophet “began to wish”, a word most commentators read as reciting, “Satan cast (something)”, and God cancels it. Ibn ʿAbbās, the cousin the Prophet prayed God would teach the Book ([Bukhārī 75](https://sunnah.com/bukhari:75)), explains it, as al-Bukhārī cites him, as Satan throwing falsehood into a prophet\'s speech. Al-Ṭabarī, author of the great early commentary on the Qurʾān, gives as its occasion reports that, as the Prophet recited Sūrat al-Najm, Satan put words praising three goddesses on his tongue (the *gharānīq* reports, named after their word for the goddesses), and the classical scholars split over them.',
    groups: [
      {
        key: 'islamic',
        label: 'What the Qurʾān, the commentators and the histories record',
        cards: [
          { data: d(IR, ISL, 0), label: 'The Qurʾān, Sūrat al-Ḥajj', noteMd: 'A. J. Droge, author of the annotated academic Qurʾān translation used on this site, renders the verb (*tamannā*) literally as “began to wish”; al-Baghawī and most classical commentators read it as “when he recited” (see the next card).' },
          { data: d(IR, ISL, 1), label: 'Ibn Kathīr, on 22:52', noteMd: 'Al-Bukhārī places Ibn ʿAbbās\'s explanation as an unchained chapter-heading note (*muʿallaq*) in his Book of Commentary (*Kitāb al-Tafsīr*) on Sūrat al-Ḥajj — his own choice of how to gloss 22:52 — and Ibn Kathīr also cites the report of ʿAlī b. Abī Ṭalḥa from Ibn ʿAbbās with the same opening words.', chips: [{ label: 'Bukhārī\'s chapter note in Fatḥ al-Bārī 8:293', href: 'https://www.islamweb.net/ar/library/content/52/8577/' }, { label: 'Kitāb al-Tafsīr on Sunnah.com (Bukhārī, Book 65)', href: 'https://sunnah.com/bukhari/65' }] },
          { data: d(IR, ISL, 2), label: 'al-Ṭabarī, *History*, from Muḥammad b. Kaʿb', noteMd: 'The words he reaches are Qurʾān 53:19–20, in Sūrat al-Najm; in al-Ṭabarī\'s commentary the same report ends with the idolaters prostrating with the Muslims at the close of that sūrah. Muḥammad b. Kaʿb al-Quraẓī belonged to the generation after the Companions (a Successor), so the report names no Companion who saw the event (*mursal*; translated by Watt & McDonald, vol. 6, p. 108).', chips: [{ label: 'al-Ṭabarī on 22:52', href: '/quran/22/52/tafsir/tabari' }] },
          { data: d(IR, ISL, 3), label: 'Ibn ʿAbbās, on the prostration at Sūrat al-Najm', noteMd: 'Bukhārī records the pagans prostrating with the Prophet at the end of Sūrat al-Najm; the report does not mention the words about the goddesses or give a reason for their prostration.' },
        ],
        collapsed: [
          { extra: 'tabari-22-52-report', label: 'The same report in al-Ṭabarī\'s *Tafsīr*' },
        ],
        collapsedSummary: 'The same report in al-Ṭabarī\'s Tafsīr, with the prostration',
      },
      {
        key: 'angel',
        label: 'How the New Testament describes speech from God\'s Spirit',
        cards: [
          { data: d(IR, EXP, 0), label: 'Peter, on how prophecy came' },
          { data: d(IR, EXP, 1), label: 'Paul, on speaking by the Spirit' },
          { data: d(IR, EXP, 2), label: 'John: “greater is He who is in you”' },
        ],
        collapsed: [],
      },
      {
        key: 'spirit',
        label: 'How the Bible describes deceiving spirits',
        cards: [
          { data: d(IR, PAR, 2), label: 'Micaiah\'s vision of the Lord\'s council', noteMd: 'Micaiah then tells King Ahab, “the Lord has put a false spirit in the mouth of all these your prophets” ([1 Kings 22:23](/bible/1kgs/22#23)).' },
          { data: d(IR, PAR, 0), label: 'Paul, on “later times”' },
          { data: d(IR, PAR, 1), label: 'John: “test the spirits”' },
        ],
        collapsed: [],
      },
    ],
    classicalMd:
      "Ibn Kathīr reports from the earlier commentator al-Baghawī the answer he calls among the most subtle: “that the Shaytan cast that into the hearing of the polytheists, so they imagined that it emanated from the Messenger of Allah.” Ibn Ḥajar, who held that the many routes give the story a basis, adds that the words about the idols must then be interpreted, since the Prophet could not add to the Qurʾān; he records the answer called the best: Satan spoke them in a pause of the recitation, imitating the Prophet's voice, so that those nearby took them for his ([Fatḥ al-Bārī 8:293–294](https://www.islamweb.net/ar/library/content/52/8577/)). Ibn Kathīr reads the verse as “consolation for him … do not let that grieve you, for the like of this has afflicted the messengers and prophets before you.”",
    evaluationMd:
      'The two answers need the gharānīq words to have come in Satan\'s voice, not on the Prophet\'s tongue. One report supports al-Baghawī\'s: in the report of Mūsā b. ʿUqba, author of an early book on the Prophet\'s campaigns, “the Muslims had not heard the verse that the Shaytan had thrown into the hearing of the polytheists,” and Ibn Kathīr notes that it too names no Companion (*mursal*). The others say Satan cast the words “onto his tongue” (al-Ṭabarī), among them the report of Saʿīd b. Jubayr, a student of Ibn ʿAbbās, the one route Ibn Ḥajar does not call weak or broken; in Muḥammad b. Kaʿb\'s, Gabriel says, “You have recited to the people what I did not bring you from Allah.” No report has Satan speaking in a pause in the Prophet\'s voice; Ibn Ḥajar cites Ibn ʿAbbās\'s reading of the verb (*tamannā*) as reciting, which places the casting in the recitation and names no voice.\n\nThe scholars a Sunni reader would turn to split here: al-Ṭabarī gives the reports as the verse\'s occasion, Ibn Kathīr and ʿIyāḍ reject them, and Ibn Ḥajar holds that together they give the story a basis, so naming any one of them does not settle the question. Ibn Kathīr finds every route missing its Companion or otherwise broken; the one linked to Ibn ʿAbbās carries its narrator\'s doubt ([Ibn Kathīr on 22:52](/quran/22/52/tafsir/ibn_kathir)). Muḥammad b. Kaʿb, whom Ibn Ḥajar calls trustworthy in his handbook of narrators, was born about 40 AH, a generation after the Companions ([Taqrīb al-Tahdhīb](https://shamela.ws/book/8609/430)). [Bukhārī 1071](https://sunnah.com/bukhari:1071), from Ibn ʿAbbās, records the pagans prostrating with the Prophet at the end of Sūrat al-Najm and gives no reason; in al-Ṭabarī\'s report from Muḥammad b. Kaʿb, the words about the goddesses come in the same sūrah (53:19–20), and the idolaters prostrate “when they heard the mention of their gods.” Ibn Baṭṭāl, one of the earliest commentators on Bukhārī, ties the prostration to what Satan cast, and Ibn Ḥajar points to the story at Sūrat al-Ḥajj ([Fatḥ al-Bārī 2:644](https://www.islamweb.net/ar/library/content/52/1982/)).\n\nThat leaves two ways to read the evidence. Setting the *gharānīq* reports aside with Ibn Kathīr and ʿIyāḍ leaves the pagans\' prostration in Bukhārī 1071 without a recorded cause, and still leaves Ibn ʿAbbās\'s explanation of 22:52, which al-Bukhārī placed as his chapter-heading note on the verse ([Fatḥ al-Bārī 8:293](https://www.islamweb.net/ar/library/content/52/8577/)): “When he spoke, the Shaytan threw (some falsehood) into his speech, but Allah abolished that which the Shaytan threw in.” Counting the routes together with Ibn Ḥajar gives the story a basis, and its primary wording (“onto his tongue”) then has to be re-read as another\'s voice on the strength of a single *mursal* report. In 1 Kings 22 the “false spirit” speaks through Ahab\'s prophets, and the Lord\'s prophet Micaiah names it (22:23). Qurʾān 22:52: “Satan cast (something) into his wishful thinking. But God cancels what Satan casts.”',
    evaluationDeeperMd:
      'Bukhārī 1071 reads, “with him prostrated the Muslims, the pagans, the jinns, and all human beings”; al-Ṭabarī\'s report from Muḥammad b. Kaʿb says the idolaters “prostrated when they heard the mention of their gods.” Ibn Ḥajar\'s condition for granting the story a basis is that its wording cannot be taken at face value, since the Prophet could not add to the Qurʾān; the other readings he lists, a doze (the early commentator Qatāda), a slip or compulsion, ʿIyāḍ and the Mālikī judge Abū Bakr b. al-ʿArabī reject ([Fatḥ al-Bārī 8:293–294](https://www.islamweb.net/ar/library/content/52/8577/)). Ibn ʿAbbās, whose explanation of the verse al-Bukhārī records, was too young to attend the prostration at Sūrat al-Najm (Ibn Ḥajar); Ibn Masʿūd, whom the Prophet named first of the four men to learn the Qurʾān from ([Bukhārī 3808](https://sunnah.com/bukhari:3808)), was there and says of the one man who did not prostrate, “Later on, I saw him killed as a non-believer” ([Bukhārī 1067](https://sunnah.com/bukhari:1067)). 2 Peter 1:21 says “men moved by the Holy Spirit spoke from God”; 1 John 4:1 tells its readers, “test the spirits to see whether they are from God.”',
    deeper: [
      {
        summary: 'Bukhārī\'s chapter-heading note on 22:52 in full',
        md: 'In *Ṣaḥīḥ al-Bukhārī*, Book 65 (*Kitāb al-Tafsīr*, Sūrat al-Ḥajj, before [Bukhārī 4741](https://sunnah.com/bukhari:4741)), al-Bukhārī opens the chapter with the unchained (*muʿallaq*) note: «وَقَالَ ابْنُ عَبَّاسٍ فِي أُمْنِيَّتِهِ إِذَا حَدَّثَ أَلْقَى الشَّيْطَانُ فِي حَدِيثِهِ فَيُبْطِلُ اللَّهُ مَا يُلْقِي الشَّيْطَانُ وَيُحْكِمُ اللَّهُ آيَاتِهِ» (*And Ibn ʿAbbās said on “into his wishful thinking”: when he spoke, Satan cast into his speech, so Allah abolishes what Satan casts and establishes His verses*). [Kitāb al-Tafsīr on Sunnah.com](https://sunnah.com/bukhari/65) · [Fatḥ al-Bārī 8:293](https://www.islamweb.net/ar/library/content/52/8577/)',
      },
      {
        summary: 'The verse that follows, 22:53',
        md: '“so that He may make what Satan casts a test for those in whose hearts is a sickness, and whose hearts are hardened – and surely the evildoers are indeed in extreme defiance –” [Qurʾān 22:53 with al-Ṭabarī](/quran/22/53/tafsir/tabari)',
      },
      {
        summary: 'Where the goddesses (gharānīq) report is told',
        md: 'Ibn Kathīr lists the routes, each from a narrator of the generation after the Companions or later: Saʿīd b. Jubayr (recorded by the hadith compilers Ibn Abī Ḥātim and al-Bazzār and by al-Ṭabarī), Abū al-ʿĀliya, al-Suddī, Muḥammad b. Kaʿb al-Quraẓī, Muḥammad b. Qays, Qatāda, and Mūsā b. ʿUqba from the hadith master al-Zuhrī. Of the last he says, “This is also *Mursal*,” and of Ibn Isḥāq\'s biography (*Sīra*) and the rest, “all of these are *Mursal* and broken-chained reports.” [Ibn Kathīr on 22:52](/quran/22/52/tafsir/ibn_kathir)',
      },
    ],
  },

  // §5 ------------------------------------------------------------------------------------------
  {
    id: 'after-hira',
    aliases: ['suicidal-despair'],
    dataItemId: SD,
    nav: 'After Ḥirāʾ',
    number: 5,
    h2: 'What do the reports record after Ḥirāʾ, when revelation paused?',
    glance: {
      title: 'After Ḥirāʾ',
      takeawayMd: 'Bukhārī 6982, in a passage introduced by “as we have heard”: “he intended several times to throw himself from the tops of high mountains,” and each time Gabriel appeared to him.',
      chips: ['Bukhārī 6982', 'Muslim 160a', 'Ibn Isḥāq'],
    },
    showcase: {
      caption: 'Side by side',
      ariaLabel: 'Bukhārī 6982 and Ibn Isḥāq beside Mark 9, Matthew 4 and Elijah in 1 Kings 19',
      left: {
        title: 'Bukhārī 6982 and Ibn Isḥāq',
        items: [
          { textMd: '“he intended several times to throw himself from the tops of high mountains”', ref: { data: d(SD, ISL, 0) } },
          { textMd: '“I will go to the top of the mountain and throw myself down that I may kill myself and gain rest.”', ref: { data: d(SD, ISL, 2) } },
        ],
      },
      right: {
        title: 'In the Bible: a spirit, the devil, and Elijah',
        items: [
          { textMd: '“It has often thrown him both into the fire and into the water to destroy him.”', ref: { data: d(SD, PAR, 1) } },
          { textMd: '“If You are the Son of God, throw Yourself down”', ref: { data: d(SD, PAR, 3) } },
          { textMd: '“O Lord, take, I pray you, my life from me”', ref: { data: d(SD, EXP, 0) } },
        ],
      },
      noteMd: 'In Bukhārī 6982 and Ibn Isḥāq, Gabriel stops him on the mountain; what the cards below compare is the impulse that drove him up the peaks in the pause after Ḥirāʾ. In the Bible, despairing prophets ask God in prayer to take their lives (1 Kings 19:4, Numbers 11:15, Jonah 4:3) while the angel feeds and strengthens Elijah; throwing oneself down from a height is what the devil urges in Matthew 4:6 (“throw Yourself down”) and what an unclean spirit drives a boy toward in Mark 9:22.',
    },
    witnesses: null,
    introMd:
      'Bukhārī 3 ends: “after a few days Waraqa died and the Divine Inspiration was also paused for a while”; Waraqa, Khadīja\'s Christian cousin, had told the Prophet that the one who came to him was the angel sent to Moses. What happened in that pause bears on how the Prophet came to be sure of his call: the longer form in Bukhārī 6982 adds, in a passage that opens with “as we have heard,” words Ibn Ḥajar assigns to the narrator al-Zuhrī, that he grew so sad he intended several times to throw himself from high mountains, and each time Gabriel appeared to him and calmed him.',
    groups: [
      {
        key: 'islamic',
        label: 'What the reports record',
        cards: [
          { data: d(SD, ISL, 0), label: 'ʿĀʾisha, with a passage added by al-Zuhrī', noteMd: 'From “became so sad” the passage is introduced by “as we have heard,” words that name no source; Ibn Ḥajar assigns them to the early hadith master al-Zuhrī.', chips: [{ label: 'Ibn Ḥajar on Bukhārī 6982 (Fatḥ al-Bārī 12:376)', href: 'https://www.islamweb.net/ar/library/content/52/12788/' }] },
          { data: d(SD, ISL, 1), label: 'The Prophet, home with Khadīja after Ḥirāʾ' },
          { data: d(SD, ISL, 2), label: 'The Prophet, in Ibn Isḥāq\'s biography, as al-Ṭabarī preserves it', noteMd: 'The English translator, Guillaume, adds this passage to his translation from al-Ṭabarī\'s *History* (p. 106).' },
        ],
        collapsed: [],
      },
      {
        key: 'angel',
        label: 'How the Bible describes angels caring for a prophet',
        cards: [
          { data: d(SD, EXP, 0), label: 'Elijah in the wilderness' },
          { data: d(SD, EXP, 1), label: 'The psalm the devil quotes (Matthew 4:6)' },
        ],
        collapsed: [
          { extra: 'nm-11-15', label: 'Moses, speaking to the Lord' },
          { extra: 'jon-4-3', label: 'Jonah, after Nineveh repents' },
        ],
        collapsedSummary: '2 passages Muslim writers point to (Numbers 11:15, Jonah 4:3)',
      },
      {
        key: 'spirit',
        label: 'How the Bible describes troubling spirits and the devil',
        cards: [
          { data: d(SD, PAR, 0), label: 'The man among the tombs' },
          { data: d(SD, PAR, 1), label: 'The same boy, as his father tells it' },
          { data: d(SD, PAR, 2), label: 'Saul, after the Spirit of the Lord left' },
          { data: d(SD, PAR, 3), label: 'The devil to Jesus, on the temple', noteMd: 'Jesus answers, “YOU SHALL NOT PUT THE LORD YOUR GOD TO THE TEST” ([Matthew 4:7](/bible/mt/4#7)).' },
        ],
        collapsed: [],
      },
    ],
    classicalMd:
      "Ibn Ḥajar says the words “as we have heard” are al-Zuhrī's: the passage is one of the reports al-Zuhrī passed on without naming his source (*balāghāt*), found in his student Maʿmar's version; Bukhārī 3, through another student, ends before it ([Fatḥ al-Bārī 12:376](https://www.islamweb.net/ar/library/content/52/12788/)). He quotes the early hadith scholar al-Ismāʿīlī: the wish came from weakness in bearing the burdens of prophethood, until he thought of the good end of patience and grew calm. His own reading is that the report states the reason, grief over what Waraqa had promised him, and he places al-Ismāʿīlī's point earlier, at the first encounter. In Bukhārī 6982 Gabriel says each time, “O Muhammad! You are indeed Allah's Messenger (ﷺ) in truth,” “whereupon his heart would become quiet and he would calm down and would return home.” Muslim writers also point to Moses, Elijah and Jonah, who asked God to take their lives (Numbers 11:15, 1 Kings 19:4, Jonah 4:3).",
    evaluationMd:
      "Ibn Ḥajar's point needs the mountain passage to rest on al-Zuhrī without a chain, and his text bears it out: the words “as we have heard” are al-Zuhrī's, the passage is in Maʿmar's version, and Bukhārī 3 ends before it ([Fatḥ al-Bārī 12:376](https://www.islamweb.net/ar/library/content/52/12788/)). Al-Ismāʿīlī's reason, weakness under the burdens of prophethood, cites no report; Ibn Ḥajar reads the report's own word, grief, as grief over what Waraqa had promised.\n\nIn his handbook of narrators ([*Taqrīb al-Tahdhīb*](https://shamela.ws/book/8609/432)), Ibn Ḥajar calls al-Zuhrī a hadith master whose standing and precision are agreed on; Imam al-Shāfiʿī, founder of one of the four schools of law, and the early hadith critics Yaḥyā al-Qaṭṭān and Ibn Maʿīn did not accept his reports that lack a chain ([Ibn Rajab, *Sharḥ ʿIlal al-Tirmidhī*](https://ketabonline.com/ar/books/6468/read?part=1&page=479)). Both judgments come from Sunni authorities, and the passage sits inside Ṣaḥīḥ al-Bukhārī. Two other lines tell the episode: the biographical dictionary of [Ibn Saʿd](https://shamela.ws/book/1686/152), from Ibn ʿAbbās through al-Wāqidī, whom [Ibn Ḥajar's handbook](https://shamela.ws/book/8609/424) calls abandoned as a narrator, naming the mountains Thabīr and Ḥirāʾ; and Ibn Isḥāq, as al-Ṭabarī preserves him.\n\nThe same standard of hadith grading applies to both this passage and the goddesses (*gharānīq*) reports in [section 4](#quran-22-52). A reader who sets aside this passage inside Ṣaḥīḥ al-Bukhārī 6982 because al-Zuhrī gives no chain beyond “as we have heard” must, by the same rule, reject every route of the *gharānīq* story; a reader who counts multiple broken or *mursal* lines together to establish a basis, as Ibn Ḥajar does in both places, keeps both episodes across Bukhārī 6982, Ibn Saʿd and Ibn Isḥāq. Taking the first option — rejecting both — means holding that a narrative passage printed inside *Ṣaḥīḥ al-Bukhārī*'s own hadith from ʿĀʾisha (Bukhārī 6982) is not authentic (*ṣaḥīḥ*). In the biblical passages Muslim writers compare, Moses, Elijah and Jonah each ask God in prayer to take their lives (Numbers 11:15, 1 Kings 19:4, Jonah 4:3), whereas climbing a height to throw oneself down matches the impulse the devil urges in Matthew 4:6 (“throw Yourself down”) and an unclean spirit drives a boy toward in Mark 9:22. In Bukhārī 6982 and Ibn Isḥāq it is Gabriel's appearance on the mountain that stops him — and in Bukhārī 6982 both the repeated impulse born of the pause after Ḥirāʾ and the reassurance that stops it rest on the passage al-Zuhrī introduces without a chain.",
    evaluationDeeperMd:
      "Ibn Isḥāq's account has the Prophet say, “Woe is me poet or possessed” and “I will go to the top of the mountain and throw myself down that I may kill myself and gain rest”; in his account and in Bukhārī 6982, Gabriel meets him on the mountain. Al-Ṭabarī also has, through another student of al-Zuhrī, the Prophet's words after Gabriel called him God's messenger: he had resolved to throw himself from a mountain height ([Fatḥ al-Bārī 12:378](https://www.islamweb.net/ar/library/content/52/12788/)). Al-Ismāʿīlī records the objection of some critics: how could the Prophet doubt his prophethood, to the point of climbing a peak to throw himself off? Elijah's prayer, “O Lord, take, I pray you, my life from me,” is followed by “the angel of the Lord returned again, and touched him” (1 Kings 19:4, 19:7). In Mark 5:5 a man with an unclean spirit is “screaming among the tombs and in the mountains, and gashing himself with stones”; in Mark 9:22 the spirit “has often thrown him both into the fire and into the water to destroy him.”",
    deeper: [
      {
        summary: 'The Arabic of “as we have heard” (Bukhārī 6982)',
        md: 'Bukhārī 6982: «حَتَّى حَزِنَ النَّبِيُّ صلى الله عليه وسلم فِيمَا بَلَغَنَا». The same report goes on: «فَإِذَا طَالَتْ عَلَيْهِ فَتْرَةُ الْوَحْىِ غَدَا لِمِثْلِ ذَلِكَ», when the pause grew long, he went out again. [Bukhārī 6982](https://sunnah.com/bukhari:6982)',
      },
      {
        summary: 'Note on the English translation “with terror” (Bukhārī 6982)',
        md: '“his neck muscles twitching with terror” renders «تَرْجُفُ بَوَادِرُهُ», the flesh between his neck and shoulders trembling. “with terror” is the English translator Muhsin Khan\'s addition. Bukhārī 3 has “with his heart beating severely”.',
      },
    ],
  },

  // §6 ------------------------------------------------------------------------------------------
  {
    id: 'testing-spirits',
    aliases: ['biblical-mandate'],
    dataItemId: null,
    nav: 'Testing spirits',
    number: 6,
    h2: 'How does the New Testament tell its readers to test a spirit?',
    glance: null,
    showcase: {
      caption: 'Side by side',
      ariaLabel: 'The New Testament\'s test of a spirit beside what the Qurʾān says of Jesus',
      left: {
        title: 'What 1 John and Galatians ask',
        items: [
          { textMd: '“Whoever confesses that Jesus is the Son of God, God abides in him”', ref: { extra: '1jn-4-15' } },
          { textMd: '“even if we, or an angel from heaven, should preach to you a gospel contrary … he is to be accursed!”', ref: { extra: 'mandate-gal-1-8' } },
        ],
      },
      right: {
        title: 'What the Qurʾān says of Jesus',
        items: [
          { textMd: '“they did not kill him, nor did they crucify him”', ref: { extra: 'q-4-157' } },
          { textMd: '“It is not for God to take any son.”', ref: { extra: 'q-19-35' } },
        ],
      },
      noteMd: 'Qurʾān 4:171 calls Jesus God\'s word, cast into Mary, and “a spirit from Him”.',
    },
    witnesses: null,
    introMd:
      'When the Qurʾān addresses doubts about what has been sent down to the Prophet, it tells him to “ask those who have been reciting the Book before you” ([Qurʾān 10:94](/quran/10/94/tafsir/tabari)) and tells the People of the Gospel to “judge by what God has sent down in it” ([Qurʾān 5:47](/quran/5/47/tafsir/tabari)). The New Testament gives its readers a direct test for any message from a spirit, an angel included: 1 John 4:1 tells them to “test the spirits to see whether they are from God,” and 1 John and Galatians weigh the message by what it says about Jesus. Muslim readers point to the Qurʾān\'s own answer, that God “cancels what Satan casts” (22:52).',
    groups: [
      {
        key: 'nt',
        label: 'What the New Testament tells its readers',
        cards: [
          { extra: 'mandate-2cor-11-14', label: 'A warning: Paul, on false apostles' },
          { data: d(IR, PAR, 1), label: 'A command: John, to his readers' },
          { extra: 'mandate-1jn-4-2-3', label: 'A test: Jesus Christ “come in the flesh”' },
          { extra: '1jn-4-15', label: 'A test: confessing the Son' },
          { extra: '1jn-2-22-23', label: 'A test: denying the Son' },
          { extra: 'mandate-gal-1-8', label: 'A test: a different gospel, from “an angel”' },
          { extra: 'gal-3-1', label: 'The gospel Paul preached in Galatians: Christ crucified' },
        ],
        collapsed: [],
      },
      {
        key: 'quran',
        label: 'What the Qurʾān says about the earlier Scriptures and about Jesus',
        cards: [
          { extra: 'q-10-94', label: 'Sūrat Yūnus, on asking those who read the Book before' },
          { extra: 'q-5-47', label: 'Sūrat al-Māʾida, on judging by the Gospel' },
          { extra: 'q-5-68', label: 'Sūrat al-Māʾida, to the People of the Book in the Prophet\'s day' },
          { extra: 'q-4-157', label: 'Sūrat al-Nisāʾ, on the crucifixion' },
          { extra: 'q-9-30', label: 'Sūrat al-Tawba, on what Christians say' },
          { extra: 'q-4-171', label: 'Sūrat al-Nisāʾ, to the People of the Book' },
          { extra: 'q-19-35', label: 'Sūrat Maryam, after the birth of Jesus' },
        ],
        collapsed: [],
      },
    ],
    classicalMd:
      'Qurʾān [4:171](/quran/4/171/tafsir/tabari) calls Jesus “a messenger of God, and His word, which He cast into Mary, and a spirit from Him,” and [19:35](/quran/19/35/tafsir/tabari) follows the account of his birth. Muslim readers do not take 1 John or Galatians as the measure of the Qurʾān, arguing that the earlier Scriptures were altered and that the Qurʾān gives its own criterion: God “cancels what Satan casts” (22:52) and makes it “a test for those in whose hearts is a sickness” ([22:53](/quran/22/53/tafsir/tabari)).',
    evaluationMd:
      'Why bring the New Testament\'s test to these reports? Because the Qurʾān itself sends a doubtful listener back to the earlier Scriptures in the present tense — “If you are in doubt about what We have sent down to you, ask those who have been reciting the Book before you” ([10:94](/quran/10/94/tafsir/tabari)) — and addresses the Prophet\'s seventh-century contemporaries about the Scriptures then in their hands: “Say: ‘People of the Book! You are (standing) on nothing until you observe the Torah and the Gospel, and what has been sent down to you from your Lord’” ([5:68](/quran/5/68/tafsir/tabari)), and “how will they make you (their) judge, when they have the Torah, containing the judgment of God” ([5:43](/quran/5/43/tafsir/tabari)). It also gives the command, “So let the People of the Gospel judge by what God has sent down in it” ([5:47](/quran/5/47/tafsir/tabari)); while al-Ṭabarī reads [5:47](/quran/5/47/tafsir/tabari) of the Gospel given to Jesus and says they “altered its judgment,” verses [10:94](/quran/10/94/tafsir/tabari), [5:68](/quran/5/68/tafsir/tabari) and [5:43](/quran/5/43/tafsir/tabari) speak directly of the books Jews and Christians were reading and holding in the Prophet\'s own day.\n\nIn the manuscript record, Papyrus 46 (c. AD 200) preserves Galatians, and fourth-century manuscripts such as Codex Sinaiticus and Codex Vaticanus preserve both Galatians and 1 John centuries before Ḥirāʾ (see [The Islamic Dilemma](/discover/islamic-dilemma) and [The Trustworthiness of the Bible](/discover/trustworthiness-of-the-bible)). When the People of the Gospel judge by what is written in those texts, they find a test given specifically for a new message brought by a spirit or “an angel from heaven” (Galatians 1:8; 1 John 4:1–3): does it confess the Son who came in the flesh (1 John 4:2–3, 4:15; 2:22–23) and the gospel in which “Jesus Christ was publicly portrayed [as] crucified” ([Galatians 3:1](/bible/gal/3#1); [1 Corinthians 2:2](/bible/1cor/2#2)), or does it deny the Father, the Son, and the cross?\n\nQurʾān 4:171 calls Jesus “His word” and “a spirit from Him,” while saying of his death, “they did not kill him, nor did they crucify him” ([4:157](/quran/4/157/tafsir/tabari)), and of his sonship, “It is not for God to take any son” ([19:35](/quran/19/35/tafsir/tabari)). Appealing to Qurʾān [22:52](/quran/22/52/tafsir/tabari) — that God “cancels what Satan casts” — to settle the question assumes the source of the recitation before testing it: both the words cast into the prophet\'s speech ([section 4](#quran-22-52)) and the later verse saying God cancelled them come through the same speaker. Unless the spirit is tested against what God had revealed before, the listener has the speaker\'s own reassurance that the earlier words were cancelled and the present words are from God.\n\nTaken together, the five accounts answer the question with which this page began. In each case, who the visitor was or which words came from God is settled after the event, from outside the encounter — by Waraqa after the pressing at Ḥirāʾ ([section 1](#hira)), by the Prophet\'s own description where the Companions witnessed the heavy weight and the sound ([section 2](#what-they-saw)), by the commentators\' appeal to doctrinal proof after a six-month spell ([section 3](#sihr)), by the speaker\'s own later reassurance after words cast into his speech ([section 4](#quran-22-52)), or by the visitor\'s own words in the unchained mountain passage ([section 5](#after-hira)). The earlier Scriptures to which the Qurʾān directs a doubtful listener give a direct test for any spirit or angel bringing a new message, and on the two points that test names — the Son of God and His crucifixion — the Qurʾān gives the opposite answer.',
    evaluationDeeperMd:
      '1 John 2:22 calls “the antichrist” “the one who denies the Father and the Son.” The Qurʾān records, “the Christians say, ‘The Messiah is the son of God.’” and answers, “(May) God fight them” ([9:30](/quran/9/30/tafsir/tabari)).',
    deeper: [
      {
        summary: 'Another verse on sonship',
        md: 'Qurʾān 112:3: “He has not begotten and was not begotten,” [Qurʾān 112:3 with al-Ṭabarī](/quran/112/3/tafsir/tabari)',
      },
    ],
  },
];

/** Deliberate repeats: shown in full each time; the later occurrence is collapsed and points back. */
export const REPEATS = [
  { ...d(IR, PAR, 1), sections: ['quran-22-52', 'testing-spirits'] },
];

/**
 * New verbatim texts (not in demonic_revelation.json), checked against `sourceFile`/`sourceKey` by
 * the model test. `label` is the chip label. Bold is ours (emphasis added).
 */
export const EXTRA_QUOTES = {
  // §1 – passages Muslim writers cite (Septuagint, as the reader shows it; NASB for Luke)
  'dn-8-27': {
    text: 'And I Daniel **fell asleep, and was sick**: then I arose, and did the king\'s business; and I wondered at the vision, and there was none that understood [it].',
    label: 'Daniel 8:27', href: '/bible/dn/8#27',
    sourceFile: 'src/data/scripture/lxx2012/dn.json', sourceKey: '8:27',
  },
  'gn-32-24-26': {
    text: 'And Jacob was left alone; and a man wrestled with him till the morning. And he saw that he prevailed not against him; and he touched the broad part of his thigh, and **the broad part of Jacob\'s thigh was benumbed** in his wrestling with him. And he said to him, Let me go, for the day has dawned; but he said, **I will not let you go, except you bless me**.',
    label: 'Genesis 32:24–26', href: '/bible/gn/32#24',
    sourceFile: 'src/data/scripture/lxx2012/gn.json', sourceKey: '32:24-26',
  },
  'lk-1-18-20': {
    text: 'Zacharias said to the angel, "How will I know this [for certain]? For I am an old man and my wife is advanced in years." The angel answered and said to him, "I am Gabriel, who stands in the presence of God, and I have been sent to speak to you and to bring you this good news. … And behold, **you shall be silent and unable to speak** until the day when these things take place, **because you did not believe my words**, which will be fulfilled in their proper time."',
    label: 'Luke 1:18–20', href: '/bible/lk/1#18',
    sourceFile: 'src/data/scripture/nasb/lk.json', sourceKey: '1:18-20',
  },
  // §2
  'dn-10-8': {
    text: 'So I was left alone, and saw this great vision, and **there was no strength left in me**, and my glory was turned into corruption, and I retained no strength.',
    label: 'Daniel 10:8', href: '/bible/dn/10#8',
    sourceFile: 'src/data/scripture/lxx2012/dn.json', sourceKey: '10:8',
  },
  // §3
  'ik-113-4-six-months': {
    text: 'Imam Ahmad also recorded from Ibrahim bin Khalid, from Rabah, from Ma\'mar, from Hisham, from his father, from \'A\'ishah who said, "The Messenger of Allah **remained for six months thinking that he was having relations (with his wives) when he was not**. Then two angels came to him, one sitting at his head and the other at his feet. One of them said to the other, \'What is wrong with him?\' The other replied, \'He is bewitched.\' The first asked, \'And who bewitched him?\' The other answered, \'Labid bin Al-A\'sam.\'"',
    label: 'Ibn Kathīr on 113:4', href: '/quran/113/4/tafsir/ibn_kathir',
    sourceFile: 'src/data/quran/commentary/tafsir_ibn_kathir_catena.json', sourceKey: '113:4',
  },
  'q-17-47': {
    text: 'We know what they listen to when they listen to you, and when they (are in) secret talk, when the evildoers say, **‘You are only following a man (who is) bewitched.’**',
    label: 'Qurʾān 17:47 with al-Ṭabarī', href: '/quran/17/47/tafsir/tabari',
    sourceFile: 'src/data/quran/english/droge_translation.json', sourceKey: '17:47',
  },
  '2cor-12-7-8': {
    text: 'Because of the surpassing greatness of the revelations, for this reason, to keep me from exalting myself, there was given me **a thorn in the flesh, a messenger of Satan to torment me**-- to keep me from exalting myself! Concerning this I implored the Lord three times that it might leave me.',
    label: '2 Corinthians 12:7–8', href: '/bible/2cor/12#7',
    sourceFile: 'src/data/scripture/nasb/2cor.json', sourceKey: '12:7-8',
  },
  'jb-2-7': {
    text: 'So the devil went out from the Lord, and **struck Job with sore boils** from [his] feet to [his] head.',
    label: 'Job 2:7', href: '/bible/jb/2#7',
    sourceFile: 'src/data/scripture/lxx2012/jb.json', sourceKey: '2:7',
  },
  // §4
  'tabari-22-52-opening': {
    text: 'Satan had cast onto his tongue, during some of what he was reciting from what Allah had revealed to him of the Qur’an, that which Allah had not revealed to him.',
    label: 'al-Ṭabarī on 22:52', href: '/quran/22/52/tafsir/tabari',
    sourceFile: 'src/data/quran/commentary/tafsir_tabari_english.json', sourceKey: '22:52',
  },
  'tabari-22-52-report': {
    text: 'Satan cast onto his tongue, because of what he had been telling himself and wishing to bring to his people: "Those are the high Gharaniq, and indeed their intercession is to be approved." … When he reached the prostration in it and concluded the Surah, he prostrated in it. Thus, the Muslims prostrated with the prostration of their Prophet, affirming what he had brought and following his command. Furthermore, **those in the mosque among the idolaters from Quraysh and others prostrated when they heard the mention of their gods**.',
    label: 'al-Ṭabarī on 22:52', href: '/quran/22/52/tafsir/tabari',
    sourceFile: 'src/data/quran/commentary/tafsir_tabari_english.json', sourceKey: '22:52',
  },
  'iyad-shifa-gharaniq': {
    text: 'هذا الحديث لم يخرجه أحد من أهل الصحة ولا رواه ثقة بسند سليم متصل',
    lang: 'ar',
    label: 'Ibn Ḥajar, Fatḥ al-Bārī 8:293, quoting al-Qāḍī ʿIyāḍ',
    href: 'https://www.islamweb.net/ar/library/content/52/8577/',
    sourceFile: 'external', url: 'https://www.islamweb.net/ar/library/content/52/8577/',
    note: 'Verified as quoted by Ibn Ḥajar (evidence_bank.md iyad-shifa-gharaniq); the page in al-Shifāʾ itself is unverified.',
  },
  'ibn-hajar-gharaniq-asl': {
    text: 'وكلها سوى طريق سعيد بن جبير إما ضعيف وإلا منقطع ، لكن كثرة الطرق تدل على أن للقصة أصلا',
    lang: 'ar',
    label: 'Ibn Ḥajar on Sūrat al-Ḥajj (Fatḥ al-Bārī 8:293–294)',
    href: 'https://www.islamweb.net/ar/library/content/52/8577/',
    sourceFile: 'external', url: 'https://www.islamweb.net/ar/library/content/52/8577/',
    note: 'evidence_bank.md ibn-hajar-gharaniq-asl (IslamWeb wording «وإلا منقطع»).',
  },
  // §5 – passages Muslim writers cite (Septuagint)
  'nm-11-15': {
    text: 'And if you do thus to me, **kill me utterly**, if I have found favor with you, that I may not see my affliction.',
    label: 'Numbers 11:15', href: '/bible/nm/11#15',
    sourceFile: 'src/data/scripture/lxx2012/nm.json', sourceKey: '11:15',
  },
  'jon-4-3': {
    text: 'And now, Lord God, **take my life from me**; for [it is] better for me to die than to live.',
    label: 'Jonah 4:3', href: '/bible/jon/4#3',
    sourceFile: 'src/data/scripture/lxx2012/jon.json', sourceKey: '4:3',
  },
  // §6 – the hard-coded "Testing the Spirits" quotes, verbatim from BiblicalMandateSection.jsx (= NASB)
  'mandate-2cor-11-14': {
    text: 'No wonder, for even **Satan disguises himself as an angel of light**.',
    label: '2 Corinthians 11:14', href: '/bible/2cor/11#14',
    sourceFile: 'src/data/scripture/nasb/2cor.json', sourceKey: '11:14',
  },
  'mandate-1jn-4-2-3': {
    text: 'By this you know the Spirit of God: every spirit that confesses that Jesus Christ has come in the flesh is from God; and **every spirit that does not confess Jesus is not from God; this is the spirit of the antichrist**...',
    label: '1 John 4:2–3', href: '/bible/1jn/4#2',
    sourceFile: 'src/data/scripture/nasb/1jn.json', sourceKey: '4:2-3',
  },
  'mandate-gal-1-8': {
    text: 'But **even if we, or an angel from heaven, should preach to you a gospel contrary** to what we have preached to you, he is to be accursed!',
    label: 'Galatians 1:8', href: '/bible/gal/1#8',
    sourceFile: 'src/data/scripture/nasb/gal.json', sourceKey: '1:8',
  },
  'gal-3-1': {
    text: 'You foolish Galatians, **who has bewitched you**, before whose eyes **Jesus Christ was publicly portrayed [as] crucified**?',
    label: 'Galatians 3:1', href: '/bible/gal/3#1',
    sourceFile: 'src/data/scripture/nasb/gal.json', sourceKey: '3:1',
  },
  '1jn-4-15': {
    text: '**Whoever confesses that Jesus is the Son of God, God abides in him**, and he in God.',
    label: '1 John 4:15', href: '/bible/1jn/4#15',
    sourceFile: 'src/data/scripture/nasb/1jn.json', sourceKey: '4:15',
  },
  '1jn-2-22-23': {
    text: 'Who is the liar but the one who denies that Jesus is the Christ? **This is the antichrist, the one who denies the Father and the Son.** Whoever denies the Son does not have the Father; the one who confesses the Son has the Father also.',
    label: '1 John 2:22–23', href: '/bible/1jn/2#22',
    sourceFile: 'src/data/scripture/nasb/1jn.json', sourceKey: '2:22-23',
  },
  'q-10-94': {
    text: 'If you are in doubt about what We have sent down to you, **ask those who have been reciting the Book before you**. The truth has come to you from your Lord, so do not be one of the doubters.',
    label: 'Qurʾān 10:94 with al-Ṭabarī', href: '/quran/10/94/tafsir/tabari',
    sourceFile: 'src/data/quran/english/droge_translation.json', sourceKey: '10:94',
  },
  'q-5-47': {
    text: '**So let the People of the Gospel judge by what God has sent down in it.** Whoever does not judge by what God has sent down, those – they are the wicked.',
    label: 'Qurʾān 5:47 with al-Ṭabarī', href: '/quran/5/47/tafsir/tabari',
    sourceFile: 'src/data/quran/english/droge_translation.json', sourceKey: '5:47',
  },
  'q-5-68': {
    text: 'Say: ‘People of the Book! **You are (standing) on nothing until you observe the Torah and the Gospel**, and what has been sent down to you from your Lord.’',
    label: 'Qurʾān 5:68 with al-Ṭabarī', href: '/quran/5/68/tafsir/tabari',
    sourceFile: 'src/data/quran/english/droge_translation.json', sourceKey: '5:68',
  },
  'q-4-157': {
    text: 'and for their saying, ‘Surely we killed the Messiah, Jesus, son of Mary, the messenger of God’ – yet **they did not kill him, nor did they crucify him**, but it (only) seemed like (that) to them.',
    label: 'Qurʾān 4:157 with al-Ṭabarī', href: '/quran/4/157/tafsir/tabari',
    sourceFile: 'src/data/quran/english/droge_translation.json', sourceKey: '4:157',
  },
  'q-9-30': {
    text: 'The Jews say, ‘Ezra is the son of God,’ and **the Christians say, ‘The Messiah is the son of God.’** That is their saying with their mouths. They imitate the saying of those who disbelieved before (them). (May) God fight them. How are they (so) deluded?',
    label: 'Qurʾān 9:30 with al-Ṭabarī', href: '/quran/9/30/tafsir/tabari',
    sourceFile: 'src/data/quran/english/droge_translation.json', sourceKey: '9:30',
  },
  'q-4-171': {
    text: 'The Messiah, Jesus, son of Mary, was only a messenger of God, and His word, which He cast into Mary, and a spirit from Him. … God is only one God. Glory to Him! **(Far be it) that He should have a son!**',
    label: 'Qurʾān 4:171 with al-Ṭabarī', href: '/quran/4/171/tafsir/tabari',
    sourceFile: 'src/data/quran/english/droge_translation.json', sourceKey: '4:171',
  },
  'q-19-35': {
    text: '**It is not for God to take any son.** Glory to Him! When He decrees something, He simply says to it, ‘Be!’ and it is.',
    label: 'Qurʾān 19:35 with al-Ṭabarī', href: '/quran/19/35/tafsir/tabari',
    sourceFile: 'src/data/quran/english/droge_translation.json', sourceKey: '19:35',
  },
};

export const CLOSING = {
  heading: 'Two books on what Satan casts',
  md: 'Every report on this page links to its source and its commentators. Qurʾān 22:52 says God “cancels what Satan casts”; 1 John 4:1 tells its readers to “test the spirits to see whether they are from God.”',
};
