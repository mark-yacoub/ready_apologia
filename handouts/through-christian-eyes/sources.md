# Through Christian Eyes: source check

Every quotation on the handout, where it was checked, and any wording note. "Mirror" = the fawazahmed0/hadith-api
mirror of Sunnah.com (jsDelivr), which the repo already uses for quote fixes; Sunnah.com itself sits behind a
Cloudflare challenge and was not fetched.

## Panel 2
| Quote on sheet | Source | Checked against |
|---|---|---|
| "Surely We have sent down the Reminder, and surely We are indeed its Watchers [lit. Preservers]." | Qurʾān 15:9 | Verbatim Droge (`src/data/quran/english/droge_translation.json`), with literal gloss of Arabic *la-ḥāfiẓūna* |
| "a large part of the Qurʾān may be lost" / Abū Bakr asking the Prophet's scribe Zayd ibn Thābit / "How will you do something which Allah’s Messenger (ﷺ) did not do?" / palm stalks, thin white stones, end of Sūrah 9 with Abū Khuzaymah alone | Bukhārī 4986 | `src/data/hadith/sahih_fulltext.json` + `src/utils/quranPreservation/config.js` (`abu-khuzaima-last-verses`) |
| Caliph ʿUthmān standardizing one copy for every province when Muslims differed in recitation | Bukhārī 4987 | `src/data/hadith/sahih_fulltext.json` + `src/utils/quranPreservation/config.js` (`uthman-copies`) |
| "the middle prayer and the afternoon prayer" / "This is how I have heard from the Messenger of Allah" | Muslim 629 (in-book 5:261) | mirror (Arabic + English) |
| "they were among what is recited of the Qurʾān" | Muslim 1452a | literal rendering of *wa-hunna fīmā yuqraʾu mina l-qurʾān* (mirror Arabic); Siddiqui's "before that time" is the translator's addition, as the site's own note says |
| Ibn Masʿūd first of the four teachers | Bukhārī 3808 ("he started with him") | `src/data/hadith/sahih_fulltext.json` |
| Ibn Masʿūd on 113–114 | Bukhārī 4977 (Arabic *kadhā wa-kadhā*; the Khan gloss names the two sūrahs) | fulltext + mirror |
| "they are not from Allah's Book", reports Ibn Ḥajar calls authentic | Fatḥ al-Bārī (IslamWeb 52/9097–9098), citing Musnad Aḥmad / al-Ṭabarānī | `src/utils/quranPreservation/config.js` (`ibn-masud-muawwidhatayn`) |
| "O Allah! Bestow on him the knowledge of the Book" | Bukhārī 75 | mirror (`https://sunnah.com/bukhari:75`, Khan verbatim) |
| `يُطَوَّقُونَهُ` vs `يُطِيقُونَهُ`, 2:184 | Bukhārī 4505 (Arabic) | `Ibn_Abbas.json`; note: Khan's English mistranslates the verse, so the sheet gives the vocalized Arabic words |
| "This Verse is not abrogated, but it is meant for old men and old women who have no strength to fast" | Bukhārī 4505 | mirror (`https://sunnah.com/bukhari:4505`, Khan English, verbatim) |
| "a recitation that contradicts the Muṣḥafs of the people of Islam" | al-Ṭabarī on 2:184 | `Ibn_Abbas.json` tafsir excerpt |
| "thought that they had been lied to" | Qurʾān 12:110 (Ḥafṣ) | Droge |
| Ḥafṣ `كُذِبُوا` / Warsh `كُذِّبُوا` | 12:110 | `src/data/quran/qiraat/exact_diffs_combined.json` |
| "Allah forbid! The Apostles never suspected their Lord of such a thing." | Bukhārī 4695 | mirror: ʿUrwah asks *a-kudhibū am kudhdhibū*; she answers `كُذِّبُوا`; to "they thought they had been `كُذِبُوا`" she says *maʿādha llāh* |
| 37:12 `عَجِبْتَ` (Ḥafṣ, "you are amazed") / `عَجِبْتُ` (Ḥamzah, al-Kisāʾī, 'I am amazed') | 37:12 | `exact_diffs_combined.json` (readers: Khallād, Khalaf, Abū al-Ḥārith, al-Dūrī ʿan al-Kisāʾī…); "you are amazed" = Droge |
| Ḥafṣ ibn Sulaymān (in hadith): al-Bukhārī "They abandoned him", Muslim "Abandoned" (وقال البخاري تركوه وقال مسلم متروك) | Ibn Ḥajar, Tahdhīb al-Tahdhīb 2/401 (shamela 3310/916) | `hadith_reliability_overview.json` (Ḥafṣ section) |
| "Old tales! He has written it down, and it is dictated to him morning and evening" | Qurʾān 25:5 (context 25:4) | Droge |
| Rabbi Eliezer, Talmud Shabbat 11a; Song of Songs Rabbah 1:3 | Sefaria translation | `public/data/quran-sources/phrases/all/1.json` |
| Qurʾān 31:27 | Droge | `droge_translation.json` |
| 100 parallels (55 stories + 21 phrases + 24 practices); Infancy Gospel of Thomas 2nd century | quran-sources data (dated ~AD 150–185 there) | `public/data/quran-sources/*/all/1.json` |

## Panel 3
| Quote | Source | Checked against |
|---|---|---|
| "The angel caught me (forcefully) and pressed me so hard that I could not bear it any more" / "with his heart beating severely" / "Cover me! Cover me!" / "I fear that something may happen to me" | Bukhārī 3 | fulltext |
| "became so sad as we have heard that he intended several times to throw himself from the tops of high mountains" + Gabriel appearing to calm him | Bukhārī 6982 | fulltext ("as we have heard" marks al-Zuhrī's report) |
| "till Allah’s Messenger (ﷺ) started imagining that he had done a thing that he had not really done" (before he was cured) | Bukhārī 5763 | fulltext (5765 has the narrower "relations with his wives" wording, so 5763 is cited) |
| "Satan cast (something) into his wishful thinking. But God cancels what Satan casts." / Ibn ʿAbbās (in al-Bukhārī): "When he spoke, the Shaytan threw (some falsehood) into his speech" | Qurʾān 22:52; Bukhārī Book 65, ch. on 22:52 (before 4741) | Droge + `src/utils/originsOfRevelation/content.js` |
| "I am Gabriel, who stands in the presence of God" / "Do not be afraid, Zacharias" / "Do not be afraid, Mary; for you have found favor with God" | Luke 1:19, 13, 30 | `src/data/scripture/nasb/lk.json` |
| "whenever it seizes him, it slams him [to the ground]" / "It has often thrown him both into the fire and into the water to destroy him" | Mark 9:18, 22 | `src/data/scripture/nasb/mk.json` |
| "test the spirits to see whether they are from God" | 1 John 4:1 | `src/data/scripture/nasb/1jn.json` |
| "I feel that your Lord hastens in fulfilling your wishes and desires" (with oath *wallāhi*, "By Allah", in Muslim 1464a) | Bukhārī 4788; Muslim 1464a | fulltext + `src/utils/convenientRevelations/copy.js` |
| Four-wife cap and fairness for believers; Muhammad keeping nine wives | Qurʾān 4:3; Bukhārī 5068 ("he had nine wives") | Droge + `src/data/hadith/sahih_fulltext.json` |
| "any believing woman, if she gives herself to the prophet… (That is) exclusively for you, apart from the believers" | Qurʾān 33:50 | Droge |
| "You may put off whomever you please of them" (read by Ibn Kathīr as freeing him from equal division of turns) | Qurʾān 33:51; Ibn Kathīr on 33:51 | Droge + `src/utils/convenientRevelations/copy.js` |
| "seemed to refrain from having intercourse with captive women" / captives at Awṭās who had husbands | Muslim 1456a, 1456d | `src/utils/muhammadSlavery/copy/hadith.json` + mirror |
| "And (also forbidden to you are) married women, except what your right (hands) own" | Qurʾān 4:24 | Droge |
| "you are allowed to have sexual relations with them after making sure they are not pregnant" | Ibn Kathīr on 4:24 | `src/data/quran/commentary/tafsir_ibn_kathir_catena.json` |
| "cast lots amongst them, and set two free and kept four in slavery; and he (the Holy Prophet) spoke severely of him" | Muslim 1668a | `src/utils/muhammadSlavery/copy/hadith.json` (`six-slaves-lots`) |
| "You would have got more reward if you had given her (i.e. the slave-girl) to one of your maternal uncles" | Bukhārī 2592 | `src/data/hadith/sahih_fulltext.json` + `src/utils/muhammadSlavery/copy/hadith.json` (`maymuna`) |
| "he shall not multiply to himself wives" | Deuteronomy 17:17 | `src/data/scripture/lxx2012/dt.json` |
| "love your enemies and pray for those who persecute you" | Matthew 5:44 | `src/data/scripture/nasb/mt.json` |
| "confirming what was before it [lit. between its hands], and He sent down the Torah and the Gospel" | Qurʾān 3:3 (*muṣaddiqan li-mā bayna yadayhi*) | Droge (`droge_translation.json`) + `src/utils/islamicDilemma/content.js` |
| "So let the People of the Gospel judge by what God has sent down in it" / "People of the Book! You are (standing) on nothing until you observe the Torah and the Gospel, and what has been sent down to you from your Lord" | Qurʾān 5:47, 5:68 | Droge (`droge_translation.json`) |
| "until you believe in all the Books that you have [lit. in your hands]" | Ibn Kathīr on 5:68 | `src/data/quran/commentary/tafsir_ibn_kathir_catena.json` (Arabic *mā bi-aydīkum*, literally "what is in your hands") |
| "the Word was God" (Papyri 66 & 75, 2nd–3rd c.); Sinaiticus c. 330–360 with all four Gospels | John 1:1; manuscript catalog | `src/data/scripture/nasb/jn.json` + `src/utils/islamicDilemma/content.js` |

## Panel 4
| Quote | Source | Checked against |
|---|---|---|
| "My Lord and my God!" | John 20:28 | `src/data/scripture/nasb/jn.json` |
| "Son, your sins are forgiven" / "who can forgive sins but God alone?" | Mark 2:5, 2:7 | `src/data/scripture/nasb/mk.json` |
| "before Abraham was born, I am" | John 8:58 | `src/data/scripture/nasb/jn.json` |
| "I am; and you shall see the Son of Man sitting at the right hand of power, and coming with the clouds of heaven" (+ condemned for blasphemy, 14:63–64) | Mark 14:61–64 | `src/data/scripture/nasb/mk.json` (NASB small caps lowered) |
| "our God, Jesus Christ" | Ignatius, Ephesians 18 (c. AD 107) | `src/data/evidence/divinity_of_christ.json` |
| "a hymn to Christ as to a god" (*carmen Christo quasi deo*) | Pliny, Letters 10.96, c. AD 112 | `src/data/extrabiblical-evidence-for-jesus.json` |
| "Alexamenos worships [his] god", c. AD 200 | Alexamenos graffito | `src/data/divinityTimeline.json` |
| table offered "to God Jesus Christ", c. AD 230 | Megiddo mosaic (Akeptous inscription) | `src/data/divinityTimeline.json` |
| "Christus… suffered the extreme penalty during the reign of Tiberius at the hands of one of our procurators, Pontius Pilatus" | Tacitus, Annals 15.44, c. AD 116 (Church & Brodribb) | `src/data/extrabiblical-evidence-for-jesus.json` |
| "On the eve of Passover they hanged Yeshu the Nazarene" | Babylonian Talmud, Sanhedrin 43a (Munich MS 95, tr. Schäfer) | `src/utils/extrabiblicalEvidence/overrides.js` |
| "they did not kill him, nor did they crucify him" | Qurʾān 4:157 | Droge |
| Resurrection on the third day and appearances to witnesses | 1 Corinthians 15:3–8 | `src/data/scripture/nasb/1cor.json` |
| "a good example for you" | Qurʾān 33:21 | Droge |
| Qurʾān collection in Bukhārī 4986 | Bukhārī 4986 | `src/utils/quranPreservation/config.js` (`abu-khuzaima-last-verses`) |
| "to the straight path" | Qurʾān 1:6 | Droge |
| "which the Lord gave, the Apostles preached, and the Fathers kept." | St. Athanasius, First Letter to Serapion 28 (c. AD 359, PG 26:596A) | Standard translation |

Deliberately left off: the Testimonium Flavianum (authenticity disputed), the Syriac Alexander Legend
(dated AD 514–628, so "before Islam" is not certain), Ibn ʿAbbās on 24:27 (Ibn Kathīr calls it "very strange"),
and Sunan Abī Dāwūd 4449 on the Torah cushion (kept on the web deep dive; handout cites Bukhārī and Muslim only for hadith).
