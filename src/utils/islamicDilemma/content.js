/**
 * Every reader-facing string on /discover/islamic-dilemma (page-owned copy), keyed by stable ids.
 *
 * STATUS: FINAL COPY (phase2_copy.md r3, signed off by the adversarial reviewer). The fact checker's
 * `phase1_facts.md` governs every claim. Layout never hardcodes text, so swapping copy means editing
 * this file (and `overrides.js` for text that replaces markdown fields) only.
 *
 * Conventions
 *  - `*Md` fields are inline Markdown: `*em*`, `**strong**`, `[text](target)`. Targets may be
 *    `#anchor`, `/site/path` (BASE is added), `https://…` (external policy applies), `quran/S/A`
 *    or `tabari://S/A` (→ al-Ṭabarī page) or `ibnkathir://S/A` (→ Ibn Kathīr page).
 *  - Quotations are objects. Their `text` must be VERBATIM and say where it was checked:
 *      fromMd: true                                  → substring of islamic_dilemma.md
 *      source: { tafsir: 'ibn_kathir'|'tabari', key } → substring of the repo tafsir JSON
 *      source: { nasb: 'book', ch, v | [v, …] }       → NASB data in src/data/scripture/nasb
 *      source: { droge: 'S:A' | ['S:A', …] }          → src/data/quran/english/droge_translation.json
 *    `…` marks an omission: each part between ellipses must appear, in order. `model.test.mjs`
 *    enforces all of this. `q` = Qurʾān reference "S:A" (links to al-Ṭabarī).
 *  - Words quoted inside our own sentences use “…” (curly double quotes), so the tone gate can tell
 *    a quoted source from our voice.
 *  - Our own voice follows docs/article_and_ux_playbook.md §2 (the test bans the listed words
 *    outside quotations).
 */

/** UI labels (chrome, chips, disclosure summaries). `{n}`/`{m}`/`{ref}` are filled by the model. */
export const LABELS = {
  navAria: 'Sections of this page',
  back: 'Discover',
  copyLink: 'Copy link',
  copied: 'Link copied',
  sideBySide: 'Side by side',
  glance: 'At a glance',
  glanceGo: 'Go to section {n}',
  classical: 'The classical explanation',
  evaluation: 'Comparing with the primary text',
  deeper: 'Go deeper',
  arabic: 'Original Arabic',
  fullVerses: 'Read the full verses',
  chipQuran: 'Qurʾān {ref} with al-Ṭabarī',
  chipIbnKathir: 'Ibn Kathīr on {ref}',
  chipTabari: 'al-Ṭabarī on {ref}',
  chipContext: 'Read {ref} in context',
  chipBible: 'Open {ref}',
  chipMss: 'All {m} manuscripts on this site',
  countChip: '{n} copies on this site are dated before 610',
  scansSummary: 'See the scans of these {n} copies older than 610',
  scansLoading: 'Loading the scans…',
  timelineCaption: 'Timeline',
  timelineAria: 'Dated New Testament copies and the years of the first revelation and of Sūrat al-Māʾida',
  witnessesCaption: 'What the scholars said',
  checkSources: 'Check the sources',
  allReferences: 'All references on this page',
  academic: 'Academic references',
  academicNote: 'Studies and reference works on the material above, from more than one perspective.',
  sourcesNote: {
    quran: 'Opens Tafsir al-Ṭabarī or Ibn Kathīr on this site',
    sunnah: 'Opens Sunnah.com',
    classical: 'Opens Shamela and other libraries',
    manuscripts: 'Opens the holding library, or the scans on this site',
    bible: 'NASB on this site',
    other: '',
  },
  sourceGroups: {
    quran: 'Qurʾān',
    sunnah: 'Hadith collections',
    manuscripts: 'Manuscripts',
    bible: 'Bible text',
    classical: 'Classical works',
    other: 'Other references',
  },
};

/** Header (cold landing). The H1 promises 3 verses: the 3 full cards of §1 (5:47, 5:68, 5:43). */
export const HEADER = {
  eyebrow: 'The Islamic Dilemma · Qurʾān and Gospel',
  h1: '3 Qurʾān Verses on the Torah and Gospel, Beside Bible Copies Older Than Islam',
  hookMd:
    "Many Muslims hold that the Torah and the Gospel were changed ([2:79](quran/2/79), [5:13](quran/5/13)). In the Qurʾān, God tells the People of the Gospel to judge by what He sent down in it ([5:47](quran/5/47)), and the classical Qurʾān commentators al-Ṭabarī and Ibn Kathīr explain [5:43](quran/5/43) and [5:68](quran/5/68) as speaking of the books Jews and Christians had in hand. New Testament copies made centuries before 610 (the year of the first revelation) already carry the accounts of Jesus' crucifixion and resurrection that the Qurʾān denies ([4:157](quran/4/157)). If the Gospel was changed before 610, [5:47](quran/5/47) and [5:68](quran/5/68) point Christians to a book already changed in their hands. If it was not changed before 610, those copies show what the Gospel said when the verses were recited.",
  context: 'Every quotation links to its source.',
};

/** Section nav labels (≤ 14 characters), headings (reader questions) and cold-landing context lines. */
export const SECTION_COPY = {
  quran: {
    nav: 'Qurʾān',
    heading: 'What Does the Qurʾān Tell Jews and Christians to Do With the Books They Had?',
  },
  'gospel-copies': {
    nav: 'Early copies',
    heading: 'What Did the New Testament Say in Copies Made Before Islam?',
  },
  'on-jesus': {
    nav: 'On Jesus',
    heading: "How Does the Qurʾān's Account of Jesus Compare With Those Copies?",
  },
  'text-history': {
    nav: 'Text history',
    heading: 'What Did Classical Scholars Write About Changes to the Torah and Gospel?',
  },
  answers: {
    nav: 'Answers',
    heading: 'How Do Three Common Answers Compare With the Texts?',
  },
  sources: {
    nav: 'Sources',
    heading: 'Check the sources',
  },
};
/** Shown under a section heading when a reader lands directly on that section from a #hash link (links to #top). */
export const SECTION_CONTEXT = 'Start from the top ↑';

/** Core showcase (confrontation) under the header: both books in the opening slot. */
export const CORE = {
  caption: 'Side by side',
  ariaLabel: "The Qurʾān's verses on the Torah and Gospel beside four New Testament passages from copies older than Islam",
  leadMd: "These four passages stand in New Testament copies made centuries before 610. In [section 3](#on-jesus), they are set beside Qurʾān [4:157–158](quran/4/157), [5:72](quran/5/72) and [9:30](quran/9/30).",
  left: {
    title: 'What the Qurʾān says about the books they had',
    items: [
      { q: '5:47', quote: { text: 'So let the People of the Gospel judge by what God has sent down in it.', fromMd: true } },
      { q: '5:68', quote: { text: 'Say: ‘People of the Book! You are (standing) on nothing until you observe the Torah and the Gospel, and what has been sent down to you from your Lord.’', fromMd: true } },
      { q: '5:43', quote: { text: 'Yet how will they make you (their) judge, when they have the Torah, containing the judgment of God, (and) then turn away after that?', fromMd: true } },
    ],
  },
  right: {
    title: 'What those copies already said when 5:47 was recited',
    /** `mss` is checked against the verse's scans and the pre-610 list; `witness` is the line readers see. */
    items: [
      { passage: '1cor-15-3', mss: ['P46'], witness: 'Papyrus 46, late 2nd–early 3rd century', quote: { text: 'Christ died for our sins according to the Scriptures, and that He was buried, and that He was raised on the third day', fromMd: true } },
      { passage: 'jn-1-1', mss: ['P66', 'P75', '01'], witness: 'Papyri 66 and 75, 2nd–3rd century; Codex Sinaiticus, c. 330–360', quote: { text: 'In the beginning was the Word, and the Word was with God, and the Word was God.', source: { nasb: 'jn', ch: 1, v: 1 } } },
      { passage: 'mk-15-39', mss: ['01'], witness: 'Codex Sinaiticus, c. 330–360', quote: { text: 'Truly this man was the Son of God!', source: { nasb: 'mk', ch: 15, v: 39 } } },
      { passage: 'mt-28-19', mss: ['01'], witness: 'Codex Sinaiticus, c. 330–360', quote: { text: 'baptizing them in the name of the Father and the Son and the Holy Spirit', source: { nasb: 'mt', ch: 28, v: 19 } } },
    ],
  },
  noteMd: '',
};

/**
 * At a glance: 4 compact cards, each jumping to a section. `kind` picks the compact showcase.
 * confrontation: `left`/`right` = { title, text? }; chips: `chips` = short labels;
 * timeline reuses GOSPEL_COPIES.timelineCompact.
 */
export const GLANCE = [
  {
    target: 'quran', kind: 'chips',
    title: '3 verses on the books they had',
    take: '5:47 and 5:68 tell the People of the Gospel to judge by it and observe it; 5:43 says the Jews who came to the Prophet “have the Torah”.',
    chips: ['5:47', '5:68', '5:43'],
  },
  {
    target: 'gospel-copies', kind: 'timeline',
    title: 'Copies older than Islam',
    take: 'The copies shown are dated between the 2nd and 6th centuries, before the first revelation in 610.',
  },
  {
    target: 'on-jesus', kind: 'confrontation',
    title: 'His death and who he is',
    take: 'The copies say Christ died, was buried and was raised; Qurʾān 4:157 says “they did not kill him, nor did they crucify him.”',
    left: { title: '1 Cor 15 · Mark 15' },
    right: { title: '4:157' },
  },
  {
    target: 'text-history', kind: 'chips',
    title: 'What classical scholars wrote',
    take: 'Classical scholars disagreed: some held the wording of the Torah and Gospel was never changed, others that the copies in hand were altered.',
    chips: ['Ibn ʿAbbās', 'Wahb', 'al-Bukhārī', 'Ibn Kathīr', 'Ibn Ḥazm', 'Ibn Taymiyya'],
  },
];

/**
 * §1 Qurʾān. Full evidence cards (5:47, 5:68, 5:43), the Torah report, then compact verses.
 * Card labels and bodies come from overrides.js (TABLE_ROWS.affirm[ref]); verse quotes come from the
 * md table. `classical`/`evaluation`/`deeper` blocks are { textMd?, quote?, arabic?, afterMd? };
 * `deeper` is a list of such blocks.
 */
export const QURAN = {
  introMd: 'Three verses in Sūrat al-Māʾida (Surah 5) tell the Jews and Christians to judge by the Torah and the Gospel or to observe them. If those verses speak of the books Jews and Christians had in the Prophet\'s day, the claim that those books were already changed has to account for them. Al-Ṭabarī (d. 923), whose commentary (*tafsīr*) gathers the early Muslims\' explanations of each verse with their chains of narrators, and Ibn Kathīr (d. 1373), author of one of the most widely read commentaries on the Qurʾān, explain 5:43 and 5:68 as speaking of the books in their hands.',
  cards: [
    {
      q: '5:47',
      highlight: 'judge by what God has sent down in it',
      chips: ['tabari', 'ibn_kathir', 'context'],
      classical: {
        quote: { text: "And We gave 'Isa, son of Maryam, the Injil, in which is guidance and light, and confirming what was before it of the Tawrah, and We commanded its people to judge by what We have sent down in it, but they did not obey Us in Our command to them regarding what We commanded them with in it", source: { tafsir: 'tabari', key: '5:47' } },
        arabic: 'وأمرنا أهله أن يحكُموا بما أنـزلنا  فيه، فلم يطيعونا في أمرنا إياهم بما أمرناهم به فيه',
        afterMd: 'Ibn Kathīr records two ways the verse was read. On the first, God gave Jesus the Gospel (*Injīl*) “so that the people of his religion would judge by it in their time.” On the second—the command printed in the written Qurʾān (*muṣḥaf*) today—it means “Let them believe in all that is in it, and establish what they were commanded in it. Among what is in it is the glad tidings of the sending of Muhammad (peace and blessings of Allah be upon him) and the command to follow him and believe in him when he is found.”',
      },
      evaluation: {
        textMd: "Ibn Kathīr's first reading needs the verse to speak of Jesus' followers in their own day rather than the Christians of the Prophet's day. Al-Ṭabarī records both ways of reading the verse and calls them “two well-known recitations, close in meaning”, “due to the agreement of their two meanings”: under the first, “they altered its judgment and opposed it”; under the second, “they did not obey Us in Our command to them regarding what We commanded them with in it; rather, they opposed Our command” ([al-Ṭabarī on 5:47](tabari://5/47)). In both readings, the fault al-Ṭabarī names is disobeying what the book commanded, not a lost book.\n\nIbn Kathīr's second reading needs the command to cover what the Gospel says of Muḥammad. Elsewhere (on [3:78](ibnkathir://3/78) and [5:41](ibnkathir://5/41), discussed in [section 4](#text-history)) Ibn Kathīr states that the copies in their hands were altered; explaining the command here, he writes “Let them believe in all that is in it”, counts the glad tidings of Muḥammad as “Among what is in it”, and points to 7:157: “whom they find written in their Torah and Gospel” ([Surah 7:157](quran/7/157)).\n\nEither the command reaches the People of the Gospel of the Prophet's day, as in today's written Qurʾān and in Ibn Kathīr's second reading, and what God sent down was in the Gospel they held. Or the verse speaks of Jesus' own generation—and in the same chapter (Sūrat al-Māʾida) the Qurʾān still says of the Jews who came to the Prophet that “they have the Torah” (5:43), and tells the People of the Book to “observe the Torah and the Gospel” (5:68). (The view that the Gospel given to Jesus was lost or replaced by biographies is taken up in [answer 1](#answer-1).) The verse:",
        quote: { text: 'So let the People of the Gospel judge by what God has sent down in it. Whoever does not judge by what God has sent down, those – they are the wicked.', source: { droge: '5:47' } },
      },
      deeper: [
        {
          textMd: "The two recitations of 5:47: al-Ṭabarī records that the command, let them judge (*wal-yaḥkum*, the reading printed in today's written Qurʾān, the Ḥafṣ reading), was read by the “reciters of the Hijaz and Basra, and some of the Kufans”, while “so that they would judge” (*wa-li-yaḥkuma*) was read by a group in Kufa ([al-Ṭabarī on 5:47](tabari://5/47)).",
        },
      ],
    },
    {
      q: '5:68',
      highlight: 'until you observe the Torah and the Gospel',
      chips: ['ibn_kathir', 'tabari'],
      classical: {
        quote: { text: 'meaning no real religion until you adhere to and implement the Tawrah and the Injil. That is, until you believe in all the Books that you have that Allah revealed to the Prophets. These Books command following Muhammad and believing in his prophecy, all the while adhering to his Law.', source: { tafsir: 'ibn_kathir', key: '5:68' } },
        arabic: 'حتى تؤمنوا بجميع ما بأيديكم من الكتب المنزلة من الله على الأنبياء',
        afterMd: 'Ibn Kathīr reads “observe the Torah and the Gospel” as believing in those Books, which, he says, “command following Muhammad and believing in his prophecy”. He reports from the early Meccan commentator Mujāhid (d. 722, a student of the Companions) that “what has been sent down to you from your Lord” means “the Great Quran”.',
      },
      evaluation: {
        textMd: "Ibn Kathīr's reading needs the Books in their hands to carry God's command about Muḥammad. In his words they are “all the Books that you have” (in Arabic *mā bi-aydīkum*, “what is in your hands”), and these Books “command following Muhammad”. He names no passage of the Torah or the Gospel here; on 5:47 he points to 7:157, “whom they find written in their Torah and Gospel”.\n\nNeither commentator limits “observe” to a single passage about Muḥammad. Al-Ṭabarī writes: “So you must act according to all of that, and believe in what it contains regarding faith in Muhammad”, and “acknowledge that all of this is from Allah. Thus, you must not disbelieve in any part of it” ([al-Ṭabarī on 5:68](tabari://5/68)).\n\nEither the Torah and the Gospel in their hands carried God's command as a whole, and observing them meant acting on all of them as al-Ṭabarī and Ibn Kathīr write. Or parts of those Books had already been changed—including the crucifixion and resurrection accounts in all four Gospels—and 5:68 still told the People of the Book to “observe the Torah and the Gospel” with no word separating true parts from changed parts. The verse:",
        quote: { text: 'Say: ‘People of the Book! You are (standing) on nothing until you observe the Torah and the Gospel, and what has been sent down to you from your Lord.’', source: { droge: '5:68' } },
      },
      deeper: [
        {
          textMd: 'Qurʾān 5:68 in full:',
          quote: { text: 'Say: ‘People of the Book! You are (standing) on nothing until you observe the Torah and the Gospel, and what has been sent down to you from your Lord.’ But what has been sent down to you from your Lord will indeed increase many of them in insolent transgression and disbelief. So do not grieve over the people who are disbelievers.', source: { droge: '5:68' } },
        },
      ],
    },
    {
      q: '5:43',
      highlight: 'when they have the Torah',
      chips: ['tabari', 'ibn_kathir'],
      classical: {
        quote: { text: '{when they have the Torah} which I revealed to Musa, which they acknowledge to be true, and that it is My Book which I revealed to My Prophet … they know that My judgment in it concerning the married adulterer is stoning to death … They abandon judging by it, after knowing My judgment therein, out of audacity against Me and in disobedience to Me.', source: { tafsir: 'tabari', key: '5:43' } },
        arabic: 'التي أنـزلتها على موسى، التي يقرُّون بها أنها حق، وأنها كتابي الذي أنـزلته إلى نبيي',
        afterMd: 'Ibn Kathīr, on 5:41, says of the same Jews: “They had changed the Book of Allah that was in their hands, concerning the command to stone the married among them.” He explains why the Prophet asked them about the Torah: “his asking them about it was to make them admit to what was in their hands, which they had mutually agreed to hide, deny, and abandon implementing for those long eras” ([Ibn Kathīr on 5:41](ibnkathir://5/41)).',
      },
      evaluation: {
        textMd: "Ibn Kathīr's explanation needs the Prophet's question to be a way of making them acknowledge the stoning ruling, not a statement about the rest of the book. Al-Ṭabarī reads 5:44 in the same setting: the Torah contains “an exposition of what these Jews asked you regarding the ruling of the married adulterers” ([al-Ṭabarī on 5:44](tabari://5/44)). On 5:43 itself he says more: the Torah is “My Book which I revealed to My Prophet”, and “whatever judgment is in it is from My judgment”.\n\nThe reports Ibn Kathīr cites show what “changed” meant here. Two come from Ibn ʿUmar (d. 693, the son of ʿUmar and one of the most-cited Companions in al-Bukhārī). When the Torah was opened, a man laid his hand over the stoning verse (*rajm*); ʿAbdullāh ibn Salām, a Jewish scholar of Medina who became a Companion, and of whom the early Companion Saʿd ibn Abī Waqqāṣ (one of the ten promised Paradise) reports the Prophet said he was “from the people of Paradise” ([Bukhārī 3812](https://sunnah.com/bukhari:3812)), told him to lift his hand, and the stoning verse was written beneath it ([Bukhārī 3635](https://sunnah.com/bukhari:3635), quoted in the card next). In a second report ([Sunan Abī Dāwūd 4449](https://sunnah.com/abudawud:4449), in that card's *Go deeper*) the Prophet placed the Torah brought to him on a cushion and said, in Ibn Kathīr's wording, “I believe in you and in He Who revealed you.” The change Ibn Kathīr describes was to the punishment they applied; the verse was still on the page.\n\nEither the Torah in Medina was the book God revealed, as the Prophet's words to the copy in front of him say, and its text held the ruling once the hand was lifted. Or the verse and the Prophet's words vouch for one ruling inside a book otherwise changed—a limit that al-Ṭabarī's “whatever judgment is in it is from My judgment” leaves no room for. These reports concern the Torah in Medina, and the same chapter links the Torah and the Gospel right after it (5:46–47) and in one breath at [5:66](quran/5/66) and [5:68](quran/5/68). In the one case in al-Bukhārī and Muslim where the Torah was opened before the Prophet to settle a ruling, the text stood on the page. (A separate report in Musnad Aḥmad, cited by [Ibn Kathīr on 12:3](ibnkathir://12/3), where ʿUmar brings “a book that he took from some of the People of the Book” and the Prophet says, “If Musa were living, he would have no choice but to follow me”, concerns whether Muslims should seek guidance outside the Prophet's law, not whether the Torah's text was changed.) The verse:",
        quote: { text: 'Yet how will they make you (their) judge, when they have the Torah, containing the judgment of God, (and) then turn away after that?', fromMd: true },
      },
      deeper: [
        {
          textMd: 'Ibn Kathīr on 5:43 itself:',
          quote: { text: 'Allah then chastises them for their false ideas and deviant desires to abandon what they believe is true in their Book, which is in their hands, and which they claim is their eternal Law that they are always commanded to adhere to.', source: { tafsir: 'ibn_kathir', key: '5:43' } },
        },
      ],
    },
  ],
  torah: {
    heading: 'What the Prophet did with the Torah brought to him',
    label: "Ṣaḥīḥ al-Bukhārī 3635 · The stoning verse under the reader's hand",
    bodyMd: 'Ibn ʿUmar reports that when the Jews of Medina came to the Prophet in a case of adultery and brought the Torah (as quoted by Ibn Kathīr on 5:41 from Ṣaḥīḥ al-Bukhārī):',
    quote: { text: "So they brought the Tawrah and opened it, but one of them placed his hand over the verse of stoning and recited what was before and after it. 'Abdullah bin Salam said to him, 'Remove your hand.' So he removed his hand, and there was the verse of stoning in it. So they said, 'He has spoken the truth, O Muhammad! In it is the verse of stoning!'", source: { tafsir: 'ibn_kathir', key: '5:41' } },
    noteMd: 'Recorded in Ṣaḥīḥ al-Bukhārī (3635) and Ṣaḥīḥ Muslim, and quoted in full by Ibn Kathīr on 5:41 (the Sunnah.com translation of Bukhārī 3635 renders the same words “Lift your hand” and “When he lifted his hand, the Verse of Rajm was written there”).',
    chipTarget: 'https://sunnah.com/bukhari:3635',
    chipSourceLabel: 'Bukhārī 3635',
    chipLabel: 'Bukhārī 3635 on Sunnah.com',
    /** Extra verify chip (Ibn Kathīr's tafsir page). */
    tafsirChip: { q: '5:41', scholar: 'ibn_kathir' },
    deeper: [
      {
        textMd: 'In a second report from Ibn ʿUmar ([Sunan Abī Dāwūd 4449](https://sunnah.com/abudawud:4449), graded good, *ḥasan*, by the modern hadith scholar al-Albānī, with one narrator in its chain, Hishām ibn Saʿd, questioned by some hadith critics), when the Torah was brought to the Prophet he took the cushion from under himself, placed the Torah on it and said (in the Sunnah.com translation):',
        quote: { text: 'I believed in thee and in Him Who revealed thee.', fromMd: true },
        afterMd: 'Ibn Kathīr cites this same report on [5:41](ibnkathir://5/41) in modern English: “I believe in you and in He Who revealed you.”',
      },
    ],
  },
  compactHeading: 'Three more verses on the earlier Books',
  /** Compact cards; quotes come from the md §2 table. 10:94 last. */
  compact: [
    {
      q: '3:3',
      chips: ['tabari'],
      deeper: [
        {
          textMd: 'The Arabic is *muṣaddiqan li-mā bayna yadayhi*, literally “confirming what is between its hands”. Al-Ṭabarī explains it as “confirming what preceded it of the Books of Allah which He sent down upon His Prophets and Messengers”.',
        },
      ],
    },
    {
      q: '29:46',
      chips: ['tabari', 'ibn_kathir'],
      classical: {
        textMd: 'Ibn Kathīr reads this as belief “in a general manner, conditional upon it being revealed (by Allah) and not altered or misinterpreted.”',
      },
      evaluation: {
        textMd: "Ibn Kathīr's condition needs some of what the People of the Book relate to be altered. He supports it with two reports in al-Bukhārī. In [Bukhārī 4485](https://sunnah.com/bukhari:4485) they read the Torah “in Hebrew and explain it in Arabic to the Muslims”, and the Prophet said, “Do not believe the People of the Book and do not deny them.” In [Bukhārī 7363](https://sunnah.com/bukhari:7363) Ibn ʿAbbās, the Prophet's cousin, for whom he prayed, “O Allah! Bestow on him the knowledge of the Book” ([Bukhārī 75](https://sunnah.com/bukhari:75)), says the Qurʾān “tells you that the People of the Book altered and changed the Book” ([Ibn Kathīr on 29:46](ibnkathir://29/46)). The first asks Muslims to hold judgment on what they relate; neither names an altered passage.\n\nAl-Ṭabarī reads “what has been sent down to you” as “from what is in the Torah and the Gospel” ([al-Ṭabarī on 29:46](tabari://29/46)). In Ibn Kathīr's citation of that report on [29:46](ibnkathir://29/46), the Prophet tells Muslims to answer the Torah read aloud in Medina with the confession “We believe in Allah and what has been revealed to us and what has been revealed to you. Our God and your God is One, and to Him we have submitted” (in al-Bukhārī's text at [Bukhārī 4485](https://sunnah.com/bukhari:4485), placed under [2:136](quran/2/136), the citation stops at “We believe in Allah and what is revealed to us”). Either the verse affirms the book they were reading, while Muslims hold judgment on their spoken explanations. Or it affirms an original they no longer had, and Muslims are told to hold judgment on the very Books that 5:47 and 5:68 tell the People of the Book to judge by and observe. The verse:",
        quote: { text: 'And say: ‘We believe in what has been sent down to us, and what has been sent down to you. Our God and your God is one, and to Him we submit.’', source: { droge: '29:46' } },
      },
    },
    {
      q: '10:94',
      chips: ['tabari', 'ibn_kathir'],
      classical: {
        textMd: 'Ibn Kathīr reports from the early commentator Qatāda (d. 735, of the generation after the Companions) that the Prophet said, “I do not doubt, and I do not ask”, and adds that the Prophet\'s cousin Ibn ʿAbbās said the same. Two leading students of the Companions, Saʿīd ibn Jubayr and al-Ḥasan al-Baṣrī, said it too. Al-Ṭabarī names believers from the People of the Book, “like \'Abdullah bin Salam and his like”, as the readers meant.',
      },
      evaluation: {
        textMd: "Both answers have early reports behind them: the Prophet did not doubt and did not ask, and the readers meant are believers such as ʿAbdullāh ibn Salām (the same Companion who told the reader of the Torah in [5:43](#q-5-43) to lift his hand). They narrow who is asked; they do not change what is consulted. Al-Ṭabarī explains the verse “because they find you written with them, and they know you by the description by which you are described in their Book, in the Tawrah and the Injil”, and Ibn ʿAbbās says: “Ask them if you are in doubt that you are written with them” ([al-Ṭabarī on 10:94](tabari://10/94)).\n\nIbn Kathīr adds that others “hide it and distort it” (in Arabic *yulbisūna dhālika wa-yuḥarrifūnahu wa-yubaddilūnahu*: they obscure it, distort it and change it). On the view that the description of the Prophet stood in a book changed elsewhere, the verse itself names no such part: it sends him to “those who have been reciting the Book before you”, and al-Ṭabarī places what they confirm in “their Book, in the Tawrah and the Injil”.\n\nEither the Book they recited held what God sent down, and the believing readers confirmed him from it. Or the verse sent the Prophet, for confirmation, to readers of a book already changed, naming no part to set aside. The verse:",
        quote: { text: 'If you are in doubt about what We have sent down to you, ask those who have been reciting the Book before you. The truth has come to you from your Lord, so do not be one of the doubters.', source: { droge: '10:94' } },
      },
    },
  ],
};

/** §2 Gospel copies: timeline, the great codices, Codex Sinaiticus, then 4 passage cards. */
export const GOSPEL_COPIES = {
  introMd: 'What the Gospel said before Islam bears on which book 5:47 told the People of the Gospel to judge by. The [official register of Greek New Testament manuscripts](https://ntvmr.uni-muenster.de/liste), kept by a research institute in Münster, lists hundreds of manuscripts and fragments, early copies on papyrus sheets (*papyri*) and bound manuscript books (*codices*), copied before the 7th century. Early Syriac, Latin and Coptic translations add to them. The dated copies on this site carry the four passages quoted in this section.',
  /** Timeline points, oldest first (strings are date ranges; numbers are years CE). */
  timeline: [
    { year: '2nd–3rd century', labelMd: "Papyri 66 and 75 (P66, P75; John) and Papyrus 46 (P46; letters of the apostle Paul, written in the 50s AD, with 1 Corinthians 15)" },
    { year: 'c. 300–325', labelMd: 'Codex Vaticanus: a Greek Bible containing all four Gospels. No scan on this site (Vatican Library)' },
    { year: 'c. 330–360', labelMd: 'Codex Sinaiticus: the oldest complete New Testament' },
    { year: '382–405', labelMd: "The Latin Bible (the Vulgate, translated by the Christian scholar Jerome), used in the Latin West" },
    { year: 'Late 4th–5th century', labelMd: 'Codex Washingtonianus (the Gospels) and Codex Bezae (Gospels and Acts, Greek and Latin)' },
    { year: 'c. 400–440', labelMd: 'Codex Alexandrinus: a Greek Bible from Egypt (by tradition), with Mark, Luke, most of John and the end of Matthew' },
    { year: '5th century', labelMd: 'The Syriac Bible (Peshitta), with the four Gospels' },
    { year: '5th–6th century', labelMd: "Codex Ephraemi, Codex Claromontanus (Paul's letters), Codex Petropolitanus Purpureus and the Rossano Gospels" },
    { year: 610, labelMd: 'The first revelation to Muhammad, by the traditional date' },
    { year: '622–632', labelMd: 'Medina: Sūrat al-Māʾida, with 5:43, 5:47 and 5:68' },
  ],
  timelineGap: 'Every copy listed above was made before this date.',
  /** Compact timeline for the glance card (the shared compact timeline shows the first and last two points). */
  timelineCompact: [
    { year: '2nd–3rd c.', labelMd: 'Papyri 46, 66, 75' },
    { year: 'c. 330–360', labelMd: 'Codex Sinaiticus' },
    { year: 610, labelMd: 'First revelation' },
    { year: '622–632', labelMd: 'Sūrat al-Māʾida' },
  ],
  /** Evidence cards after the timeline. `chips` targets use the same link scheme as `*Md` links. */
  cards: [
    {
      id: 'codices',
      label: 'The great bound Bibles (codices)',
      bodyMd: "The great 4th–5th-century Greek Bibles (Vaticanus, Sinaiticus, Alexandrinus), together with the Syriac Bible (Peshitta, 5th c.), contain the four Gospels: Matthew, Mark, Luke and John. Each of these Gospels narrates Jesus' crucifixion and resurrection. Those were the Gospels the churches read in the 7th century.",
      bannerMd: 'Scans of Sinaiticus, Alexandrinus and the earlier papyri can be opened in the four passage cards below.',
      chips: [],
    },
    {
      id: 'sinaiticus',
      label: 'Codex Sinaiticus · c. 330–360',
      bodyMd: 'About 250–280 years before Islam, this complete New Testament contains the accounts of the crucifixion (Matthew 27, Mark 15, Luke 23, John 19), John 1:1 and Matthew 28:19.',
      chips: [
        { label: 'Codex Sinaiticus online', target: 'https://codexsinaiticus.org', kind: 'manuscripts' },
        { label: 'Scans on this site', target: '/bible/jn/1/1/manuscripts' },
      ],
    },
  ],
  summaryMd: "In these copies, the Gospels and Paul's letters call Jesus the Son of God (Mark 15:39) and the Word who “was God” (John 1:1), and say that he died, was buried and was raised on the third day (1 Corinthians 15:3–4).",
};

/** Passage cards (§2), keyed by config.PASSAGES[].id. NASB text verbatim. */
export const PASSAGES_COPY = {
  'jn-1-1': {
    topic: '“The Word was God”',
    refLabel: 'John 1:1, 14',
    quote: { text: 'In the beginning was the Word, and the Word was with God, and the Word was God. … And the Word became flesh, and dwelt among us, and we saw His glory, glory as of the only begotten from the Father, full of grace and truth.', source: { nasb: 'jn', ch: 1, v: [1, 14] } },
  },
  'mk-15-39': {
    topic: 'At his death',
    refLabel: 'Mark 15:39',
    quote: { text: 'When the centurion, who was standing right in front of Him, saw the way He breathed His last, he said, "Truly this man was the Son of God!"', source: { nasb: 'mk', ch: 15, v: 39 } },
  },
  'mt-28-19': {
    topic: 'Father, Son and Holy Spirit',
    refLabel: 'Matthew 28:19',
    quote: { text: 'Go therefore and make disciples of all the nations, baptizing them in the name of the Father and the Son and the Holy Spirit,', source: { nasb: 'mt', ch: 28, v: 19 } },
  },
  '1cor-15-3': {
    topic: 'Died, buried, raised',
    refLabel: '1 Corinthians 15:3–4',
    badge: 'Paul wrote this letter c. 53–55 AD and introduces these words as “what I also received”, a creed passed on to him earlier (dated by historians such as Gerd Lüdemann and James Dunn to the 30s AD)',
    quote: { text: 'For I delivered to you as of first importance what I also received, that Christ died for our sins according to the Scriptures, and that He was buried, and that He was raised on the third day according to the Scriptures,', source: { nasb: '1cor', ch: 15, v: [3, 4] } },
  },
};

/**
 * §3 On Jesus: one confrontation per row. Items: `passage` (links to the §2 card), `q` (Qurʾān;
 * `label` overrides the ref chip text) or `bible` (another NASB verse; `tag` is a small label).
 */
export const ON_JESUS = {
  introMd: "The Qurʾān tells the People of the Gospel to judge by what God sent down in it ([5:47](quran/5/47)) and to observe the Torah and the Gospel ([5:68](quran/5/68)). Because the copies in [section 2](#gospel-copies) were written centuries before 610, these passages on Jesus' death and on who he is were already in the Gospel Christians held when 5:47 and 5:68 were recited, while the Qurʾān gives a different account on both points.",
  rows: [
    {
      caption: 'His death',
      left: {
        title: 'In the New Testament copies above',
        items: [
          { passage: '1cor-15-3', quote: { text: 'that Christ died for our sins according to the Scriptures, and that He was buried, and that He was raised on the third day according to the Scriptures', source: { nasb: '1cor', ch: 15, v: [3, 4] } } },
          { passage: 'mk-15-39', quote: { text: 'When the centurion … saw the way He breathed His last, he said, "Truly this man was the Son of God!"', source: { nasb: 'mk', ch: 15, v: 39 } } },
        ],
      },
      right: {
        title: 'In the Qurʾān',
        items: [
          { q: '4:157', label: 'Qurʾān 4:157–158', quote: { text: 'and for their saying, ‘Surely we killed the Messiah, Jesus, son of Mary, the messenger of God’ – yet they did not kill him, nor did they crucify him, but it (only) seemed like (that) to them. … Certainly they did not kill him. No! God raised him to Himself.', source: { droge: ['4:157', '4:158'] } } },
        ],
      },
    },
    {
      caption: 'Who he is',
      left: {
        title: 'In the New Testament copies above',
        items: [
          { passage: 'jn-1-1', label: 'John 1:1, 14', quote: { text: 'In the beginning was the Word, and the Word was with God, and the Word was God. … And the Word became flesh, and dwelt among us, and we saw His glory, glory as of the only begotten from the Father, full of grace and truth.', source: { nasb: 'jn', ch: 1, v: [1, 14] } } },
          { passage: 'mk-15-39', quote: { text: 'Truly this man was the Son of God!', source: { nasb: 'mk', ch: 15, v: 39 } } },
          { passage: 'mt-28-19', quote: { text: 'Go therefore and make disciples of all the nations, baptizing them in the name of the Father and the Son and the Holy Spirit,', source: { nasb: 'mt', ch: 28, v: 19 } } },
        ],
      },
      right: {
        title: 'In the Qurʾān',
        items: [
          { q: '5:72', quote: { text: 'Certainly they have disbelieved who say, ‘Surely God – He is the Messiah, son of Mary,’ …', source: { droge: '5:72' } } },
          { q: '9:30', quote: { text: '… the Christians say, ‘The Messiah is the son of God.’ That is their saying with their mouths. … How are they (so) deluded?', source: { droge: '9:30' } } },
        ],
      },
    },
  ],
  takeawayMd: "In copies made centuries before 610, the New Testament says Christ died, was buried and was raised (1 Corinthians 15:3–4) and calls him the Son of God (Mark 15:39); Qurʾān 4:157 says “they did not kill him, nor did they crucify him.” If the Gospel Christians held in the 7th century is the book 5:47 told them to judge by, this is what it said.\n\nOn [4:157](ibnkathir://4/157), a common reply is that the verse itself says “it (only) seemed like (that) to them”—in Ibn Kathīr's account, another man was made to look like Jesus and crucified, and “some Christians accepted their false claim”—so the early Gospel copies show how early that impression took hold. Two things remain on that reading. First, the question here is not how Christians in the 1st century came to believe Jesus was crucified, but which book [5:47](quran/5/47) told 7th-century Christians to judge by and [5:68](quran/5/68) told them to observe: the dated copies show that the crucifixion and resurrection accounts stood in all four Gospels in their hands. Second, “it (only) seemed like (that) to them” in 4:157 speaks of the crucifixion, not of calling Jesus the Word who “was God” (John 1:1) or “the Son of God” (Mark 15:39; Matthew 28:19), which stand in the same pre-610 copies.",
  /** Full verse texts in a collapsed "Read the full verses" (md blockquotes, verbatim). */
  fullVerses: ['4:157', '4:158', '5:72', '9:30'],
  noteMd: 'All four Gospels narrate the crucifixion. Outside the New Testament, the Roman historian Tacitus (writing c. 116 AD, *Annals* 15.44) says Christ “suffered the extreme penalty during the reign of Tiberius at the hands of… Pontius Pilatus”, and the 1st-century Jewish historian Josephus (*Antiquities* 18.64) says the Roman governor Pilate “condemned him to the cross”, in a passage many scholars hold was partly expanded by later copyists, its core usually accepted. [What do sources outside the Bible say about Jesus? →](/discover/extrabiblical-evidence-for-jesus)',
};

/** §4 Text history. */
export const TEXT_HISTORY = {
  introMd: 'Whether the Torah and the Gospel were changed, and when, decides which book 5:47 told the People of the Gospel to judge by. The Qurʾān speaks of people who “alter words from their positions” ([5:13](quran/5/13)) and of “those who write the Book with their (own) hands, (and) then say, ‘This is from God’” ([2:79](quran/2/79)). Classical scholars disagreed about what was altered: Wahb ibn Munabbih (d. c. 730), a Yemeni scholar of the generation after the Companions, held that no letter of the Torah and the Gospel was removed, Ibn Kathīr that the copies in Jewish and Christian hands were altered, and the Damascus scholar Ibn Taymiyya (d. 1328) took a middle view.',
  /**
   * Witness cards (witnesses showcase). Data-driven: add, remove or reorder entries freely.
   * Shape: { scholar, deathAh (digits or null; CE dates go in `work`), work, position, arabic?,
   *          quoteLead?, quote | paraphrase, support?: { lead, quote }, ref, moreRefs? }.
   * `paraphrase` renders with no quotation marks (attributed position, not a quotation).
   */
  witnesses: [
    {
      scholar: 'Ibn ʿAbbās (in Ṣaḥīḥ al-Bukhārī)',
      deathAh: null,
      work: 'd. 687 · chapter heading in al-Bukhārī (d. 870), Book of Tawḥīd, ch. 55, quoted by Ibn Kathīr on 3:78',
      position: 'Meaning distorted, wording kept',
      quoteLead: "Ibn Kathīr's report of it:",
      quote: { text: '…none among Allah’s creation can remove the Words of Allah from His Books, they alter and distort their apparent meanings.', source: { tafsir: 'ibn_kathir', key: '3:78' } },
      arabic: 'وليس أحد من خلق الله يزيل لفظ كتاب من كتب الله ، لكنهم يحرفونه : يتأولونه على غير تأويله',
      ref: { label: 'Ibn Kathīr on 3:78', target: 'ibnkathir://3/78' },
      moreRefs: [{ label: 'Bukhārī, Book of Tawḥīd, ch. 55', target: 'https://sunnah.com/bukhari:7553' }],
    },
    {
      scholar: 'Wahb ibn Munabbih',
      deathAh: null,
      work: 'd. c. 730 · quoted by Ibn Kathīr on 3:78',
      position: 'Wording kept',
      quote: { text: 'The Tawrah and the Injil remain as Allah revealed them, and no letter in them was removed. However, the people misguide others by addition and false interpretation, relying on books that they wrote themselves.', source: { tafsir: 'ibn_kathir', key: '3:78' } },
      arabic: 'إن التوراة والإنجيل كما أنزلهما الله لم يغير منهما حرف ، ولكنهم يضلون بالتحريف والتأويل ، وكتب كانوا يكتبونها من عند أنفسهم',
      ref: { label: 'Ibn Kathīr on 3:78', target: 'ibnkathir://3/78' },
    },
    {
      scholar: 'Ibn ʿAbbās',
      deathAh: null,
      work: 'd. 687 · the Prophet\'s cousin · Ṣaḥīḥ al-Bukhārī 7363, as quoted by Ibn Kathīr',
      position: 'Wording changed',
      quoteLead: 'Ibn Kathīr, quoting Ibn ʿAbbās (al-Bukhārī):',
      quote: { text: "it tells you that the People of the Book altered and changed the Book, that they write the Book with their own hands and then say, 'This is from Allah,' to purchase with it a small price", source: { tafsir: 'ibn_kathir', key: '29:46' } },
      ref: { label: 'Bukhārī 7363 on Sunnah.com', target: 'https://sunnah.com/bukhari:7363' },
      moreRefs: [{ label: 'Ibn Kathīr on 29:46', target: 'ibnkathir://29/46' }],
    },
    {
      scholar: 'Ibn Kathīr',
      deathAh: null,
      work: 'd. 1373 · commentary on 3:78',
      position: 'Copies in hand altered',
      quote: { text: 'if Wahb meant the books that are currently in the hands of the People of the Book, then we should state that there is no doubt that they altered, distorted, added to and deleted from them. For instance, the Arabic versions of these books contain tremendous error, many additions and deletions and enormous misinterpretation. … If Wahb meant the Books of Allah that He has with Him, then indeed, these Books are preserved and were never changed.', source: { tafsir: 'ibn_kathir', key: '3:78' } },
      arabic: 'فإن عنى وهب ما بأيديهم من ذلك ، فلا شك أنه قد دخلها التبديل والتحريف والزيادة والنقص',
      ref: { label: 'Ibn Kathīr on 3:78', target: 'ibnkathir://3/78' },
    },
    {
      scholar: 'Ibn Ḥazm',
      deathAh: null,
      work: 'd. 1064 · jurist of Cordoba (Islamic Spain); author of a survey of religions and sects (*al-Fiṣal*)',
      position: 'Wording changed',
      paraphrase: "Argued that the Torah and the four Gospels held by Jews and Christians had been altered in their wording, pointing to passages such as the account of Moses' death at the end of Deuteronomy (34:5) and differences between the genealogies of Jesus in Matthew 1 and Luke 3.",
      support: {
        lead: 'A study note on 5:43 in the annotated Qurʾān translation (A. J. Droge) on this site says',
        quote: { text: 'Many scholars locate the first major development of the accusation in the writings of Ibn Ḥazm (d. 1064) of Cordoba.', source: { droge: '5:43' } },
      },
      ref: null,
    },
    {
      scholar: 'Ibn Taymiyya',
      deathAh: null,
      work: 'd. 1328 · Damascus scholar; author of a long reply to a Christian treatise (*al-Jawāb al-ṣaḥīḥ*)',
      position: 'Some wording, much meaning',
      paraphrase: 'Held a middle view: some wording in the copies was altered, and much more of the meaning was distorted in interpretation.',
      ref: null,
    },
  ],
  witnessesTakeaway: 'Classical scholars disagreed, and Ibn ʿAbbās is quoted on both sides, so the question turns on the texts and their dates rather than on any one name.',
  versesHeading: "What Does the Qurʾān Say About Changing God's Words?",
  versesIntroMd: 'The Qurʾān says three times that no one can change God\'s words, and in 5:44 and 5:46 it calls the Torah and the Gospel what God sent down, “containing guidance and light”. Read together, Christian writers argue, these verses mean that no one could change the Torah and the Gospel. Classical commentators read the three verses differently.',
  /** Verse cards (verbatim Droge). */
  verses: [
    { q: '6:34', chips: ['tabari'], quote: { text: 'Certainly messengers have been called liars before you, yet they patiently endured being called liars, and suffered harm, until Our help came to them. No one can change the words of God. Certainly some of the story has (already) come to you about the envoys (before you).', source: { droge: '6:34' } } },
    { q: '6:115', chips: ['tabari'], quote: { text: 'Perfect is the word of your Lord in truth and justice. No one can change His words. He is the Hearing, the Knowing.', source: { droge: '6:115' } } },
    { q: '18:27', chips: ['tabari'], quote: { text: 'Recite what you have been inspired (with) of the Book of your Lord. No one can change His words, and you will find no refuge other than Him.', source: { droge: '18:27' } } },
    { q: '5:44', chips: ['tabari'], quote: { text: 'Surely We sent down the Torah, containing guidance and light. …', source: { droge: '5:44' } } },
    { q: '5:46', chips: ['tabari'], quote: { text: 'And in their footsteps We followed up with Jesus, son of Mary, confirming what was with him of the Torah, and We gave him the Gospel, containing guidance and light, and confirming what was with him of the Torah, and as guidance and admonition to the ones who guard (themselves).', source: { droge: '5:46' } } },
  ],
  versesClassical: {
    textMd: "Ibn Kathīr read [6:34](ibnkathir://6/34) as “the words He has written decreeing victory” and [6:115](ibnkathir://6/115) as “none can avert Allah's judgment”. On 18:27, which opens “Recite what you have been inspired (with) of the Book of your Lord”, he wrote that no one can “alter them, distort them or misinterpret them”. Al-Ṭabarī read “the word of your Lord” in 6:115 as “meaning the Qur'an”, and “No one can change His words” as “There is no alterer for what He has informed in His books that it will occur”. He adds a sentence on the earlier Books ([al-Ṭabarī on 6:115](tabari://6/115)):",
    quote: { text: 'And that is because the Jews and the Christians are undoubtedly the people of the books of Allah which He sent down to His prophets, yet He, glorious is His praise, has informed that they distort what is other than that which He informed has no alterer.', source: { tafsir: 'tabari', key: '6:115' } },
    arabic: 'وذلك أن اليهود والنصارى لا شك أنهم أهلُ كتب الله التي أنـزلها على أنبيائه, وقد أخبر جل ثناؤه أنهم يحرِّفون غيرَ الذي أخبر أنَّه لا مبدِّل له',
    afterMd: '[Ibn Kathīr on 18:27, about the Qurʾān](ibnkathir://18/27)',
  },
  versesEvaluation: {
    textMd: "Al-Ṭabarī's reading needs “His words” in 6:115 to mean what God foretold, so that the promise guards events and not the wording of the earlier Books in people's hands; those, he says, the Jews and the Christians “distort”. Ibn Kathīr draws a similar line on 3:78, between “the books that are currently in the hands of the People of the Book” and “the Books of Allah that He has with Him”.\n\nThe reading has texts behind it. Al-Ṭabarī supports this sense of “word” with 48:15, “They want to change the word of Allah”, said of a foretold event; 6:34 is about God's help to His messengers, and 18:27 opens “Recite what you have been inspired (with) of the Book of your Lord”.\n\nEarly authorities read the alteration of the earlier Books two ways. In Ṣaḥīḥ al-Bukhārī's chapter heading (quoted from Ibn ʿAbbās by Ibn Kathīr on 3:78), no one can remove God's words from His Books and the distortion is of their meaning; in [Bukhārī 7363](https://sunnah.com/bukhari:7363) Ibn ʿAbbās says they “changed their scripture and distorted it”. The Companion the Prophet prayed would know the Book ([Bukhārī 75](https://sunnah.com/bukhari:75)) is quoted on both sides.\n\nEither the three verses do not guard the wording of the Torah and the Gospel in human hands, as al-Ṭabarī reads them, so the question passes to history: what 2:79 and 5:13 mean by alteration, and what the dated copies in [section 2](#gospel-copies) show. Or no one could remove God's words from His Books, as the statement in al-Bukhārī says, and the Torah and the Gospel kept their wording. That statement, as Ibn Kathīr gives it:",
    quote: { text: '…none among Allah’s creation can remove the Words of Allah from His Books, they alter and distort their apparent meanings.', source: { tafsir: 'ibn_kathir', key: '3:78' } },
  },
  /** Section close: 2:79 and 5:13 + the main classical views, then the comparison (texts last). */
  summaryHeading: 'What Do the Commentators Say on 2:79 and 5:13, and How Do the Views Compare With the Dated Copies?',
  classical: {
    textMd: "Two verses are most often cited for scriptural alteration: [Qurʾān 2:79](quran/2/79), “So woe to those who write the Book with their (own) hands, (and) then say, ‘This is from God,’ in order to sell it for a small price”, and [5:13](quran/5/13), “They alter words from their positions, and have forgotten part of what they were reminded of.”\n\nOn [2:79](tabari://2/79), both al-Ṭabarī and Ibn Kathīr place the verse among the Jews and explain what they wrote. Al-Ṭabarī says they “wrote a book according to what they interpreted from their interpretations, contrary to what God sent down to His Prophet Musa”, and “sold it to a people who had no knowledge of it, nor of what was in the Torah”; both he and [Ibn Kathīr on 2:79](ibnkathir://2/79) quote the early commentator al-Suddī (d. 745): “There were people among the Jews who wrote a book from themselves, selling it to the Arabs, and telling them that it was from God, in order to take a small price for it.” In Ibn Kathīr's citation of Ibn ʿAbbās on 2:79, the sentence holds both clauses together: “Allah told you that the People of the Book altered the Book of Allah, changed it and wrote another book with their own hands. They then said, ‘This book is from Allah,’ so that they acquired a small profit by it.” (A report on 2:79 saying they “erased the name of Muhammad” from the Torah is graded by Ibn Kathīr as “very strange (weak)”.)\n\nOn [5:13](ibnkathir://5/13), Ibn Kathīr explains “They alter words from their positions” as “altering His Book from its apparent meanings which He sent down, and distorting its indications”. [Al-Ṭabarī on 5:13](tabari://5/13) quotes Ibn ʿAbbās explaining it as “the boundaries of Allah in the Torah” (its legal rulings, as in the stoning case of 5:41–43), while adding that generations of Jews after Moses “write with their hands other than what Allah, Majestic and Mighty, sent down upon their Prophet”.",
  },
  evaluation: {
    textMd: "Each classical view of 2:79 and 5:13 needs something. On the first view (Wahb ibn Munabbih, the statement from Ibn ʿAbbās in al-Bukhārī's chapter heading, and al-Suddī on 2:79), those mentioned “wrote a book from themselves” or sold false interpretations to people who did not know the Torah, while “no letter in them was removed” from the Torah and the Gospel themselves. On the second view (Ibn ʿAbbās in [Bukhārī 7363](https://sunnah.com/bukhari:7363), Ibn Kathīr on 3:78, and Ibn Ḥazm), the copies of the Torah and the Gospel in Jewish and Christian hands were themselves altered in wording (though on [5:13](ibnkathir://5/13) Ibn Kathīr glosses the alteration there as “altering His Book from its apparent meanings”); Ibn Taymiyya's middle view holds that some passages were changed and not others.\n\nNeither 2:79 nor 5:13 names the Gospel or a Christian copyist; both speak of the Jews, and later in the same chapter as 5:13, when the Torah of Medina was opened before the Prophet, the stoning verse stood on the page once the reader lifted his hand (5:43; [Bukhārī 3635](https://sunnah.com/bukhari:3635)). In [Bukhārī 7363](https://sunnah.com/bukhari:7363), Ibn ʿAbbās names no time and no passage of the Gospel; on 3:78, Ibn Kathīr speaks of “the books that are currently in the hands of the People of the Book” in his own day and gives “the Arabic versions of these books” as his example.\n\nThe Greek New Testament copies in [section 2](#gospel-copies) have known dates and keepers: Papyrus 46, with 1 Corinthians 15, dated 175–225 (Chester Beatty Library, Dublin, and the University of Michigan); Papyri 66 and 75, with John 1, 2nd–3rd century (Bodmer Library, Cologny; Vatican Library); Codex Sinaiticus, c. 330–360 (British Library, London). Because they were copied in Egypt and the eastern Mediterranean centuries before 610, none of them could have been altered in 7th-century Arabia or in response to Islam. Sūrat al-Māʾida, with 5:43, 5:47 and 5:68, was recited in Medina between 622 and 632.\n\nEither the wording of the Torah and the Gospel was kept, and what 2:79 and 5:13 describe is writing separate books and distorting rulings and meanings—in which case the copies older than 610 show what the Gospel said, including 1 Corinthians 15:3–4 and John 1:1. Or the wording of the Gospel was changed. If a change came after 632, the copies older than 610 still give the Gospel as it stood when the verses were recited. If a change came before 610 (in whole or in part, as on the middle view), then [5:47](quran/5/47) and [5:68](quran/5/68) told Christians to judge by and observe a Gospel that already narrated the crucifixion in all four Gospels (Matthew 27, Mark 15, Luke 23, John 19 in Codex Sinaiticus), naming no part as set aside. 5:47 reads:",
    quote: { text: 'So let the People of the Gospel judge by what God has sent down in it.', fromMd: true },
  },
  deeper: [
    { textMd: '[Qurʾān 2:79](quran/2/79):', quote: { text: 'So woe to those who write the Book with their (own) hands, (and) then say, ‘This is from God,’ in order to sell it for a small price. Woe to them for what their hands have written, and woe to them for what they earn.', source: { droge: '2:79' } } },
    { textMd: '[Qurʾān 5:13](quran/5/13):', quote: { text: 'For their breaking their covenant, We cursed them and made their hearts hard. They alter words from their positions, and have forgotten part of what they were reminded of. You will continue to see treachery from them, except for a few of them. Yet pardon them and excuse (them). Surely God loves the doers of good.', source: { droge: '5:13' } } },
    { textMd: 'Ibn Kathīr on 3:78, the full paragraph:', quote: { text: 'Wahb bin Munabbih said, "The Tawrah and the Injil remain as Allah revealed them, and no letter in them was removed. However, the people misguide others by addition and false interpretation, relying on books that they wrote themselves. … As for Allah’s Books, they are still preserved and cannot be changed." Ibn Abi Hatim recorded this statement. However, if Wahb meant the books that are currently in the hands of the People of the Book, then we should state that there is no doubt that they altered, distorted, added to and deleted from them. For instance, the Arabic versions of these books contain tremendous error, many additions and deletions and enormous misinterpretation. Those who rendered these translations have incorrect comprehension in most, rather, all of these translations. If Wahb meant the Books of Allah that He has with Him, then indeed, these Books are preserved and were never changed.', source: { tafsir: 'ibn_kathir', key: '3:78' } } },
  ],
};

/** §5 intro. Answer headings and bodies are md-derived and live in overrides.js (ANSWERS). */
export const ANSWERS = {
  introMd: 'Three answers are common among Muslim writers: that the Injīl given to Jesus was not the four Gospels, that the Qurʾān confirms the original revelation rather than the later copies, and that Paul or the Council of Nicaea changed the Gospel before Islam. If any of them holds, the verses in section 1 do not point to the Gospel Christians had, so each is stated in its defenders\' words and tested against the texts.',
  textsLabel: '',
};

/** §6 Sources, references, further reading and the closing. */
export const SOURCES = {
  introMd: 'Every quotation on this page links to its source. The Qurʾān links open Tafsir al-Ṭabarī on this site; Ibn Kathīr links open his commentary on this site.',
  /**
   * Academic references (both sides), bibliographic entries. No links: add a `url` only once it
   * is verified (phase2_copy §5 V7).
   */
  academic: [
    { labelMd: 'Gabriel Said Reynolds, “On the Qurʾānic Accusation of Scriptural Falsification (*taḥrīf*) and Christian Anti-Jewish Polemic”, *Journal of the American Oriental Society* 130.2 (2010).' },
    { labelMd: 'Gordon Nickel, *Narratives of Tampering in the Earliest Commentaries on the Qurʾān* (Brill, 2011).' },
    { labelMd: 'Sidney H. Griffith, *The Bible in Arabic* (Princeton University Press, 2013).' },
  ],
  /** Holding-library links for manuscripts (only verified URLs; phase2_copy §5 V6). */
  manuscriptLibraries: [
    { label: 'Codex Sinaiticus (codexsinaiticus.org)', url: 'https://codexsinaiticus.org' },
  ],
  /** Internal pages listed under "Other references". */
  otherLinks: [
    { label: 'What do sources outside the Bible say about Jesus?', path: '/discover/extrabiblical-evidence-for-jesus' },
  ],
  closing: {
    heading: 'An invitation',
    beforeMd: [
      'This page has set three Qurʾān verses on the Torah and the Gospel beside New Testament copies made before Islam, with the classical scholars\' readings and every source linked. Read the passages in full, in the manuscripts and in the commentaries, and judge for yourself.',
      'We who made this page are Christians. We believe the message these copies carry:',
    ],
    quote: { text: 'For I delivered to you as of first importance what I also received, that Christ died for our sins according to the Scriptures, and that He was buried, and that He was raised on the third day according to the Scriptures,', source: { nasb: '1cor', ch: 15, v: [3, 4] } },
    cite: '1 Corinthians 15:3–4',
    passage: '1cor-15-3',
    lineMd: 'We invite you to read these passages for yourself and to consider the Jesus they describe, who died, was buried and was raised.',
  },
};
