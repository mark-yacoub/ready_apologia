/**
 * Philologically verified witness catalog for /discover/extrabiblical-evidence-for-jesus.
 *
 * `src/data/extrabiblical-evidence-for-jesus.json` is owned by `data_collection` and never modified
 * in this repo. Instead, `model.js` locks against the JSON's 5 theme IDs and 52 unique evidence IDs
 * and pairs them with these 40 deduplicated, source-verified witness entries (emitting alias anchors
 * for all 12 merged duplicate slugs so every `#evidence-<id>` permalink resolves uniquely).
 */

export const WITNESSES = [
  // =========================================================================
  // SECTION 1: ROMAN HISTORIANS & PROVINCIAL GOVERNORS (3 authors, 3 cards, 4 IDs)
  // =========================================================================
  {
    id: 'tacitus-annals-15-44',
    aliases: [],
    section: 'roman-records',
    group: 'imperial',
    authorKey: 'tacitus',
    label: 'Publius Cornelius Tacitus — *Annals* 15.44 (c. AD 116)',
    noteMd:
      'Roman senator, consul (AD 97), proconsul of Asia (AD 112–113), and member of the *Quindecimviri sacris faciundis* (the fifteen-man priestly college overseeing foreign cults in Rome). In his account of the Great Fire of Rome in AD 64, Tacitus recounts Emperor Nero’s scapegoating of the city’s Christians and traces the movement’s origin to Judea under Tiberius. Tacitus gives Pontius Pilate the fiscal title *procurator*, current in his own second-century day, whereas Pilate’s first-century limestone dedication ([the Caesarea Pilate Stone](#evidence-pilate-stone)) records his earlier equestrian (Roman knightly-order) title *praefectus Iudaeae* (“prefect of Judea”). (Translation: A. J. Church & W. J. Brodribb, 1876.)',
    originalScript: {
      lang: 'la',
      dir: 'ltr',
      text: 'Auctor nominis eius Christus Tiberio imperitante per procuratorem Pontium Pilatum supplicio adfectus erat; repressaque in praesens exitiabilis superstitio rursum erumpebat, non modo per Iudaeam, originem eius mali, sed per urbem etiam…',
    },
    quote:
      'Consequently, to get rid of the report, Nero fastened the guilt and inflicted the most exquisite tortures on a class hated for their abominations, called Christians by the populace. **Christus, from whom the name had its origin, suffered the extreme penalty during the reign of Tiberius at the hands of one of our procurators, Pontius Pilatus**, and a most mischievous superstition, thus checked for the moment, again broke out not only in Judaea, the first source of the evil, but even in Rome, where all things hideous and shameful from every part of the world find their centre and become popular.',
    chips: [
      {
        label: 'Tacitus, Annals 15.44 (Perseus, tr. Church & Brodribb)',
        href: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0078%3Abook%3D15%3Achapter%3D44',
      },
      {
        label: 'Tacitus, Annals 15.44 (LacusCurtius, tr. Jackson)',
        href: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Tacitus/Annals/15B*.html',
      },
    ],
  },
  {
    id: 'pliny-letters-10-96',
    aliases: ['pliny-the-younger-letters-10-96'],
    section: 'roman-records',
    group: 'imperial',
    authorKey: 'pliny',
    label: 'Gaius Plinius Caecilius Secundus (Pliny the Younger) — *Epistles* 10.96–97 (c. AD 112)',
    noteMd:
      'Roman senator, consul (AD 100), and imperial legate (*legatus Augusti*, provincial governor) of Bithynia-Pontus in northern Asia Minor. Writing officially to Emperor Trajan for legal guidance on prosecuting local Christians, Pliny summarizes testimonies extracted under interrogation (including torture of two female deacons, *ministrae*) regarding Christian pre-dawn assemblies, hymnody addressed to Christ “as to a god” (*quasi deo*), and ethical oaths, followed by Trajan’s rescript (*Epistles* 10.97). (Translation: Naphtali Lewis & Meyer Reinhold, 1955, after William S. Davis, 1913.)',
    originalScript: {
      lang: 'la',
      dir: 'ltr',
      text: '…quod essent soliti stato die ante lucem convenire, carmenque Christo quasi deo dicere secum invicem seque sacramento non in scelus aliquod obstringere…',
    },
    quote:
      'They asserted, however, that the sum and substance of their fault or error had been that **they were accustomed to meet on a fixed day before dawn and sing responsively a hymn to Christ as to a god**, and to bind themselves by oath, not to some crime, but not to commit fraud, theft, or adultery, not falsify their trust, nor to refuse to return a trust when called upon to do so.',
    chips: [
      {
        label: 'Pliny, Epistles 10.96 (Perseus Latin)',
        href: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0139%3Abook%3D10%3Aletter%3D96',
      },
      {
        label: 'Pliny, Letters 10.96–97 (Attalus, tr. Firth)',
        href: 'https://www.attalus.org/old/pliny10b.html',
      },
    ],
  },
  {
    id: 'suetonius-lives-of-the-twelve-caesars',
    aliases: [],
    section: 'roman-records',
    group: 'imperial',
    authorKey: 'suetonius',
    label: 'Gaius Suetonius Tranquillus — *Claudius* 25.4 & *Nero* 16.2 (c. AD 120)',
    noteMd:
      'Roman equestrian biographer, director of the imperial libraries (*a bibliothecis*), and secretary for imperial correspondence (*ab epistulis*) under Emperor Hadrian (*AE* 1953, no. 73). In *Claudius* 25.4, Suetonius records Claudius’s expulsion of Jews from Rome (c. AD 49; cf. [Acts 18:2](/bible/acts/18#2)) over disturbances linked to *Chrestus*. Most classicists (e.g., E. Mary Smallwood, 1976; John P. Meier, 1991; Robert E. Van Voorst, 2000) explain *Chrestus* as a common spelling variant arising from *iotacism* (the merging of Greek vowel sounds in pronunciation), which confused *Christos* (“Anointed”) with the Greek slave name *Chrēstos* (“Useful”), although a minority of historians (e.g., Stephen Benko, 1984) leave open the possibility of an otherwise unattested Roman agitator named Chrestus. In *Nero* 16.2, Suetonius refers to the *Christiani* punished under Nero but does not mention Jesus. (Translation: J. C. Rolfe, Loeb Classical Library, 1914.)',
    originalScript: {
      lang: 'la',
      dir: 'ltr',
      text: 'Iudaeos impulsore Chresto assidue tumultuantis Roma expulit. [Claudius 25.4] · Afflicti suppliciis Christiani, genus hominum superstitionis novae ac maleficae. [Nero 16.2]',
    },
    quote:
      '[Claudius 25.4]: Since the Jews constantly made disturbances **at the instigation of Chrestus, he expelled them from Rome**. [Nero 16.2]: **Punishment was inflicted on the Christians**, a class of men given to a new and mischievous superstition.',
    chips: [
      {
        label: 'Suetonius, Claudius 25.4 (LacusCurtius Latin)',
        href: 'https://penelope.uchicago.edu/Thayer/L/Roman/Texts/Suetonius/12Caesars/Claudius*.html',
      },
      {
        label: 'Suetonius, Claudius 25.4 (LacusCurtius, tr. Rolfe)',
        href: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Claudius*.html',
      },
      {
        label: 'Suetonius, Nero 16.2 (LacusCurtius Latin)',
        href: 'https://penelope.uchicago.edu/Thayer/L/Roman/Texts/Suetonius/12Caesars/Nero*.html',
      },
      {
        label: 'Suetonius, Nero 16.2 (LacusCurtius, tr. Rolfe)',
        href: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Nero*.html',
      },
      {
        label: 'Suetonius, Nero 16.2 (Perseus, tr. Thomson)',
        href: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0132%3Alife%3Dnero%3Achapter%3D16',
      },
      {
        label: 'Acts 18:2',
        href: '/bible/acts/18#2',
      },
    ],
  },

  // =========================================================================
  // SECTION 2: FLAVIUS JOSEPHUS — FIRST-CENTURY JUDEAN HISTORIOGRAPHY (1 author, 2 cards, 2 IDs)
  // =========================================================================
  {
    id: 'josephus-antiquities-20-9-1',
    aliases: [],
    section: 'josephus',
    group: 'antiquities',
    authorKey: 'josephus',
    label: 'Flavius Josephus — *Antiquities of the Jews* 20.9.1 (§200, c. AD 93–94)',
    noteMd:
      'Born Yosef ben Matityahu (AD 37–c. 100), an aristocratic Jerusalem priest and Galilean commander during the First Jewish–Roman War who subsequently wrote in Rome under Flavian imperial patronage. Narrating the brief AD 62 interregnum between the death of procurator Porcius Festus and the arrival of his successor Lucceius Albinus, Josephus recounts how High Priest Ananus ben Ananus convened the Sanhedrin to stone James, identifying him by reference to his better-known brother, “Jesus, who was called Christ.” Because the phrasing (*τοῦ λεγομένου Χριστοῦ*, “who was called Christ”) is non-confessional and integral to Josephus’s account of Ananus’s deposition, the vast majority of textual critics regard this passage as authentic (Louis H. Feldman, 1984; John P. Meier, 1991). (Translation: William Whiston, 1737.)',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: 'καθίζει συνέδριον κριτῶν καὶ παραγαγὼν εἰς αὐτὸ τὸν ἀδελφὸν Ἰησοῦ τοῦ λεγομένου Χριστοῦ, Ἰάκωβος ὄνομα αὐτῷ, καί τινας ἑτέρους… παρέδωκε λευσθησομένους.',
    },
    quote:
      'Festus was now dead, and Albinus was but upon the road; so he assembled the sanhedrim of judges, and **brought before them the brother of Jesus, who was called Christ, whose name was James**, and some others; and when he had formed an accusation against them as breakers of the law, he delivered them to be stoned.',
    chips: [
      {
        label: 'Josephus, Antiquities 20.200 (Perseus Greek, ed. Niese)',
        href: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0145%3Abook%3D20%3Asection%3D200',
      },
      {
        label: 'Josephus, Antiquities 20.9.1 (Perseus, tr. Whiston)',
        href: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0146%3Abook%3D20%3Awhiston+chapter%3D9%3Awhiston+section%3D1',
      },
      {
        label: 'Josephus, Antiquities 20.9.1 (CCEL)',
        href: 'https://www.ccel.org/ccel/josephus/works/files/ant-20.htm',
      },
    ],
  },
  {
    id: 'josephus-antiquities-18-3-3',
    aliases: [],
    section: 'josephus',
    group: 'antiquities',
    authorKey: 'josephus',
    label: 'Flavius Josephus — *Antiquities of the Jews* 18.3.3 (§§63–64, *Testimonium Flavianum*, c. AD 93–94)',
    noteMd:
      'Earlier in *Antiquities* (Book 18, within a sequence of Judean disturbances under Pontius Pilate), all extant medieval Greek manuscripts contain a paragraph on Jesus’s teaching, startling deeds, crucifixion under Pilate, and the continued existence of his followers. Most historians (e.g., Geza Vermes, 1973; John P. Meier, 1991; Robert E. Van Voorst, 2000) reconstruct an authentic Josephan core overlaid with three brief Christian scribal interpolations. In 1971 Shlomo Pines published a tenth-century Arabic paraphrase in Bishop Agapius of Hierapolis’s *Kitāb al-ʿUnwān*, which Alice Whealey (*Josephus on Jesus*, 2003; *New Testament Studies* 54, 2008) traced to a Syriac translation of the fourth-century church historian Eusebius’s *Church History* (cf. twelfth-century Syriac Orthodox patriarch and chronicler Michael the Syrian). Agapius’s version omits “doer of startling deeds” and “at the indictment of the first men among us,” retains Jesus’s wisdom, Pilate’s crucifixion sentence, the disciples’ appearance report, and a hedged “he was perhaps the Messiah,” and preserves less confessional phrasing that Pines and several scholars take to reflect an earlier form of the passage. In the Greek text, *παραδόξων ἔργων ποιητής* (“doer of startling deeds”) parallels Josephus’s characterization of Elisha in *Antiquities* 9.182 (cf. *παράδοξα* applied to Moses in *Antiquities* 2.267, 2.345). (Blockquote translation: William Whiston, 1737.)',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: 'Γίνεται δὲ κατὰ τοῦτον τὸν χρόνον Ἰησοῦς σοφὸς ἀνήρ, εἴγε ἄνδρα αὐτὸν λέγειν χρή· ἦν γὰρ παραδόξων ἔργων ποιητής, διδάσκαλος ἀνθρώπων τῶν ἡδονῇ τἀληθῆ δεχομένων, καὶ πολλοὺς μὲν Ἰουδαίους, πολλοὺς δὲ καὶ τοῦ Ἑλληνικοῦ ἐπηγάγετο· ὁ χριστὸς οὗτος ἦν. καὶ αὐτὸν ἐνδείξει τῶν πρώτων ἀνδρῶν παρ᾽ ἡμῖν σταυρῷ ἐπιτετιμηκότος Πιλάτου οὐκ ἐπαύσαντο οἱ τὸ πρῶτον ἀγαπήσαντες· ἐφάνη γὰρ αὐτοῖς τρίτην ἔχων ἡμέραν πάλιν ζῶν τῶν θείων προφητῶν ταῦτά τε καὶ ἄλλα μυρία περὶ αὐτοῦ θαυμάσια εἰρηκότων. εἰς ἔτι τε νῦν τῶν Χριστιανῶν ἀπὸ τοῦδε ὠνομασμένον οὐκ ἐπέλιπε τὸ φῦλον.',
    },
    quote:
      'Now there was about this time **Jesus, a wise man**, if it be lawful to call him a man; for he was a doer of wonderful works, a teacher of such men as receive the truth with pleasure. He drew over to him both many of the Jews and many of the Gentiles. He was [the] Christ. And when **Pilate**, at the suggestion of the principal men amongst us, **had condemned him to the cross, those that loved him at the first did not forsake him**; for he appeared to them alive again the third day; as the divine prophets had foretold these and ten thousand other wonderful things concerning him. **And the tribe of Christians, so named from him, are not extinct at this day.**',
    redline: {
      caption: 'Textual comparison: extant Greek manuscripts vs. Agapius’s tenth-century Arabic paraphrase',
      a: {
        label: 'Extant Greek MSS (Ant. 18.63–64, tr. after L. H. Feldman, LCL 1965; suspected Christian glosses marked)',
        ref: {
          label: 'Perseus Greek (ed. Niese)',
          href: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0145%3Abook%3D18%3Asection%3D63',
        },
        htmlMd:
          'Now there was about this time Jesus, a wise man, <mark>if it be lawful to call him a man;</mark> for he was a doer of startling deeds, a teacher of people who receive the truth with pleasure… <mark>He was the Christ.</mark> And when Pilate, upon the indictment of the first men among us, had condemned him to the cross, those who had loved him from the first did not cease; <mark>for he appeared to them on the third day living again, the divine prophets having spoken these and myriad other wondrous things about him.</mark> And up to the present the tribe of Christians, named from this person, has not disappeared.',
      },
      b: {
        label: 'Agapius of Hierapolis, Kitāb al-ʿUnwān (10th c. Arabic paraphrase; tr. Pines 1971, p. 16)',
        ref: {
          label: 'Pines (1971), Agapius Arabic Study',
          href: 'https://archive.org/details/arabicversionoft0000pine',
        },
        htmlMd:
          'At this time there was a wise man who was called Jesus. And his conduct was good, and [he] was known to be virtuous. And many people from among the Jews and the other nations became his disciples. Pilate condemned him to be crucified and to die. And those who had become his disciples did not abandon his discipleship. They reported that he had appeared to them three days after his crucifixion and that he was alive; accordingly he was perhaps the Messiah concerning whom the prophets have recounted wonders.',
      },
      noteMd:
        'Highlighted clauses in the Greek column mark the three phrases widely regarded as Christian scribal additions or modifications on the basis of the third-century Alexandrian Christian scholar Origen’s testimony that Josephus “did not believe in Jesus as the Christ” (*Contra Celsum* 1.47) and the less confessional wording preserved in the Syriac and Arabic Eusebian tradition (Michael the Syrian; Agapius, ed. Pines 1971; Whealey 2003).',
    },
    chips: [
      {
        label: 'Josephus, Antiquities 18.63–64 (Perseus Greek, ed. Niese)',
        href: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0145%3Abook%3D18%3Asection%3D63',
      },
      {
        label: 'Josephus, Antiquities 18.3.3 (Perseus, tr. Whiston)',
        href: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0146%3Abook%3D18%3Asection%3D63',
      },
      {
        label: 'Pines (1971) — Agapius Arabic Study (Archive.org)',
        href: 'https://archive.org/details/arabicversionoft0000pine',
      },
    ],
  },

  // =========================================================================
  // SECTION 3: GREEK, SYRIAN, AND ROMAN AUTHORS (10 authors, 10 cards, 20 IDs)
  // =========================================================================
  {
    id: 'lucian-peregrinus',
    aliases: ['lucian-of-samosata-peregrinus', 'lucian-peregrinus-13'],
    section: 'pagan-critics',
    group: 'pagan',
    authorKey: 'lucian',
    label: 'Lucian of Samosata — *The Passing of Peregrinus* 11–13 (c. AD 165–170)',
    noteMd:
      'Syrian-Greek rhetorician and Epicurean-leaning satirist from Commagene on the Euphrates. Ridiculing the Cynic philosopher Peregrinus Proteus—who briefly profited from Christian hospitality in Palestine—Lucian mocks Christians for worshipping “the man who was crucified in Palestine” (§11) and “that crucified sophist himself” (§13, tr. A. M. Harmon, LCL 1936) and for living by his laws as brothers. (Blockquote translation: H. W. Fowler & F. G. Fowler, *Works of Lucian of Samosata*, vol. 4, 1905, pp. 82–83.)',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: '…ἐκεῖνον ὃν ἔτι σέβουσι, τὸν ἄνθρωπον τὸν ἐν τῇ Παλαιστίνῃ ἀνασκολοπισθέντα, ὅτι καινὴν ταύτην τελετὴν εἰσῆγεν ἐς τὸν βίον. [§11] · …θεοὺς μὲν τοὺς Ἑλληνικοὺς ἀπαρνήσωνται, τὸν δὲ ἀνεσκολοπισμένον ἐκεῖνον σοφιστὴν αὐτὸν προσκυνῶσιν καὶ κατὰ τοὺς ἐκείνου νόμους βιῶσιν. [§13]',
    },
    quote:
      'The Christians, you know, **worship a man to this day—the distinguished personage who introduced their novel rites, and was crucified on that account**… You see, these misguided creatures start with the general conviction that they are immortal for all time, which explains the contempt of death and voluntary self-devotion which are so common among them; and then it was impressed on them by their original lawgiver that they are all brothers, from the moment that they are converted, and deny the gods of Greece, and **worship the crucified sage**, and live after his laws.',
    chips: [
      {
        label: 'Lucian, Peregrinus 11 (Perseus Greek, ed. Harmon)',
        href: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A2008.01.0461%3Asection%3D11',
      },
      {
        label: 'Lucian, Peregrinus 11–13 (tr. Fowler & Fowler, 1905)',
        href: 'https://archive.org/details/worksoflucianofs04luciuoft',
      },
    ],
  },
  {
    id: 'mara-bar-serapion',
    aliases: ['mara-bar-serapion-letter-to-serapion'],
    section: 'pagan-critics',
    group: 'pagan',
    authorKey: 'mara',
    label: 'Mara bar Serapion — *Letter to His Son Serapion* (post-AD 73; late 1st to 3rd c. AD)',
    noteMd:
      'Syriac-speaking Stoic writer from Samosata, writing from Roman captivity after Rome’s annexation of Commagene. Historians date the letter between shortly after AD 73 and the third century AD (Fergus Millar, 1993; Annette Merz & Teun Tieleman, 2012); it is extant in a sixth- or seventh-century Syriac manuscript (British Library Add. MS 14658), edited by William Cureton (1855). Mara names neither Jesus nor Roman authorities; he refers anonymously to the Jews executing “their wise King” alongside the Athenians executing Socrates and the Samians burning Pythagoras, links that death to the loss of the Jewish kingdom, and states that the king lived on in the teaching he had given. (Translation: Robert E. Van Voorst, 2000, after William Cureton, 1855.)',
    quote:
      'What advantage did the Athenians gain from putting Socrates to death? Famine and plague came upon them as a judgment for their crime. What advantage did the men of Samos gain from burning Pythagoras? In a moment their land was covered with sand. **What advantage did the Jews gain from executing their wise King?** It was just after that that their kingdom was abolished… Nor did the wise King die for good; **he lived on in the teaching which he had given**.',
    chips: [
      {
        label: 'Cureton, Spicilegium Syriacum (1855)',
        href: 'https://archive.org/details/spicilegiumsyria00cureuoft',
      },
      {
        label: 'Mara bar Serapion (Early Christian Writings)',
        href: 'https://www.earlychristianwritings.com/text/mara.html',
      },
    ],
  },
  {
    id: 'celsus-contra-celsum',
    aliases: ['celsus-contra-celsum-1-28'],
    section: 'pagan-critics',
    group: 'pagan',
    authorKey: 'celsus',
    label: 'Celsus — *The True Word* (*Alēthēs Logos*, c. AD 175–178, via Origen, *Contra Celsum*)',
    noteMd:
      'Second-century Greek Middle Platonist philosopher who composed a comprehensive pagan critique of Christianity, preserved in verbatim quotations by the third-century Alexandrian Christian scholar Origen (*Contra Celsum*, c. AD 248). Speaking first through the literary persona of a Jewish interlocutor (1.28, 2.55) and later in his own voice (8.12), Celsus criticizes Jesus’s humble Judean birth (1.28) and attributes his reported healings and wonders to Egyptian sorcery (1.28, 1.38). He treats the crucifixion as common ground (2.9, 2.31), dismisses the post-resurrection appearance reports beginning with Mary Magdalene as wish-fulfilling hallucinations (2.55), and objects that Christians render extravagant worship to Christ alongside the Most High God (8.12). (Translations: 1.28 tr. Frederick Crombie, *ANF* 4, 1885; 2.55 & 8.12 tr. Henry Chadwick, 1953.)',
    quote:
      '[1.28]: …he (Jesus), **having been brought up as an illegitimate child, and having served for hire in Egypt, and then coming to the knowledge of certain miraculous powers**, returned from thence to his own country, and **by means of those powers proclaimed himself a god**… [2.55]: Who saw this? **A hysterical female**, as you say, and perhaps some other one of those who were deluded by the same sorcery, who either dreamed in a certain state of mind and through wishful thinking had a hallucination due to some mistaken notion… [8.12]: If these men worshipped no other God but one, perhaps they would have a valid argument against the others. But in fact **they worship to an extravagant degree this man who appeared recently**, and yet think it is not inconsistent with monotheism if they also worship His servant.',
    chips: [
      {
        label: 'Origen, Contra Celsum Book 1 (New Advent)',
        href: 'https://www.newadvent.org/fathers/04161.htm',
      },
      {
        label: 'Origen, Contra Celsum Book 2 (New Advent)',
        href: 'https://www.newadvent.org/fathers/04162.htm',
      },
      {
        label: 'Origen, Contra Celsum Book 8 (New Advent)',
        href: 'https://www.newadvent.org/fathers/04168.htm',
      },
    ],
  },
  {
    id: 'thallus-histories',
    aliases: [],
    section: 'pagan-critics',
    group: 'pagan',
    authorKey: 'thallus',
    label: 'Thallus — *Histories*, Book 3 (mid-1st to early 2nd c. AD, via Julius Africanus in Syncellus)',
    noteMd:
      'Greek-writing chronicler whose lost three-book *Histories* is preserved solely at two removes: paraphrased by the Christian chronicler Sextus Julius Africanus (*Chronography*, Frag. 18.1, c. AD 221) as quoted by the Byzantine chronicler George Syncellus (c. AD 800). Thallus’s indirect fragment names neither Jesus nor Judea. Africanus identifies a solar eclipse (*ἔκλειψις ἡλίου*) recorded in Book 3 of Thallus’s *Histories* with the darkness at the Passion in the Gospels and objects that Passover falls at full moon (Robert E. Van Voorst, 2000; Richard Carrier, *JGRChJ* 8, 2011–2012). Eusebius’s *Chronicle* (Armenian version) sets the chronological endpoint (*terminus*) of Thallus’s work at the 167th Olympiad (109 BC, often emended by Karl Müller and Felix Jacoby, *FGrHist* 256, to the 207th Olympiad, AD 49–52), while a mid-first-century Roman identification rests on a conjectural emendation of Josephus, *Antiquities* 18.167 (*ἄλλος* → *Θαλλός*). (Translation: S. D. F. Salmond, *ANF* 6, 1886.)',
    quote:
      'On the whole world there pressed a most fearful darkness; and the rocks were rent by an earthquake, and many places in Judea and other districts were thrown down. **This darkness Thallus, in the third book of his History, calls, as appears to me without reason, an eclipse of the sun.** For the Hebrews celebrate the passover on the 14th day according to the moon, and the passion of our Saviour falls on the day before the passover; but an eclipse of the sun takes place only when the moon comes under the sun.',
    chips: [
      {
        label: 'Julius Africanus, Frag. 18 (New Advent)',
        href: 'https://www.newadvent.org/fathers/0614.htm',
      },
      {
        label: 'Julius Africanus Fragments (Early Christian Writings)',
        href: 'https://www.earlychristianwritings.com/juliusafricanus.html',
      },
    ],
  },
  {
    id: 'phlegon-of-tralles-olympiads',
    aliases: ['phlegon-olympiads'],
    section: 'pagan-critics',
    group: 'pagan',
    authorKey: 'phlegon',
    label: 'Phlegon of Tralles — *Olympiads* (*Chronicles*, c. AD 137–140, via Eusebius/Jerome, Africanus & Origen)',
    noteMd:
      'Greek freedman of Emperor Hadrian who compiled a sixteen-book Olympiad chronicle down to AD 137, preserved across three Christian witnesses. First, **Eusebius’s *Chronicle*** (Jerome’s Latin and the Armenian version, *FGrHist* 257 F 16e; cf. Origen, *Contra Celsum* 2.33) quotes Phlegon on a sixth-hour solar eclipse and a Bithynian earthquake toppling much of Nicaea in the fourth year of the 202nd Olympiad (AD 32/33; astronomically compared with the Bithynian eclipse of November 24, AD 29), a notice that mentions neither Jesus nor Judea. Second, **Julius Africanus** (*Chronography* 18.1, in Syncellus) summarizes Phlegon’s eclipse under Tiberius, adding the words “at full moon,” which are generally regarded as his own gloss (cf. Origen, *Contra Celsum* 2.33). Third, **Origen** (*Contra Celsum* 2.14) states that Phlegon named Jesus in Book 13 or 14, ascribing foreknowledge of future events to him while confusing episodes about Peter with Jesus (whereas a remark on nail-pierced hands in *Contra Celsum* 2.59 belongs to Origen’s own voice). (Translations: Salmond, *ANF* 6, 1886; Crombie, *ANF* 4, 1885.)',
    quote:
      '[Africanus, Chronography 18.1]: **Phlegon records that, in the time of Tiberius Caesar, at full moon, there was a full eclipse of the sun from the sixth hour to the ninth**… [Origen, Contra Celsum 2.14]: Now **Phlegon, in the thirteenth or fourteenth book, I think, of his Chronicles, not only ascribed to Jesus a knowledge of future events** (although falling into confusion about some things which refer to Peter, as if they referred to Jesus), **but also testified that the result corresponded to His predictions**.',
    chips: [
      {
        label: 'Eusebius/Jerome, Chronicle (ed. Helm, GCS 7)',
        href: 'https://archive.org/details/p1eusebiuswer07euse',
      },
      {
        label: 'Origen, Contra Celsum 2.14 & 2.33 (New Advent)',
        href: 'https://www.newadvent.org/fathers/04162.htm',
      },
      {
        label: 'Africanus, Chronography Frag. 18 (New Advent)',
        href: 'https://www.newadvent.org/fathers/0614.htm',
      },
    ],
  },
  {
    id: 'galen-de-pulsuum',
    aliases: ['galen-of-pergamum-de-pulsuum'],
    section: 'pagan-critics',
    group: 'pagan',
    authorKey: 'galen',
    label: 'Galen of Pergamum — *De Pulsuum Differentiis* 2.4, 3.3 & *Summary of Plato’s Republic* (c. AD 170–200)',
    noteMd:
      'Prominent Greek physician and philosopher in Rome, court doctor to Emperors Marcus Aurelius, Commodus, and Septimius Severus. In two passages of a single extant Greek medical treatise on the pulse (*De Pulsuum Differentiis* 2.4 & 3.3, ed. Kühn VIII 579, 657), Galen criticizes members of “the school of Moses and Christ” for accepting undemonstrated laws on trust. Separately, a fragment of Galen’s lost *Summary of Plato’s Republic*, preserved in Arabic by the fourteenth-century Syrian historian Abū al-Fidāʾ (d. AD 1331; ed. and tr. Richard Walzer, *Galen on Jews and Christians*, Oxford University Press, 1949), observes that Christians rely on parables and miracles, though they display philosophical self-restraint and courage in the face of death. (Translations: Richard Walzer, 1949.)',
    quote:
      '[De Pulsuum Differentiis 3.3]: One might more easily teach novelties to **the followers of Moses and Christ** than to the physicians and philosophers who cling fast to their schools… [Summary of Plato’s Republic, tr. Walzer]: Most people are unable to follow any demonstrative argument consecutively; hence they need parables, and benefit from them—just as now we see **the people called Christians drawing their faith from parables [and miracles], and yet sometimes acting in the same way [as those who philosophize]**. For their contempt of death [and of its sequel] is patent to us every day.',
    chips: [
      {
        label: 'Galen, De Pulsuum Differentiis (ed. Kühn VIII, 1824)',
        href: 'https://archive.org/details/b29339339_0008',
      },
      {
        label: 'Walzer, Galen on Jews and Christians (1949, Archive.org)',
        href: 'https://archive.org/details/galenonjewschris0000rich',
      },
    ],
  },
  {
    id: 'marcus-aurelius-meditations-11-3',
    aliases: [],
    section: 'pagan-critics',
    group: 'pagan',
    authorKey: 'marcus-aurelius',
    label: 'Marcus Aurelius — *Meditations* 11.3 (c. AD 170–180)',
    noteMd:
      'Roman Emperor (r. AD 161–180) and Stoic philosopher, under whose reign Christian martyrdoms occurred at Rome (Justin Martyr) and Lugdunum (Lyon, AD 177). Without naming Jesus, Marcus contrasts calm Stoic readiness for death with what he characterizes as obstinate, theatrical defiance “like the Christians” (*ὡς οἱ Χριστιανοί*). Both independent textual witnesses to Book 11—Codex Vaticanus Graecus 1950 and Wilhelm Xylander’s 1559 *editio princeps* (first printed edition, made from a lost Palatine manuscript)—contain the phrase, though several classicists (C. R. Haines, 1916; P. A. Brunt, 1979) have debated whether those three Greek words stood in Marcus’s notebook or entered as an early scholiast’s (marginal commentator’s) gloss. (Translation: George Long, rev. ed. 1869.)',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: 'μὴ κατὰ ψιλὴν παράταξιν ὡς οἱ Χριστιανοί, ἀλλὰ λελογισμένως καὶ σεμνῶς καὶ ὥστε καὶ ἄλλον πεῖσαι, ἀτραγῴδως.',
    },
    quote:
      'What a soul that is which is ready, if at any moment it must be separated from the body, and ready either to be extinguished or dispersed or continue to exist; but so that this readiness comes from a man’s own judgement, **not from mere obstinacy, as with the Christians**, but considerately and with dignity and in a way to persuade another, without tragic show.',
    chips: [
      {
        label: 'Marcus Aurelius, Meditations 11.3 (Perseus Greek)',
        href: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A2008.01.0641%3Abook%3D11%3Achapter%3D3%3Asection%3D1',
      },
      {
        label: 'Marcus Aurelius, Meditations 11 (tr. Long, MIT Classics)',
        href: 'https://classics.mit.edu/Antoninus/meditations.11.eleven.html',
      },
    ],
  },
  {
    id: 'numenius-on-the-good',
    aliases: [],
    section: 'pagan-critics',
    group: 'pagan',
    authorKey: 'numenius',
    label: 'Numenius of Apamea — *On the Good*, Book 3 (mid-2nd c. AD, via Origen, *Contra Celsum* 4.51)',
    noteMd:
      'Second-century Syrian Neopythagorean and Platonist philosopher whose writings influenced Plotinus. Numenius’s remark is preserved solely in an indirect paraphrase by Origen (*Contra Celsum* 4.51), not as a verbatim quotation: Origen reports that Numenius cited Moses and the Hebrew prophets respectfully and, in Book 3 of his lost treatise *On the Good*, recounted a narrative about Jesus without naming him and interpreted it allegorically. (Translation: Frederick Crombie, *ANF* 4, 1885.)',
    quote:
      'I know, moreover, that Numenius the Pythagorean—a surpassingly excellent expounder of Plato, and who held a foremost place as a teacher of the doctrines of Pythagoras—in many of his works quotes from the writings of Moses and the prophets, and applies to the passages in question a not improbable allegorical meaning… And **in the third book of his dissertation on *The Good*, he quotes also a narrative regarding Jesus—without, however, mentioning His name—and gives it an allegorical signification**, whether successfully or the reverse I may state on another occasion.',
    chips: [
      {
        label: 'Origen, Contra Celsum 4.51 (CCEL)',
        href: 'https://www.ccel.org/ccel/schaff/anf04.vi.ix.iv.li.html',
      },
      {
        label: 'Origen, Contra Celsum Book 4 (New Advent)',
        href: 'https://www.newadvent.org/fathers/04164.htm',
      },
    ],
  },
  {
    id: 'porphyry-against-christians',
    aliases: ['porphyry-of-tyre-against-christians', 'porphyry-city-of-god-19-23'],
    section: 'pagan-critics',
    group: 'pagan',
    authorKey: 'porphyry',
    label: 'Porphyry of Tyre — *Philosophy from Oracles* & *Against the Christians* (c. AD 270–300)',
    noteMd:
      'Third-century Neoplatonist philosopher, student and editor of Plotinus, and author of a fifteen-book critique *Against the Christians* (condemned to burning under Constantine and Theodosius II) as well as *Philosophy from Oracles*. In a passage preserved in Latin by Augustine of Hippo (*City of God* 19.23), Porphyry cites oracles of Apollo and Hecate that characterize Jesus as a pious human sage whose soul was dowered with immortality after death, and criticizes his Christian followers for worshipping him as God rather than honoring the traditional gods. Additional Greek criticisms associated with Porphyry’s tradition are preserved in Macarius Magnes’s fourth-century *Apocriticus*. (Translation: Marcus Dods, *NPNF*¹ 2, 1887.)',
    quote:
      '[Augustine, City of God 19.23, quoting Porphyry’s Philosophy from Oracles]: To one who inquired what god he should propitiate in order to recall his wife from Christianity, Apollo replied in the following verses… But to some who asked Hecate whether Christ were a God, she replied, “You know the condition of the disembodied immortal soul, and that if it has been severed from wisdom it always errs. **The soul you refer to is that of a man foremost in piety: they worship it because they mistake the truth.**” To this so-called oracular response he adds the following words of his own: “**Of this very pious man, then, Hecate said that the soul, like the souls of other good men, was after death dowered with immortality, and that the Christians through ignorance worship it.**”',
    chips: [
      {
        label: 'Augustine, City of God 19.23 (New Advent)',
        href: 'https://www.newadvent.org/fathers/120119.htm',
      },
      {
        label: 'Macarius Magnes, Apocriticus (tr. Crafer, 1919)',
        href: 'https://archive.org/details/apocriticusofmac00macauoft',
      },
    ],
  },
  {
    id: 'sossianus-hierocles-against-hierocles-2',
    aliases: ['sossianus-hierocles', 'sossianus-hierocles-lover-of-truth'],
    section: 'pagan-critics',
    group: 'pagan',
    authorKey: 'hierocles',
    label: 'Sossianus Hierocles — *Lover of Truth* (*Philalēthēs*, c. AD 303, via Eusebius, *Against Hierocles* 2)',
    noteMd:
      'Roman imperial governor of Bithynia and later Prefect of Egypt, one of the principal administrative architects of Emperor Diocletian’s Great Persecution (AD 303). In his treatise *Lover of Truth*, answered directly by Eusebius of Caesarea (*Against Hierocles*), Hierocles sets the first-century Neopythagorean wonderworker Apollonius of Tyana beside Jesus: rather than questioning Jesus’s existence or reported wonders (such as restoring sight to the blind), Hierocles objects that Christians proclaim Jesus “a god” on the strength of “a few miracles,” whereas pagans regard Apollonius simply as a man pleasing to the gods. (Translation: F. C. Conybeare, Loeb Classical Library, 1912.)',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: 'εἴπερ ἡμεῖς μὲν τὸν τὰ τοιαῦτα πεποιηκότα οὐ θεόν, ἀλλὰ θεοῖς κεχαρισμένον ἄνδρα ἡγούμεθα, οἱ δὲ δι᾽ ὀλίγας τερατείας τινὰς τὸν Ἰησοῦν θεὸν ἀναγορεύουσι.',
    },
    quote:
      'In their anxiety to exalt Jesus, they run up and down prating of how he made the blind to see and worked certain other miracles of the kind… Let us note however how much better and more sensible is the view which we take of such matters, and explain the conception which we entertain of men gifted with remarkable powers… **What then is my reason for mentioning these facts? It was in order that you may be able to contrast our own accurate and well-established judgment on each point, with the easy credulity of the Christians. For whereas we reckon him who wrought such feats not a god, but only a man pleasing to the gods, they on the strength of a few miracles proclaim their Jesus a god.**',
    chips: [
      {
        label: 'Eusebius, Against Hierocles 2 (tr. Conybeare, LCL 1912)',
        href: 'https://archive.org/details/lifeofapolloniu02phil',
      },
    ],
  },

  // =========================================================================
  // SECTION 4: RABBINIC LITERATURE — TOSEFTA & BABYLONIAN TALMUD (2 compilations, 4 cards, 5 IDs)
  // =========================================================================
  {
    id: 'tosefta-hullin-talmud-abodah-zarah-27b',
    aliases: [],
    section: 'rabbinic-sources',
    group: 'rabbinic',
    authorKey: 'tosefta',
    label: 'Tosefta *Hullin* 2:22–23 (c. AD 200–250; Sefaria 2:6; parallel *b. Avodah Zarah* 27b)',
    noteMd:
      'Compiled in Roman Palestine in the early third century AD, the *Tosefta* (“Supplement” to the *Mishnah*) preserves Tannaitic (first- and second-century) rabbinic traditions. When Rabbi Eleazar ben Dama (early second century AD, nephew of Rabbi Ishmael) was bitten by a viper, Jacob of Kefar Sama (*t. Hullin* 2:24 and *b. Avodah Zarah* 27b read *Kefar Sekhanya*/*Sikhnin*, a village whose exact spelling and location are debated) came to heal him “in the name of Yeshua ben Pantira” (*פנטירא*; *Pandera*, *פנדירא*, in *b. Avodah Zarah* 27b), which Rabbi Ishmael forbade under restrictions against *minim* (Jewish sectarians). Historians link *Yeshua ben Pantira* to Jesus of Nazareth because the pagan philosopher Celsus (*Contra Celsum* 1.32, c. AD 177) independently reports the Jewish counter-tradition patronymic *Panthera* for Jesus’s alleged father, and the adjacent story in *t. Hullin* 2:24 connects the same Jacob to a legal teaching transmitted in Sepphoris in the name of *Yeshua ben Pantiri* (Peter Schäfer, *Jesus in the Talmud*, 2007). M. S. Zuckermandel’s critical edition numbers this passage 2:22–23, whereas Sefaria’s seven-segment chapter division places it at 2:6; there the censored early modern printings omit the name, and Sefaria supplies the uncensored reading of MS Vienna in parentheses. (Translation: after Peter Schäfer, 2007.)',
    originalScript: {
      lang: 'he',
      dir: 'rtl',
      text: 'מעשה ברבי אלעזר בן דמא שנשכו נחש ובא יעקב איש כפר סמא לרפאותו משום ישוע בן פנטירא ולא הניחו רבי ישמעאל.',
    },
    quote:
      'It happened with Rabbi Eleazar ben Dama that a serpent bit him, and **Jacob, a man of Kefar Sama, came to heal him in the name of Yeshua ben Pantira**, and Rabbi Ishmael did not permit him. He said to him: “You are not permitted, Ben Dama.” He said to him: “I will bring you a proof that he may heal me,” and he did not suffice to bring proof before he died.',
    chips: [
      {
        label: 'Tosefta Hullin 2:22–23 / Sefaria 2:6 (MS Vienna note)',
        href: 'https://www.sefaria.org/Tosefta_Chullin.2.6?lang=bi',
      },
      {
        label: 'Babylonian Talmud, Avodah Zarah 27b (Sefaria)',
        href: 'https://www.sefaria.org/Avodah_Zarah.27b?lang=bi',
      },
    ],
  },
  {
    id: 'babylonian-talmud-sanhedrin-43a',
    aliases: ['babylonian-talmud-sanhedrin-43a-107b'],
    section: 'rabbinic-sources',
    group: 'rabbinic',
    authorKey: 'babylonian-talmud',
    label: 'Babylonian Talmud — *Sanhedrin* 43a (Uncensored *Baraita* in Munich MS 95 & Florence II.1.8–9)',
    noteMd:
      'Redacted in Sasanian Babylonia in the fifth to sixth centuries AD, the Babylonian Talmud preserves an anonymous *baraita* (a Tannaitic tradition not included in the *Mishnah*) in uncensored medieval manuscripts (Munich Codex Hebraicus 95, Florence II.1.8–9, and Jerusalem Herzog 1; excised from printed editions beginning with the 1578–1581 Basel printing). The passage depicts a rabbinic-court stoning (*lissaqēl*) followed by posthumous hanging (*telaʾuhu*), matching the legal sequence of *m. Sanhedrin* 6:4; **Peter Schäfer** (*Jesus in the Talmud*, 2007) reads it as a late literary counter-narrative to the Gospel Passion accounts rather than an independent first-century trial record, although it presupposes that “Yeshu the Nazarene” was executed “on the eve of Passover” and attributes his deeds to “sorcery” (*kishuf*). (Translation: after Peter Schäfer, 2007.)',
    originalScript: {
      lang: 'he',
      dir: 'rtl',
      text: 'בערב הפסח תלאוהו לישו הנוצרי והכרוז יוצא לפניו ארבעים יום ישו הנוצרי יוצא ליסקל על שכישף והסית והדיח את ישראל.',
    },
    quote:
      'It was taught: **On the eve of Passover they hanged Yeshu the Nazarene.** And a herald went out before him for forty days: “Yeshu the Nazarene is going forth to be stoned **because he practiced sorcery and enticed and led Israel astray**. Anyone who knows anything in his favor, let him come and plead on his behalf.” And they found nothing in his favor, **and they hanged him on the eve of Passover**.',
    chips: [
      {
        label: 'Babylonian Talmud, Sanhedrin 43a (Sefaria)',
        href: 'https://www.sefaria.org/Sanhedrin.43a?lang=bi',
      },
    ],
  },
  {
    id: 'tosefta-talmud-sanhedrin-107b',
    aliases: [],
    section: 'rabbinic-sources',
    group: 'rabbinic',
    authorKey: 'babylonian-talmud',
    label: 'Babylonian Talmud — *Sanhedrin* 107b & *Sotah* 47a (Uncensored Gemara)',
    noteMd:
      'This narrative belongs to the Babylonian *Gemara* rather than the *Tosefta* and is preserved in uncensored manuscripts of *b. Sanhedrin* 107b and *b. Sotah* 47a. Illustrating why teachers should not spurn disciples harshly, the story places “Yeshu the Nazarene” about a century before Jesus’s lifetime, as a pupil of Rabbi Yehoshua ben Perachiah during a flight to Alexandria under the Hasmonean king Alexander Jannaeus (r. 103–76 BC). Such chronological displacement is characteristic of late Babylonian rabbinic storytelling (Schäfer, 2007), and the tale concludes with the formulaic charge that Yeshu practiced sorcery and led Israel astray (a separate motif linking Ben Stada / Ben Pandera with spells brought from Egypt appears in *b. Shabbat* 104b). (Translation: after Peter Schäfer, 2007.)',
    originalScript: {
      lang: 'he',
      dir: 'rtl',
      text: 'ולא כיהושע בן פרחיה שדחפו לישו הנוצרי בשתי ידים… ואמר מר ישו [הנוצרי] כישף והסית והדיח את ישראל.',
    },
    quote:
      'Never should the left hand push away without the right hand drawing near—not like Elisha who pushed Gehazi away with both hands, and **not like Yehoshua ben Perachiah who pushed Yeshu the Nazarene away with both hands**… And a Master said: **Yeshu the Nazarene practiced sorcery, and enticed, and led Israel astray.**',
    chips: [
      {
        label: 'Babylonian Talmud, Sanhedrin 107b (Sefaria)',
        href: 'https://www.sefaria.org/Sanhedrin.107b?lang=bi',
      },
      {
        label: 'Babylonian Talmud, Sotah 47a (Sefaria)',
        href: 'https://www.sefaria.org/Sotah.47a?lang=bi',
      },
    ],
  },
  {
    id: 'babylonian-talmud-gittin-57a',
    aliases: [],
    section: 'rabbinic-sources',
    group: 'rabbinic',
    authorKey: 'babylonian-talmud',
    label: 'Babylonian Talmud — *Gittin* 57a (Uncensored Munich MS 95)',
    noteMd:
      'An Amoraic (third- to fifth-century rabbinic era) *aggadic* (homiletic narrative) dialogue in the Babylonian Talmud. It depicts the prospective Roman convert Onkelos summoning by necromancy three figures portrayed as enemies of Israel: Titus (who razed the Temple), Balaam, and Yeshu (so in uncensored manuscripts such as Munich MS 95; censored Vilna printings substitute “the sinners of Israel”). **Schäfer** (2007) reads this late passage as a literary parody of Christian Eucharistic imagery; it presupposes Yeshu’s death and contrasts his teaching with rabbinic law (“mocking the words of the Sages”). (Translation: after Peter Schäfer, 2007.)',
    originalScript: {
      lang: 'arc',
      dir: 'rtl',
      text: 'אזל אסקיה בנגידא לישו הנוצרי אמר ליה מאן חשיב בההוא עלמא אמר ליה ישראל… דאמר מר כל המלעיג על דברי חכמים נידון בצואה רותחת.',
    },
    quote:
      'He went and **raised Yeshu [censored printings: the sinners of Israel] by necromancy**. He asked him: “Who is important in that world?” He replied: “Israel.” “Should I join them?” He replied: “Seek their welfare, seek not their harm; whoever touches them touches the apple of His eye.” He asked: “What is your judgment?” He replied: “In boiling excrement, for a Master said: **Whoever mocks the words of the Sages is judged in boiling excrement.**”',
    chips: [
      {
        label: 'Babylonian Talmud, Gittin 57a (Sefaria)',
        href: 'https://www.sefaria.org/Gittin.57a?lang=bi',
      },
    ],
  },

  // =========================================================================
  // SECTION 5: ARCHAEOLOGY & MATERIAL INSCRIPTIONS (10 finds, 10 cards, 10 IDs)
  // =========================================================================
  // Group 5A: Seven Inscribed Artifacts (Greek, Latin, Hebrew, Aramaic)
  {
    id: 'alexamenos-graffito',
    aliases: [],
    section: 'archaeology',
    group: 'inscriptions',
    authorKey: null,
    label: 'The Alexamenos Graffito — Palatine Hill, Rome (late 2nd to early 3rd c. AD)',
    noteMd:
      'Uncovered in November 1856 (published 1857) on a plaster wall of the *Paedagogium* (boarding school for imperial palace pages) on Rome’s Palatine Hill and housed in the Palatine Antiquarium. Raffaele Garrucci (1857), Graydon F. Snyder (*Ante Pacem*, rev. ed. 2003), and Felicity Harley-McGowan (“The Alexamenos Graffito,” in C. Keith, H. K. Bond, C. Jacobi & J. Schröter, eds., *The Reception of Jesus in the First Three Centuries*, vol. 3, T&T Clark, 2020, pp. 105–139) interpret the graffito as among the earliest extant visual depictions of the crucifixion of Jesus; it caricatures a youth raising one hand in a Greco-Roman gesture of prayer toward a crucified figure with a donkey’s head, reflecting the pagan charge of *onolatreia* (donkey-worship, attested in Tertullian, *Apology* 16, and Minucius Felix, *Octavius* 9) and pairing Roman crucifixion with Christian worship of “[his] god” (*θεόν*).',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: 'ΑΛΕΞΑΜΕΝΟϹ ϹΕΒΕΤΕ ΘΕΟΝ',
    },
    quote:
      '**Alexamenos worships [his] god.** *(Non-standard colloquial Greek spelling ΑΛΕΞΑΜΕΝΟϹ ϹΕΒΕΤΕ ΘΕΟΝ for Ἀλεξάμενος σέβεται θεόν, incised beneath a sketch of a crucified figure on the Palatine Paedagogium wall.)*',
    chips: [
      {
        label: 'Alexamenos Graffito (University of Chicago)',
        href: 'https://penelope.uchicago.edu/~grout/encyclopaedia_romana/gladiators/graffito.html',
      },
    ],
  },
  {
    id: 'pilate-stone',
    aliases: [],
    section: 'archaeology',
    group: 'inscriptions',
    authorKey: null,
    label: 'The Pontius Pilate Stone — Caesarea Maritima (*AE* 1963, no. 104; AD 26–36)',
    noteMd:
      'Carved limestone dedication block unearthed in June 1961 by an Italian archaeological mission led by Antonio Frova, reused as a step in the fourth-century remodeling of the Roman theater at Caesarea Maritima (Israel Museum, Jerusalem, IAA 1961-529). It provides contemporary first-century epigraphic attestation of Pontius Pilate’s name, his governorship of Judea under Tiberius, and his equestrian rank as *praefectus Iudaeae* (“prefect of Judea”), before the title *procurator* came into use for the governors of Judea under Claudius. Frova (1961) restored line 1 as `[DIS AVGVST]IS TIBERIÉVM` (a temple/building honoring Tiberius), whereas Géza Alföldy (*Scripta Classica Israelica* 18, 1999, pp. 85–108) proposed `[NAVTI]S TIBERIÉVM … [REF]É[CIT]` (a harbor lighthouse restored for sailors).',
    originalScript: {
      lang: 'la',
      dir: 'ltr',
      text: '[DIS AVGVST]IS TIBERIÉVM / […PO]NTIVS PILATVS / [PRAEF]ECTVS IVDA[EA]E / […FECIT D]É[DICAVIT]',
    },
    quote:
      'To the Divine Augusti [this] Tiberieum / **…Pontius Pilate** / **…Prefect of Judea** / …has dedicated [this]. *(tr. after Antonio Frova, 1961; alt. restoration Géza Alföldy, 1999.)*',
    chips: [
      {
        label: 'Bond, Pontius Pilate in History & Interpretation, p. 12 (Archive.org)',
        href: 'https://archive.org/details/pontius-pilate-helen-k.-bond',
      },
      {
        label: 'Caesarea Pilate Inscription (Livius)',
        href: 'https://www.livius.org/articles/person/pontius-pilate/pontius-pilate-8/',
      },
    ],
  },
  {
    id: 'caiaphas-ossuary',
    aliases: [],
    section: 'archaeology',
    group: 'inscriptions',
    authorKey: null,
    label: 'The Caiaphas Family Ossuary — Jerusalem (IAA 91-468 / *CIIP* I.1, no. 461; 1st c. AD)',
    noteMd:
      'Ornate chip-carved limestone ossuary (secondary bone box used after primary cave burial in first-century Judea) discovered in November 1990 in a rock-cut burial chamber in the Peace Forest south of Jerusalem (excavation report by Zvi Greenhut, *ʿAtiqot* 21, 1992, pp. 63–71; epigraphy by Ronny Reich, *ʿAtiqot* 21, 1992, pp. 72–77; Israel Museum, Jerusalem). The ossuary is inscribed twice in Aramaic—on the back (`יהוסף בר קיפא`, *Yehosef bar Qayafa*) and on a narrow side (`יהוסף בר קפא`, *Yehosef bar Qafa*)—and held the remains of six individuals, including a man of about sixty; Reich connected it with the High Priest of AD 18–36 whom Josephus calls by the cognomen `Ἰώσηπος ὁ καὶ Καϊάφας` (“Joseph also called Caiaphas,” *Antiquities* 18.35, 18.95; cf. [Matthew 26:3](/bible/mt/26#3)). Whereas Josephus uses a Greek cognomen, the Aramaic inscriptions read as a patronymic (“son of Qayafa/Qafa”), and Émile Puech (“A-t-on redécouvert le tombeau du grand-prêtre Caïphe?,” *Le Monde de la Bible* 80, 1993, pp. 42–47) and William Horbury (*PEQ* 126, 1994, pp. 32–48) note the debated vocalization (*Qayafa* vs. *Quppa*) and leave the identification with the High Priest open.',
    originalScript: {
      lang: 'arc',
      dir: 'rtl',
      text: 'יהוסף בר קיפא · יהוסף בר קפא',
    },
    quote:
      '**Yehosef bar Qayafa** (“Joseph, son of Qayafa [Caiaphas]”) · narrow side: **Yehosef bar Qafa** *(ed. Ronny Reich, ʿAtiqot 21, 1992)*.',
    chips: [
      {
        label: 'Joseph Caiaphas & Ossuary (Livius)',
        href: 'https://www.livius.org/articles/person/caiaphas/',
      },
      {
        label: 'Josephus, Antiquities 18.35 on Caiaphas (Perseus Greek)',
        href: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0145%3Abook%3D18%3Asection%3D35',
      },
      {
        label: 'Evans, Jesus and the Ossuaries (2003, Archive.org)',
        href: 'https://archive.org/details/jesusossuaries0000evan',
      },
    ],
  },
  {
    id: 'yehohanan-heel-bone',
    aliases: [],
    section: 'archaeology',
    group: 'inscriptions',
    authorKey: null,
    label: 'Yehoḥanan’s Crucified Heel Bone & Ossuary — Givʿat HaMivtar, Jerusalem (Rahmani no. 218; 1st c. AD)',
    noteMd:
      'First-century limestone ossuary excavated in 1968 by Vassilios Tzaferis at Givʿat HaMivtar in northeastern Jerusalem (Israel Museum, Jerusalem; epigraphy published by Joseph Naveh, *Israel Exploration Journal* 20, 1970, pp. 33–37, reading `יהוחנן בן חגקול`, *Yehoḥanan ben Ḥagqol*, with an alternative reading of the final word as `העקול`, *ha-ʿaqul*, “the one crucified with bent knees,” proposed by Yigael Yadin, *IEJ* 23, 1973, pp. 18–22). Inside lay the bones of a young Jewish male whose right heel bone (*calcaneum*) remained transfixed laterally by an 11.5-centimeter iron nail bent against a knot in olive wood (re-examined by Joe Zias & Eliezer Sekeles, *IEJ* 35, 1985), showing that a victim crucified in Judea before AD 70 could receive burial in a family tomb and a secondary ossuary burial (cf. Josephus, *Jewish War* 4.317).',
    originalScript: {
      lang: 'he',
      dir: 'rtl',
      text: 'יהוחנן בן חגקול',
    },
    quote:
      '**Yehoḥanan ben Ḥagqol** (“Jehohanan, son of Ḥagqol,” ed. Naveh 1970; alt. *ha-ʿaqul*, Yadin 1973) — *ossuary inscription accompanying a right human calcaneum pierced laterally by an 11.5 cm iron crucifixion spike retaining traces of olive wood.*',
    chips: [
      {
        label: 'CIIP I.1 Jerusalem (Archive.org Volume Record)',
        href: 'https://archive.org/details/corpusinscriptio0000unse_v5l8',
      },
      {
        label: 'Josephus, Jewish War 4.5.2 (§317) on Crucifixion Burial (CCEL)',
        href: 'https://www.ccel.org/ccel/josephus/works/files/war-4.htm',
      },
      {
        label: 'Evans, Jesus and the Ossuaries (2003, Archive.org)',
        href: 'https://archive.org/details/jesusossuaries0000evan',
      },
    ],
  },
  {
    id: 'gallio-inscription',
    aliases: [],
    section: 'archaeology',
    group: 'inscriptions',
    authorKey: null,
    label: 'The Delphi Gallio Inscription — Archaeological Museum of Delphi (*SIG*³ 801D; AD 51–52)',
    noteMd:
      'Limestone fragments discovered at the Temple of Apollo at Delphi in central Greece (four fragments published by Émile Bourguet, *De rebus Delphicis*, 1905; fuller nine-fragment reconstruction by André Plassart, *Fouilles de Delphes* III.4, no. 286, 1970), preserving an official letter from Emperor Claudius to the city of Delphi during his twenty-sixth acclamation as *imperator* (January–August AD 52). Writing to Delphi, Claudius refers in the third person to Lucius Junius Gallio—elder brother of the Stoic philosopher Seneca—as “my friend and proconsul” (`ἀνθύπατος [τῆς Ἀχαΐας]`, with “of Achaia” restored), which matches the title given to Gallio in [Acts 18:12](/bible/acts/18#12) (“Gallio proconsul of Achaia”) and provides an absolute date (AD 51–52) for Paul’s hearing before him at Corinth. (Translation: after Plassart, 1970 / Jerome Murphy-O’Connor, 1983.)',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: 'Τιβέρι[ος Κλαύδιος Καῖσ]αρ Σεβαστ[ὸς Γ]ερμανικός, [δημαρχικῆς ἐξου]σίας [τὸ ιβʹ, αὐτοκράτωρ τ]ὸ κϛʹ… [Λούκιος Ἰού]νιος Γαλλίων ὁ φ[ίλος μου κα]ὶ ἀνθύπατος [τῆς Ἀχαΐας]…',
    },
    quote:
      'Tiberius Claudius Caesar Augustus Germanicus, invested with tribunician power for the twelfth time, acclaimed Imperator for the twenty-sixth time, Father of the Fatherland… For a long time have I been well-disposed to the city of Delphi… **as Lucius Junius Gallio, my friend and proconsul [of Achaia], recently reported to me**…',
    chips: [
      {
        label: 'Bourguet, De rebus Delphicis (1905 editio princeps)',
        href: 'https://archive.org/details/derebusdelphici00bourgoog',
      },
      {
        label: 'Delphi Inscription SIG³ 801D (ed. Dittenberger, 3rd ed. II, Archive.org)',
        href: 'https://archive.org/details/syllogeinscripti02dittuoft',
      },
      {
        label: 'Acts 18:12',
        href: '/bible/acts/18#12',
      },
    ],
  },
  {
    id: 'erastus-inscription',
    aliases: [],
    section: 'archaeology',
    group: 'inscriptions',
    authorKey: null,
    label: 'The Erastus Pavement Inscription — Corinth (*Corinth* VIII.3, no. 232 / *AE* 1930, no. 118; mid-1st or mid-2nd c. AD, disputed)',
    noteMd:
      'Limestone plaza block excavated in 1929 by Theodore Leslie Shear northeast of the theater in Roman Corinth, bearing recessed channels that originally held bronze letters. Writing from Corinth c. AD 56–57 in [Romans 16:23](/bible/rom/16#23), Paul conveys greetings from “Erastus, the city steward/treasurer” (*ὁ οἰκονόμος τῆς πόλεως*). Gerd Theissen (1982) and John K. Goodrich (*NTS* 56, 2010; *NTS* 57, 2011, pp. 583–593) date the pavement to the mid-first century AD and argue that Paul’s Erastus could have advanced to *aedilis* (civic magistrate of public works). Conversely, Justin J. Meggitt (“The Social Status of Erastus (Rom. 16:23),” *Novum Testamentum* 38, 1996, pp. 218–223) and Steven J. Friesen (“The Wrong Erastus,” in *Corinth in Context*, 2010, pp. 231–256) observe that *Erastus* was a common Greek servile/freedman name and date the plaza phase stratigraphically to the mid-second century AD. (Translation: after John H. Kent, *Corinth* VIII.3, no. 232, 1966.)',
    originalScript: {
      lang: 'la',
      dir: 'ltr',
      text: 'ERASTVS · PRO · AEDILIT[AT]E · S(VA) · P(ECVNIA) · STRAVIT',
    },
    quote:
      '**Erastus, in return for his aedileship, laid [this pavement] at his own expense.**',
    chips: [
      {
        label: 'Corinth VIII.3, no. 232 / AE 1930, no. 118 (ed. Kent, ASCSA Open-Access PDF)',
        href: 'https://www.ascsa.edu.gr/uploads/media/oa_ebooks/oa_corinth/Corinth_VIII_3.pdf',
      },
      {
        label: 'Romans 16:23',
        href: '/bible/rom/16#23',
      },
    ],
  },
  {
    id: 'sergius-paulus-inscription',
    aliases: [],
    section: 'archaeology',
    group: 'inscriptions',
    authorKey: null,
    label: 'The Sergius Paulus Inscriptions — Soloi, Cyprus (*IGR* III 930, date uncertain) & Rome (*CIL* VI 31545; c. AD 41–47)',
    noteMd:
      'In [Acts 13:7](/bible/acts/13#7), Luke gives the governor of Cyprus at Paphos the title “proconsul (*ἀνθύπατος*) Sergius Paulus,” which matches Cyprus’s transfer in 22 BC from imperial legatine rule to senatorial proconsular administration (Cassius Dio 54.4.1). A Greek inscription at Soloi in northern Cyprus (*IGR* III 930) dates an event “in the proconsulship of Paulus,” and a Claudian Tiber-commission boundary stone in Rome (*CIL* VI 31545 = *ILS* 5926, c. AD 41–47) names the senator **Lucius Sergius Paullus**, alongside *gens Sergia Paulli* family monuments at Pisidian Antioch (*AE* 2002, no. 1458). As Alanna Nobbs notes (in D. W. J. Gill & C. Gempf, eds., *The Book of Acts in Its Graeco-Roman Setting*, 1994), the date of the Soloi stone is uncertain, and linking either individual with the proconsul of Acts 13:7 remains conjectural on *prosopographical* grounds (that is, in matching named individuals across inscriptions).',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: 'ἐπὶ Παύλου ἀνθυπάτου [IGR III 930, Soloi] · L(VCIVS) SERGIVS PAVLLVS [CIL VI 31545, Rome]',
    },
    quote:
      '**[IGR III 930, Soloi, Cyprus]: “in the proconsulship of Paulus”** (*ἐπὶ Παύλου ἀνθυπάτου*) — possibly the same man or senatorial family (*gens Sergia Paulli*) as the **Lucius Sergius Paullus** named on a Claudian Tiber-commission stone in Rome (*CIL* VI 31545) as curator of the banks and channel of the Tiber.',
    chips: [
      {
        label: 'CIL VI 31545 / ILS 5926 Rome (ed. Dessau, Archive.org)',
        href: 'https://archive.org/details/inscriptioneslat21dess',
      },
      {
        label: 'IGR III 930 Soloi, Cyprus (ed. Cagnat, Archive.org)',
        href: 'https://archive.org/details/inscriptionesgra03cagnuoft',
      },
      {
        label: 'Cassius Dio, Roman History 54.4.1 on Proconsular Cyprus (LacusCurtius)',
        href: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/54*.html',
      },
      {
        label: 'Acts 13:7',
        href: '/bible/acts/13#7',
      },
    ],
  },

  // Group 5B: Three Judean & Galilean Gospel Topographical Excavations (Material Records, NOT fake quotes)
  {
    id: 'pool-of-bethesda',
    aliases: [],
    section: 'archaeology',
    group: 'excavations',
    authorKey: null,
    kind: 'finding',
    label: 'The Twin-Basin Pool of Bethesda — St. Anne’s Precinct, Jerusalem (pre-AD 70)',
    noteMd:
      'In [John 5:2](/bible/jn/5#2), the Fourth Gospel locates a pool in Jerusalem near the Sheep Gate “called in Hebrew/Aramaic Bethzatha [Bethesda], having five porticoes (*πέντε στοὰς ἔχουσα*).” Because classical Greco-Roman pools were ordinarily rectangular with four colonnades, Alfred Loisy (*Le quatrième évangile*, 1903, p. 386, adapting an allegorical reading found in Augustine, *Tractates on John* 17.2; cf. F. C. Baur, *Kritische Untersuchungen*, 1847, pp. 244–245, 331–332, on Johannine symbolism and *John* 5:2) interpreted the five porticoes as unhistorical symbolism for the five books of Moses.',
    quote:
      'Excavations inside the precinct of St. Anne’s Church north of the Temple Mount—published by Conrad Schick (*Palestine Exploration Quarterly* 20, 1888, pp. 115–134) and Pierre Benoit (“Découvertes archéologiques autour de la piscine de Béthesda,” in *Jerusalem Through the Ages*, Israel Exploration Society, 1968, pp. 48*–57*) and re-analyzed stratigraphically by Shimon Gibson (*Proche-Orient Chrétien* 55, 2005, pp. 270–293)—uncovered a monumental trapezoidal Second Temple water complex. It comprises **two rock-cut basins—an upper northern storage reservoir (*otzar*) and a lower southern stepped ritual purification basin (*miqveh*), in Gibson’s reconstruction—separated by a broad rock-cut partition wall**. This layout accommodates four perimeter colonnades and a **fifth portico running across the central dividing wall**; the complex was sealed before the construction of Emperor Hadrian’s second-century colony of *Aelia Capitolina* and its *Asclepieion* (healing sanctuary of the Greek god Asclepius).',
    chips: [
      {
        label: 'Conrad Schick, PEFQSt July 1888 (Archive.org)',
        href: 'https://archive.org/details/palestine-exploration-quarterly_1888-07',
      },
      {
        label: 'Loisy, Le quatrième évangile, p. 386 (1903, Archive.org)',
        href: 'https://archive.org/details/lequatrimevangil00lois',
      },
      {
        label: 'John 5:2',
        href: '/bible/jn/5#2',
      },
    ],
  },
  {
    id: 'pool-of-siloam',
    aliases: [],
    section: 'archaeology',
    group: 'excavations',
    authorKey: null,
    kind: 'finding',
    label: 'The Second Temple Pool of Siloam — City of David, Jerusalem (pre-AD 70)',
    noteMd:
      'In [John 9:7](/bible/jn/9#7), Jesus instructs a blind man in Jerusalem to “Go, wash in the pool of Siloam” (*κολυμβήθρα τοῦ Σιλωάμ*). Before 2004, the sole known Pool of Siloam was a narrow fifth-century Byzantine basin built farther up the Tyropoeon Valley under Empress Eudocia.',
    quote:
      'During municipal infrastructure work in June 2004 and subsequent seasons (2004–2011; *Qadmoniot* 38, 2005, and *Unearthing Jerusalem*, 2011, pp. 241–256), **Ronny Reich and Eli Shukron** (Israel Antiquities Authority and University of Haifa) uncovered the **monumental Second Temple Pool of Siloam at the southern tip of the City of David**, fed by the Gihon Spring via Hezekiah’s Tunnel. The trapezoidal immersion reservoir exceeds 50 meters along its excavated eastern side and is lined with **alternating flights of plaster-coated first-century BC and early first-century AD stone steps** and paved plaza stones. Hasmonean coins beneath the plaster and First Jewish Revolt coins (AD 66–70) sealed in Roman destruction debris establish its use before AD 70.',
    chips: [
      {
        label: 'Reich & Shukron (2011), Unearthing Jerusalem (DOI)',
        href: 'https://doi.org/10.1515/9781575066592-015',
      },
      {
        label: 'John 9:7',
        href: '/bible/jn/9#7',
      },
    ],
  },
  {
    id: 'capernaum-synagogue',
    aliases: [],
    section: 'archaeology',
    group: 'excavations',
    authorKey: null,
    kind: 'finding',
    label: 'Basalt Remains Beneath the Capernaum Synagogue & *Insula I* Courtyard House (1st–6th c. AD, debated)',
    noteMd:
      'In [Mark 1:21–29](/bible/mk/1#21), Jesus teaches on the Sabbath in the synagogue of Capernaum on the northwestern shore of the Sea of Galilee and then goes directly to the nearby house of Simon and Andrew.',
    quote:
      'Stratigraphic soundings by Franciscan archaeologists **Virgilio Corbo** (*Cafarnao I*, 1975) and **Stanislao Loffreda** (*Recovering Capharnaum*, 1993) beneath the standing white limestone synagogue—dated by Corbo and Loffreda to the fourth/fifth century AD, and redated by **Jodi Magness** (“The Question of the Synagogue: The Problem of Typology,” in A. J. Avery-Peck & J. Neusner, eds., *Judaism in Late Antiquity* III.4, Brill, 2001, pp. 1–48) to the fifth/sixth century AD—revealed **first-century AD black basalt walls and cobbled flooring containing Late Hellenistic and early Roman pottery and coins**. Corbo and Loffreda identified this basalt phase as the first-century public synagogue, whereas **Zvi Uri Maʿoz** (1999) and **Anders Runesson** (*The Origins of the Synagogue*, 2001) regard that identification as uncertain and consider that the structure may have been domestic. Roughly thirty meters south, inside *Insula I* (*Insula Sacra*), excavations uncovered a **first-century BC to first-century AD basalt domestic courtyard complex** whose central room was lime-plastered in the late first century and later converted into a *domus ecclesiae* (Christian house-church assembly hall) bearing **more than 130 Greek, Aramaic, Syriac, and Latin visitor graffiti** beneath a fifth-century octagonal Byzantine church.',
    chips: [
      {
        label: 'Capernaum Excavations (Livius)',
        href: 'https://www.livius.org/articles/place/capernaum/',
      },
      {
        label: 'Mark 1:21–29',
        href: '/bible/mk/1#21',
      },
    ],
  },

  // =========================================================================
  // SECTION 6: CORROBORATIVE EARLY CHRISTIAN & DISPUTED SOURCES (Appendix — 11 cards, 11 IDs)
  // =========================================================================
  // Group 6A: Eight Pre-Nicene Christian & New Testament Witnesses (transparently classified)
  {
    id: 'carmen-christi-philippians-2-6-11',
    aliases: [],
    section: 'corroborative-and-disputed',
    group: 'christian-witnesses',
    authorKey: null,
    label: 'The *Carmen Christi* Hymn — Philippians 2:6–11 (c. AD 55–62; pre-Pauline liturgy c. AD 35–50)',
    noteMd:
      '**Classification: Canonical New Testament text incorporating pre-Pauline Christian liturgy** (cross-referenced in [“Worship of Jesus Before Nicaea: Pre-AD 325 Evidence”](/discover/divinity-timeline) and [“Biblical Evidence for the Divinity of Christ”](/evidence/divinity_of_christ)). Although internal to the New Testament rather than an external pagan or Jewish source, Philippians 2:6–11 is identified by form-critical historians (Ralph P. Martin, *Carmen Christi*, 1967; Larry W. Hurtado, *Lord Jesus Christ*, 2003) as a rhythmic early Christian hymn that predates Paul’s letter. It illustrates from within the movement the devotion to Christ “as to a god” that [Pliny the Younger](#evidence-pliny-letters-10-96) observed from outside it in Bithynia. (Translation: New American Standard Bible, 1995.)',
    quote:
      'who, although He existed in the form of God, did not regard equality with God a thing to be grasped, **but emptied Himself, taking the form of a bond-servant, [and] being made in the likeness of men. Being found in appearance as a man, He humbled Himself by becoming obedient to the point of death, even death on a cross.** For this reason also, God highly exalted Him, and bestowed on Him the name which is above every name, **so that at the name of Jesus EVERY KNEE WILL BOW**, of those who are in heaven and on earth and under the earth, and that every tongue will confess that Jesus Christ is Lord, to the glory of God the Father.',
    chips: [
      {
        label: 'Philippians 2:6–11 (NASB)',
        href: '/bible/phil/2#6',
      },
      {
        label: 'Divinity Timeline',
        href: '/discover/divinity-timeline',
      },
    ],
  },
  {
    id: 'ignatius-seven-epistles',
    aliases: [],
    section: 'corroborative-and-disputed',
    group: 'christian-witnesses',
    authorKey: null,
    label: 'Ignatius of Antioch — *Epistle to the Ephesians* 7:2 (c. AD 107–115)',
    noteMd:
      '**Classification: Early second-century Christian episcopal letter.** Ignatius wrote his seven authentic letters (Greek middle recension) while under Roman military escort from Syrian Antioch to martyrdom in Rome during Trajan’s reign, at about the time of Pliny’s Bithynian governorship (c. AD 112); the letters combine Jesus’s human birth from Mary and death under Pontius Pilate (*Trallians* 9; *Smyrnaeans* 1) with explicitly divine predicates, more than two centuries before the Council of Nicaea (AD 325). (Translation: Alexander Roberts & James Donaldson, *ANF* 1, 1885.)',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: 'εἷς ἰατρός ἐστιν, σαρκικός τε καὶ πνευματικός, γεννητὸς καὶ ἀγέννητος, ἐν σαρκὶ γενόμενος θεός… Ἰησοῦς Χριστὸς ὁ κύριος ἡμῶν.',
    },
    quote:
      'There is one Physician who is possessed both of flesh and spirit; both made and not made; **God existing in flesh; true life in death; both of Mary and of God; first passible and then impassible—even Jesus Christ our Lord.**',
    chips: [
      {
        label: 'Ignatius, Ephesians 7:2 (New Advent)',
        href: 'https://www.newadvent.org/fathers/0104.htm',
      },
      {
        label: 'Divinity Timeline',
        href: '/discover/divinity-timeline',
      },
    ],
  },
  {
    id: 'polycarp-philippians-12-2',
    aliases: [],
    section: 'corroborative-and-disputed',
    group: 'christian-witnesses',
    authorKey: null,
    label: 'Polycarp of Smyrna — *Epistle to the Philippians* 12:2 (c. AD 110–140)',
    noteMd:
      '**Classification: Early second-century Christian episcopal letter.** Bishop of Smyrna in Asia Minor, described by his pupil Irenaeus (*Against Heresies* 3.3.4) as having heard the Apostle John in person, and martyred after declaring that he had served Christ for eighty-six years (*Martyrdom of Polycarp* 9). Chapters 10–14 are preserved primarily in an ancient Latin translation, where *Philippians* 12:2 invokes Jesus Christ as “the eternal High-priest Himself, the [Son of] God.” In the closing clause, J. B. Lightfoot translates the fuller Latin manuscript reading *Domini et Dei nostri Jesu Christi* (“our Lord and God Jesus Christ”; cf. Michael W. Holmes), whereas the *Ante-Nicene Fathers* translation hosted on New Advent follows the shorter variant *Domini nostri* (“our Lord Jesus Christ”). (Translation: J. B. Lightfoot, *Apostolic Fathers*, 1889/1891.)',
    quote:
      'Now **may the God and Father of our Lord Jesus Christ, and the eternal High-priest Himself, the [Son of] God Jesus Christ**, build you up in faith and truth, and in all gentleness and in all avoidance of wrath and in forbearance and long-suffering and in patient endurance and in purity; and may He grant unto you a lot and portion among His saints, and to us with you, and to all that are under heaven, **who shall believe on our Lord and God Jesus Christ and on His Father that raised Him from the dead**.',
    chips: [
      {
        label: 'Polycarp, Philippians 12:2 (tr. Lightfoot, 1891)',
        href: 'https://archive.org/details/apostolicfathers00lighuoft',
      },
      {
        label: 'Polycarp, Philippians 12:2 (New Advent ANF — shorter Latin reading)',
        href: 'https://www.newadvent.org/fathers/0136.htm',
      },
      {
        label: 'Divinity Timeline',
        href: '/discover/divinity-timeline',
      },
    ],
  },
  {
    id: 'second-clement-1-1',
    aliases: [],
    section: 'corroborative-and-disputed',
    group: 'christian-witnesses',
    authorKey: null,
    label: '*Second Epistle of Clement* 1:1 (Anonymous Christian Homily, c. AD 130–160)',
    noteMd:
      '**Classification: Mid-second-century Christian homily.** Generally regarded as the earliest extant non-canonical Christian sermon (composed at Rome, Corinth, or Alexandria and transmitted with *1 Clement* in the fifth-century Codex Alexandrinus), the homily opens with an exhortation that its hearers think of Jesus Christ “as of God, as of the Judge of living and dead.” (Translation: J. B. Lightfoot, *Apostolic Fathers*, 1889.)',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: 'Ἀδελφοί, οὕτως δεῖ ἡμᾶς φρονεῖν περὶ Ἰησοῦ Χριστοῦ, ὡς περὶ θεοῦ, ὡς περὶ κριτοῦ ζώντων καὶ νεκρῶν.',
    },
    quote:
      'Brethren, **we ought so to think of Jesus Christ, as of God, as of the Judge of quick and dead**. And we ought not to think mean things of our Salvation: for when we think mean things of Him, we expect also to receive mean things.',
    chips: [
      {
        label: '2 Clement 1:1 (Lightfoot / Early Christian Writings)',
        href: 'https://www.earlychristianwritings.com/text/2clement-lightfoot.html',
      },
    ],
  },
  {
    id: 'jewish-polemic-toledot-trypho',
    aliases: [],
    section: 'corroborative-and-disputed',
    group: 'christian-witnesses',
    authorKey: null,
    label: 'Justin Martyr — *Dialogue with Trypho* 108 (c. AD 155–160, reporting a Jewish counter-claim)',
    noteMd:
      '**Classification: Second-century Christian philosophical dialogue reporting contemporary Jewish argument.** Born at Flavia Neapolis (Nablus) in Samaria and martyred in Rome c. AD 165, Justin records a disputation with the Jewish scholar Trypho shortly after the Bar Kokhba War (AD 132–135). In chapter 108, Justin states that Jewish leaders had sent emissaries throughout the diaspora asserting that Jesus’s disciples had stolen his body from the tomb by night (echoing [Matthew 28:13–15](/bible/mt/28#13)). *(Historical note: the Jewish counter-biographies known as* Toledot Yeshu *took shape in late antiquity and the Middle Ages, centuries after Justin, and are distinct from his report of c. AD 155. Translation: Marcus Dods & George Reith, ANF 1, 1885.)*',
    quote:
      '…you have sent chosen and ordained men throughout all the world to proclaim that **a godless and lawless heresy had sprung from one Jesus, a Galilean deceiver, whom we crucified, but his disciples stole him by night from the tomb, where he was laid when unfastened from the cross**, and now deceive men by asserting that he has risen from the dead and ascended to heaven.',
    chips: [
      {
        label: 'Justin Martyr, Dialogue with Trypho 108 (New Advent)',
        href: 'https://www.newadvent.org/fathers/01287.htm',
      },
      {
        label: 'Matthew 28:13–15',
        href: '/bible/mt/28#13',
      },
    ],
  },
  {
    id: 'melito-on-the-passover',
    aliases: [],
    section: 'corroborative-and-disputed',
    group: 'christian-witnesses',
    authorKey: null,
    label: 'Melito of Sardis — *On the Passover* (*Peri Pascha* 96; c. AD 160–170)',
    noteMd:
      '**Classification: Second-century Christian *Quartodeciman* Paschal homily (observing Easter on 14 Nisan, the date of the Jewish Passover).** Bishop of Sardis in Lydia (Asia Minor) who traveled to Palestine to ascertain the books of the Hebrew Scriptures (Eusebius, *Church History* 4.26.13–14). Recovered in Greek in the twentieth century via Papyrus Bodmer XIII and Chester Beatty XII (ed. Stuart G. Hall, 1979), Melito’s Paschal sermon illustrates both the high Christology of second-century Asian congregations contemporaneous with Lucian and Celsus and, in §96’s closing clause, one of the earliest patristic formulations of the anti-Jewish deicide charge analyzed by Judith M. Lieu (*Image and Reality*, 1996). (Translation: Gerald F. Hawthorne, *Kerux* 4.1, 1989.)',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: 'ὁ κρεμάσας τὴν γῆν κρέμαται· ὁ πήξας τοὺς οὐρανοὺς πέπηκται· ὁ στηρίξας τὰ πάντα ἐπὶ ξύλου ἐστήρικται· ὁ δεσπότης ὕβρισται, ὁ θεὸς πεφόνευται…',
    },
    quote:
      '**The one who hung the earth in space, is himself hanged; the one who fixed the heavens in place, is himself impaled; the one who firmly fixed all things, is himself firmly fixed to the tree.** The Lord is insulted, God has been murdered, the King of Israel has been destroyed by the right hand of Israel.',
    chips: [
      {
        label: 'Melito, On the Passover (Kerux Translation)',
        href: 'https://www.kerux.com/doc/0401A1.asp',
      },
      {
        label: 'Divinity Timeline',
        href: '/discover/divinity-timeline',
      },
    ],
  },
  {
    id: 'hegesippus-eusebius-hist-eccl-3-20',
    aliases: [],
    section: 'corroborative-and-disputed',
    group: 'christian-witnesses',
    authorKey: null,
    label: 'Hegesippus — *Memoirs* (c. AD 170–180, via Eusebius, *Church History* 3.20.1–6)',
    noteMd:
      '**Classification: Second-century Jewish-Christian chronicler preserved by Eusebius.** Hegesippus recounts how Emperor Domitian (r. AD 81–96), ordering the elimination of claimants from the royal line of David, had the grandchildren of Jude—“who is said to have been the Lord’s brother according to the flesh”—brought before him; after inspecting their calloused peasant hands, hearing that their farm measured thirty-nine *plethra* (roughly nine acres) and was valued at 9,000 denarii, and receiving their statement that Christ’s kingdom was heavenly and eschatological rather than earthly, Domitian dismissed them unharmed. (Translation: Arthur Cushman McGiffert, *NPNF*² 1, 1890.)',
    quote:
      'Of the family of the Lord there were still living **the grandchildren of Jude, who is said to have been the Lord’s brother according to the flesh**. Information was given that they belonged to the family of David, and they were brought to the Emperor Domitian by the Evocatus… Then **they showed their hands, exhibiting the hardness of their bodies and the callousness produced upon their hands by continuous toil** as evidence of their own labor. And when they were asked concerning Christ and his kingdom, of what sort it was and where and when it was to appear, they answered that it was not a temporal nor an earthly kingdom, but a heavenly and angelic one…',
    chips: [
      {
        label: 'Eusebius, Church History 3.20 (CCEL, tr. McGiffert)',
        href: 'https://www.ccel.org/ccel/schaff/npnf201.iii.viii.xx.html',
      },
      {
        label: 'Hegesippus Fragments (Early Christian Writings, tr. Pratten)',
        href: 'https://www.earlychristianwritings.com/text/hegesippus.html',
      },
    ],
  },
  {
    id: 'phos-hilaron',
    aliases: [],
    section: 'corroborative-and-disputed',
    group: 'christian-witnesses',
    authorKey: null,
    label: '*Phōs Hilaron* (“O Gladsome Light” — Pre-Nicene Greek Vesper Hymn, 3rd to early 4th c. AD)',
    noteMd:
      '**Classification: Early Christian Greek evening lamp-lighting hymn.** Attested by Basil of Caesarea (*On the Holy Spirit* 29.73, AD 375) as a liturgical custom already so ancient in Eastern churches that its author was unknown, *Phōs Hilaron* preserves what is probably pre-Nicene Trinitarian worship sung at sunset (“we hymn thee, Father, Son, and Holy Spirit, God”; cf. Basil: “We praise Father, Son, and God’s Holy Spirit”). (Translation: Isabel Florence Hapgood, *Service Book of the Holy Orthodox-Catholic Apostolic Church*, 1906, p. 10.)',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: 'Φῶς ἱλαρὸν ἁγίας δόξης ἀθανάτου Πατρός, οὐρανίου, ἁγίου, μάκαρος, Ἰησοῦ Χριστέ… ὑμνοῦμεν Πατέρα, Υἱόν, καὶ ἅγιον Πνεῦμα Θεόν.',
    },
    quote:
      'O gladsome radiance of the holy glory of the Father immortal, heavenly, holy, blessed, **Jesus Christ**! In that we now are come unto the setting of the sun, and behold the light of even, **we hymn thee, Father, Son, and Holy Spirit, God**. For meet is it that at all times thou shouldest be magnified by voices propitious, **O Son of God, who bestowest life**. For which cause all the world doth glorify thee.',
    chips: [
      {
        label: 'Basil, On the Holy Spirit 29.73 (New Advent)',
        href: 'https://www.newadvent.org/fathers/3203.htm',
      },
      {
        label: 'Hapgood, Service Book, p. 10 — Phōs Hilaron (1906, Archive.org)',
        href: 'https://archive.org/details/cu31924029363128',
      },
      {
        label: 'Evidence for the Divinity of Christ',
        href: '/evidence/divinity_of_christ',
      },
    ],
  },

  // Group 6B: Three Disputed or Lost Imperial Documents Excluded from Primary Witness Count
  {
    id: 'nazareth-inscription',
    aliases: [],
    section: 'corroborative-and-disputed',
    group: 'disputed-documents',
    authorKey: null,
    label: 'The “Nazareth Inscription” — *Ordinance of Caesar* (*SEG* 8:13; Cabinet des Médailles, Paris)',
    noteMd:
      '**Reason for exclusion from primary count: Unprovenanced antiquities-market acquisition naming neither Jesus nor Christians; isotope analysis matches the marble to Kos.** Purchased in Paris in 1878 by the collector Wilhelm Froehner with a dealer’s note reading “Dalle de marbre envoyée de Nazareth” (published by Franz Cumont, 1930), this Greek imperial ordinance imposes capital punishment on tomb-violators who remove bodies or sepulcher-sealing stones. Earlier commentators (surveyed in Bruce M. Metzger, *New Testament Studies: Philological, Versional, and Patristic*, 1980, pp. 75–92; Paul L. Maier, *In the Fullness of Time*, 1991) linked it to a reaction by Claudius to reports of Jesus’s empty tomb, although the text never mentions Jesus, Judea, or Christians. Carbon- and oxygen-isotope analysis by **Kyle Harper, Michael McCormick, Matthew Hamilton, Chantal Peiffert, Raymond Michels, and Michael Engel** (*Journal of Archaeological Science: Reports* 30, 2020, 102228) matched the marble to a quarry on the Aegean island of Kos, leading the authors to propose that Augustus issued the edict after citizens of Kos desecrated the tomb of the local tyrant Nikias c. 20 BC. (Translation: after Clyde Pharr / Bruce M. Metzger, 1980.)',
    originalScript: {
      lang: 'el',
      dir: 'ltr',
      text: 'Διάταγμα Καίσαρος. Ἀρέσκει μοι τάφους τύμβους τε, οἵτινες εἰς θρησκείαν προγόνων ἐποίησαν ἢ τέκνων ἢ οἰκείων, τούτους μένειν ἀμετακινήτους τὸν αἰῶνα…',
    },
    quote:
      'Ordinance of Caesar. It is my decision concerning graves and tombs—whoever has made them for the religious observances of parents, or children, or household members—that these remain undisturbed forever. But if anyone legally charges that another person has destroyed, or has in any manner extracted those who have been buried, or has **moved with wicked intent those who have been buried to other places**, committing a crime against them, or has **moved sepulcher-sealing stones**… I wish that [violator] to suffer **capital punishment** under the title of tomb-breaker.',
    chips: [
      {
        label: 'Harper, McCormick et al. (2020), JAS: Reports 30 (OpenAlex Record)',
        href: 'https://openalex.org/works/W3003474637',
      },
      {
        label: 'Cumont, Revue historique 163 — SEG 8:13 Editio Princeps (1930, Archive.org)',
        href: 'https://archive.org/details/sim_revue-historique_january-april-1930_163_2',
      },
    ],
  },
  {
    id: 'claudius-letter-to-alexandrians',
    aliases: [],
    section: 'corroborative-and-disputed',
    group: 'disputed-documents',
    authorKey: null,
    label: 'Emperor Claudius’s *Letter to the Alexandrians* — *P.Lond.* VI 1912 (AD 41; British Library)',
    noteMd:
      '**Reason for exclusion from primary count: Addresses Alexandrian Greek-Jewish civic conflict rather than Jesus or Christians.** Published by H. Idris Bell (*Jews and Christians in Egypt*, 1924; *Corpus Papyrorum Judaicarum* II, no. 153, ed. Victor Tcherikover, 1960), this November AD 41 papyrus copy (from Philadelphia in the Fayum) of Emperor Claudius’s letter orders Alexandrian Greeks and Jews to cease hostilities following the anti-Jewish violence of AD 38 under Caligula. It forbids the Alexandrian Jews to bring in compatriots sailing from Syria or Egypt, warning against “fomenting a general plague for the whole world.” Salomon Reinach (1924) suggested that “Syria” could allude to early Jewish-Christian missionaries, whereas Bell, Tcherikover, and most Roman historians interpret Claudius as addressing armed reinforcements and rival Jewish embassies from Agrippa I’s Syrian-Judean realm; the letter names neither Jesus nor Christians. (Translation: H. Idris Bell, *Jews and Christians in Egypt*, 1924, p. 29.)',
    quote:
      'Wherefore I conjure you yet once again that, on the one side, the Alexandrines show themselves forbearing and kindly towards the Jews who for many years have dwelt in the same city… and, on the other side, I bid the Jews not to busy themselves about anything beyond what they have held hitherto, and not henceforth, as if you and they lived in two cities, to send two embassies—a thing such as never occurred before now… **and not to introduce or invite Jews who sail down to Alexandria from Syria or Egypt**, thus compelling me to conceive the greater suspicion; **otherwise I will by all means take vengeance on them as fomenting a general plague for the whole world**.',
    chips: [
      {
        label: 'Bell, Jews and Christians in Egypt — P.Lond. VI 1912 (1924)',
        href: 'https://archive.org/details/mdp.39015010705583',
      },
      {
        label: 'Hunt & Edgar, Select Papyri II, no. 212 — P.Lond. VI 1912 (LCL 1934, Archive.org)',
        href: 'https://archive.org/details/in.ernet.dli.2015.183447',
      },
    ],
  },
  {
    id: 'acts-of-pilate-forgery',
    aliases: [],
    section: 'corroborative-and-disputed',
    group: 'disputed-documents',
    authorKey: null,
    label: 'Maximinus Daia’s Forged *Acts of Pilate* (AD 311, lost; reported in Eusebius, *Church History* 9.5.1 & 1.9.3)',
    noteMd:
      '**Reason for exclusion from primary count: Lost fourth-century propaganda pamphlet bearing an inaccurate consular date.** No copy of this pagan pamphlet is extant. Eusebius of Caesarea (*Church History* 9.5.1, 9.7.1) reports that during the final eastern persecution under Emperor Maximinus Daia in AD 311–312, imperial officials fabricated derogatory *Memoirs of Pilate and the Savior* and mandated that schoolboys memorize them across cities and countryside. Eusebius (*Church History* 1.9.3) observes that the document dated Jesus’s passion to the fourth consulship of Tiberius (the seventh year of his reign, AD 21)—five years before Pontius Pilate became prefect of Judea in AD 26 (Josephus, *Antiquities* 18.35)—which indicates a late fabrication rather than an authentic first-century record. (Translation: Arthur Cushman McGiffert, *NPNF*² 1, 1890.)',
    quote:
      'Having therefore forged **Acts of Pilate and our Saviour full of every kind of blasphemy against Christ**, they sent them with the emperor’s approval to the whole of the empire subject to him, with written commands that they should be openly posted to the view of all in every place, both in country and city, and **that the schoolmasters should give them to their scholars, instead of their customary lessons, to be studied and learned by heart**.',
    chips: [
      {
        label: 'Eusebius, Church History 9.5.1 (New Advent)',
        href: 'https://www.newadvent.org/fathers/250109.htm',
      },
      {
        label: 'Eusebius, Church History 1.9.3 on Consular Date (New Advent)',
        href: 'https://www.newadvent.org/fathers/250101.htm',
      },
    ],
  },
];
