// Scholarly archaeological, epigraphic, and papyrological normalization table
// for all 42 entries in `src/data/divinityTimeline.json`.
//
// `src/data/divinityTimeline.json` is never modified on disk in this worktree
// (byte-identical patch proposals live in `data_proposals.md`). Instead, every
// raw entry is mapped explicitly to one of three dispositions:
//   - `primary`  (16): rendered as a full artifact card with `#event-<id>`
//   - `grouped`  (12): rendered as an anchored comparative/sub-witness item
//                      (`#event-<id>`) inside its thematic parent card
//   - `excluded` (14): catalogued transparently inside the Methodology & Scope
//                      audit disclosure with `#event-<id>` preserved so inbound
//                      deep links resolve cleanly.

export const DATASET_OVERRIDES = Object.freeze({
  // ===========================================================================
  // SECTION 01 — PRE-NICENE STONE, MOSAIC & METAL INSCRIPTIONS (5 primary + 6 grouped)
  // ===========================================================================
  megiddo_mosaic: {
    disposition: 'primary',
    sectionId: 'inscriptions-and-archaeology',
    evidenceTier: 'tier-a',
    title: 'Kefar ‘Othnay (Megiddo) Christian Prayer Hall Mosaic',
    displayYear:
      'Sealed c. AD 305 (excavators: c. AD 230; Adams 2013 & Bowersock 2018: late 3rd / early 4th c.)',
    sortYearStart: 230,
    sortYearEnd: 305,
    datingBasis: 'stratigraphic',
    location: 'Kefar ‘Othnay (adjacent to Legio VI Ferrata), Galilee',
    repository: 'Israel Antiquities Authority, Jerusalem',
    language: 'Koine Greek (mosaic tesserae)',
    image: {
      src: '/media/divinity_timeline/megiddo_mosaic/image_1.jpg',
      alt: 'Third-century Greek mosaic tabula ansata from Kefar Othnay dedicating the communion table by Akeptous to God Jesus Christ with nomina sacra overbars',
      caption:
        'In situ six-line Greek mosaic dedication of Akeptous at Kefar ‘Othnay (hall sealed c. AD 305; excavators’ estimate c. AD 230), showing the contracted *nomina sacra* Θ̅Ω̅ · Ι̅Υ̅ Χ̅Ω̅ (“to God Jesus Christ”) in line 5. Israel Antiquities Authority.',
    },
    keyExcerpt:
      '…προσήνικεν Ἀκεπτοῦς ἡ φιλόθεος τὴν τράπεζαν Θ̅Ω̅ · Ι̅Υ̅ Χ̅Ω̅ μνημόσυνον.',
    quoteOriginal:
      'ΠΡΟϹΗΝΙΚΕΝ / ΑΚΕΠΤΟΥϹ · / Η ΦΙΛΟΘΕΟϹ · / ΤΗΝ ΤΡΑΠΕ / ΖΑΝ · Θ̅Ω̅ · Ι̅Υ̅ Χ̅Ω̅ / ΜΝΗΜΟϹΥΝΟΝ · — προσήνικεν [read προσήνεγκεν] Ἀκεπτοῦς ἡ φιλόθεος τὴν τράπεζαν Θ(ε)ῷ Ἰ(ησο)ῦ Χ(ριστ)ῷ μνημόσυνον.',
    quoteTranslation:
      '“The God-loving Akeptous has offered the table to God Jesus Christ as a memorial.”',
    showsMarkdown:
      '**What this shows:** Dedicates a eucharistic table “to God Jesus Christ” (`Θ̅Ω̅ · Ι̅Υ̅ Χ̅Ω̅`) in a Galilean prayer hall sealed beneath deliberate fill c. AD 305. **Limits:** Ceramic, numismatic, and mosaic comparisons allow either c. AD 230 (Tepper & Di Segni 2006) or the late third / early fourth century prior to sealing c. AD 305 (Adams 2013; Bowersock 2018).',
    editionCitation:
      'Leah Di Segni, in Yotam Tepper & Leah Di Segni, *A Christian Prayer Hall of the Third Century CE at Kefar ‘Othnay (Legio)* (Jerusalem: Israel Antiquities Authority, 2006), pp. 34–36; Edward Adams, “The Ancient Church at Megiddo: The Discovery and an Assessment of Its Significance,” *The Expository Times* 120/2 (2008), pp. 62–69, and *The Earliest Christian Meeting Places* (London: Bloomsbury T&T Clark, 2013), ch. 4; Glen W. Bowersock, “Religion in Early Fourth Century Roman Palestine: The Kfar ‘Othnay Mosaics,” *Syria* 95 (2018), pp. 65–72.',
    analysisMarkdown:
      'Excavated in 2005 inside a domestic complex bordering the Roman legionary camp of Legio VI Ferrata, the prayer hall was dated to c. AD 230 by Israeli archaeologist **Yotam Tepper** and epigraphist **Leah Di Segni** (2006) from pottery, coins, and mosaic letterforms. Its archaeological *terminus ante quem* (latest possible date before sealing) is the deliberate backfilling of the room around **AD 305**, and New Testament scholar **Edward Adams** (2013) and ancient historian **Glen W. Bowersock** (*Syria* 95 [2018], pp. 65–72) date the mosaic to the late third or very early fourth century, before that sealing. Akeptous (*Accepta*) dedicates the eucharistic table (*trapeza*, avoiding the pagan altar term *bōmos*) in standard Greek votive syntax: the verb *prospherō*, here spelled `προσήνικεν` through a vowel shift, with the recipient in the dative. The anarthrous (article-less) dative **Θ(ε)ῷ** stands in direct apposition (side-by-side grammatical identification) to **Ἰ(ησο)ῦ Χ(ριστ)ῷ**, marked with supralinear *nomina sacra*, while an adjacent mosaic funded by Gaianus (*Gaianos ho kai Porphyri(o)s (hekatontarchēs)*, the rank written as a monogram) attests the patronage of a serving Roman centurion.',
    verifyLinks: [
      {
        label: 'IAA Excavation Report — Hadashot Arkheologiyot 118 (2006)',
        href: 'https://www.hadashot-esi.org.il/report_detail_eng.aspx?id=363&mag_id=111',
      },
      {
        label: 'Bowersock, Syria 95 (2018) — Kfar ‘Othnay Mosaics',
        href: 'https://web.archive.org/web/20240710235512/https://journals.openedition.org/syria/6289',
      },
    ],
    groupedHeading:
      'Regional & post-Nicene comparators (1) — contextual, not counted as pre-325 deity proof',
  },

  house_of_peter: {
    disposition: 'grouped',
    parentCardId: 'megiddo_mosaic',
    sectionId: 'inscriptions-and-archaeology',
    title:
      'Galilean Stratigraphic Comparator: Capernaum Insula Sacra Room 1 (Domus-Ecclesia Debate)',
    displayYear:
      '4th c. AD domus-ecclesia & graffiti (post-Nicene; pre-325 veneration contested)',
    sortYearStart: 325,
    sortYearEnd: 400,
    datingBasis: 'disputed-post-nicene',
    summaryMarkdown:
      'Excavating beneath the fifth-century octagonal church at Capernaum, Franciscan archaeologist **Virgilio Corbo** (*Cafarnao I*, 1975) and epigraphist **Emmanuele Testa** (*Cafarnao IV*, 1972) interpreted late first-century lime plastering in Room 1 as early communal veneration and read more than 130 multilingual plaster graffiti from later renovations as including petitions to Christ. Against that reconstruction, historian **Joan E. Taylor** (*Christians and the Holy Places*, Oxford: Clarendon Press, 1993, ch. 12; cf. [Wicker, *SWJT* 52/1, 2009, pp. 58–60](https://swbts.edu/wp-content/uploads/2024/04/52.1_Wicker.pdf), surveying Room 1 graffiti and noting scholarly disputes over Petrine identification via Taylor’s 1989–1990 study) argues that there is no demonstrable Christian veneration of Room 1 before the fourth century AD, assigns the *domus-ecclesia* enclosure and its graffiti to the fourth century and later, and judges many of Testa’s published graffito readings paleographically unreliable. The site is therefore grouped here as a contested post-Nicene comparator rather than counted as a pre-325 witness.',
  },

  frankfurt_silver_scroll: {
    disposition: 'primary',
    sectionId: 'inscriptions-and-archaeology',
    evidenceTier: 'tier-b',
    title: 'The Frankfurt Silver Inscription (Nida Grave 134)',
    displayYear: 'c. AD 230–270',
    sortYearStart: 230,
    sortYearEnd: 270,
    datingBasis: 'stratigraphic',
    location: 'Roman Nida (Frankfurt-Praunheim), Germania Superior',
    repository: 'Archäologisches Museum Frankfurt',
    language: 'Latin (with Greek *nomina sacra* I̅H̅ X̅P̅ & transliterated *Trisagion*)',
    image: {
      src: '/media/divinity_timeline/frankfurt_silver_scroll/image_1.jpg',
      alt: 'Rolled third-century silver amulet capsule excavated from Grave 134 at Roman Nida in Frankfurt',
      caption:
        'Rolled 3.5 cm silver phylactery capsule from Nida Grave 134 (c. AD 230–270), digitally unrolled by micro-CT scanning at LEIZA (Leibniz-Zentrum für Archäologie, Mainz) in 2024. Archäologisches Museum Frankfurt.',
    },
    keyExcerpt:
      '(3) In nomine I̅H̅ X̅P̅ Dei f(ilii)… (7–9) Deus valetudinibus salvis accessum praestat… (13–18) Quoniam I̅H̅ X̅P̅o omnes genua flectent…',
    quoteOriginal:
      '(1) In nomine sancti Titi. / (2) Agios, agios, agios. / (3) In nomine I̅H̅ X̅P̅ Dei f(ilii). / (4) Mundi dominus / (5) viribus omnibus / (6) incursionibus oponit. / (7) Deus valetudinibus / (8) salvis accessum / (9) praestat. Haec salus tueat / (10) hominem qui se / (11) dedit voluntati / (12) Domini I̅H̅ X̅P̅ti Dei f(ilii). / (13) Quoniam I̅H̅ X̅P̅o / (14) omnes genua flec- / (15) tent, caelestes, / (16) terrestres et / (17) inferi, et omnis lin- / (18) gua confiteatur.',
    quoteTranslation:
      '“(1) In the name of Saint Titus. (2) Holy, holy, holy! (3) In the name of Jesus Christ [IH XP], Son of God! (4–6) The Lord of the world opposes with all powers all attacks. (7–9) God grants access to healed illnesses [or, in Scholz’s reading, entry to intact health]. May this protection [or amulet] guard (10–12) the person who has entrusted himself to the will of the Lord Jesus Christ, Son of God. (13–18) Since to Jesus Christ all shall bend the knees—heavenly, earthly, and subterranean ones—and every tongue confess.”',
    showsMarkdown:
      '**What this shows:** Quotes, in adapted form, the universal acclamation of [Philippians 2:10–11](/bible/phil/2#10) (“to Jesus Christ all shall bend the knees”), writing Jesus’s name with the Greek *nomina sacra* `I̅H̅ X̅P̅`, in a grave stratigraphically dated c. AD 230–270. **Limits:** The identification of *mundi dominus* (l. 4) and *Deus* (l. 7) with Jesus is the syntactic interpretation of biblical scholar **Santiago Guijarro** (2025, p. 34); archaeologist **Markus Scholz’s** preliminary museum report (2025, pp. 4–7) leaves open whether *Deus* in l. 7 denotes God the Father or Christ.',
    editionCitation:
      'Santiago Guijarro, “El Amuleto de Frankfurt: Cristianismo popular en el *limes germanicus* / The Amulet of Frankfurt: Popular Christianity in the *limes germanicus*,” *Isidorianum* 34/1 (2025), pp. 25–48, diplomatic & reconstructed texts at pp. 30, 38; cf. Markus Scholz, *Bayerische Archäologie* 2 (2025), pp. 4–7 (whose transcription, reproduced in Guijarro, Fig. 3, p. 30, divides ll. 13–14 as “Quoniam I̅H̅ X̅P̅ o|mnes{t} genua flectent…”, rendered “before Jesus Christ” in his German translation, and brackets damaged left-edge letters such as `[in nomi?]ne sancti Tit̅i`, `[m]vndi`, and `[De?]vs`); Harald Buchinger, *Heiliger Dienst* 78/4 (2024), pp. 304–306.',
    analysisMarkdown:
      'Recovered in 2018 beneath the chin of a man buried in Grave 134 at Roman Nida, and dated between AD 230 and 270 by an accompanying ceramic incense burner and baked-clay jug, this eighteen-line silver foil is described by its excavators and editors as the earliest securely dated Christian artifact north of the Alps. Within the Latin text, the engraver retains the Greek *nomina sacra* **I̅H̅ X̅P̅** (ll. 3, 12, 13) and transliterates the Greek *Trisagion* (*Agios, agios, agios*, from [Isaiah 6:3](/bible/is/6#3)) into Latin script; liturgical historian **Harald Buchinger** (2024) identifies this as the earliest attestation of the *Trisagion* on a protective amulet. Line 1 contains an early invocation of **Saint Titus** (Guijarro, 2025, pp. 31, 40). Syntactically, Guijarro (p. 34) argues that *mundi dominus* (l. 4, `[m]vndi` on the damaged left margin) and *Deus* (l. 7, `[De?]vs`, translating *valetudinibus salvis* as healed illnesses) continue the invocation of *I̅H̅ X̅P̅ Dei f(ilii)* in l. 3, whereas Scholz (2025, pp. 4–7) construes *valetudo* as intact health and leaves open whether *Deus* denotes God the Father alongside Christ as Son of God. Lines 13–18 adapt [Philippians 2:10–11](/bible/phil/2#10) (reading dative/ablative *I̅H̅ X̅P̅o omnes genua flectent* in Guijarro or *I̅H̅ X̅P̅ o|mnes{t} genua flectent* in Scholz’s word-division) to invoke Christ’s cosmic sovereignty over unseen powers.',
    verifyLinks: [
      {
        label: 'Guijarro, Isidorianum 34/1 (2025) — Critical Edition',
        href: 'https://web.archive.org/web/20261022140203/https://www.sanisidoro.net/publicaciones/index.php/isidorianum/article/view/frankfurt-amulet-limes-germanicus',
      },
      {
        label: 'Goethe University Frankfurt Report (2024)',
        href: 'https://aktuelles.uni-frankfurt.de/en/english/frankfurt-silver-inscription-oldest-christian-testimony-found-north-of-the-alps/',
      },
      {
        label: 'LEIZA Decipherment Notice',
        href: 'https://www.leiza.de/aktuelles/aeltestes-christliches-zeugnis-noerdlich-der-alpen-entdeckt',
      },
      {
        label: 'Compare Philippians 2:10–11',
        href: '/bible/phil/2#10',
      },
    ],
  },

  dura_europos_church: {
    disposition: 'primary',
    sectionId: 'inscriptions-and-archaeology',
    evidenceTier: 'tier-b',
    title: 'Dura-Europos House Church and Baptistery',
    displayYear: 'c. AD 232–256 (sealed before AD 256)',
    sortYearStart: 232,
    sortYearEnd: 256,
    datingBasis: 'stratigraphic',
    location: 'Dura-Europos, Middle Euphrates, Syria',
    repository: 'Yale University Art Gallery, New Haven',
    language: 'Koine Greek (painted wall *dipinti* & incised graffiti)',
    image: {
      src: '/media/divinity_timeline/dura_europos_church/image_1.jpg',
      alt: 'Baptistery wall fresco from the Dura-Europos Christian building depicting Christ healing the paralytic who carries away his bed, sealed before AD 256',
      caption:
        'Baptistery wall fresco panel from the Dura-Europos Christian building depicting Christ healing the paralytic (shown lying on his pallet at right and walking away carrying his bed at left), sealed beneath the Roman defensive embankment before AD 256. Yale University Art Gallery.',
    },
    keyExcerpt:
      'Τὸν Χ(ριστὸ)ν Ἰ(ησοῦ)ν ὑμεῖν μν[ή]σκεσ[θε] [Πρ]όκλου  |  Τὸν Χρισ(τὸν) μνήσκεστε Σισέον τὸν ταπινόν.',
    quoteOriginal:
      'Τὸν Χ(ριστὸ)ν Ἰ(ησοῦ)ν ὑμεῖν μν[ή]σκεσ[θε] [Πρ]όκλου · Τὸν Χρισ(τὸν) μνήσκεστε [read μιμνήσκεσθε] Σισέον τὸν ταπινόν [read ταπεινόν].',
    quoteTranslation:
      '“Christ Jesus [be] with you; remember Proclus.” · “Remember Christ, [and] Siseon the humble [or ‘Before Christ, remember humble Siseon’].”',
    showsMarkdown:
      '**What this shows:** Attests a stratigraphically sealed pre-AD 256 Christian assembly house and baptistery where worshippers inscribed petitions invoking Christ with *nomina sacra* beside miracle frescoes. **Limits:** Surviving Dura wall inscriptions invoke “Christ Jesus” (`Χ̅Ν̅ Ι̅Ν̅`) without applying the noun `θεός` directly.',
    editionCitation:
      'C. Bradford Welles, in Carl H. Kraeling, *The Excavations at Dura-Europos, Final Report VIII, Part II: The Christian Building* (New Haven: Yale University Press, 1967), pp. 89–97, nos. 17–18.',
    analysisMarkdown:
      'The building began as a private courtyard house bearing a plaster graffito dated to Seleucid Year 544 (AD 232/233 in the Syrian calendar counting from 312 BC). It was converted into a liturgical assembly hall and baptistery around AD 240 and buried inside the city’s western defensive rampart before the Sasanian Persian siege destroyed Dura-Europos in AD 256, which gives it a fixed archaeological *terminus ante quem*. On the south wall of the baptistery (Room 6), framing the David and Goliath fresco, visitors incised intercessory petitions invoking “Christ Jesus” using contracted *nomina sacra* (**Χ(ριστὸ)ν Ἰ(ησοῦ)ν**, published by Yale epigraphist **C. Bradford Welles**, 1967, pp. 95–96, nos. 17 & 18) rather than predicating *theos*. Elsewhere in the baptistery, a fresco depicts Christ and Peter walking on the water ([Matthew 14:25–33](/bible/mt/14#25)), while the panel above shows the healing of the paralytic; archaeologist **Carl H. Kraeling** (1967) weighs whether the scene follows Bethesda ([John 5:2–9](/bible/jn/5#2)) or Capernaum ([Mark 2:5–12](/bible/mk/2#5)), where the Synoptic account links the healing to Jesus’s authority to forgive sins.',
    verifyLinks: [
      {
        label: 'Peppard, The World’s Oldest Church — Dura-Europos Baptistery (2016)',
        href: 'https://archive.org/details/MichaelPeppardTheWorldsOldestChurchBibleArtAndRitualAtDuraEuroposSyria',
      },
      {
        label: 'Read Mark 2:5–12',
        href: '/bible/mk/2#5',
      },
      {
        label: 'Read John 5:2–9',
        href: '/bible/jn/5#2',
      },
    ],
  },

  abercius_inscription: {
    disposition: 'primary',
    sectionId: 'inscriptions-and-archaeology',
    evidenceTier: 'tier-c',
    title: 'Funerary Cippus of Abercius of Hieropolis & Phrygian Epigraphy',
    displayYear: 'Before AD 216 (c. AD 190–200)',
    sortYearStart: 190,
    sortYearEnd: 216,
    datingBasis: 'dated-epigraphic',
    location:
      'Hieropolis (Koçhisar / Kemikli; traditionally spelled Hierapolis), Phrygia Salutaris',
    repository: 'Museo Pio Cristiano, Vatican Museums (inv. 31643)',
    language: 'Greek dactylic hexameters',
    image: {
      src: '/media/divinity_timeline/abercius_inscription/image_4.jpg',
      alt: 'Museo Pio Cristiano full epigraphic reconstruction of the funerary cippus of Abercius of Hieropolis displaying the restored twenty-two-verse Greek hexameter inscription',
      caption:
        'Museo Pio Cristiano epigraphic reconstruction of the cippus of Abercius of Hieropolis, restoring the twenty-two-verse Greek epitaph from the two marble fragments discovered by William M. Ramsay in 1883 (inv. 31643, displayed alongside) and from the manuscript *Vita Abercii*.',
    },
    keyExcerpt:
      '…μαθητὴς ποιμένος ἁγνοῦ… παρέθηκε τροφὴν πάντη ἰχθὺν ἀπὸ πηγῆς πανμεγέθη καθαρόν…',
    quoteOriginal:
      'μαθητὴς ποιμένος ἁγνοῦ, / ὃς βόσκει προβάτων ἀγέλας ὄρεσιν πεδίοις τε, / ὀφθαλμοὺς ὃς ἔχει μεγάλους πάντη καθορῶντας… / Πίστις πάντη δὲ προῆγε / καὶ παρέθηκε τροφὴν πάντη ἰχθὺν ἀπὸ πηγῆς / πανμεγέθη καθαρόν, ὃν ἐδράξατο παρθένος ἁγνή.',
    quoteTranslation:
      '“[I am] a disciple of the chaste Shepherd, who feeds flocks of sheep on mountains and plains, who has great eyes that oversee all things… Everywhere Faith led the way and set before [me] everywhere for food a Fish from a spring, immense, pure, which a holy Virgin grasped.”',
    showsMarkdown:
      '**What this shows:** Attests, before AD 216, Christian sacramental devotion spanning several provinces and centered on an all-seeing Shepherd and the eucharistic *Ichthys* (“Fish”: *Jesus Christ, God’s Son, Savior*). **Limits:** Written in veiled symbolic verse, the epitaph refers to Jesus through the *Ichthys* acrostic (“God’s Son, Savior”) rather than predicating `θεός` directly.',
    editionCitation:
      'William M. Ramsay, *Journal of Hellenic Studies* 4 (1883), pp. 424–427; Wolfgang Wischmeyer, “Die Aberkiosinschrift als Grabepigramm,” *Jahrbuch für Antike und Christentum* 23 (1980), pp. 22–47 (*SEG* 30.1479); Margaret M. Mitchell, “Looking for Abercius: Reimagining Contexts of Interpretation of the ‘Earliest Christian Inscription,’” in *Commemorating the Dead: Texts and Artifacts in Context*, ed. Laurie Brink & Deborah Green (Berlin: Walter de Gruyter, 2008), pp. 303–335.',
    analysisMarkdown:
      'The epitaph was composed for the second-century Phrygian bishop **Abercius of Hieropolis** (in the Phrygian Pentapolis at Koçhisar; spelled *Hierapolis* in the hagiographical tradition). Its date is fixed epigraphically: the gravestone of Alexander son of Antonius (*IGR* IV 694), dated on the stone to Sullan Year 300 (**AD 216** in the provincial calendar counting from 85 BC), copies Abercius’s opening and closing hexameters verbatim. Although German scholars **Gerhard Ficker** (1894) and **Albrecht Dieterich** (1896) proposed pagan readings tied to the cult of Cybele and Attis, subsequent epigraphic scholarship, including church historian **Wolfgang Wischmeyer** (1980) and New Testament scholar **Margaret M. Mitchell** (2008), has upheld the Christian interpretation established by archaeologist **William M. Ramsay** (1883). Recounting journeys from Phrygia through Rome to Nisibis beyond the Euphrates, Abercius describes congregations united around a Shepherd with all-seeing eyes (*pantē kathorōntas*), Paul’s writings (`Παῦλον ἔχων ἐπ’ [ὄχῳ]`, “having Paul on [my carriage],” or `ἑπό[μην]`, “having Paul, I followed”), a “holy Virgin,” and the eucharistic **Ἰχθύς** (*Ichthys*, the five-letter Greek acrostic for *Iēsous Christos Theou Huios Sōtēr*, “Jesus Christ, God’s Son, Savior”).',
    verifyLinks: [
      {
        label: 'Vatican Museums — Inscription of Abercius',
        href: 'https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/lapidario-cristiano/abercio/cippo-di-albercio.html',
      },
      {
        label: 'Vatican Museums — Abercius & Christian Lapidarium',
        href: 'https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/lapidario-cristiano/abercio/abercio.html',
      },
    ],
    groupedHeading:
      'Regional & post-Nicene comparators (3) — contextual, not counted as pre-325 deity proof',
  },

  epitaph_of_pectorius: {
    disposition: 'grouped',
    parentCardId: 'abercius_inscription',
    sectionId: 'inscriptions-and-archaeology',
    title:
      'Marble Ichthys Acrostic Epitaph of Pectorius (Autun — 4th-c. Stone Preserving Older Hymn)',
    displayYear:
      'Stone 4th c. AD (post-Nicene copy); acrostic hymn (ll. 1–6) argued 2nd–3rd c. AD',
    sortYearStart: 200,
    sortYearEnd: 375,
    datingBasis: 'composition-copy',
    summaryMarkdown:
      'Excavated in 1839 at Saint-Pierre-l’Estrier in Autun (Musée Rolin, IG XIV 2525; SEG 47.1520), the marble slab erected by the fourth-century Gallic Christian **Pectorius** for his parents (**Aschandius** and his mother, `[Ἀσ]χάνδιε [πά]τερ… μνήσεο Πεκτορίοιο`) dates paleographically to the **fourth century AD (post-Nicene)**. Epigraphist **Carl Maria Kaufmann** (*Handbuch der altchristlichen Epigraphik*, 1917, pp. 179–181), patristic historian **Johannes Quasten** (*Patrology* I, 1950), and epigraphist **Margherita Guarducci** (*Epigrafia greca* IV, 1978) distinguish an older second- or third-century Greek eucharistic hymn from Asia Minor in ll. 1–6—where the initial letters of ll. 1–5 spell **ΙΧΘΥϹ** (`Ἰχθύος ο[ὐρανίου θεῖ]ον γένος…`)—from Pectorius’s fourth-century personal epitaph in ll. 7–11. Because the direct vocatives **δέσποτα σῶτ[ερ]** (“Master and Savior”) and **φῶς τὸ θανόντων** (“Light of the dead”) stand in ll. 7–8 (the fourth-century personal section rather than the older ll. 1–6 hymn), the slab is grouped here as a post-Nicene comparator rather than counted as an independent pre-325 proof.',
  },

  eumeneian_formula_inscriptions: {
    disposition: 'grouped',
    parentCardId: 'abercius_inscription',
    sectionId: 'inscriptions-and-archaeology',
    title: 'Eumeneian Formula Funerary Cippi (Phrygia)',
    displayYear: 'c. AD 240–305',
    sortYearStart: 240,
    sortYearEnd: 305,
    datingBasis: 'dated-epigraphic',
    summaryMarkdown:
      'Dozens of tombstones around Eumeneia and Apameia (many dated by the Sullan calendar between AD 246 and 279; William M. Ramsay, *Cities and Bishoprics of Phrygia*, Vol. I.2, 1897, pp. 353–395, 514–561) warn anyone who violates the tomb: **ἔσται αὐτῷ πρὸς τὸν θεόν** (“he shall reckon with God”). Because the formula itself does not name Jesus and was used by both Jewish and Christian families in Phrygia (New Testament scholar **Paul R. Trebilco**, *Jewish Communities in Asia Minor*, Cambridge, 1991, pp. 58–84; Paul R. Trebilco, *Mediterraneo Antico* 5/1 [2002], pp. 63–97), it serves here solely as regional funerary context.',
  },

  phrygian_montanist_tombstones: {
    disposition: 'grouped',
    parentCardId: 'abercius_inscription',
    sectionId: 'inscriptions-and-archaeology',
    title: 'Upper Tembris Valley “Christians for Christians” Steles',
    displayYear: 'c. AD 240–305',
    sortYearStart: 240,
    sortYearEnd: 305,
    datingBasis: 'epigraphic-contextual',
    summaryMarkdown:
      'Rural Phrygian funerary monuments bear the openly inscribed formula **Χριστιανοὶ Χριστιανοῖς** (“Christians for Christians”; epigraphist **Elsa Gibson**, *The “Christians for Christians” Inscriptions of Phrygia*, Harvard Theological Studies 32, 1978), documenting public Christian self-identification in central Anatolia before Constantine without predicating titles of deity.',
  },

  stele_of_licinia_amias: {
    disposition: 'primary',
    sectionId: 'inscriptions-and-archaeology',
    evidenceTier: 'tier-c',
    title: 'Stele of Licinia Amias & Pre-Constantinian Roman Necropoleis',
    displayYear: 'c. AD 200–240',
    sortYearStart: 200,
    sortYearEnd: 240,
    datingBasis: 'epigraphic-contextual',
    location: 'Vatican necropolis area, Rome',
    repository: 'Museo Nazionale Romano, Terme di Diocleziano (inv. 67646)',
    language: 'Bilingual Latin & Greek marble stele',
    image: null,
    quoteOriginal:
      'D(is) [carved wreath] M(anibus) / ΙΧΘΥϹ · ΖΩΝΤΩΝ / [two fish flanking an anchor] / Liciniae Amiati be/nemerenti vixit…',
    quoteTranslation:
      '“[Conventional Roman tomb header: D(is) M(anibus).] Fish of the living [ΙΧΘΥϹ: Jesus Christ, God’s Son, Savior]. To the well-deserving Licinia Amias, who lived…”',
    showsMarkdown:
      '**What this shows:** Attests the *Ichthys* acrostic (“Jesus Christ, God’s Son, Savior”) as a public funerary confession—`ΙΧΘΥϹ · ΖΩΝΤΩΝ` (“Fish of the living”)—in early third-century Rome. **Limits:** Conveys filial and soteriological confession (“God’s Son, Savior”) via an acrostic emblem rather than an explicit `θεός` predication.',
    editionCitation:
      '*Inscriptiones Christianae Urbis Romae* (ICUR) n.s. II 4246; Epigraphic Database Roma EDR111386.',
    analysisMarkdown:
      'Transitional workshop features—retaining the conventional Roman tomb header *D(is) M(anibus)* (“to the spirits of the departed”) above a Greek Christian confession—place the marble stele of Licinia Amias in the early third century under the Severan emperors (AD 193–235). Beneath the header wreath, two fish flanking an anchor accompany the Greek legend **ΙΧΘΥϹ · ΖΩΝΤΩΝ** (“Fish of the living,” using the five-letter acrostic *Iēsous Christos Theou Huios Sōtēr*), paralleling the contemporary *Ichthys* symbolism of Phrygia.',
    verifyLinks: [
      {
        label: 'Marucchi, Christian Epigraphy (1912), no. 52',
        href: 'https://archive.org/details/christianepigrap00maru',
      },
      {
        label: 'Kaufmann, Altchristliche Epigraphik (1917), Fig. 5',
        href: 'https://archive.org/details/handbuchderaltch00kauf',
      },
    ],
    groupedHeading:
      'Regional funerary comparators (2) — contextual, not counted as standalone deity proof',
  },

  catacomb_of_priscilla: {
    disposition: 'grouped',
    parentCardId: 'stele_of_licinia_amias',
    sectionId: 'inscriptions-and-archaeology',
    title: 'Catacomb of Priscilla Funerary Plaques (Via Salaria, Rome)',
    displayYear: '3rd century AD',
    sortYearStart: 210,
    sortYearEnd: 300,
    datingBasis: 'epigraphic-contextual',
    summaryMarkdown:
      'Third-century Greek and Latin *loculus* closures (inscribed plaques sealing wall burial niches along the Via Salaria; ICUR n.s. VIII–IX) pair anchor-and-`ΙΧΘΥϹ` emblems with prayers for peace in Christ, beside frescoes of the Good Shepherd and the raising of Lazarus ([John 11:38–44](/bible/jn/11#38)).',
  },

  san_sebastiano_graffiti: {
    disposition: 'grouped',
    parentCardId: 'stele_of_licinia_amias',
    sectionId: 'inscriptions-and-archaeology',
    title: 'Memoria Apostolorum Courtyard Graffiti at San Sebastiano (Via Appia)',
    displayYear: 'c. AD 258–300',
    sortYearStart: 258,
    sortYearEnd: 300,
    datingBasis: 'stratigraphic',
    summaryMarkdown:
      'Hundreds of Latin and Greek pilgrim graffiti (ICUR n.s. V 12907–13096 and detached plaster fragments) incised into the covered *triclia* (funerary banquet courtyard) on the Via Appia between c. AD 258 and Constantine’s *Basilica Apostolorum* primarily invoke the martyrs **Peter and Paul** (*Petre et Paule, in mente habete…*); their Christological bearing is limited to occasional accompanying `ΙΧΘΥϹ` acrostics and *nomina sacra*.',
  },

  // ===========================================================================
  // SECTION 02 — HOSTILE, RITUAL & RIVAL-CHRISTIAN WITNESSES (3 primary + 2 grouped)
  // ===========================================================================
  alexamenos_graffito: {
    disposition: 'primary',
    sectionId: 'hostile-and-external-witnesses',
    evidenceTier: 'tier-a',
    title: 'The Alexamenos Graffito (Palatine Paedagogium, Rome)',
    displayYear: 'c. AD 200 (Severan range c. AD 190–235)',
    sortYearStart: 190,
    sortYearEnd: 235,
    datingBasis: 'stratigraphic',
    location: 'Domus Gelotiana / Paedagogium, Palatine Hill, Rome',
    repository: 'Antiquarium del Palatino, Rome (inv. 381403)',
    language: 'Koine Greek (incised wall plaster)',
    image: {
      src: '/media/divinity_timeline/alexamenos_graffito/image_1.jpg',
      alt: 'Plaster panel of the Alexamenos Graffito from the Palatine Hill depicting a crucified donkey-headed figure with Greek text ALEXAMENOS SEBETE THEON',
      caption:
        'Left: incised Severan wall plaster from the Palatine Paedagogium (c. AD 200; Antiquarium del Palatino). Right: archaeological line tracing clarifying the faint strokes—Alexamenos at left raising one hand in adoration toward a donkey-headed figure on a cross at upper right above ΑΛΕΞΑΜΕΝΟϹ ϹΕΒΕΤΕ ΘΕΟΝ.',
    },
    secondaryImage: {
      src: '/media/divinity_timeline/alexamenos_graffito/image_4.jpg',
      alt: 'Archaeological black-and-white line tracing of the Alexamenos Graffito showing Alexamenos raising one hand toward the crucified donkey-headed figure above the four-line Greek inscription',
    },
    quoteOriginal:
      'ΑΛΕΞΑΜΕΝΟϹ ϹΕΒΕΤΕ ΘΕΟΝ — Ἀλεξαμενὸς σέβετε [read σέβεται] θεόν.',
    quoteTranslation: '“Alexamenos worships [his] god [or ‘God’].”',
    showsMarkdown:
      '**What this shows:** Records a caricature of c. AD 200 ridiculing an imperial page named Alexamenos, evidently a Christian, for offering cultic worship (`σέβεται`) to a crucified figure as `θεόν`. **Limits:** Because Koine Greek has no indefinite article, article-less `θεόν` can be rendered either “worships [his] God” or “worships a god” (paralleling Pliny’s *quasi deo*).',
    editionCitation:
      'Raffaele Garrucci, *Il Crocifisso graffito in casa dei Cesari* (Rome, 1857); Carl Maria Kaufmann, *Handbuch der altchristlichen Epigraphik* (1917), pp. 302–303; Heikki Solin & Marja Itkonen-Kaila, *Graffiti del Palatino I: Paedagogium* (Helsinki, 1966), no. 246; Peter Lampe, *From Paul to Valentinus* (2003), p. 338.',
    analysisMarkdown:
      'The graffito was uncovered in November 1856 (and published by Raffaele Garrucci in 1856–1857) in the training quarters for imperial household pages on Rome’s Palatine Hill, where wall phases of the Severan period (AD 193–235) and later structural blocking place the plaster around **c. AD 200** (Finnish epigraphists **Heikki Solin and Marja Itkonen-Kaila**, 1966, no. 246; historian **Peter Lampe**, 2003). The caricature shows a youth raising one hand in a gesture of veneration toward a crucified figure with an ass’s head, reflecting the Greco-Roman charge of *onolatreia* (donkey-worship) answered by Tertullian (*Apologeticum* 16.12, AD 197) and Minucius Felix (*Octavius* 9.3). Whether anarthrous **θεόν** is translated “God” or “a god,” the caricature presupposes that Christians in Severan Rome were known to offer cultic worship (**σέβεται**) to a crucified man as divine. (A second inscription reported nearby by Carlo L. Visconti in 1870, *Alexamenos fidelis*, “Alexamenos is faithful,” is catalogued by Solin as no. ∗2 because Raffaele Garrucci questioned its antiquity.)',
    verifyLinks: [
      {
        label: 'Garrucci, Il Crocifisso graffito (1857) — Editio Princeps',
        href: 'https://archive.org/details/bub_gb_kE9SZ86woNQC',
      },
      {
        label: 'Kaufmann, Altchristliche Epigraphik (1917), pp. 302–303',
        href: 'https://archive.org/details/handbuchderaltch00kauf',
      },
    ],
  },

  magic_crucifixion_gem: {
    disposition: 'primary',
    sectionId: 'hostile-and-external-witnesses',
    evidenceTier: 'tier-b',
    title: 'The Pereire Magical Crucifixion Bloodstone (British Museum)',
    displayYear: 'Late 2nd–early 3rd c. AD (Kotansky 2017; Spier 2007: late 2nd–3rd c.)',
    sortYearStart: 175,
    sortYearEnd: 300,
    datingBasis: 'epigraphic-contextual',
    location: 'Eastern Mediterranean (Asia Minor or Syria)',
    repository: 'British Museum, London (1986,0501.1)',
    language: 'Koine Greek & ritual *voces magicae* (power-words)',
    image: {
      src: '/media/divinity_timeline/magic_crucifixion_gem/image_1.jpg',
      alt: 'Pereire bloodstone heliotrope intaglio in the British Museum engraved with the crucified Jesus surrounded by Greek invocations Son Father Jesus Christ',
      caption:
        'Obverse of the British Museum Pereire bloodstone (heliotrope) intaglio (1986,0501.1, late second or third century AD), engraving the crucified Jesus surrounded by ΥΙΕ ΠΑΤΗΡ ΙΗϹΟΥ ΧΡΙϹΤΕ (“O Son, Father, O Jesus Christ”). Trustees of the British Museum.',
    },
    keyExcerpt:
      'Υἱέ, πατήρ, Ἰησοῦ Χριστέ… ἀρτάννα λ̣υσίου [υ]ἱ[οῦ].',
    quoteOriginal:
      'ΥΙΕ ΠΑΤΗΡ ΙΗϹΟΥ ΧΡΙϹΤΕ ϹΟΑΜ ΝΩΑΜ… ΑΡΤΑΝΝΑ Λ̣ΥϹΙΟΥ [Υ]Ι[ΟΥ] — Υἱέ, πατήρ, Ἰησοῦ Χριστέ… ἀρτάννα λ̣υσίου [υ]ἱ[οῦ].',
    quoteTranslation:
      '“O Son, Father, O Jesus Christ [followed by ritual power-words]… O cross(-beam) of the Redeeming [S]o[n]!”',
    showsMarkdown:
      '**What this shows:** Pairs one of the earliest surviving gemstone depictions of the crucifixion with a Greek prayer invoking “Son, Father, Jesus Christ” and “Redeeming Son” in the late second or third century. **Limits:** Reflects heterodox ritual adaptation rather than conciliar orthodoxy; glyptics specialist **Attilio Mastrocinque** (2014, p. 194) saw a **Monarchian** formula in the opening line, a reading that epigraphist **Roy D. Kotansky** (2017, p. 637 & n. 8) rejects.',
    editionCitation:
      'Jeffrey Spier, *Late Antique and Early Christian Gems* (Wiesbaden: Reichert, 2007), pp. 72–75, no. 443; Attilio Mastrocinque, *Les intailles magiques du département des Monnaies, Médailles et Antiques* (Paris: BnF, 2014), p. 194; Roy D. Kotansky, “The Magic ‘Crucifixion’ Gem in the British Museum,” *Greek, Roman, and Byzantine Studies* 57 (2017), pp. 631–659, at pp. 632, 636–638 & n. 8; Felicity Harley-McGowan, “Picturing the Passion,” in *The Routledge Handbook of Early Christian Art*, ed. Robin M. Jensen & Mark D. Ellison (London: Routledge, 2018), pp. 290–307.',
    analysisMarkdown:
      'Engraved on green-and-red **bloodstone** (heliotrope) in the late second or early third century AD (Kotansky, 2017, p. 632; gem specialist **Jeffrey Spier**, 2007, no. 443; art historian **Felicity Harley-McGowan**, 2018), British Museum 1986,0501.1 is the earliest surviving gemstone image of Jesus on the cross. Kotansky (pp. 636–638, 648) reads the inscription framing the obverse, set amid *voces magicae* (ritual power-words that on Greco-Egyptian amulets accompany minor spirits, angels, and supreme deities alike), as a heterodox Christian prayer that opens **Υἱέ, πατήρ, Ἰησοῦ Χριστέ** (“O Son, Father, O Jesus Christ”) and closes with `ἀρτάννα λ̣υσίου [υ]ἱ[οῦ]` (“cross-beam of the Redeeming Son”); the gem was later reused, its reverse engraved by a non-Christian magical cutter. Retaining the older reading `εἷς` (“unique”) at the top of the stone, Mastrocinque (2014, p. 194) translated “unique Father Jesus Christ” and saw a reference to **Monarchianism** (here, the modalist belief that the Father himself suffered on the cross). Kotansky (2017, p. 637 & n. 8) rejects this reading on paleographical grounds (the top word reads `Υἱέ`, “O Son,” as established by Spier) and on chronological grounds (arguing that Monarchianism spread later, in the third and fourth centuries). He interprets `Son–Father–Jesus Christ` instead as “a somewhat unusual and unorthodox Trinitarian formula” pairing the pre-existent *Son + Father* with the crucified historical redeemer *Jesus Christ*. On either reconstruction, the gem associates paternal and redemptive titles with the crucified Jesus in Mediterranean ritual practice more than a century before Constantine.',
    verifyLinks: [
      {
        label: 'Kotansky, GRBS 57 (2017) — Open-Access Study',
        href: 'https://grbs.library.duke.edu/index.php/grbs/article/view/15935',
      },
      {
        label: 'Kotansky, GRBS 57 (2017) — Full-Text PDF (BM 1986,0501.1)',
        href: 'https://grbs.library.duke.edu/index.php/grbs/article/download/15935/7041',
      },
    ],
    groupedHeading:
      'Related magical & post-Nicene comparators (2) — contextual only; not counted among pre-325 primary witnesses',
  },

  paris_magical_papyrus: {
    disposition: 'grouped',
    parentCardId: 'magic_crucifixion_gem',
    sectionId: 'hostile-and-external-witnesses',
    title:
      'Great Magical Papyrus of Paris — Exorcistic Recipe of Pibechis (PGM IV.3019–3020)',
    displayYear:
      '2nd–3rd c. AD formulary; codex BnF Suppl. grec 574 copied c. AD 300–350',
    sortYearStart: 250,
    sortYearEnd: 350,
    datingBasis: 'composition-copy',
    summaryMarkdown:
      '*PGM* IV.3019–3020, an exorcism of older Hellenistic-Jewish origin ascribed to **Pibechis** (a legendary Egyptian magician) and preserved in the Theban magical anthology BnF Suppl. grec 574 (copied c. **AD 300–350** on paleographical grounds, and so possibly post-Nicene), opens with **ὁρκίζω σε κατὰ τοῦ θεοῦ τῶν Ἑβραίων Ἰησοῦ** (“I adjure you by the God of the Hebrews, Jesus”; Karl Preisendanz, *PGM* I, 1928; Hans Dieter Betz, *The Greek Magical Papyri in Translation*, 2nd ed., 1992). Philologist **Adolf Deissmann** ([*Light from the Ancient East*](https://archive.org/details/lightfromancient00deis), 1st Eng. ed. 1910, pp. 250–260; rev. ed. 1927) and historian **W. L. Knox** (*Harvard Theological Review* 31 [1938], pp. 191–203) argued that **Ἰησοῦ** was inserted secondarily by a syncretistic ritualist equating Jesus’s exorcistic name with Israel’s God; because the surviving codex copy straddles AD 325, it is grouped here as a comparative formulary.',
  },

  costanza_gem: {
    disposition: 'grouped',
    parentCardId: 'magic_crucifixion_gem',
    sectionId: 'hostile-and-external-witnesses',
    title: 'Comparative Parallel: The Constanza Carnelian Gem (4th c. AD)',
    displayYear: 'Mid-4th century AD (post-Nicene comparator)',
    sortYearStart: 325,
    sortYearEnd: 375,
    datingBasis: 'epigraphic-contextual',
    summaryMarkdown:
      'Found at Constanța (ancient Tomis, Romania; British Museum 1895,1113.1, catalogued in [O. M. Dalton, *Catalogue of Early Christian Antiquities*, 1901, p. 8, no. 43](https://archive.org/details/catalogueofearly00britiala)) and dated by gem specialist **Jeffrey Spier** (*Late Antique and Early Christian Gems*, 2007, pp. 73–74, no. 444) to the mid-fourth century AD rather than the pre-Nicene era, this carnelian intaglio places **ΙΧΘΥϹ** above the crucified Christ flanked by twelve diminutive apostles, illustrating the shift from third-century magical bloodstones to fourth-century Christian devotional rings.',
  },

  marcionite_inscription: {
    disposition: 'primary',
    sectionId: 'hostile-and-external-witnesses',
    evidenceTier: 'tier-c',
    title: 'Marcionite Synagogue Lintel of Deir Ali (Lebaba)',
    displayYear: 'AD 318/319 (Seleucid Year 630)',
    sortYearStart: 318,
    sortYearEnd: 319,
    datingBasis: 'dated-epigraphic',
    location: 'Deir Ali (ancient Lebaba), south of Damascus, Syria',
    repository: 'Recorded in situ by Le Bas & Waddington (LBW 2558 = OGIS 608)',
    language: 'Koine Greek stone lintel',
    image: null,
    quoteOriginal:
      'Συναγωγὴ Μαρκιωνιστῶν κώμ(ης) Λεβάβων τοῦ κ(υρίο)υ καὶ σ(ωτῆ)ρ(ος) Ἰη(σοῦ) Χρηστοῦ, προνοίᾳ Παύλου πρεσβ(υτέρου) τοῦ λχʹ ἔτους.',
    quoteTranslation:
      '“Meeting-house [synagōgē] of the Marcionites of the village of Lebaba, of the Lord and Savior Jesus Chrestos [= Christ], through the provision of Paul the presbyter — in the year 630 [AD 318/319].”',
    showsMarkdown:
      '**What this shows:** Documents a Marcionite meeting-house lintel, dated on the stone to AD 318/319, that calls Jesus “Lord and Savior” (`τοῦ ΚΥ· καὶ ϹΡ Ι̅Η̅ Χρηστοῦ`) using sacred-name abbreviations (*nomina sacra*). **Limits:** Attests lordship titles (`Κύριος καὶ Σωτήρ`) that Marcionite and proto-orthodox Christians shared, plausibly from before the mid-second-century schism, but it does not apply `θεός` to Jesus, and Marcionite theology rejected the God of Israel.',
    editionCitation:
      'Philippe Le Bas & William Henry Waddington, *Inscriptions grecques et latines recueillies en Grèce et en Asie Mineure*, Vol. III (Paris, 1870), no. 2558; Wilhelm Dittenberger, *Orientis Graeci Inscriptiones Selectae*, Vol. II (Leipzig, 1905), no. 608.',
    analysisMarkdown:
      'Carved onto a basalt lintel south of Damascus and dated on stone to Year 630 of the Seleucid Era (**AD 318/319** in the Syrian calendar counting from 312 BC, six to seven years before Nicaea), this is the only known archaeologically dated building inscription of a Marcionite congregation. The spelling *Χρηστοῦ* reflects iotacism, the merging of vowel sounds in Koine pronunciation, for *Χριστοῦ* (although church historian **Adolf von Harnack**, *Marcion*, 1921, suggested a deliberate Marcionite play on *chrēstos*, “good”). Marcion of Sinope (active c. AD 140–160) rejected the Hebrew Scriptures and separated the Father of Jesus from the Creator God, and Marcionite and proto-orthodox Christians remained in open schism from the mid-second century onward. That both traditions use **Κύριος καὶ Σωτήρ** (“Lord and Savior”) and sacred-name abbreviations (*nomina sacra*) for Jesus therefore most plausibly reflects shared Christian usage predating the breach of c. AD 144, rather than later imperial standardization.',
    verifyLinks: [
      {
        label: 'Dittenberger, OGIS Vol. II no. 608 (Internet Archive)',
        href: 'https://archive.org/details/orientisgraeciin02dittuoft',
      },
    ],
  },

  // ===========================================================================
  // SECTION 04 — EARLIEST BIBLICAL PAPYRI & NOMINA SACRA (4 primary + 3 grouped)
  // ===========================================================================
  papyrus_66_john_1_1: {
    disposition: 'primary',
    sectionId: 'earliest-biblical-papyri',
    evidenceTier: 'tier-a',
    title: 'Papyrus Bodmer II (𝔓66) & Hanna Papyrus 1 (𝔓75) — Gospel of John',
    displayYear:
      'c. AD 200–250 (Orsini & Clarysse 2012; late 2nd–4th c. debate in Nongbri 2014/2018)',
    sortYearStart: 200,
    sortYearEnd: 250,
    datingBasis: 'paleographical',
    location: 'Jabal Abu Mana / Dishna region, Upper Egypt',
    repository: 'Fondation Martin Bodmer, Cologny (P.Bodmer II) & Vatican Library (Hanna 1)',
    language: 'Koine Greek papyrus codices',
    image: {
      src: '/media/divinity_timeline/papyrus_66_john_1_1/image_2.jpg',
      alt: 'Folio 1 recto of Papyrus Bodmer II (P66) opening the Gospel of John with En arche en ho logos and contracted nomina sacra THS and THY',
      caption:
        'Folio 1 recto of Papyrus Bodmer II (𝔓66, c. AD 200–250 per Orsini & Clarysse 2012), preserving John 1:1–14a with supralinear *nomina sacra* contractions (πρὸς τὸ[ν Θ̅Ν̅] καὶ Θ̅Ϲ̅ ἦν ὁ λόγος in v. 1, and Θ̅Υ̅ in vv. 6, 12, 13). Fondation Martin Bodmer.',
    },
    keyExcerpt:
      '[John 1:1 in 𝔓66] …καὶ Θ̅Ϲ̅ ἦν ὁ λόγος  ·  [John 1:18 in 𝔓66] μονογενὴς Θ̅Ϲ̅…  ·  [John 20:28 in 𝔓66] ὁ Κ̅Ϲ̅ μου κ[αὶ ὁ Θ̅Ϲ̅ μου].',
    quoteOriginal:
      '[John 1:1 in 𝔓66 f. 1r] Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸ[ν Θ̅Ν̅], καὶ Θ̅Ϲ̅ ἦν ὁ λόγος  ·  [John 1:18 in 𝔓66 f. 1v] μονογενὴς Θ̅Ϲ̅ ὁ ὢν εἰς τὸν κόλπον τ[οῦ] Π̅Ρ̅Ϲ̅  ·  [John 20:28 in 𝔓66 p. 149 (ρμθ); restored letters in brackets] ὁ Κ̅Ϲ̅ μου κ[αὶ ὁ Θ̅Ϲ̅ μου].',
    quoteTranslation:
      '[John 1:1] “In the beginning was the Word, and the Word was with God, and the Word was God.”  ·  [John 1:18] “No one has seen God at any time; the only begotten God who is in the bosom of the Father, He has explained [Him].”  ·  [John 20:28] “Thomas answered and said to Him, ‘My Lord and my God!’”',
    showsMarkdown:
      '**What this shows:** Preserves [John 1:1](/bible/jn/1#1) (`Θ̅Ϲ̅ ἦν ὁ λόγος`), [John 1:18](/bible/jn/1#18) (`μονογενὴς Θ̅Ϲ̅`), and the opening clause of [John 20:28](/bible/jn/20#28) (`ὁ Κ̅Ϲ̅ μου κ[αὶ ὁ Θ̅Ϲ̅ μου]`) on papyrus leaves assigned by Orsini & Clarysse (2012) to AD 200–250. **Limits:** **Brent Nongbri** (2014/2018) argues that comparable dated hands could place `𝔓66` and `𝔓75` anywhere from the late second to the early fourth century, and [John 1:18](/bible/jn/1#18) carries an early textual split between `θεός` and `υἱός`.',
    editionCitation:
      'Victor Martin, *Papyrus Bodmer II: Évangile de Jean chap. 1–14* (Cologny-Genève, 1956); Victor Martin & J. W. B. Barns, *Supplément: Évangile de Jean chap. 14–21* (1962); Pasquale Orsini & Willy Clarysse, *ETL* 88 (2012), pp. 443–474 (AD 200–250); cf. Brent Nongbri, *God’s Library* (New Haven: Yale University Press, 2018), ch. 5 (pp. 157–215).',
    analysisMarkdown:
      '**𝔓66** (`Papyrus Bodmer II`) and **𝔓75** (`Hanna Papyrus 1`) preserve the opening of John’s prologue ([1:1](/bible/jn/1#1)) and [John 8:58](/bible/jn/8#58) (`πρὶν Ἀβραὰμ γενέσθαι ἐγὼ εἰμί`, intact in `𝔓75` and reading `[ἐγὼ] εἰμί` at a line break in `𝔓66`). In John 1:1 the anarthrous predicate **Θ̅Ϲ̅** (used without the article), placed before the verb, functions qualitatively, ascribing divine nature to the *Logos* while distinguishing him from `τὸν Θ̅Ν̅` (Greek grammarian **Philip B. Harner**, *JBL* 92 [1973], pp. 75–87, refining **E. C. Colwell**, *JBL* 52 [1933], pp. 12–21). Page 149 (`ρμθ`) of **𝔓66** preserves the first half of Thomas’s confession at [John 20:28](/bible/jn/20#28) before a right-margin break (`ὁ Κ̅Ϲ̅ μου κ[αὶ ὁ Θ̅Ϲ̅ μου]`). By contrast, the Rylands fragment **𝔓52** (*P.Ryl.* III 457, [John 18:31–38](/bible/jn/18#31), usually dated c. AD 125–175) establishes second-century Egyptian circulation of John’s Gospel without preserving a deity clause. At [John 1:18](/bible/jn/1#18), **𝔓66** (`μονογενὴς Θ̅Ϲ̅`) and **𝔓75** (`ὁ μονογενὴς Θ̅Ϲ̅`) read **[ὁ] μονογενὴς Θ̅Ϲ̅** (“only-begotten God,” printed in NA28), whereas `ὁ μονογενὴς υἱός` (“the only-begotten Son”) stands in the Old Latin, the Curetonian Syriac, Codex Alexandrinus, and several patristic citations. **Ehrman** (*Orthodox Corruption*, 2nd ed. 2011, ch. 2) argues that `μονογενὴς θεός` arose as a second-century anti-adoptionist alteration of `υἱός`.',
    verifyLinks: [
      {
        label: 'Bodmer Lab — Papyrus Bodmer II (𝔓66, PB 2)',
        href: 'https://bodmerlab.unige.ch/fr/constellations/papyri/barcode/1072205287',
      },
      {
        label: 'CSNTM Digital Archive — 𝔓66 (GA P66)',
        href: 'https://manuscripts.csntm.org/manuscript/Group/GA_P66',
      },
      {
        label: 'Read John 1:1–18',
        href: '/bible/jn/1#1',
      },
    ],
  },

  papyrus_46_philippians_2_6: {
    disposition: 'primary',
    sectionId: 'earliest-biblical-papyri',
    evidenceTier: 'tier-a',
    title: 'Chester Beatty Pauline Codex (𝔓46)',
    displayYear:
      'c. AD 200–225 (Orsini & Clarysse 2012; Kenyon 1936: first half of 3rd c.)',
    sortYearStart: 200,
    sortYearEnd: 250,
    datingBasis: 'paleographical',
    location: 'Fayyum / Dishna provenance, Egypt',
    repository:
      'Chester Beatty Library, Dublin (CBL BP II) & Univ. of Michigan (P.Mich. inv. 6238)',
    language: 'Koine Greek papyrus codex (86 surviving folios)',
    image: {
      src: '/media/divinity_timeline/papyrus_46_philippians_2_6/image_2.jpg',
      alt: 'Page 142 (rho-mu-beta) of Chester Beatty Papyrus P46 displaying 2 Corinthians 11:33–12:9 in Greek with contracted nomina sacra overbars',
      caption:
        'Chester Beatty Pauline Codex (𝔓46, c. AD 200–225), page ρμβ (p. 142; 2 Corinthians 11:33–12:9, P.Mich. inv. 6238), written in an upright calligraphic bookhand influenced by administrative script and exhibiting regular *nomina sacra* contractions (Χ̅Ω̅, Θ̅Ϲ̅, Κ̅Υ̅). University of Michigan / Chester Beatty Library.',
    },
    keyExcerpt:
      '[Phil 2:6 in 𝔓46] ὃς ἐν μορφῇ Θ̅Υ̅ ὑπάρχων…  ·  [Heb 1:8a in 𝔓46] πρὸς δὲ τὸν Υ̅Ν̅· ὁ θρόνος σου ὁ Θ̅Ϲ̅ εἰς τὸν αἰῶνα τοῦ αἰῶνος.',
    quoteOriginal:
      '[Phil 2:6 in 𝔓46] ὃς ἐν μορφῇ Θ̅Υ̅ ὑπάρχων οὐχ ἁρπαγμὸν ἡγήσατο εἶναι ἴσα Θ̅Ω̅  ·  [Col 1:16–17 in 𝔓46] ὅτι ἐν αὐτῷ ἐκτίσθη τὰ πάντα ἐν [τοῖς οὐρα]νοῖς καὶ ἐπὶ τῆς γῆς, τὰ ὁρατὰ καὶ τὰ ἀόρατ[α], εἴτε θρόνοι εἴτε κυριότητες εἴτε ἀρχαὶ εἴτ[ε] ἐξουσίαι· ὅτι πάντα δι’ αὐτοῦ καὶ εἰς αὐτὸν ἔκτισται· καὶ αὐτός ἐστιν πρὸ πάντων καὶ τὰ πάντα αὐτῷ συνέστηκεν  ·  [Heb 1:8a in 𝔓46] πρὸς δὲ τὸν Υ̅Ν̅· ὁ θρόνος σου ὁ Θ̅Ϲ̅ εἰς τὸν αἰῶνα τοῦ αἰῶνος.',
    quoteTranslation:
      '[Phil 2:6] “who, although He existed in the form of God, did not regard equality with God a thing to be grasped,”  ·  [Col 1:16–17] “For by Him all things were created, [both] in the heavens and on earth, visible and invisible, whether thrones or dominions or rulers or authorities—all things have been created through Him and for Him. He is before all things, and in Him all things hold together.”  ·  [Heb 1:8a] “But of the Son [He says], ‘Your throne, O God, is forever and ever’”',
    showsMarkdown:
      '**What this shows:** Preserves [Philippians 2:6–11](/bible/phil/2#6), [Colossians 1:16–20](/bible/col/1#16) (after a bottom-margin lacuna at 1:14–15), [1 Corinthians 8:6](/bible/1cor/8#6), [Romans 9:5](/bible/rom/9#5), and Hebrews 1:8 (`ὁ θρόνος σου ὁ Θ̅Ϲ̅`, “Your throne, O God,” spoken of the Son) in a single codex dated c. AD 200–225. **Limits:** Paleographical dating rests on handwriting comparanda rather than an internal colophon, and the punctuation of [Romans 9:5](/bible/rom/9#5) remains debated among grammarians.',
    editionCitation:
      'Henry A. Sanders, *A Third-Century Papyrus Codex of the Epistles of Paul* (Ann Arbor: University of Michigan Press, 1935); Frederic G. Kenyon, *The Chester Beatty Biblical Papyri, Fasciculus III Supplement: Pauline Epistles* (London, 1936), introduction (first half of 3rd c. AD); Pasquale Orsini & Willy Clarysse, *ETL* 88 (2012), p. 470 (AD 200–225).',
    analysisMarkdown:
      'The earliest substantial manuscript of the Pauline corpus, 𝔓46 was assigned by British Museum papyrologist **Frederic G. Kenyon** (1936) to the first half of the third century and by paleographers **Pasquale Orsini and Willy Clarysse** (2012, p. 470) to AD 200–225; Young Kyu Kim’s 1988 proposal of a first-century date has not been accepted by paleographers. The codex preserves the *Carmen Christi* ([Philippians 2:6–11](/bible/phil/2#6)), the creation verses of [Colossians 1:16–20](/bible/col/1#16) (verses 14–15 fell in the damaged bottom margin of the preceding leaf), the Christological *Shema* ([1 Corinthians 8:6](/bible/1cor/8#6)), [Romans 9:5](/bible/rom/9#5), and Hebrews 1:8, which applies [Psalm 44:7 LXX](/bible/ps/44#6) (44:6 in Brenton; 45:6 in English Bibles), `ὁ θρόνος σου ὁ Θ̅Ϲ̅`, directly to the Son. In the codex’s eighty-six surviving leaves, these passages appear in substantially the wording of the modern critical text.',
    verifyLinks: [
      {
        label: 'Sanders, Third-Century Papyrus Codex of Paul — 𝔓46 (1935)',
        href: 'https://archive.org/details/thirdcenturypapy00unse',
      },
      {
        label: 'CSNTM Digital Archive — 𝔓46 (GA P46)',
        href: 'https://manuscripts.csntm.org/manuscript/Group/GA_P46',
      },
      {
        label: 'Read Philippians 2:6–11',
        href: '/bible/phil/2#6',
      },
    ],
  },

  papyrus_98: {
    disposition: 'primary',
    sectionId: 'earliest-biblical-papyri',
    evidenceTier: 'tier-b',
    title: 'Papyrus 98 (P.IFAO inv. 237b — Revelation 1:13–2:1)',
    displayYear:
      'c. AD 200–250 (Orsini & Clarysse 2012; Málik 2016: mid-2nd–mid-3rd c.)',
    sortYearStart: 200,
    sortYearEnd: 250,
    datingBasis: 'paleographical',
    location: 'Egypt',
    repository:
      'Institut Français d’Archéologie Orientale, Cairo (P.IFAO inv. 237b)',
    language: 'Koine Greek opisthograph (reused roll written on the back)',
    image: {
      src: '/media/divinity_timeline/papyrus_98/image_1.jpg',
      alt: 'Papyrus 98 fragment (P.IFAO inv. 237b) preserving fragmentary Greek lines of Revelation 1:13–2:1',
      caption:
        'P.IFAO inv. 237b (𝔓98, c. AD 200–250 per Orsini & Clarysse 2012), copied onto the back of an earlier first- or second-century documentary roll and preserving portions of Revelation 1:13–2:1. IFAO, Cairo.',
    },
    keyExcerpt:
      '[Rev 1:17b–18 in 𝔓98] μὴ φοβ[ο]ῦ· ἐγώ [εἰμι ὁ πρῶτος καὶ ὁ ἔσχατος, καὶ ἐγε]νόμην νεκρό[ς, καὶ ἰδοὺ ζῶν εἰμι εἰς τοὺς αἰῶνας] τῶν αἰώνων…',
    quoteOriginal:
      '[Rev 1:17b–18 in 𝔓98; restored letters in brackets, omitting καὶ ὁ ζῶν by line-length count] μὴ φοβ[ο]ῦ· ἐγώ [εἰμι ὁ πρῶτος καὶ ὁ ἔσχατος, καὶ ἐγε]νόμην νεκρό[ς, καὶ ἰδοὺ ζῶν εἰμι εἰς τοὺς αἰῶνας] τῶν αἰώνων, [καὶ ἔχω τὰς κλεῖς τοῦ θανάτου καὶ] τοῦ ᾅδου.',
    quoteTranslation:
      '“Do not be afraid; I am the first and the last, and the living One; and I was dead, and behold, I am alive forevermore, and I have the keys of death and of Hades.” [NASB Rev 1:17b–18. Line-length reconstruction indicates that 𝔓98 lacked ‘and the living One’; only the left-hand portions of its lines survive.]',
    showsMarkdown:
      '**What this shows:** Preserves, on a papyrus dated c. AD 200–250, partial lines of [Revelation 1:17–18](/bible/rv/1#17) in which the crucified and risen Jesus speaks the divine “First and Last” self-designation of [Isaiah 44:6](/bible/is/44#6). **Limits:** A fragmentary opisthograph in which substantial portions of each line are restored from fuller manuscripts; Jesus is identified through divine prerogatives rather than the noun `θεός`.',
    editionCitation:
      'Dieter Hagedorn, “P.IFAO II 31: Johannesapokalypse 1,13–20,” *Zeitschrift für Papyrologie und Epigraphik* 92 (1992), pp. 243–247; Pasquale Orsini & Willy Clarysse, *ETL* 88 (2012), p. 471 (AD 200–250); Peter Málik, “Another Look at P.IFAO II 31 (𝔓98),” *Novum Testamentum* 58 (2016), pp. 204–217.',
    analysisMarkdown:
      'Identified as Revelation by German papyrologist **Dieter Hagedorn** in 1992 on an *opisthograph* (a reused roll written on the back of a late first- or early second-century documentary account)—and assigned paleographically to AD 200–250 by **Orsini and Clarysse** (2012) and to the mid-second through mid-third century by textual scholar **Peter Málik** (*Novum Testamentum* 58 [2016], pp. 204–217)—**𝔓98** is the earliest surviving manuscript witness to [Revelation 1:13–2:1](/bible/rv/1#13), preserving partial line-segments and omitting `καὶ ὁ ζῶν` (“and the living One”) at the start of 1:18. In verses 17–18, the risen Jesus speaks the self-designation of Israel’s God from [Isaiah 44:6](/bible/is/44#6) (“I am the first, and I am hereafter: beside me there is no God”) alongside his historical death and resurrection (“and I was dead, and behold, I am alive forevermore”).',
    verifyLinks: [
      {
        label: 'CSNTM Digital Archive — 𝔓98 (GA P98)',
        href: 'https://manuscripts.csntm.org/manuscript/Group/GA_P98',
      },
      {
        label: 'Read Revelation 1:17–18',
        href: '/bible/rv/1#17',
      },
      {
        label: 'Compare Isaiah 44:6 LXX',
        href: '/bible/is/44#6',
      },
    ],
    groupedHeading: 'Adjacent column witness on P.IFAO inv. 237b (1)',
  },

  papyrus_98_revelation_1_13: {
    disposition: 'grouped',
    parentCardId: 'papyrus_98',
    sectionId: 'earliest-biblical-papyri',
    title:
      'Preceding Column Lines on P.IFAO inv. 237b: Vision of the Son of Man (Revelation 1:13–16)',
    displayYear: 'c. AD 200–250',
    sortYearStart: 200,
    sortYearEnd: 250,
    datingBasis: 'paleographical',
    summaryMarkdown:
      'The immediately preceding lines on the same Cairo opisthograph (P.IFAO inv. 237b) preserve [Revelation 1:13b–16](/bible/rv/1#13) (the opening words “one like a son of man” in 1:13a precede the surviving fragment), where the risen Christ is portrayed with a golden sash and with the snow-white hair of the Ancient of Days (Daniel 7:9) before he speaks the “First and Last” self-designation in 1:17–18.',
  },

  papyrus_104: {
    disposition: 'primary',
    sectionId: 'earliest-biblical-papyri',
    evidenceTier: 'tier-c',
    title:
      'Scribal Nomina Sacra & Early Oxyrhynchus Fragments (𝔓10, 𝔓77, 𝔓104)',
    displayYear:
      'c. AD 100–200 (𝔓104, Orsini & Clarysse 2012); archival context c. AD 316 (𝔓10)',
    sortYearStart: 100,
    sortYearEnd: 316,
    datingBasis: 'paleographical',
    location: 'Oxyrhynchus (al-Bahnasa), Middle Egypt',
    repository:
      'Sackler Library, Oxford (P.Oxy. LXIV 4404 / XXXIV 2683) & Houghton Library, Harvard (MS Gr SM 2218)',
    language: 'Koine Greek papyrus codices & writing sheet',
    image: {
      src: '/media/divinity_timeline/papyrus_104/image_1.jpg',
      alt: 'Second-century Oxyrhynchus papyrus fragment P104 (P.Oxy. LXIV 4404) preserving portions of Matthew 21:34–37 at native scale',
      caption:
        '*P.Oxy.* LXIV 4404 (𝔓104, AD 100–200 per Orsini & Clarysse 2012), preserving partial lines of Matthew 21:34–37a on the recto (Parable of the Vineyard Tenants). Shown as an early Synoptic papyrus comparator; 𝔓104 itself contains no *nomina sacra*. Egypt Exploration Society / Oxford University.',
    },
    keyExcerpt:
      '[Rom 1:7 in 𝔓10, c. AD 316] …χάρις ἡμῖν [read ὑμῖν] καὶ ε[ἰρ]ήνη ἀπὸ Θ̅Υ̅ Π̅Ρ̅Ο̅Ϲ̅ ἡμῶν καὶ Κ̅Υ̅ Χ̅Ρ̅Υ̅ Ἰ̅Η̅Υ̅  ·  [Matt 21:36–37a in 𝔓104] …δούλους πλείο[νας τῶν πρώτων, καὶ] ἐποίησαν [αὐτοῖς ὡσαύτως. ὕστερον δ]ὲ ἀπέ[στειλεν…].',
    quoteOriginal:
      '[Rom 1:7 in 𝔓10, archival context c. AD 316] πᾶσυν [read πᾶσιν] τοῦς [read τοῖς] οὖσιν ἐν [Ῥ]ώμῃ ἀγαπητοῖς Θ̅Υ̅ κλητοῖς [ἁ]γίοις· χάρις ἡμῖν [read ὑμῖν] καὶ ε[ἰρ]ήνη ἀπὸ Θ̅Υ̅ Π̅Ρ̅Ο̅Ϲ̅ ἡμῶν καὶ Κ̅Υ̅ Χ̅Ρ̅Υ̅ Ἰ̅Η̅Υ̅  ·  [Matt 21:34, 36–37a in 𝔓104; restored letters in brackets] δ[ο]ύλου[ς] αὐτοῦ πρὸς [τοὺς γεωργοὺς] λαβεῖν τοὺς καρ[ποὺς αὐτοῦ] … δούλους πλείο[νας τῶν πρώτων, καὶ] ἐποίησαν [αὐτοῖς ὡσαύτως. ὕστερον δ]ὲ ἀπέ[στειλεν…].',
    quoteTranslation:
      '[Rom 1:7, NASB; 𝔓10 reads ‘Grace to us’ and ‘Lord Christ Jesus’] “to all who are beloved of God in Rome, called [as] saints: Grace to you and peace from God our Father and the Lord Jesus Christ.”  ·  [Matt 21:37, NASB; 𝔓104 preserves vv. 34–37a through ἀπέστειλεν (‘he sent’), breaking off before ‘his son’] “But afterward he sent his son to them, saying, ‘They will respect my son.’”',
    showsMarkdown:
      '**What this shows:** Demonstrates how pre-Nicene Christian scribes contracted “Jesus” (`Ἰ̅Η̅Υ̅`) and “Christ” (`Χ̅Ρ̅Υ̅`) with the same sacred-name overbars used for “God” (`Θ̅Υ̅`) and “Lord” (`Κ̅Υ̅`), alongside second-century attestation of Matthew’s Parable of the Vineyard Tenants (`𝔓104`, preserving 21:34–37a up to the sending clause). **Limits:** `𝔓104` preserves only partial lines of [Matthew 21:34–37](/bible/mt/21#34) with no *nomina sacra* and is not a deity proof; scribal *nomina sacra* signal visual reverence rather than a syntactic `θεός` predication.',
    editionCitation:
      'Bernard P. Grenfell & Arthur S. Hunt, *P.Oxy.* II (1899), no. 209 (𝔓10); AnneMarie Luijendijk, *Journal of Biblical Literature* 129 (2010), pp. 575–596; Peter J. Parsons, *P.Oxy.* XXXIV (1968), no. 2683 (𝔓77); J. David Thomas, *The Oxyrhynchus Papyri* LXIV (1997), no. 4404 (𝔓104).',
    analysisMarkdown:
      'Whereas pre-Christian Jewish Greek Septuagint scribes gave distinctive visual treatment solely to the divine name **YHWH** (written in paleo-Hebrew or square Aramaic script, Greek `ΙΑΩ`, or stylized `ΠΙΠΙ`) without contracting ordinary Greek nouns, early Christian copyists created supralinear *nomina sacra* contractions and placed **Ι̅Η̅Ϲ̅** / **Ἰ̅Η̅Υ̅** (“Jesus”) and **Χ̅Ϲ̅** / **Χ̅Ρ̅Υ̅** (“Christ”) inside the core four-word register alongside **Θ̅Ϲ̅** (“God”) and **Κ̅Ϲ̅** (“Lord”; papyrologist **Colin H. Roberts**, 1979; historian **Larry W. Hurtado**, *Artifacts*, 2006, ch. 3). At Oxyrhynchus, **𝔓10** (*P.Oxy.* II 209, archival context c. AD 316) contracts `Θ̅Υ̅`, `Π̅Ρ̅Ο̅Ϲ̅`, `Κ̅Υ̅`, and `Χ̅Ρ̅Υ̅ Ἰ̅Η̅Υ̅` side by side, whereas **𝔓77** (late second to early third century) preserves [Matthew 23:30–39](/bible/mt/23#30), including Jesus’s lament over Jerusalem, before breaking off at `ὀ[νόματι κυρίου]` in [23:39](/bible/mt/23#39) with no surviving *nomina sacra*. Similarly, **𝔓104** (*P.Oxy.* LXIV 4404, edited by papyrologist **J. David Thomas**, 1997) preserves partial lines of [Matthew 21:34–37](/bible/mt/21#34) on the recto (plus faint traces of 21:43, 45 on the verso) where none of the four core nouns occurs, preserving `δούλους` (“servants”) in vv. 34 and 36 and breaking off at `[ὕστερον δ]ὲ ἀπέ[στειλεν]` (“afterward he sent…”) at the start of v. 37 just before the parable introduces the vineyard owner’s `υἱός` (“son”—called `ἀγαπητός`, “beloved,” in [Mark 12:6](/bible/mk/12#6) and [Luke 20:13](/bible/lk/20#13)).',
    verifyLinks: [
      {
        label: 'CSNTM Digital Archive — 𝔓104 (GA P104)',
        href: 'https://manuscripts.csntm.org/manuscript/Group/GA_P104',
      },
      {
        label: 'Grenfell & Hunt, P.Oxy. II no. 209 — 𝔓10 (1899)',
        href: 'https://archive.org/details/oxyrhynchuspapyr02gren/page/8/mode/2up',
      },
      {
        label: 'Read Matthew 21:37',
        href: '/bible/mt/21#37',
      },
    ],
    groupedHeading: 'Related Oxyrhynchus papyrus witnesses (2)',
  },

  papyrus_77: {
    disposition: 'grouped',
    parentCardId: 'papyrus_104',
    sectionId: 'earliest-biblical-papyri',
    title: 'Papyrus 77 (P.Oxy. XXXIV 2683 + LXIV 4405 — Matthew 23:30–39)',
    displayYear: 'Late 2nd–early 3rd century AD',
    sortYearStart: 175,
    sortYearEnd: 225,
    datingBasis: 'paleographical',
    summaryMarkdown:
      'This early Oxyrhynchus codex leaf ([Matthew 23:30–39](/bible/mt/23#30), breaking off at `ὀ[νόματι κυρίου]` in 23:39) preserves Jesus’s first-person lament over Jerusalem, in which he longs to gather Israel’s children “the way a hen gathers her chicks under her wings” (`ὄρνιξ [ἐ]πισυνάγει τὰ ν[οσ]σί[α αὐ]τῆς ὑπὸ τὰς πτέρυγας`), imagery associated with divine shelter in the Hebrew Bible ([Psalm 90:4 LXX](/bible/ps/90#4); 91:4 in English Bibles).',
  },

  papyrus_oxyrhynchus_2: {
    disposition: 'grouped',
    parentCardId: 'papyrus_104',
    sectionId: 'earliest-biblical-papyri',
    title: 'P.Oxy. II 209 = 𝔓10 (Harvard MS Gr SM 2218 — Romans 1:1–7)',
    displayYear: 'Archival context c. AD 316 (Luijendijk 2010)',
    sortYearStart: 310,
    sortYearEnd: 318,
    datingBasis: 'historical-prosopographical',
    summaryMarkdown:
      'Written on a single sheet of [Romans 1:1–7](/bible/rom/1#1) (*P.Oxy.* II 209 = **𝔓10**, distinct from *P.Oxy.* I 2 = **𝔓1** of Matthew 1) and found tied with dated contracts of the Oxyrhynchus flax merchant Aurelius Leonides from **AD 316** (historian **AnneMarie Luijendijk**, *JBL* 129 [2010], pp. 575–596, DOI 10.2307/25765953; *editio princeps* in [Grenfell & Hunt, *P.Oxy.* II no. 209](https://archive.org/details/oxyrhynchuspapyr02gren/page/8/mode/2up)), this writing exercise contracts `Χ̅Ρ̅Υ̅ Ἰ̅Η̅Υ̅`, `Θ̅Υ̅`, `Π̅Ρ̅Ο̅Ϲ̅`, and `Κ̅Υ̅` together in a documentarily dated archive nine years before Nicaea ([CSNTM GA P10](https://manuscripts.csntm.org/manuscript/Group/GA_P10)).',
  },

  // ===========================================================================
  // SECTION 05 — PATRISTIC, LITURGICAL & MARTYRDOM PAPYRI (4 primary + 1 grouped)
  // ===========================================================================
  papyrus_oxyrhynchus_405: {
    disposition: 'primary',
    sectionId: 'patristic-and-liturgical-papyri',
    evidenceTier: 'tier-c',
    title: 'P.Oxy. III 405 — Early Copy of Irenaeus, Adversus Haereses',
    displayYear: 'Treatise c. AD 180; papyrus copy c. AD 200',
    sortYearStart: 195,
    sortYearEnd: 210,
    datingBasis: 'paleographical',
    location: 'Written in Lugdunum (Gaul); excavated at Oxyrhynchus, Egypt',
    repository: 'Cambridge University Library (MS Add. 4413)',
    language: 'Koine Greek papyrus roll',
    image: {
      src: '/media/divinity_timeline/papyrus_oxyrhynchus_405/image_2.jpg',
      alt: 'Papyrus Oxyrhynchus III 405 fragments at Cambridge University Library preserving Irenaeus Adversus Haereses Book 3 from c. AD 200',
      caption:
        'Cambridge University Library MS Add. 4413 (*P.Oxy.* III 405, copied c. AD 200), preserving Irenaeus of Lyons’s *Adversus Haereses* 3.9.2–3 (quoting Matthew 3:17 with marginal quotation wedges) within roughly two decades of composition.',
    },
    keyExcerpt:
      '[On P.Oxy. III 405 col. ii — Adv. Haer. 3.9.3, c. AD 200] Σὺ ε[ἶ ὁ υἱός μου ὁ ἀγα]πητός, [ἐν ᾧ εὐδόκ]ησα.',
    quoteOriginal:
      '[On the c. AD 200 papyrus: Adv. Haer. 3.9.3 in P.Oxy. III 405, col. ii] Σὺ ε[ἶ ὁ υἱός μου ὁ ἀγα]πητός, [ἐν ᾧ εὐδόκ]ησα  ·  [Elsewhere in the treatise via later MSS: Adv. Haer. 3.19.1 Greek frag. 19 & 4.6.7 Latin] Εἰς τοῦτο γὰρ ὁ Λόγος ἄνθρωπος, καὶ Υἱὸς ἀνθρώπου ὁ Υἱὸς τοῦ Θεοῦ… quoniam vere homo, et quoniam vere Deus.',
    quoteTranslation:
      '[On P.Oxy. III 405, c. AD 200 — Adv. Haer. 3.9.3] “You [are my] beloved [Son, in whom I am] well pleased.”  ·  [Elsewhere in Adversus Haereses — 3.19.1 & 4.6.7] “For to this end the Word [became] man, and the Son of God [became] Son of man… truly man and truly God.”',
    showsMarkdown:
      '**What this shows:** Attests the circulation of Irenaeus’s *Adversus Haereses* in Egypt by c. AD 200, within roughly twenty years of its composition in Gaul (c. AD 180). **Limits:** The papyrus fragment preserves only *Adv. Haer.* 3.9.2–3 quoting [Matthew 3:17](/bible/mt/3#17) (“beloved Son”); Irenaeus’s explicit “truly man and truly God” (*vere homo et vere Deus*, 4.6.7) and incarnation formulas (3.19.1) survive elsewhere in the treatise only in later manuscripts.',
    editionCitation:
      'Bernard P. Grenfell & Arthur S. Hunt, *The Oxyrhynchus Papyri* III (1903), no. 405, pp. 10–11; Adelin Rousseau & Louis Doutreleau, *Irénée de Lyon: Contre les hérésies, Livre III*, SC 211 (Paris, 1974); Colin H. Roberts, *Manuscript, Society and Belief in Early Christian Egypt* (Oxford, 1979).',
    analysisMarkdown:
      'Identified by Cambridge patristic scholar **J. Armitage Robinson** shortly after papyrologists **Bernard P. Grenfell and Arthur S. Hunt** published the fragment in 1903, *P.Oxy.* III 405 is among the closest surviving copies, in date, to the autograph of any early patristic work: composed by Bishop Irenaeus in Lyons around AD 180, Book 3 had reached provincial Middle Egypt by c. AD 200 (**Grenfell and Hunt**, 1903, p. 10; **Colin H. Roberts**, 1979). Marked in the left margin with scribal *diplai* (seven wedge-shaped quotation signs visible on the Cambridge plate), col. ii preserves *Adversus Haereses* 3.9.3 citing the baptismal voice at [Matthew 3:17](/bible/mt/3#17) in its Western second-person wording (`Σὺ ε[ἶ…]`, matching Codex Bezae, whereas the later Latin translation assimilated the line to standard Matthean *Hic est filius meus dilectus* / `οὗτός ἐστιν`). While this specific column attests transmission speed rather than a `θεός` predication on the torn sheet itself, it anchors the early circulation of the five-book treatise in which Irenaeus argues against Gnostic docetism and Ebionite adoptionism that Jesus Christ is the incarnate Word (*Adv. Haer.* 3.19.1 Greek fragment) and “truly man and truly God” (*vere homo et vere Deus*, *Adv. Haer.* 4.6.7 Latin).',
    verifyLinks: [
      {
        label: 'Grenfell & Hunt, P.Oxy. III no. 405 (1903)',
        href: 'https://archive.org/details/oxyrhynchuspapyr03gren/page/10/mode/2up',
      },
      {
        label: 'New Advent — Irenaeus, Against Heresies 3.9',
        href: 'https://www.newadvent.org/fathers/0103309.htm',
      },
    ],
  },

  papyrus_bodmer_xiii: {
    disposition: 'primary',
    sectionId: 'patristic-and-liturgical-papyri',
    evidenceTier: 'tier-a',
    title: 'Papyrus Bodmer XIII — Melito of Sardis, On Pascha (Peri Pascha)',
    displayYear: 'Homily c. AD 165–175; codex copy late 3rd–early 4th c. AD',
    sortYearStart: 165,
    sortYearEnd: 325,
    datingBasis: 'composition-copy',
    location: 'Composed at Sardis, Lydia; codex recovered near Dishna, Egypt',
    repository: 'Fondation Martin Bodmer, Cologny (P.Bodmer XIII)',
    language: 'Koine Greek Paschal homily',
    image: null,
    keyExcerpt:
      '[§8] φύσει θεὸς ὢν καὶ ἄνθρωπος… [§96] ὁ κρεμάσας τὴν γῆν κρέμαται… ὁ θεὸς πεφόνευται.',
    quoteOriginal:
      '[§8] φύσει θεὸς ὢν καὶ ἄνθρωπος… [§96] ὁ κρεμάσας τὴν γῆν κρέμαται · ὁ πήξας τοὺς οὐρανοὺς πέπηκται… ὁ δεσπότης παρύβρισται · ὁ θεὸς πεφόνευται… [§104] οὗτός ἐστιν ὁ ποιήσας τὸν οὐρανὸν καὶ τὴν γῆν.',
    quoteTranslation:
      '“[§8] Being by nature both God and man… [§96] He who hung the earth is hanging; he who fixed the heavens in place has been fixed [to the tree]… the Master has been insulted; God has been murdered… [§104] This is he who made the heaven and the earth.”',
    showsMarkdown:
      '**What this shows:** Preserves Bishop Melito of Sardis’s c. AD 165–175 Passover homily calling Christ “by nature both God and man” (`φύσει θεὸς ὢν καὶ ἄνθρωπος`, §8) and declaring “God has been murdered” (`ὁ θεὸς πεφόνευται`, §96) in a late third- or early fourth-century codex. **Limits:** Melito’s phrasing in §§9–10 (“insofar as he begets, Father; insofar as he is begotten, Son”) can be read as modalist or Monarchian, and it does not draw the later Nicene distinction of persons (*hypostaseis*).',
    editionCitation:
      'Michel Testuz, *Papyrus Bodmer XIII: Méliton de Sardes, Homélie sur la Pâque* (Cologny-Genève, 1960); Stuart George Hall, *Melito of Sardis: On Pascha and Fragments* (Oxford: Clarendon Press, 1979).',
    analysisMarkdown:
      'Papyrus Bodmer XIII is assigned paleographically to the late third or early fourth century, more than a century after Melito composed the homily. The homily is also attested in the fourth-century Chester Beatty XII codex, in ancient Latin, Syriac, Coptic, and Georgian versions, and in Eusebius’s notice (*Historia Ecclesiastica* 4.26). It is the *Quartodeciman* Passover homily (from the tradition of observing Easter on 14 Nisan) preached by Bishop Melito at Sardis around **AD 165–175**. Melito calls Christ “by nature both God and man” (**φύσει θεὸς ὢν καὶ ἄνθρωπος**, §8), attributes to him the making of heaven and earth (§104), and frames the crucifixion through liturgical paradoxes (“He who hung the earth is hanging… God has been murdered,” §96). At the same time, patristic editor **Stuart George Hall** (1979) notes that Melito’s phrasing in §§9–10 (`καθ’ ὃ γεννᾷ πατήρ, καθ’ ὃ γεννᾶται υἱός`, “insofar as he begets, Father; insofar as he is begotten, Son”) reflects unguarded second-century modalist or Monarchian rhetoric (treating Father and Son as modes of one person) rather than later Nicene distinction of *hypostaseis* (distinct divine persons).',
    verifyLinks: [
      {
        label: 'Bodmer Lab — Composite Codex PB C (P.Bodmer XIII, Melito)',
        href: 'https://bodmerlab.unige.ch/fr/constellations/papyri/barcode/1072205366',
      },
      {
        label: 'Eusebius, Church History 4.26 — Melito’s Paschal Homily Notice',
        href: 'https://www.newadvent.org/fathers/250104.htm',
      },
    ],
  },

  oxyrhynchus_hymn: {
    disposition: 'primary',
    sectionId: 'patristic-and-liturgical-papyri',
    evidenceTier: 'tier-b',
    title: 'The Oxyrhynchus Triadic Doxology with Musical Notation (P.Oxy. XV 1786)',
    displayYear: 'c. AD 275–300',
    sortYearStart: 275,
    sortYearEnd: 300,
    datingBasis: 'paleographical',
    location: 'Oxyrhynchus, Egypt',
    repository: 'Papyrology Rooms, Sackler Library, Oxford (P.Oxy. XV 1786)',
    language: 'Anapaestic Greek with Alypian vocal musical notation',
    image: {
      src: '/media/divinity_timeline/oxyrhynchus_hymn/image_1.jpg',
      alt: 'Papyrus Oxyrhynchus XV 1786 strip showing Greek vocal musical notation letters above third-century Christian triadic hymn lyrics',
      caption:
        '*P.Oxy.* XV 1786 (c. AD 275–300), the earliest surviving Christian hymn with musical notation, its Greek lyrics praising Father, Son, and Holy Spirit (the crasis, or vowel fusion, ΧΑΓΙΟΝ is visible on the papyrus). Egypt Exploration Society / Oxford University.',
    },
    keyExcerpt:
      '…ὑμνούντων δ’ ἡμῶν [π]ατέρα χὐιὸν χἄγιον πνεῦμα · πᾶσαι δυνάμεις ἐπιφωνούντων · ἀμήν, ἀμήν.',
    quoteOriginal:
      'σιγάτω μηδ’ ἄστρα φαεσφόρα… ὑμνούντων δ’ ἡμῶν / [π]ατέρα χὐιὸν χἄγιον πνεῦμα · / πᾶσαι δυνάμεις ἐπιφωνούντων · ἀμήν, ἀμήν · / κράτος, αἶνος […] δ[ωτ]ῆ[ρι] μόνῳ πάντων ἀγαθῶν · ἀμήν, ἀμήν.',
    quoteTranslation:
      '“Let not the light-bearing stars keep silent… while we hymn Father, Son, and Holy Spirit; let all the powers answer in chorus: Amen, amen! Might, praise, […] [giver] alone of all good gifts. Amen, amen.”',
    showsMarkdown:
      '**What this shows:** Preserves the oldest surviving Christian musical score (c. AD 275–300), summoning cosmic powers to sing praise jointly to “Father, Son, and Holy Spirit” (`[π]ατέρα χὐιὸν χἄγιον πνεῦμα`). **Limits:** In l. 5, seven syllables precede damaged `δ[ωτ]ῆ[ρι] μόνῳ` (“giver alone”) in a lacuna left unrestored by Hunt (1922) and Cosgrove (2011) (conjectured `[ἀεὶ καὶ δόξα θεῷ]` by Del Grande 1923), so the papyrus attests sung triadic worship rather than an intact `θεός` predication of the Son.',
    editionCitation:
      'Arthur S. Hunt, *The Oxyrhynchus Papyri* XV (1922), no. 1786, pp. 21–25; Charles H. Cosgrove, *An Ancient Christian Hymn with Musical Notation: Papyrus Oxyrhynchus 1786: Text and Commentary* (Tübingen: Mohr Siebeck, 2011).',
    analysisMarkdown:
      'Written on the back of a mid-third-century grain account, *P.Oxy.* XV 1786 preserves a copy of the hymn made in the final quarter of the third century (c. AD 275–300; papyrologist **Arthur S. Hunt**, 1922; musicologist-historian **Charles H. Cosgrove**, 2011). The surviving letters summon cosmic and angelic powers to join in singing a triadic doxology to **[π]ατέρα χὐιὸν χἄγιον πνεῦμα** (“Father, Son, and Holy Spirit”), with crasis twice contracting `καὶ υἱὸν` and `καὶ ἅγιον`. In line 5, Hunt (1922, pp. 24–25) left the seven-syllable gap before `δ[ωτ]ῆ[ρι] μόνῳ πάντων ἀγαθῶν` unrestored, whereas editors who supply `[ἀεὶ καὶ δόξα θεῷ]` (Carlo Del Grande, 1923) attach `δ[ωτ]ῆ[ρι] μόνῳ` to singular conjectured `[θεῷ]`, while Cosgrove (2011) leaves the lacuna open and refers “sole giver” to the Father-Son-Spirit triad; on either reading, the fragment’s secure pre-Nicene testimony lies in its sung liturgical coordination of Father, Son, and Holy Spirit.',
    verifyLinks: [
      {
        label: 'Hunt, P.Oxy. XV no. 1786 (1922) — Editio Princeps',
        href: 'https://archive.org/details/oxyrhynchuspapyr15gren/page/21/mode/2up',
      },
    ],
    groupedHeading: 'Contemporary Oxyrhynchus prayer sheet (1)',
  },

  papyrus_oxyrhynchus_407: {
    disposition: 'grouped',
    parentCardId: 'oxyrhynchus_hymn',
    sectionId: 'patristic-and-liturgical-papyri',
    title: 'P.Oxy. III 407 (British Library Pap. 1189 e) — Private Prayer Sheet',
    displayYear: 'Late 3rd–early 4th century AD',
    sortYearStart: 280,
    sortYearEnd: 320,
    datingBasis: 'paleographical',
    summaryMarkdown:
      'This folded private prayer sheet from Oxyrhynchus (P.Lond.Lit. 230 = *PGM* P4; Grenfell & Hunt, *P.Oxy.* III [1903], pp. 12–13) addresses “God Almighty, who made heaven and earth,” petitioning salvation and closing its doxology “through our Lord and Savior Jesus Christ” (`διὰ τοῦ κυρίου κα[ὶ] σωτῆρος ἡμῶν Ἰησοῦ Χρειστοῦ`); the names are written in full (*plene*) rather than as *nomina sacra* ([Grenfell & Hunt, *P.Oxy.* III no. 407](https://archive.org/details/oxyrhynchuspapyr03gren/page/12/mode/2up)).',
  },

  papyrus_bodmer_xx: {
    disposition: 'primary',
    sectionId: 'patristic-and-liturgical-papyri',
    evidenceTier: 'tier-a',
    title: 'Papyrus Bodmer XX — Courtroom Trial of Bishop Phileas (AD 304–307)',
    displayYear: 'Trial AD 304–307; papyrus copy c. AD 310–350',
    sortYearStart: 304,
    sortYearEnd: 307,
    datingBasis: 'martyr-acts',
    location: 'Alexandria, Egypt (before Prefect Clodius Culcianus)',
    repository: 'Fondation Martin Bodmer, Cologny (P.Bodmer XX)',
    language: 'Koine Greek judicial protocol (with parallel Latin *Acta*)',
    image: null,
    keyExcerpt:
      '[P.Bodmer XX, cols. V–VI] Κουλκιανὸς εἶπεν· Ὁ Ἰησοῦς [θεὸς] ἦν; Φιλέας εἶπεν· Ναί.  ·  [Latin Acta 4.3] Culcianus dixit: Est Deus crucifixus?',
    quoteOriginal:
      '[P.Bodmer XX, cols. V–VI] Κουλκιανὸς εἶπεν· Ὁ Ἰησοῦς [θεὸς] ἦν; Φιλέας εἶπεν· Ναί. Κουλκιανὸς εἶπεν· … Τί ἐποίησεν; Φ[ιλέα]ς εἶπεν· Λεπροὺς ἐκαθάρισεν, τυφλ[ο]ὺς ἐποίησεν βλέπειν…  ·  [Acta Phileae 4.3, Latin recension] Culcianus dixit: Est Deus crucifixus? Phileas respondit: Propter nostram salutem crucifixus est.',
    quoteTranslation:
      '[P.Bodmer XX, cols. V–VI] “Culcianus said: ‘Was Jesus [God]?’ Phileas said: ‘Yes.’ Culcianus said: ‘…What did he do?’ Phileas said: ‘He cleansed lepers, made the blind see…’”  ·  [Latin Acta 4.3] “Culcianus said: ‘Was God crucified?’ Phileas replied: ‘He was crucified for our salvation.’”',
    showsMarkdown:
      '**What this shows:** Records the Roman prefect Clodius Culcianus asking Bishop Phileas at his Alexandrian trial (AD 304–307) “Was Jesus [God]?”, to which Phileas answered “Yes”; the Latin *Acta* add the question “Was God crucified?” **Limits:** In the Greek of P.Bodmer XX, cols. V–VI (copied c. AD 310–350), `[θεὸς]` falls in a lacuna; it is restored from P.Chester Beatty XV, from Culcianus’s intact follow-up `ὅτι θεὸς ἦν` (col. VI, l. 3), and from the parallel Latin protocol (*Deus erat Christus? — Ita*).',
    editionCitation:
      'Victor Martin, *Papyrus Bodmer XX: Apologie de Philéas, évêque de Thmouis* (Cologny-Genève, 1964); Albert Pietersma, *The Acts of Phileas, Bishop of Thmuis (Including Fragments of the Greek Psalter): P. Chester Beatty XV (With a New Edition of P. Bodmer XX, and Halkin’s Latin Acta)* (Geneva, 1984), cols. V–VI; Herbert Musurillo, *The Acts of the Christian Martyrs* (Oxford: Clarendon Press, 1972), pp. 328–344 (Greek), 344–353 (Latin).',
    analysisMarkdown:
      'Preserved in two fourth-century Greek papyri (P.Bodmer XX, edited by **Victor Martin** 1964, and P.Chester Beatty XV, edited by **Albert Pietersma** 1984) alongside an ancient Latin recension (**Herbert Musurillo**, 1972, pp. 328–353) and Eusebius (*Hist. Eccl.* 8.9–10), this courtroom protocol records the capital interrogation of Phileas, Bishop of Thmuis in the Nile Delta, before Clodius Culcianus—attested as Prefect of Egypt in **AD 303–306** (*PLRE* I, pp. 233–234; *P.Oxy.* XLVI 3304 extends his tenure to AD 301–307) under Diocletian’s persecution. In P.Bodmer XX cols. V–VI (where `[θεὸς]` is restored across a short lacuna from *P.Chester Beatty* XV, Culcianus’s intact follow-up `ὅτι θεὸς ἦν` in col. VI l. 3, and the parallel Latin protocol *Deus erat Christus? — Ita*), Phileas affirms Jesus’s deity (`Ναί`, “Yes”) and, when asked what Jesus did, cites his healings and raising of the dead; the Latin *Acta* (4.3) also preserves Culcianus’s question whether God was crucified (*Est Deus crucifixus?*), nearly two decades before Nicaea.',
    verifyLinks: [
      {
        label: 'Bodmer Lab — Codex PB P (P.Bodmer XX, Apology of Phileas)',
        href: 'https://bodmerlab.unige.ch/fr/constellations/papyri/barcode/1072205358',
      },
      {
        label: 'Oxford CSLA Dossier E02631 — Martyrdom of Phileas',
        href: 'https://web.archive.org/web/20260116060241/http://csla.history.ox.ac.uk/record.php?recid=E02631',
      },
    ],
  },

  // ===========================================================================
  // METHODOLOGY & SCOPE — 14 EXCLUDED ITEMS (all #event-<id> anchors preserved)
  // ===========================================================================
  papyrus_oxyrhynchus_412: {
    disposition: 'excluded',
    legacyTitle: 'Papyrus Oxyrhynchus III 412 (Julius Africanus, Kestoi)',
    rawDateClaim: 'c. AD 225–275',
    exclusionCategory: 'Non-Christological Text',
    exclusionReason:
      'Preserves Julius Africanus’s secular miscellany *Kestoi* (Book 18), quoting Homer’s *Odyssey* 11 beside a syncretistic incantation; only the closing colophon signals a Christian author, with no statement on Jesus’s deity.',
  },
  chachati_gem: {
    disposition: 'excluded',
    legacyTitle:
      'Uninscribed Anchor-and-Fish Jasper Intaglio (Popularly Cited as “Chachati Gem”)',
    rawDateClaim: '4th–5th c. AD',
    exclusionCategory: 'Post-Nicene & Uninscribed',
    exclusionReason:
      'Circulates online without a verified museum inventory number; uninscribed Christian symbol intaglios of this class (anchors, fish, and doves, catalogued in Jeffrey Spier, *Late Antique and Early Christian Gems*, 2007, ch. 4, pp. 41–52) date predominantly to the fourth and fifth centuries AD and carry no Christological text.',
  },
  catacomb_of_domitilla: {
    disposition: 'excluded',
    legacyTitle: 'Catacomb of Domitilla Hypogaeum (Rome)',
    rawDateClaim: '3rd c. AD',
    exclusionCategory: 'Uninscribed Iconography',
    exclusionReason:
      'Early Flavian hypogaeum galleries along the Via Ardeatina preserve pastoral and biblical frescoes without an explicit pre-Nicene inscription predicating deity of Jesus.',
  },
  epitaph_of_eutropos: {
    disposition: 'excluded',
    legacyTitle: 'Grave Plaque of the Sarcophagus-Cutter Eutropos (Urbino)',
    rawDateClaim: '4th c. AD (or mid-3rd c. AD)',
    exclusionCategory: 'Non-Christological Wording & Contested Date',
    exclusionReason:
      'Preserved in Urbino (Museo Lapidario, Palazzo Ducale, inv. 40674), this marble grave plaque depicting a sarcophagus-carving workshop is dated by many epigraphists to the fourth century AD (Robert Couzin, 2022, argues for the mid-third century AD), and its Greek text reads ΘΕΟϹΕΒΗϹ (“God-fearing”) rather than calling Christ “Lord God.”',
  },
  via_salaria_sarcophagus: {
    disposition: 'excluded',
    legacyTitle: 'Via Salaria Kriophoros (“Ram-Bearer”) Sarcophagus',
    rawDateClaim: 'c. AD 250–275',
    exclusionCategory: 'Uninscribed Ambiguous Relief',
    exclusionReason:
      'Uninscribed third-century marble sarcophagus relief whose ram-bearer (*kriophoros*) motif was used in both pagan and Christian workshops, carrying no Christological inscription.',
  },
  early_christian_gold_glass: {
    disposition: 'excluded',
    legacyTitle: 'Roman Catacomb Gold-Glass Medallions (Fondi d’Oro)',
    rawDateClaim: '4th c. AD',
    exclusionCategory: 'Post-Nicene (4th c. AD)',
    exclusionReason:
      'Specialist catalogues (Charles R. Morey, 1959; Daniel Thomas Howells, British Museum, 2015; cf. Whitehouse, *Expedition* 38/2, 1996) assign predominantly Christian gold-glass medallions to the fourth century AD (with dated examples from c. AD 333–359 onward), after the Council of Nicaea.',
  },
  pgm_xiii_command: {
    disposition: 'excluded',
    legacyTitle: 'Leiden Magical Papyrus J 395 (PGM XIII)',
    rawDateClaim: 'c. AD 340–360',
    exclusionCategory: 'Post-Nicene Copy & Duplicate Formula',
    exclusionReason:
      'Leiden MS J 395 (*Eighth Book of Moses*, *PGM* XIII) was copied around AD 340–360, while the “God of the Hebrews, Jesus” exorcism sometimes cited under this heading belongs to *PGM* IV.3019–3020.',
  },
  michigan_magical_papyrus: {
    disposition: 'excluded',
    legacyTitle: 'Michigan Coptic Magical Codex (P.Mich. inv. 593 / 136)',
    rawDateClaim: '4th–6th c. AD',
    exclusionCategory: 'Post-Nicene (4th–6th c. AD)',
    exclusionReason:
      'University of Michigan Coptic magical manuscripts date paleographically from the late fourth to the sixth century AD, falling after the AD 325 evidentiary cutoff.',
  },
  early_christian_bronze_lamps: {
    disposition: 'excluded',
    legacyTitle: 'Chi-Rho Bronze Oil Lamps',
    rawDateClaim: '4th–5th c. AD',
    exclusionCategory: 'Post-Nicene Constantinian Era',
    exclusionReason:
      'Surviving bronze oil lamps cast with Constantinian Chi-Rho monograms date archaeologically to the mid-fourth through fifth centuries AD rather than the pre-Nicene era.',
  },
  papyrus_bodmer_v: {
    disposition: 'excluded',
    legacyTitle: 'Papyrus Bodmer V (Protevangelium of James)',
    rawDateClaim: '4th c. AD copy',
    exclusionCategory: '4th-Century Copy & Marian Narrative',
    exclusionReason:
      'Paleographical reassessments (Orsini & Clarysse, 2012; Nongbri, 2018) place *P.Bodmer* V in the fourth century AD, and its infancy narrative centers on Mary rather than a direct deity predication of Christ.',
  },
  catacomb_of_callixtus: {
    disposition: 'excluded',
    legacyTitle: 'Catacomb of Callixtus Frescoes (Rome)',
    rawDateClaim: 'c. AD 200–250',
    exclusionCategory: 'Uninscribed Fresco Cycle',
    exclusionReason:
      'The Crypt of Lucina and Sacrament Chapels preserve early third-century eucharistic and baptismal wall paintings without a pre-Nicene inscription predicating deity of Jesus.',
  },
  sarcophagus_santa_maria_antiqua: {
    disposition: 'excluded',
    legacyTitle: 'Santa Maria Antiqua Sarcophagus (Roman Forum)',
    rawDateClaim: 'c. AD 270',
    exclusionCategory: 'Uninscribed Relief Sculpture',
    exclusionReason:
      'Third-century marble sarcophagus depicting Jonah, an orant, a seated reader, a ram-bearer, and the Baptism of Jesus; it bears no inscription.',
  },
  vatican_necropolis_graffiti: {
    disposition: 'excluded',
    legacyTitle: 'Vatican Necropolis Wall G Graffiti',
    rawDateClaim: 'c. AD 250–330',
    exclusionCategory: 'Contested Constantinian-Threshold Cryptography',
    exclusionReason:
      'Margherita Guarducci’s decipherment of overlapping monogrammatic strokes on Wall G remains disputed among epigraphists, and the plaster accumulation extends into Constantine’s basilica construction (c. AD 315–330).',
  },
  nott_gem: {
    disposition: 'excluded',
    legacyTitle: 'The Nott Crucifixion Intaglio (Lost; Known from Cast)',
    rawDateClaim: 'Mid–late 4th c. AD',
    exclusionCategory: 'Post-Nicene & Lost Original',
    exclusionReason:
      'Known solely from a modern plaster impression of a lost gem and dated stylistically by Jeffrey Spier (*Late Antique and Early Christian Gems*, 2007, pp. 73–74, no. 445) to the mid-to-late fourth century AD.',
  },
});
