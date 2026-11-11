/**
 * Stages 3 & 4 scholarly data overrides and tables for /discover/trustworthiness-of-the-bible:
 *   - Stage 3: Socially Costly Testimony (5), Undesigned Coincidences (4 primary + 4 contested
 *     Synoptic/harmonizing items), Palestinian Onomastics (Tal Ilan 2002 / Richard Bauckham 2006
 *     gender-matched N = 2,625 male & N = 328 female tables + 2023–2024 JSHJ statistical debate + 4 items)
 *   - Stage 4: Early Canon Recognition (3, with critical pseudepigraphal dating & full Muratorian
 *     inclusions/omissions), Pre-Nicene Patristic Citations (Geisler & Nix 1986 transposed 7-writer
 *     table + Metzger 2005 qualification + 6 items), Historical Synthesis (2 descriptive items)
 */

export const EMBARRASSMENT_ITEMS = [
  {
    id: 'embarrass-women-first-witnesses',
    badge: 'Socially Costly Testimony · All 4 Gospels',
    title: 'Women Recorded as Primary Witnesses to the Empty Tomb and Risen Jesus',
    meta: 'Mark 16:1–8; Matthew 28:1–10; Luke 24:1–11; John 20:1–18 · Cf. Josephus, *Antiquities* 4.219; Origen, *Contra Celsum* 2.55',
    noteMd: 'In first-century Judean and Greco-Roman legal culture, the testimony of women carried severely restricted standing. **Flavius Josephus** (*Antiquities* 4.219, tr. Whiston) summarizes contemporary Jewish law with the rule, “But let not the testimony of women be admitted, on account of the levity and boldness of their sex” (cf. Mishnah *Rosh Hashanah* 1:8), and the second-century Platonist **Celsus** (*Contra Celsum* 2.55, tr. Chadwick, 1953; “a half-frantic woman” in *ANF* 4:453) mocked the resurrection proclamation because it rested on “a hysterical female” (`γυνὴ πάροιστρος`, Mary Magdalene). Proponents of the criterion argue that authors inventing empty-tomb narratives in the late first century for persuasive purposes would more plausibly have credited the discovery to male leaders (Peter, John, or James; cf. **1 Corinthians 15:5–7**). Instead, all four canonical Gospels name **Mary Magdalene**—accompanied in the three Synoptics by other Galilean women—as the first witness, while the male disciples doubted (**Luke 24:11**).',
    quote: 'Now they were Mary Magdalene and Joanna and Mary the mother of James; also the other women with them were telling these things to the apostles. But these words appeared to them as nonsense, and they would not believe them.',
    quoteCite: 'Luke 24:10–11 (NASB 1995)',
    chips: [
      { label: 'Luke 24:10–11', href: '/bible/lk/24#10' },
      { label: 'John 20:11–18', href: '/bible/jn/20#11' },
      { label: 'Mark 16:1–8', href: '/bible/mk/16#1' },
    ],
  },
  {
    id: 'embarrass-peters-denials',
    badge: 'Failure of a Leading Apostle · Fourfold Passion Tradition',
    title: 'Simon Peter’s Threefold Denial of Jesus',
    meta: 'Mark 14:66–72; Matthew 26:69–75; Luke 22:54–62; John 18:15–18, 25–27',
    noteMd: 'During the decades in which the Synoptic Gospels were composed and circulated (c. AD 65–95 in mainstream critical scholarship; AD 50s–80s in traditional dating), **Simon Peter** was a leading figure of the Jerusalem church (**Galatians 1:18; 2:7–9**; **1 Corinthians 15:5**; **Acts 2:14**), and second-century tradition (**Papias** in Eusebius, *Hist. eccl.* 3.39.15) links Mark’s Gospel to Peter’s preaching. All four Gospels narrate Peter’s threefold denial, the first of them before a servant girl of the high priest, and **Mark 14:71** (`ἀναθεματίζειν καὶ ὀμνύναι`) and **Matthew 26:74** (`καταθεματίζειν καὶ ὀμνύειν`) record that he invoked curses and swore oaths.',
    quote: 'But he began to curse and swear, “I do not know this man you are talking about!” Immediately a rooster crowed a second time. And Peter remembered how Jesus had made the remark to him, “Before a rooster crows twice, you will deny Me three times.” And he began to weep.',
    quoteCite: 'Mark 14:71–72 (NASB 1995)',
    chips: [
      { label: 'Mark 14:66–72', href: '/bible/mk/14#66' },
      { label: 'Luke 22:54–62', href: '/bible/lk/22#54' },
    ],
  },
  {
    id: 'embarrass-jesus-family-insane',
    badge: 'Pre-Easter Family Unbelief · Mark 3:21 & John 7:5',
    title: 'Jesus’s Brothers Attempting to Seize Him as “Out of His Senses”',
    meta: 'Mark 3:20–21, 31–35; John 7:3–5 · Cf. James’s leadership in Acts 15:13; Galatians 1:19; Josephus, *Ant.* 20.200',
    noteMd: '**James, the brother of Jesus**, led the Jerusalem church from the AD 40s until his execution in AD 62 (**Galatians 1:19; 2:9**; **Acts 15:13; 21:18**; **Josephus**, *Ant.* 20.200). Despite the reverence accorded to Jesus’s family (*desposyni*) in early Jewish Christianity, **Mark 3:21** records that during his Galilean ministry his relatives set out to take custody of him, saying, “He has lost His senses” (`ἐξέστη`), and **John 7:5** states that “not even His brothers were believing in Him”—a pre-Easter tension absent from later hagiographical traditions about the family.',
    quote: 'When His own people heard of this, they went out to take custody of Him; for they were saying, “He has lost His senses.”',
    quoteCite: 'Mark 3:21 (NASB 1995; cf. John 7:5)',
    chips: [
      { label: 'Mark 3:21', href: '/bible/mk/3#21' },
      { label: 'John 7:5', href: '/bible/jn/7#5' },
    ],
  },
  {
    id: 'embarrass-cry-of-dereliction',
    badge: 'Aramaic Passion Tradition · Mark 15:34',
    title: 'The Aramaic Cry of Psalm 22:1 from the Cross (“Eloi, Eloi, Lama Sabachthani?”)',
    meta: 'Mark 15:34; Matthew 27:46 · Transliterating Aramaic/Hebrew Psalm 22:1',
    noteMd: 'Greco-Roman accounts of noble death, and later apocryphal passion narratives such as the second-century docetic *Gospel of Peter* (4:10, “But He held His peace, as having no pain,” tr. Robinson & James, 1892), prized composure during execution. By contrast, **Mark 15:34** (`Ἐλωῒ ἐλωῒ λεμὰ σαβαχθάνι`, transliterated Aramaic) and **Matthew 27:46** (`Ἠλὶ ἠλὶ λεμὰ σαβαχθάνι`, a mixed Hebrew–Aramaic form) preserve Jesus’s cry in the opening words of **Psalm 22**, a passage that generated sustained exegetical discussion in early Christological debates.',
    quote: 'At the ninth hour Jesus cried out with a loud voice, “ELOI, ELOI, LAMA SABACHTHANI?” which is translated, “MY GOD, MY GOD, WHY HAVE YOU FORSAKEN ME?”',
    quoteCite: 'Mark 15:34 (NASB 1995)',
    chips: [
      { label: 'Mark 15:34', href: '/bible/mk/15#34' },
      { label: 'Psalm 22:1 (LXX 21:1)', href: '/bible/ps/21#1' },
    ],
  },
  {
    id: 'embarrass-disciples-fleeing',
    badge: 'Apostolic Abandonment · Mark 14:50',
    title: 'Collective Flight of the Male Apostles at Gethsemane',
    meta: 'Mark 14:50–52; Matthew 26:56',
    noteMd: '**Mark 14:50** reports that at Jesus’s arrest in Gethsemane his male disciples—the eleven remaining apostles, later the founding authorities of the early communities—“all left Him and fled” (`καὶ ἀφέντες αὐτὸν ἔφυγον πάντες`); Galilean women watch the crucifixion from a distance (**Mark 15:40–41**), and Joseph of Arimathea, a member of the Council, requests the body (**Mark 15:43**).',
    quote: 'And they all left Him and fled.',
    quoteCite: 'Mark 14:50 (NASB 1995)',
    chips: [
      { label: 'Mark 14:50', href: '/bible/mk/14#50' },
      { label: 'Matthew 26:56', href: '/bible/mt/26#56' },
    ],
  },
];

export const UNDESIGNED_ITEMS = [
  {
    id: 'undesigned-green-grass-passover',
    badge: 'Botanical & Liturgical Interlock · Mark 6:39 ↔ John 6:4',
    title: '“Green Grass” on the Galilean Hillsides & the Approaching Passover',
    meta: 'Mark 6:39 (detail without season) ↔ John 6:4 (season without botanical detail) · Analyzed by Lydia McGrew (2017; cf. J. J. Blunt, 1847, on Mark 6:31 & John 6:4)',
    noteMd: 'In **Mark 6:39**, Jesus instructs the crowd of five thousand to recline in groups “on the green grass” (`ἐπὶ τῷ χλωρῷ χόρτῳ`), although Mark mentions no festival or season; for most of the year, unirrigated Galilean hillsides are dry and brown. In **John 6:4**, the Fourth Gospel does not mention grass but notes in passing that “the Passover, the feast of the Jews, was near” (March–April, after the winter rains, when the Galilean slopes are green).',
    quote: 'And He commanded them all to sit down by groups on the green grass. (Mark 6:39) · Now the Passover, the feast of the Jews, was near. (John 6:4)',
    quoteCite: 'Mark 6:39 & John 6:4 (NASB 1995)',
    chips: [
      { label: 'Mark 6:39', href: '/bible/mk/6#39' },
      { label: 'John 6:4', href: '/bible/jn/6#4' },
    ],
  },
  {
    id: 'undesigned-philip-bethsaida-bread',
    badge: 'Three-Way Geographical Interlock · John 6:5 ↔ John 1:44 ↔ Luke 9:10',
    title: 'Jesus’s Question to Philip About Buying Bread near Bethsaida',
    meta: 'John 6:5 + John 1:44 + Luke 9:10 · Three notices across two Gospels',
    noteMd: 'In **John 6:5**, Jesus turns to a less prominent disciple, **Philip**, and asks, “Where are we to buy bread, so that these may eat?” John does not name the town near which the feeding occurred. Five chapters earlier, in an unrelated call narrative (**John 1:44**), John mentions in passing that Philip was from **Bethsaida**, without connecting Bethsaida to the feeding. **Luke 9:10**, which does not mention Philip in its feeding account, supplies the setting: “He withdrew by Himself to a city called Bethsaida.” Taken together, the three notices suggest why the practical question was put to Philip, a native of the district.',
    quote: 'Therefore Jesus, lifting up His eyes and seeing that a large crowd was coming to Him, said to Philip, “Where are we to buy bread, so that these may eat?”',
    quoteCite: 'John 6:5 (NASB 1995; interlocked with John 1:44 and Luke 9:10)',
    chips: [
      { label: 'John 6:5', href: '/bible/jn/6#5' },
      { label: 'John 1:44', href: '/bible/jn/1#44' },
      { label: 'Luke 9:10', href: '/bible/lk/9#10' },
    ],
  },
  {
    id: 'undesigned-herods-servants-joanna',
    badge: 'Royal Household Prosopography · Matthew 14:1–2 ↔ Luke 8:3',
    title: 'Herod Antipas Speaking “to His Servants” & Joanna, Wife of Herod’s Steward Chuza',
    meta: 'Matthew 14:1–2 (courtly detail without source) ↔ Luke 8:3 (named courtly source in an unrelated list)',
    noteMd: 'Unlike Mark 6:14, **Matthew 14:1–2** specifies that the tetrarch **Herod Antipas** said **“to his servants”** (`τοῖς παισὶν αὐτοῦ`, his household attendants) that Jesus must be John the Baptist risen from the dead. This raises the question of how Jesus’s followers could have learned of remarks made within Antipas’s household. In an unrelated list of Galilean women who supported Jesus’s itinerant company (**Luke 8:3**), Luke names **“Joanna the wife of Chuza, Herod’s steward [`ἐπιτρόπου Ἡρῴδου`],”** without mentioning Herod’s remark to his servants.',
    quote: 'At that time Herod the tetrarch heard the news about Jesus, and said to his servants, “This is John the Baptist…” (Matthew 14:1–2) · and Joanna the wife of Chuza, Herod’s steward, and Susanna, and many others… (Luke 8:3)',
    quoteCite: 'Matthew 14:1–2 & Luke 8:3 (NASB 1995)',
    chips: [
      { label: 'Matthew 14:1–2', href: '/bible/mt/14#1' },
      { label: 'Luke 8:3', href: '/bible/lk/8#3' },
    ],
  },
  {
    id: 'undesigned-destroy-this-temple-trial',
    badge: 'Sanhedrin Trial Accusation · Mark 14:58 ↔ John 2:19–21',
    title: 'The Sanhedrin Charge (“I Will Destroy This Temple”) & the Earlier Saying in John 2:19',
    meta: 'Mark 14:57–59 & Matthew 26:61 (charge without prior saying) ↔ John 2:19 (prior saying without trial charge)',
    noteMd: 'At Jesus’s night hearing in **Mark 14:58** (and **Matthew 26:61**; echoed by passers-by in **Mark 15:29**), witnesses testify that they heard Jesus say, “I will destroy this temple made with hands, and in three days I will build another made without hands”—a saying narrated nowhere earlier in Matthew, Mark, or Luke, and which Mark presents as false and inconsistent testimony (**Mark 14:57, 59**). Conversely, **John 2:19** records an earlier dispute in the Jerusalem Temple in which Jesus spoke the enigmatic words **“Destroy this temple [`Λύσατε τὸν ναὸν τοῦτον`], and in three days I will raise it up”** (a second-person imperative, “Destroy,” recast at the trial as the first-person “I will destroy”), while John’s own passion account omits the temple charge before the Sanhedrin.',
    quote: '“We heard Him say, ‘I will destroy this temple made with hands, and in three days I will build another made without hands.’” (Mark 14:58) · Jesus answered them, “Destroy this temple, and in three days I will raise it up.” (John 2:19)',
    quoteCite: 'Mark 14:58 & John 2:19 (NASB 1995)',
    chips: [
      { label: 'Mark 14:58', href: '/bible/mk/14#58' },
      { label: 'John 2:19', href: '/bible/jn/2#19' },
    ],
  },
  {
    id: 'undesigned-blindfolded-prophesy',
    contested: true,
    badge: 'Contested Synoptic Parallel · Matthew 26:68 ↔ Luke 22:64 ↔ Mark 14:65',
    title: 'The “Prophesy!” Taunt, the Blindfold, & the Synoptic “Minor Agreement” Debate',
    meta: 'Matthew 26:67–68 ↔ Luke 22:64 & Mark 14:65 · Blunt (1847) vs. Streeter (1924) / Goodacre (2002)',
    noteMd: 'In **Matthew 26:67–68**, guards spit in Jesus’s face, slap him, and ask, **“Prophesy to us, You Christ; who is the one who hit You?”** (`τίς ἐστιν ὁ παίσας σε;`), but Matthew omits the blindfold recorded in **Mark 14:65** (`περικαλύπτειν αὐτοῦ τὸ πρόσωπον`) and **Luke 22:64** (`περικαλύψαντες αὐτόν`), which makes the demand to identify the striker intelligible. Proponents of undesigned coincidences (e.g., J. J. Blunt, 1847) regard Matthew’s omission of the blindfold as complementary reporting. Mainstream Synoptic scholars (Oxford scholar **B. H. Streeter**, 1924; **Frans Neirynck**; Duke New Testament scholar **Mark Goodacre**, *The Case Against Q*, 2002), however, note that Matthew 26:68 and Luke 22:64 share the exact five-word Greek question `τίς ἐστιν ὁ παίσας σε;`, absent from Mark 14:65. They classify it as a classic **Minor Agreement** (an agreement of Matthew and Luke against Mark), explained by Luke’s knowledge of Matthew, by early oral or scribal assimilation, or by a fuller Markan *Vorlage*.',
    quote: 'Then they spat in His face and beat Him with their fists; and others slapped Him, and said, “Prophesy to us, You Christ; who is the one who hit You?”',
    quoteCite: 'Matthew 26:67–68 (NASB 1995; cf. Mark 14:65 and Luke 22:64)',
    chips: [
      { label: 'Matthew 26:67–68', href: '/bible/mt/26#67' },
      { label: 'Luke 22:64', href: '/bible/lk/22#64' },
    ],
  },
  {
    id: 'undesigned-evening-sabbath-healings',
    contested: true,
    badge: 'Contested Synoptic Parallel · Matthew 8:16 ↔ Mark 1:21, 32',
    title: 'Waiting Until “Evening Had Come” in Capernaum & Markan Compression',
    meta: 'Matthew 8:16 (time of day without reason) ↔ Mark 1:21, 29, 32 & Luke 4:31, 40 (Sabbath context)',
    noteMd: 'In **Matthew 8:16**, after Jesus heals Peter’s mother-in-law in Capernaum, the townspeople wait until **“evening came”** (`Ὀψίας δὲ γενομένης`) before bringing the sick to him, although Matthew’s topical arrangement of miracles gives no reason for the delay until dusk. **Mark 1:21, 29, 32** and **Luke 4:31, 40** preserve the Sabbath setting: Jesus taught in the Capernaum synagogue **on the Sabbath**, which would explain why observant families waited until **sundown** (`ὅτε ἔδυ ὁ ἥλιος`), when the Sabbath restriction on carrying burdens ended, before bringing the sick through the streets. Under Markan priority, critical commentators explain Matthew 8:16 not as an independent witness but as redactional compression of Mark 1:32 when Matthew detached the healing from Mark’s synagogue sequence.',
    quote: 'When evening came, they brought to Him many who were demon-possessed; and He cast out the spirits with a word, and healed all who were ill.',
    quoteCite: 'Matthew 8:16 (NASB 1995; cf. the Sabbath setting of Mark 1:21, 32)',
    chips: [
      { label: 'Matthew 8:16', href: '/bible/mt/8#16' },
      { label: 'Mark 1:21, 32', href: '/bible/mk/1#21' },
    ],
  },
  {
    id: 'undesigned-mending-nets-miraculous-catch',
    contested: true,
    badge: 'Harmonizing Reconstruction · Matthew 4:21 ↔ Luke 5:6',
    title: 'James and John “Mending Their Nets” & the Strained Catch in Luke 5',
    meta: 'Matthew 4:21 / Mark 1:19 (activity without cause) ↔ Luke 5:4–6 (strained nets)',
    noteMd: '**Matthew 4:18–21** and **Mark 1:16–19** concisely report Simon and Andrew casting a net, while a short distance further along the shore James and John sit in the boat with Zebedee **“mending their nets”** (`καταρτίζοντας τὰ δίκτυα αὐτῶν`). **Luke 5:4–10** narrates a fuller lakeside episode in which the catch of fish was so large that **“their nets began to break”** (`διερρήσσετο δὲ τὰ δίκτυα αὐτῶν`, Luke 5:6), and their partners James and John were called to help. Harmonizing reconstructions (Blunt 1847) connect this episode with the damaged nets of Matthew and Mark, but most critical commentators note that mending nets was routine work for Galilean fishermen and treat Luke 5:1–11 as a distinct call tradition.',
    quote: 'Going on from there He saw two other brothers, James the son of Zebedee, and John his brother, in the boat with Zebedee their father, mending their nets; and He called them.',
    quoteCite: 'Matthew 4:21 (NASB 1995; cf. straining nets in Luke 5:6)',
    chips: [
      { label: 'Matthew 4:21', href: '/bible/mt/4#21' },
      { label: 'Luke 5:6', href: '/bible/lk/5#6' },
    ],
  },
  {
    id: 'undesigned-james-john-first-cousins',
    contested: true,
    badge: 'Harmonizing Prosopography · Matthew 27:56 ↔ Mark 15:40 ↔ John 19:25',
    title: 'Comparing the Crucifixion Women Lists Across Mark, Matthew & John',
    meta: 'Matthew 27:56 + Mark 15:40 + John 19:25 · Distinct naming conventions across three or four Galilean women',
    noteMd: 'The lists of Galilean women near the cross follow different naming conventions: **Mark 15:40** names Mary Magdalene, Mary the mother of James the Less and Joses, and **Salome**; **Matthew 27:56** names Mary Magdalene, Mary the mother of James and Joseph, and **“the mother of the sons of Zebedee”**; and **John 19:25** names Jesus’s mother, **“His mother’s sister,”** Mary of Clopas, and Mary Magdalene. **J. J. Blunt** (1847, Part IV, Sec. II) compared **Matthew 27:56** and **Mark 15:40**, inferring from **Matthew 20:20** that Zebedee had died and equating Salome with the mother of Zebedee’s sons; traditional harmonizations further combine all three lists by equating Salome with Mary’s sister in **John 19:25**. **Richard Bauckham** (*Gospel Women*, 2002), by contrast, argues that John 19:25 may be read either appositionally or as naming four women, and he does not equate “His mother’s sister” with Salome.',
    quote: 'Among them was Mary Magdalene, and Mary the mother of James and Joseph, and the mother of the sons of Zebedee. (Matthew 27:56) · There were also some women looking on from a distance, among whom were Mary Magdalene, and Mary the mother of James the Less and Joses, and Salome. (Mark 15:40)',
    quoteCite: 'Matthew 27:56 & Mark 15:40 (NASB 1995; cf. John 19:25)',
    chips: [
      { label: 'Matthew 27:56', href: '/bible/mt/27#56' },
      { label: 'Mark 15:40', href: '/bible/mk/15#40' },
      { label: 'John 19:25', href: '/bible/jn/19#25' },
    ],
  },
];

/**
 * Gender-matched Palestinian Jewish name-frequency tables calculated from Tal Ilan, Lexicon of Jewish
 * Names in Late Antiquity, Part I: Palestine 330 BCE–200 CE (Mohr Siebeck, 2002, pp. 56–57) and
 * Richard Bauckham, Jesus and the Eyewitnesses (Eerdmans, 2006 / 2nd ed. 2017, ch. 4, pp. 71, 85,
 * 89–92, Tables 6–9).
 *
 * Male percentages are presented on the gender-matched N = 2,625 Palestinian male-corpus base so that
 * male shares are compared directly against male shares (N = 77 in Gospels & Acts), while Bauckham's
 * p. 71 combined-base figures (15.6% and 41.5% on N = 2,953 male+female occurrences) are documented
 * in the notes. Every row percentage sums cleanly to the aggregate.
 */
export const ONOMASTICS_TABLES = {
  aggregates: [
    {
      metric: 'Two most popular male names (Simon + Joseph)',
      palestine: '17.6% (461 / 2,625)',
      gospelsActs: '18.2% (14 / 77)',
      note: 'gender-matched male base, Gregor & Blais 2023; Bauckham 2006, p. 71, prints 15.6% on the combined male-and-female base of 2,953',
    },
    {
      metric: 'Nine most popular male names',
      palestine: '46.7% (1,227 / 2,625)',
      gospelsActs: '40.3% (31 / 77)',
      note: 'gender-matched male base; New Testament share 6.4 points lower; Bauckham 2006, p. 71, prints 41.5% on the combined base of 2,953',
    },
    {
      metric: 'Two most popular female names (Mary + Salome)',
      palestine: '28.6%',
      gospelsActs: '38.9% (7 / 18)',
      note: 'Bauckham 2006, p. 71, Tables 7 & 9; female base N = 328; New Testament share c. 10 points higher',
    },
    {
      metric: 'Nine most popular female names',
      palestine: '49.7%',
      gospelsActs: '61.1% (11 / 18)',
      note: 'Bauckham 2006, p. 71; female base N = 328; share c. 11 points higher in the N = 18 sample',
    },
  ],
  male: {
    id: 'simon-group',
    caption: 'Top 9 Male Jewish Names in Palestine (330 BC–AD 200; Ilan 2002 / Bauckham 2006, Tables 6 & 8, Gender-Matched N = 2,625 Male Base) vs. Gospels & Acts',
    countHeader: 'Palestine Occurrences',
    palPctHeader: 'Palestine Male % (N = 2,625)',
    ntPctHeader: 'Gospels & Acts % (N = 77)',
    rows: [
      { rank: 1, name: 'Simon / Simeon', count: 243, palPct: '9.3%', ntPct: '10.4% (8)', qualifiers: 'Simon Peter, Simon the Zealot, Simon brother of Jesus, Simon the Leper, Simon the Pharisee, Simon father of Judas, Simeon (Luke 2:25), Simon the Tanner' },
      { rank: 2, name: 'Joseph / Joses', count: 218, palPct: '8.3%', ntPct: '7.8% (6)', qualifiers: 'Joseph husband of Mary, Joses brother of Jesus, Joses son of Mary (Mark 15:40), Joseph of Arimathea, Joseph Barsabbas, Joseph Caiaphas' },
      { rank: 3, name: 'Eleazar / Lazarus', count: 166, palPct: '6.3%', ntPct: '1.3% (1)', qualifiers: 'Lazarus of Bethany (parable figure in Luke 16:20 excluded from historical tally)' },
      { rank: 4, name: 'Judah / Judas (Jude)', count: 164, palPct: '6.2%', ntPct: '6.5% (5)', qualifiers: 'Judas Iscariot, Judas son of James (John 14:22), Judas brother of Jesus, Judas the Galilean (Acts 5:37), Judas Barsabbas (Acts 15:22)' },
      { rank: 5, name: 'John / Yohanan', count: 122, palPct: '4.6%', ntPct: '6.5% (5)', qualifiers: 'John the Baptist, John son of Zebedee, John called Mark, John of the high-priestly family (Acts 4:6), John father of Peter' },
      { rank: 6, name: 'Jesus / Joshua', count: 99, palPct: '3.8%', ntPct: '2.6% (2)', qualifiers: 'Jesus of Nazareth, Jesus Barabbas (variant reading in Matthew 27:16–17)' },
      { rank: 7, name: 'Hananiah / Ananias', count: 82, palPct: '3.1%', ntPct: '2.6% (2)', qualifiers: 'Ananias husband of Sapphira (Acts 5:1), Ananias the High Priest (Acts 23:2)' },
      { rank: 8, name: 'Jonathan', count: 71, palPct: '2.7%', ntPct: '0.0% (0)', qualifiers: '— (cf. Western variant Jonathan for John in Acts 4:6, Codex Bezae)' },
      { rank: 9, name: 'Matthew / Mattathias', count: 62, palPct: '2.4%', ntPct: '2.6% (2)', qualifiers: 'Matthew the tax collector, Matthias (Acts 1:23)' },
    ],
    footnote: 'Denominator note: Percentages in the Palestine column divide male counts directly by the 2,625 Palestinian male name occurrences in Bauckham’s filtered Ilan corpus (Top 2 = 461 / 2,625 = 17.6%; Top 9 = 1,227 / 2,625 = 46.7%, matching the rounded row sum 9.3 + 8.3 + 6.3 + 6.2 + 4.6 + 3.8 + 3.1 + 2.7 + 2.4 = 46.7%). In Bauckham (2006, p. 71), dividing those male counts by the combined database of 2,953 (2,625 male + 328 female) produced the lower published figures of 15.6% and 41.5% (noted by Kamil Gregor & Brian S. Blais, *JSHJ*, 2023). Gospels & Acts percentages use Bauckham’s p. 71 denominator of N = 77 Palestinian Jewish male name occurrences (cf. Table 8, pp. 85–88, whose listed entries sum to 79 across 45 names; Diaspora figures such as Simon of Cyrene, Barnabas of Cyprus, and Ananias of Damascus are excluded).',
  },
  female: {
    id: 'mary-group',
    caption: 'Top 9 Female Jewish Names in Palestine (330 BC–AD 200; Bauckham 2006, pp. 71, 89, 92, Tables 7 & 9) vs. Gospels & Acts (N = 18)',
    showCount: false,
    palPctHeader: 'Palestine Female % (N = 328)',
    ntPctHeader: 'Gospels & Acts % (N = 18)',
    rows: [
      {
        rankLabel: 'Ranks 1–2 · Mary / Mariam & Salome',
        palPct: '28.6%',
        ntPct: '38.9% (7)',
        qualifiers: 'Mary / Mariam: 6 of 18 (33.3% — mother of Jesus, Mary Magdalene, Mary of Bethany, Mary mother of James & Joses, Mary of Clopas, Mary mother of John Mark) · Salome: 1 of 18 (5.6% — Mark 15:40; 16:1)',
      },
      {
        rankLabel: 'Ranks 3–9 · Shelamzion, Martha, Joanna, Sapphira, Berenice, Imma, Mara',
        palPct: '21.1%',
        ntPct: '22.2% (4)',
        qualifiers: 'Martha of Bethany: 1 (5.6%) · Joanna wife of Chuza: 1 (5.6%) · Sapphira wife of Ananias: 1 (5.6%) · Berenice (Acts 25:13): 1 (5.6%) · Shelamzion: 0 · Imma: 0 · Mara: 0',
      },
      {
        rankLabel: 'Total Top 9 Palestinian Female Names',
        palPct: '49.7%',
        ntPct: '61.1% (11)',
        qualifiers: 'Combined Top 9 female name share in Bauckham (2006, p. 71; N = 328 filtered Palestinian female occurrences vs. 18 Palestinian Jewish women in Gospels & Acts)',
        highlight: true,
      },
    ],
    footnote: 'Denominator note: Bauckham (2006, p. 71) reports 28.6% (Ranks 1–2) and 49.7% (Ranks 1–9, leaving 21.1% for Ranks 3–9) for Palestinian Jewish women, against 38.9% (7 / 18) and 61.1% (11 / 18) in the Gospels and Acts—a concentration about 10–11 percentage points higher in the small New Testament female sample (N = 18). Unfiltered tallies in Ilan (2002, p. 57, including New Testament and fictional rabbinic entries: 70 Mariam, 58 Salome) should not be divided directly by Bauckham’s filtered base of N = 328.',
  },
};

export const ONOMASTICS_ITEMS = [
  {
    id: 'onomastics-male-names-simon-joseph',
    badge: 'Palestinian Male Corpus · N = 2,625 Male vs. N = 77 NT Occurrences',
    title: 'Concentration of Palestinian Male Names (Top 2 = 17.6% vs. 18.2%; Top 9 = 46.7% vs. 40.3%)',
    meta: 'Tal Ilan, *Lexicon of Jewish Names in Late Antiquity, Part I* (2002, p. 56); Richard Bauckham, *Jesus and the Eyewitnesses* (2006, pp. 67–85, Tables 6 & 8)',
    noteMd: 'Ilan’s catalog of named Jewish men from Judean and Galilean ossuaries, Dead Sea legal papyri (Murabbaʿat, Naḥal Ḥever), Masada ostraca, Josephus, and Tannaitic sources shows a marked concentration on a few Hasmonaean-era names (from the Jewish Maccabean dynasty, 140–37 BC): **Simon** (`243`) and **Joseph** (`218`) alone account for **17.6%** of the `2,625` male occurrences, against **18.2%** (`14 / 77`) in the Gospels and Acts, and the **Top 9 names** account for **46.7%**, against **40.3%** (`31 / 77`). Bauckham’s lower published percentages on a combined base are explained in the table notes above. The more diagnostic comparison is with Egyptian Jewish papyri (*Corpus Papyrorum Judaicarum*), whose distinct repertoire of names (*Shabbetai*, *Dositheus*, *Pappus*, *Ptolemaios*) is largely absent from the Palestinian figures of the Gospels.',
    quote: 'Judas (not Iscariot) said to Him, “Lord, what then has happened that You are going to disclose Yourself to us and not to the world?”',
    quoteCite: 'John 14:22 (NASB 1995; explicit parenthetical disambiguation of a Top-4 Palestinian male name)',
    chips: [
      { label: 'John 14:22', href: '/bible/jn/14#22' },
      { label: 'Luke 6:14–16', href: '/bible/lk/6#14' },
    ],
  },
  {
    id: 'onomastics-female-names-mary-salome',
    badge: 'Palestinian Female Corpus · N = 328 Occurrences vs. N = 18 NT Women',
    title: 'Palestinian Female Name Concentration (28.6% vs. 38.9% in Mary & Salome)',
    meta: 'Tal Ilan (2002, p. 57) & Richard Bauckham (2006, pp. 71, 89, 92, Tables 7 & 9)',
    noteMd: 'Female naming in Second Temple Judea and Galilee clustered heavily around Hasmonaean dynastic names, led by **Mariam/Mary** and **Salome**. In Bauckham’s comparison (2006, p. 71), **Mary and Salome** account for **28.6%** of Palestinian female occurrences, against **38.9%** (`7 / 18`: six Marys and one Salome) in the Gospels and Acts, and the **Top 9 female names** for **49.7%**, against **61.1%** (`11 / 18`, adding Martha, Joanna, Sapphira, and Berenice). Both samples draw on the same Hasmonaean name pool; the higher New Testament figures come from a small sample (`N = 18`).',
    quote: 'But standing by the cross of Jesus were His mother, and His mother’s sister, Mary the wife of Clopas, and Mary Magdalene.',
    quoteCite: 'John 19:25b (NASB 1995)',
    chips: [
      { label: 'John 19:25', href: '/bible/jn/19#25' },
      { label: 'Luke 24:10', href: '/bible/lk/24#10' },
    ],
  },
  {
    id: 'onomastics-disambiguation-principle',
    aliasId: 'rare-group',
    badge: 'Disambiguation & Statistical Debate · *JSHJ* (2023–2024)',
    title: 'Disambiguation of Common Names & the 2023–2024 Statistical Debate',
    meta: 'Bauckham (2006, ch. 4); Kamil Gregor & Brian S. Blais, *JSHJ* 21 (2023); Luuk van de Weghe & Jason Wilson, *JSHJ* 22 (2024)',
    noteMd: 'In the Gospels and Acts, people bearing common Palestinian names usually carry a patronymic, hometown, or epithet (*Simon Peter*, *Simon the Zealot*, *Simon the Leper*, *Mary Magdalene*, *Mary of Clopas*, *Joseph of Arimathea*, *Judas Iscariot*), whereas people with rare personal names (**Zacchaeus**, **Cleopas**, **Nicodemus**, **Chuza**) appear without disambiguating hometowns or nicknames, and Diaspora Jews in Acts are identified by their places of origin (*Barnabas of Cyprus*, *Apollos of Alexandria*, *Aquila of Pontus*). Recent statistical studies debate the evidential weight of name frequencies. Quantitative researchers **Kamil Gregor & Brian S. Blais** (*Journal for the Study of the Historical Jesus*, 2023) argued that the Gospels–Acts sample is too small to distinguish historical records from invented sets of Palestinian-sounding names; statisticians **Luuk van de Weghe & Jason Wilson** (*JSHJ*, 2024) replied with χ² goodness-of-fit tests indicating that the Gospels–Acts names fit the Palestinian distribution at least as closely as those in Josephus, and more closely than ancient or modern fiction.',
    quote: 'One of the two who heard John speak and followed Him, was Andrew, Simon Peter’s brother. (John 1:40) · And there was a man called by the name of Zaccheus; he was a chief tax collector and he was rich. (Luke 19:2)',
    quoteCite: 'John 1:40 & Luke 19:2 (NASB 1995)',
    chips: [
      { label: 'Mark 10:46', href: '/bible/mk/10#46' },
      { label: 'Luke 19:2', href: '/bible/lk/19#2' },
    ],
  },
  {
    id: 'onomastics-gnostic-apocryphal-failure',
    badge: 'Comparative Control Group · 2nd–3rd c. AD',
    title: 'Onomastic Departure in Second- and Third-Century Apocryphal & Gnostic Texts',
    meta: '*Gospel of Thomas* (NHC II,2), *Gospel of Philip* (NHC II,3), *Acts of Paul*, *Acts of Thomas*, *Gospel of Mary*',
    noteMd: 'Second- and third-century apocryphal texts, generally dated after the Bar Kokhba revolt (AD 132–135) and composed outside Judea, provide a comparative literary control. When they introduce characters beyond the apostles familiar from the canonical Gospels, works such as the *Gospel of Thomas*, the *Acts of Paul*, and the *Acts of Thomas* either avoid local Palestinian settings in favor of revelatory dialogues or populate their scenes with Greek, Roman, Syriac, and Indo-Parthian elite names (*Thecla*, *Mygdonia*, *Charisius*, *Siphor*) uncharacteristic of pre-70 Galilean villages.',
    exampleMd: 'Comparative control summary (cf. Bauckham 2006, ch. 4; van de Weghe & Wilson, *JSHJ*, 2024): the canonical Gospels and Acts preserve `77` occurrences of Palestinian Jewish men’s names that follow the Palestinian distribution, whereas later non-canonical narratives introduce predominantly Greco-Roman or eastern provincial names.',
    chips: [
      { label: 'Luke 1:1–4', href: '/bible/lk/1#1' },
    ],
  },
];

export const CANON_ITEMS = [
  {
    id: 'canon-1tim-2pet-scripture',
    badge: 'Pre-Pauline Creeds (AD 30s–50s) & NT Cross-Citations (AD 60s vs. c. AD 90–150)',
    title: 'First-Century Creedal Core (1 Cor 15:3–7) & Early Cross-Citations as “Scripture”',
    meta: '1 Corinthians 15:3–7 (c. AD 53–55); 1 Timothy 5:18 (citing Deut 25:4 + Luke 10:7); 2 Peter 3:15–16',
    noteMd: 'Historical analysis distinguishes two chronological strata. **(1) Pre-Pauline Creedal Formulas (AD 30s–50s):** In **1 Corinthians 15:3–7** (written c. AD 53–55; extant in **P46**), Paul quotes a fixed tradition (`παρέδωκα … ὃ καὶ παρέλαβον`) that most scholars date to within a few years of the crucifixion (cf. **Galatians 1:18–19**); the Christological hymn of **Philippians 2:6–11** is often assigned to the same early stratum. **(2) Internal New Testament Cross-Citations:** **1 Timothy 5:18** pairs **Deuteronomy 25:4** with a saying of Jesus matching **Luke 10:7** (“The laborer is worthy of his wages,” `Ἄξιος ὁ ἐργάτης τοῦ μισθοῦ αὐτοῦ`) under the formula “For the Scripture [`ἡ γραφή`] says,” while **2 Peter 3:15–16** places a circulating collection of Paul’s letters beside “the rest of the Scriptures” (`τὰς λοιπὰς γραφάς`). Traditional scholarship dates both letters to the **AD 60s** under Pauline and Petrine authorship, whereas most critical scholars regard 1 Timothy and 2 Peter as pseudepigraphal works of **c. AD 90–150** (Catholic New Testament scholar **Raymond E. Brown**, *An Introduction to the New Testament*, 1997). On either dating, the passages show a Gospel saying and Pauline letters treated as Scripture before Irenaeus.',
    quote: 'For the Scripture says, “YOU SHALL NOT MUZZLE THE OX WHILE HE IS THRESHING,” and “The laborer is worthy of his wages.”',
    quoteCite: '1 Timothy 5:18 (NASB 1995; pairing Deuteronomy 25:4 and Luke 10:7 as ἡ γραφή)',
    chips: [
      { label: '1 Corinthians 15:3–7', href: '/bible/1cor/15#3' },
      { label: '1 Timothy 5:18', href: '/bible/1tm/5#18' },
      { label: '2 Peter 3:15–16', href: '/bible/2pt/3#15' },
    ],
  },
  {
    id: 'canon-muratorian-fragment',
    badge: 'Ante-Nicene Canon List · c. AD 170–200 (majority) · 4th c. (minority: Sundberg 1973; Rothschild 2022)',
    title: 'The Muratorian Fragment (Biblioteca Ambrosiana Cod. J 101 sup.)',
    meta: 'Ambrosian Library, Milan (7th/8th-c. Bobbio Latin translation of a Greek original; published by Italian archivist L. A. Muratori, 1740)',
    noteMd: 'An 85-line Latin list translated from a Greek catalog composed in Rome. Most patristic scholars (**Bruce M. Metzger**, *The Canon of the New Testament*, 1987, pp. 191–201; Reformed scholar **Charles E. Hill**, 1995; Leuven scholar **Joseph Verheyden**, 2003) date it to c. **AD 170–200** on the basis of lines 73–77, which describe the *Shepherd of Hermas* as written “very recently, in our times, in the city of Rome, while bishop Pius, his brother, was occupying the [episcopal] chair” (c. AD 140–154). **A. C. Sundberg** (*HTR* 66, 1973) and **Clare K. Rothschild** (2022) instead propose a fourth-century eastern date. Beginning on a damaged leaf with **Luke** as the third Gospel and **John** as the fourth, the fragment accepts **Acts**, **13 Pauline Epistles**, **Jude**, two epistles of **John**, and **Revelation**, and rejects works associated with Valentinus, Basilides, and Marcion. Its boundaries, however, are not fixed: the list **includes the *Wisdom of Solomon* and the *Apocalypse of Peter*** (adding that “some of us are not willing that the latter be read in church”) and **omits *Hebrews*, *James*, *1–2 Peter*, and *3 John***.',
    quote: 'The third book of the Gospel is that according to Luke… The fourth of the Gospels is that of John, [one] of the disciples… Moreover, the acts of all the apostles were written in one book… As for the Epistles of Paul, they themselves make clear to those desiring to understand, which ones [they are], from what place, or for what reason they were sent.',
    quoteCite: 'Muratorian Fragment, lines 2, 9, 34–35, 39–41 (c. AD 170–200; tr. Metzger 1987, pp. 305–307)',
    chips: [
      { label: 'Luke 1:1–4', href: '/bible/lk/1#1' },
      { label: 'New Advent: Muratorian Fragment (filed under Caius, ANF V)', href: 'https://www.newadvent.org/fathers/0510.htm' },
      { label: 'New Advent: Muratorian Canon Article', href: 'https://www.newadvent.org/cathen/10642a.htm' },
    ],
  },
  {
    id: 'canon-refuting-constantine-myth',
    badge: 'Conciliar Primary Sources · AD 325, 367, 393 & 397',
    title: 'Council of Nicaea (AD 325): The 20 Extant Canons vs. the Pre-Nicene Fourfold Gospel',
    meta: 'Twenty Canons of Nicaea (AD 325); Eusebius, *Life of Constantine* 3.6–21; Athanasius, *Festal Letter* 39 (AD 367); Councils of Hippo (AD 393) & Carthage (AD 397)',
    noteMd: 'The extant synodal letters and the **20 disciplinary canons of the First Council of Nicaea (AD 325)** contain **no canon or recorded decision on the books of the Bible**. The council met to rule on Arius’s teaching about the Son, to standardize the calculation of Easter, to address the Meletian schism in Egypt, and to regulate clerical discipline, and its debates appealed to New Testament writings already treated as Scripture. Some **145–155 years before Nicaea**, **Tatian’s *Diatessaron*** (c. AD 170) and **Irenaeus of Lyons** (c. AD 180, *Adv. Haer.* 3.11.8) attest the fourfold Gospel; some 100–150 years before Nicaea, **P46, P66, and P75** transmitted the Gospels and the Pauline corpus; and some 75–100 years before Nicaea, **Origen** (*Hom. in Jos.* 7.1; Eusebius, *Hist. eccl.* 6.25) surveyed the undisputed core alongside books then doubted in some churches (later classified by Eusebius, *Hist. eccl.* 3.25.1–3, as *homologoumena* and *antilegomena*). All of this precedes **Athanasius’s 39th Festal Letter (AD 367)** and the **Synods of Hippo (AD 393) and Carthage (AD 397)**, which list all 27 books.',
    quote: 'It is not possible that the Gospels can be either more or fewer in number than they are. For, since there are four zones of the world in which we live, and four principal winds… He who was manifested to men, has given us the Gospel under four aspects, but bound together by one Spirit.',
    quoteCite: 'Irenaeus of Lyons, *Against Heresies* 3.11.8 (c. AD 180; c. 145 years before the Council of Nicaea)',
    chips: [
      { label: 'New Advent: Nicaea Canons (AD 325)', href: 'https://www.newadvent.org/fathers/3801.htm' },
      { label: 'New Advent: Athanasius Letter 39 (AD 367)', href: 'https://www.newadvent.org/fathers/2806039.htm' },
    ],
  },
];

/**
 * Transposed 7-writer Geisler & Nix (A General Introduction to the Bible, rev. ed., Moody, 1986, p. 431)
 * ante-Nicene citation table: seven writers as rows + five NT divisions and Total as columns (matching
 * Geisler & Nix's own orientation so desktop renders 7 narrow columns with zero clipping). Every writer
 * row and division column sums cleanly to 36,289; legacy IDs #gospels, #acts, #pauline, #general,
 * #revelation, and #other are preserved on the always-visible division-totals takeaway strip.
 */
export const PATRISTIC_TABLE = {
  caption: 'Counted Ante-Nicene New Testament Citations Across Seven Writers (Geisler & Nix 1986, p. 431)',
  takeaway: 'Division totals across 36,289 counted pre-Nicene citations (AD 150–325) — led by Origen (17,922) and Tertullian (7,258):',
  otherAliasId: 'other',
  divisions: [
    { id: 'gospels', key: 'gospels', shortLabel: 'Gospels', label: 'Four Gospels', total: '19,368' },
    { id: 'acts', key: 'acts', shortLabel: 'Acts', label: 'Acts', total: '1,352' },
    { id: 'pauline', key: 'pauline', shortLabel: 'Pauline', label: 'Pauline Epistles', total: '14,035' },
    { id: 'general', key: 'general', shortLabel: 'General', label: 'General Epistles', total: '870' },
    { id: 'revelation', key: 'revelation', shortLabel: 'Rev.', label: 'Revelation', total: '664' },
  ],
  writers: [
    { key: 'jm', writer: 'Justin Martyr (c. AD 150–165)', gospels: '268', acts: '10', pauline: '43', general: '6', revelation: '3', total: '330' },
    { key: 'i', writer: 'Irenaeus of Lyons (c. AD 180)', gospels: '1,038', acts: '194', pauline: '499', general: '23', revelation: '65', total: '1,819' },
    { key: 'c', writer: 'Clement of Alexandria (c. AD 190–215)', gospels: '1,017', acts: '44', pauline: '1,127', general: '207', revelation: '11', total: '2,406' },
    { key: 'o', writer: 'Origen of Alexandria (c. AD 200–254)', gospels: '9,231', acts: '349', pauline: '7,778', general: '399', revelation: '165', total: '17,922' },
    { key: 't', writer: 'Tertullian of Carthage (c. AD 197–220)', gospels: '3,822', acts: '502', pauline: '2,609', general: '120', revelation: '205', total: '7,258' },
    { key: 'h', writer: 'Hippolytus of Rome (c. AD 200–235)', gospels: '734', acts: '42', pauline: '387', general: '27', revelation: '188', total: '1,378' },
    { key: 'e', writer: 'Eusebius (pre-AD 325 works)', gospels: '3,258', acts: '211', pauline: '1,592', general: '88', revelation: '27', total: '5,176' },
  ],
  grandTotal: '36,289',
  footnote: 'Source: Norman L. Geisler & William E. Nix, *A General Introduction to the Bible*, rev. ed. (Moody Press, 1986, p. 431). For Revelation, Justin Martyr’s 3 explicit citations are accompanied in Geisler & Nix’s note by 266 additional allusions (excluded from the 330, 664, and 36,289 counted citation totals); Eusebius items reflect works composed before AD 325.',
};

export const PATRISTIC_ITEMS = [
  {
    id: 'patristic-total-quotations',
    badge: 'Patristic Apparatus & Methodological Qualification',
    title: 'Ante-Nicene Citation Volume (36,289 Counted Citations) & Bruce M. Metzger’s Qualification',
    meta: 'Sir David Dalrymple, Lord Hailes (1786); Norman L. Geisler & William E. Nix (1986, p. 431); Bruce M. Metzger & Bart D. Ehrman, *The Text of the New Testament*, 4th ed. (2005, p. 126)',
    noteMd: 'In 1786, according to a frequently repeated account, the Scottish judge **Sir David Dalrymple (Lord Hailes)** examined ante-Nicene Christian writings after a dinner discussion of how much of the New Testament could be recovered from them if all manuscripts had been lost by the end of the third century. The tabulation by evangelical scholars **Geisler & Nix (1986, p. 431)** counts **`36,289` citations** in seven writers—Justin Martyr, Irenaeus, Clement of Alexandria, Origen, Tertullian, Hippolytus, and the pre-Nicene Eusebius (`19,368` from the Gospels, `1,352` from Acts, `14,035` from the Pauline Epistles, `870` from the General Epistles, and `664` from Revelation). **Methodological Qualification (Bruce M. Metzger, 2005, p. 126):** The Fathers often quoted Scripture from memory, adapted its syntax, or harmonized parallel Gospel passages, so their quotations cannot substitute for Greek manuscripts as a record of exact wording. Their chief value in critical apparatuses lies in **fixing the date and region** (Rome, Gaul, Alexandria, Carthage, Caesarea) in which particular books and readings circulated before AD 325.',
    quote: 'Indeed, so extensive are these citations that if all other sources for our knowledge of the text of the New Testament were destroyed, they would be sufficient alone for the reconstruction of practically the entire New Testament.',
    quoteCite: 'Bruce M. Metzger & Bart D. Ehrman, *The Text of the New Testament*, 4th ed. (Oxford University Press, 2005, p. 126; paired with Metzger’s caveat on memory citation above)',
    renderPatristicTable: true,
    chips: [
      { label: 'New Advent: Ante-Nicene Fathers Index', href: 'https://www.newadvent.org/fathers/' },
    ],
  },
  {
    id: 'patristic-justin-martyr',
    badge: 'Rome · c. AD 150–160',
    title: 'Justin Martyr — First Apology 66–67 & Dialogue with Trypho (“Memoirs of the Apostles”)',
    meta: 'Justin Martyr (c. AD 100–165): Samaritan-born Greek philosopher, executed at Rome under the prefect Junius Rusticus',
    noteMd: 'Addressing Emperor Antoninus Pius around **AD 155** (*First Apology* 66–67), **Justin Martyr** describes Sunday worship in urban and rural assemblies, at which “the memoirs of the apostles [`τὰ ἀπομνημονεύματα τῶν ἀποστόλων`] or the writings of the prophets are read, as long as time permits.” In *1 Apol.* 66.3 he explains that these memoirs “are called Gospels” (`ἃ καλεῖται εὐαγγέλια`), and in *Dialogue with Trypho* 103.8 he describes them as composed “by His apostles and those who followed them,” a phrase commonly taken to refer to Matthew and John (apostles) and Mark and Luke (followers).',
    quote: 'And on the day called Sunday, all who live in cities or in the country gather together to one place, and the memoirs of the apostles or the writings of the prophets are read, as long as time permits…',
    quoteCite: 'Justin Martyr, *First Apology* 67 (c. AD 155; cf. *1 Apol.* 66.3, *ANF* 1:185–186)',
    chips: [
      { label: 'New Advent: First Apology 66–67', href: 'https://www.newadvent.org/fathers/0126.htm' },
    ],
  },
  {
    id: 'patristic-irenaeus-lyons',
    badge: 'Gaul / Asia Minor · c. AD 180',
    title: 'Irenaeus of Lyons — Against Heresies (1,819 NT Citations Across 21 Books)',
    meta: 'Irenaeus (c. AD 130–202): Bishop of Lugdunum (Lyon, Gaul); youthful hearer of Polycarp of Smyrna, whom Irenaeus reports (*Adv. Haer.* 3.3.4; *Letter to Florinus* in Eusebius, *Hist. eccl.* 5.20) as having conversed with John and other witnesses of the Lord',
    noteMd: 'Spanning Asia Minor and Roman Gaul, **Irenaeus** cites **21 of the 27 New Testament books** explicitly (`1,819` citations in Geisler & Nix’s tally) in *Adversus Haereses* (c. AD 180). He names **Matthew, Mark, Luke, and John** as the fourfold Gospel (*Adv. Haer.* 3.1.1; 3.11.8), describes one faith held by the churches of Germany, Iberia, Gaul, the East, Egypt, Libya, and “the central regions of the world” (1.10.2), and quotes Acts, twelve Pauline Epistles, 1 Peter, 1–2 John, and Revelation—while omitting Philemon, 2 Peter, 3 John, and Jude and offering at most possible allusions to Hebrews and James (Metzger 1987).',
    quote: 'Matthew also issued a written Gospel among the Hebrews in their own dialect, while Peter and Paul were preaching at Rome, and laying the foundations of the Church. After their departure, Mark, the disciple and interpreter of Peter, did also hand down to us in writing what had been preached by Peter. Luke also, the companion of Paul, recorded in a book the Gospel preached by him. Afterwards, John, the disciple of the Lord, who also had leaned upon His breast, did himself publish a Gospel during his residence at Ephesus in Asia.',
    quoteCite: 'Irenaeus of Lyons, *Against Heresies* 3.1.1 (c. AD 180; preserved in Greek by Eusebius, *Hist. eccl.* 5.8.2–4)',
    chips: [
      { label: 'New Advent: Against Heresies III.1', href: 'https://www.newadvent.org/fathers/0103301.htm' },
    ],
  },
  {
    id: 'patristic-clement-alexandria',
    badge: 'Alexandria · c. AD 190–215',
    title: 'Clement of Alexandria — Stromata, Paedagogus & Protrepticus (2,406 Citations)',
    meta: 'Titus Flavius Clemens (c. AD 150–215): Head of the Catechetical School of Alexandria and teacher of Origen',
    noteMd: 'Writing in Alexandria in the period when **P46, P66, and P75** were being copied in Egypt, **Clement of Alexandria** cites New Testament writings `2,406` times (every book except Philemon, James, 2 Peter, and 2–3 John). In *Stromata* 3.13.93 he distinguishes a saying taken from the apocryphal *Gospel of the Egyptians* from “the four Gospels that have been handed down” (`ἐν τοῖς παραδεδομένοις ἡμῖν τέτταρσιν εὐαγγελίοις`).',
    quote: 'First, then, in the four Gospels that have been handed down to us, we do not have this saying, but in that according to the Egyptians.',
    quoteCite: 'Clement of Alexandria, *Stromata* 3.13.93 (c. AD 198–203; ed. Stählin, *GCS* 15, p. 238, translated from the Greek; *ANF* 2:399 prints this passage solely in Latin)',
    chips: [
      { label: 'New Advent: Stromata Book III', href: 'https://www.newadvent.org/fathers/02103.htm' },
    ],
  },
  {
    id: 'patristic-tertullian-carthage',
    badge: 'Roman North Africa · c. AD 197–220',
    title: 'Tertullian of Carthage — De Praescriptione 36 & Adversus Marcionem (7,258 Citations)',
    meta: 'Quintus Septimius Florens Tertullianus (c. AD 155–220): Early Latin Christian theologian writing in Carthage',
    noteMd: '**Tertullian**, whose `7,258` counted citations form the earliest extensive Latin witness to the New Testament, uses *testamentum* alongside *instrumentum* for the scriptural collections (*Adv. Marc.* 4.1) and the title *Novum Testamentum* (*Adv. Prax.* 15). In *Prescription Against Heretics* 36 (c. AD 200) he invites readers to consult the apostolic churches—**Corinth, Philippi, Thessalonica, Ephesus, and Rome**—where the apostles’ “authentic writings” (*authenticae litterae*) were still read publicly; scholars interpret the phrase either as preserved autographs or as authoritative Greek exemplars.',
    quote: 'Come now, you who would indulge a better curiosity, if you would apply it to the business of your salvation, run over the apostolic churches, in which the very thrones of the apostles are still pre-eminent in their places, in which their own authentic writings [authenticae litterae eorum] are read, uttering the voice and representing the face of each of them severally.',
    quoteCite: 'Tertullian, *Prescription Against Heretics* 36 (c. AD 200; *ANF* 3:260)',
    chips: [
      { label: 'New Advent: Prescription 36', href: 'https://www.newadvent.org/fathers/0311.htm' },
    ],
  },
  {
    id: 'patristic-origen-alexandria',
    badge: 'Alexandria & Caesarea · c. AD 200–254',
    title: 'Origen of Alexandria — Verse-by-Verse Commentaries & Textual Criticism (17,922 Citations)',
    meta: 'Origenes Adamantius (c. AD 185–254): Compiler of the six-column Old Testament *Hexapla* and early biblical textual critic',
    noteMd: 'Some seventy-five to one hundred years before Nicaea, **Origen** produced multi-volume commentaries and homilies citing `17,922` New Testament passages. He compared variant readings in Greek Gospel manuscripts (*Comm. on Matt.* 15.14; *Comm. on John* 6.40 [6.24], on “Bethany” vs. “Bethabara” in John 1:28), and in Rufinus’s Latin translation of the *Homilies on Joshua* (7.1) he enumerates all **27 New Testament books**. In the excerpts preserved by Eusebius (*Hist. eccl.* 6.25.3–14), he attests the four Gospels, Acts, Paul’s epistles, 1 Peter, 1 John, and Revelation while recording doubts concerning *2 Peter*, *2–3 John*, and the human author of *Hebrews*. Eusebius later systematizes this distinction (*Hist. eccl.* 3.25.1–3), placing the four Gospels, Acts, Paul’s epistles, 1 John, and 1 Peter (and conditionally Revelation) among the accepted *homologoumena* and *James*, *Jude*, *2 Peter*, and *2–3 John* among the disputed *antilegomena*.',
    quote: 'Among the four Gospels, which are the only indisputable ones in the Church of God under heaven, I have learned by tradition that the first was written by Matthew, who was once a publican, but afterwards an apostle of Jesus Christ, and it was prepared for the converts from Judaism, and published in the Hebrew language.',
    quoteCite: 'Origen of Alexandria, *Commentary on Matthew* Book 1 (c. AD 244; preserved in Eusebius, *Hist. eccl.* 6.25.4, tr. A. C. McGiffert, *NPNF*² 1:272–273)',
    chips: [
      { label: 'New Advent: Eusebius VI.25', href: 'https://www.newadvent.org/fathers/250106.htm' },
    ],
  },
];

export const SYNTHESIS_ITEMS = [
  {
    id: 'verdict-cs-lewis-trilemma',
    aliasIds: ['liar', 'lunatic', 'lord'],
    badge: 'Philosophical-Apologetic Argument · Liddon (1866/1867), Duncan (1870) & Lewis (1952)',
    title: 'Philosophical Arguments from Jesus’s Self-Claims (Liddon 1866/1867; Duncan 1870; Lewis 1952)',
    meta: 'Henry Parry Liddon, *Bampton Lectures* (preached 1866, published 1867); John “Rabbi” Duncan, *Colloquia Peripatetica* (published 1870, recording 1859–1864 conversations); C. S. Lewis, *Mere Christianity*, Book II, ch. 3 (1952); cf. Daniel Howard-Snyder & Stephen T. Davis (2004)',
    noteMd: 'Anglican canon **Henry Parry Liddon** (*Bampton Lectures*, preached 1866, published 1867), who summarized Lecture IV in Latin as *Christus, si non Deus, non bonus* (“Christ, if not God, is not good”; later popularized as *aut Deus aut malus homo*, “either God or a bad man”), Scottish Hebraist **John Duncan** (*Colloquia Peripatetica*, 1870), and Anglican literary scholar **C. S. Lewis** (*Mere Christianity*, 1952) formulated versions of a conditional three-part argument (the “trilemma”). *If* Jesus claimed divine prerogatives—forgiving sins (**Mark 2:5–10**), accepting divine honor (**John 5:23; 20:28**), and claiming enthronement at God’s right hand (**Mark 14:61–64**)—interpreters cannot consistently regard him as merely a modest human moralist, and must choose among conscious deception, self-delusion, and truthfulness. Because **historians dispute whether the historical Jesus himself made the explicit divine self-claims recorded in the Gospels**, academic responses divide along two lines. **(1) Historical-Critical Debate (Legend vs. Early High Christology):** New Testament scholars **James D. G. Dunn** (*Jesus Remembered*, 2003) and **Bart D. Ehrman** (*How Jesus Became God*, 2014) argue that the explicit Johannine “I am” sayings (**John 8:58; 10:30**) reflect post-Easter theology rather than *ipsissima verba* (Jesus’s exact words). **Larry W. Hurtado** (*Lord Jesus Christ*, 2003) and **Richard Bauckham** (*Jesus and the God of Israel*, 2008) argue that the Synoptic prerogative claims (**Mark 2:5–10; 14:61–62**) and pre-Pauline devotion to Jesus (**1 Corinthians 8:6; Philippians 2:6–11**) place a Christology of divine identity in the earliest Palestinian movement. **(2) Analytical “Fourth-Option” Debate:** Philosopher **Daniel Howard-Snyder** (*Faith and Philosophy* 21, 2004) argues that a sane moral teacher could sincerely hold mistaken exalted beliefs without delusion or bad character, whereas Christian philosopher **Stephen T. Davis** (*Faith and Philosophy* 21, 2004) replies that, within first-century Jewish monotheism, claiming the prerogatives of Yahweh exceeds an ordinary factual mistake. The argument’s force therefore depends on prior historical and psychological premises.',
    quote: 'Either this man was, and is, the Son of God: or else a madman or something worse.',
    quoteCite: 'C. S. Lewis, *Mere Christianity*, Book II, ch. 3 (1952; London: Fount ed., 1977, pp. 52–53)',
    chips: [
      { label: 'Mark 2:5–10', href: '/bible/mk/2#5' },
      { label: 'Mark 14:61–62', href: '/bible/mk/14#61' },
    ],
  },
  {
    id: 'verdict-who-do-you-say-that-i-am',
    badge: 'Canonical Narrative Framing · Mark 8:27–29 & John 20:30–31',
    title: 'Biographical Purpose Statements & the Caesarea Philippi Question in the Gospels',
    meta: 'Mark 8:27–29; Luke 1:1–4; John 20:30–31',
    noteMd: 'Classified by Anglican New Testament scholar **Richard A. Burridge** (*What Are the Gospels?*, 1992/2004) among ancient Mediterranean *bioi* (biographies), the canonical Gospels state explicit historiographical and theological aims: **Luke 1:1–4** describes an orderly account drawn from those who were eyewitnesses and servants of the word; **John 20:30–31** presents selected signs so that readers may believe that Jesus is the Christ, the Son of God; and Mark’s narrative turns on Peter’s answer at Caesarea Philippi (**Mark 8:27–29**). Together, the 96 cataloged items in this dossier—manuscript folios, variant apparatuses, classical transmission parallels, excavated inscriptions, non-Christian historians, Palestinian name statistics, and ante-Nicene citations—link the primary documentary evidence to open digital repositories for direct verification.',
    quote: 'And He continued by questioning them, “But who do you say that I am?” Peter answered and said to Him, “You are the Christ.”',
    quoteCite: 'Mark 8:29 (NASB 1995)',
    chips: [
      { label: 'Mark 8:27–29', href: '/bible/mk/8#27' },
      { label: 'John 20:30–31', href: '/bible/jn/20#30' },
    ],
  },
];
