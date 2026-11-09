/**
 * "Through Christian Eyes": every reader-facing string on /discover/through-christian-eyes, and the
 * homepage's Start-here card.
 *
 * The web edition of the printed bi-fold handout (`handouts/through-christian-eyes/generate.mjs`), kept
 * as close to the print copy as the web allows: the QR codes became "Go deeper" links, printed
 * references became links, and "this leaflet" became "this page". When the handout copy changes,
 * change it here too (quotations were checked once, in `handouts/through-christian-eyes/sources.md`).
 *
 * Links point to where the site shows that exact point (an article item, codex entry, verse tab), and
 * fall back to the primary source (Sunnah.com, al-Ṭabarī, the Bible reader) only where the site has none.
 *
 * Inline markup (rendered by `model.js`):
 *   `**bold**`, `*italic*`, `[label](https://…)` or `[label](/site/path)`, `==highlight==` (the changed
 *   word inside a quotation). Text inside curly quotes “…” is a quotation from a source and is set in
 *   the quotation face; our own words never sit inside curly quotes.
 */

/** Public URL of this page (a permanent route: never rename without a 301). */
export const SLUG = 'through-christian-eyes';

/** Where each section's "Go deeper" link points (the handout's QR targets). */
export const LINKS = {
  preservation: '/discover/quran-preservation',
  sources: '/evidence/quran_sources',
  origins: '/discover/origins-of-revelation',
  household: '/discover/convenient-revelations',
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
    'Why we cannot accept Islam as divine revelation, in five questions answered from Bukhari, Muslim, al-Tabari and the Quran, with every reference linked.',
  keywords:
    'through christian eyes, why not islam, christian answer to islam, quran preservation, revelation of muhammad, divinity of christ, start here, ready apologia',
  datePublished: '2026-11-09',
};

export const LABELS = {
  back: 'Discover',
  eyebrow: 'Start here',
  contents: 'Five questions',
  answer: 'Our answer.',
  goDeeper: 'Go deeper',
  copyLink: 'Copy link to this page',
  copied: 'Link copied',
};

export const HERO = {
  kicker: 'An answer to a question we are often asked',
  h1: 'Through Christian Eyes',
  subtitle: 'Why We Cannot Accept Islam as Divine Revelation',
  intro: [
    'Muslim friends often ask us: *“You honour Moses and Jesus. Why not Muhammad too?”*',
    'This page is our honest answer, given with respect, and an introduction to this site. We have not quoted critics of Islam. Every line comes from the sources Muslims trust most, with each reference linked so you can check it yourself, and each section ends with the full evidence on this site.',
  ],
  sourcesLabel: 'Our sources',
  sources: 'Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim · Tafsīr al-Ṭabarī · Tafsīr Ibn Kathīr · the Qurʾān as printed today (Ḥafṣ and Warsh)',
};

/**
 * The five questions, in the handout's order. Each section: `id` (public #anchor), `title`, optional
 * `claim` (the opening quotation), `pull` (a pull quote), `lead` (intro line), then `blocks` in reading
 * order. A block is one of:
 *   { kind: 'subhead', text }                         small heading inside a section
 *   { kind: 'lead', text }                            a muted lead-in paragraph
 *   { kind: 'entry', lead?, text }                    one piece of evidence (`lead` renders bold)
 *   { kind: 'list', lead, items: [...] }              an entry with a bulleted list of witnesses
 *   { kind: 'answer', text }                          "Our answer."
 *   { kind: 'deeper', link, label }                   the handout's QR code: a link into the site
 */
export const SECTIONS = [
  {
    id: 'kept-letter-for-letter',
    title: 'Was the Qurʾān kept letter for letter?',
    claim: '“Surely We have sent down the Reminder, and surely We are indeed its Watchers.” ([Qurʾān 15:9](/quran/15/9/tafsir/tabari))',
    blocks: [
      { kind: 'subhead', text: 'Three Companions closest to the Prophet' },
      {
        kind: 'entry',
        lead: 'Ibn Masʿūd',
        text: ', the first of four men the Prophet named to learn the Qurʾān from ([Bukhārī 3808](/discover/quran-preservation#ibn-masud-muawwidhatayn)), held that Sūrahs 113 and 114 were not part of it ([Bukhārī 4977](/discover/quran-preservation#ibn-masud-muawwidhatayn)). In reports Ibn Ḥajar calls authentic, he erased them from his copy: “they are not from Allah’s Book” ([Fatḥ al-Bārī](/discover/quran-preservation#ibn-masud-muawwidhatayn)).',
      },
      {
        kind: 'entry',
        lead: 'Ibn ʿAbbās',
        text: ', for whom the Prophet prayed “O Allah! Bestow on him the knowledge of the Book” ([Bukhārī 75](/quran/codex/ibn-abbas)), recited [2:184](/quran/codex/ibn-abbas#codex-2-184-ibn-abbas) as *yuṭawwaqūnahu*, ‘those for whom it is a heavy burden’, where today’s Qurʾān has *yuṭīqūnahu*, ‘those who can afford it’. He said: “This Verse is not abrogated, but it is meant for old men and old women who have no strength to fast” ([Bukhārī 4505](/quran/codex/ibn-abbas#codex-2-184-ibn-abbas)). [Al-Ṭabarī](/quran/codex/ibn-abbas#codex-2-184-ibn-abbas) calls it “a recitation that contradicts the Muṣḥafs of the people of Islam”.',
      },
      {
        kind: 'entry',
        lead: 'ʿĀʾishah',
        text: ' had a copy written for herself and dictated [2:238](/discover/quran-preservation#aisha-afternoon-prayer) as “the middle prayer ==and the afternoon prayer==”: “This is how I have heard from the Messenger of Allah” ([Muslim 629](/discover/quran-preservation#aisha-afternoon-prayer)). She also reported a verse of five sucklings: when the Prophet died, “they were among what is recited of the Qurʾān” ([Muslim 1452a](/discover/quran-preservation#aisha-suckling-verse)). Neither wording is in today’s Qurʾān.',
      },
      { kind: 'subhead', text: 'Today’s printed Qurʾāns' },
      { kind: 'lead', text: 'Most Qurʾāns print the reading of Ḥafṣ; North and West Africa print Warsh. Both are recited as the Qurʾān.' },
      {
        kind: 'entry',
        lead: '[12:110](/quran/12#110).',
        text: ' Ḥafṣ: the messengers “thought that they had been ==lied to==” (*kudhibū*). Warsh: that they had been ==called liars== (*kudhdhibū*). Asked which it is, ʿĀʾishah answers *kudhdhibū*; offered the other meaning, she says: “Allah forbid! The Apostles never suspected their Lord of such a thing” ([Bukhārī 4695](https://sunnah.com/bukhari:4695)).',
      },
      {
        kind: 'entry',
        lead: '[37:12](/quran/37#12).',
        text: ' Ḥafṣ: “==you== are amazed” (*ʿajibta*, the Prophet). Ḥamzah and al-Kisāʾī, two of the seven canonical readers: ‘==I== am amazed’ (*ʿajibtu*, God speaking). One vowel changes who speaks.',
      },
      {
        kind: 'entry',
        lead: 'Ḥafṣ ibn Sulaymān',
        text: ', whose reading most Muslims recite: al-Bukhārī said “They abandoned him”, and Muslim “Abandoned” ([Ibn Ḥajar, Tahdhīb al-Tahdhīb 2/401](https://shamela.ws/book/3310/916)). [His case in full](/discover/hadith-reliability/hafs-ibn-sulayman).',
      },
      { kind: 'subhead', text: '“Old tales”' },
      {
        kind: 'lead',
        text: 'When the Qurʾān was first recited, some who heard it said: “Old tales! He has written it down, and it is dictated to him morning and evening” ([25:5](/quran/25/5/tafsir/tabari)). Some of those tales can still be read: folk stories and human sayings that no one ever held as the word of God.',
      },
      {
        kind: 'entry',
        lead: 'A rabbi on his own studies.',
        text: ' Rabbi Eliezer (1st–2nd century), *Song of Songs Rabbah* 1:3: “If all the seas were ink, … the swamps were quills, the heavens and the earth were scrolls, and all people were scribes, they would not suffice to write the matters of Torah that I have learned.” **[Qurʾān 31:27](/quran/31/27/sources)**, as God’s speech: “Even if all the trees on the earth were pens, and the sea (were ink) – (and) extending it (were) seven seas after it – the words of God would (still) not give out.”',
      },
      {
        kind: 'entry',
        lead: 'A 2nd-century fable',
        text: ' the Church never accepted, the *Infancy Gospel of Thomas*: the boy Jesus makes birds of clay that fly. Compare [3:49](/quran/3/49/sources).',
      },
      { kind: 'deeper', link: 'sources', label: '100 parallels with earlier tales and writings' },
      {
        kind: 'answer',
        text: 'We cannot receive as God’s word, kept letter for letter, a text that its first teachers recited differently, that is printed today in readings that disagree, and that speaks in God’s voice the words of folk tales and human sayings.',
      },
      { kind: 'deeper', link: 'preservation', label: 'How was the Qurʾān preserved?' },
    ],
  },
  {
    id: 'how-revelation-came',
    title: 'How did revelation come to Muhammad?',
    lead: 'Muslims hold that Gabriel brought the Qurʾān. ʿĀʾishah reports how it began.',
    blocks: [
      {
        kind: 'entry',
        lead: 'In the cave of Ḥirāʾ',
        text: ', Muhammad said: “The angel caught me (forcefully) and pressed me so hard that I could not bear it any more”, three times. He went home to his wife Khadījah “with his heart beating severely”: “Cover me! Cover me!… I fear that something may happen to me” ([Bukhārī 3](/discover/origins-of-revelation#hira)).',
      },
      {
        kind: 'entry',
        lead: 'When revelation paused,',
        text: ' Muhammad “became so sad as we have heard that he intended several times to throw himself from the tops of high mountains”; the report says that each time, Gabriel appeared and calmed him ([Bukhārī 6982](/discover/origins-of-revelation#after-hira)).',
      },
      {
        kind: 'entry',
        lead: 'A spell',
        text: ' was worked on Muhammad “till Allah’s Messenger (ﷺ) started imagining that he had done a thing that he had not really done” ([Bukhārī 5763](/discover/origins-of-revelation#sihr)).',
      },
      {
        kind: 'entry',
        lead: '[Qurʾān 22:52](/discover/origins-of-revelation#quran-22-52):',
        text: ' with every messenger and prophet, “Satan cast (something) into his wishful thinking. But God cancels what Satan casts.”',
      },
      {
        kind: 'answer',
        text: 'When God’s messenger comes to a prophet in the Bible, he strengthens him: “Fear not, man greatly beloved: peace be to you, quit yourself like a man, and be strong” ([Daniel 10:19](/discover/origins-of-revelation#what-they-saw)). Being seized and pressed past bearing, driven toward a fall, and having the mind clouded is what the Gospel describes of an unclean spirit: “whenever it seizes him, it slams him [to the ground]… It has often thrown him both into the fire and into the water to destroy him” ([Mark 9:18, 22](/discover/origins-of-revelation#hira)). We are told to “test the spirits to see whether they are from God” ([1 John 4:1](/discover/origins-of-revelation#testing-spirits)). Tested this way, we cannot receive this revelation as from the God of the prophets.',
      },
      { kind: 'deeper', link: 'origins', label: 'His revelation contrasted with the Bible’s prophets' },
    ],
  },
  {
    id: 'way-of-the-prophets',
    title: 'Does his life follow the way of the prophets?',
    pull: { quote: '“I feel that your Lord hastens in fulfilling your wishes and desires.”', cite: 'ʿĀʾishah to Muhammad ([Bukhārī 4788](/discover/convenient-revelations/sexual-privileges#wives-turns-33-51))' },
    blocks: [
      {
        kind: 'entry',
        lead: 'When she said it:',
        text: ' she “used to look down upon those ladies who had given themselves to Allah’s Messenger” ([Bukhārī 4788](/discover/convenient-revelations/sexual-privileges#wives-turns-33-51)). Then [33:50](/discover/convenient-revelations/sexual-privileges#four-wife-limit-33-50) allowed him “any believing woman, if she gives herself to the prophet… (That is) exclusively for you, apart from the believers”, and [33:51](/discover/convenient-revelations/sexual-privileges#wives-turns-33-51) let him “put off whomever you please of them.”',
      },
      {
        kind: 'entry',
        lead: 'In the same sūrah',
        text: ', Zayd, his adopted son ([Bukhārī 4782](/discover/convenient-revelations/sexual-privileges#zaynab-marriage-33-37)), divorced his wife, and [33:37](/discover/convenient-revelations/sexual-privileges#zaynab-marriage-33-37) married her to Muhammad: “We married her to you, so that there should not be any blame on the believers concerning the wives of their adopted sons.”',
      },
      { kind: 'deeper', link: 'household', label: 'More revelations about his household' },
      {
        kind: 'answer',
        text: 'We read his life in Bukhārī and Muslim beside the Ten Commandments and the Sermon on the Mount, and could not see in it the way of the prophets before him. Read it yourself, topic by topic.',
      },
      { kind: 'deeper', link: 'hadith', label: 'His life and conduct in Bukhārī and Muslim' },
    ],
  },
  {
    id: 'which-gospel',
    title: 'Which Gospel does the Qurʾān point to?',
    blocks: [
      {
        kind: 'entry',
        text: '“So let the People of the Gospel judge by what God has sent down in it” ([5:47](/discover/islamic-dilemma#q-5-47)). “People of the Book! You are (standing) on nothing until you observe the Torah and the Gospel” ([5:68](/discover/islamic-dilemma#q-5-68)). Papyri 66 and 75 (2nd–3rd century) already read “the Word was God” ([John 1:1](/discover/islamic-dilemma#p-jn-1-1)). Codex Sinaiticus (c. 330–360) holds all four Gospels, with Jesus’ crucifixion and resurrection. Both were copied centuries before 610.',
      },
      {
        kind: 'answer',
        text: 'If the Gospel had been changed by then, these verses send Christians to a changed book. If it had not, they send us to the Gospel we still read. That is where we stand.',
      },
      { kind: 'deeper', link: 'dilemma', label: 'The dilemma, with al-Ṭabarī and Ibn Kathīr' },
    ],
  },
  {
    id: 'why-we-worship-jesus',
    title: 'Why we worship Jesus as God',
    claim: '“My Lord and my God!” (the apostle Thomas to the risen Jesus, [John 20:28](/bible/jn/20#28))',
    blocks: [
      {
        kind: 'entry',
        lead: 'He claimed what belongs to God alone.',
        text: ' He told a paralysed man, “Son, your sins are forgiven”, and his hearers asked, “who can forgive sins but God alone?” ([Mark 2:5–7](/bible/mk/2#5)). He said, “before Abraham was born, I am” ([John 8:58](/bible/jn/8#58)). Asked by the high priest whether he was the Christ, he answered, “I am; and you shall see the Son of Man sitting at the right hand of power”, and was condemned for blasphemy ([Mark 14:61–64](/bible/mk/14#61)).',
      },
      { kind: 'deeper', link: 'claims', label: 'His divinity, verse by verse' },
      {
        kind: 'list',
        lead: 'His first followers worshipped him as God, long before Nicaea (325).',
        text: ' Friends, enemies and the ground itself agree:',
        items: [
          'Ignatius, bishop of Antioch, on his way to martyrdom, c. AD 107: “our God, Jesus Christ” (Ephesians 18).',
          'Pliny, a Roman governor, c. AD 112: Christians sang “a hymn to Christ as to a god” (Letters 10.96).',
          'A Roman wall-carving mocking a Christian before a crucified figure, c. AD 200: “Alexamenos worships [his] god.”',
          'A prayer hall at Megiddo, c. AD 230: a table offered “to God Jesus Christ.”',
        ],
      },
      { kind: 'deeper', link: 'divinity', label: '42 archaeological finds, from inscriptions to papyri' },
      {
        kind: 'entry',
        lead: 'His death on the cross is history, told by those with no reason to invent it.',
        text: ' Tacitus, Roman historian, c. AD 116: “Christus… suffered the extreme penalty during the reign of Tiberius at the hands of one of our procurators, Pontius Pilatus” (Annals 15.44). The Talmud: “On the eve of Passover Yeshu was hanged” (Sanhedrin 43a). The Qurʾān, some 600 years later: “they did not kill him, nor did they crucify him” ([4:157](/quran/4/157/tafsir/tabari)).',
      },
      { kind: 'deeper', link: 'history', label: 'Roman and Jewish sources on Jesus' },
    ],
  },
];

/** The handout's low-emphasis aside, after the five questions. */
export const ASIDE = {
  title: '“But I don’t accept those hadith.”',
  text: 'Bukhārī and Muslim are where Muslims learn how the Prophet prayed, how the Hajj is performed and how the Qurʾān was collected ([Bukhārī 4986](/discover/quran-preservation#uthman-copies)). Set them aside, and those go with them.',
  deeper: { link: 'reliability', label: 'Can the hadith be trusted?' },
};

export const CLOSING = {
  invite:
    'We believe God is merciful toward what we could not know, but asks us not to turn away from what we could. If God is the Truth, the least we owe Him is to look honestly at the evidence placed before us, and to pray, as the Qurʾān’s opening prayer asks, to be guided “to the straight path” ([1:6](/quran/1/6/tafsir/tabari)), wherever it leads and whatever it costs. If you have never read a Gospel, read one. If it is false, you have lost an afternoon. If it is true, you have found everything.',
  readGospel: { label: 'Explore the four Gospels', href: '/bible/gospels/videos' },
  label: 'Closing',
};

/** The homepage's Start-here card (src/components/home/StartHereCard.astro). */
export const HOME_CARD = {
  eyebrow: 'New here? Start with this',
  title: 'Through Christian Eyes',
  subtitle: 'Why We Cannot Accept Islam as Divine Revelation',
  body: 'Our answer to a question Muslim friends often ask, in five questions drawn from Bukhārī, Muslim, al-Ṭabarī and the Qurʾān. Each one ends with the full evidence on this site.',
  cta: 'Read the introduction',
};
