/**
 * "Through Christian Eyes": single canonical source of truth for:
 *   1. Web edition (`/discover/through-christian-eyes` + homepage Start-here card, via `model.js`)
 *   2. Bi-fold US Letter print handout (`handouts/through-christian-eyes/generate.mjs`, via `printModel.js`)
 *   3. Editable Google Slides layout (`handouts/through-christian-eyes/build_slides.mjs`, via `printModel.js`)
 *
 * Quotations were verified word-for-word in `handouts/through-christian-eyes/sources.md`.
 *
 * Links point to where the site shows that exact point (an article item, codex entry, verse tab), and
 * fall back to the primary source (Sunnah.com, Shamela, Sefaria, the Bible reader) only where the site
 * has none. Print and Slides strip inline links automatically and render parenthetical source links as
 * `<cite>(…)</cite>`.
 *
 * Inline markup:
 *   `**bold**`, `*italic*`, `` `arabic` ``, `[label](https://…)` or `[label](/site/path)`, `==highlight==`.
 *   Text inside curly quotes “…” is a quotation from a source and is set in the quotation face; our own
 *   words never sit inside curly quotes.
 */

/** Public URL of this page (a permanent route: never rename without a 301). */
export const SLUG = 'through-christian-eyes';

/** Canonical display host printed next to QR codes and "Go deeper" cards. */
export const SITE_HOST = 'readyapologia.com';

/** Where each section's "Go deeper" card / handout QR code points. */
export const LINKS = {
  preservation: '/discover/quran-preservation',
  sources: '/evidence/quran_sources',
  origins: '/discover/origins-of-revelation',
  hadith: '/hadith/',
  dilemma: '/discover/islamic-dilemma',
  claims: '/evidence/divinity_of_christ',
  divinity: '/discover/divinity-timeline',
  history: '/discover/extrabiblical-evidence-for-jesus',
  reliability: '/discover/hadith-reliability',
};

export const SEO = {
  title: 'Through Christian Eyes: Why We Are Christians, Not Muslims',
  description:
    'Why we cannot accept Islam as divine revelation, in five questions answered from the Quran, Bukhari, Muslim, al-Tabari and Ibn Kathir, with every source linked.',
  keywords:
    'through christian eyes, why not islam, christian answer to islam, quran preservation, revelation of muhammad, divinity of christ, start here, ready apologia',
  datePublished: '2026-11-09',
};

/** Discover hub card (`src/data/discoverCatalog.json` entry; kept byte-identical and audited). */
export const CATALOG = {
  category: 'Christianity',
  subcategory: 'Start Here',
  slug: SLUG,
  title: 'Through Christian Eyes: Why We Cannot Accept Islam as Divine Revelation',
  description:
    'Our answer to a question Muslim friends often ask, in five questions from the Quran, Bukhari, Muslim, al-Tabari and Ibn Kathir, with every source linked on this site.',
  thumbnail: '/media/through_christian_eyes/cover.jpg',
};

export const LABELS = {
  back: 'Discover',
  eyebrow: 'Start here',
  contents: 'Five questions',
  answer: 'Our answer.',
  goDeeper: 'Go deeper',
};

const SOURCES_LINES = [
  'The Qurʾān (canonical readings) · Ṣaḥīḥ al\u2011Bukhārī · Ṣaḥīḥ Muslim',
  'Tafsīr al\u2011Ṭabarī · Tafsīr Ibn Kathīr · Ibn Ḥajar',
];

export const HERO = {
  printBrand: 'ORTHODOX EVANGELISM',
  kicker: 'An answer to a question we are often asked',
  h1: 'Through Christian Eyes',
  subtitle: 'Why We Cannot Accept Islam as Divine Revelation',
  printSubtitle: 'Why We Cannot Accept Islam as\u00A0Divine\u00A0Revelation',
  intro: [
    'Muslim friends often ask us: *“You honour Moses and Jesus. Why not Muhammad too?”*',
    'This page is our honest answer, given with respect, and an introduction to this site. We have not quoted critics of Islam. Every claim about Islam comes from the sources Muslims trust most, with each reference linked so you can check it yourself, and each section ends with the full evidence on this site.',
  ],
  printIntro:
    'This leaflet is our honest answer, given with respect. We have not quoted critics of Islam. Every claim about Islam comes from the sources Muslims trust most, with the reference printed so you can check it yourself.',
  sourcesLabel: 'Our Islamic sources',
  sourcesLines: SOURCES_LINES,
  sources: SOURCES_LINES.join(' · ').replace(/\u2011/g, '-'),
};

/**
 * The five questions, in the handout's order. Each section: `id` (public #anchor), `panel` (handout panel),
 * `title`, optional `claim` (opening quotation), `pull` (pull quote), `lead` (intro line), then `blocks`
 * in reading order:
 *   { kind: 'subhead', text }                                         small heading inside a section
 *   { kind: 'lead', text }                                            muted lead-in paragraph
 *   { kind: 'entry', lead?, text, webMore?: { label, href } }         one piece of evidence (`lead` renders bold)
 *   { kind: 'list', lead, text, items: [...] }                        an entry with a bulleted list of witnesses
 *   { kind: 'answer', text }                                          "Our answer." (paragraphs separated by \n\n)
 *   { kind: 'deeper', link, label, side, qrSpan?, pdfSize, slidesSize }  web "Go deeper" card / print QR code
 */
export const SECTIONS = [
  {
    id: 'kept-letter-for-letter',
    panel: 'p2',
    title: 'Is the Qurʾān God’s eternal word, kept letter for letter?',
    claim: '“Surely We have sent down the Reminder, and surely We are indeed its Watchers [lit. Preservers].” ([Qurʾān 15:9](/quran/15/9/tafsir/tabari))',
    blocks: [
      { kind: 'subhead', text: 'Companions closest to the Prophet recited verses differently' },
      {
        kind: 'lead',
        text: 'Muhammad did not leave a bound Qurʾān: after reciters were killed in battle and ʿUmar feared “a large part of the Qurʾān may be lost”, Caliph Abū Bakr asked the Prophet’s scribe Zayd ibn Thābit to collect it. Zayd asked, “How will you do something which Allah’s Messenger\u00A0(ﷺ) did not do?”—then gathered it from palm stalks, thin white stones and men’s memories, finding the end of Sūrah 9 with one man alone ([Bukhārī 4986](/discover/quran-preservation#abu-khuzaima-last-verses)). Years later, when Muslims differed in reciting it, Caliph ʿUthmān standardized one copy for every province ([Bukhārī 4987](/discover/quran-preservation#uthman-copies)).',
      },
      {
        kind: 'entry',
        lead: 'ʿĀʾishah',
        text: ' had a copy written for herself and dictated [2:238](/discover/quran-preservation#aisha-afternoon-prayer) as “the middle prayer and the afternoon prayer”: “This is how I have heard from the Messenger of Allah” ([Muslim 629](/discover/quran-preservation#aisha-afternoon-prayer)). She also reported a verse of five sucklings: when the Prophet died, “they were among what is recited of the Qurʾān” ([Muslim 1452a](/discover/quran-preservation#aisha-suckling-verse)). Neither wording is in today’s Qurʾān.',
      },
      {
        kind: 'entry',
        lead: 'Ibn Masʿūd',
        text: ', the first of four men the Prophet named to learn the Qurʾān from ([Bukhārī 3808](/discover/quran-preservation#ibn-masud-muawwidhatayn)), held that Sūrahs 113 and 114 were not part of it ([Bukhārī 4977](/discover/quran-preservation#ibn-masud-muawwidhatayn)). In reports Ibn Ḥajar (al-Bukhārī’s chief commentator) calls authentic, he erased them from his copy: “they are not from Allah’s Book” ([Fatḥ al-Bārī](/discover/quran-preservation#ibn-masud-muawwidhatayn)).',
      },
      {
        kind: 'entry',
        lead: 'Ibn ʿAbbās',
        text: ', for whom the Prophet prayed “O Allah! Bestow on him the knowledge of the Book” ([Bukhārī 75](https://sunnah.com/bukhari:75)), recited multiple verses differently — for example, [2:184](/quran/codex/ibn-abbas#codex-2-184-ibn-abbas) as `يُطَوَّقُونَهُ`, ‘those for whom it is a heavy burden’, where today’s Qurʾān has `يُطِيقُونَهُ`, ‘those who can afford it’. He said: “This Verse is not abrogated, but it is meant for old men and old women who have no strength to fast” ([Bukhārī 4505](https://sunnah.com/bukhari:4505)). [Al-Ṭabarī](/quran/codex/ibn-abbas#codex-2-184-ibn-abbas) calls it “a recitation that contradicts the Muṣḥafs of the people of Islam”.',
      },
      { kind: 'subhead', text: 'Today’s printed Qurʾāns have different words with different meanings' },
      { kind: 'lead', text: 'Most Qurʾāns print the reading of Ḥafṣ; North and West Africa print Warsh. Both are recited as the Qurʾān.' },
      {
        kind: 'entry',
        lead: '[12:110](/quran/12#110).',
        text: ' Ḥafṣ: the messengers “thought that they had been lied to” (`كُذِبُوا`). Warsh: that they had been called liars (`كُذِّبُوا`). Asked which it is, ʿĀʾishah answers ‘`كُذِّبُوا`’; offered the other meaning, she says: “Allah forbid! The Apostles never suspected their Lord of such a thing” ([Bukhārī 4695](https://sunnah.com/bukhari:4695)).',
      },
      {
        kind: 'entry',
        lead: '[37:12](/quran/37#12).',
        text: ' Ḥafṣ: “you are amazed” (`عَجِبْتَ`, the Prophet). Ḥamzah and al-Kisāʾī, two of the seven canonical readers: ‘I am amazed’ (`عَجِبْتُ`, God speaking). One vowel changes who speaks.',
      },
      {
        kind: 'entry',
        lead: 'Ḥafṣ ibn Sulaymān',
        text: ', whose reading most Muslims recite: in hadith, al-Bukhārī said “They abandoned him”, and Muslim “Abandoned” ([Ibn Ḥajar, Tahdhīb al-Tahdhīb 2/401](https://shamela.ws/book/3310/916)).',
        webMore: { label: 'His case in full', href: '/discover/hadith-reliability/hafs-ibn-sulayman' },
      },
      { kind: 'subhead', text: '“Old tales”' },
      {
        kind: 'lead',
        text: 'When the Qurʾān was first recited, some who heard it said: “Old tales! He has written it down, and it is dictated to him morning and evening” ([25:5](/quran/25/5/tafsir/tabari)). Some of those tales can still be read: folk stories and human sayings that no one ever held as the word of God.',
      },
      {
        kind: 'entry',
        lead: 'A rabbi on his own studies.',
        text: ' Rabbi Eliezer (1st–2nd century; Talmud, [*Shabbat* 11a](https://www.sefaria.org/Shabbat.11a?lang=bi); [*Song of Songs Rabbah* 1:3](https://www.sefaria.org/Shir_HaShirim_Rabbah.1.3?lang=bi)): “If all the seas were ink, … the swamps were quills, the heavens and the earth were scrolls, and all people were scribes, they would not suffice to write the matters of Torah that I have learned.” **[Qurʾān 31:27](/quran/31/27/sources)**, as God’s speech: “Even if all the trees on the earth were pens, and the sea (were ink) – (and) extending it (were) seven seas after it – the words of God would (still) not give out.”',
      },
      {
        kind: 'entry',
        lead: 'A 2nd-century fable',
        text: ' the Church never accepted, the *Infancy Gospel of Thomas*: the boy Jesus makes birds of clay that fly. Compare [3:49](/quran/3/49/sources).',
      },
      { kind: 'deeper', link: 'sources', label: '100 parallels with earlier tales and writings', side: 'right', qrSpan: 2, pdfSize: 0.56, slidesSize: 40 },
      {
        kind: 'answer',
        text: 'We cannot receive as God’s eternal word, kept letter for letter, a text that its first teachers recited differently, that is printed today in readings that disagree, and that speaks in God’s voice the words of folk tales and human sayings.',
      },
      { kind: 'deeper', link: 'preservation', label: 'How was the Qurʾān preserved?', side: 'left', pdfSize: 0.56, slidesSize: 40 },
    ],
  },
  {
    id: 'how-revelation-came',
    panel: 'p3',
    title: 'How did revelation come to Muhammad?',
    lead: 'Muslims hold that Gabriel brought the Qurʾān. Islamic sources record how it came.',
    blocks: [
      {
        kind: 'entry',
        lead: 'In the cave of Ḥirāʾ',
        text: ', Muhammad said: “The angel caught me (forcefully) and pressed me so hard that I could not bear it any more”, three times. He went home to his wife Khadījah “with his heart beating severely”: “Cover me! Cover me!… I fear that something may happen to me” ([Bukhārī 3](/discover/origins-of-revelation#hira)).',
      },
      {
        kind: 'entry',
        lead: 'When revelation paused',
        text: ', Muhammad “became so sad as we have heard that he intended several times to throw himself from the tops of high mountains”; the report says that each time, Gabriel appeared and calmed him ([Bukhārī 6982](/discover/origins-of-revelation#after-hira)).',
      },
      {
        kind: 'entry',
        lead: 'A magic spell',
        text: ' was worked on Muhammad “till Allah’s Messenger\u00A0(ﷺ) started imagining that he had done a thing that he had not really done”, before he was cured ([Bukhārī 5763](/discover/origins-of-revelation#sihr)).',
      },
      {
        kind: 'entry',
        lead: '[Qurʾān 22:52](/discover/origins-of-revelation#quran-22-52):',
        text: ' with every messenger and prophet, “Satan cast (something) into his wishful thinking. But God cancels what Satan casts”—for Ibn ʿAbbās (in al-Bukhārī), “When he spoke, the Shaytan threw (some falsehood) into his speech”.',
      },
      {
        kind: 'answer',
        text: 'When Gabriel himself comes in the Gospel, he names himself—“I am Gabriel, who stands in the presence of God” ([Luke 1:19](/bible/lk/1#19))—and calms fear at once: “Do not be afraid, Zacharias”; “Do not be afraid, Mary; for you have found favor with God” ([Luke 1:13, 30](/bible/lk/1#13)).\n\nBeing seized past bearing and driven toward a fall is what the Gospel describes of an unclean spirit: “whenever it seizes him, it slams him [to the ground]… It has often thrown him both into the fire and into the water to destroy him” ([Mark 9:18, 22](/bible/mk/9#18)). When the same sources add a spell clouding his mind and Satan casting into a prophet’s words, we are told to “test the spirits to see whether they are from God” ([1 John 4:1](/discover/origins-of-revelation#testing-spirits))—and cannot receive this revelation as from the God of the prophets.',
      },
      { kind: 'deeper', link: 'origins', label: 'His revelation contrasted with the Bible’s prophets', side: 'left', pdfSize: 0.54, slidesSize: 40 },
    ],
  },
  {
    id: 'way-of-the-prophets',
    panel: 'p3',
    title: 'Does his life follow the way of the prophets?',
    pull: { quote: '“I feel that your Lord hastens in fulfilling your wishes and desires.”', cite: 'ʿĀʾishah to Muhammad ([Bukhārī 4788](/discover/convenient-revelations/sexual-privileges#wives-turns-33-51))' },
    blocks: [
      {
        kind: 'entry',
        lead: 'Exemptions for him alone:',
        text: ' other men are capped at four wives, treated equally ([4:3](/discover/convenient-revelations/sexual-privileges#four-wife-limit-33-50)). Muhammad kept nine wives ([Bukhārī 5068](https://sunnah.com/bukhari:5068)); [33:50](/discover/convenient-revelations/sexual-privileges#four-wife-limit-33-50) added “any believing woman, if she gives herself to the prophet… (That is) exclusively for you, apart from the believers”, and [33:51](/discover/convenient-revelations/sexual-privileges#wives-turns-33-51)—read as freeing him from equal turns ([Ibn Kathīr](/quran/33/51/tafsir/ibn_kathir))—said “You may put off whomever you please of them”, when ʿĀʾishah swore by God ([Muslim 1464a](/discover/convenient-revelations/sexual-privileges#wives-turns-33-51)) and spoke the words above ([Bukhārī 4788](/discover/convenient-revelations/sexual-privileges#wives-turns-33-51)).',
      },
      {
        kind: 'entry',
        lead: 'With women taken in war:',
        text: ' at Awṭās, his Companions “seemed to refrain from having intercourse with captive women” who had husbands, until [4:24](/discover/muhammad-and-slavery/quranic-witness#verse-4-24) came down ([Muslim 1456a, 1456d](/discover/muhammad-and-slavery/prophets-practice#awtas-4-24))—“And (also forbidden to you are) married women, except what your right (hands) own”: “you are allowed to have sexual relations with them after making sure they are not pregnant” ([Ibn Kathīr on 4:24](/discover/muhammad-and-slavery/quranic-witness#verse-4-24)).',
      },
      {
        kind: 'entry',
        lead: 'When followers freed their slaves:',
        text: ' a man with no other property freed his six slaves at his death; Muhammad “cast lots amongst them, and set two free and kept four in slavery; and he (the Holy Prophet) spoke severely of him” ([Muslim 1668a](/discover/muhammad-and-slavery/prophets-practice#six-slaves-lots)). When his wife Maymūnah freed her slave-girl, he told her: “You would have got more reward if you had given her (i.e. the slave-girl) to one of your maternal uncles” ([Bukhārī 2592](/discover/muhammad-and-slavery/prophets-practice#maymuna)).',
      },
      {
        kind: 'answer',
        text: 'God’s law gave Israel’s king no exemption—“he shall not multiply to himself wives” ([Deuteronomy 17:17](/bible/dt/17#17))—and rebuked kings who broke it; six centuries before Muhammad, Jesus lived without sin, took nothing by force, and taught, “love your enemies and pray for those who persecute you” ([Matthew 5:44](/bible/mt/5#44)). Reading Muhammad’s life in Bukhārī and Muslim beside the Torah and the Gospel, we cannot see the way of the prophets. Read it yourself, topic by topic.',
      },
      { kind: 'deeper', link: 'hadith', label: 'His life and conduct in Bukhārī and Muslim', side: 'left', pdfSize: 0.54, slidesSize: 40 },
    ],
  },
  {
    id: 'which-gospel',
    panel: 'p3',
    title: 'Which Gospel does the Qurʾān point to?',
    blocks: [
      {
        kind: 'entry',
        text: 'The Qurʾān says it came “confirming what was before it [lit. between its hands], and He sent down the Torah and the Gospel” ([3:3](/discover/islamic-dilemma#q-3-3)): “So let the People of the Gospel judge by what God has sent down in it” ([5:47](/discover/islamic-dilemma#q-5-47)). “People of the Book! You are (standing) on nothing until you observe the Torah and the Gospel, and what has been sent down to you from your Lord” ([5:68](/discover/islamic-dilemma#q-5-68)) — “until you believe in all the Books that you have [lit. in your hands]” ([Ibn Kathīr on 5:68](/discover/islamic-dilemma#q-5-68)). Early Greek copies—Papyri 66 and 75 (2nd–3rd century)—already read “the Word was God” ([John 1:1](/discover/islamic-dilemma#p-jn-1-1)). [Codex Sinaiticus](/discover/islamic-dilemma#copies-sinaiticus) (c. 330–360) holds all four Gospels, with Jesus’ crucifixion and resurrection. All three were copied centuries before 610.',
      },
      {
        kind: 'answer',
        text: 'If the Gospel had been changed by then, these verses send Christians to a changed book. If it had not, they send us to the Gospel we still read. That is where we stand.',
      },
      { kind: 'deeper', link: 'dilemma', label: '5:47 and 5:68, with al-Ṭabarī and Ibn Kathīr', side: 'right', qrSpan: 2, pdfSize: 0.54, slidesSize: 40 },
    ],
  },
  {
    id: 'why-we-worship-jesus',
    panel: 'back',
    title: 'Why do we worship Jesus as God?',
    claim: '“My Lord and my God!” (the apostle Thomas to the risen Jesus, [John 20:28](/bible/jn/20#28))',
    blocks: [
      {
        kind: 'entry',
        lead: 'He claimed what belongs to God alone.',
        text: ' He told a paralysed man, “Son, your sins are forgiven”, and his hearers asked, “who can forgive sins but God alone?” ([Mark 2:5–7](/bible/mk/2#5)). He said, “before Abraham was born, I am” ([John 8:58](/bible/jn/8#58)). Asked by the high priest whether he was the Christ, he answered, “I am; and you shall see the Son of Man sitting at the right hand of power, and coming with the clouds of heaven”, and was condemned for blasphemy ([Mark 14:61–64](/bible/mk/14#61)).',
      },
      { kind: 'deeper', link: 'claims', label: 'His divinity, verse by verse', side: 'right', pdfSize: 0.60, slidesSize: 42 },
      {
        kind: 'list',
        lead: 'His first followers worshipped him as God, long before Nicaea (325).',
        text: ' Friends, enemies and the ground itself agree:',
        items: [
          'Ignatius, bishop of Antioch, on his way to martyrdom, c. AD 107: “our God, Jesus Christ” ([Ephesians 18](/discover/divinity-timeline#witness-ignatius_epistles)).',
          'Pliny, a Roman governor, c. AD 112: Christians sang “a hymn to Christ as to a god” ([Letters 10.96](/discover/divinity-timeline#witness-pliny_epistles_10_96)).',
          '[A Roman wall-carving](/discover/divinity-timeline#event-alexamenos_graffito) mocking a Christian before a crucified figure, c. AD 200: “Alexamenos worships [his] god.”',
          '[A prayer hall at Megiddo](/discover/divinity-timeline#event-megiddo_mosaic), c. AD 230: a table offered “to God Jesus Christ”.',
        ],
      },
      { kind: 'deeper', link: 'divinity', label: 'Inscriptions, papyri and worship before Nicaea', side: 'left', pdfSize: 0.60, slidesSize: 42 },
      {
        kind: 'entry',
        lead: 'His death on the cross is history, told by enemies of Christianity who had no reason to invent it.',
        text: ' Tacitus, Roman historian, c. AD 116: “Christus… suffered the extreme penalty during the reign of Tiberius at the hands of one of our procurators, Pontius Pilatus” ([Annals 15.44](/discover/extrabiblical-evidence-for-jesus#evidence-tacitus-annals-15-44)). The Babylonian Talmud: “On the eve of Passover they hanged Yeshu the Nazarene” ([Sanhedrin 43a](/discover/extrabiblical-evidence-for-jesus#evidence-babylonian-talmud-sanhedrin-43a)). The Qurʾān, some 600 years after Jesus: “they did not kill him, nor did they crucify him” ([4:157](/quran/4/157/tafsir/tabari)).',
      },
      { kind: 'deeper', link: 'history', label: 'Roman and Jewish sources on Jesus', side: 'right', pdfSize: 0.60, slidesSize: 42 },
      {
        kind: 'answer',
        text: 'Jesus claimed what belongs to God, died on the cross under Pontius Pilate, and rose from the dead on the third day ([1 Corinthians 15:3–8](/bible/1cor/15#3))—and the witnesses who saw Him risen went to their deaths proclaiming Him Lord and God. That is why we worship Him.',
      },
    ],
  },
];

/** The handout's low-emphasis aside, after the five questions. */
export const ASIDE = {
  title: '“But I don’t accept those hadith.”',
  text: 'The Qurʾān calls the Prophet “a good example for you” ([33:21](/quran/33/21/tafsir/ibn_kathir))—and Bukhārī and Muslim are where Muslims learn how he lived, how he prayed, how the Hajj is performed and how the Qurʾān was collected ([Bukhārī 4986](/discover/quran-preservation#abu-khuzaima-last-verses)). Set them aside, and all of that goes with them.',
  deeper: { link: 'reliability', label: 'Can the hadith be trusted?', side: 'left', pdfSize: 0.54, slidesSize: 38 },
};

export const CLOSING = {
  invite:
    'We believe God is merciful toward what we could not know, but asks us not to turn away from what we could. If God is the Truth, the least we owe Him is to look honestly at the evidence placed before us, and to pray, as the Qurʾān’s opening prayer asks, to be guided “to the straight path” ([1:6](/quran/1/6/tafsir/tabari)), wherever it leads and whatever it costs. If you have never read a Gospel, read one. If it is false, you have lost an afternoon. If it is true, you have found everything.',
  readGospel: { label: 'Read the Gospel of Mark', href: '/bible/mk/1' },
  label: 'Closing',
  printFooter: {
    love: 'Made with love by Orthodox Christians.',
    orthodoxy:
      'Orthodoxy is the faith “which the Lord gave, the Apostles preached, and the Fathers kept” (St. Athanasius, c. AD 359). What it teaches about who God is and why Jesus died may be quite different from what you have heard of Christianity in the West: God is not an angry judge to be appeased; He is Love, who became man to heal us and unite us to Himself. Its beliefs and worship are rooted in the practice of the early Church, kept for 2,000 years.',
    site: 'smsk.ca',
  },
};

/** The homepage's Start-here card (src/components/home/StartHereCard.astro). */
export const HOME_CARD = {
  eyebrow: 'New here? Start with this',
  title: 'Through Christian Eyes',
  subtitle: 'Why We Cannot Accept Islam as Divine Revelation',
  body: 'Our answer to a question Muslim friends often ask, in five questions drawn from the Qurʾān, Bukhārī, Muslim, al-Ṭabarī and Ibn Kathīr. Each one ends with the full evidence on this site.',
  cta: 'Read the introduction',
};
