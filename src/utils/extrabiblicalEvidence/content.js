/**
 * Editorial copy, section structure, showcases, and formal scholarly assessments for
 * /discover/extrabiblical-evidence-for-jesus.
 *
 * Written strictly in formal third-person academic register (zero unnamed strawmen, zero first-person
 * plural pronouns, zero combative or guiding vocabulary). Every counter-hypothesis is attributed to
 * named scholars, schools, or primary texts with publication dates.
 */

export const SEO = {
  title: '16 Non-Christian Literary Sources and 10 Archaeological Finds Relating to Jesus and the Early Christians',
  description:
    'Primary texts and excavated inscriptions from Roman historians and governors, Flavius Josephus, Greek and Syrian philosophers, rabbinic compilations, and first- to early third-century sites.',
  keywords:
    'extrabiblical evidence for jesus, tacitus annals 15.44, josephus antiquities 20.200, pliny epistles 10.96, pilate stone, caiaphas ossuary, non-christian sources for jesus',
  ogAlt:
    'Ancient Roman, Greek, Judean, and archaeological inscriptions referencing Jesus of Nazareth and early Christianity',
};

export const CATALOG = {
  title: '16 Non-Christian Literary Sources and 10 Archaeological Finds Relating to Jesus and the Early Christians',
  description:
    'Roman historians and governors, Flavius Josephus, Greek and Syrian philosophers, rabbinic texts, and excavated inscriptions examined in original text and translation.',
};

export const HEADER = {
  eyebrow: 'Ancient History · Primary Sources',
  h1: '16 Non-Christian Literary Sources and 10 Archaeological Finds Relating to Jesus and the Early Christians',
  hookMd:
    'Sixteen non-Christian ancient writers and compilations—Roman officials, a Jerusalem priest, Greek and Syrian philosophers, and rabbinic compilers (transmitters of oral legal tradition)—refer to Jesus of Nazareth, to his execution, or to the movement named after him; four of these are indirect or debated allusions, among them Thallus’s eclipse notice, which Julius Africanus alone connects with the Passion. Alongside them stand ten first- to early third-century inscriptions, ossuaries, and excavated structures across Judea, Galilee, Rome, Delphi, Corinth, and Cyprus. Each entry gives the original text or the stratigraphic context (dating by archaeological layer), a date range, the manuscript transmission, and links to primary editions.',
  contextLine: '16 non-Christian literary sources, 10 archaeological finds, and full primary-edition index',
  framingMd:
    '**Scope and classification of witnesses (16 literary sources · 10 archaeological finds):**\n' +
    '- **11 literary sources name or unambiguously identify Jesus or Christ** across Judean, Roman, Greek, and rabbinic works.\n' +
    '- **4 preserve anonymous or debated allusions**, including Thallus’s solar-eclipse fragment (applied to the Passion solely by Julius Africanus).\n' +
    '- **1 author mentions Christians without naming Jesus** (Marcus Aurelius, *Meditations* 11.3); Suetonius’s *Nero* 16.2 does likewise, although Suetonius is counted above for *Claudius* 25.4.\n\n' +
    'Eight early Christian texts and three disputed or lost imperial documents are treated separately in the [Methodological Appendix](#corroborative-and-disputed) and are not included in these totals.',
  whosWhoSummary: 'Directory of the 16 non-Christian literary witnesses by date and directness (1st–6th c. AD)',
  whosWhoMd:
    '- **1st century AD:** Flavius Josephus (*Antiquities* 20.200 & 18.63–64, c. AD 93–94, Jerusalem priest in Rome — *direct*); Thallus (*Histories* Book 3, mid-1st to early 2nd c. AD, via Julius Africanus — *mediated eclipse allusion*); Mara bar Serapion (*Letter*, post-AD 73 to 3rd c. AD, date disputed, Syriac Stoic prisoner — *anonymous “wise King” allusion*).\n' +
    '- **Early 2nd century AD:** Pliny the Younger (*Epistles* 10.96–97, c. AD 112, governor of Bithynia-Pontus — *direct*); Cornelius Tacitus (*Annals* 15.44, c. AD 116, Roman senator and proconsul of Asia — *direct*); Suetonius (*Claudius* 25.4 on *Chresto* — *debated allusion*; *Nero* 16.2 on *Christiani*, c. AD 120, imperial secretary — *Christians named*); Phlegon of Tralles (*Olympiads*, c. AD 137–140, via Origen *Contra Celsum* 2.14 — *direct via patristic report*).\n' +
    '- **Mid-to-late 2nd century AD:** Numenius of Apamea (*On the Good*, mid-2nd c. AD, via Origen *Contra Celsum* 4.51 — *unnamed narrative allusion*); Lucian of Samosata (*Passing of Peregrinus* 11–13, c. AD 165–170, Greek satirist — *direct*); Marcus Aurelius (*Meditations* 11.3, c. AD 170–180, Roman Emperor — *Christians mentioned without naming Jesus*); Celsus (*The True Word*, c. AD 175–178, Middle Platonist philosopher via Origen — *direct*); Galen of Pergamum (*De Pulsuum Differentiis* 2.4, 3.3 & *Summary of Plato’s Republic*, c. AD 170–200, imperial physician — *direct*).\n' +
    '- **3rd to early 4th century AD:** *Tosefta Hullin* 2:22–23 [Sefaria 2:6] (c. AD 200–250, Palestinian compilation on *Yeshua ben Pantira* — *direct*); Porphyry of Tyre (*Philosophy from Oracles*, c. AD 270–300, Neoplatonist philosopher via Augustine — *direct*); Sossianus Hierocles (*Lover of Truth*, c. AD 303, Roman governor via Eusebius — *direct*).\n' +
    '- **5th to 6th century AD redaction:** Babylonian Talmud (*Sanhedrin* 43a, *Sanhedrin* 107b / *Sotah* 47a, *Gittin* 57a, Sasanian Babylonia on *Yeshu* — *direct*).',
};

export const HERO_WITNESSES = {
  caption: 'Earliest witnesses, late first and early second centuries (AD 93–116)',
  items: [
    {
      name: 'Flavius Josephus',
      meta: 'Jerusalem priest & historian · *Antiquities* 20.200 (c. AD 93–94)',
      position: 'Identifies James in AD 62 by reference to his brother Jesus',
      quoteMd: '“brought before them the brother of Jesus, who was called Christ, whose name was James”',
      ref: { witness: 'josephus-antiquities-20-9-1' },
    },
    {
      name: 'Pliny the Younger',
      meta: 'Roman governor of Bithynia · *Epistles* 10.96 (c. AD 112)',
      position: 'Reports Bithynian Christians singing a hymn to Christ “as to a god”',
      quoteMd: '“they were accustomed to meet on a fixed day before dawn and sing responsively a hymn to Christ as to a god”',
      ref: { witness: 'pliny-letters-10-96' },
    },
    {
      name: 'Cornelius Tacitus',
      meta: 'Roman senator & proconsul · *Annals* 15.44 (c. AD 116)',
      position: 'Records the execution of Christus under Tiberius by Pontius Pilate',
      quoteMd: '“Christus, from whom the name had its origin, suffered the extreme penalty during the reign of Tiberius at the hands of one of our procurators, Pontius Pilatus”',
      ref: { witness: 'tacitus-annals-15-44' },
    },
  ],
};

export const LABELS = {
  glance: 'At a glance · Five primary categories',
  navAria: 'Article sections',
  back: 'Discover',
  copyLink: 'Copy link to this section',
  copied: 'Section link copied',
  copyFailed: 'Unable to copy link',
  backToTop: 'Back to top',
  emphasisNote: 'Bold phrases inside primary quotations mark the clause under historical discussion; wording is unaltered.',
  sideBySide: 'Primary excerpts compared',
  sourcesWhat: 'Primary texts and material records',
  classical: 'Named scholarly counter-hypotheses',
  classicalDeeper: 'Further historiographical detail',
  evaluation: 'Assessment: textual and material evidence',
  evaluationDeeper: 'Additional textual notes',
  deeper: 'Transmission and philological notes',
  sources: 'Primary Editions, Museums, and Corpora Cited',
  sourcesNav: 'Sources',
  closingHeading: 'Synthesis: Points of Agreement Across the Corpora',
  verifyAria: 'Primary edition and verification links',
  findingTag: 'Stratigraphic & Material Excavation Summary',
  sourcesGroups: {
    roman_greek: 'Roman, Greek & Syrian Literary Editions',
    rabbinic: 'Rabbinic Texts & Uncensored Manuscripts',
    archaeology: 'Epigraphic Corpora, Museums & Excavation Reports',
    patristic: 'Patristic & Early Christian Comparative Editions',
    scripture: 'Biblical & Qurʾānic Texts on Ready Apologia',
  },
  sourcesGroupNotes: {
    roman_greek: 'Critical Greek, Latin, Syriac, papyrological, and epigraphic editions (Perseus, LacusCurtius, MIT Classics, Attalus, and Archive.org).',
    rabbinic: 'Bilingual Hebrew/Aramaic texts on Sefaria alongside Munich MS 95 and Florence II.1.8–9 manuscript readings.',
    archaeology: 'American School of Classical Studies at Athens (Corinth VIII.3), peer-reviewed excavation and provenance records (DOI and OpenAlex), and Livius.',
    patristic: 'Pre-Nicene and fourth-century patristic witnesses transmitting lost pagan works or corroborating early Christian liturgy.',
    scripture: 'Internal NASB 1995 scripture chapters and classical Qurʾānic commentary (al-Ṭabarī on 4:157).',
  },
};

export const SECTIONS = [
  // =========================================================================
  // 01. ROMAN HISTORIANS & GOVERNORS
  // =========================================================================
  {
    id: 'roman-records',
    isItem: true,
    aliases: ['crucifixion', 'resurrection'],
    nav: 'Roman Historians',
    h2: 'What do Roman senatorial historians and provincial governors record within ninety years of Pilate?',
    glance: {
      title: 'Roman Historians & Provincial Governors (AD 112–120)',
      takeawayMd:
        'Tacitus, Pliny the Younger, and Suetonius—three Roman officials whose posts gave them access to senatorial, provincial, and imperial records—attest Christus’s execution under Tiberius and Pontius Pilate, early Bithynian worship of Christ “as to a god,” Claudius’s expulsion of Jews from Rome over disturbances linked to Chrestus, and Nero’s punishment of Christians.',
      chips: ['Tacitus, Annals 15.44', 'Pliny, Epistles 10.96', 'Suetonius, Claudius 25.4 & Nero 16.2'],
    },
    showcase: {
      caption: 'Senatorial historiography beside provincial administration',
      left: {
        title: 'Execution & Early Worship (AD 112–116)',
        items: [
          {
            textMd: '“Christus, from whom the name had its origin, suffered the extreme penalty during the reign of Tiberius at the hands of one of our procurators, Pontius Pilatus”',
            ref: { witness: 'tacitus-annals-15-44' },
          },
          {
            textMd: '“meet on a fixed day before dawn and sing responsively a hymn to Christ as to a god”',
            ref: { witness: 'pliny-letters-10-96' },
          },
        ],
      },
      right: {
        title: 'Claudian & Neronian Rome (AD 49–64)',
        items: [
          {
            textMd: '“Since the Jews constantly made disturbances at the instigation of Chrestus, he expelled them from Rome.”',
            ref: { witness: 'suetonius-lives-of-the-twelve-caesars', label: 'Suetonius, Claudius 25.4' },
          },
          {
            textMd: '“Punishment was inflicted on the Christians, a class of men given to a new and mischievous superstition.”',
            ref: { witness: 'suetonius-lives-of-the-twelve-caesars', label: 'Suetonius, Nero 16.2' },
          },
        ],
      },
      noteMd:
        'All three Roman authors describe the Christian movement with disdain (*exitiabilis superstitio*, *superstitionis novae ac maleficae*), which makes confessional sympathy an unlikely motive for their reports.',
    },
    introMd:
      'Three interconnected members of Rome’s governing class provide the earliest extant Latin references to Christus and his followers. Pliny the Younger governed Bithynia-Pontus as Emperor Trajan’s personal legate (c. AD 112); his friend Cornelius Tacitus served as consul, proconsul of Asia, and member of the *Quindecimviri sacris faciundis* (the priestly college overseeing foreign cults in Rome) while writing the *Annals* (c. AD 116); and their younger contemporary Suetonius oversaw imperial correspondence (*ab epistulis*) under Hadrian (c. AD 120).',
    groups: [
      {
        key: 'imperial',
        label: 'Roman administrative and historical witnesses (3 authors)',
        witnessIds: [
          'tacitus-annals-15-44',
          'pliny-letters-10-96',
          'suetonius-lives-of-the-twelve-caesars',
        ],
      },
    ],
    classicalMd:
      'Two distinct critical hypotheses have been advanced against the authenticity or source independence of *Annals* 15.44. First, the nineteenth-century French writer **Polydore Hochart** (*De l’authenticité des Annales et des Histoires de Tacite*, 1890) contended that the fifteenth-century humanist Poggio Bracciolini forged *Annals* Books 11–16—a thesis ruled out by the extant eleventh-century Beneventan manuscript from Monte Cassino (Codex Mediceus II, Laurentian Library Plut. 68.2), copied roughly four centuries before Poggio. The German philosopher **Arthur Drews** (*Die Christusmythe*, 1909) later proposed that 15.44 was a Christian scribal interpolation. In a recent variant, **Richard Carrier** (“The Prospect of a Christian Interpolation in Tacitus, *Annals* 15.44,” *Vigiliae Christianae* 68, 2014, pp. 264–283) conjectured that a reference to Jewish followers of an agitator named *Chrestus* was altered by inserting the Pontius Pilate execution clause.\n\nSecond, historians who accept the Latin text’s authenticity—including **Charles Guignebert** (*Jesus*, 1935) and **G. A. Wells** (*The Jesus of the Early Christians*, 1971)—have suggested that Tacitus lacked first-century archival documentation (*acta senatus*). On this view, Tacitus repeated second-century Christian confessional statements encountered during his proconsulship of Asia (AD 112–113) or through Pliny’s correspondence, and his use of the later title *procurator* rather than *praefectus* for Pontius Pilate is taken as a sign of that dependence.',
    evaluationLabel: 'Assessment: manuscripts, philology, and Roman administrative usage',
    evaluationMd:
      'Latin philologists and Roman historians—including **Harald Fuchs** (*Vigiliae Christianae* 4, 1950), **Ronald Syme** (*Tacitus*, Oxford University Press, 1958, vol. 2), **John P. Meier** (*A Marginal Jew*, vol. 1, 1991), and **Robert E. Van Voorst** (*Jesus Outside the New Testament*, 2000)—reject interpolation on three textual and palaeographical grounds. First, the syntax and vocabulary are distinctively Tacitean (*auctor nominis eius*, *supplicio adfectus erat*, *repressaque in praesens exitiabilis superstitio*) and match stylistic patterns found elsewhere in the *Annals* but not in medieval Christian Latin. Second, the passage calls Christianity a “most mischievous superstition” (*exitiabilis superstitio*), names Judea “the origin of this evil” (*originem eius mali*), and places the movement among “all things hideous and shameful” (*cuncta atrocia aut pudenda*)—language difficult to attribute to a Christian interpolator. Third, palaeographical inspection of Codex Mediceus II—first reported by **Georg Andresen** (*Wochenschrift für klassische Philologie* 19, 1902, cols. 780–781; adopted by **Erich Koestermann**, 1965; cf. **Robert Renehan**, *La Parola del Passato* 23, 1968) and corroborated by physical and ultraviolet re-examination at the Laurentian Library (**Ida Giovanna Rao**, 2008)—shows that the first hand wrote *chrestianos* with an *e* (later erased and corrected to *christianos*), whereas *Christus* in the next sentence stands unemended in the first hand.\n\nRegarding Tacitus’s sources, **A. N. Sherwin-White** (*Roman Society and Roman Law in the New Testament*, 1963) and **John P. Meier** (1991) note that retrojecting the post-Claudian equestrian title *procurator* onto Tiberius’s prefects was standard second-century Roman administrative usage (Josephus likewise alternates between *epitropos* [*Jewish War* 2.169] and *hēgemōn* [*Antiquities* 18.55] for Pilate). Second-century Christian creedal summaries of the Passion typically paired the personal name *Jesus* with the title *Christ* (as in Ignatius, *Trallians* 9) rather than describing his death in detached Roman penal phrasing (*Christus… supplicio adfectus erat*). Whether Tacitus consulted senatorial registers (*commentarii senatus*) or evaluated provincial reports, he presents the execution of Christus by Pilate under Tiberius as an established fact.',
  },

  // =========================================================================
  // 02. FLAVIUS JOSEPHUS
  // =========================================================================
  {
    id: 'josephus',
    isItem: true,
    aliases: ['historical-jesus'],
    nav: 'Josephus',
    h2: 'How do Flavius Josephus’s two Judean passages stand under manuscript and philological criticism?',
    glance: {
      title: 'Flavius Josephus — First-Century Judean Historiography (c. AD 93–94)',
      takeawayMd:
        'Writing in Rome some sixty years after the crucifixion, the Jerusalem priest Flavius Josephus names “the brother of Jesus, who was called Christ, whose name was James” (*Antiquities* 20.200) and transmits an account of Jesus’s wisdom and execution under Pilate (*Antiquities* 18.63–64) that contains three brief clauses widely analyzed as Christian scribal glosses.',
      chips: ['Antiquities 20.200 (James)', 'Antiquities 18.63–64 (Greek vs. Agapius Arabic)'],
    },
    showcase: {
      caption: 'Two distinct passages in Antiquities of the Jews (AD 93–94)',
      left: {
        title: 'Book 20 (§200) — The James Passage (Near-Consensus Authenticity)',
        items: [
          {
            textMd: '“brought before them the brother of Jesus, who was called Christ, whose name was James”',
            ref: { witness: 'josephus-antiquities-20-9-1' },
          },
        ],
      },
      right: {
        title: 'Book 18 (§§63–64) — Crucifixion Core Shared by the Greek and Arabic Versions',
        items: [
          {
            textMd: '“Now there was about this time Jesus, a wise man… Pilate… had condemned him to the cross, those that loved him at the first did not forsake him”',
            ref: { witness: 'josephus-antiquities-18-3-3' },
          },
        ],
      },
      noteMd:
        'Book 20’s terse identifier “who was called Christ” (*τοῦ λεγομένου Χριστοῦ*) is commonly taken to presuppose that Josephus had already introduced Jesus earlier in *Antiquities* (Book 18).',
    },
    introMd:
      'Born into an aristocratic priestly family in Jerusalem in AD 37—roughly four to seven years after Jesus’s crucifixion in the same city—Flavius Josephus knew first-century Jerusalem’s Temple elite firsthand before composing his twenty-book *Antiquities of the Jews* in Rome around AD 93–94. Scholarly analysis customarily begins with the broadly accepted narrative of James’s execution in Book 20 (§200) and then compares the extant Greek manuscripts of Book 18 (§§63–64) with Bishop Agapius of Hierapolis’s tenth-century Arabic paraphrase.',
    groups: [
      {
        key: 'antiquities',
        label: 'Josephus, *Antiquities of the Jews* (1 author, 2 passages)',
        witnessIds: [
          'josephus-antiquities-20-9-1',
          'josephus-antiquities-18-3-3',
        ],
      },
    ],
    classicalMd:
      'Because Josephus’s works were transmitted through medieval Christian scriptoria, textual critics since the sixteenth century have scrutinized both passages for Christian scribal interference. On *Antiquities* 18.63–64 (*Testimonium Flavianum*), **Emil Schürer** (*Geschichte des jüdischen Volkes im Zeitalter Jesu Christi*, 3rd/4th ed., vol. 1, 1901, pp. 544–549) argued for wholesale interpolation, whereas the revised English edition by G. Vermes, F. Millar & M. Black (vol. 1, 1973) favors partial interpolation. **Eduard Norden** (*Neue Jahrbücher* 31, 1913) contended that the paragraph interrupts Book 18’s sequence of Judean tumults; **Ken Olson** (“Eusebius and the *Testimonium Flavianum*,” *Catholic Biblical Quarterly* 61, 1999, pp. 305–322) argued on lexical grounds that the fourth-century church historian Eusebius of Caesarea composed the entire passage; and **Louis H. Feldman** (1984) surveyed the arguments for total as well as partial interpolation.\n\nOn *Antiquities* 20.200, **Richard Carrier** (*Journal of Early Christian Studies* 20, 2012, pp. 489–514, “Origen, Eusebius, and the Accidental Interpolation in Josephus, *Jewish Antiquities* 20.200”) proposed that the Greek phrase *τοῦ λεγομένου Χριστοῦ* (“who was called Christ”) originated as a Christian marginal gloss copied into the text, and that Josephus’s “brother of Jesus” originally designated the High Priest **Jesus ben Damneus**, whom King Agrippa II appoints to replace Ananus three sentences later (*Antiquities* 20.203).',
    evaluationLabel: 'Assessment: manuscripts, philology, and Josephan style',
    evaluationMd:
      'These interpolation proposals face substantial textual and stylistic objections set out by **Louis H. Feldman** (*Josephus and Modern Scholarship*, 1984), **John P. Meier** (*A Marginal Jew*, vol. 1, 1991), **James Carleton Paget** (“Some Observations on Josephus and Christianity,” *Journal of Theological Studies* NS 52, 2001, pp. 539–624), and **Alice Whealey** (*Josephus on Jesus*, 2003).\n\nIn *Antiquities* 20.200, the phrase is attested in all Greek manuscripts and in Eusebius (*Church History* 2.23.22). Early Christian writers did not usually describe James neutrally as “the brother of Jesus, who was called Christ”; they styled him “James the Just” or “the brother of the Lord” (*ὁ ἀδελφὸς τοῦ Κυρίου*), and the third-century Alexandrian scholar **Origen**, who read the James passage in Josephus, remarks that Josephus did not accept Jesus as the Messiah (*Contra Celsum* 1.47; *Commentary on Matthew* 10.17). Moreover, **Carrier’s** Jesus ben Damneus proposal runs counter to Josephus’s narrative practice: Josephus does not elsewhere identify a person by reference to a brother who has not previously entered the narrative, and when Jesus ben Damneus appears three sentences later (*Ant.* 20.203), Josephus introduces him afresh by patronymic (“Jesus, the son of Damneus”) with no indication that his brother had just been stoned by Ananus.\n\nIn *Antiquities* 18.63–64, once the three brief Christian clauses marked in the comparison table above are set aside, key expressions align with Josephan style: calling Jesus “a wise man” (*σοφὸς ἀνήρ*, matching Solomon in *Ant.* 8.53 and Daniel in *Ant.* 10.237) and pairing “pleasure” (*ἡδονῇ*) with “truth.” Scholars debate the significance of *φῦλον* (“tribe/contingent”), with **Meier** (1991) and **Van Voorst** (2000) citing Josephan parallels (*Jewish War* 3.354, 7.327; *Ant.* 2.306) and **Olson** (1999) citing Eusebius’s use of *τὸ Χριστιανῶν φῦλον* (*Church History* 3.33.2). The Agapius paraphrase published by **Shlomo Pines** (1971), traced by **Whealey** (2003; *NTS* 54, 2008) to the Syriac Eusebian tradition, omits “doer of startling deeds” and the Jewish leaders’ indictment while retaining Pilate’s crucifixion sentence, the disciples’ appearance report, and “he was perhaps the Messiah.”',
  },

  // =========================================================================
  // 03. GREEK, SYRIAN & ROMAN PHILOSOPHERS / SATIRISTS
  // =========================================================================
  {
    id: 'pagan-critics',
    isItem: true,
    aliases: ['early-christology'],
    nav: 'Greek & Syrian',
    h2: 'What did pagan satirists, chroniclers, physicians, and philosophers know of Jesus before AD 325?',
    glance: {
      title: 'Greek, Syrian & Roman Philosophers and Chroniclers (AD 73–303)',
      takeawayMd:
        'Six non-Christian Greek and Roman writers—Lucian, Celsus, Phlegon via Origen, Porphyry, Sossianus Hierocles, and Galen—name or unambiguously identify Jesus or Christ (in connection with his crucifixion, his wonders, or the worship of him as divine before Nicaea, or, in Galen’s case, as the founder of a philosophical school); in addition there are three anonymous or mediated allusions (Mara bar Serapion, Thallus via Africanus, Numenius via Origen) and Marcus Aurelius’s reference to Christians.',
      chips: ['Lucian (c. 165)', 'Celsus (c. 177)', 'Galen (c. 180)', 'Porphyry (c. 270)', 'Hierocles (c. 303)'],
    },
    showcase: {
      caption: 'Pre-Nicene pagan critics on Christian worship of Jesus (AD 165–303)',
      left: {
        title: 'Second-Century Satire & Platonist Critique',
        items: [
          {
            textMd: '“worship a man to this day—the distinguished personage who introduced their novel rites, and was crucified on that account”',
            ref: { witness: 'lucian-peregrinus', label: 'Lucian, Peregrinus 11' },
          },
          {
            textMd: '“they worship to an extravagant degree this man who appeared recently”',
            ref: { witness: 'celsus-contra-celsum', label: 'Celsus, in Origen, Contra Celsum 8.12' },
          },
        ],
      },
      right: {
        title: 'Third- & Early Fourth-Century Philosophical Critics',
        items: [
          {
            textMd: '“Of this very pious man, then, Hecate said that the soul, like the souls of other good men, was after death dowered with immortality, and that the Christians through ignorance worship it.”',
            ref: { witness: 'porphyry-against-christians', label: 'Porphyry, in Augustine, City of God 19.23' },
          },
          {
            textMd: '“they on the strength of a few miracles proclaim their Jesus a god”',
            ref: { witness: 'sossianus-hierocles-against-hierocles-2', label: 'Hierocles, in Eusebius, Against Hierocles 2' },
          },
        ],
      },
      noteMd:
        'All four passages above predate Emperor Constantine’s Edict of Milan (AD 313) and the First Council of Nicaea (AD 325).',
    },
    introMd:
      'Beyond Roman governors and Judean historians, ten Greek- and Syriac-writing intellectuals from across the eastern Mediterranean and Rome discussed Jesus, related traditions, or the Christian movement between the late first century and AD 303. Three reach modern readers through direct Greek or Syriac manuscript transmission (Lucian, Mara bar Serapion, and Marcus Aurelius); Galen’s two pulse-treatise notices are extant in Greek manuscripts while his *Republic* summary is preserved in Arabic; four are preserved through verbatim patristic quotations (Celsus in Origen, Porphyry in Augustine, Sossianus Hierocles in Eusebius, and Phlegon’s Olympiad fragment in Eusebius/Jerome alongside Origen’s report); and two are known through indirect Christian paraphrases (Thallus in Julius Africanus via Syncellus, and Numenius in Origen).',
    groups: [
      {
        key: 'pagan',
        label: 'Greek, Syrian, and Roman literary witnesses (10 authors)',
        witnessIds: [
          'lucian-peregrinus',
          'mara-bar-serapion',
          'celsus-contra-celsum',
          'thallus-histories',
          'phlegon-of-tralles-olympiads',
          'galen-de-pulsuum',
          'marcus-aurelius-meditations-11-3',
          'numenius-on-the-good',
          'porphyry-against-christians',
          'sossianus-hierocles-against-hierocles-2',
        ],
      },
    ],
    classicalMd:
      'Two lines of historical criticism bear on these ten authors. First, historians of classical transmission (**Fergus Millar**, *The Roman Near East*, 1993; **Robert E. Van Voorst**, 2000; **Jeffrey Hargis**, *Against the Christians*, 1999) note that second- and third-century pagan writers such as Lucian, Celsus, Galen, Porphyry, and Hierocles had no independent archival access to events in Jerusalem around AD 30: between AD 165 and 303, Celsus, Porphyry, and Hierocles were reading the canonical Gospels directly in order to criticize them.\n\nSecond, modern historians of Christian doctrine distinguish several developmental hypotheses. Within the German *Religionsgeschichtliche Schule* (“History-of-Religions School”), **Wilhelm Bousset** (*Kyrios Christos*, 1913; cf. **Maurice Casey**, *From Jewish Prophet to Gentile God*, 1991) proposed that the worship of Jesus as divine *Kyrios* (“Lord”) arose when Christianity moved from Aramaic-speaking Palestine into Hellenistic Gentile cities, whereas **Bart D. Ehrman** (*How Jesus Became God*, 2014) argues that belief in Jesus’s divine exaltation after the crucifixion began within years of his death and developed into a theology of pre-existence and incarnation over the first century. Separately, **Joseph Priestley** (*An History of the Corruptions of Christianity*, 1782) and **Richard E. Rubenstein** (*When Jesus Became God*, 1999) emphasized the fourth-century imperial and conciliar consolidation of doctrine around the Council of Nicaea (AD 325).',
    evaluationLabel: 'Assessment: chronology and source dependence',
    evaluationMd:
      'A chronological reading of these ten authors supports two limited conclusions. First, second- and third-century philosophers such as Celsus and Porphyry rely on circulating Christian texts rather than lost first-century pagan archives, Thallus and Numenius are preserved solely in indirect paraphrases, and Marcus Aurelius mentions Christians but not Jesus. Their value for first-century questions lies in what informed ancient opponents treated as common ground: in the extant texts, from Lucian and Celsus under Marcus Aurelius to Sossianus Hierocles under Diocletian, Greek and Roman critics neither argue that Jesus did not exist nor contest his execution in Palestine or his reputation for wonders. Instead, Celsus (*Contra Celsum* 1.28, 1.38) and Hierocles (*Against Hierocles* 2) attributed the reported wonders to sorcery or compared them with Apollonius of Tyana.\n\nSecond, for Christian devotion between AD 112 and AD 303, these pagan writers are incompatible with models that date the origin of the worship of Jesus as divine to Constantine or to the Council of Nicaea. **Pliny** (c. AD 112) reports Christians singing hymns *Christo quasi deo* (“to Christ as to a god”), **Lucian** (c. AD 165) mocks the worship of the crucified man, **Celsus** (c. AD 177) objects that worshipping Christ compromises monotheism (*Contra Celsum* 8.12), the **Alexamenos Graffito** (late 2nd to early 3rd c.) reads “Alexamenos worships [his] god,” **Porphyry** (c. AD 270) criticizes Christians for worshipping Jesus, and **Hierocles** (c. AD 303) criticizes them for proclaiming Jesus “a god.” Because these external testimonies begin around AD 112, they do not by themselves settle debates about the first century between **Larry W. Hurtado** (*Lord Jesus Christ*, 2003) and **Richard Bauckham** (*Jesus and the God of Israel*, 2008) on one side and **Bousset** or **Ehrman** on the other (for pre-Pauline liturgical texts from the AD 30s–50s, see [Appendix A](#corroborative-and-disputed)).',
  },

  // =========================================================================
  // 04. RABBINIC SOURCES
  // =========================================================================
  {
    id: 'rabbinic-sources',
    isItem: true,
    aliases: [],
    nav: 'Rabbinic Texts',
    h2: 'What do the Tosefta and uncensored manuscripts of the Babylonian Talmud preserve—and when?',
    glance: {
      title: 'Rabbinic Compilations — Tosefta & Babylonian Talmud (c. AD 200–550)',
      takeawayMd:
        'Early Palestinian *Tosefta Hullin* (c. AD 200–250) attests an attempted healing in the name of Yeshua ben Pantira (forbidden by Rabbi Ishmael), while uncensored manuscripts of the Babylonian Talmud (*Sanhedrin* 43a, 107b; *Gittin* 57a) presuppose Yeshu’s execution on the eve of Passover and attribute his deeds to sorcery.',
      chips: ['Tosefta Hullin 2:22–23', 'b. Sanhedrin 43a (Munich MS 95)', 'b. Sanhedrin 107b & Gittin 57a'],
    },
    showcase: {
      caption: 'Palestinian Tannaitic compilation beside Babylonian Talmudic manuscripts',
      left: {
        title: 'Pre-Nicene Palestinian Tosefta (c. AD 200–250)',
        items: [
          {
            textMd: '“Jacob, a man of Kefar Sama, came to heal him in the name of Yeshua ben Pantira”',
            ref: { witness: 'tosefta-hullin-talmud-abodah-zarah-27b' },
          },
        ],
      },
      right: {
        title: 'Babylonian Talmud (Uncensored Munich & Florence MSS)',
        items: [
          {
            textMd: '“On the eve of Passover they hanged Yeshu the Nazarene… because he practiced sorcery and enticed and led Israel astray”',
            ref: { witness: 'babylonian-talmud-sanhedrin-43a' },
          },
        ],
      },
      noteMd:
        'Early modern printed editions from the Basel Talmud (1578–1581) onward excised the Yeshu passages under Christian censorship; pre-censorship manuscripts (Munich 95, Florence II.1.8–9, Herzog 1) preserve them intact.',
    },
    introMd:
      'Rabbinic literature must be divided chronologically between the early Palestinian Tannaitic compilations—the *Mishnah* (c. AD 200) and the *Tosefta* (c. AD 200–250)—and the later *Gemara* (rabbinic commentary and legal-narrative analysis on the *Mishnah*) of the Babylonian Talmud (*Bavli*), redacted in Sasanian Mesopotamia in the fifth and sixth centuries AD. Distinguishing the third-century *Tosefta* from the fifth- and sixth-century Babylonian narratives avoids anachronistic dating and clarifies what Jewish interlocutors treated as common historical ground.',
    groups: [
      {
        key: 'rabbinic',
        label: 'Rabbinic compilations across four passages (Tosefta & Babylonian Talmud)',
        witnessIds: [
          'tosefta-hullin-talmud-abodah-zarah-27b',
          'babylonian-talmud-sanhedrin-43a',
          'tosefta-talmud-sanhedrin-107b',
          'babylonian-talmud-gittin-57a',
        ],
      },
    ],
    classicalMd:
      '#### Rabbinic Redaction and Separation Hypotheses\n' +
      '**Johann Maier** (*Jesus von Nazareth in der talmudischen Überlieferung*, 1978) argued that the earliest layers of the Talmudic *Yeshu* stories originally concerned other figures (such as a Hasmonean-era student of Yehoshua ben Perachiah) and were connected to Jesus of Nazareth solely at a late redactional stage. **John P. Meier** (*A Marginal Jew*, vol. 1, 1991) and **Peter Schäfer** (*Jesus in the Talmud*, Princeton University Press, 2007) concur against older historians (**Joseph Klausner**, *Jesus of Nazareth*, 1922) that *b. Sanhedrin* 43a is a late literary response to Christian Passion narratives rather than an independent first-century Sanhedrin trial record.\n\n' +
      '#### Qurʾān 4:157 and Classical Substitution Exegesis\n' +
      'In early seventh-century Arabia (c. AD 610–632), [**Qurʾān 4:157**](/quran/4/157/tafsir/tabari) states regarding Jesus’s death: *wa-mā qatalūhu wa-mā ṣalabūhu wa-lākin shubbiha lahum* (“and they did not kill him, nor did they crucify him, though it was made to appear so to them”). Classical Islamic commentators **Muḥammad ibn Jarīr al-Ṭabarī** (d. AD 923, *Jāmiʿ al-bayān* on [4:157](/quran/4/157/tafsir/tabari)) and **Ismāʿīl ibn Kathīr** (d. AD 1373, *Tafsīr al-Qurʾān al-ʿAẓīm*) interpreted this verse through early narrative traditions—attributed to the Yemeni transmitter of biblical lore **Wahb ibn Munabbih** (d. c. AD 730) and to **Ibn ʿAbbās**—in which Jesus’s likeness (*shabah*) was cast onto a volunteer disciple or sentry crucified in his stead while Jesus was raised bodily.',
    evaluationLabel: 'Assessment: dating and literary context',
    evaluationMd:
      '#### Rabbinic Passages and Syriac-Mesopotamian Context\n' +
      '**Peter Schäfer** (*Jesus in the Talmud*, 2007) and **Richard Kalmin** (*Jewish Babylonia between Persia and Roman Palestine*, 2006) argue, against **Johann Maier’s** (1978) separation thesis, that “Yeshu the Nazarene” (*Yeshu ha-Notzri*) in the uncensored Babylonian manuscripts directly engages Christian Passion traditions circulating in Syriac-speaking Mesopotamia. The placement of the execution on “the eve of Passover” (*erev Pesach*; cf. [John 19:14](/bible/jn/19#14)) and the naming of five disciples in *Sanhedrin* 43a whose names serve as word-plays (*Mattai, Naqai, Netzer, Buni, Todah*) interact with Gospel motifs, while the passage recasts the death under rabbinic criminal procedure (*m. Sanhedrin* 6:4; cf. Deuteronomy 21:22–23) as court stoning (*lissaqēl*) followed by posthumous hanging (*telaʾuhu*). Although too late to serve as a record of a first-century trial, the rabbinic corpus shows that Jewish sages from third-century Palestine (*Tosefta Hullin* 2:22–23) to Sasanian Babylonia contested healing in Jesus’s name and attributed his deeds to “sorcery”; the extant passages do not question his existence or his execution at Passover.\n\n' +
      '#### Chronological Assessment of Qurʾān 4:157 and Substitution Traditions\n' +
      '[Qurʾān 4:157](/quran/4/157/tafsir/tabari) itself dates to the early seventh century AD (c. AD 610–632)—roughly five to six centuries after the earliest extant Christian, Judean, Roman, and Greek witnesses to Jesus’s crucifixion. These earlier witnesses include the Pauline letters ([1 Corinthians 15:3–4](/bible/1cor/15#3); [Philippians 2:8](/bible/phil/2#8)), **Josephus** (*Antiquities* 18.63–64), **Tacitus** (*Annals* 15.44), **Lucian** (*Peregrinus* 11–13), **Celsus** (*Contra Celsum* 2.9, 2.31), and Mara bar Serapion’s Syriac letter; the Babylonian *baraita* (*Sanhedrin* 43a), redacted in the fifth to sixth centuries, likewise presupposes the execution. The explicit identity-substitution narratives attached to [4:157](/quran/4/157/tafsir/tabari) appear still later in classical Islamic exegesis, notably in **al-Ṭabarī** (d. AD 923) and **Ibn Kathīr** (d. AD 1373). In Mediterranean antiquity, visual-substitution stories first surface in second- and third-century Gnostic *docetic* writings—texts teaching that Christ merely seemed to suffer physically (*Second Treatise of the Great Seth*; Nag Hammadi *Apocalypse of Peter*)—beginning with the second-century Alexandrian Gnostic teacher **Basilides**, whom Irenaeus (*Against Heresies* 1.24.4, c. AD 180) reports taught that **Simon of Cyrene** was transfigured into Jesus’s likeness and crucified in his place.',
  },

  // =========================================================================
  // 05. ARCHAEOLOGY & MATERIAL INSCRIPTIONS
  // =========================================================================
  {
    id: 'archaeology',
    isItem: true,
    aliases: [],
    nav: 'Archaeology',
    h2: 'How do ten first- to early third-century inscriptions, ossuaries, and excavations test the Gospel setting?',
    glance: {
      title: 'Archaeology — Seven Inscriptions & Three Topographical Excavations',
      takeawayMd:
        'Excavated stone inscriptions, ossuaries, and osteological finds attest Pontius Pilate’s prefecture, the Qayafa (Caiaphas) family tomb, Roman crucifixion by nailing followed by Jewish ossuary burial (Yehoḥanan), the proconsular titles used in Acts, and pre-AD 70 Jerusalem pools, alongside basalt remains at Capernaum.',
      chips: ['Pilate Stone', 'Caiaphas Ossuary', 'Yehoḥanan Heel Bone', 'Gallio Inscription', 'Bethesda & Siloam Pools'],
    },
    showcase: {
      caption: 'Excavated inscriptions from Judea, Rome, and Corinth',
      left: {
        title: 'Judean Governor & High-Priestly Family Ossuary',
        items: [
          {
            textMd: '“Pontius Pilate … Prefect of Judea”',
            ref: { witness: 'pilate-stone', label: 'AE 1963, no. 104 Caesarea' },
          },
          {
            textMd: '“Yehosef bar Qayafa (‘Joseph, son of Qayafa [Caiaphas]’)”',
            ref: { witness: 'caiaphas-ossuary' },
          },
        ],
      },
      right: {
        title: 'Roman Worship Caricature & Civic Magistracy',
        items: [
          {
            textMd: '“Alexamenos worships [his] god.”',
            ref: { witness: 'alexamenos-graffito' },
          },
          {
            textMd: '“Erastus, in return for his aedileship, laid [this pavement] at his own expense.”',
            ref: { witness: 'erastus-inscription' },
          },
        ],
      },
      noteMd:
        'Archaeology cannot verify individual miracle reports; its contribution is to test whether the New Testament authors show accurate knowledge of Judean and provincial administration, burial practice, and urban geography.',
    },
    introMd:
      'Ten excavated artifacts and architectural complexes illuminate the institutional, legal, and geographical setting of Jesus’s ministry and the earliest apostolic mission. Group A presents seven inscribed objects—carved in Latin, Greek, Hebrew, and Aramaic—recording a Roman governor of Judea, a Jerusalem priestly family ossuary, a crucifixion victim (killed by nailing) interred in a Jerusalem family tomb, provincial and civic magistrates in Achaia, Corinth, and Cyprus, and a late second- or early third-century Roman caricature of Christian worship of a crucified figure. Group B presents three uninscribed architectural sites in Jerusalem (sealed before AD 70) and Capernaum (first-century basalt levels beneath a late antique synagogue), documented through their stratigraphy rather than through inscriptions.',
    groups: [
      {
        key: 'inscriptions',
        label: 'Group A · Seven inscribed first- to early third-century artifacts (Greek, Latin, Hebrew, Aramaic)',
        witnessIds: [
          'alexamenos-graffito',
          'pilate-stone',
          'caiaphas-ossuary',
          'yehohanan-heel-bone',
          'gallio-inscription',
          'erastus-inscription',
          'sergius-paulus-inscription',
        ],
      },
      {
        key: 'excavations',
        label: 'Group B · Three Judean and Galilean topographical excavations',
        witnessIds: [
          'pool-of-bethesda',
          'pool-of-siloam',
          'capernaum-synagogue',
        ],
      },
    ],
    classicalMd:
      'Two major critical theses in nineteenth- and twentieth-century New Testament scholarship turned on material claims testable by excavation. First, **Ferdinand Christian Baur** (*Kritische Untersuchungen über die kanonischen Evangelien*, 1847, pp. 244–245, 331–332) argued that the Gospel of John was composed late in the second century outside Palestine with symbolic rather than historical geography, and **Alfred Loisy** (*Le quatrième évangile*, 1903, p. 386, adapting an allegorical motif attested in **Augustine**, *Tractates on John* 17.2) interpreted the five-porticoed Pool of Bethesda ([John 5:2](/bible/jn/5#2)) as unhistorical symbolism for the five books of Moses.\n\nSecond, **John Dominic Crossan** (*Jesus: A Revolutionary Biography*, HarperSanFrancisco, 1994; *Who Killed Jesus?*, 1995; joined in modified form by **Bart D. Ehrman**, *How Jesus Became God*, 2014) argued that Roman crucifixion practice ordinarily left victims on crosses as carrion for dogs and wild birds or buried them in shallow common graves, rendering the Gospel accounts of Pilate releasing Jesus’s body for rock-cut tomb burial by Joseph of Arimathea ([Mark 15:42–46](/bible/mk/15#42)) historically improbable.',
    evaluationLabel: 'Assessment: excavation and literary evidence',
    evaluationMd:
      'Subsequent excavations in Jerusalem bear directly on both debates. On Johannine topography, the work of **Conrad Schick** (*PEQ* 20, 1888, pp. 115–134), **Pierre Benoit** (“Découvertes archéologiques autour de la piscine de Béthesda,” in *Jerusalem Through the Ages*, Israel Exploration Society, 1968, pp. 48*–57*), **Shimon Gibson** (*Proche-Orient Chrétien* 55, 2005, pp. 270–293), **Ronny Reich and Eli Shukron** (2004–2011), and **Urban C. von Wahlde** (*The Gospel and Letters of John*, 2010; see also **James H. Charlesworth**, ed., *Jesus and Archaeology*, 2006) has shown that two sites named in John lay sealed beneath AD 70 destruction layers and second-century Hadrianic rebuilding: the twin-basin rock-cut complex of the **Pool of Bethesda** north of the Temple Mount, divided by a central partition wall (a plan consistent, in Gibson’s reconstruction, with the five porticoes of [John 5:2](/bible/jn/5#2)), and the stepped Second Temple **Pool of Siloam** at the southern tip of the City of David. Both finds are consistent with the view that the author of the Fourth Gospel drew on knowledge of the topography of Jerusalem before AD 70.\n\nOn Roman crucifixion and Jewish burial, **Craig A. Evans** (*Jesus and the Ossuaries*, Baylor University Press, 2003), **Jodi Magness** (*Stone and Dung, Oil and Spit: Jewish Daily Life in the Time of Jesus*, Eerdmans, 2011), and **John Granger Cook** (*Crucifixion in the Mediterranean World*, Mohr Siebeck, 2014) argue against **Crossan** and **Ehrman** from converging literary and osteological evidence. **Philo of Alexandria** (*In Flaccum* 83) records Roman governors releasing crucified bodies to relatives, and **Flavius Josephus** notes regarding Deuteronomy 21:22–23 that “the Jews used to take so much care of the burial of men, that they took down those that were condemned and crucified, and buried them before the going down of the sun” (*Jewish War* 4.317, tr. Whiston). Materially, the **Yehoḥanan ossuary** from Givʿat HaMivtar shows that at least one victim of crucifixion by nailing received family tomb burial in Jerusalem before AD 70.',
  },

  // =========================================================================
  // APPENDIX (UNNUMBERED): CORROBORATIVE CHRISTIAN & DISPUTED SOURCES
  // =========================================================================
  {
    id: 'corroborative-and-disputed',
    isItem: false,
    aliases: [],
    nav: 'Appendix',
    h2: 'Methodological Appendix: Early Christian Witnesses and Disputed Imperial Documents',
    introMd:
      'This appendix distinguishes external non-Christian testimony from two related categories that some earlier anthologies combined with it: **(A) pre-Nicene Christian liturgical and patristic texts** (AD 50–300), which are primary sources for early Christian belief and corroborate what pagan observers such as Pliny, Lucian, and Celsus reported from outside the movement, but which remain *internal* Christian sources rather than non-Christian witnesses; and **(B) three imperial inscriptions, papyri, or lost pamphlets** whose connection to Jesus or first-century Galilee is not supported by modern epigraphy, papyrology, or isotope provenance. All eleven entries appear below with original texts, dates, and primary-edition links.',
    groups: [
      {
        key: 'christian-witnesses',
        label: 'Appendix A · Eight pre-Nicene Christian and canonical comparative witnesses (AD 50–300)',
        witnessIds: [
          'carmen-christi-philippians-2-6-11',
          'ignatius-seven-epistles',
          'polycarp-philippians-12-2',
          'second-clement-1-1',
          'jewish-polemic-toledot-trypho',
          'melito-on-the-passover',
          'hegesippus-eusebius-hist-eccl-3-20',
          'phos-hilaron',
        ],
      },
      {
        key: 'disputed-documents',
        label: 'Appendix B · Three disputed, misapplied, or lost imperial documents excluded from primary counts',
        witnessIds: [
          'nazareth-inscription',
          'claudius-letter-to-alexandrians',
          'acts-of-pilate-forgery',
        ],
      },
    ],
    classicalMd:
      'Twentieth-century compilations such as **Josh McDowell’s** *Evidence That Demands a Verdict* (1972) and **Gary R. Habermas’s** *The Historical Jesus* (1996) grouped pre-Pauline Christian hymns (*Philippians* 2:6–11), second-century bishops (**Ignatius**, **Polycarp**, **Melito**), and imperial documents (**Nazareth Inscription**, **Claudius’s Letter to the Alexandrians**) alongside **Tacitus** and **Josephus** in discussions of extrabiblical evidence. By contrast, geochemical testing by **Kyle Harper, Michael McCormick, et al.** (*Journal of Archaeological Science: Reports* 30, 2020, 102228), which matched the Nazareth marble slab to Kos and proposed a late first-century BC context involving the tyrant Nikias, and the papyrological commentary of **H. Idris Bell** (1924) and **Victor Tcherikover** (*CPJ* II, 1960) dissociate both imperial documents from first-century Judean Christianity.',
    evaluationLabel: 'Assessment: classification of sources',
    evaluationMd:
      'Listing these eleven records separately, rather than omitting them, keeps the classification of sources transparent. Setting aside the Kos marble ordinance (*SEG* 8:13), the Alexandrian civic papyrus (*P.Lond.* VI 1912), and Maximinus Daia’s lost forgery of AD 311 does not affect the evidence provided by **Josephus**, **Tacitus**, **Pliny**, **Lucian**, **Celsus**, and first-century Judean archaeology; the eight early Christian texts in Appendix A can be read alongside [“Worship of Jesus Before Nicaea: Pre-AD 325 Evidence”](/discover/divinity-timeline) and [“Textual Transmission and Historical Corroboration of the Bible”](/discover/trustworthiness-of-the-bible) to compare internal Christian devotion with external pagan observation.',
  },
];

export const CLOSING = {
  heading: 'Synthesis: Points of Agreement Across the Corpora',
  md:
    'Read with attention to date and source type, the sixteen non-Christian literary witnesses and ten archaeological finds support three historical conclusions across Roman, Judean, Greek, Syriac, and rabbinic corpora:\n\n' +
    '1. **Existence, Palestinian setting, and reputation for healings and wonders:** **Flavius Josephus** (*Antiquities* 20.200 & 18.63–64) attests Jesus’s existence in Judea, his brother James, and his reputation as a “wise man” and teacher within sixty years of Pilate’s prefecture; the Greek phrase “doer of startling deeds,” absent from Agapius’s Arabic paraphrase, is defended as Josephan by Meier (1991). Early Palestinian tradition (*Tosefta Hullin* 2:22–23) attests a healing attempted in the name of Yeshua ben Pantira, and **Celsus** (*Contra Celsum* 1.28, 1.38), **Sossianus Hierocles** (*Against Hierocles* 2), and the **Babylonian Talmud** (*Sanhedrin* 43a) treat the reported wonders as common ground, attributing them to sorcery or comparing them with Apollonius of Tyana.\n\n' +
    '2. **Execution in Judea, with distinct Roman, Judean, Greek, Syriac, and rabbinic emphases:** Execution under Tiberius and Pontius Pilate is recorded by **Tacitus** (*Annals* 15.44) and **Josephus** (*Antiquities* 18.63–64, where both Greek manuscripts and Agapius’s Arabic paraphrase attest Pilate’s crucifixion sentence, while the extant Greek text adds the indictment of Jerusalem’s leading men). **Lucian** (*Peregrinus* 11–13) mocks Christians for worshipping a man crucified in Palestine, and **Celsus** (*Contra Celsum* 2.9, 2.31) presupposes the crucifixion; **Mara bar Serapion** alludes anonymously in Syriac to the Jews executing “their wise King”; and the fifth- to sixth-century Babylonian *baraita* (*Sanhedrin* 43a) depicts a rabbinic-court execution “on the eve of Passover.” The **Caesarea Pilate Stone**, the ossuary inscribed **“Yehosef bar Qayafa,”** and **Yehoḥanan’s crucified heel bone** provide material evidence for the institutional and forensic context.\n\n' +
    '3. **Post-crucifixion persistence and pre-Nicene worship of Christ as divine:** The persistence and punishment of the *Christiani* are recorded by **Tacitus** (*Annals* 15.44, Judea and Neronian Rome) and **Suetonius** (*Nero* 16.2, Neronian Rome; cf. the disturbances linked to *Chresto* under Claudius in *Claudius* 25.4), while **Pliny the Younger** (*Epistles* 10.96, *carmenque Christo quasi deo*), the **Alexamenos Graffito** (`ϹΕΒΕΤΕ ΘΕΟΝ`), **Lucian**, **Celsus** (*Contra Celsum* 8.12), **Porphyry** (in Augustine, *City of God* 19.23), and **Sossianus Hierocles** document Christian worship of Jesus as divine across the two centuries preceding the Council of Nicaea (AD 325).',
};
