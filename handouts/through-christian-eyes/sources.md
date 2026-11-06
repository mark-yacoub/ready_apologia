# Through Christian Eyes: source check

Every quotation on the handout, where it was checked, and any wording note. "Mirror" = the fawazahmed0/hadith-api
mirror of Sunnah.com (jsDelivr), which the repo already uses for quote fixes; Sunnah.com itself sits behind a
Cloudflare challenge and was not fetched.

## Panel 2
| Quote on sheet | Source | Checked against |
|---|---|---|
| "Surely We have sent down the Reminder, and surely We are indeed its Watchers." | Qurʾān 15:9 | `src/data/quran/english/droge_translation.json` |
| Ibn Masʿūd first of the four teachers | Bukhārī 3808 ("he started with him") | `src/data/hadith/sahih_fulltext.json` |
| Ibn Masʿūd on 113–114 | Bukhārī 4977 (Arabic *kadhā wa-kadhā*; the Khan gloss names the two sūrahs) | fulltext + mirror |
| "they are not from Allah's Book", reports Ibn Ḥajar calls authentic | Fatḥ al-Bārī (IslamWeb 52/9097–9098), citing Musnad Aḥmad / al-Ṭabarānī | `src/utils/quranPreservation/config.js` (ibn-masud-muawwidhatayn) |
| "O Allah! Bestow on him the knowledge of the Book" | Bukhārī 75 | mirror |
| *yuṭawwaqūnahu* vs *yuṭīqūnahu*, 2:184 | Bukhārī 4505 (Arabic) | `Ibn_Abbas.json`; note: Khan's English mistranslates the verse, so the sheet gives the Arabic words |
| "This Verse is not abrogated, but it is meant for old men and old women who have no strength to fast" | Bukhārī 4505 | mirror (Khan English, verbatim) |
| "a recitation that contradicts the Muṣḥafs of the people of Islam" | al-Ṭabarī on 2:184 | `Ibn_Abbas.json` tafsir excerpt |
| "the middle prayer and the afternoon prayer" / "This is how I have heard from the Messenger of Allah" | Muslim 629 (in-book 5:261) | mirror (Arabic + English) |
| "they were among what is recited of the Qurʾān" | Muslim 1452a | literal rendering of *wa-hunna fīmā yuqraʾu mina l-qurʾān* (mirror Arabic); Khan's "before that time" is the translator's addition, as the site's own note says |
| "thought that they had been lied to" | Qurʾān 12:110 (Ḥafṣ) | Droge |
| Ḥafṣ *kudhibū* / Warsh *kudhdhibū* | 12:110 | `src/data/quran/qiraat/exact_diffs_combined.json` |
| "Allah forbid! The Apostles never suspected their Lord of such a thing." | Bukhārī 4695 | mirror: ʿUrwah asks *a-kudhibū am kudhdhibū*; she answers *kudhdhibū*; to "they thought they had been *kudhibū*" she says *maʿādha llāh* |
| 37:12 *ʿajibta* (Ḥafṣ) / *ʿajibtu* (Ḥamzah, al-Kisāʾī) | 37:12 | `exact_diffs_combined.json` (readers: Khallad, Khalaf, Abū al-Ḥārith, al-Dūrī ʿan al-Kisāʾī…); "you are amazed" = Droge |
| Ḥafṣ ibn Sulaymān: al-Bukhārī "They abandoned him", Muslim "Abandoned" (وقال البخاري تركوه وقال مسلم متروك) | Ibn Ḥajar, Tahdhīb al-Tahdhīb 2/401 (shamela 3310/916) | `hadith_reliability_overview.json` (Ḥafṣ section) |
| 18 texts / 19 readings | quran-preservation catalog; `Ibn_Abbas.json` total_variants | repo |
| Rabbi Eliezer, Song of Songs Rabbah 1:3 | Sefaria translation | `public/data/quran-sources/phrases/all/1.json` (main checkout) |
| Qurʾān 31:27 | Droge | droge_translation.json |
| 100 parallels (55 stories + 21 phrases + 24 practices); Infancy Gospel of Thomas 2nd century | quran-sources data (dated ~AD 150–185 there) | main checkout `public/data/quran-sources/*/all/1.json` |

## Panel 3
| Quote | Source | Checked against |
|---|---|---|
| "The satans have not brought it down" | Qurʾān 26:210 | Droge |
| "The angel caught me (forcefully) and pressed me so hard that I could not bear it any more" / "with his heart beating severely" / "Cover me! Cover me!" / "I fear that something may happen to me" | Bukhārī 3 | fulltext |
| "he became so sad as we have heard that he intended several times to throw himself from the tops of high mountains" | Bukhārī 6982 | fulltext (the "as we have heard" is kept: it marks al-Zuhrī's report) |
| "started imagining that he had done a thing that he had not really done" | Bukhārī 5763 | fulltext (5765 has the narrower "relations with his wives" wording, so 5763 is cited) |
| "Satan cast (something) into his wishful thinking. But God cancels what Satan casts." | Qurʾān 22:52 | Droge |
| "Do not be afraid" | Luke 1:13, 1:30 | origins-of-revelation content (NASB) |
| "do not believe every spirit, but test the spirits to see whether they are from God" | 1 John 4:1 | origins-of-revelation content (NASB) |
| "any believing woman, if she gives herself to the prophet… (That is) exclusively for you, apart from the believers." | Qurʾān 33:50 | Droge |
| "I feel that your Lord hastens in fulfilling your wishes and desires"; "used to look down upon those ladies who had given themselves to Allah's Messenger" | Bukhārī 4788 | fulltext + mirror |
| "put off whomever you please of them" | Qurʾān 33:51 | Droge |
| Zayd as adopted son ("Zaid bin Muhammad") | Bukhārī 4782 | mirror |
| "We married her to you, so that there should not be any blame on the believers concerning the wives of their adopted sons." | Qurʾān 33:37 | Droge |
| "till Allah's Messenger (ﷺ) started imagining…" | Bukhārī 5763 | fulltext |
| 5:47, 5:68 | Droge | droge_translation.json |
| Papyri 66 & 75 2nd–3rd c. with John 1:1; Sinaiticus c. 330–360 with all four Gospels | islamic-dilemma content | `src/utils/islamicDilemma/content.js` |

## Panel 4
| Quote | Source | Checked against |
|---|---|---|
| "My Lord and my God!" | John 20:28 | `src/data/scripture/nasb/jn.json` |
| "Son, your sins are forgiven" / "who can forgive sins but God alone?" | Mark 2:5, 2:7 | `nasb/mk.json` |
| "before Abraham was born, I am" | John 8:58 | `nasb/jn.json` |
| "I am; and you shall see the Son of Man sitting at the right hand of power" (+ condemned for blasphemy, 14:63–64) | Mark 14:61–64 | `nasb/mk.json` (NASB small caps lowered) |
| "a hymn to Christ as to a god" (*carmen Christo quasi deo*) | Pliny, Letters 10.96, c. AD 112 | `src/data/extrabiblical-evidence-for-jesus.json`; Latin phrase is the original's *carmenque Christo quasi deo dicere* |
| table offered "to God Jesus Christ", c. AD 230 | Megiddo mosaic (Akeptous inscription) | `src/data/divinityTimeline.json` |
| "Christus… suffered the extreme penalty during the reign of Tiberius at the hands of one of our procurators, Pontius Pilatus" | Tacitus, Annals 15.44, c. AD 116 (Church & Brodribb) | extrabiblical JSON |
| "On the eve of Passover Yeshu was hanged" | Talmud, Sanhedrin 43a (Soncino) | extrabiblical JSON |
| "they did not kill him, nor did they crucify him" | Qurʾān 4:157 | Droge |
| Qurʾān collection in Bukhārī 4986 | Bukhārī 4986 | config.js (abu-khuzaima / uthman-copies) |
| "the Word was God" | John 1:1 | `nasb/jn.json` |

Deliberately left off: the Testimonium Flavianum (authenticity disputed), the Syriac Alexander Legend
(the repo dates it AD 514–628, so "before Islam" is not certain), and Ibn ʿAbbās on 24:27 (only in
al-Ṭabarī, and Ibn Kathīr calls it "very strange").

## Added in v3
| Quote | Source | Checked against |
|---|---|---|
| "Old tales! He has written it down, and it is dictated to him morning and evening" | Qurʾān 25:5 (context 25:4) | Droge |
| "Fear not, man greatly beloved: peace be to you, quit yourself like a man, and be strong" | Daniel 10:19 | `src/data/scripture/lxx2012/dn.json` |
| "whenever it seizes him, it slams him [to the ground]" / "It has often thrown him both into the fire and into the water to destroy him" | Mark 9:18, 22 | `nasb/mk.json` |
| Gabriel appearing on the mountain to calm him | Bukhārī 6982 | fulltext |
| "our God, Jesus Christ" | Ignatius, Ephesians 18 (c. 107) | `src/data/evidence/divinity_of_christ.json` |
| "Alexamenos worships [his] god", c. AD 200 | Alexamenos graffito | `src/data/divinityTimeline.json` |
| "to the straight path" | Qurʾān 1:6 | Droge |
| "which the Lord gave, the Apostles preached, and the Fathers kept" | Athanasius, Letter to Serapion 1.28 | web (standard translation) |
