/**
 * Researcher-voice copy, section framing, and 4-move historiographical assessment blocks for
 * /discover/trustworthiness-of-the-bible.
 *
 * Written strictly in impersonal third-person academic prose (matching Oxford Classical Dictionary /
 * Bruce M. Metzger): zero unnamed strawmen, zero first-person "we/us/our" or second-person "you",
 * inline glosses for technical terms, brief scholarly stance orientations, and every counter-hypothesis
 * attributed to named scholars or dated primary works.
 */

export const SEO = {
  title: 'Textual Transmission and Historical Corroboration of the Bible',
  description: 'A primary-source reference dossier examining 96 biblical manuscripts, Qumran scrolls, textual-variant classifications, Greco-Roman inscriptions, Palestinian name frequencies, and pre-Nicene patristic citations.',
  keywords: 'biblical manuscripts, P52, P66, P75, P46, Codex Sinaiticus, Codex Vaticanus, Great Isaiah Scroll, Ketef Hinnom, textual criticism, Pilate Stone, Tel Dan Stele, Richard Bauckham onomastics, Muratorian Fragment',
};

export const LABELS = {
  glance: 'At a glance · Four lines of primary evidence',
  navAria: 'Article sections',
  back: 'Discover',
  copyLink: 'Copy link to section',
  copied: 'Section link copied',
  copyFailed: 'Unable to copy link',
  backToTop: 'Back to top',
  scanSummary: 'Inspect digitized manuscript folio — {title} ({size})',
  scanOpenFull: 'Open full-resolution folio scan ({size})',
  sources: 'Primary archives, museum holdings & scripture citations',
  sourcesNav: 'Sources',
  verifyAria: 'Primary source verification links',
  classicalLabel: 'Published counter-hypothesis',
  evaluationLabel: 'Historiographical & primary-source assessment',
  sourcesGroups: {
    manuscripts: 'Digitized Biblical Manuscript & Scroll Archives',
    museums: 'Archaeological & Museum Collections',
    classical: 'Classical, Jewish, Islamic & Patristic Primary Repositories',
    scripture: 'Scripture & Commentary Passages Cited on This Page',
  },
};

export const HEADER = {
  eyebrow: 'Textual Criticism · Epigraphy · Classical Historiography · Patristics',
  h1: 'Textual Transmission and Historical Corroboration of the Bible',
  hookMd: 'Two historical claims are commonly advanced about the Bible: that its texts were substantively rewritten across centuries of hand-copying, and that the New Testament canon was selected under Emperor Constantine at the Council of Nicaea (AD 325). This reference work tests those claims against **96 primary entries** in four lines of inquiry: (1) dated manuscripts, from pre-exilic **First Temple** silver amulets (c. 600 BC) and **Second Temple**-era Qumran scrolls (copied c. 250 BC–AD 68) to second- and third-century Greek papyri (**P52, P46, P66, P75**); (2) Greco-Roman and Near Eastern inscriptions and non-Christian historians; (3) internal historical markers and Palestinian Jewish personal-name statistics; and (4) **ante-Nicene** (pre-AD 325) patristic citations.',
  contextMd: '96 primary entries · 14 digitized manuscript folios · Direct archive, museum & scripture links',
  whosWhoSummary: 'Reference glossary · Manuscript sigla, ancient versions & textual-critical terms (P, ℵ, B, 1QIsaᵃ, NA28)',
  whosWhoMd: 'Structured glossary of manuscript formats, ancient versions, historical periods, and textual-critical terminology.',
  whosWhoGlossary: [
    {
      group: 'I. Manuscript Formats & Sigla',
      entries: [
        {
          term: 'Papyrus (P + Gregory-Aland number, e.g., P52, P66, P75)',
          defMd: 'New Testament manuscripts written on Egyptian papyrus, almost all in codex (leaf-book) form, dating from the second to the eighth century AD.',
        },
        {
          term: 'Uncial / Majuscule (ℵ / 01, B / 03, A / 02, C / 04, D / 05) & Pandect',
          defMd: 'Parchment codices of the fourth to the tenth century written in continuous Greek capital letters; a **pandect** is a single volume containing both the Old and the New Testament.',
        },
        {
          term: 'Minuscule & Lectionary',
          defMd: '**Minuscules** (e.g., `1`, `33`, `1739`; ninth to sixteenth century) are written in a connected cursive Greek hand; **lectionaries** arrange scripture readings according to the ecclesiastical calendar.',
        },
        {
          term: 'Palimpsest',
          defMd: 'A parchment codex whose earlier ink (*undertext*) was scraped and washed so the leaves could be overwritten with a later work (*overtext*), as in **Codex Ephraemi Rescriptus (`C / 04`)**.',
        },
        {
          term: 'Nomina sacra & Stichometry',
          defMd: '***Nomina sacra*** (“sacred names”) are early Christian contractions of divine names marked with an overbar (`Θ̅Σ̅` for *Theos*, `Ι̅Σ̅` for *Iēsous*); **stichometry** is the count of standard lines (*stichoi*, c. 15–16 syllables), used to measure a text’s length and to set a copyist’s payment.',
        },
        {
          term: 'Qumran Sigla (1QIsaᵃ, 1QIsaᵇ, 11Q5) & Masoretic Text (MT)',
          defMd: 'Cave number (`1`–`11`) + `Q` (*Qumran*) + book or scroll designation, with superscript letters distinguishing copies of the same book (`1QIsaᵃ`, `1QIsaᵇ`); the scrolls, copied c. 250 BC–AD 68, are collated against the vocalized medieval Hebrew **Masoretic Text (`MT`)**.',
        },
      ],
    },
    {
      group: 'II. Ancient Versions & Historical Periods',
      entries: [
        {
          term: 'Septuagint (LXX), Peshitta, Vulgate, Targums & Samaritan Pentateuch',
          defMd: 'The **Septuagint (`LXX`)** is the pre-Christian Greek translation of the Hebrew Bible (3rd–1st c. BC); the **Peshitta** is the standard Syriac Bible; the **Vulgate** is Jerome’s late-fourth-century Latin Bible; **Targums** are Jewish Aramaic paraphrases; and the **Samaritan Pentateuch** is the Samaritan community’s Hebrew text of the Torah.',
        },
        {
          term: 'First Temple, Second Temple, Iron Age IIB & Ante-Nicene',
          defMd: '**First Temple** denotes pre-exilic Judah prior to Babylon’s destruction of Jerusalem (c. 960–586 BC; **Iron Age IIB** spans c. 925–700 BC); **Second Temple** spans c. 516 BC–AD 70; **ante-Nicene** denotes Christian texts and fathers prior to the First Council of Nicaea (AD 325).',
        },
      ],
    },
    {
      group: 'III. Textual-Critical, Patristic & Epigraphic Terms',
      entries: [
        {
          term: 'Text-Types (Alexandrian, Byzantine, “Western”) & Recension',
          defMd: 'Regional clusters of manuscripts sharing distinctive readings: the concise, early **Alexandrian** (`P75, ℵ, B`); the expansive, paraphrastic **“Western”** (`D / 05`, Old Latin); and the standardized medieval **Byzantine**. A **recension** is a deliberate editorial revision of a text.',
        },
        {
          term: 'Critical Apparatus (NA28 / UBS5) vs. Textus Receptus',
          defMd: '*Nestle-Aland* (28th ed.) and the *United Bible Societies Greek New Testament* (5th ed.) reconstruct the earliest attainable Greek text and record manuscript variants in an **apparatus** at the foot of each page; the **Textus Receptus** (“Received Text”) is the family of printed Greek editions from Erasmus (1516) to Stephanus (1550) and Beza (1598) that underlies the King James Version.',
        },
        {
          term: 'Homoioteleuton, Itacism, Vorlage & Tendenz',
          defMd: '***Homoioteleuton*** (“similar ending”) is an accidental eye-skip between lines ending alike; **itacism** is phonetic spelling interchange among Greek vowels pronounced `/i/`; ***Vorlage*** is a copyist’s or translator’s underlying source exemplar; ***Tendenz*** is editorial or ideological slant.',
        },
        {
          term: 'Diatessaron, Hexapla & Homologoumena / Antilegomena',
          defMd: 'Tatian’s ***Diatessaron*** (c. AD 170) combined Matthew, Mark, Luke, and John into a single narrative harmony; Origen’s ***Hexapla*** (c. AD 240) set the Hebrew Old Testament, a Greek transliteration, and four Greek versions in six parallel columns; Eusebius distinguished the ***homologoumena*** (New Testament books universally acknowledged) from the ***antilegomena*** (books disputed in some churches, such as James, 2 Peter, and Jude).',
        },
        {
          term: 'Granville Sharp Construction, Bulla, Determinative & Baraita',
          defMd: 'In Greek syntax, a **Granville Sharp construction** links two singular personal non-proper nouns under one article (`τοῦ θεοῦ ἡμῶν καὶ σωτῆρος`) to a single referent; a **bulla** is a stamped clay seal impression; a **determinative** is an unpronounced Egyptian hieroglyphic classifier sign; a ***baraita*** is a **Tannaitic** (first- to early-third-century AD rabbinic) tradition preserved outside the Mishnah.',
        },
      ],
    },
  ],
};

export const GLANCE = [
  {
    n: 1,
    href: '#section-stage1',
    title: 'Textual Transmission, Dated Manuscripts & Variant Taxonomy',
    takeaway: '15 dated papyri, uncials, Qumran scrolls, and silver amulets (c. 600 BC–AD 450); the four-tier classification of variants proposed by evangelical textual critic Daniel B. Wallace (2011); three disputed passages bracketed in modern Bibles; and 18 comparisons with the transmission of classical texts.',
    chips: ['P52 · 2nd c. AD', '1QIsaᵃ · c. 125 BC', 'Ketef Hinnom · c. 600 BC'],
  },
  {
    n: 2,
    href: '#section-stage2',
    title: 'Epigraphic, Archaeological & Non-Christian Historical Corroboration',
    takeaway: '19 excavated Roman, Judean, Assyrian, Babylonian, and Moabite inscriptions, alongside nine non-Christian Roman, Judean, Greek, Syriac, and rabbinic writers (including Tacitus, Pliny, Josephus, Suetonius, Lucian, and Celsus).',
    chips: ['Pilate Stone · AD 26–36', 'Tel Dan · c. 840 BC', 'Tacitus · Annals 15.44'],
  },
  {
    n: 3,
    href: '#section-stage3',
    title: 'Internal Historical Markers, Undesigned Coincidences & Palestinian Onomastics',
    takeaway: 'Five passion and empty-tomb details that ran contrary to contemporary expectations; four primary “undesigned coincidences” (incidental points at which one Gospel explains another), plus four contested Synoptic cases; and the Palestinian personal-name statistics (onomastics) compiled by historian Tal Ilan (2002) and applied by New Testament scholar Richard Bauckham (2006).',
    chips: ['Top 9 male names: 46.7% (Palestine) vs. 40.3% (Gospels–Acts)', 'Top 2 female names: 28.6% (Palestine) vs. 38.9% (Gospels–Acts)'],
  },
  {
    n: 4,
    href: '#section-stage4',
    title: 'Pre-Nicene Patristic Citations, Canon Recognition & Historical Synthesis',
    takeaway: 'First-century creedal citations; the Muratorian Fragment (c. AD 170–200); the 20 extant disciplinary canons of Nicaea; 36,289 counted ante-Nicene quotations from seven writers (Geisler & Nix 1986, qualified by Bruce M. Metzger 2005); and a concluding synthesis.',
    chips: ['1 Cor 15:3–7 · AD 30s', 'Irenaeus · c. AD 180', 'Nicaea · AD 325'],
  },
];

export const SECTIONS = [
  {
    id: 'section-stage1',
    aliases: ['stage1'],
    number: 1,
    navLabel: 'Manuscripts & Variants',
    title: 'Textual Transmission, Early Manuscripts & Variant Taxonomy',
    introMd: 'Papyrological discoveries in Egypt and the Judean Desert between 1890 and 1956 shortened the chronological interval between biblical composition and extant physical manuscripts by centuries. Evaluating textual transmission requires three complementary datasets: (1) dated physical folios from the seventh century BC to the fifth century AD; (2) the distribution of scribal variants across more than 5,800 Greek New Testament manuscripts, including the three disputed multi-verse passages that modern critical Bibles bracket; and (3) the intervals between composition and earliest manuscript for standard works of Greco-Roman antiquity.',
    themes: [
      {
        id: 'stage1-biblical-manuscripts',
        aliases: ['manuscripts-section-title'],
        kind: 'manuscripts',
        eyebrow: 'Theme 1A · Dated Physical Witnesses (c. 600 BC–AD 450)',
        title: 'Cornerstone Papyri, Uncial Pandects, Qumran Scrolls & First Temple Silver Amulets',
        leadMd: '**Why fourth- and fifth-century uncial codices sit alongside early papyri:** Egyptian papyri (**P52, P66, P75, P46, P115, P47, P72**) preserve individual Gospels and epistle collections that predate Emperor Constantine and the Council of Nicaea (AD 325), whereas fourth- and fifth-century parchment codices—the pandects **Codex Vaticanus, Codex Sinaiticus, Codex Alexandrinus,** and **Codex Ephraemi Rescriptus,** and the Greco-Latin **Codex Bezae**—gather these earlier regional text-streams into single volumes.',
      },
      {
        id: 'stage1-textual-variants',
        aliases: ['variants-section-title', 'bracketed-passages'],
        kind: 'variants',
        eyebrow: 'Theme 1B · Apparatus Mechanics & Disputed Passages',
        title: 'Variant Taxonomy (Wallace 2011) & Three Disputed Passages: Mark 16:9–20, John 7:53–8:11 & 1 John 5:7–8',
        leadMd: 'Collation of more than 5,800 Greek New Testament manuscripts (c. 140 papyri, c. 320 uncials, c. 2,900 minuscules, and c. 2,450 lectionaries), together with more than 15,000 Latin, Syriac, Coptic, Armenian, and Georgian copies, yields an estimated **300,000–400,000 textual variants** according to evangelical New Testament scholar **Daniel B. Wallace** (2011), founder of the Center for the Study of New Testament Manuscripts (CSNTM), and roughly **500,000 non-spelling variants** in the statistical estimate of evangelical textual critic **Peter J. Gurry** (*NTS* 62, 2016). Cambridge classical philologist **Richard Bentley** argued in *Remarks upon a Late Discourse of Free-Thinking* (1713, §32) that variant totals rise mechanically with the number of manuscripts: a work preserved in a single manuscript shows no inter-manuscript variants but leaves its scribal slips undetectable, whereas multiple independent witnesses reveal where local alterations entered. Nineteenth-century Cambridge Greek editors **B. F. Westcott & F. J. A. Hort** (*Introduction*, 1881, p. 2) estimated substantial variation at roughly one-thousandth of the Greek text, and church historian **Philip Schaff** (*Companion to the Greek Testament*, 1883, p. 177) noted that none altered an article of Christian faith. In the paperback appendix to *Misquoting Jesus* (HarperOne, 2007), agnostic New Testament textual critic **Bart D. Ehrman** wrote of his mentor, Princeton textual critic **Bruce M. Metzger**: “The position I argue for in *Misquoting Jesus* does not actually stand at odds with Prof. Metzger’s position that the essential Christian beliefs are not affected by textual variants in the manuscript tradition of the New Testament.” Ehrman maintains that particular variants affect the exegesis of individual passages (such as **Luke 22:43–44**, **Hebrews 2:9**, and **John 1:18**).',
      },
      {
        id: 'stage1-classical-comparison',
        aliases: ['histogram-section-title'],
        kind: 'classical-table',
        eyebrow: 'Theme 1C · Greco-Roman Philological Context',
        title: 'Manuscript Intervals & Witness Counts Across 18 Works of Classical Antiquity',
        leadMd: 'Classical philology reconstructs Greek, Roman, and Judean literature from varying combinations of fragmentary Egyptian papyri and medieval Carolingian or Byzantine codices. To avoid conflating small papyrus scraps with complete manuscripts, the table below separates **(1) earliest extant fragment** from **(2) earliest substantial or complete codex** and **(3) total cataloged witnesses** across eighteen benchmark texts, including Flavius Josephus’s *Jewish Antiquities*.',
        takeawayMd: '**Comparative takeaway:** Substantial New Testament papyri (**P46, P66, P75**) date about 100–150 years after composition (about 250 years for the complete 27-book **Codex Sinaiticus**), among more than 5,800 Greek witnesses, whereas the earliest substantial codices of benchmark Greco-Roman histories (Herodotus, Thucydides, Tacitus, Josephus, Caesar) date about 700–1,400 years after composition, resting on two to roughly eight primary medieval stemmatic codices (plus later copies and fragmentary papyri); by comparison, the orator Demosthenes is preserved in more than 200 medieval copies.',
      },
    ],
    assessments: [
      {
        classicalLabel: 'Published Counter-Hypothesis 1 · Variant Volume & Pre-Scriptorium Copying (Bart D. Ehrman, 2005)',
        classicalMd: 'In *Misquoting Jesus* (2005), agnostic New Testament textual critic **Bart D. Ehrman** notes that textual critics have cataloged more variant readings (estimates range from 200,000 to over 400,000) than there are words in the Greek New Testament (c. 138,000); **Peter J. Gurry** (*NTS* 62, 2016) later estimated c. 500,000 variants excluding spelling. He argues that, because the first-century autographs are lost and copying between c. AD 50 and AD 175 relied on non-professional Christian scribes before the extant multi-leaf codices, readers cannot assume stable access to the earliest text.',
        evaluationLabel: 'Historiographical & Textual Assessment (4-Move Analysis)',
        evaluationMd: '**(1) Shared Empirical Premise:** The first-century autographs are lost; fourteen centuries of hand-copying generated c. 400,000–500,000 variant readings across thousands of manuscripts; and three notable passages (**Mark 16:9–20**, **John 7:53–8:11**, and the late Latin gloss in **1 John 5:7–8**) entered the text through later scribal transmission.\n\n**(2) Methodological Standard & Pre-AD 175 Controls:** In textual criticism, a variant is counted each time one witness differs from another in spelling or word order, so raw variant totals grow with the number of manuscripts and, unless adjusted for it, misrepresent the strength of the evidence: Tacitus’s *Annals* 1–6 rest on a single ninth-century codex (*Medicean I*), which yields no inter-codex variants but leaves any corruption undetectable. Stemmatic comparison of the later branches reconstructs the late-second-century archetype rather than the first-century autographs; hypothetical changes between c. AD 50 and AD 175 are constrained instead by the rapid dispersal of copies across Asia Minor, Syria, Rome, Gaul, North Africa, and Egypt (which would have prevented any single copyist from altering copies in every region at once), by second-century papyrus attestation (**P52**), and by independent second-century quotations in Justin Martyr, Marcion’s *Apostolikon*, Tatian, and Irenaeus.\n\n**(3) Dated Primary Evidence:** In Daniel B. Wallace’s four-tier classification (2011), the great majority of variants are untranslatable spelling differences or nonsense slips (movable *nu*, itacism); the second largest group involves Greek word order, articles, or synonyms; the third involves meaningful readings confined to late or isolated manuscripts; and **fewer than 1 percent** are both meaningful and early, the principal ones being printed in footnotes or brackets in NA28/UBS5, ESV, NASB, NIV, and NRSV.\n\n**(4) Historical Conclusion:** Comparison of independent textual streams identifies insertions made after the second century, and the early dispersal of copies around the Mediterranean limits the scope for undetected change before AD 175. Individual disputed variants affect the exegesis of particular verses, but the central New Testament claims—Jesus’s divine identity, crucifixion under Pilate, and bodily resurrection—are attested in multiple independent passages in **P46, P66, P75, ℵ, and B**.',
      },
      {
        classicalLabel: 'Published Counter-Hypothesis 2 · Verbal Alteration vs. Seventh-Century Confirmation (Ibn Ḥazm, d. AD 1064, *taḥrīf al-lafẓ*)',
        classicalMd: 'The eleventh-century Andalusian jurist **Ibn Ḥazm** (d. AD 1064), in *al-Fiṣal fī al-Milal wa-al-Ahwāʾ wa-al-Niḥal*, systematized the doctrine of *taḥrīf al-lafẓ* (verbal alteration of the scriptural text). He argued that the Hebrew Torah had been altered in the time of Ezra (fifth century BC), before any extant manuscript, and that the four canonical Gospels were human compositions postdating the *Injīl* (the revelation given to Jesus) which introduced divine Sonship, the crucifixion, and Trinitarian theology.',
        evaluationLabel: 'Historiographical & Textual Assessment (4-Move Analysis)',
        evaluationMd: '**(1) Shared Empirical Premise:** Pre-modern manuscript transmission included localized scribal variants, translations across Aramaic, Greek, Latin, Syriac, and Coptic, and apocryphal compositions circulating outside apostolic churches.\n\n**(2) Methodological Standard:** Because Ibn Ḥazm placed the alleged replacement before the extant codices (in Ezra’s fifth century BC for the Torah, and in a first- to second-century transition from an original *Injīl* to the four Gospels), a historical evaluation of his thesis depends on two questions: how the seventh-century **Qurʾān** characterizes the scriptures held by Jews and Christians in Muhammad’s lifetime, and what pre-seventh-century manuscripts show those communities were reading.\n\n**(3a) Seventh-Century Qurʾānic Appeals & Crucifixion Tension:** [Qurʾān 5:48](/quran/5/48/tafsir/tabari) describes the Qurʾān as `مُصَدِّقًا لِمَا بَيْنَ يَدَيْهِ مِنَ الْكِتَابِ وَمُهَيْمِنًا عَلَيْهِ` (*muṣaddiqan limā bayna yadayhi mina l-kitābi wa-muhayminan ʿalayhi*, “confirming what was with it of the Scripture and acting as *muhaymin* over it”). Al-Ṭabarī’s commentary glosses *muhaymin* both as a trustworthy witness or guardian confirming the preceding scriptures and, in reports from Ibn ʿAbbās (no. 12115) and Ibn Jurayj (no. 12106; cf. [Ibn Kathīr on Qurʾān 5:48](/quran/5/48/tafsir/ibn_kathir)), as an overseer or criterion judging earlier books where they diverge. Related passages treat the Torah and Gospel as present among seventh-century Jews and Christians: they ask why the Jews of Medina seek arbitration when “they have the Torah, in which is the judgment of God” ([Qurʾān 5:43](/quran/5/43/tafsir/tabari)); direct “the People of the Gospel” to judge by what God sent down in it ([Qurʾān 5:47](/quran/5/47/tafsir/tabari); [Qurʾān 5:68](/quran/5/68/tafsir/tabari)); state that *al-nabiyy al-ummī*—“the unlettered prophet” in most classical commentaries (al-Ṭabarī, Ibn Kathīr), “the prophet of the common people” in Droge’s translation (linked here), or “the Gentile prophet” in modern critical scholarship (e.g., Josef Horovitz, 1926; Mehdy Shaddel, 2016; cf. Nicolai Sinai, 2023)—is “found written with them in the Torah and the Gospel” ([Qurʾān 7:157](/quran/7/157/tafsir/tabari)); and instruct consultation of “those who have been reciting the Scripture before” ([Qurʾān 10:94](/quran/10/94/tafsir/tabari)). [Qurʾān 4:157](/quran/4/157/tafsir/tabari) (*wa-mā qatalūhu wa-mā ṣalabūhu wa-lākin shubbiha lahum*), by contrast, is read by most classical commentators as denying that Jesus died by crucifixion.\n\n**(3b) Intra-Islamic Exegetical Divide on Taḥrīf:** Classical Islamic authorities divide between textual and interpretive distortion: **Ibn ʿAbbās** is reported in [Ṣaḥīḥ al-Bukhārī 7363 (Wikisource no. 6929)](https://ar.wikisource.org/wiki/%D8%B5%D8%AD%D9%8A%D8%AD_%D8%A7%D9%84%D8%A8%D8%AE%D8%A7%D8%B1%D9%8A/%D9%83%D8%AA%D8%A7%D8%A8_%D8%A7%D9%84%D8%A7%D8%B9%D8%AA%D8%B5%D8%A7%D9%85_%D8%A8%D8%A7%D9%84%D9%83%D8%AA%D8%A7%D8%A8_%D9%88%D8%A7%D9%84%D8%B3%D9%86%D8%A9) and [Ṣaḥīḥ al-Bukhārī 7522–7523 (Wikisource nos. 7084–7085)](https://ar.wikisource.org/wiki/%D8%B5%D8%AD%D9%8A%D8%AD_%D8%A7%D9%84%D8%A8%D8%AE%D8%A7%D8%B1%D9%8A/%D9%83%D8%AA%D8%A7%D8%A8_%D8%A7%D9%84%D8%AA%D9%88%D8%AD%D9%8A%D8%AF) as warning that the People of the Book “changed and altered” (*baddalū / ghayyarū*) God’s Scripture with their hands, whereas an unnumbered *muʿallaq* notice (a report cited by al-Bukhārī without its preliminary chain of transmitters) in *Kitāb al-Tawḥīd* (chapter on [Qurʾān 85:21](/quran/85/21/tafsir/tabari)), alongside Fakhr al-Dīn al-Rāzī and [Ibn Kathīr on Qurʾān 3:78](/quran/3/78/tafsir/ibn_kathir), emphasizes *taḥrīf al-maʿnā* (distortion of meaning or interpretation, *yataʾawwalūnahu ʿalā ghayri taʾwīlihi*) rather than global verbal replacement of dispersed manuscripts.\n\n**(3c) Manuscript Chronology & Scope Limits:** Regarding the **Torah**, extant biblical scrolls do not reach back before Ezra (fifth century BC): **1QIsaᵃ** (c. 125 BC) is a copy of Isaiah made about 300 years after Ezra, and the pre-exilic **Ketef Hinnom** amulets (c. 600 BC) preserve no more than a brief priestly blessing. An Ezra-era rewriting of the Pentateuch therefore cannot be tested against earlier manuscripts and is addressed instead through [Qurʾān 5:43](/quran/5/43/tafsir/tabari)’s seventh-century appeal to the Torah held in Medina. Regarding the **Gospels**, second- to fifth-century Greek witnesses (**P46, P66, P75**, **Codex Vaticanus**, **Codex Sinaiticus**), together with fifth- to seventh-century Syriac **Peshitta**, Latin **Vulgate**, and Coptic manuscripts, agree substantially with the canonical Gospels read by seventh-century Christians, preserving the same fourfold corpus and its narratives of the crucifixion, resurrection, and divine Sonship.\n\n**(4) Historical Conclusion (Two Interpretive Positions):** Because Ibn Ḥazm regarded the four Gospels as human compositions postdating the *Injīl*, second-century papyri containing the crucifixion and divine Sonship do not by themselves falsify his premise. They do establish which texts the seventh-century “People of the Gospel” possessed when [Qurʾān 5:47](/quran/5/47/tafsir/tabari) and [Qurʾān 5:68](/quran/5/68/tafsir/tabari) directed them to judge by and observe their Scripture—texts whose crucifixion narratives [Qurʾān 4:157](/quran/4/157/tafsir/tabari) is commonly read as denying. Two interpretive positions follow. Either the canonical Gospels held in the seventh century remained textually authoritative—favoring the classical *taḥrīf al-maʿnā* reading, under which [Qurʾān 4:157](/quran/4/157/tafsir/tabari) must be reconciled exegetically with the crucifixion narratives of a text the Qurʾān treats as authoritative—or the appeals in [Qurʾān 5:47](/quran/5/47/tafsir/tabari) and [Qurʾān 5:68](/quran/5/68/tafsir/tabari) refer solely to uncorrupted remnants or to a lost pre-canonical *Injīl* unattested in pre-Islamic manuscripts, the position of Ibn Ḥazm and of literal readings of [Ṣaḥīḥ al-Bukhārī 7363 (Wikisource no. 6929)](https://ar.wikisource.org/wiki/%D8%B5%D8%AD%D9%8A%D8%AD_%D8%A7%D9%84%D8%A8%D8%AE%D8%A7%D8%B1%D9%8A/%D9%83%D8%AA%D8%A7%D8%A8_%D8%A7%D9%84%D8%A7%D8%B9%D8%AA%D8%B5%D8%A7%D9%85_%D8%A8%D8%A7%D9%84%D9%83%D8%AA%D8%A7%D8%A8_%D9%88%D8%A7%D9%84%D8%B3%D9%86%D8%A9).',
      },
    ],
  },
  {
    id: 'section-stage2',
    aliases: ['stage2'],
    number: 2,
    navLabel: 'Epigraphy & Historians',
    title: 'Epigraphic, Archaeological & Non-Christian Historical Corroboration',
    introMd: 'Archaeology cannot adjudicate supernatural claims, but excavated stone inscriptions, stamped clay bullae, cuneiform royal annals, coins, and non-Christian Roman, Judean, Greek, and Syriac historians allow a test of whether the biblical authors were accurately familiar with the shifting titles, governors, dynasties, topography, and chronological synchronisms of the ancient Mediterranean and Near East.',
    themes: [
      {
        id: 'stage2-archaeology-nt',
        aliases: ['archaeology-heading'],
        kind: 'cards',
        itemsKey: 'ARCHAEOLOGY_NT_ITEMS',
        eyebrow: 'Theme 2A · First-Century Roman & Judean Epigraphy (10 Items)',
        title: 'Inscriptions, Ossuaries, Coins & Pre-AD 70 Jerusalem/Galilean Excavations',
        leadMd: 'Across the first century AD, provincial administrative titles in the Roman East shifted repeatedly as territories moved between imperial equestrian prefects (*praefecti*), senatorial proconsuls (*anthypatoi*), client tetrarchs, and free Macedonian civic boards (*politarchai*). Excavations at Caesarea, Jerusalem, Delphi, Thessalonica, Corinth, and Magdala allow the local details in Luke–Acts and the other Gospels to be tested item by item.',
      },
      {
        id: 'stage2-archaeology-ot',
        aliases: [],
        kind: 'cards',
        itemsKey: 'ARCHAEOLOGY_OT_ITEMS',
        eyebrow: 'Theme 2B · Ancient Near Eastern Monumental & Bullae Epigraphy (9 Items)',
        title: 'Egyptian, Moabite, Aramaean, Assyrian, Judean & Neo-Babylonian Inscriptions',
        leadMd: 'Royal victory stelae, Neo-Assyrian cuneiform prisms, bullae from stratified Jerusalem contexts, and Neo-Babylonian administrative chronicles provide independent chronological anchors, from Pharaoh Merneptah (c. 1208 BC) and the ninth-century Tel Dan and Mesha stelae, through Sennacherib’s Judean campaign of 701 BC and Belshazzar’s regency in Babylon, to Cyrus’s repatriation policy of 539 BC.',
      },
      {
        id: 'stage2-secular-historians',
        aliases: ['historians-heading'],
        kind: 'cards',
        itemsKey: 'HISTORIANS_ITEMS',
        eyebrow: 'Theme 2C · Non-Christian Ancient Historians & Philosophers (9 Items)',
        title: 'Roman Senators, Imperial Governors, Judean Chroniclers, Satirists & Rabbinic Sources',
        leadMd: 'Ordered by historiographical weight and documentary proximity, nine non-Christian Greek, Roman, Judean, Syriac, and rabbinic witnesses attest distinct aspects of Christian origins. They record the execution of Jesus under Pontius Pilate in the reign of Tiberius (**Tacitus**; the reconstructed Flavian core of **Josephus**), the stoning of Jesus’s brother James in AD 62 (**Josephus**, *Ant.* 20.200), early-second-century provincial hymns sung “to Christ as to a god” (**Pliny**), expulsions connected with disturbances among Roman Jews (**Suetonius**), the execution of the Jews’ unnamed “wise King” (**Mara bar Serapion**), a tradition of darkness at the crucifixion paraphrased by Julius Africanus (**Thallus**), and hostile engagement with Christian claims (**Lucian**; **Celsus**; the *baraita*—an early rabbinic teaching from the Tannaitic period, c. AD 10–220—in **b. Sanhedrin 43a**, redacted in the fifth to sixth century).',
      },
    ],
    assessments: [
      {
        classicalLabel: 'Published Counter-Hypothesis · Late Literary Construction of Acts and of the House of David (Baur 1845; Davies 1992)',
        classicalMd: 'Nineteenth-century Tübingen historian **F. C. Baur** (*Paulus*, 1845) and his school treated Acts as a second-century romance shaped by *Tendenz* and removed from first-century provincial administration, while the late-twentieth-century Copenhagen and Sheffield “minimalists” (**Philip R. Davies**, *In Search of “Ancient Israel,”* 1992; **Thomas L. Thompson**, 1992) proposed that the House of David was a post-exilic literary construct unattested in Iron Age epigraphy.',
        evaluationLabel: 'Historiographical & Epigraphic Assessment (4-Move Analysis)',
        evaluationMd: '**(1) Shared Empirical Premise:** Ancient Near Eastern royal inscriptions and Roman civic monuments are preserved selectively, by accident of excavation; royal annals frame military campaigns in court rhetoric; and chronological cruxes remain unresolved. The most notable is the census of **Quirinius in [Luke 2:1–2](/bible/lk/2#1)**, set during Herod’s reign (d. 4 BC), against Josephus’s dating of Quirinius’s property assessment of Judea to **AD 6** (*Ant.* 18.1–2; German historian **Emil Schürer**, *History of the Jewish People in the Age of Jesus Christ*, 1890 / rev. ed. 1973, Vol. 1; Catholic New Testament scholar **Raymond E. Brown**, *The Birth of the Messiah*, 1977, pp. 412–414, 547–556).\n\n**(2) Methodological Standard:** Literary fiction composed generations after major political upheavals (such as those of 586 BC or AD 70) tends to retroject later administrative titles, borders, and royal names rather than preserve obsolete local offices across shifting jurisdictions.\n\n**(3) Dated Primary Evidence:** In 1993, the year after Davies’s monograph, Israeli archaeologist Avraham Biran excavated the ninth-century BC **Tel Dan Stele** (`ביתדוד`, *House of David*), which joined the **Mesha Stele**, the **Kurkh Monolith** (Ahab), the **Black Obelisk** (Jehu), the **Taylor Prism** and **Hezekiah Bulla**, and the **Nabonidus** texts (Belshazzar). For the New Testament, classical epigrapher **Colin J. Hemer** (*The Book of Acts in the Setting of Hellenistic History*, Mohr Siebeck, 1989, chs. 4–5) cataloged numerous local administrative and geographical details in Acts that are corroborated by epigraphy and numismatics, including the **Pilate Stone**, the **Gallio Rescript at Delphi** (AD 51–52), and the **politarch inscriptions of Thessalonica**. Evangelical authors **Norman L. Geisler & Frank Turek** popularized a tally of “84” such details in Acts 13–28 (*I Don’t Have Enough Faith to Be an Atheist*, Crossway, 2004).\n\n**(4) Historical Conclusion:** Although specific chronological cruxes such as Luke 2:2 remain debated, excavated inscriptions place the dynastic history of Iron Age Israel and Judah, and the first-century civic administration described in the Gospels and Acts, within verifiable geopolitical settings.',
      },
    ],
  },
  {
    id: 'section-stage3',
    aliases: ['stage3'],
    number: 3,
    navLabel: 'Internal & Onomastics',
    title: 'Internal Historical Markers, Undesigned Coincidences & Palestinian Onomastics',
    introMd: 'Beyond external monuments, historians test ancient biographical narratives internally by three criteria: (1) whether authors retain socially costly episodes concerning their own revered figures (*criterion of embarrassment*); (2) whether independent accounts interlock incidentally, without cross-reference (*undesigned coincidences*); and (3) whether incidental personal names match the statistics of the pre-AD 70 Palestinian population (*onomastics*, the quantitative study of personal names).',
    themes: [
      {
        id: 'stage3-criterion-of-embarrassment',
        aliases: [],
        kind: 'cards',
        itemsKey: 'EMBARRASSMENT_ITEMS',
        eyebrow: 'Theme 3A · Counter-Cultural & Self-Incriminating Testimony (5 Items)',
        title: 'Socially Costly Details Retained Across the Canonical Passion & Empty-Tomb Accounts',
        leadMd: 'In historical-critical method (e.g., Catholic historical-Jesus scholar **John P. Meier**, *A Marginal Jew*, Vol. 1, Doubleday, 1991, ch. 6), material that would have embarrassed the early church or its leaders is regarded as the least likely to have been invented by later believers. Recent methodological studies—notably **Chris Keith & Anthony Le Donne** (*Jesus, Criteria, and the Demise of Authenticity*, T&T Clark, 2012)—caution that social embarrassment is culturally conditioned and functions within broader social memory rather than as an isolated mechanical filter, so historians weigh these passages alongside external and textual controls.',
      },
      {
        id: 'stage3-undesigned-coincidences',
        aliases: [],
        kind: 'cards',
        itemsKey: 'UNDESIGNED_ITEMS',
        eyebrow: 'Theme 3B · Interlocking Narrative Analysis (4 Primary + 4 Contested Items)',
        title: 'Undesigned Coincidences Across Gospel Accounts (Paley 1790; Blunt 1847; McGrew 2017)',
        leadMd: 'The argument from undesigned coincidences, developed by Anglican philosopher **William Paley** (*Horae Paulinae*, 1790), Cambridge theologian **John James Blunt** (*Undesigned Coincidences*, 1847), and analytic philosopher **Lydia McGrew** (*Hidden in Plain View*, 2017), identifies cases in which one account mentions an incidental detail that raises an unstated question and another account, without repeating that detail, incidentally supplies the explanation. Because this inference presupposes substantial narrative independence, the four primary items below examine interlocks between John and the Synoptics or between unrelated lists. Whether John knew Mark is disputed: **C. K. Barrett** (1978) and **Frans Neirynck** (1977) argue that he did, whereas **P. Gardner-Smith** (1938) and **D. Moody Smith** (1992/2001) defend John’s literary independence (and **Richard Bauckham**, 1998, argues that John drew on independent tradition while writing for readers acquainted with Mark). Four Synoptic and harmonizing cases are presented separately below.',
        contestedSummary: 'Additional Synoptic & harmonizing cases (#5–#8 — contested under Markan priority)',
        contestedIntroMd: 'Because the four traditional examples below involve either triple-tradition parallels (passages shared by Matthew, Mark, and Luke), for which mainstream scholarship on Markan priority posits direct literary dependence or scribal assimilation, or harmonizing reconstructions across several Gospels, critical scholars generally treat them as redactional or harmonistic rather than as independent coincidences.',
      },
      {
        id: 'stage3-onomastics',
        aliases: [],
        kind: 'onomastics',
        eyebrow: 'Theme 3C · Quantitative Prosopography (Tal Ilan 2002 / Richard Bauckham 2006)',
        title: 'First-Century Palestinian Jewish Name Frequencies (2,625 Male & 328 Female Occurrences)',
        leadMd: 'In 2002, Israeli historian **Tal Ilan** published *Lexicon of Jewish Names in Late Antiquity, Part I: Palestine 330 BCE–200 CE* (Mohr Siebeck), cataloging personal names across Judean and Galilean ossuaries, Dead Sea Scrolls legal papyri, Masada ostraca, Josephus, and early rabbinic sources. Analyzing Ilan’s dataset in *Jesus and the Eyewitnesses* (Eerdmans, 2006; 2nd ed. 2017, ch. 4, pp. 67–92, Tables 6–9), St Andrews New Testament historian **Richard Bauckham** compared its `2,953` name occurrences (`2,625` male and `328` female) with the `77` occurrences of Palestinian Jewish men’s names and the `18` Palestinian Jewish women named in the Gospels and Acts.',
      },
    ],
    assessments: [
      {
        classicalLabel: 'Published Counter-Hypothesis · Formation of the Gospel Tradition in Hellenistic Communities (Schmidt 1919; Bultmann 1921)',
        classicalMd: 'Early twentieth-century German form criticism (**Karl Ludwig Schmidt**, *Der Rahmen der Geschichte Jesu*, 1919; **Rudolf Bultmann**, *History of the Synoptic Tradition*, 1921) hypothesized that Gospel narratives took shape over decades as unattributed folkloric units among Greek-speaking Hellenistic communities in Syria, Asia Minor, Egypt, or Rome, detached from individual Palestinian eyewitnesses.',
        evaluationLabel: 'Historiographical & Statistical Assessment (4-Move Analysis)',
        evaluationMd: '**(1) Shared Empirical Premise:** The Gospels were composed in Koine Greek, circulated across Mediterranean cities, and arranged pericopes both chronologically and topically.\n\n**(2) Methodological Standard:** Oral tradition developing without controls in Alexandria, Antioch, or Rome after AD 70 would be unlikely to reproduce the pre-70 clustering of Hasmonaean names in Judea and Galilee, Palestinian habits of disambiguation, and the micro-topography of pre-70 Jerusalem without access to early Palestinian traditions.\n\n**(3) Dated Primary Evidence:** On Ilan’s gender-matched male base, the Top 2 and Top 9 male names account for **17.6%** and **46.7%** of Palestinian occurrences, against **18.2%** and **40.3%** in the Gospels and Acts (see Theme 3C above). Among women, the corresponding figures are **28.6%** (Mary and Salome) and **49.7%** (Top 9) in Palestine, against **38.9%** and **61.1%** in the small Gospels–Acts sample (`N = 18`): comparable clustering within the same name pool rather than numerical identity. These quantitative evaluations remain contested (Gregor & Blais 2023; van de Weghe & Wilson 2024; see Theme 3C, Card 3).\n\n**(4) Historical Conclusion:** Taken together with the pre-AD 70 micro-topography of Jerusalem and the socially costly passion traditions, the Palestinian name patterns suggest that the Gospel traditions drew on early Palestinian sources, although the statistical question remains under active debate.',
      },
    ],
  },
  {
    id: 'section-stage4',
    aliases: ['stage4'],
    number: 4,
    navLabel: 'Patristics & Canon',
    title: 'Pre-Nicene Patristic Citations, Canon Recognition & Historical Synthesis',
    introMd: 'Tracing how early Christians cited and cataloged New Testament writings between the first century and the fourth century distinguishes three historical stages that popular summaries frequently conflate: (1) first-century creedal traditions and apostolic cross-citations, (2) second- and third-century fourfold-Gospel and Pauline collections attested across Gaul, Rome, North Africa, Egypt, and Syria (AD 150–250), and (3) fourth-century conciliar lists recognizing the established 27-book canon.',
    themes: [
      {
        id: 'stage4-canon-history',
        aliases: [],
        kind: 'cards',
        itemsKey: 'CANON_ITEMS',
        eyebrow: 'Theme 4A · Pre-Nicene Canon Recognition (3 Items)',
        title: 'First-Century Creeds, the Muratorian Fragment & the Extant Canons of Nicaea (AD 325)',
        leadMd: 'Primary documents from the first to the fourth century allow direct comparison of pre-Pauline creedal formulas (**1 Corinthians 15:3–7**), second-century catalogs of authoritative books (**Irenaeus**, the **Muratorian Fragment**, with both its core agreements and its uncertain margins), and the extant legislation of the First Council of Nicaea.',
      },
      {
        id: 'stage4-patristic-quotations',
        aliases: [],
        kind: 'patristics',
        eyebrow: 'Theme 4B · Ante-Nicene Patristic Apparatus (6 Items)',
        title: 'Pre-Nicene Citation Counts (Geisler & Nix 1986) & Methodological Qualification (Metzger 2005)',
        leadMd: 'Before the Edict of Milan (AD 313) and the Council of Nicaea (AD 325), Greek, Latin, and Syriac church fathers across the Mediterranean quoted New Testament books tens of thousands of times in treatises, apologies, and commentaries. These quotations, tabulated by evangelical scholars **Norman L. Geisler & William E. Nix** (*A General Introduction to the Bible*, 1986, p. 431) and qualified methodologically by Princeton textual critic **Bruce M. Metzger** (2005, p. 126), document both the pre-Nicene circulation of these books and their regional text-types.',
      },
      {
        id: 'stage4-verdict',
        aliases: [],
        kind: 'cards',
        itemsKey: 'SYNTHESIS_ITEMS',
        eyebrow: 'Theme 4C · Historical Synthesis & Interpretive Frameworks (2 Items)',
        title: 'Philosophical & Biographical Frameworks Applied to the Primary Record',
        leadMd: 'Synthesizing the manuscript, epigraphic, onomastic, and patristic evidence brings historical inquiry back to the primary texts themselves and the competing philosophical and historical-critical frameworks scholars have applied to them.',
      },
    ],
    assessments: [
      {
        classicalLabel: 'Published Counter-Hypothesis · Second-Century Diversity & Fourth-Century Canon Claims (Bauer 1934; Ehrman 2003; Dan Brown 2003)',
        classicalMd: 'In academic church history, **Walter Bauer** (*Orthodoxy and Heresy in Earliest Christianity*, 1934/1971) and **Bart D. Ehrman** (*Lost Christianities*, Oxford University Press, 2003) argued that second-century Christian movements showed wide regional diversity in texts and canons before proto-orthodox consolidation. Popular fiction (**Dan Brown**, *The Da Vinci Code*, Doubleday, 2003, ch. 55) extended this thesis into the claim that “the Bible, as we know it today, was collated by the pagan Roman emperor Constantine the Great” at the **Council of Nicaea in AD 325**.',
        evaluationLabel: 'Historiographical & Conciliar Assessment (4-Move Analysis)',
        evaluationMd: '**(1) Shared Empirical Premise:** Diverse non-canonical gospels (*Gospel of Thomas*, *Gospel of Peter*, *Gospel of Truth*) circulated in second- and third-century Alexandria, Syria, and Rome; Constantine convoked the First Council of Nicaea in May–July AD 325 and around AD 331 commissioned Eusebius of Caesarea (*Life of Constantine* 4.36) to prepare fifty parchment Bibles for Constantinople; and regional debates over smaller books (*Hebrews*, *2 Peter*, *James*, *2–3 John*, *Jude*, *Revelation*) continued into the fourth century.\n\n**(2) Methodological Standard:** Conciliar history is established from extant council minutes, creeds, synodal letters, and disciplinary canons alongside dated pre-conciliar manuscripts and catalogs.\n\n**(3) Dated Primary Evidence:** All **20 canons of Nicaea (AD 325)** are extant in Greek and Latin, and **none addresses the biblical canon**. Some **100–150 years before Nicaea**, papyri (**P46, P66, P75**, c. AD 175–225) transmitted the Gospels and Pauline Epistles, including their exalted Christological passages; **Justin Martyr** (c. AD 155) described the public reading of the apostolic Gospels on Sundays; **Tatian** (c. AD 170) combined Matthew, Mark, Luke, and John, and none of the Gnostic dialogues, in the *Diatessaron*; and **Irenaeus** (c. AD 180) and the **Muratorian Fragment** (c. AD 170–200 on the majority dating) attested the fourfold Gospel in Gaul and Rome.\n\n**(4) Historical Conclusion:** Bauer’s scholarship drew attention to genuine second-century heterodox literature and to regional debates over the *antilegomena*, but the bishops at Nicaea did not create the fourfold Gospel canon or divine Christology; the late-fourth-century lists (Athanasius, AD 367; Hippo, AD 393; Carthage, AD 397) recognized a core corpus attested in manuscripts and patristic writings more than a century earlier.',
      },
    ],
  },
];

export const CLOSING = {
  heading: 'Historiographical Scope & Primary-Source Verification',
  bodyMd: '**What the documentary record supports:** Dated manuscripts, inscriptions, non-Christian historians, Palestinian name statistics, and ante-Nicene citations support three bounded historical conclusions. (1) Extant Hebrew scrolls from the Judean Desert and Greek papyri from Egypt transmit, respectively, pre-Christian Second Temple scriptures and pre-Nicene New Testament books; comparison with later witnesses enables critical editions to identify later additions and to bracket them or relegate them to the apparatus (**Mark 16:9–20**, **John 7:53–8:11**, and the *Comma Johanneum* in **1 John 5:7–8**). (2) Iron Age stelae and first-century Roman inscriptions place biblical narratives within verifiable geopolitical settings, and non-Christian sources attest Jesus’s execution under Pontius Pilate and early Christian worship. (3) The fourfold Gospel and a Pauline letter collection circulated across the Mediterranean some 125–150 years before the Council of Nicaea (AD 325).\n\n**What empirical history alone does not establish:** Documentary and archaeological corroboration does not by itself adjudicate supernatural or theological propositions (such as divine inspiration or resurrection as miracle), establish verbatim autographic certainty behind late-second-century archetypes where early witnesses divide, or resolve every historical crux—such as Quirinius’s census in [Luke 2:1–2](/bible/lk/2#1), the silver-tribute disparity in [2 Kings 18:14](/bible/2kgs/18#14), or contested Synoptic parallels. Every digitized manuscript folio, museum artifact, scripture passage, and commentary cited in this dossier is linked directly above and in the source directory for independent inspection.',
};
