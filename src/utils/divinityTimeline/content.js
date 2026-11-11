// Structured academic copy, contextual primary-source dossiers, historiographical
// discussions, methodology notes, and bibliography for `/discover/divinity-timeline`.
//
// Register standard: third-person formal historical, epigraphic, and philological
// prose. Every counter-position names the specific scholar, historical school,
// or dated primary text; first-person apologetic pronouns (“we”, “us”, “our”)
// and unnamed strawmen (“skeptics claim”, “critics argue”) are prohibited.

export const PAGE_META = Object.freeze({
  title:
    'Worship of Jesus Before Nicaea: Five Lines of Archaeological, Epigraphic, and Papyrological Evidence',
  metaTitle:
    'Pre-Nicene Worship of Jesus: Archaeological, Epigraphic & Manuscript Evidence Before AD 325 | Ready Apologia',
  description:
    'Chronological dossier of pre-Nicene mosaics, inscriptions, Roman and pagan testimonies, first-century creedal formulas, and second- and third-century Greek papyri attesting worship of Jesus and predication of God (theos) prior to AD 325.',
  eyebrow: 'Pre-Nicene Archaeology, Epigraphy & Papyrology',
  h1: 'Worship of Jesus Before Nicaea: Five Lines of Archaeological, Epigraphic, and Papyrological Evidence',
  breadcrumbLabel: 'Pre-Nicene Worship of Jesus',
  intro: Object.freeze([
    'Archaeological, documentary, and manuscript evidence shows early Christians directing prayer and hymnody to Jesus and, in specific pre-325 witnesses, calling him God (*theos*) well before the **Council of Nicaea** (**AD 325**, the first empire-wide council of bishops, which defined the Son as *homoousios*, “of the same essence,” with the Father). Historical debate over early **Christology** (doctrine concerning Jesus’s nature and status) turns on two distinct chronological questions: whether calling Jesus divine originated in fourth-century imperial policy at Nicaea, and whether first-century devotion arose late in Gentile cities rather than within earliest Judean Christianity (**AD 30–62**).',
    'Surviving pre-Constantinian mosaic pavements (sealed c. AD 305), a silver **phylactery** (protective amulet) from the Roman frontier, the sealed walls of a Syrian assembly house, and Greco-Roman administrative and satirical notices attest communal worship directed to Jesus decades to centuries before Emperor Constantine. Late second- to third-century Greek papyri transmit texts calling him God (*theos*), and **pre-Pauline** formulas (earlier than Paul’s letters of the AD 50s), namely an Aramaic prayer formula and Greek creedal hymns, are read by New Testament scholar **Richard Bauckham** (2008) as placing him within Israel’s unique divine identity.',
    'Five dossiers examine the pre-Nicene inscriptions (c. AD 190–305), external pagan, ritual, and rival-church witnesses (c. AD 112–319), first-century creedal formulas (AD 30–62), earliest biblical papyri (c. AD 100–316), and patristic letters, liturgical hymns, and martyrdom protocols (c. AD 107–307), labeling on every card what each item demonstrates and what it does not.',
  ]),
});

export const PAGE_FRAMING = Object.freeze({
  eyebrow: 'Historical Question & Evidentiary Key',
  heading:
    'Competing Historical Hypotheses and the Three Tiers of Pre-AD 325 Evidence',
  hypothesesMarkdown:
    'In Alexandria around **AD 318–325**, the presbyter **Arius** (*Thalia* and *Letter to Alexander of Alexandria*, preserved in Athanasius, *De Synodis* 15–16) argued that the Son was an exalted firstborn creature brought into existence out of nothing (*ēn pote hote ouk ēn*, “there was once when he was not”) rather than eternal God. Seventh-century Qurʾānic passages ([Qurʾān 4:171](/quran/4/171/tafsir/tabari); [5:72–75](/quran/5/72/tafsir/tabari); [9:30](/quran/9/30/tafsir/tabari)) honor Jesus as Messiah, Word, and spirit from God while rejecting the confession that he is God or Son of God. The classical Muslim theologians **ʿAbd al-Jabbār al-Hamadhānī** (*Tathbīt Dalāʾil al-Nubuwwa*, AD 995) and **Ibn Taymiyya** (*al-Jawāb al-Ṣaḥīḥ*, early 14th c.) later developed this critique, attributing the doctrine of Jesus’s deity to Pauline Hellenization and to Constantinian enforcement at Nicaea (AD 325). In modern European scholarship, **Adolf von Harnack** (*Lehrbuch der Dogmengeschichte*, 1886–1890) proposed a gradual Hellenization of the ethical teaching of Jesus into Greek metaphysical dogma, and **Wilhelm Bousset** (*Kyrios Christos*, 1913) argued that cultic acclamation of Jesus as divine “Lord” (*Kyrios*) emerged only in Gentile congregations.',
  tiersHeading: 'Why Every Card Distinguishes Three Evidentiary Tiers',
  tiers: Object.freeze([
    {
      tier: 'tier-a',
      bodyMarkdown:
        'Applies the noun **God** (`θεός` / *deus*) directly to Jesus—including the sealed Kefar ‘Othnay mosaic (`Θ̅Ω̅ Ι̅Υ̅ Χ̅Ω̅`), Ignatius’s letters, Melito’s *On Pascha*, Johannine and Pauline papyri (**𝔓66**, **𝔓75**, **𝔓46**), the hostile Palatine graffito (`θεόν`), and Bishop Phileas’s trial protocol (`[θεὸς]` restored from parallel witnesses).',
    },
    {
      tier: 'tier-b',
      bodyMarkdown:
        'Directs communal **prayer, liturgical hymnody, or exclusive divine prerogatives** (such as YHWH’s oath in [Isaiah 45:23](/bible/is/45#23) or “First and Last” in [Isaiah 44:6](/bible/is/44#6)) to Jesus without applying the noun `θεός` directly on the preserved object—including Pliny’s *quasi deo* report, *Marana tha*, [1 Corinthians 8:6](/bible/1cor/8#6), [Philippians 2:6–11](/bible/phil/2#6), the Frankfurt silver foil, Dura-Europos petitions, the Pereire gem, **𝔓98**, and the Oxyrhynchus hymn.',
    },
    {
      tier: 'tier-c',
      bodyMarkdown:
        'Establishes pre-Nicene **Christian identity, filial or lordship titles** (“God’s Son,” “Lord and Savior”), early manuscript circulation, or the scribal *nomina sacra* system (sacred names abbreviated under a horizontal bar)—including Abercius, Licinia Amias, the Marcionite lintel, **𝔓104**, and *P.Oxy.* III 405. Because titles such as “Messiah” or “servant/son” do not by themselves equate Jesus with God, Tier C items are not counted as standalone predications of deity.',
    },
  ]),
});

export const TIMELINE_SHOWCASE = Object.freeze({
  ariaLabel:
    'Chronological milestones of Christian devotion to Jesus from AD 30 to the Council of Nicaea in AD 325',
  caption:
    'Six chronological horizons, from the earliest Judean liturgy (AD 30–62) and pre-Constantinian material culture (c. AD 100–319) to the Council of Nicaea (AD 325).',
  events: Object.freeze([
    {
      date: 'AD 30–62',
      label: 'First-Century Prayer & Creedal Hymns',
      detail:
        'the Palestinian Aramaic prayer *Marana tha* (1 Cor 16:22), the reformulated *Shema* (1 Cor 8:6), and the *Carmen Christi* hymn (Phil 2:6–11) are attested in, or predate, Paul’s letters.',
      href: '#first-century-creeds',
    },
    {
      date: 'c. AD 100–250',
      label: 'Early Papyri & Palatine Graffito',
      detail:
        'Papyri 𝔓66, 𝔓75, and 𝔓46 (𝔓 = New Testament papyrus siglum) transmit divine titles written as *nomina sacra*, 𝔓98 preserves “First and Last” (Rev 1:17–18), 𝔓52 (Rylands fragment of John 18) and 𝔓104 attest second-century circulation of the Gospels, and Rome’s Palatine graffito (c. AD 200) mocks worship of a crucified god.',
      href: '#earliest-biblical-papyri',
    },
    {
      date: 'c. AD 107–115',
      label: 'Trajanic Roman & Syrian Records',
      detail:
        'Governor Pliny reports Bithynian Christians chanting hymns “to Christ as to a god” (*Ep.* 10.96.7); Ignatius of Antioch (traditionally dated under Trajan; c. AD 140 according to historian **Timothy D. Barnes**) calls Jesus “God come in flesh.”',
      href: '#hostile-and-external-witnesses',
    },
    {
      date: 'c. AD 190–305',
      label: 'Sealed Inscriptions & Monuments',
      detail:
        'Abercius cippus (carved funerary pillar, before AD 216), Dura-Europos church (buried before AD 256), Frankfurt foil (c. AD 230–270), and Kefar ‘Othnay mosaic (“to God Jesus Christ,” Θ̅Ω̅ Ι̅Υ̅ Χ̅Ω̅, sealed c. AD 305).',
      href: '#inscriptions-and-archaeology',
    },
    {
      date: 'AD 275–319',
      label: 'Notated Hymn, Martyr Trial & Rival Sects',
      detail:
        'Oxyrhynchus triadic doxology (*P.Oxy.* XV 1786), Bishop Phileas’s trial before Culcianus (AD 304–307, [θεὸς] restored), 𝔓10 (c. AD 316), and the Marcionite lintel of Deir Ali (AD 318/319).',
      href: '#patristic-and-liturgical-papyri',
    },
    {
      date: 'AD 325',
      label: 'Council of Nicaea Cutoff',
      detail:
        'The bishops reject Arius’s view of the Son as a creature by adopting *homoousios* (“of the same essence”); worship of Jesus is already attested from the early second century (Pliny, Ignatius).',
      href: '#methodology-and-scope',
    },
  ]),
});

export const GLANCE_ROWS = Object.freeze([
  {
    num: '01',
    id: 'inscriptions-and-archaeology',
    title: 'Stone, Mosaic & Metal Inscriptions (c. AD 190–305)',
    summary:
      'Stratigraphically sealed dedications at Kefar ‘Othnay (Θ̅Ω̅ Ι̅Υ̅ Χ̅Ω̅, sealed c. AD 305), Roman Nida (Frankfurt silver foil), and Dura-Europos (sealed before AD 256), alongside Phrygian and Roman *Ichthys* monuments.',
  },
  {
    num: '02',
    id: 'hostile-and-external-witnesses',
    title: 'Roman Officials, Magical Ritualists & Rival Churches (c. AD 112–319)',
    summary:
      'Pliny’s Bithynian dispatch, the Palatine donkey-crucifixion caricature, the Pereire magical bloodstone, and a dated AD 318/319 Marcionite meeting-house lintel.',
  },
  {
    num: '03',
    id: 'first-century-creeds',
    title: 'First-Century Aramaic Prayer & Creedal Hymns (AD 30–62)',
    summary:
      'Pre-Pauline Palestinian Aramaic prayer (*Marana tha*), the two-part *Shema* confession (1 Cor 8:6), and the *Carmen Christi* applying Isaiah 45:23 to Jesus.',
  },
  {
    num: '04',
    id: 'earliest-biblical-papyri',
    title: 'Second- & Third-Century Papyri & *Nomina Sacra* (c. AD 100–316)',
    summary:
      'Bodmer, Chester Beatty, IFAO, and Oxyrhynchus manuscripts (𝔓66, 𝔓75, 𝔓46, 𝔓98, 𝔓104, 𝔓77, 𝔓10) and the four-term sacred-name contraction system.',
  },
  {
    num: '05',
    id: 'patristic-and-liturgical-papyri',
    title: 'Patristic Letters, Liturgical Hymns & Martyrdom Papyri (c. AD 107–307)',
    summary:
      'Ignatius of Antioch’s middle-recension letters, Oxyrhynchus Irenaeus (*P.Oxy.* III 405), Melito’s *On Pascha*, the notated Oxyrhynchus hymn, and the trial protocol of Phileas.',
  },
]);

export const SECTIONS = Object.freeze([
  // ===========================================================================
  // SECTION 01
  // ===========================================================================
  {
    num: '01',
    id: 'inscriptions-and-archaeology',
    eyebrow: 'Line 01 · Material Epigraphy & Stratigraphy (c. AD 190–305)',
    title: 'Pre-Nicene Stone, Mosaic, and Metal Inscriptions (c. AD 190–305)',
    leadMarkdown:
      'Inscriptions set into mosaic floors, rolled silver foil, limestone **cippi**, and plastered assembly walls cannot have been altered by later manuscript copyists, although their decipherment, restorations, and **stratigraphic** dates (dates fixed by physical excavation layers) remain subject to scholarly debate. Across Roman Galilee, Germania Superior, the Syrian Euphrates, Phrygia, and Rome, surviving third-century monuments attest eucharistic table offerings, *nomina sacra*, and petitions to Christ before the Council of Nicaea (AD 325); one sealed Galilean mosaic (Kefar ‘Othnay) names Jesus `θεός` (“God”) outright. Fourth-century copies of earlier poems (Pectorius at Autun) and contested fourth-century **domus-ecclesia** layers (houses converted for church assembly, as at Capernaum) are treated separately below as comparative witnesses.',
    cardOrder: Object.freeze([
      { kind: 'dataset', id: 'megiddo_mosaic' },
      { kind: 'dataset', id: 'frankfurt_silver_scroll' },
      { kind: 'dataset', id: 'dura_europos_church' },
      { kind: 'dataset', id: 'abercius_inscription' },
      { kind: 'dataset', id: 'stele_of_licinia_amias' },
    ]),
    historiography: Object.freeze({
      heading:
        'Historiographical Context: The Fourth-Century Imposition Hypothesis and Pre-Constantinian Epigraphy',
      hypothesisTitle: 'Named Historical & Theological Positions',
      hypothesisMarkdown:
        'The classical Muslim theologians **ʿAbd al-Jabbār** (AD 995) and **Ibn Taymiyya** (early 14th c.), developing the Qurʾānic critique ([Qurʾān 4:171](/quran/4/171/tafsir/tabari); [5:72–75](/quran/5/72/tafsir/tabari); [9:30](/quran/9/30/tafsir/tabari)), argued that Emperor Constantine and the bishops at Nicaea (AD 325) imposed the doctrine of Christ’s deity on earlier followers of Jesus who had not held it, while **Arius** (c. AD 318–325) held that the Son was a creature. In modern archaeological scholarship, **Edward Adams** (2013), **Glen W. Bowersock** (*Syria* 95 [2018]), and **Joan E. Taylor** (1993) caution against assigning early dates to Christian meeting places that lack firm numismatic, ceramic, and stratigraphic controls.',
      assessmentTitle: 'Primary-Source & Stratigraphic Assessment',
      assessmentMarkdown:
        '1. **Scope of Nicene technical terminology:** The Council of Nicaea (AD 325) introduced a technical philosophical term, *homoousios tō Patri* (“of the same essence with the Father”), and for the first time backed such a definition with imperial synodal patronage, in order to exclude Arius’s **subordinationist** model (ranking the Son ontologically below the Father).\n' +
        '2. **Differentiated weight of sealed third-century monuments:** Among pre-Constantinian excavations, Akeptous’s mosaic at Kefar ‘Othnay (**Θ̅Ω̅ Ι̅Υ̅ Χ̅Ω̅**, “to God Jesus Christ,” sealed c. AD 305; dated c. AD 230 by the excavators and to the late third or very early fourth century by Adams 2013 and Bowersock 2018) provides a direct epigraphic `θεός` predication; the Nida Grave 134 silver foil (**c. AD 230–270**) adapts [Philippians 2:10–11](/bible/phil/2#10) to Jesus and, on Guijarro’s syntactic reading (*Isidorianum* 34/1 [2025], p. 34), applies *mundi dominus* and *Deus* to him; and the Dura-Europos assembly house, buried before **AD 256**, preserves contracted *nomina sacra* (`Χ̅Ν̅ Ι̅Ν̅`) and petitions to Christ without applying the noun `θεός`.\n' +
        '3. **Trans-provincial distribution prior to imperial patronage:** These monuments span civilian, military, and funerary settings: a pavement funded by a serving Roman centurion alongside Akeptous’s dedication at Legio/Kefar ‘Othnay, civic tombstones in Phrygia and Rome, a frontier inhumation at Nida, and a Syrian garrison house-church. These witnesses date to decades marked by the empire-wide persecutions under Decius (AD 249–251), Valerian (AD 257–260), and Diocletian and his successors (AD 303–311).\n' +
        '4. **Bounded epigraphic conclusion:** Material monuments alone do not express fourth-century Trinitarian metaphysics. Nevertheless, the Kefar ‘Othnay table dedication (before c. AD 305) shows Jesus being called `θεός`, and the Nida foil (before c. AD 270) shows the Philippians knee-bowing acclamation being applied to him, both before Constantine’s patronage.',
    }),
  },

  // ===========================================================================
  // SECTION 02
  // ===========================================================================
  {
    num: '02',
    id: 'hostile-and-external-witnesses',
    eyebrow: 'Line 02 · Hostile, Ritual & Rival-Church Evidence (c. AD 112–319)',
    title: 'Roman Officials, Pagan Caricature, Magical Ritualists, and Rival Churches (c. AD 112–319)',
    leadMarkdown:
      'Three categories of evidence from outside **proto-orthodox** Christianity (the branch that became mainstream episcopal Christianity) bear on early practice: (1) **hostile Greco-Roman officials, philosophers, and satirists** (Pliny, Celsus, Lucian, and the Palatine graffitist), who observed Christian worship from outside; (2) **syncretistic Mediterranean and Greco-Egyptian ritualists** (practitioners combining elements of several religious traditions, such as the secondary magical engraver on the Pereire bloodstone and the compiler of the Paris magical codex), who adapted Jesus’s name and cross as invocatory powers outside mainstream church liturgy; and (3) **rival dualist Christians** (believers separating the supreme God from a lesser creator deity, such as the Marcionite presbyter Paul at Lebaba in AD 318/319), who rejected the authority of mainstream bishops and the Creator God of the Hebrew Bible while retaining “Lord and Savior” (`Κύριος καὶ Σωτήρ`) and *nomina sacra* for Christ.',
    cardOrder: Object.freeze([
      { kind: 'contextual', id: 'witness-pliny_epistles_10_96' },
      { kind: 'dataset', id: 'alexamenos_graffito' },
      { kind: 'dataset', id: 'magic_crucifixion_gem' },
      { kind: 'dataset', id: 'marcionite_inscription' },
    ]),
    contextualCards: Object.freeze({
      'witness-pliny_epistles_10_96': {
        id: 'witness-pliny_epistles_10_96',
        title: 'Pliny the Younger, Epistles 10.96.7 to Emperor Trajan',
        displayYear: 'c. AD 111–113',
        datingBasis: 'historical-prosopographical',
        evidenceTier: 'tier-b',
        location: 'Bithynia and Pontus, northern Asia Minor',
        repository: 'Epistularum Libri Decem (Book 10 imperial correspondence)',
        language: 'Classical Latin administrative dispatch',
        image: null,
        keyExcerpt:
          '…stato die ante lucem convenire, carmenque Christo quasi deo dicere secum invicem…',
        quoteOriginal:
          'Adfirmabant autem hanc fuisse summam vel culpae suae vel erroris, quod essent soliti stato die ante lucem convenire, carmenque Christo quasi deo dicere secum invicem seque sacramento non in scelus aliquod obstringere…',
        quoteTranslation:
          '“They maintained, however, that the sum of their guilt or error had been this: that they were accustomed to meet on a fixed day before dawn and to recite a hymn [carmen] antiphonally among themselves to Christ as to a god [quasi deo], and to bind themselves by an oath, not for any crime…”',
        showsMarkdown:
          '**What this shows:** Documents, in a dated Roman governor’s dispatch (**c. AD 111–113**, with former members reporting practice back to **c. AD 90**), that Christians in Bithynia sang communal dawn hymns to Christ “as to a god” (*quasi deo*) while refusing, under threat of execution, to worship Roman deities. **Limits:** Expresses a polytheistic Roman magistrate’s external classification (*quasi deo*, “as to a god”) rather than an internal Christian metaphysical definition.',
        editionCitation:
          'R. A. B. Mynors (ed.), *C. Plini Caecili Secundi Epistularum Libri Decem* (Oxford Classical Texts, 1963), 10.96.7; commentary in A. N. Sherwin-White, *The Letters of Pliny* (Oxford, 1966), pp. 691–692, 704–705.',
        analysisMarkdown:
          'Writing as Roman imperial legate in northern Anatolia two centuries before Nicaea, Pliny reports interrogating former and active Christians—including two enslaved female ministers (*ministrae*) examined under torture, and defendants who stated they had left the movement twenty years earlier (extending Bithynian testimony back to **c. AD 90**). A *carmen* denotes a rhythmic liturgical hymn or chant, and Latin *quasi deo* (“as to a god”) expresses a Roman senator’s classification of the defendants’ testimony: Christians offered Christ antiphonal dawn hymnody of a kind that Greco-Roman religion ordinarily addressed to deities, while refusing under threat of execution to offer wine and incense to statues of Trajan and the Roman gods (*Ep.* 10.96.5).',
        verifyLinks: [
          {
            label: 'Perseus Digital Library — Pliny, Epistles 10.96 (Latin)',
            href: 'https://www.perseus.tufts.edu/hopper/text?doc=Plin.+Ep.+10.96',
          },
        ],
      },
    }),
    historiography: Object.freeze({
      heading:
        'Historiographical Context: Pagan Semantics of “Deity” & External Perception',
      hypothesisTitle: 'Named Historical & Philological Critiques',
      hypothesisMarkdown:
        'Writing c. **AD 177**, the Platonist philosopher **Celsus** (*Alēthēs Logos*, preserved in Origen, *Contra Celsum* 8.12 and 8.14) accused Christians of inconsistency, charging that they “worship to excess” (`ὑπερθρησκεύουσι`, *C. Cels.* 8.12) “the one who appeared recently” (`τὸν ἔναγχος φανέντα`) while claiming to serve one God alone. In modern classical commentary, Roman historian **A. N. Sherwin-White** (*The Letters of Pliny*, 1966, pp. 704–705) noted that in Greco-Roman polytheistic idiom *quasi deo* (“as to a god,” rather than *ut deo*) could compare Christian veneration of Christ to hero-cult or imperial honors without by itself settling questions of Christian metaphysics. In antiquity, the Greek satirist **Lucian of Samosata** (*De Morte Peregrini* 11, 13, c. AD 165) mocked the Christians whom Peregrinus encountered in Palestine for “worshiping that crucified sophist.”',
      assessmentTitle: 'Primary-Source & Philological Assessment',
      assessmentMarkdown:
        '1. **Validity of the lexical distinction:** In isolation, a Greco-Roman polytheist’s use of *deus* or `θεός` (as in Pliny’s *quasi deo* and the Palatine graffito’s anarthrous `θεόν`, “a god / God”) had a broader semantic spectrum than Jewish monotheism, since pagans recognized graded deities, deified emperors, and heroes.\n' +
        '2. **Exclusivity test in Pliny and Celsus:** Both Pliny (*Ep.* 10.96.3, 5) and Origen’s reply to Celsus (*Contra Celsum* 8.2, 8.12, 8.14, 8.65–67) record what distinguished Christian devotion from Greco-Roman hero-cult: confessing Christians accepted execution rather than offer incense and wine to the Roman gods and the emperor’s statue or swear by the emperor’s *tychē* (*genius*), reserving cultic worship exclusively for God and Christ.\n' +
        '3. **Distinct evidentiary weight of each category:** Hostile pagan witnesses, namely an imperial dispatch (Pliny, c. AD 112), philosophical critique (Celsus, c. AD 177), satire (Lucian, c. AD 165), and a graffito from the imperial pages’ quarters (`ΑΛΕΞΑΜΕΝΟϹ ϹΕΒΕΤΕ ΘΕΟΝ`, c. AD 200), document external perception of Christ-worship. Greco-Egyptian ritual objects (the Pereire bloodstone’s vocative prayer pairing Son, Father, and Jesus Christ, analyzed by Kotansky, *GRBS* 57 [2017], pp. 636–638, and the fourth-century Paris magical codex) show heterodox or syncretistic borrowing of Jesus’s name. The Marcionite lintel of Lebaba (OGIS 608, AD 318/319) shows a rival dualist church maintaining lordship titles (`Κύριος καὶ Σωτήρ`) independently of mainstream bishops.',
    }),
  },

  // ===========================================================================
  // SECTION 03
  // ===========================================================================
  {
    num: '03',
    id: 'first-century-creeds',
    eyebrow: 'Line 03 · Earliest Literary Stratum (AD 30–62)',
    title: 'The First Generation (AD 30–62): Pre-Pauline Aramaic Prayer and Creedal Hymns',
    leadMarkdown:
      'To establish what the earliest believers confessed between **AD 30 and 62**, historians examine the Aramaic prayer formula and Greek creedal hymns preserved in Paul’s undisputed letters, which were written twenty to thirty years after the crucifixion and predate the four Gospels. Dedicated church buildings and inscribed Christian tombstones appear in the archaeological record only around c. AD 200, because small first-century house groups owned neither monumental real estate nor separate cemeteries, as art historian **Paul Corby Finney** (*The Invisible God*, 1994) argues; manuscript survival, for its part, depends on dry Egyptian contexts.',
    cardOrder: Object.freeze([
      { kind: 'contextual', id: 'creed-maranatha_and_kerygma' },
      { kind: 'contextual', id: 'creed-shema_1cor_8_6' },
      { kind: 'contextual', id: 'creed-carmen_christi_phil_2' },
    ]),
    contextualCards: Object.freeze({
      'creed-maranatha_and_kerygma': {
        id: 'creed-maranatha_and_kerygma',
        title:
          'Pre-Pauline Palestinian Aramaic Prayer: Marana tha (1 Corinthians 16:22)',
        displayYear: 'Tradition c. AD 30–40; epistle c. AD 53–55',
        datingBasis: 'pre-pauline-textual',
        evidenceTier: 'tier-b',
        location: 'Aramaic-speaking Jerusalem/Judea; transmitted to Corinth',
        repository: '1 Corinthians 16:22 (attested in 𝔓46; cf. Didache 10.6)',
        language: 'Transliterated Palestinian Aramaic in Koine Greek',
        image: null,
        quoteOriginal:
          'Εἴ τις οὐ φιλεῖ τὸν κύριον, ἤτω ἀνάθεμα. Μαράνα θά [alt. division Μαρὰν ἀθά; Aramaic מָרַנָא תָּא].',
        quoteTranslation:
          '“If anyone does not love the Lord, he is to be accursed. Maranatha [Aramaic: ‘Our Lord, come!’; alt. division: ‘Our Lord has come’].”',
        showsMarkdown:
          '**What this shows:** Preserves an untranslated Palestinian Aramaic liturgical invocation generally attributed to the Judean church of the AD 30s–40s; on the imperative reading (“Our Lord, come!”) favored by parallel prayers ([Revelation 22:20](/bible/rv/22#20); *Didache* 10.6), believers addressed communal prayer directly to the risen Jesus, a form of address that Jewish liturgy otherwise reserved for God. **Limits:** Aramaic *mār* can mean human “master/sir” in ordinary speech, and if divided instead as the perfect *Māran ʾătāʾ* (“Our Lord has come”), the phrase states a confession rather than a prayer and does not use the word “God.”',
        editionCitation:
          'Nestle-Aland, *Novum Testamentum Graece*, 28th ed.; Joseph A. Fitzmyer, “New Testament *Kyrios* and *Maranatha* and Their Aramaic Background,” in *To Advance the Gospel* (1981); Martin Hengel, *Studies in Early Christology* (1995).',
        analysisMarkdown:
          'Writing around AD 53–55 to Greek-speaking Gentiles in Corinth, Paul inserts an untranslated Palestinian Aramaic liturgical formula, divided either as the imperative **Μαράνα θά** (*Māranāʾ tāʾ*, “Our Lord, come!”) or as the perfect **Μαρὰν ἀθά** (*Māran ʾătāʾ*, “Our Lord has come”). Many philologists, including Aramaic specialist **Joseph A. Fitzmyer** (1981) and historian of early Judaism and Christianity **Martin Hengel** (1995), prefer the imperative prayer reading because early Greek liturgical texts render it as a petition ([Revelation 22:20](/bible/rv/22#20), `Ἔρχου κύριε Ἰησοῦ`, “Come, Lord Jesus!”; *Didache* 10.6 eucharistic prayer). Although Aramaic *mār* can mean “sir” or “master” in ordinary speech, invoking an absent heavenly figure in communal worship has the form of liturgical prayer, and Aramaic fragments among the Dead Sea Scrolls (`4QEn`, `1QapGen`) attest *Mārēʾ* as a title for God. Because Greek-speaking Gentile congregations are unlikely to have coined an Aramaic prayer, many historians trace *Marana tha* to the Jerusalem/Judean community of the AD 30s, the same milieu to which New Testament scholar **C. H. Dodd** (1936) and Hengel trace Paul’s reception (*parelabon*, [1 Corinthians 15:3–5](/bible/1cor/15#3)) of the pre-Pauline **kerygma** (core apostolic proclamation).',
        verifyLinks: [
          {
            label: 'Read 1 Corinthians 16:22',
            href: '/bible/1cor/16#22',
          },
          {
            label: 'Compare Revelation 22:20',
            href: '/bible/rv/22#20',
          },
        ],
      },

      'creed-shema_1cor_8_6': {
        id: 'creed-shema_1cor_8_6',
        title: 'Christological Reformulation of the Jewish Shema (1 Corinthians 8:6)',
        displayYear: 'c. AD 53–55',
        datingBasis: 'pauline-epistle',
        evidenceTier: 'tier-b',
        location: 'Ephesus to Corinth (early Pauline monotheistic confession)',
        repository: '1 Corinthians 8:6 (attested in 𝔓46)',
        language: 'Koine Greek two-part confession (one God … one Lord)',
        image: null,
        quoteOriginal:
          'ἀλλ’ ἡμῖν εἷς θεὸς ὁ πατήρ, ἐξ οὗ τὰ πάντα καὶ ἡμεῖς εἰς αὐτόν, καὶ εἷς κύριος Ἰησοῦς Χριστός, δι’ οὗ τὰ πάντα καὶ ἡμεῖς δι’ αὐτοῦ.',
        quoteTranslation:
          '“yet for us there is [but] one God, the Father, from whom are all things and we [exist] for Him; and one Lord, Jesus Christ, by whom are all things, and we [exist] through Him.”',
        showsMarkdown:
          '**What this shows:** Within twenty-five years of the crucifixion, Paul expands Israel’s daily monotheistic confession (Deuteronomy 6:4, “the Lord our God, the Lord is one”) to place “one Lord, Jesus Christ” inside the creative agency of the one God (“by whom are all things”). **Limits:** Reserves the noun `θεός` (“God”) in this verse for the Father while assigning `κύριος` (“Lord,” the Septuagint rendering of YHWH) to Jesus, and **James D. G. Dunn** (1980) reads `δι’ οὗ` (“by/through whom”) in light of Jewish personified Wisdom.',
        editionCitation:
          '1 Corinthians 8:6 (NA28 / NASB); Richard Bauckham, *Jesus and the God of Israel* (Grand Rapids: Eerdmans, 2008); James D. G. Dunn, *Christology in the Making* (1980).',
        analysisMarkdown:
          'Addressing the question of food offered to idols in Corinth, Paul appeals to Israel’s daily confession, the *Shema* of Deuteronomy 6:4 LXX (`Κύριος ὁ θεὸς ἡμῶν Κύριος εἷς ἐστιν`, “The Lord our God, the Lord is one”). He distributes its two Greek nouns (**θεός**, “God,” and **κύριος**, “Lord,” the Septuagint rendering of YHWH) across “one God, the Father” and “one Lord, Jesus Christ,” and attributes the mediation of creation (**δι’ οὗ τὰ πάντα**, “by whom are all things”) to Jesus. Several scholars (e.g., **Richard Bauckham**, *God Crucified*, 1998) regard the formula as a pre-Pauline confession; at the latest, it dates to the composition of the epistle (c. AD 53–55). While New Testament scholar **James D. G. Dunn** (1980) compares `δι’ οὗ` to personified Wisdom and Philo’s *Logos* (Wisdom 7:22; 9:1–2; Philo, *De Cherubim* 127), **Richard Bauckham** (*Jesus and the God of Israel*, 2008) argues that by reworking the *Shema* to include `εἷς κύριος Ἰησοῦς Χριστός`, read alongside [Isaiah 44:24](/bible/is/44#24), Paul includes Jesus within Israel’s “unique divine identity.”',
        verifyLinks: [
          {
            label: 'Read 1 Corinthians 8:4–6',
            href: '/bible/1cor/8#4',
          },
          {
            label: 'Compare Isaiah 44:24 LXX',
            href: '/bible/is/44#24',
          },
        ],
      },

      'creed-carmen_christi_phil_2': {
        id: 'creed-carmen_christi_phil_2',
        title: 'The Carmen Christi (“Hymn of Christ”) Applying Isaiah 45:23 to Jesus (Philippians 2:6–11)',
        displayYear: 'Epistle c. AD 55–62 (pre-Pauline hymn hypothesis: AD 40s)',
        datingBasis: 'pre-pauline-textual',
        evidenceTier: 'tier-b',
        location: 'Pauline epistle to Philippi (often assigned to earlier Judean/Syrian liturgy)',
        repository:
          'Philippians 2:6–11 (attested in 𝔓46 & adapted on Frankfurt Foil)',
        language: 'Rhythmic Koine Greek strophic passage',
        image: null,
        keyExcerpt:
          '[Phil 2:6] ὃς ἐν μορφῇ θεοῦ ὑπάρχων… [2:10–11] ἵνα ἐν τῷ ὀνόματι Ἰησοῦ πᾶν γόνυ κάμψῃ… καὶ πᾶσα γλῶσσα ἐξομολογήσηται ὅτι κύριος Ἰησοῦς Χριστός…',
        quoteOriginal:
          '[Phil 2:6] ὃς ἐν μορφῇ θεοῦ ὑπάρχων οὐχ ἁρπαγμὸν ἡγήσατο τὸ εἶναι ἴσα θεῷ… [2:10–11] ἵνα ἐν τῷ ὀνόματι Ἰησοῦ πᾶν γόνυ κάμψῃ ἐπουρανίων καὶ ἐπιγείων καὶ καταχθονίων καὶ πᾶσα γλῶσσα ἐξομολογήσηται ὅτι κύριος Ἰησοῦς Χριστὸς εἰς δόξαν θεοῦ πατρός.',
        quoteTranslation:
          '[Phil 2:6] “who, although He existed in the form of God, did not regard equality with God a thing to be grasped,”  ·  [Phil 2:10–11] “so that at the name of Jesus every knee will bow, of those who are in heaven and on earth and under the earth, and that every tongue will confess that Jesus Christ is Lord, to the glory of God the Father.”',
        showsMarkdown:
          '**What this shows:** Describes Christ as existing “in the form of God,” speaks of his “equality with God,” and applies to the name of Jesus the oath of universal homage to YHWH in [Isaiah 45:23](/bible/is/45#23) (“every knee will bow”), within three decades of the crucifixion. **Limits:** Acclaims Jesus climactically as `κύριος` (“Lord,” to the glory of God the Father) rather than predicating the noun `θεός` directly, and **James D. G. Dunn** (1980) disputes pre-existence in v. 6 by reading “form of God” as human Adam-typology.',
        editionCitation:
          'Philippians 2:6–11 (NA28 / NASB); Ernst Lohmeyer, *Kyrios Jesus* (1928); Ralph P. Martin, *A Hymn of Christ*, 3rd ed. (1997); dissenting on pre-existence: James D. G. Dunn, *Christology in the Making* (1980); dissenting on pre-Pauline origin: Gordon D. Fee, *Bulletin for Biblical Research* 2 (1992), pp. 29–46.',
        analysisMarkdown:
          'Following **Ernst Lohmeyer** (1928) and **Ralph P. Martin** (1967/1997), many New Testament commentators classify [Philippians 2:6–11](/bible/phil/2#6) as a pre-Pauline liturgical hymn (*Carmen Christi*, Latin for “Hymn of Christ”) marked by rare vocabulary (*harpagmos*, *hyperypsoō*, *morphē*) and balanced clauses. Pauline scholar **Gordon D. Fee** (*BBR* 2 [1992], pp. 29–46) argues instead that the passage is exalted Pauline prose composed for the epistle (c. AD 55–62), so an AD 40s date for the hymn remains a reconstruction. On the exegetical level, **James D. G. Dunn** (*Christology in the Making*, 1980) reads “in the form of God” (*en morphē theou*) through Adam-typology (Genesis 1:26–27, contrasting Adam’s grasp with Jesus’s obedience) rather than personal pre-existence, whereas many commentators point to the participle `ὑπάρχων` followed by “taking the form of a bond-servant” and “being made in the likeness of men” (v. 7) as presupposing pre-incarnate status. In vv. 10–11, the passage transfers to Jesus the divine oath of [Isaiah 45:23](/bible/is/45#23), matching the wording of Codex Alexandrinus and Rahlfs’s LXX, `ὅτι ἐμοὶ κάμψει πᾶν γόνυ καὶ ἐξομολογήσεται πᾶσα γλῶσσα τῷ θεῷ` (“to me every knee shall bend, and every tongue shall confess to God”; Codex Vaticanus, Ziegler’s Göttingen edition, and Brenton read `ὀμεῖται`, “shall swear”), two verses after YHWH’s declaration “there is no other beside me” ([Isaiah 45:21](/bible/is/45#21)).',
        verifyLinks: [
          {
            label: 'Read Philippians 2:5–11',
            href: '/bible/phil/2#5',
          },
          {
            label: 'Compare Isaiah 45:21–23 LXX',
            href: '/bible/is/45#21',
          },
        ],
      },
    }),
    historiography: Object.freeze({
      heading:
        'Historiographical Context: Gentile-Origin Models vs. Early Judean Devotion',
      hypothesisTitle: 'Named Modern Critical Hypotheses',
      hypothesisMarkdown:
        'In **1913**, history-of-religions scholar **Wilhelm Bousset** (*Kyrios Christos*) proposed that the earliest Palestinian Jewish followers viewed Jesus solely as an eschatological human prophet-Messiah, and that cultic acclamation of Jesus as divine *Kyrios* (“Lord”) emerged only when Christianity moved into Hellenistic Gentile cities such as Antioch and Damascus. Later scholars proposed distinct developmental models: **James D. G. Dunn** (*Christology in the Making*, 1980) read [Philippians 2:6–7](/bible/phil/2#6) as Adam-typology (see above); **Maurice Casey** (*From Jewish Prophet to Gentile God*, 1991) argued that Jewish monotheistic constraints prevented calling Jesus divine until the Johannine community broke with the synagogue around **AD 90**; and **Bart D. Ehrman** (*How Jesus Became God*, 2014) acknowledged a high Christology of pre-existence in Paul’s letters of the AD 50s (interpreting Paul’s Christ through divine-angelic categories) while positing an earlier shift from post-resurrection *exaltation* Christology to *incarnation* Christology.',
      assessmentTitle: 'Primary-Source & Philological Assessment',
      assessmentMarkdown:
        '1. **Diversity of first-century idiom:** New Testament writings employ distinct conceptual registers, ranging from the enthroned Son of Man and Davidic Messiah of the Jerusalem speeches in Acts to Pauline cosmic mediation and the *Logos* prologue of John.\n' +
        '2. **Erosion of Bousset’s linguistic divide:** Bousset’s Gentile-origin thesis became difficult to sustain once Dead Sea Scrolls fragments (`4QEn`, `1QapGen`) attested Palestinian Aramaic *Mārēʾ* as a divine title and *Marana tha* ([1 Corinthians 16:22](/bible/1cor/16#22)) indicated that Aramaic-speaking Judean believers addressed liturgical prayer to the risen Jesus prior to Paul’s Aegean mission (**Martin Hengel**, *Between Jesus and Paul*, 1983).\n' +
        '3. **Inference from Pauline controversy letters:** Although [1 Corinthians 15:11](/bible/1cor/15#11) concerns the shared proclamation of the resurrection *kerygma* rather than metaphysical titles, Paul’s letters record sharp disputes with Cephas and the delegates from James over Torah observance and table fellowship (Galatians 2:1–14) but no dispute over his **binitarian** devotion (worship directed to God the Father and to the Lord Jesus); this is an argument from silence and carries limited weight.\n' +
        '4. **Second Temple intermediary figures vs. corporate cultic practice:** Second Temple Jewish texts do portray exalted figures receiving obeisance or mediating creation—in *1 Enoch* 48:5 and 62:6–9 kings prostrate before the Son of Man / Elect One, in *Life of Adam and Eve* 13–16 angels are commanded to bow to Adam, and in Wisdom 7:22; 9:1–2 and **Philo** (*De Cherubim* 127; *De Specialibus Legibus* 1.81) Wisdom and the *Logos* serve as cosmic agents, parallels emphasized by **William Horbury** (*Jewish Messianism and the Cult of Christ*, 1998), **James F. McGrath** (*The Only True God*, 2009), and **Crispin Fletcher-Louis** (*All the Glory of Adam*, 2002; *Jesus Monotheism*, 2015). Historian of early Christianity **Larry W. Hurtado** (*Lord Jesus Christ*, 2003) locates the historical novelty of earliest Christianity not in the absence of Jewish intermediary speculation, but in the rapid emergence of *corporate cultic devotion*—singing hymns, invoking Jesus’s name in communal prayer, and celebrating the sacred meal in his name alongside God the Father.',
    }),
  },

  // ===========================================================================
  // SECTION 04
  // ===========================================================================
  {
    num: '04',
    id: 'earliest-biblical-papyri',
    eyebrow: 'Line 04 · Pre-Nicene Textual Transmission (c. AD 100–316)',
    title: 'Second- and Third-Century Greek Papyri and the Scribal Nomina Sacra (c. AD 100–316)',
    leadMarkdown:
      'Text-critical and historical-theological debates distinguish two separate alteration hypotheses: classical Muslim theologians such as **ʿAbd al-Jabbār** (*Tathbīt*, AD 995) posited a fourth-century Constantinian rewriting of Christian scripture, whereas modern textual critic **Bart D. Ehrman** (*The Orthodox Corruption of Scripture*, 1993; 2nd ed. 2011) argues that **second- and third-century** proto-orthodox copyists altered specific passages (such as [John 1:18](/bible/jn/1#18) or [Luke 3:22](/bible/lk/3#22)) during controversies with **adoptionism** (the view that Jesus became God’s Son at his baptism) and **docetism** (the view that Christ only seemed to have a physical body). Surviving Egyptian papyri from Oxyrhynchus, the Fayyum, and the Bodmer find near Dishna directly test the fourth-century rewriting hypothesis; for Ehrman’s earlier-alteration hypothesis, they show which readings were already current by c. AD 200–250 and document the scribal system of *nomina sacra* already in use.',
    cardOrder: Object.freeze([
      { kind: 'dataset', id: 'papyrus_66_john_1_1' },
      { kind: 'dataset', id: 'papyrus_46_philippians_2_6' },
      { kind: 'dataset', id: 'papyrus_98' },
      { kind: 'dataset', id: 'papyrus_104' },
    ]),
    historiography: Object.freeze({
      heading:
        'Historiographical Context: Paleographical Dating Ranges & the Nomina Sacra Debate',
      hypothesisTitle: 'Named Paleographical & Textual Critiques',
      hypothesisMarkdown:
        'Papyrologist **Brent Nongbri** (“The Limits of Palaeographic Dating of Literary Papyri: Some Observations on the Date and Provenance of P.Bodmer II [P66],” *Museum Helveticum* 71 [2014], pp. 1–35; *God’s Library: The Archaeology of the Earliest Christian Manuscripts*, Yale University Press, 2018) cautioned that undated literary bookhands have sometimes been assigned overly narrow fifty-year dates, arguing that hands comparable to **𝔓66** and **𝔓75** could extend from the late second into the early fourth century. Separately, New Testament scholar **Christopher M. Tuckett** (“P52 and Nomina Sacra,” *New Testament Studies* 47 [2001], and “‘Nomina Sacra’: Yes and No?” in *The Biblical Canons*, Leuven, 2003) questioned whether routine scribal contraction of sacred names always reflected conscious Christological confession rather than inherited copying convention.',
      assessmentTitle: 'Primary-Source & Papyrological Assessment',
      assessmentMarkdown:
        '1. **Methodological precision on hand ranges:** As Nongbri emphasizes, paleography compares undated bookhands with dated documentary papyri and yields probability windows of several decades rather than exact calendar years; later scribes also copied *nomina sacra* by trained habit.\n' +
        '2. **Critique of theological palaeography & documentary anchors:** Greek paleographers **Pasquale Orsini and Willy Clarysse** (*“Early New Testament Manuscripts and Their Dates: A Critique of Theological Palaeography,”* *ETL* 88 [2012], pp. 443–474, final summary table) rejected proposed dates earlier than AD 125 and moved several manuscripts later, while assigning second- or third-century windows to **𝔓104** (AD 100–200), **𝔓52** (AD 125–175), **𝔓98** (AD 200–250), **𝔓46** (AD 200–225), **𝔓66** (AD 200–250), and **𝔓75** (AD 200–250); independently, **𝔓10** (*P.Oxy.* II 209) sits inside a dated archival bundle of **c. AD 316** (**AnneMarie Luijendijk**, *JBL* 129 [2010]).\n' +
        '3. **Origin of the four-term sacred register:** Irrespective of the habits of later copyists, the second-century standardization of the core four-noun contraction set (**Θ̅Ϲ̅** *Theos*, **Κ̅Ϲ̅** *Kyrios*, **Ι̅Η̅Ϲ̅** *Iēsous*, and **Χ̅Ϲ̅** *Christos*) across early Christian centers visually grouped Jesus’s personal name and messianic title with `Θεός` and `Κύριος` (**Larry W. Hurtado**, *The Earliest Christian Artifacts*, 2006, ch. 3).\n' +
        '4. **Scope vs. limits of extant papyri:** Individual verses show second- and third-century textual variation, such as `[ὁ] μονογενὴς Θ̅Ϲ̅` (`μονογενὴς Θ̅Ϲ̅` in **𝔓66**, `ὁ μονογενὴς Θ̅Ϲ̅` in **𝔓75**, `[ὁ] μονογενὴς θεός` in NA28) versus `ὁ μονογενὴς υἱός` (Old Latin, Curetonian Syriac, Alexandrinus; **Bart D. Ehrman**, 1993; 2nd ed. 2011, ch. 2) at [John 1:18](/bible/jn/1#18). Nevertheless, the one or two pre-Nicene papyri that preserve each key passage (**𝔓46** for [Philippians 2:6–11](/bible/phil/2#6), [1 Corinthians 8:6](/bible/1cor/8#6), [Colossians 1:16–20](/bible/col/1#16), and Hebrews 1:8; **𝔓66** and **𝔓75** for [John 1:1](/bible/jn/1#1); **𝔓98**, fragmentarily, for [Revelation 1:17–18](/bible/rv/1#17)) attest the same high-Christology wording found in later manuscripts, within the paleographical date ranges noted above.',
    }),
  },

  // ===========================================================================
  // SECTION 05
  // ===========================================================================
  {
    num: '05',
    id: 'patristic-and-liturgical-papyri',
    eyebrow: 'Line 05 · Pre-Nicene Theology, Hymns & Martyrdom (c. AD 107–307)',
    title: 'Pre-Nicene Patristic Letters, Liturgical Hymns, and Martyrdom Papyri (c. AD 107–307)',
    leadMarkdown:
      'Alongside early second-century episcopal letters transmitted in medieval manuscripts (Ignatius of Antioch), dry Egyptian sites preserved early Christian treatises (*P.Oxy.* III 405), Paschal homilies (*P.Bodmer* XIII), musically notated hymns (*P.Oxy.* XV 1786), and courtroom martyrdom protocols (*P.Bodmer* XX) copied before or around the Constantinian transition. Together, these witnesses show how pre-Nicene bishops and martyrs predicated `θεός` (“God”) of Christ, how hymn-writers addressed worship to him, and why fourth-century councils still faced unresolved philosophical questions over how Father and Son were one.',
    cardOrder: Object.freeze([
      { kind: 'contextual', id: 'witness-ignatius_epistles' },
      { kind: 'dataset', id: 'papyrus_oxyrhynchus_405' },
      { kind: 'dataset', id: 'papyrus_bodmer_xiii' },
      { kind: 'dataset', id: 'oxyrhynchus_hymn' },
      { kind: 'dataset', id: 'papyrus_bodmer_xx' },
    ]),
    contextualCards: Object.freeze({
      'witness-ignatius_epistles': {
        id: 'witness-ignatius_epistles',
        title:
          'Ignatius of Antioch, Epistles (Ephesians 7.2; Romans Inscr. & 3.3; Smyrnaeans 1.1)',
        displayYear: 'Composed c. AD 107–115 (Barnes: c. AD 140)',
        datingBasis: 'patristic-manuscript',
        evidenceTier: 'tier-a',
        location: 'Antioch in Syria; written across western Asia Minor en route to Rome',
        repository:
          'Seven Middle-Recension Greek Epistles (Codex Mediceo-Laurentianus 57.7, 11th c. [six letters]; Codex Parisinus Graecus 1451, 10th c. [Romans]; & ancient versions)',
        language: 'Koine Greek literary epistles',
        image: null,
        keyExcerpt:
          '[Eph. 7.2] ἐν σαρκὶ γενόμενος θεός [var. ἐν ἀνθρώπῳ θεός]  ·  [Rom. inscr.] Ἰησοῦ Χριστοῦ τοῦ θεοῦ ἡμῶν  ·  [Smyrn. 1.1] δοξάζω Ἰησοῦν Χριστὸν τὸν θεόν…',
        quoteOriginal:
          '[Eph. 7.2] Εἷς ἰατρός ἐστιν, σαρκικός τε καὶ πνευματικός, γεννητὸς καὶ ἀγέννητος, ἐν σαρκὶ γενόμενος θεός [var. ἐν ἀνθρώπῳ θεός]…  ·  [Rom. inscr.] Ἰησοῦ Χριστοῦ τοῦ θεοῦ ἡμῶν  ·  [Rom. 3.3] ὁ γὰρ θεὸς ἡμῶν Ἰησοῦς Χριστὸς ἐν πατρὶ ὢν μᾶλλον φαίνεται  ·  [Smyrn. 1.1] δοξάζω Ἰησοῦν Χριστὸν τὸν θεὸν τὸν οὕτως ὑμᾶς σοφίσαντα.',
        quoteTranslation:
          '[Eph. 7.2] “There is one Physician, both fleshly and spiritual, begotten and unbegotten, God come in flesh [Lightfoot var.: ‘God in man’]…”  ·  [Rom. inscr.] “…of Jesus Christ our God.”  ·  [Rom. 3.3] “For our God, Jesus Christ, being in the Father, is the more clearly manifested.”  ·  [Smyrn. 1.1] “I glorify Jesus Christ, the God who made you so wise.”',
        showsMarkdown:
          '**What this shows:** Calls Jesus “God” (`θεός` / `ὁ θεὸς ἡμῶν`) fourteen times across five letters dated c. AD 107–115 under Trajan (or c. AD 140 according to **Timothy D. Barnes**), roughly two centuries before Nicaea. **Limits:** Unlike stone inscriptions or Egyptian papyri, Ignatius’s full Greek text survives in **tenth- and eleventh-century** manuscripts (Codex Mediceo-Laurentianus 57.7 for six letters and Codex Parisinus Graecus 1451 for *Romans*, plus fourth/fifth-century Latin, Syriac, and Coptic versions), and fourth-century editors produced an expanded “long recension,” requiring philological separation of the genuine **middle recension** (the seven-letter text form quoted by Eusebius).',
        editionCitation:
          'J. B. Lightfoot, *The Apostolic Fathers, Part II: S. Ignatius, S. Polycarp*, 2nd ed. (London, 1889); Michael W. Holmes, *The Apostolic Fathers: Greek Texts and English Translations*, 3rd ed. (Grand Rapids: Baker Academic, 2007); Murray J. Harris, *Jesus as God* (Grand Rapids: Baker, 1992).',
        analysisMarkdown:
          'Ignatius was escorted under Roman guard from Syrian Antioch through Smyrna and Troas to execution in Rome. Eusebius (*Hist. Eccl.* 3.36) dates this to Trajan’s reign (**c. AD 107–115**), while classicist **Timothy D. Barnes** (2008) proposes c. AD 140, still nearly two centuries before Nicaea. In five of his seven **middle-recension** letters, Ignatius predicates `θεός` of Jesus **fourteen times**, using both articular `ὁ θεός` and anarthrous `θεός` in third-person descriptions rather than vocative prayer. The middle recension is the unexpanded seven-letter collection, established by **Theodor Zahn** (1873) and **J. B. Lightfoot** (1889) from Polycarp’s *Philippians* 13 and Eusebius, as distinct from the later fourth-century long-recension interpolations. As catalogued by New Testament scholar **Murray J. Harris** (1992), those fourteen instances occur in *Ephesians* (inscr.; 1.1; 7.2—where Codex Mediceo-Laurentianus reads `ἐν σαρκὶ γενόμενος θεός` and Lightfoot printed `ἐν ἀνθρώπῳ θεός` from early versions and Athanasius; 15.3; 18.2; 19.3), *Romans* (inscr. [×2]; 3.3; 6.3), *Smyrnaeans* (1.1; 10.1), *Polycarp* (8.3), and *Trallians* (7.1), whereas *Magnesians* and *Philadelphians* contain no direct `θεός` predication of Christ.',
        verifyLinks: [
          {
            label: 'New Advent — Ignatius, Epistle to the Ephesians 7',
            href: 'https://www.newadvent.org/fathers/0104.htm',
          },
          {
            label: 'New Advent — Ignatius, Epistle to the Romans',
            href: 'https://www.newadvent.org/fathers/0107.htm',
          },
        ],
      },
    }),
    historiography: Object.freeze({
      heading:
        'Historiographical Context: Pre-Nicene Logos Subordinationism vs. Creaturely Arianism',
      hypothesisTitle: 'Named Patristic & Historical-Theological Models',
      hypothesisMarkdown:
        'Patristic historians **R. P. C. Hanson** (*The Search for the Christian Doctrine of God: The Arian Controversy 318–381*, T&T Clark, 1988) and **J. N. D. Kelly** (*Early Christian Doctrines*, 5th ed., 1977) document that second- and third-century Christian theologians, including **Justin Martyr** (*Dialogue with Trypho* 56, 61, 128, c. AD 155–160), **Tertullian** (*Adversus Praxean* 9, c. AD 213), and **Origen of Alexandria** (*Commentary on John* 2.2; *Contra Celsum* 8.12, c. AD 230–248), frequently combined affirmation of the Son’s deity with **subordinationist** or **modalist**-sounding (treating Father and Son as one person) philosophical expressions. They describe the Father as the unoriginate fountainhead (*autotheos*, “God in himself”) and the *Logos* as derivative, or as ministering to the Father’s will in creation and theophanies.',
      assessmentTitle: 'Primary-Source & Historical-Theological Assessment',
      assessmentMarkdown:
        '1. **Pre-Nicene subordinationist and modalist tensions:** Second- and third-century writers lacked a unified technical vocabulary for separating personal distinction from ontological gradation: Melito’s *Peri Pascha* §§9–10 sounds modalist (treating Father and Son as modes of a single person; **Stuart George Hall**, 1979), Tertullian writes “the Father is the whole substance, whereas the Son is a derivation and portion of the whole” (*Adv. Prax.* 9.2), and Arius later appealed selectively to subordinationist expressions (ranking the Son below the Father in being) in Origen and Dionysius of Alexandria.\n' +
        '2. **Distinctions within pre-Nicene Logos theology:** Alongside those graded expressions, **Justin** describes Christ as “God and Lord” begotten from the Father like fire kindled from fire without diminution (*Dial.* 61, 128); **Tertullian** speaks of Father, Son, and Spirit as *unius substantiae* (“of one substance,” *Adv. Prax.* 2.4) and three distinguished as *personae* (“persons,” *Adv. Prax.* 2.4, 12.6–7); and **Origen** affirms eternal generation (*non est autem quando non fuerit*, “there was never when he was not,” *De Principiis* 1.2.9; cf. 4.4.1—preserved in **Rufinus’s** fourth-century Latin version, whose preface acknowledges smoothing suspect expressions), while in extant Greek (*Contra Celsum* 8.12) Origen defends joint worship (`ἕνα … θεὸν … θεραπεύομεν`) by grounding the unity of Father and Son in **concord and identity of will** (`τῇ ὁμονοίᾳ καὶ τῇ συμφωνίᾳ καὶ τῇ ταυτότητι τοῦ βουλήματος`).\n' +
        '3. **Bounded historical conclusion:** Across Ignatius (`ἐν σαρκὶ γενόμενος θεός`), Irenaeus’s treatise (circulating in Egypt by c. AD 200 in *P.Oxy.* III 405), Melito (`φύσει θεὸς ὢν καὶ ἄνθρωπος`), the Oxyrhynchus triadic doxology (*P.Oxy.* XV 1786), and Bishop Phileas’s trial before Culcianus (*P.Bodmer* XX / *Acta Phileae*, AD 304–307), cultic worship of Jesus and predication of `θεός` precede Nicaea; the **metaphysical and ontological settlement** (*homoousios*, “of the same essence,” as opposed to both Arian creaturehood and Origenist unity-of-will subordinationism) belongs to the fourth-century councils.',
    }),
  },
]);

export const METHODOLOGY_SECTION = Object.freeze({
  id: 'methodology-and-scope',
  eyebrow: 'Evidentiary Standards & Scope',
  title: 'Dating Methodology, Composition vs. Copy Dates, and Excluded Artifacts',
  leadMarkdown:
    'Chronological evaluation of pre-Nicene evidence distinguishes three separate measurements: (1) **archaeological or archival sealing** (physical burial horizons such as Dura-Europos before AD 256 and Kefar ‘Othnay c. AD 305, dated civic eras, or dated business bundles such as **𝔓10** c. AD 316), (2) **paleographical hand windows** (comparative handwriting ranges typically spanning fifty to one hundred years), and (3) **literary composition vs. surviving copy date** (such as Ignatius’s early second-century letters in tenth- and eleventh-century Greek manuscripts, Melito’s AD 165–175 homily in the late third- or early fourth-century *P.Bodmer* XIII, the *PGM* IV exorcism in a c. AD 300–350 codex, or the older *Ichthys* hymn carved on Pectorius’s fourth-century slab). Every card above labels both its dating basis and its evidentiary tier (Tier A, B, or C).',
  principles: Object.freeze([
    {
      title: 'Strict AD 325 Evidentiary Cutoff',
      bodyMarkdown:
        'Monuments, texts, and manuscripts anchored prior to the Council of Nicaea (May/June–July/August AD 325) are separated explicitly from fourth-century physical copies (such as the Pectorius stone at Autun and the Theban magical codex BnF Suppl. grec 574) and post-Nicene or contested comparators (such as the Constanza Gem and Capernaum’s fourth-century *domus-ecclesia* phase).',
    },
    {
      title: 'Inscribed Text Over Uninscribed Art',
      bodyMarkdown:
        'Uninscribed pastoral reliefs (such as *kriophoros* ram-bearers) and catacomb frescoes without Christological text cannot by themselves establish predications of deity and are excluded from the primary dossier.',
    },
    {
      title: 'Institutional & Editio Princeps Photography',
      bodyMarkdown:
        'Every photograph displayed above is credited to its holding museum, antiquities authority, or papyrological *editio princeps* (first scholarly publication), matching the exact shelfmark and folio discussed in the accompanying text.',
    },
  ]),
  excludedDisclosure: Object.freeze({
    summaryLabel:
      'Artifacts Frequently Cited for Pre-Nicene Christology Excluded Here (14 Items)',
    introMarkdown:
      'Fourteen items (artifacts, catacomb frescoes, gems, and manuscripts) sometimes cited in discussions of early Christian devotion are excluded from the pre-Nicene evidence above because specialist publications date them after AD 325, because they bear no inscription, or because their wording is not Christological.',
  }),
});

export const SOURCES_GROUPS = Object.freeze([
  {
    category: 'Archaeological Reports & Epigraphic Studies',
    items: Object.freeze([
      {
        title:
          'Tepper, Yotam & Leah Di Segni — *A Christian Prayer Hall of the Third Century CE at Kefar ‘Othnay (Legio)* (IAA, 2006; *Hadashot Arkheologiyot* 118)',
        href: 'https://www.hadashot-esi.org.il/report_detail_eng.aspx?id=363&mag_id=111',
        note: 'Official Israel Antiquities Authority excavation report on the Akeptous mosaic (“to God Jesus Christ,” Θ̅Ω̅ Ι̅Υ̅ Χ̅Ω̅; sealed c. AD 305).',
      },
      {
        title:
          'Bowersock, Glen W. — “Religion in Early Fourth Century Roman Palestine: The Kfar ‘Othnay Mosaics,” *Syria* 95 (2018), pp. 65–72',
        href: 'https://web.archive.org/web/20240710235512/https://journals.openedition.org/syria/6289',
        note: 'Re-evaluates numismatic and ceramic evidence from Kefar ‘Othnay, arguing for a late third- or very early fourth-century AD date before the c. AD 305 sealing.',
      },
      {
        title:
          'Guijarro, Santiago — “The Amulet of Frankfurt: Popular Christianity in the *limes germanicus*,” *Isidorianum* 34/1 (2025), pp. 25–48',
        href: 'https://web.archive.org/web/20261022140203/https://www.sanisidoro.net/publicaciones/index.php/isidorianum/article/view/frankfurt-amulet-limes-germanicus',
        note: 'Critical edition and commentary on the eighteen-line c. AD 230–270 Nida Grave 134 Latin silver foil with Greek *nomina sacra* I̅H̅ X̅P̅ (DOI 10.46543/ISID.2534.1004; paired with Scholz 2025).',
      },
      {
        title:
          'Peppard, Michael — *The World’s Oldest Church: Bible, Art, and Ritual at Dura-Europos, Syria* (Yale University Press, 2016; citing Kraeling & Welles, *Final Report* VIII.2, 1967)',
        href: 'https://archive.org/details/MichaelPeppardTheWorldsOldestChurchBibleArtAndRitualAtDuraEuroposSyria',
        note: 'Open-access study of the Dura-Europos Christian Building, pre-AD 256 baptistery frescoes, and Room 6 Greek wall graffiti.',
      },
      {
        title:
          'Museo Pio Cristiano (Vatican Museums) — Inscription & Cippus of Abercius of Hieropolis (before AD 216; Wischmeyer, *JbAC* 23 [1980] 22–47)',
        href: 'https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/lapidario-cristiano/abercio/cippo-di-albercio.html',
        note: 'Surviving Hieropolis marble fragments (inv. 31643) discovered by William M. Ramsay in 1883 and Museo Pio Cristiano cippus reconstruction.',
      },
      {
        title:
          'Kaufmann, Carl Maria — *Handbuch der altchristlichen Epigraphik* (1917) & Marucchi, Orazio — *Christian Epigraphy* (1912) (Alexamenos, Solin *Graf. Pal.* I 246; Licinia Amias, *ICUR* n.s. II 4246 / EDR111386)',
        href: 'https://archive.org/details/handbuchderaltch00kauf',
        note: 'Diplomatic transcriptions, plates, and epigraphic commentary on the Palatine Alexamenos caricature (pp. 302–303) and the Vatican stele of Licinia Amias (Marucchi no. 52).',
      },
      {
        title:
          'Kotansky, Roy D. — “The Magic ‘Crucifixion’ Gem in the British Museum,” *Greek, Roman, and Byzantine Studies* 57 (2017), pp. 631–659',
        href: 'https://grbs.library.duke.edu/index.php/grbs/article/view/15935',
        note: 'Open-access re-edition of British Museum 1986,0501.1 (late second to early third century AD), analyzing the obverse vocatives “O Son, Father, O Jesus Christ.”',
      },
    ]),
  },
  {
    category: 'Papyrological Repositories & Critical Editions',
    items: Object.freeze([
      {
        title:
          'Center for the Study of New Testament Manuscripts (CSNTM) — Early Greek Papyri (𝔓10, 𝔓46, 𝔓66, 𝔓75, 𝔓77, 𝔓98, 𝔓104)',
        href: 'https://manuscripts.csntm.org/manuscript/Group/GA_P66',
        note: 'Open-access digital plates and codicological metadata for second- through fourth-century New Testament papyri.',
      },
      {
        title:
          'Bodmer Lab (University of Geneva & Fondation Martin Bodmer) — *P.Bodmer* II (𝔓66, PB 2), Composite Codex XIII (Melito, PB C), and XX (Phileas, PB P)',
        href: 'https://bodmerlab.unige.ch/fr/constellations/papyri/barcode/1072205287',
        note: 'Digitized Mirador plates and codicological metadata for *P.Bodmer* II (barcode 1072205287), *P.Bodmer* XIII (barcode 1072205366), and *P.Bodmer* XX (barcode 1072205358).',
      },
      {
        title:
          'Sanders, Henry A. — *A Third-Century Papyrus Codex of the Epistles of Paul* (University of Michigan Press, 1935; cf. Kenyon, *Chester Beatty Fasc. III*, 1934–1936; 𝔓46)',
        href: 'https://archive.org/details/thirdcenturypapy00unse',
        note: 'Open-access diplomatic edition and paleographical study of the c. AD 200–225 Pauline codex (CBL BP II / P.Mich. inv. 6238).',
      },
      {
        title:
          'Grenfell, Bernard P. & Arthur S. Hunt — *The Oxyrhynchus Papyri*, Part III (1903), no. 405, pp. 10–11 (Cambridge MS Add. 4413 = TM 61317)',
        href: 'https://archive.org/details/oxyrhynchuspapyr03gren/page/10/mode/2up',
        note: '*Editio princeps* of the c. AD 200 Oxyrhynchus copy of Irenaeus, *Adversus Haereses* 3.9.2–3.',
      },
      {
        title:
          'Hunt, Arthur S. — *The Oxyrhynchus Papyri*, Part XV (1922), no. 1786, pp. 21–25 (TM 64184)',
        href: 'https://archive.org/details/oxyrhynchuspapyr15gren/page/21/mode/2up',
        note: '*Editio princeps* of the c. AD 275–300 notated Christian triadic hymn at Oxyrhynchus.',
      },
      {
        title:
          'Grenfell, Bernard P. & Arthur S. Hunt — *The Oxyrhynchus Papyri*, Part II (1899), no. 209, pp. 8–9 (𝔓10; cf. Luijendijk, *JBL* 129 [2010], pp. 575–596)',
        href: 'https://archive.org/details/oxyrhynchuspapyr02gren/page/8/mode/2up',
        note: '*Editio princeps* of Harvard Houghton MS Gr SM 2218 (Romans 1:1–7), linked by AnneMarie Luijendijk (2010) to Aurelius Leonides’s c. AD 316 archive.',
      },
    ]),
  },
  {
    category: 'Primary Literary Sources & Peer-Reviewed Historiography',
    items: Object.freeze([
      {
        title:
          'Pliny the Younger — *Epistles* 10.96 to Emperor Trajan (Perseus Digital Library; cf. ed. Mynors, OCT, 1963)',
        href: 'https://www.perseus.tufts.edu/hopper/text?doc=Plin.+Ep.+10.96',
        note: 'c. AD 111–113 administrative report from Bithynia-Pontus (*carmenque Christo quasi deo dicere*).',
      },
      {
        title:
          'Orsini, Pasquale & Willy Clarysse — “Early New Testament Manuscripts and Their Dates: A Critique of Theological Palaeography,” *ETL* 88 (2012), pp. 443–474',
        href: 'https://doi.org/10.2143/ETL.88.4.2957937',
        note: 'Comparative Greek literary paleography critiquing pre-125 proposals and tabulating second- and third-century hand windows.',
      },
      {
        title:
          'Nongbri, Brent — *God’s Library: The Archaeology of the Earliest Christian Manuscripts* (Yale University Press, 2018; cf. *Museum Helveticum* 71 [2014] 1–35)',
        href: 'https://bmcr.brynmawr.edu/2020/2020.05.02/',
        note: 'Reassesses provenance and broader late second- to early fourth-century paleographical ranges for the Bodmer and Chester Beatty codices.',
      },
      {
        title:
          'Hurtado, Larry W. — “The Binitarian Shape of Early Christian Worship” (Brill, 1999) & *Lord Jesus Christ* (Eerdmans, 2003)',
        href: 'https://www.eerdmans.com/9780802831675/',
        note: 'Historical analysis of corporate cultic devotion to Jesus in earliest Judean Christianity and the scribal *nomina sacra*.',
      },
      {
        title:
          'Bauckham, Richard — “The Throne of God and the Worship of Jesus” (Brill, 1999) & *Jesus and the God of Israel* (Eerdmans, 2008)',
        href: 'https://www.eerdmans.com/9780802845597/jesus-and-the-god-of-israel/',
        note: 'Second Temple Jewish categories of divine identity applied to 1 Corinthians 8:6 and Philippians 2:6–11.',
      },
    ]),
  },
]);
