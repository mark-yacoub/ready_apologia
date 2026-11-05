/**
 * Copy for /discover/convenient-revelations — the in-repo source of truth for every reader-facing string
 * of the article. Edit it directly; model.js validates each edit at build time (verbatim excerpts, stage
 * labels for every flow_stage, fixes that must apply exactly once, link schemes).
 *
 * The quote and reference fixes below override the dataset at build time. The review's data_proposals.md
 * mirrors them; once the dataset absorbs a fix, the build reports it as "already applied upstream" or
 * stale, and the fix is deleted here. `DATASET_REFS` records the dataset reference each ref fix replaces.
 *
 * First written from the Oct 2026 copy deck (copy_A sha256 31a64fdf2994…, copy_B 234d7816d05a…).
 * Structure (ids, legacy anchors, chapter placement) lives in config.js.
 */

/** Hub, chapters, catalog proposal, UI labels and showcase captions. */
export const GLOBAL = {
  "hub": {
    "seo": {
      "title": "12 Quran Verses on the Prophet's Household, Companions and Spoils",
      "description": "12 Quran verses on the Prophet's marriages, household, Companions and spoils, with the occasions Bukhari, Muslim and the classical tafsirs record for them.",
      "keywords": "occasions of revelation, asbab al-nuzul, quran 33:51 aisha your lord hastens, bukhari 4788, quran 33:50 exclusively for you, zaynab bint jahsh 33:37, surah tahrim 66:1 honey, ifk 24:11, lian 24:6, quran 2:187, prophet household quran"
    },
    "h1": "Did Revelation Answer the Prophet’s Own Wishes, or Speak Above Them?",
    "intro": "Muslims hold that the Qurʾān is God’s eternal word, never shaped by the Prophet’s own wishes: “nor does he speak on a whim” ([53:3](/quran/53/3/tafsir/tabari)). In Bukhārī, Muslim and the classical commentaries, verses arrive right after a dispute in his household, a marriage or oath of his own, or a Companion’s request — prompting ʿĀʾishah to tell him, “I feel that your Lord hastens in fulfilling your wishes and desires” ([Bukhārī 4788](https://sunnah.com/bukhari:4788)). Twelve commonly cited cases — eleven reported occasions and one related grant in 33:50 — follow with the classical explanation and the primary texts, including two (2:187 on Ramadan and 8:1–41 on the spoils) where the reports support the classical reading, so you can weigh each case for yourself.",
    "methodNote": {
      "summary": "How to read the twelve items: occasions of revelation and source labels",
      "body": "Classical scholars collected the occasions on which verses came down (*asbāb al-nuzūl*), teaching that a verse’s legal ruling follows its general wording rather than the occasion that prompted it. The historical question on this page is different: what prompted each verse, who benefited from the ruling, and how the witnesses inside the Prophet’s household described the pattern. For fairness, all twelve commonly cited cases are kept here, including two (Item 6 on Ramadan nights, 2:187, and Item 11 on war spoils, 8:1–41) where the sound reports in Bukhārī agree with the classical answer.\n\nTwo general answers are given to this question as a whole. First, Muslim readers point out that the Qurʾān rebukes the Prophet in verses such as “He frowned and turned away” ([80:1](/quran/80/1/tafsir/tabari)) and “God pardon you! Why did you give them permission” ([9:43](/quran/9/43/tafsir/tabari)): those are genuine rebukes on public matters outside his home, whereas inside his household the verses commentators call a reproach ([33:37](/quran/33/37/tafsir/tabari) in Item 3 and [66:1](/quran/66/1/tafsir/tabari) in Item 4) fault him for holding back and end by granting him the marriage or dissolving his oath. Second, readers cite God’s promise to please His Prophet — “Soon indeed your Lord will give to you, and you will be pleased” ([93:5](/quran/93/5/tafsir/tabari); cf. [2:144](/quran/2/144/tafsir/tabari)) — reading ʿĀʾishah’s remark in Item 1 as praise of God’s favour. On that reply, the question is not whether God may honour a prophet in principle, but whether divine revelation or human authorship better explains why the household rulings repeatedly track his immediate domestic pressures — lifting equal turns ([33:51](/quran/33/51/tafsir/tabari)), lifting the marriage cap ([al-Nasāʾī 3205](https://sunnah.com/nasai:3205)), dissolving his oath ([66:1–2](/quran/66/1/tafsir/tabari)), warning his wives in ʿUmar’s words ([Bukhārī 4916](https://sunnah.com/bukhari:4916)), and offering divorce after a month apart ([33:28–29](/quran/33/28/tafsir/tabari)).\n\nReports of occasions differ in strength; where a report’s chain of narrators (*isnād*) is weak, or stops at a Follower (the generation after the Companions, who did not witness the event), the item says so. Sunnah.com gradings: sound (*ṣaḥīḥ*), good (*ḥasan*), weak (*ḍaʿīf*). Tapping a citation inside a summary box jumps down the same page to the full Arabic and English card; the “Check this source” links at the bottom of each card open the verse on this site or the hadith on Sunnah.com.\n\nThe line under each title shows where the link to the occasion is recorded. “Addresses the Prophet in” names a verse that speaks to the Prophet or his wives in its own words. “A general rule in” names a verse addressed to all believers. “Occasion recorded in” lists the books that report what came before the verse."
    },
    "startHereLabel": "Start here",
    "footerLabel": "Sources used in this article"
  },
  "parts": {
    "sexual-privileges": {
      "order": 1,
      "label": "The Prophet’s Marriages",
      "question": "What Did the Verses on the Prophet’s Marriages Allow Him?",
      "dek": "33:51 lets the Prophet put off any wife’s turn, 33:50 allows him marriages “exclusively for you”, and 33:37 says God married Zaynab to him. Bukhārī and Muslim record what surrounded each verse.",
      "h1": "3 Verses on the Prophet’s Marriages: His Wives’ Turns, the Limit of Four and Zaynab",
      "eyebrow": "Part 1 of 4 · 12 occasions of revelation",
      "seo": {
        "title": "3 Quran Verses on the Prophet's Marriages: 33:51, 33:50, 33:37",
        "description": "Quran 33:51 lets the Prophet put off a wife's turn, 33:50 allows marriages 'exclusively for you', 33:37 tells of Zaynab: Bukhari, Muslim and the tafsirs.",
        "keywords": "quran 33:51, aisha your lord hastens, bukhari 4788, muslim 1464, sawdah gave her day to aisha, quran 33:50 exclusively for you, prophet four wife limit, bukhari 268, zaynab bint jahsh, quran 33:37, zayd ibn harithah"
      }
    },
    "evading-accountability": {
      "order": 2,
      "label": "Oaths, Accusations and Concessions",
      "question": "When an Oath, an Accusation or a Broken Fast Was Pending, What Did the Verse Say?",
      "dek": "66:1–2 released the Prophet from an oath made to please his wives; 24:4 and 24:6–9 set rules for accusers and for husbands, beside ʿĀʾishah’s case and a husband’s protest; 2:187 eased the nights of Ramadan.",
      "h1": "3 Verses That Settled an Oath, an Accusation and the Nights of Ramadan",
      "eyebrow": "Part 2 of 4 · 12 occasions of revelation",
      "seo": {
        "title": "3 Verses on an Oath, an Accusation and a Fast: 66:1, 24:4-9, 2:187",
        "description": "Quran 66:1-2 releases the Prophet's oath (honey or Mariyah), 24:4-9 sets rules for accusers after the Ifk and Hilal's case, 2:187 eases Ramadan nights.",
        "keywords": "surah tahrim 66:1, prophet honey oath, mariyah 66:1, bukhari 6691, aisha ifk, quran 24:4 four witnesses, lian 24:6, hilal ibn umayyah, bukhari 4747, quran 2:187, qays ibn sirmah, bukhari 1915"
      }
    },
    "spoils-and-etiquette": {
      "order": 3,
      "label": "Guests, the Ḥijāb and Captives",
      "question": "What Came Down After the Wedding Guests Lingered, ʿUmar Asked and Soldiers Hesitated?",
      "dek": "33:53 came down after wedding guests lingered in the Prophet’s house, the verses of the ḥijāb after ʿUmar’s requests, and 4:24 after Companions held back from married captives taken in the battle of Awṭās.",
      "h1": "3 Verses After the Wedding Guests, ʿUmar’s Request and the Captives of Awṭās",
      "eyebrow": "Part 3 of 4 · 12 occasions of revelation",
      "seo": {
        "title": "3 Quran Verses on Guests, the Hijab and Captives: 33:53, 33:59, 4:24",
        "description": "Quran 33:53 after Zaynab's wedding guests lingered, the hijab verses after Umar's requests, and 4:24 on the married captives of Awtas, in Bukhari and Muslim.",
        "keywords": "quran 33:53, zaynab wedding guests, bukhari 4793, verse of hijab umar, bukhari 146, umar sawdah, quran 33:59, muslim 2399, quran 4:24, captives of awtas, muslim 1456"
      }
    },
    "wealth-and-power": {
      "order": 4,
      "label": "Maintenance, Spoils and Captives",
      "question": "What Did the Verses Say About the Wives’ Maintenance, the Spoils and Captives?",
      "dek": "33:28–29 answered the wives’ request for more maintenance with a choice; 8:1, 8:41 and 59:6–7 set the shares of God, His Messenger and named groups in the spoils; 33:50 made captives lawful to the Prophet.",
      "h1": "3 Verses on the Wives’ Maintenance, the Spoils of War and Captives",
      "eyebrow": "Part 4 of 4 · 12 occasions of revelation",
      "seo": {
        "title": "3 Passages on Maintenance, Spoils and Captives: 33:28, 8:1, 33:50",
        "description": "Quran 33:28-29 gives the wives a choice over maintenance, 8:1, 8:41 and 59:6-7 set the shares of the spoils, 33:50 makes captives lawful to the Prophet.",
        "keywords": "quran 33:28, verse of choice takhyir, muslim 1478, muslim 1479, quran 8:1 anfal, quran 8:41 khums, quran 59:6 fay, bukhari 2904, quran 33:50 right hand possesses, captives safiyyah juwayriyah"
      }
    }
  },
  "catalog": {
    "title": "12 Occasions of Revelation: The Prophet’s Household, Companions and Spoils",
    "description": "Bukhārī, Muslim and the classical tafsīrs tie twelve verses to events in the Prophet’s life: his marriages, disputes in his household, his Companions’ requests and the spoils of war."
  },
  "labels": {
    "articleName": "12 Occasions of Revelation",
    "hubCrumb": "Discover",
    "coldContext": "Part {n} of {total} · {name}",
    "partOf": "Part {n} of {total}",
    "itemOf": "{n} of {total}",
    "itemOfStart": "1 of {total} · Start here",
    "startHere": "Start here",
    "startHereRow": "1 of 12 · Start here — open in chapter 1",
    "openStart": "Read it in chapter 1",
    "openItem": "Read this item",
    "openChapter": "Open chapter",
    "itemsCount": "{n} items",
    "allItems": "All {n}",
    "allItemsLong": "All {n} on the main page",
    "sourcesUsed": "Sources used in this article",
    "footerNote": "Every source is Sunni: the Qurʾān, ḥadīth collections and classical tafsīr. Where a report’s chain is weak, the item says so.",
    "onThisPage": "On this page",
    "copyLink": "Copy link",
    "copyItemLink": "Copy link to this item",
    "copied": "Link copied",
    "prevChapter": "Previous chapter",
    "nextChapter": "Next chapter",
    "nextChapterLink": "Next chapter: {label}",
    "next": "Next",
    "nextItem": "Next: {title}",
    "lastChapter": "This is the last chapter",
    "backToAll": "Back to all {n}",
    "otherChapters": "Other chapters",
    "sourcesInChapter": "Sources in this chapter",
    "chapterSources": "Sources in this chapter",
    "related": "Related",
    "sameVerse": "Same verse",
    "provenanceAddresses": "Addresses the Prophet in",
    "provenanceScope": "A general rule in",
    "provenanceOccasion": "Occasion recorded in",
    "provenanceExtra": "Also",
    "about": "Background on the verse and occasion",
    "aboutQuestion": "Background on the verse and occasion",
    "sources": "What the sources say",
    "moreSources": "More sources ({n})",
    "readFull": "Read the full text",
    "summaryOf": "Summary of {ref}, not a quotation",
    "paraphrase": "Summary of the report, not a quotation",
    "weakChain": "Weak chain",
    "classical": "How classical scholars explain it",
    "comparing": "Comparing with the texts",
    "verifyGroup": "Check this source",
    "originalArabic": "Original Arabic"
  },
  "showcaseCaptions": {
    "confrontation": "Two rules side by side",
    "timeline": "What happened, what was revealed",
    "versions": "Two reports of one occasion",
    "number_fan": "Shares of the spoils",
    "facts": "What the texts record"
  }
};

/** Per dataset theme: copy, showcase spec, stage labels, summaries, cross-links, quote/ref fixes, source layout. */
export const ITEMS = {
  "Theme_01_Marital_Limits": {
    "title": "2 Exemptions for the Prophet: More Than Four Wives, and a Woman Who Gives Herself",
    "hook": "For the believers, 4:3 limits wives to four; for the Prophet, Anas, who served him ten years, counts nine or eleven wives (Bukhārī 268), and 33:50 allows a woman who gives herself without dowry “exclusively for you”. When 33:52 later restricted him, reports in al-Nasāʾī and Ibn Kathīr record that the restriction too was lifted.",
    "takeaway": "4:3 capped believers at four wives, 33:50 exempted the Prophet “exclusively for you”, and when 33:52 barred him from adding wives, ʿĀʾishah and Ibn Kathīr record that the bar was lifted before he died.",
    "about": "Muslim men may marry up to four wives ([4:3](/quran/4/3/tafsir/tabari)); Ibn Kathīr quotes al-Shāfiʿī, founder of the Shāfiʿī school of law, that the Sunnah allows more than four to the Prophet alone, by scholarly agreement. [33:50](/quran/33/50/tafsir/tabari) lists the women lawful to him, ending with a believing woman who gives herself, “exclusively for you, apart from the believers”. [33:52](/quran/33/52/tafsir/tabari) adds: “Beyond (that) women are not permitted to you.”",
    "provenance": {
      "pattern": "addresses",
      "verse": "33:50",
      "occasion": [
        "Ṣaḥīḥ al-Bukhārī",
        "Tafsīr Ibn Kathīr",
        "Tafsīr al-Ṭabarī"
      ],
      "extra": null
    },
    "showcase": {
      "archetype": "confrontation",
      "caption": "Rule and exemption side by side",
      "rows": [
        "How many wives",
        "A woman who gives herself without dowry"
      ],
      "sides": [
        {
          "label": "For the believers",
          "lines": [
            {
              "row": 0,
              "src": 0,
              "excerpt": "marry what seems good to you of the women: two, or three, or four"
            },
            {
              "row": 1,
              "src": 3,
              "pre": "Qatādah, Anas’s student, of the generation after the Companions, in Ibn Kathīr’s commentary:",
              "excerpt": "It is not permissible for a woman to give herself to a man without a guardian or Mahr (dowry)"
            }
          ]
        },
        {
          "label": "For the Prophet",
          "lines": [
            {
              "row": 0,
              "src": 4,
              "excerpt": "they were eleven in number"
            },
            {
              "row": 0,
              "src": 1,
              "pre": "al-Shāfiʿī, founder of a school of law, in Ibn Kathīr:",
              "excerpt": "it is not permissible for anyone other than the Messenger of Allah to combine more than four women"
            },
            {
              "row": 1,
              "src": 2,
              "excerpt": "(That is) exclusively for you, apart from the believers"
            },
            {
              "row": 1,
              "src": 2,
              "field": "arabic",
              "excerpt": "خَالِصَةً لَّكَ مِن دُونِ الْمُؤْمِنِينَ"
            },
            {
              "row": 1,
              "src": 3,
              "pre": "ʿIkrimah, student of the Prophet’s cousin Ibn ʿAbbās, in Ibn Kathīr:",
              "excerpt": "The gifted woman (al-mawhuba) is not lawful for anyone other than you."
            }
          ]
        }
      ],
      "note": "Bukhārī 268 gives eleven from Anas, and nine in another chain from him:",
      "noteLines": [
        {
          "src": 4,
          "excerpt": "Anas had told him about nine wives only (not eleven)"
        }
      ]
    },
    "classical": {
      "text": "Jurists count marrying more than four among the Prophet’s special rulings (*khaṣāʾiṣ*), and Ibn Kathīr calls al-Shāfiʿī’s statement “agreed upon among the scholars” ([on 4:3](/quran/4/3/tafsir/ibn_kathir)). Modern Muslim writers add alliances and support for widows. Of the self-offering woman, Ibn Kathīr says the Prophet “did not accept any of those who gave themselves to him” ([on 33:50](/quran/33/50/tafsir/ibn_kathir)). 33:52 then barred new wives; when the bar was lifted, Ibn Kathīr says, “he did not marry any other women after that” ([on 33:52](/quran/33/52/tafsir/ibn_kathir))."
    },
    "comparing": {
      "text": "Calling these exemptions the Prophet’s “special rulings” (*khaṣāʾiṣ*) names the legal category; what the reader weighs is the direction of every change in the texts. First, when a convert named Ghaylān had ten wives, “the Prophet ordered (him) to choose four (of them)” under [4:3](/quran/4/3/tafsir/tabari) ([al-Tirmidhī 1128](https://sunnah.com/tirmidhi:1128), one of the six main hadith books; also quoted in [Ibn Kathīr on 4:3](/quran/4/3/tafsir/ibn_kathir), where jurists act on it), while the Prophet kept nine or eleven ([Bukhārī 268](https://sunnah.com/bukhari:268)). Second, [33:50](/quran/33/50/tafsir/tabari) allowed him any believing woman who gave herself without dowry, “exclusively for you, apart from the believers”; Ubayy ibn Kaʿb — one of the four Qurʾān teachers the Prophet named ([Bukhārī 3808](https://sunnah.com/bukhari:3808)) — and al-Ṭabarī read the next clause as exempting him from the four-wife limit as well ([Ibn Kathīr on 33:50](/quran/33/50/tafsir/ibn_kathir)). Of the self-offering women, Ibn Kathīr cites Ibn ʿAbbās that he took none, and on the next verse quotes the Follower al-Shaʿbī that “he consummated the marriage with some of them and delayed others” ([Ibn Kathīr on 33:51](/quran/33/51/tafsir/ibn_kathir)); on both reports the grant in 33:50 stood. Of the modern explanation of alliances and widows, Abū Dāwūd’s report on Juwayriyah gives both sides: a hundred families freed, and ʿĀʾishah’s words, “She was a very beautiful woman, most attractive to the eye” ([Abū Dāwūd 3931](https://sunnah.com/abudawud:3931), graded *ḥasan*, good).\n\nThird, when [33:52](/quran/33/52/tafsir/tabari) placed a limit on him — “Beyond (that) women are not permitted to you” — that restriction too was lifted, according to his wives ʿĀʾishah and Umm Salamah and to Ibn Kathīr: God “abrogated the ruling of this Ayah, permitting him to marry” ([Ibn Kathīr on 33:52](/quran/33/52/tafsir/ibn_kathir)). That Ibn Kathīr adds “he did not marry any other women after that” ([on 33:52](/quran/33/52/tafsir/ibn_kathir)) does not change the direction of the legislation itself: while believers remained capped at four ([4:3](/quran/4/3/tafsir/tabari)) and the Prophet kept nine or eleven ([Bukhārī 268](https://sunnah.com/bukhari:268)), the one verse that placed a ceiling on his marriages was itself repealed so that permission stood open for him again.\n\nEither 33:52’s restriction bound him until death, and the reports of ʿĀʾishah, Umm Salamah and Ibn Kathīr are set aside. Or the one verse that restricted the Prophet’s marriages was itself lifted before he died, whether or not he contracted a further marriage afterwards. ʿĀʾishah: “The Messenger of Allah did not die until Allah permitted him to marry whatever women he wanted” ([al-Nasāʾī 3205](https://sunnah.com/nasai:3205), another of the six books)."
    },
    "stageLabels": {
      "1. The Universal Limit (Maximum Four Wives)": "The limit of four for every believer (4:3)",
      "2. The Scholarly Consensus on the Limit": "Ibn Kathīr quotes al-Shāfiʿī on the Prophet’s case",
      "3. The Divine Exemption: Unlimited Marriages": "The women lawful to the Prophet (33:50)",
      "4. The Exemption Confirmed by Scholars": "Two early commentators, quoted by Ibn Kathīr on 33:50",
      "5. The Demographic Result": "Anas’s count of the Prophet’s wives (Bukhārī 268)"
    },
    "summaries": {},
    "sources": {
      "open": [
        0,
        2,
        4
      ],
      "collapsed": [
        1,
        3
      ]
    },
    "crossLinks": [
      {
        "label": "The next verse in the Qurʾān is the verse on the wives’ turns: 33:51 and ʿĀʾishah’s reply",
        "target": "Theme_02_Marital_Rotation"
      }
    ],
    "quoteFixes": [
      {
        "src": 4,
        "field": "english",
        "find": "\"We used to say that the Prophet (ﷺ) was given the strength of thirty (men).\"",
        "replace": "\"We used to say that the Prophet (ﷺ) was given the strength of thirty (men).\" And Sa`id said on the authority of Qatada that Anas had told him about nine wives only (not eleven).",
        "reason": "factcheck T01 src[4]: the hadith's last sentence (the \"nine\" narration) is dropped; restored verbatim (Sunnah.com English).",
        "sourceUrl": "https://sunnah.com/bukhari:268"
      },
      {
        "src": 4,
        "field": "arabic",
        "find": "أُعْطِيَ قُوَّةَ ثَلاَثِينَ",
        "replace": "أُعْطِيَ قُوَّةَ ثَلاَثِينَ. وَقَالَ سَعِيدٌ عَنْ قَتَادَةَ إِنَّ أَنَسًا حَدَّثَهُمْ تِسْعُ نِسْوَةٍ",
        "reason": "Same restored sentence, Arabic (factcheck T01 src[4]).",
        "sourceUrl": "https://sunnah.com/bukhari:268"
      },
      {
        "src": 1,
        "field": "english",
        "find": "This exactly what",
        "replace": "This is exactly what",
        "reason": "factcheck T01 src[1]: typo (\"This exactly\" → \"This is exactly\").",
        "sourceUrl": "/quran/4/3/tafsir/ibn_kathir"
      }
    ],
    "refFixes": [
      {
        "src": 1,
        "primary": [
          {
            "label": "Tafsīr Ibn Kathīr on 4:3 (quoting al-Shāfiʿī)",
            "href": "/quran/4/3/tafsir/ibn_kathir"
          }
        ],
        "secondary": [],
        "reason": "factcheck T01 src[1]: nested anchors; the first sentence is al-Shāfiʿī quoted by Ibn Kathīr.",
        "sourceUrl": "/quran/4/3/tafsir/ibn_kathir"
      },
      {
        "src": 3,
        "primary": [
          {
            "label": "Tafsīr Ibn Kathīr on 33:50 (Qatādah, ʿIkrimah)",
            "href": "/quran/33/50/tafsir/ibn_kathir"
          }
        ],
        "secondary": [],
        "reason": "factcheck T01 src[3]: sentence 1 is Qatādah, sentence 2 is ʿIkrimah, both quoted by Ibn Kathīr; nested anchors.",
        "sourceUrl": "/quran/33/50/tafsir/ibn_kathir"
      },
      {
        "src": 2,
        "primary": [
          {
            "label": "Qurʾān 33:50",
            "href": "/quran/33/50/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Sunan al-Nasāʾī 3205 (ʿĀʾishah: later permitted to marry; ṣaḥīḥ al-isnād)",
            "href": "https://sunnah.com/nasai:3205"
          }
        ],
        "reason": "adv COPY-A-R1 #7 / factcheck T01 src[2] omitted evidence: al-Nasāʾī 3205 is cited in comparing, so it gets a chip (chapter source index).",
        "sourceUrl": "https://sunnah.com/nasai:3205"
      }
    ]
  },
  "Theme_02_Marital_Rotation": {
    "title": "33:51 Let the Prophet Put Off Any Wife’s Turn; ʿĀʾishah Said, “Your Lord Hastens”",
    "hook": "33:51 tells the Prophet, “You may put off whomever you please of them”, which commentators read as freeing him from equal turns. In Bukhārī 4788 and Muslim 1464a, ʿĀʾishah tells him: “I feel that your Lord hastens in fulfilling your wishes and desires.”",
    "takeaway": "33:51 freed the Prophet from equal turns among his wives; ʿĀʾishah said in response (with an oath by God in Muslim 1464a), “I feel that your Lord hastens in fulfilling your wishes and desires” (Bukhārī 4788).",
    "about": "[33:51](/quran/33/51/tafsir/tabari) lets the Prophet put off or take back whichever wife he pleases. Classical commentators read it as lifting from him the duty of equal turns that binds other husbands, adding that he kept dividing his time by choice. Earlier, his older wife Sawdah had given her night to ʿĀʾishah ([Muslim 1463a](https://sunnah.com/muslim:1463a)); [Abū Dāwūd 2135](https://sunnah.com/abudawud:2135) (graded *ḥasan ṣaḥīḥ*, sound) adds that she feared he would divorce her, and Ibn Kathīr ties [4:128](/quran/4/128/tafsir/ibn_kathir) to her settlement.",
    "provenance": {
      "pattern": "addresses",
      "verse": "33:51",
      "occasion": [
        "Ṣaḥīḥ al-Bukhārī",
        "Ṣaḥīḥ Muslim",
        "Tafsīr al-Ṭabarī"
      ],
      "extra": null
    },
    "showcase": {
      "archetype": "confrontation",
      "caption": "Rule and exemption side by side",
      "quote": {
        "label": "ʿĀʾishah, when 33:51 came down (Bukhārī 4788)",
        "lines": [
          {
            "src": 4,
            "excerpt": "I used to look down upon those ladies who had given themselves to Allah's Messenger (ﷺ)"
          },
          {
            "src": 4,
            "excerpt": "I feel that your Lord hastens in fulfilling your wishes and desires"
          }
        ],
        "arabic": [
          {
            "src": 4,
            "field": "arabic",
            "excerpt": "كُنْتُ أَغَارُ عَلَى اللاَّتِي وَهَبْنَ أَنْفُسَهُنَّ"
          },
          {
            "src": 4,
            "field": "arabic",
            "excerpt": "مَا أُرَى رَبَّكَ إِلاَّ يُسَارِعُ فِي هَوَاكَ"
          }
        ]
      },
      "sides": [
        {
          "label": "For every husband: equal turns; and why Sawdah gave up her night",
          "lines": [
            {
              "theme": "Theme_01_Marital_Limits",
              "src": 0,
              "excerpt": "But if you fear that you will not be fair, (marry only) one"
            },
            {
              "src": 0,
              "pre": "Sawdah, the Prophet’s older wife, fearing divorce (Abū Dāwūd 2135):",
              "excerpt": "she had made over her day (which she had to spend) with Allah's Messenger to 'A'isha"
            },
            {
              "src": 0,
              "excerpt": "So Allah's Messenger allotted two days to 'A'isha."
            }
          ]
        },
        {
          "label": "For the Prophet: 33:51",
          "lines": [
            {
              "src": 2,
              "excerpt": "You may put off whomever you please of them, and you may take to yourself whomever you please. And whomever you desire of those you have set aside, (there is) no blame on you (if you take her again)."
            },
            {
              "src": 3,
              "pre": "al-Ṭabarī:",
              "excerpt": "to leave whomever he pleases of them, and approach whomever he pleases among them without division"
            },
            {
              "src": 3,
              "field": "arabic",
              "excerpt": "بغير قسم"
            }
          ]
        }
      ],
      "note": "In the quote box above, ʿĀʾishah’s Arabic (*kuntu aghāru*) means “I used to feel jealous”, as [Muslim 1464a](https://sunnah.com/muslim:1464a) renders it."
    },
    "classical": {
      "text": "Ibn Kathīr, author of the most widely read Qurʾān commentary, endorses the reading of al-Ṭabarī (d. 310 AH), whose commentary collects the earliest reports on each verse, that 33:51 covers the self-offering women and the wives alike, so “he had the choice concerning them” whether to divide his time equally ([Ibn Kathīr on 33:51](/quran/33/51/tafsir/ibn_kathir)); ʿĀʾishah says the Prophet still asked leave of the wife whose night it was ([Bukhārī 4789](https://sunnah.com/bukhari:4789)). Al-Qurṭubī, a classical Sunni scholar and commentator of Cordoba, quoted by Ibn Ḥajar in his standard commentary on Bukhārī ([*Fatḥ al-Bārī*, vol. 9](https://www.islamweb.net/ar/library/content/52/9346/)), calls her words “a saying brought out by affection and jealousy”, not to be read literally, since the Prophet does not speak from desire ([53:3](/quran/53/3/tafsir/tabari)). Al-Nawawī takes her words at face value as praise of God’s favour ([*Sharḥ Muslim*, vol. 10](https://www.islamweb.net/ar/library/content/53/4365/)), while modern Muslim readers point out that God promises to please His Prophet — “Soon indeed your Lord will give to you, and you will be pleased” ([93:5](/quran/93/5/tafsir/tabari); cf. [2:144](/quran/2/144/tafsir/tabari)) — and add that the Qurʾān elsewhere rebukes him (“He frowned and turned away”, [80:1](/quran/80/1/tafsir/tabari); “God pardon you! Why did you give them permission”, [9:43](/quran/9/43/tafsir/tabari))."
    },
    "comparing": {
      "text": "Al-Qurṭubī’s answer — that ʿĀʾishah spoke out of jealousy and did not mean her words literally — rests on the doctrine in [53:3](/quran/53/3/tafsir/tabari) (“nor does he speak on a whim”), where the Arabic word is *hawā*, the same word she used. Three facts in the primary texts test that reading. First, in Ṣaḥīḥ Muslim’s version she begins with an oath by God, *wallāhi* ([Muslim 1464a](https://sunnah.com/muslim:1464a)). Second, no version of her report records the Prophet correcting or rebuking her, though al-Qurṭubī himself grants that “had she said ‘to your pleasure’, it would have been more fitting” ([*Fatḥ al-Bārī*, vol. 9](https://www.islamweb.net/ar/library/content/52/9346/)). Third, on the same page Ibn Ḥajar glosses *hawāka* as “what pleases you”, and al-Nawawī, author of the *Forty Hadith* and the standard commentary on Muslim, takes her sentence at its word: God “lightens things for you and widens them; that is why He gave you the choice” ([*Sharḥ Muslim*, vol. 10](https://www.islamweb.net/ar/library/content/53/4365/)).\n\nWhy her testimony carries weight: the Prophet said revelation came to him under her blanket and no other wife’s ([Bukhārī 3775](https://sunnah.com/bukhari:3775)), he died in her house on her day ([Bukhārī 4450](https://sunnah.com/bukhari:4450)), and the historian al-Dhahabī counts 2,210 hadith from her ([*Siyar* 2/139](https://www.islamweb.net/ar/library/content/60/143/)). The second classical answer — that the Prophet still asked leave — rests on ʿĀʾishah too, in the next hadith ([Bukhārī 4789](https://sunnah.com/bukhari:4789)); of the Followers (the generation after the Companions) in [al-Ṭabarī](/quran/33/51/tafsir/tabari), Qatādah says he kept dividing his time, while Abū Razīn names five wives whose turns he put off.\n\nThat brings in the two broader answers every Muslim reader hears on this verse. First, that the Qurʾān also rebukes the Prophet ([80:1](/quran/80/1/tafsir/tabari); [9:43](/quran/9/43/tafsir/tabari)), which a man writing to please himself would not do: those verses are genuine rebukes on public matters outside his home, whereas in the household items ahead where commentators read a reproach — Zaynab’s marriage in [33:37](/quran/33/37/tafsir/tabari) (Item 3) and the oath in [66:1–2](/quran/66/1/tafsir/tabari) (Item 4) — the reproach faults him for hesitating or denying himself something lawful, and ends by marrying Zaynab to him or releasing him from his oath and warning his wives. Second, that God promises to please His Prophet ([93:5](/quran/93/5/tafsir/tabari); [2:144](/quran/2/144/tafsir/tabari)), so al-Nawawī can accept ʿĀʾishah’s words as praise of God’s favour: the question across these items is not whether God may honour His Prophet, but whether divine revelation or human authorship better explains a series of rulings that track his household pressures one by one — freeing him from equal turns here ([33:51](/quran/33/51/tafsir/tabari)), lifting the later marriage bar ([al-Nasāʾī 3205](https://sunnah.com/nasai:3205), Item 2), dissolving his oath to his wives ([66:1–2](/quran/66/1/tafsir/tabari), Item 4), warning them in ʿUmar’s exact words ([Bukhārī 4916](https://sunnah.com/bukhari:4916), Item 8), and offering them divorce after a month apart ([33:28–29](/quran/33/28/tafsir/tabari), Item 10).\n\nThe verse says it came “so that they may be comforted and not sorrow… all of them” ([33:51](/quran/33/51/tafsir/tabari)), and if ʿĀʾishah’s words are set aside as jealousy ([al-Qurṭubī](https://www.islamweb.net/ar/library/content/52/9346/)), then the wife under whose blanket revelation came misstated how revelation worked in her own house without being corrected. Taking her oath at face value (*wallāhi*, [Muslim 1464a](https://sunnah.com/muslim:1464a)), either God chose, again and again, to legislate what His Prophet wished, and ʿĀʾishah swore to it in praise. Or the rulings came from the Prophet himself, and ʿĀʾishah named the pattern. Her words: “I feel that your Lord hastens in fulfilling your wishes and desires” ([Bukhārī 4788](https://sunnah.com/bukhari:4788))."
    },
    "stageLabels": {
      "1. The Crisis: Sawdah Waives Her Turn to Avoid Divorce": "Sawdah gives her day to ʿĀʾishah (Muslim 1463a)",
      "2. The First Revelation: Ratifying the Compromise": "Ibn Kathīr ties 4:128 to Sawdah",
      "3. The Ultimate Exemption: Equal Rotation Abolished": "The verse on the wives’ turns (33:51), with al-Ṭabarī",
      "4. The Iconic Reaction: Aisha's Observation": "ʿĀʾishah’s words when 33:51 came down"
    },
    "summaries": {},
    "sources": {
      "open": [
        4,
        2,
        3
      ],
      "collapsed": [
        0,
        1
      ]
    },
    "crossLinks": [
      {
        "label": "The same report opens with the women who offered themselves: 33:50 and the limit of four",
        "target": "Theme_01_Marital_Limits"
      }
    ],
    "quoteFixes": [
      {
        "src": 4,
        "field": "english",
        "find": "Aisha reported: I felt jealous of the women who offered themselves to Allah's Messenger. But when the Verse: '(O Muhammad) You may postpone (the turn of) any of them (your wives) that you please' was revealed, Aisha said, 'O Allah's Messenger! I feel that your Lord hastens in fulfilling your wishes and desires!'",
        "replace": "Narrated Aisha: I used to look down upon those ladies who had given themselves to Allah's Messenger (ﷺ) and I used to say, \"Can a lady give herself (to a man)?\" But when Allah revealed: \"You (O Muhammad) can postpone (the turn of) whom you will of them (your wives), and you may receive any of them whom you will; and there is no blame on you if you invite one whose turn you have set aside (temporarily).' (33.51) I said (to the Prophet), \"I feel that your Lord hastens in fulfilling your wishes and desires.\"",
        "reason": "factcheck Top-10 #2 / T02 src[4]: the data blends Muslim 1464a's opening with Khan's Bukhārī 4788 remark and labels it 5113 (whose English reads \"I do not see, but, that your Lord hurries in pleasing you\"). Replaced with Bukhārī 4788's own English, verbatim (Sunnah.com / fawazahmed0 mirror); ref re-cited in refFixes.",
        "sourceUrl": "https://sunnah.com/bukhari:4788"
      },
      {
        "src": 4,
        "field": "arabic",
        "find": "قُلْتُ يَا رَسُولَ اللَّهِ مَا أَرَى رَبَّكَ إِلاَّ يُسَارِعُ فِي هَوَاكَ",
        "replace": "كُنْتُ أَغَارُ عَلَى اللاَّتِي وَهَبْنَ أَنْفُسَهُنَّ لِرَسُولِ اللَّهِ صلى الله عليه وسلم وَأَقُولُ أَتَهَبُ الْمَرْأَةُ نَفْسَهَا فَلَمَّا أَنْزَلَ اللَّهُ تَعَالَى {تُرْجِئُ مَنْ تَشَاءُ مِنْهُنَّ وَتُؤْوِي إِلَيْكَ مَنْ تَشَاءُ وَمَنِ ابْتَغَيْتَ مِمَّنْ عَزَلْتَ فَلاَ جُنَاحَ عَلَيْكَ} قُلْتُ مَا أُرَى رَبَّكَ إِلاَّ يُسَارِعُ فِي هَوَاكَ",
        "reason": "factcheck T02 src[4]: the Arabic given is 5113's. Replaced with the matn of Bukhārī 4788 (chain omitted; invisible U+200F marks dropped) so Arabic and English are the same report.",
        "sourceUrl": "https://sunnah.com/bukhari:4788"
      },
      {
        "src": 2,
        "field": "english",
        "find": "{You may postpone whomever you please of them, and you may take to yourself whomever you please. And whomever you desire of those you have set aside, there is no blame on you.}",
        "replace": "{You may put off whomever you please of them, and you may take to yourself whomever you please. And whomever you desire of those you have set aside, (there is) no blame on you (if you take her again). That is more appropriate, so that they may be comforted and not sorrow, and (that) they may be pleased with what you give them – all of them. God knows what is in your hearts. God is knowing, forbearing.}",
        "reason": "factcheck T02 src[2]: not Droge's wording and cut before the verse's own reason (\"so that they may be comforted…\"). Replaced with the full verse in Droge (the site's translation).",
        "sourceUrl": "/quran/33/51/tafsir/tabari"
      },
      {
        "src": 3,
        "field": "english",
        "find": "without division (equitable alternation of nights).",
        "replace": "without division (equitable alternation of nights), and the Prophet of God used to divide (his time).",
        "reason": "factcheck T02 src[3]: Qatādah's report is cut before its last clause «وكان نبي الله يقسم» (\"and the Prophet of God used to divide\"), verified in tafsir_tabari_arabic.json 33:51.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya51.html"
      },
      {
        "src": 3,
        "field": "arabic",
        "find": "ويأتي من يشاء منهن بغير قسم",
        "replace": "ويأتي من يشاء منهن بغير قسم، وكان نبي الله يقسم",
        "reason": "Same restored clause, Arabic (factcheck T02 src[3]).",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya51.html"
      },
      {
        "src": 1,
        "field": "english",
        "find": "This verse was revealed concerning Sawdah bint Zam'ah when she grew old and the Messenger of Allah wanted to divorce her, so she made peace with him by giving her day to Aisha so he would keep her.",
        "replace": "This is why, when Sawdah bint Zam'ah became old, the Messenger of Allah intended to part with her, so she made a peace settlement with him that he would keep her and she would leave her day to 'A'ishah. So he accepted that from her and kept her based on that.",
        "reason": "factcheck T02 src[1]: the quoted words are not Ibn Kathīr's. Replaced with his sentence as the site's Ibn Kathīr English gives it (tafsir_ibn_kathir_catena.json 4:128).",
        "sourceUrl": "/quran/4/128/tafsir/ibn_kathir"
      },
      {
        "src": 1,
        "field": "arabic",
        "find": "ونزلت هذه الآية في سودة بنت زمعة لما أسنت وأراد رسول الله صلى الله عليه وسلم طلاقها، فصالحته على أن تدع يومها لعائشة ويقعدها",
        "replace": "ولهذا لما كبرت سودة بنت زمعة عزم رسول الله صلى الله عليه وسلم على فراقها ، فصالحته على أن يمسكها ، وتترك يومها لعائشة ، فقبل ذلك منها وأبقاها على ذلك",
        "reason": "factcheck T02 src[1]: this Arabic is not in Ibn Kathīr; replaced with his own sentence as quoted in the factcheck.",
        "sourceUrl": "/quran/4/128/tafsir/ibn_kathir"
      }
    ],
    "refFixes": [
      {
        "src": 4,
        "primary": [
          {
            "label": "Ṣaḥīḥ al-Bukhārī 4788",
            "href": "https://sunnah.com/bukhari:4788"
          },
          {
            "label": "Ṣaḥīḥ Muslim 1464a",
            "href": "https://sunnah.com/muslim:1464a"
          }
        ],
        "secondary": [
          {
            "label": "Ṣaḥīḥ al-Bukhārī 5113 (another wording)",
            "href": "https://sunnah.com/bukhari:5113"
          }
        ],
        "reason": "factcheck Top-10 #2; adv_ia #1 (first-check integrity): the wording is 4788's; Muslim 1464a is the same report; 5113 kept as a parallel.",
        "sourceUrl": "https://sunnah.com/bukhari:4788"
      },
      {
        "src": 1,
        "primary": [
          {
            "label": "Tafsīr Ibn Kathīr on 4:128",
            "href": "/quran/4/128/tafsir/ibn_kathir"
          }
        ],
        "secondary": [
          {
            "label": "Sunan Abī Dāwūd 2135 (Sawdah’s fear; ḥasan ṣaḥīḥ)",
            "href": "https://sunnah.com/abudawud:2135"
          }
        ],
        "reason": "factcheck link fixes: \"Tafsir X (Quran S:A)\" nests one anchor in another; AD 2135 is the source for the fear of divorce.",
        "sourceUrl": "https://sunnah.com/abudawud:2135"
      },
      {
        "src": 3,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 33:51 (Qatādah’s report)",
            "href": "/quran/33/51/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Arabic text (KSU)",
            "href": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya51.html"
          }
        ],
        "reason": "factcheck T02 src[3]: the words are Qatādah's, cited by al-Ṭabarī; local Ṭabarī English is machine-generated, so add the Arabic source.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya51.html"
      }
    ]
  },
  "Theme_03_Zaynab_Marriage": {
    "title": "“You Hid Within Yourself”: 33:37 and the Prophet’s Marriage to Zaynab",
    "hook": "After Zayd, the Prophet’s adopted son (Bukhārī 4782), divorced the Prophet’s cousin Zaynab, 33:37 told him, “We married her to you”, and said he had hidden within himself “what God was going to reveal”; Muslim 1428b records the wedding. What did he hide?",
    "takeaway": "33:37 says the Prophet “hid within yourself what God was going to reveal, and feared the people”; ʿĀʾishah said he would have concealed this verse, had he concealed any.",
    "about": "Zayd ibn Ḥārithah, the one Companion the Qurʾān names ([33:37](/quran/33/37/tafsir/tabari)), was called Zayd ibn Muḥammad until 33:5 ended legal adoption ([Bukhārī 4782](https://sunnah.com/bukhari:4782)). After Zayd divorced Zaynab bint Jaḥsh, the Prophet’s cousin, 33:37 presents her marriage to the Prophet as God’s act, “so that there should not be any blame on the believers concerning the wives of their adopted sons”. Ibn Kathīr notes that by this verse the Prophet entered upon her as his wife “without a Mahr, guardian, or witnesses” — that is, without a dowry ([on 33:50](/quran/33/50/tafsir/ibn_kathir)).",
    "provenance": {
      "pattern": "addresses",
      "verse": "33:37",
      "occasion": [
        "Ṣaḥīḥ al-Bukhārī",
        "Ṣaḥīḥ Muslim",
        "Tafsīr al-Ṭabarī"
      ],
      "extra": null
    },
    "showcase": {
      "archetype": "timeline",
      "caption": "What happened, what was revealed",
      "points": [
        {
          "label": "Before: Zayd’s name",
          "lines": [
            {
              "src": 0,
              "excerpt": "We used not to call Zaid bin Haritha the freed slave of Allah's Messenger (ﷺ) except Zaid bin Muhammad till the Qur'anic Verse was revealed"
            }
          ]
        },
        {
          "label": "The verse",
          "lines": [
            {
              "src": 2,
              "excerpt": "you hid within yourself what God was going to reveal, and feared the people, when God had a better right that you feared Him. So when Zayd had gotten what he needed from her, We married her to you"
            }
          ]
        },
        {
          "label": "The wedding",
          "lines": [
            {
              "src": 3,
              "pre": "By 33:37 he entered as her husband without guardian, dowry or witnesses (Ibn Kathīr):",
              "excerpt": "She said: I do not do anything until I solicit the will of my Lord. So she stood at her place of worship and the (verse of) the Qur'an (pertaining to her marriage) were revealed, and Allah's Messenger (ﷺ) came to her without permission."
            }
          ]
        },
        {
          "label": "Afterwards",
          "lines": [
            {
              "src": 4,
              "pre": "ʿĀʾishah:",
              "excerpt": "If Allah's Messenger (ﷺ) were to conceal anything (of the Qur'an) he would have concealed this Verse."
            },
            {
              "src": 4,
              "pre": "Zaynab:",
              "excerpt": "You were given in marriage by your families, while I was married (to the Prophet) by Allah from over seven Heavens."
            }
          ]
        }
      ],
      "note": null
    },
    "classical": {
      "text": "Citing ʿAlī ibn al-Ḥusayn, the Prophet’s great-grandson, Ibn Kathīr says the Prophet hid God’s prior word that Zaynab would become his wife, and that the marriage was commanded to end the pre-Islamic taboo on marrying an adopted son’s former wife (“so that there should not be any blame on the believers concerning the wives of their adopted sons”, [33:37](/quran/33/37/tafsir/tabari)); the reports that he admired her, he “preferred to turn away from due to their inauthenticity” ([Ibn Kathīr on 33:37](/quran/33/37/tafsir/ibn_kathir)). Al-Ṭabarī records both views, reads the verse as a reproach to the Prophet (*ʿitāban min Allāh lahu*), and cites al-Ḥasan al-Baṣrī, of the generation after the Companions: no verse was harder on him than this one ([al-Ṭabarī on 33:37](/quran/33/37/tafsir/tabari))."
    },
    "comparing": {
      "text": "Two parts of [33:37](/quran/33/37/tafsir/tabari) have to be read together: its stated legislative purpose — “so that there should not be any blame on the believers concerning the wives of their adopted sons” — and its personal reproach to the Prophet for what came before: “you hid within yourself what God was going to reveal, and feared the people.” That legislative clause states the ruling the marriage established for believers (following [33:4–5](/quran/33/4/tafsir/tabari), which had already ended adoption-as-sonship in law); it does not explain what the Prophet himself was hiding while Zaynab was still married to Zayd. Ibn Kathīr’s answer — that he hid God’s prior word that she would become his wife — faces three facts in the primary texts. First, no report from the Prophet or any Companion records such a prior word; Ibn Kathīr’s sources are Followers (al-Suddī, and ʿAlī ibn al-Ḥusayn, born about 38 AH, [al-Dhahabī, *Siyar* 4/386](https://www.islamweb.net/ar/library/content/60/607/), through ʿAlī ibn Zayd ibn Judʿān, a narrator Ibn Ḥajar grades weak in his [*Taqrīb*](https://shamela.ws/narrator/4541)). Second, while Ibn Ḥajar adopts that reading, he notes the weak link and also quotes Anas’s student Qatādah: “the Prophet wanted him to divorce her, and feared what people would say” ([*Fatḥ al-Bārī*, vol. 8](https://www.islamweb.net/ar/library/content/52/8670/)). Third, the eyewitness sequence in [Bukhārī 7420](https://sunnah.com/bukhari:7420) and [Muslim 1428b](https://sunnah.com/muslim:1428b) shows the order of events: after telling Zayd, “Be afraid of Allah and keep your wife” ([Bukhārī 7420](https://sunnah.com/bukhari:7420)), as soon as Zaynab’s waiting period ended the Prophet sent Zayd himself to propose to her on his behalf — before [33:37](/quran/33/37/tafsir/tabari) came down — and when Zaynab replied, “I do not do anything until I solicit the will of my Lord,” and stood at her prayer place, the verse “We married her to you” was revealed and the Prophet entered upon her without waiting for permission ([Muslim 1428b](https://sunnah.com/muslim:1428b)).\n\nEither what he hid was God’s prior word that she would be his (ʿAlī ibn al-Ḥusayn, al-Suddī), and he told Zayd to keep his wife while knowing the marriage would end in his own. Or what he hid was his wish that Zayd part from her (Qatādah, and al-Ṭabarī’s gloss), and after he sent Zayd to propose, the verse answered his wish by marrying her to him directly — “We married her to you” ([33:37](/quran/33/37/tafsir/tabari)) — without guardian, dowry or witnesses ([Ibn Kathīr on 33:50](/quran/33/50/tafsir/ibn_kathir)). ʿĀʾishah: “If Allah's Messenger (ﷺ) were to conceal anything (of the Qur'an) he would have concealed this Verse” ([Bukhārī 7420](https://sunnah.com/bukhari:7420))."
    },
    "stageLabels": {
      "1. The Context: Zayd's Unbreakable Adoption Status": "Zayd called “son of Muḥammad” until 33:5 (Bukhārī 4782)",
      "2. The Spark of Passion: The Wind and the Curtain": "A late report (Ibn Zayd, d. 182 AH), set aside by Ibn Kathīr",
      "3. The Revelation: Abolishing Adoption to Secure the Marriage": "The verse on Zaynab’s marriage (33:37)",
      "4. The Exemption from Legal Marital Protocols": "Zayd’s errand and the wedding (Muslim 1428b)",
      "5. The Reaction: Zaynab's Triumphant Boast": "ʿĀʾishah and Zaynab on the verse (Bukhārī 7420)"
    },
    "summaries": {},
    "sources": {
      "open": [
        0,
        2,
        3,
        4
      ],
      "collapsed": [
        1
      ]
    },
    "crossLinks": [
      {
        "label": "The same wedding feast: 33:53 and the guests who stayed (chapter 3)",
        "target": "Theme_06_Etiquette_Interventions"
      }
    ],
    "quoteFixes": [
      {
        "src": 1,
        "field": "english",
        "find": " (passion was lit)",
        "replace": "",
        "reason": "factcheck T03 src[1] / adv_ia #3: \"(passion was lit)\" is not in the Arabic (فوقع إعجابها في قلب النبي).",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya37.html"
      },
      {
        "src": 1,
        "field": "english",
        "find": "I want to separate from my companion.'",
        "replace": "I want to separate from my companion.' He said: 'What is it, has something about her troubled you?' He said: 'No, by God, nothing has troubled me about her, Messenger of God, and I have seen only good.' He said: 'Keep your wife and fear God.'",
        "reason": "factcheck T03 src[1] (c): the report is cut before Zayd's answer and \"Keep your wife\"; restored with the factcheck's translation of the verified Arabic.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya37.html"
      },
      {
        "src": 1,
        "field": "arabic",
        "find": "فرفع الريح الستر",
        "replace": "فرفعت الريح الستر",
        "reason": "factcheck T03 src[1] (d): source reads فرفعت (tafsir_tabari_arabic.json 33:37).",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya37.html"
      },
      {
        "src": 1,
        "field": "arabic",
        "find": "بغضت إلى الآخر",
        "replace": "كرِّهت إلى الآخر",
        "reason": "factcheck T03 src[1] (d): source reads كرِّهت.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya37.html"
      },
      {
        "src": 1,
        "field": "arabic",
        "find": "إني أريد أن أفارق صاحبتي.",
        "replace": "إني أريد أن أفارق صاحبتي، قال: ما ذاك، أرابك منها شيء؟ قال: لا والله ما رابني منها شيء يا رسول الله، ولا رأيت إلا خيرًا، فقال له رسول الله صَلَّى الله عَلَيْهِ وَسَلَّم: أمسك عليك زوجك واتق الله",
        "reason": "Same restored clause, Arabic, verbatim from tafsir_tabari_arabic.json 33:37.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya37.html"
      },
      {
        "src": 2,
        "field": "english",
        "find": "{And [remember, O Muhammad], when you said to the one on whom Allah bestowed favor... 'Keep your wife and fear Allah,' while you concealed within yourself that which Allah is to disclose. And you feared the people, while Allah has more right that you fear Him. So when Zayd had no longer any need for her, We married her to you in order that there not be upon the believers any discomfort concerning the wives of their adopted sons.}",
        "replace": "{(Remember) when you said to the one whom God had blessed, and whom you had blessed: ‘Keep your wife to yourself, and guard (yourself) against God,’ and you hid within yourself what God was going to reveal, and feared the people, when God had a better right that you feared Him. So when Zayd had gotten what he needed from her, We married her to you, so that there should not be any blame on the believers concerning the wives of their adopted sons, when they have gotten what they needed from them. The command of God was (to be) fulfilled.}",
        "reason": "factcheck T03 src[2]: \"Use Droge for consistency\"; Droge also restores the verse's close (\"The command of God was (to be) fulfilled\"), listed as omitted evidence.",
        "sourceUrl": "/quran/33/37/tafsir/tabari"
      },
      {
        "src": 3,
        "field": "english",
        "find": "Zaid went on until he came to her and she was fermenting her flour. Zaid said: 'Zainab, receive the glad tidings. Allah's Messenger has sent me to you (with a message of marriage).' She said: 'I do not do anything until I consult my Lord.' So she stood at her place of worship and the (verse of) the Qur'an was revealed. The Messenger of Allah (ﷺ) then came to her without permission.",
        "replace": "When the 'Iddah of Zainab was over, Allah's Messenger (ﷺ) said to Zaid to make a mention to her about him. Zaid went on until he came to her and she was fermenting her flour. He (Zaid) said: As I saw her I felt in my heart an idea of her greatness so much so that I could not see towards her (simply for the fact) that Allah's Messenger (ﷺ) had made a mention of her. So I turned my back towards her. and I turned upon my heels, and said: Zainab, Allah's Messenger (ﷺ) has sent (me) with a message to you. She said: I do not do anything until I solicit the will of my Lord. So she stood at her place of worship and the (verse of) the Qur'an (pertaining to her marriage) were revealed, and Allah's Messenger (ﷺ) came to her without permission.",
        "reason": "factcheck T03 src[3]: the text is Muslim 1428b and the data's English is not Siddiqui's (\"receive the glad tidings\", \"(with a message of marriage)\" are absent; \"consult\" is \"solicit the will\"); it also cut Zayd's reverence. Replaced with Siddiqui's English, verbatim.",
        "sourceUrl": "https://sunnah.com/muslim:1428b"
      },
      {
        "src": 3,
        "field": "arabic",
        "find": "فَقَالَتْ مَا أَنَا بِصَانِعَةٍ شَيْئًا حَتَّى أُوَامِرَ رَبِّي ‏.‏ فَقَامَتْ إِلَى مَسْجِدِهَا وَنَزَلَ الْقُرْآنُ وَجَاءَ رَسُولُ اللَّهِ صلى الله عليه وسلم فَدَخَلَ عَلَيْهَا بِغَيْرِ إِذْنٍ",
        "replace": "لَمَّا انْقَضَتْ عِدَّةُ زَيْنَبَ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم لِزَيْدٍ \" فَاذْكُرْهَا عَلَىَّ \" . قَالَ فَانْطَلَقَ زَيْدٌ حَتَّى أَتَاهَا وَهْىَ تُخَمِّرُ عَجِينَهَا قَالَ فَلَمَّا رَأَيْتُهَا عَظُمَتْ فِي صَدْرِي حَتَّى مَا أَسْتَطِيعُ أَنْ أَنْظُرَ إِلَيْهَا أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم ذَكَرَهَا فَوَلَّيْتُهَا ظَهْرِي وَنَكَصْتُ عَلَى عَقِبِي فَقُلْتُ يَا زَيْنَبُ أَرْسَلَ رَسُولُ اللَّهِ صلى الله عليه وسلم يَذْكُرُكِ . قَالَتْ مَا أَنَا بِصَانِعَةٍ شَيْئًا حَتَّى أُوَامِرَ رَبِّي . فَقَامَتْ إِلَى مَسْجِدِهَا وَنَزَلَ الْقُرْآنُ وَجَاءَ رَسُولُ اللَّهِ صلى الله عليه وسلم فَدَخَلَ عَلَيْهَا بِغَيْرِ إِذْنٍ",
        "reason": "Arabic of the same span of Muslim 1428b (matn, from the mirror), to match the restored English.",
        "sourceUrl": "https://sunnah.com/muslim:1428b"
      },
      {
        "src": 4,
        "field": "english",
        "find": "Zainab used to boast before",
        "replace": "Aisha said, \"If Allah's Messenger (ﷺ) were to conceal anything (of the Qur'an) he would have concealed this Verse.\" Zainab used to boast before",
        "reason": "factcheck T03 src[4] (\"Consider adding ʿĀʾisha's line\") and omitted evidence: the sentence before Zaynab's words in the same hadith, verbatim from Sunnah.com's English, with the translator's gloss \"(of the Qur'an)\" closed: Sunnah.com drops the closing parenthesis (adv COPY-A-R1 #3). No word changed.",
        "sourceUrl": "https://sunnah.com/bukhari:7420"
      },
      {
        "src": 4,
        "field": "arabic",
        "find": "وَكَانَتْ زَيْنَبُ تَفْخَرُ",
        "replace": "قَالَتْ عَائِشَةُ لَوْ كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم كَاتِمًا شَيْئًا لَكَتَمَ هَذِهِ. قَالَ فَكَانَتْ زَيْنَبُ تَفْخَرُ",
        "reason": "Same restored sentence, Arabic (Bukhārī 7420 matn).",
        "sourceUrl": "https://sunnah.com/bukhari:7420"
      },
      {
        "src": 0,
        "field": "arabic",
        "find": "مَا كُنَّا نَدْعُو زَيْدَ بْنَ حَارِثَةَ مَوْلَى رَسُولِ اللَّهِ صلى الله عليه وسلم إِلاَّ زَيْدَ بْنَ مُحَمَّدٍ، حَتَّى نَزَلَ الْقُرْآنُ",
        "replace": "أَنَّ زَيْدَ بْنَ حَارِثَةَ، مَوْلَى رَسُولِ اللَّهِ صلى الله عليه وسلم مَا كُنَّا نَدْعُوهُ إِلاَّ زَيْدَ ابْنَ مُحَمَّدٍ حَتَّى نَزَلَ الْقُرْآنُ {ادْعُوهُمْ لآبَائِهِمْ هُوَ أَقْسَطُ عِنْدَ اللَّهِ}",
        "reason": "factcheck T03 src[0]: the Arabic is reordered; replaced with the matn of Bukhārī 4782, which also names the verse (33:5).",
        "sourceUrl": "https://sunnah.com/bukhari:4782"
      }
    ],
    "refFixes": [
      {
        "src": 3,
        "primary": [
          {
            "label": "Ṣaḥīḥ Muslim 1428b",
            "href": "https://sunnah.com/muslim:1428b"
          }
        ],
        "secondary": [],
        "reason": "factcheck link fixes: the quoted text is 1428b, not 1428a.",
        "sourceUrl": "https://sunnah.com/muslim:1428b"
      },
      {
        "src": 1,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 33:37 (report of Ibn Zayd)",
            "href": "/quran/33/37/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Arabic text (KSU)",
            "href": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya37.html"
          }
        ],
        "reason": "factcheck T03 src[1]: name the speaker (Ibn Zayd, muʿḍal); add the Arabic source for a machine-translated page.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya37.html"
      }
    ]
  },
  "Theme_04_Safe_Harbor_Oaths": {
    "title": "“Seeking the Approval of Your Wives”: 66:1 and Its 2 Reported Occasions, Honey and Māriyah",
    "hook": "Bukhārī ties 66:1 to honey the Prophet forbade himself after his wives ʿĀʾishah and Ḥafṣah, ʿUmar’s daughter, agreed on a complaint; al-Nasāʾī, one of the six main hadith books, ties it to his concubine Māriyah al-Qibṭiyyah, mother of his son Ibrāhīm. In both, 66:2–5 releases his oath and warns two wives.",
    "takeaway": "Whichever occasion is right, 66:2 prescribes “the absolution of your oaths”, and 66:5 tells two wives, “if he divorces you, his Lord will give him in exchange better wives”.",
    "about": "In both reported occasions the Prophet forbade himself something lawful amid a dispute among his wives: honey, after ʿĀʾishah and Ḥafṣah, ʿUmar’s daughter, agreed on a complaint ([Bukhārī 6691](https://sunnah.com/bukhari:6691), [Muslim 1474a](https://sunnah.com/muslim:1474a)), or his concubine Māriyah al-Qibṭiyyah, mother of his son Ibrāhīm, after Ḥafṣah’s complaint (a report Ibn Kathīr, author of the most widely read Qurʾān commentary, lists; [al-Nasāʾī 3959](https://sunnah.com/nasai:3959)). [66:1–2](/quran/66/1/tafsir/tabari) tells him not to forbid what God permitted and prescribes expiation; 66:3–5 turns to the two wives.",
    "provenance": {
      "pattern": "addresses",
      "verse": "66:1–5",
      "occasion": [
        "Ṣaḥīḥ al-Bukhārī",
        "Ṣaḥīḥ Muslim",
        "Sunan al-Nasāʾī",
        "Tafsīr al-Ṭabarī",
        "Tafsīr Ibn Kathīr"
      ],
      "extra": null
    },
    "showcase": {
      "archetype": "versions",
      "caption": "Two reports of one occasion",
      "head": {
        "label": "Both reports lead to 66:1:",
        "lines": [
          {
            "src": 3,
            "excerpt": "Why do you forbid what God has permitted to you, seeking the approval of your wives?"
          }
        ]
      },
      "tabs": [
        {
          "label": "Honey · Bukhārī 6691",
          "lines": [
            {
              "src": 5,
              "excerpt": "Hafsa and I decided that when the Prophet (ﷺ) entered upon either of us, she would say, \"I smell in you the bad smell of Maghafir (a bad smelling raisin). Have you eaten Maghafir?\""
            },
            {
              "src": 5,
              "excerpt": "\"No, but I have drunk honey in the house of Zainab bint Jahsh, and I will never drink it again.\" Then the following verse was revealed"
            }
          ]
        },
        {
          "label": "Māriyah · al-Nasāʾī 3959 & al-Ṭabarī",
          "lines": [
            {
              "src": 1,
              "pre": "Anas (al-Nasāʾī 3959, sound chain):",
              "excerpt": "the Messenger of Allah had a female slave with whom he had intercourse, but 'Aishah and Hafsah would not leave him alone until he said that she was forbidden for him. Then Allah, the Mighty and Sublime, revealed"
            },
            {
              "src": 2,
              "pre": "Qatādah, in al-Ṭabarī on 66:1:",
              "excerpt": "He had forbidden his Coptic young woman, the mother of his child Ibrahim, whose name was Mariyah, on the day of Hafsah, and confided that to her as a secret."
            }
          ]
        }
      ],
      "note": "Ibn Kathīr calls the honey account “the correct view”; [al-Nasāʾī 3959](https://sunnah.com/nasai:3959), with a sound chain of narrators from Anas, gives the account of the concubine he forbade himself, whom Qatādah in [al-Ṭabarī on 66:1](/quran/66/1/tafsir/tabari) and Ibn Kathīr identify as Māriyah, mother of the Prophet’s son Ibrāhīm."
    },
    "classical": {
      "text": "Ibn Kathīr lists the Māriyah report after “it was said” and concludes, “the correct view is that it was concerning his forbidding honey for himself” ([Ibn Kathīr on 66:2](/quran/66/2/tafsir/ibn_kathir)). Al-Ṭabarī (d. 310 AH), whose commentary collects the earliest reports on each verse, leaves it open — his concubine or a drink — and says God reproached him (*ʿātabahu*) for forbidding it ([al-Ṭabarī on 66:1](/quran/66/1/tafsir/tabari)). From 66:2 jurists draw a rule for every believer: declaring something lawful forbidden is an oath that needs expiation ([Bukhārī 4911](https://sunnah.com/bukhari:4911))."
    },
    "comparing": {
      "text": "Whether one follows the honey report in Bukhārī or the Māriyah reports in al-Nasāʾī and the commentaries, the verses do the same three things: what the Prophet forbade himself is returned to him (66:1), his oath is dissolved (66:2), and the two wives who complained are warned that God, Gabriel and the angels back him against them and can replace them with better wives (66:4–5). On the occasion itself, Ibn Kathīr prefers the honey report because it sits in Bukhārī, while also grading ʿUmar’s Māriyah chain “an authentic chain of narration” ([Ibn Kathīr on 66:2](/quran/66/2/tafsir/ibn_kathir)); al-Albānī, the twentieth-century hadith scholar whose gradings Sunnah.com shows, grades Anas’s Māriyah report sound ([al-Nasāʾī 3959](https://sunnah.com/nasai:3959)), and Ibn Ḥajar, author of the standard commentary on Bukhārī, judges that the Māriyah chains “strengthen one another”, so the verse may have come down “for both causes together” ([*Fatḥ al-Bārī*, vol. 8](https://www.islamweb.net/ar/library/content/52/8923/)).\n\nWhy the witnesses carry weight: both accounts come from inside the household — ʿĀʾishah tells the honey plan as her own (“Hafsa and I agreed secretly”, [Bukhārī 4912](https://sunnah.com/bukhari:4912)), while Māriyah’s case comes from Anas, who served the Prophet ten years ([Bukhārī 6038](https://sunnah.com/bukhari:6038)), and from ʿUmar, Ḥafṣah’s father. The reproach al-Ṭabarī reads in 66:1 is for denying himself “what God has permitted to you”, and it ends in his release.\n\nEither the occasion was honey (Bukhārī, Ibn Kathīr), or Māriyah (sound chains in al-Nasāʾī and Ibn Kathīr), or both together (Ibn Ḥajar). On every route the revelation released the Prophet from his oath to his wives and warned the two wives in words matching ʿUmar’s own threat: “I said to them, ‘It may be, if he divorced you all, that Allah will give him, instead of you wives better than you.’ So this Verse was revealed” ([Bukhārī 4916](https://sunnah.com/bukhari:4916); cf. [Muslim 1479a](https://sunnah.com/muslim:1479a) on [66:4–5](/quran/66/4/tafsir/tabari))."
    },
    "stageLabels": {
      "1. The Context (The Problem/Complaint)": "Ḥafṣah’s complaint, in a weak report (al-ʿAwfī) that Ibn Kathīr lists",
      "2. The Oath": "Anas’s report on the concubine he forbade himself (al-Nasāʾī 3959, sound chain)",
      "3. The Secret Disclosed": "An early commentator, Qatādah, in al-Ṭabarī: the secret told",
      "4. The Revelation": "The verses on the oath (66:1–2)",
      "5. Implementation": "The Prophet’s cousin Ibn ʿAbbās, in al-Ṭabarī: the oath expiated",
      "6. Alternate Hadith Context (The Honey Trick)": "The honey report (Bukhārī 6691), Ibn Kathīr’s preferred view"
    },
    "summaries": {},
    "sources": {
      "open": [
        3,
        5,
        1,
        2
      ],
      "collapsed": [
        0,
        4
      ]
    },
    "crossLinks": [
      {
        "label": "Other verses that address the Prophet’s household in their own words: 33:53 and the wedding guests (chapter 3)",
        "target": "Theme_06_Etiquette_Interventions"
      },
      {
        "label": "33:28–29 and the choice offered to the wives (chapter 4)",
        "target": "Theme_12_Wives_Demanding_Wealth"
      }
    ],
    "quoteFixes": [
      {
        "src": 0,
        "field": "english",
        "find": "on my day, in my turn, and on my bed.'",
        "replace": "on my day, in my turn, and on my bed.' He said, 'Will it not please you if I forbid her to myself and do not approach her?' She said, 'Yes.' So he forbade her to himself, and said to her, 'Do not mention this to anyone.'",
        "reason": "Keep the full weak al-ʿAwfī report together on src[0] in the drawer so src[1] can present the sound al-Nasāʾī 3959 report (factcheck T04 src[1] / r3 #3).",
        "sourceUrl": "/quran/66/1/tafsir/ibn_kathir"
      },
      {
        "src": 1,
        "field": "english",
        "find": "He said, 'Will it not please you if I forbid her to myself and do not approach her?' She said, 'Yes.' So he forbade her to himself, and said to her, 'Do not mention this to anyone.'",
        "replace": "It was narrated from Anas, that the Messenger of Allah had a female slave with whom he had intercourse, but 'Aishah and Hafsah would not leave him alone until he said that she was forbidden for him. Then Allah, the Mighty and Sublime, revealed: \"O Prophet! Why do you forbid (for yourself) that which Allah has allowed to you.' until the end of the Verse",
        "reason": "factcheck T04 src[1] (\"Use Nasāʾī 3959 for the Māriyah account, with its grade\"): Ibn Kathīr on 66:1 opens by quoting al-Nasāʾī's report from Anas (Sunan al-Nasāʾī 3959, ṣaḥīḥ al-isnād); replaced with Sunnah.com's verbatim English of al-Nasāʾī 3959.",
        "sourceUrl": "https://sunnah.com/nasai:3959"
      },
      {
        "src": 2,
        "field": "english",
        "find": "and they both used to help each other against the wives of the Prophet, may Allah bless him and grant him peace.",
        "replace": "and they both used to help each other against the wives of the Prophet, may Allah bless him and grant him peace. God made lawful what he had forbidden himself, he was ordered to expiate his oath, and he was rebuked for it.",
        "reason": "factcheck T04 src[2]: Qatādah's report is cut before «فأحلّ الله له ما حرَّم على نفسه، فأُمر أن يكفر عن يمينه، وعوتب في ذلك» (verified in tafsir_tabari_arabic.json 66:1); restored with the factcheck's translation.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura66-aya1.html"
      }
    ],
    "refFixes": [
      {
        "src": 3,
        "primary": [
          {
            "label": "Qurʾān 66:1–2",
            "href": "/quran/66/1/tafsir/tabari"
          }
        ],
        "secondary": [],
        "reason": "factcheck link fixes: the text is 66:1–2.",
        "sourceUrl": "/quran/66/1/tafsir/tabari"
      },
      {
        "src": 0,
        "primary": [
          {
            "label": "Tafsīr Ibn Kathīr on 66:1 (al-ʿAwfī from Ibn ʿAbbās)",
            "href": "/quran/66/1/tafsir/ibn_kathir"
          }
        ],
        "secondary": [
          {
            "label": "Ibn Kathīr’s verdict, on 66:2",
            "href": "/quran/66/2/tafsir/ibn_kathir"
          }
        ],
        "reason": "factcheck T04 src[0] / Top-10 #4: weak al-ʿAwfī chain; Ibn Kathīr's \"correct view\" (honey) sits on the 66:2 page.",
        "sourceUrl": "/quran/66/2/tafsir/ibn_kathir"
      },
      {
        "src": 1,
        "primary": [
          {
            "label": "Sunan al-Nasāʾī 3959 (Anas; ṣaḥīḥ al-isnād)",
            "href": "https://sunnah.com/nasai:3959"
          },
          {
            "label": "Tafsīr Ibn Kathīr on 66:1 (quoting al-Nasāʾī)",
            "href": "/quran/66/1/tafsir/ibn_kathir"
          }
        ],
        "secondary": [
          {
            "label": "Ibn Kathīr’s verdict, on 66:2",
            "href": "/quran/66/2/tafsir/ibn_kathir"
          }
        ],
        "reason": "factcheck T04 src[1]: al-Nasāʾī 3959 (Anas, ṣaḥīḥ al-isnād), which Ibn Kathīr quotes at the head of 66:1.",
        "sourceUrl": "https://sunnah.com/nasai:3959"
      },
      {
        "src": 2,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 66:1 (Qatādah’s report)",
            "href": "/quran/66/1/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Arabic text (KSU)",
            "href": "https://quran.ksu.edu.sa/tafseer/tabary/sura66-aya1.html"
          }
        ],
        "reason": "Machine-translated local English: add the Arabic source.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura66-aya1.html"
      },
      {
        "src": 4,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 66:1 (Ibn ʿAbbās)",
            "href": "/quran/66/1/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Ṣaḥīḥ al-Bukhārī 4911 (short form)",
            "href": "https://sunnah.com/bukhari:4911"
          }
        ],
        "reason": "factcheck T04 src[4]: \"Cite Bukhārī 4911 alongside.\"",
        "sourceUrl": "https://sunnah.com/bukhari:4911"
      },
      {
        "src": 5,
        "primary": [
          {
            "label": "Ṣaḥīḥ al-Bukhārī 6691",
            "href": "https://sunnah.com/bukhari:6691"
          }
        ],
        "secondary": [
          {
            "label": "Ṣaḥīḥ Muslim 1474a",
            "href": "https://sunnah.com/muslim:1474a"
          },
          {
            "label": "Ṣaḥīḥ al-Bukhārī 4912",
            "href": "https://sunnah.com/bukhari:4912"
          }
        ],
        "reason": "factcheck T04: the honey report is in both Ṣaḥīḥs (Muslim 1474a; Bukhārī 4912 has \"I have taken an oath\").",
        "sourceUrl": "https://sunnah.com/muslim:1474a"
      }
    ]
  },
  "Theme_05_Captives_of_War": {
    "title": "4:24 and the Married Captives of Awṭās, in Ṣaḥīḥ Muslim and the Qurʾān Commentaries",
    "hook": "In Ṣaḥīḥ Muslim, the Companion Abū Saʿīd al-Khudrī, one of the captors, reports that Companions held back from women taken in the battle of Awṭās who had living husbands, and that 4:24 came down in response: “married women, except what your right (hands) own”.",
    "takeaway": "Muslim records that 4:24 came down when Companions hesitated over captive women whose husbands were alive, permitting relations after a waiting period of one menstrual cycle (Abū Dāwūd 2157).",
    "about": "After the battle at Awṭās, in the campaign of Ḥunayn, Muslim soldiers took captive women whose polytheist husbands were still living. The Companions held back from relations with them out of conscience and asked the Prophet, and [4:24](/quran/4/24/tafsir/tabari) came down: “married women, except what your right (hands) own”. Classical jurists read the verse as ending the captives’ earlier marriages upon capture, with relations lawful after one menstrual cycle (*istibrāʾ*) to confirm she is not pregnant.",
    "provenance": {
      "pattern": "scope",
      "verse": "4:24",
      "occasion": [
        "Ṣaḥīḥ Muslim",
        "Tafsīr al-Ṭabarī",
        "Tafsīr Ibn Kathīr"
      ],
      "extra": null
    },
    "showcase": {
      "archetype": "timeline",
      "caption": "What happened, what was revealed",
      "points": [
        {
          "label": "The Companions hold back",
          "lines": [
            {
              "src": 5,
              "excerpt": "the Companions of Allah's Messenger (may peace te upon him) seemed to refrain from having intercourse with captive women because of their husbands being polytheists."
            }
          ]
        },
        {
          "label": "They ask the Prophet",
          "lines": [
            {
              "src": 4,
              "excerpt": "So, we asked the Prophet (peace be upon him) about this matter"
            }
          ]
        },
        {
          "label": "The verse",
          "lines": [
            {
              "src": 5,
              "excerpt": "Then Allah, Most High, sent down regarding that:"
            },
            {
              "src": 5,
              "excerpt": "And women already married, except those whom your right hands possess (iv. 24)"
            }
          ]
        },
        {
          "label": "What followed",
          "lines": [
            {
              "src": 4,
              "excerpt": "Consequently, we considered their private parts lawful."
            },
            {
              "src": 5,
              "excerpt": "(i. e. they were lawful for them when their 'Idda period came to an end)"
            }
          ]
        }
      ],
      "note": [
        "For the Awṭās captives, [Abū Dāwūd 2157](https://sunnah.com/abudawud:2157), in one of the six canonical hadith books, sets the wait at one menstrual period (graded sound, *ṣaḥīḥ*, by al-Albānī)."
      ]
    },
    "classical": {
      "text": "Ibn Kathīr reads the exception in 4:24 as women owned through capture: “relations with them are lawful once you have confirmed they are not pregnant” ([Ibn Kathīr on 4:24](/quran/4/24/tafsir/ibn_kathir)). Al-Ṭabarī adds a condition: the Awṭās captives “became lawful if they embraced Islam, after the waiting period” ([al-Ṭabarī on 4:24](/quran/4/24/tafsir/tabari)). Jurists held that capture ends the earlier marriage and that the wait of one menstrual cycle (*istibrāʾ*) protects lineage. Modern writers describe captives taken into Muslim households through marriage, spared wartime destitution."
    },
    "comparing": {
      "text": "What links this episode to the article’s question is the sequence reported by the captor himself, Abū Saʿīd al-Khudrī: the soldiers at Awṭās wanted relations with the captive women, held back because they felt it was a sin while the women’s husbands were alive, asked the Prophet, and [4:24](/quran/4/24/tafsir/tabari) came down permitting what they had asked about — “Consequently, we considered their private parts lawful” ([Ibn Kathīr on 4:24](/quran/4/24/tafsir/ibn_kathir); [Muslim 1456a](https://sunnah.com/muslim:1456a)). While the parenthetical gloss in [Muslim 1456a](https://sunnah.com/muslim:1456a) uses the word *ʿiddah*, the parallel chain in [Muslim 1456b](https://sunnah.com/muslim:1456b) notes that the narrator “did not mention ‘when their ’idda period comes to an end’”, and [Abū Dāwūd 2157](https://sunnah.com/abudawud:2157) (graded sound by al-Albānī) defines the wait for captives as a single menstrual period (*istibrāʾ*) rather than a divorced wife’s three-cycle *ʿiddah* — before the Hawāzin captives were returned not long afterwards when their tribe’s delegation came as Muslims ([Bukhārī 2307](https://sunnah.com/bukhari:2307)).\n\nBecause the reports describe immediate ownership after the battle, later commentators added conditions not stated in the Awṭās hadiths. Modern writers speak of marriage, which no classical source on Awṭās mentions. Al-Ṭabarī required the captives to convert to Islam before relations ([al-Ṭabarī on 4:24](/quran/4/24/tafsir/tabari)); Ibn al-Qayyim, in his book on the Prophet’s practice, answered that the Prophet “did not make their Islam a condition” and set the one-period wait as the sole bar, calling the conversion of all “several thousand” captives at once “extremely unlikely” ([*Zād al-Maʿād*, quoted in *Aḍwāʾ al-Bayān*](https://www.islamweb.net/ar/library/content/64/215/)).\n\nEither the married captives of Awṭās became lawful to their captors by ownership after a single menstrual cycle, with no marriage and no conversion recorded in the reports, as Ibn al-Qayyim reads them. Or thousands of newly captured women converted to Islam within weeks of the battle before their tribe’s delegation arrived ([Bukhārī 2307](https://sunnah.com/bukhari:2307)), with no report recording it. Abū Saʿīd on the rule given at Awṭās: “There must be no intercourse with pregnant woman till she gives birth to her child or with the one who is not pregnant till she has had one menstrual period” ([Abū Dāwūd 2157](https://sunnah.com/abudawud:2157))."
    },
    "stageLabels": {
      "1. The Context: Capturing Married Women and Moral Hesitation": "The Companions hold back from married captives",
      "2. The Complaint: Questioning the Prophet": "The Companions ask the Prophet",
      "3. The Revelation: Divine Permission Granted": "The verse (4:24); a broken-chain report names Khaybar",
      "4. Legal Clarifications and Implementation": "The waiting period and the condition of Islam"
    },
    "summaries": {},
    "crossLinks": [
      {
        "label": "Captives “God has given you” in 33:50",
        "target": "Theme_11_Slavery_and_Wealth"
      }
    ],
    "quoteFixes": [
      {
        "src": 3,
        "field": "english",
        "find": "أن هذه الآية نزلت فيمن سبي من أوطاس",
        "replace": "كيف نقع على نساء قد عرفنا أنسابهن وأزواجهن",
        "reason": "factcheck T05 src[3] (Arabic mismatch): the embedded “Arabic Reference” is al-Ṭabarī’s framing sentence, not this report; the report’s own words are «كيف نقع على نساء قد عرفنا أنسابهن وأزواجهن». (Applies to the raw field before model.js splits “Arabic Reference:” into `arabic`.)",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura4-aya24.html"
      }
    ],
    "refFixes": [],
    "sources": {
      "open": [
        5,
        4,
        8,
        0
      ]
    }
  },
  "Theme_06_Etiquette_Interventions": {
    "title": "33:53 and the Guests at the Prophet’s Wedding: Anas’s Account in Bukhārī and Muslim",
    "hook": "Anas, who served the Prophet ten years, reports in Bukhārī and Muslim that 33:53 came down the evening three guests lingered chatting in the Prophet’s house after his wedding to Zaynab. In a single verse, revelation dismisses the guests (“he is ashamed of you”), places his wives behind a curtain (ḥijāb), and forbids anyone from ever marrying his widows.",
    "takeaway": "Revealed the night three wedding guests lingered, 33:53 dismisses the guests for troubling the shy Prophet, screens his wives, and bars marrying his widows forever.",
    "about": "After the Prophet’s wedding feast for Zaynab bint Jaḥsh, three guests stayed on talking in the house while the Prophet was too shy to ask them to leave. Anas reports that [33:53](/quran/33/53/tafsir/tabari) came down right then: it tells believers not to enter the Prophet’s houses uninvited or linger after a meal, orders them to speak to his wives from behind a curtain (*ḥijāb*), and forbids anyone from ever marrying his wives after him.",
    "provenance": {
      "pattern": "addresses",
      "verse": "33:53",
      "occasion": [
        "Ṣaḥīḥ al-Bukhārī",
        "Ṣaḥīḥ Muslim"
      ],
      "extra": null
    },
    "showcase": {
      "archetype": "timeline",
      "caption": "Anas’s account, step by step",
      "points": [
        {
          "label": "The feast",
          "lines": [
            {
              "src": 1,
              "excerpt": "A banquet of bread and meat was held on the occasion of the marriage of the Prophet (ﷺ) to Zainab bint Jahsh."
            }
          ]
        },
        {
          "label": "Three guests stay on",
          "lines": [
            {
              "src": 1,
              "excerpt": "Then a batch of three persons stayed in the house chatting."
            }
          ]
        },
        {
          "label": "The Prophet’s discomfort",
          "lines": [
            {
              "src": 2,
              "excerpt": "It was troublesome for Allah's Messenger (ﷺ), so Allah's Messenger (ﷺ) went out and greeted his wives."
            },
            {
              "src": 1,
              "excerpt": "The Prophet was a very shy person"
            }
          ]
        },
        {
          "label": "The verse",
          "lines": [
            {
              "src": 1,
              "excerpt": "he drew the curtain between me and him, and then the Verse of Al-Hijab was revealed"
            },
            {
              "src": 2,
              "excerpt": "enter not the houses of the Prophet unless permission is given to you for a meal"
            },
            {
              "src": 2,
              "excerpt": "disperse not seeking to listen to talk. Surely this gives the Prophet trouble"
            }
          ]
        }
      ],
      "note": [
        "The verse Anas recites continues with the screen (ḥijāb) for the Prophet’s wives and the lifelong ban on marrying his widows ([33:53](/quran/33/53/tafsir/tabari))."
      ]
    },
    "classical": {
      "text": "Ibn Kathīr, author of the most widely read commentary on the Qurʾān, reads 33:53 as manners for every Muslim, “a proof for the prohibition of uninvited crashing of feasts”; “God is not ashamed of the truth” answers the Prophet’s shyness. For the ban on marrying his widows, commentators connect the rule to [33:6](/quran/33/6/tafsir/tabari) (“his wives are their mothers” in honour and in the prohibition of marriage, [Ibn Kathīr on 33:6](/quran/33/6/tafsir/ibn_kathir)), while on 33:53 Ibn Kathīr records the reports from Ibn ʿAbbās and al-Suddī about a man who intended to marry one of his wives after him (ʿĀʾishah, a later narrator adds; al-Suddī names the Companion Ṭalḥah in a report that goes no further back than al-Suddī, *maqṭūʿ*) ([Ibn Kathīr on 33:53](/quran/33/53/tafsir/ibn_kathir)). Bukhārī also ties the screen to ʿUmar’s request ([Bukhārī 4790](https://sunnah.com/bukhari:4790)); Ibn Ḥajar, author of *Fatḥ al-Bārī*, the standard commentary on Bukhārī, saw “no obstacle to several occasions” ([*Fatḥ al-Bārī*](https://www.islamweb.net/ar/library/content/52/8683/))."
    },
    "comparing": {
      "text": "What stands out in Anas’s report is both the immediate timing and what the single verse combines. On the night of Zaynab’s wedding, three guests lingered chatting while the Prophet walked out and back in, too shy to dismiss them; as soon as they left, he drew a curtain between himself and Anas, and [33:53](/quran/33/53/tafsir/tabari) came down ([Bukhārī 4793](https://sunnah.com/bukhari:4793), [5163](https://sunnah.com/bukhari:5163)). In the same breath, the verse (1) dismisses lingering guests from the Prophet’s rooms because “he is ashamed of you, but God is not ashamed of the truth”, (2) places his wives behind a curtain (*ḥijāb*), and (3) forbids anyone from ever marrying his widows after his death.\n\nIbn Kathīr’s general-manners reading rests on a separate verse for other people’s homes ([24:27](/quran/24/27/tafsir/tabari)) and on hadith ([Muslim 1429e](https://sunnah.com/muslim:1429e)); his own gloss of 33:53 is “a prohibition upon the believers from entering the houses of the Messenger of Allah (peace and blessings be upon him) without permission” ([Ibn Kathīr on 33:53](/quran/33/53/tafsir/ibn_kathir)). The witness, Anas, served inside the Prophet’s house for ten years ([Bukhārī 6038](https://sunnah.com/bukhari:6038)) and says: “I know (about) the Hijab (the order of veiling of women) more than anybody else” ([Bukhārī 5466](https://sunnah.com/bukhari:5466)). On the third clause — barring anyone from ever marrying his widows — the standard explanation appeals to [33:6](/quran/33/6/tafsir/tabari) (“his wives are their mothers”), which Ibn Kathīr explains meant honour, respect and the prohibition of remarriage rather than motherhood in other rules such as seclusion or marriage to their daughters ([on 33:6](/quran/33/6/tafsir/ibn_kathir)); on [33:53](/quran/33/53/tafsir/ibn_kathir) he records the reports from Ibn ʿAbbās and al-Suddī that the ban came down concerning a man who intended to marry one of his wives after him (ʿĀʾishah, a later narrator adds; al-Suddī names Ṭalḥah), “until the warning was revealed prohibiting that.”\n\nEither 33:53 is a timeless rule of hospitality for every home, as Ibn Kathīr frames it, though every command in the verse names the Prophet’s houses, screens his wives and bars marrying his widows. Or it was revealed on the wedding night to handle an awkward moment in his house and, in the same passage, bind his wives to him beyond his death: “Surely that is hurtful to the prophet, and he is ashamed of you, but God is not ashamed of the truth… It is not for you to hurt the messenger of God, nor to marry his wives after him – ever” ([33:53](/quran/33/53/tafsir/tabari))."
    },
    "stageLabels": {
      "1. The Cultural Context (Crashing Feasts)": "Ibn Kathīr on uninvited guests at a feast",
      "2. The Triggering Event: Zaynab's Wedding Feast": "Anas’s account of the wedding feast for Zaynab",
      "3. The Hidden Threat (Men Lingerers)": "Marrying his widows: a later report from al-Suddī"
    },
    "summaries": {},
    "crossLinks": [
      {
        "label": "ʿUmar’s request and the same verse (33:53)",
        "target": "Theme_07_Umar_Hijab"
      },
      {
        "label": "The marriage to Zaynab (33:37)",
        "target": "Theme_03_Zaynab_Marriage"
      }
    ],
    "quoteFixes": [],
    "refFixes": [],
    "sources": {
      "open": [
        1,
        2,
        0
      ]
    }
  },
  "Theme_07_Umar_Hijab": {
    "title": "ʿUmar’s Request, the Ḥijāb Verses and His “My Lord Agreed With Me in 3 Things”",
    "hook": "In Bukhārī, ʿUmar says “My Lord agreed with me in three things” (402) — including the ḥijāb verses (33:53, 33:59), revealed after he urged the Prophet to screen his wives and called out to the Prophet’s wife Sawdah at night (146). When Sawdah later complained back to the Prophet, revelation allowed the wives out (4795).",
    "takeaway": "Bukhārī records three revelations matching ʿUmar’s words and wishes (402), including the ḥijāb after he called out to Sawdah at night (146) — followed by a revelation allowing the wives out when Sawdah complained to the Prophet (4795).",
    "about": "In [Bukhārī 402](https://sunnah.com/bukhari:402) ʿUmar names three occasions where revelation came down matching what he had just proposed: taking Abraham’s station as a prayer place ([2:125](/quran/2/125/tafsir/tabari)), screening the Prophet’s wives ([33:53](/quran/33/53/tafsir/tabari)), and warning the wives in the very words ʿUmar had spoken to them ([66:5](/quran/66/5/tafsir/tabari)). Before the ḥijāb verses came down, ʿUmar called out to the Prophet’s wife Sawdah when she went out at night, “as he desired eagerly that the verses of Al-Hijab may be revealed”, and the verses came down ([Bukhārī 146](https://sunnah.com/bukhari:146)). In a second report ([Bukhārī 4795](https://sunnah.com/bukhari:4795)), when ʿUmar called out to Sawdah after the veil was obligatory and she complained to the Prophet at supper, revelation came on the spot allowing the wives to go out for their needs.",
    "provenance": {
      "pattern": "addresses",
      "verse": "33:53, 33:59",
      "occasion": [
        "Ṣaḥīḥ al-Bukhārī",
        "Ṣaḥīḥ Muslim",
        "Tafsīr al-Ṭabarī",
        "Tafsīr Ibn Kathīr"
      ],
      "extra": null
    },
    "showcase": {
      "archetype": "timeline",
      "caption": "From ʿUmar’s request to the verse",
      "points": [
        {
          "label": "ʿUmar’s request",
          "lines": [
            {
              "src": 12,
              "excerpt": "I wish you ordered your wives to cover themselves from the men because good and bad ones talk to them."
            }
          ]
        },
        {
          "label": "Sawdah goes out at night",
          "lines": [
            {
              "src": 7,
              "excerpt": "\"I have recognized you, O Sauda.\" He said so, as he desired eagerly that the verses of Al-Hijab (the observing of veils by the Muslim women) may be revealed."
            }
          ]
        },
        {
          "label": "The ḥijāb verses",
          "lines": [
            {
              "src": 7,
              "excerpt": "So Allah revealed the verses of \"Al-Hijab\""
            }
          ]
        },
        {
          "label": "ʿUmar’s three agreements",
          "lines": [
            {
              "src": 12,
              "excerpt": "My Lord agreed with me in three things"
            },
            {
              "src": 14,
              "excerpt": "My lord concorded with (my judgments) on three occasions."
            }
          ]
        }
      ],
      "note": [
        "When Sawdah complained to the Prophet after the ḥijāb rule, Bukhārī 4795 ends with a revelation answering her:",
        {
          "src": 8,
          "excerpt": "You (women) have been allowed to go out for your needs."
        }
      ]
    },
    "classical": {
      "text": "Classical scholars count the veil among ʿUmar’s agreements with revelation (*muwāfaqāt*), a mark of his spiritual insight, citing the Prophet’s words that if anyone in his community is inspired (*muḥaddath*), it is ʿUmar ([Bukhārī 3689](https://sunnah.com/bukhari:3689); [Muslim 2399a](https://sunnah.com/muslim:2399a)). Ibn Ḥajar reads the two Sawdah reports as two stages: ʿUmar pressed until the ḥijāb verse came, then pressed for more “and was refused”, and the wives were allowed out for their needs ([*Fatḥ al-Bārī*](https://www.islamweb.net/ar/library/content/52/8683/); [Bukhārī 4795](https://sunnah.com/bukhari:4795)). Ibn Kathīr writes: “what is well-known is that this occurred after the revelation of the Hijab” ([Ibn Kathīr on 33:53](/quran/33/53/tafsir/ibn_kathir)). For [33:59](/quran/33/59/tafsir/tabari) defenders point to its stated reason: “That is more appropriate for their being recognized and not hurt.”"
    },
    "comparing": {
      "text": "The classical *muwāfaqāt* answer — that ʿUmar was divinely inspired ([Bukhārī 3689](https://sunnah.com/bukhari:3689)) so his words anticipated God’s eternal decree — has to account for three details in Bukhārī’s reports, all narrated by ʿUmar himself or by ʿĀʾishah. First, in [Bukhārī 402](https://sunnah.com/bukhari:402) ʿUmar does not merely anticipate a topic: on the third occasion (66:5), he tells the wives, “It may be if he (the Prophet) divorced you, (all) that his Lord (Allah) will give him instead of you wives better than you,” and adds, “So this verse (the same as I had said) was revealed.” (In [Muslim 1479a](https://sunnah.com/muslim:1479a), ʿUmar also tells the Prophet, “if you have divorced them, verily Allah is with you, His angels, Gabriel, Mika'il, I and Abu Bakr and the believers are with you,” and says that [66:5](/quran/66/5/tafsir/tabari) and [66:4](/quran/66/4/tafsir/tabari) — “surely God – He is his Protector, and Gabriel (too), and the righteous among the believers, and beyond that the angels are (his) supporters” — came down matching the words he had uttered.) Second, when the Prophet did not act on ʿUmar’s request to veil his wives, ʿUmar called out to the Prophet’s wife Sawdah when she went out at night to relieve herself — “as he desired eagerly that the verses of Al-Hijab may be revealed. So Allah revealed the verses of Al-Hijab” ([Bukhārī 146](https://sunnah.com/bukhari:146)).\n\nThird, in [Bukhārī 4795](https://sunnah.com/bukhari:4795), after the veil was made obligatory, ʿUmar called out to Sawdah again when she went out to answer the call of nature; she returned and complained to the Prophet while he was eating supper, and revelation came on the spot — with the meat bone still in his hand — overruling ʿUmar: “You (women) have been allowed to go out for your needs.” Ibn Kathīr keeps a single night after the ḥijāb ([on 33:53](/quran/33/53/tafsir/ibn_kathir)), which sets aside Bukhārī 146’s statement that the verse came down because of that night; Ibn Ḥajar posits two separate nights ([*Fatḥ al-Bārī*](https://www.islamweb.net/ar/library/content/52/8683/)), though neither report mentions a second incident. (On [33:59](/quran/33/59/tafsir/tabari)’s “recognized and not hurt”, al-Ṭabarī, author of the early Qurʾān commentary, and Ibn Kathīr read it as distinguishing free women from slave-girls, a topic covered in the companion article on slavery.)\n\nEither ʿUmar’s personal lobbying — including calling out to the Prophet’s wife at night “as he desired eagerly that the verses of Al-Hijab may be revealed” — matched eternal revelation three times ([Bukhārī 402](https://sunnah.com/bukhari:402)), until Sawdah complained back to the Prophet and a new revelation overruled ʿUmar over supper ([Bukhārī 4795](https://sunnah.com/bukhari:4795)). Or the rulings in these household disputes followed the competing pressures of ʿUmar and the Prophet’s wives in real time. ʿĀʾishah on how the ḥijāb verse came down: “He said so, as he desired eagerly that the verses of Al-Hijab (the observing of veils by the Muslim women) may be revealed. So Allah revealed the verses of ‘Al-Hijab’” ([Bukhārī 146](https://sunnah.com/bukhari:146))."
    },
    "stageLabels": {
      "1. The Context (The Problem/Complaint)": "ʿUmar’s words about the wives, in the commentaries",
      "2. The Harassment of Women in the Streets": "Women out at night: two later reports on 33:59",
      "3. The Escalation (Umar Harasses Muhammad's Wife)": "ʿUmar calls out to Sawdah; 4795: the wives allowed out",
      "4. The Revelation (The Rule Established)": "The verse on outer cloaks (33:59)",
      "5. The Reaction (Umar Boasting)": "“My Lord agreed with me”: ʿUmar’s three matters",
      "The Aftermath: Violently Enforcing the Class Divide": "ʿUmar and a slave-girl’s head-veil (Ibn Abī Shaybah’s collection)"
    },
    "summaries": {},
    "crossLinks": [
      {
        "label": "The wedding guests and the same verse (33:53)",
        "target": "Theme_06_Etiquette_Interventions"
      },
      {
        "label": "66:1–5, where 66:5 matches ʿUmar’s words to the wives",
        "target": "Theme_04_Safe_Harbor_Oaths"
      }
    ],
    "quoteFixes": [
      {
        "src": 8,
        "field": "english",
        "find": "So `Umar bin Al-Khattab saw her",
        "replace": "Sauda (the wife of the Prophet) went out to answer the call of nature after it was made obligatory (for all the Muslims ladies) to observe the veil. She had a large frame and everybody who knew her before could recognize her. So `Umar bin Al-Khattab saw her",
        "reason": "factcheck T07 src[8] (context cut): restore the opening of Bukhārī 4795, which places the episode after the veil was made obligatory. Khan’s wording, verbatim.",
        "sourceUrl": "https://sunnah.com/bukhari:4795"
      },
      {
        "src": 8,
        "field": "english",
        "find": "so think of a way by which you should not be recognized on going out.\"",
        "replace": "so think of a way by which you should not be recognized on going out.\" Sauda returned while Allah's Messenger (ﷺ) was in my house taking his supper and a bone covered with meat was in his hand. She entered and said, \"O Allah's Messenger (ﷺ)! I went out to answer the call of nature and `Umar said to me so-and-so.\" Then Allah inspired him (the Prophet) and when the state of inspiration was over and the bone was still in his hand as he had not put in down, he said (to Sauda), \"You (women) have been allowed to go out for your needs.\"",
        "reason": "factcheck T07 src[8] and adv_ia #8: restore the ending of Bukhārī 4795 (the revelation “You (women) have been allowed to go out for your needs”). Khan’s wording, verbatim; only a closing quotation mark added.",
        "sourceUrl": "https://sunnah.com/bukhari:4795"
      },
      {
        "src": 12,
        "field": "english",
        "find": "\"My Lord agreed with me in three things... And as regards the (verse of) the veiling of the women, I said, 'O Allah's Messenger (ﷺ)! I wish you ordered your wives to cover themse...\"",
        "replace": "\"My Lord agreed with me in three things: -1. I said, \"O Allah's Messenger (ﷺ), I wish we took the station of Abraham as our praying place (for some of our prayers). So came the Divine Inspiration: And take you (people) the station of Abraham as a place of prayer (for some of your prayers e.g. two rak`at of Tawaf of Ka`ba)\". (2.125) -2. And as regards the (verse of) the veiling of the women, I said, 'O Allah's Messenger (ﷺ)! I wish you ordered your wives to cover themselves from the men because good and bad ones talk to them.' So the verse of the veiling of the women was revealed. -3. Once the wives of the Prophet (ﷺ) made a united front against the Prophet (ﷺ) and I said to them, 'It may be if he (the Prophet) divorced you, (all) that his Lord (Allah) will give him instead of you wives better than you.' So this verse (the same as I had said) was revealed\"",
        "reason": "factcheck T07 src[12] (misquote, truncated mid-word “cover themse…”): restore the full text of Bukhārī 402, including the third agreement that the comparing panel quotes. Khan’s wording, verbatim.",
        "sourceUrl": "https://sunnah.com/bukhari:402"
      },
      {
        "src": 15,
        "field": "english",
        "find": " covering her head (with a Jilbab/Hijab), so",
        "replace": " covering her head, so",
        "reason": "factcheck T07 src[15] (interpolation): “(with a Jilbab/Hijab)” is not in the Arabic; muqanniʿa means wearing a head-cover (qināʿ).",
        "sourceUrl": "https://books.islam-db.com/book/%D8%A7%D8%B1%D9%88%D8%A7%D8%A1_%D8%A7%D9%84%D8%BA%D9%84%D9%8A%D9%84_%D9%81%D9%8A_%D8%AA%D8%AE%D8%B1%D9%8A%D8%AC_%D8%A7%D8%AD%D8%A7%D8%AF%D9%8A%D8%AB_%D9%85%D9%86%D8%A7%D8%B1_%D8%A7%D9%84%D8%B3%D8%A8%D9%8A%D9%84/2552"
      },
      {
        "src": 15,
        "field": "arabic",
        "find": "أَمَةً ",
        "replace": "أَمَةً لَنَا ",
        "reason": "factcheck T07 src[15]: the dataset Arabic drops «لنا» (“of ours”, i.e. of Anas’s household); al-Albānī, Irwāʾ al-Ghalīl no. 1796, quotes the Muṣannaf (2/28/1) as «رأى عمر أمة لنا مقنعة، فضربها وقال: لا تشبهين بالحرائر» and grades the chain «وهذا إسناد صحيح».",
        "sourceUrl": "https://books.islam-db.com/book/%D8%A7%D8%B1%D9%88%D8%A7%D8%A1_%D8%A7%D9%84%D8%BA%D9%84%D9%8A%D9%84_%D9%81%D9%8A_%D8%AA%D8%AE%D8%B1%D9%8A%D8%AC_%D8%A7%D8%AD%D8%A7%D8%AF%D9%8A%D8%AB_%D9%85%D9%86%D8%A7%D8%B1_%D8%A7%D9%84%D8%B3%D8%A8%D9%8A%D9%84/2552"
      }
    ],
    "refFixes": [
      {
        "src": 15,
        "primary": [
          {
            "label": "Muṣannaf Ibn Abī Shaybah, in al-Albānī, Irwāʾ al-Ghalīl 1796",
            "href": "https://books.islam-db.com/book/%D8%A7%D8%B1%D9%88%D8%A7%D8%A1_%D8%A7%D9%84%D8%BA%D9%84%D9%8A%D9%84_%D9%81%D9%8A_%D8%AA%D8%AE%D8%B1%D9%8A%D8%AC_%D8%A7%D8%AD%D8%A7%D8%AF%D9%8A%D8%AB_%D9%85%D9%86%D8%A7%D8%B1_%D8%A7%D9%84%D8%B3%D8%A8%D9%8A%D9%84/2552"
          }
        ],
        "secondary": [],
        "reason": "factcheck T07 src[15] link fix: replaces the IslamQA 8489 link (which does not quote the athar). Verified page: al-Albānī quotes the Muṣannaf report with its chain (Wakīʿ ← Shuʿbah ← Qatādah ← Anas) and grades it «وهذا إسناد صحيح».",
        "sourceUrl": "https://books.islam-db.com/book/%D8%A7%D8%B1%D9%88%D8%A7%D8%A1_%D8%A7%D9%84%D8%BA%D9%84%D9%8A%D9%84_%D9%81%D9%8A_%D8%AA%D8%AE%D8%B1%D9%8A%D8%AC_%D8%A7%D8%AD%D8%A7%D8%AF%D9%8A%D8%AB_%D9%85%D9%86%D8%A7%D8%B1_%D8%A7%D9%84%D8%B3%D8%A8%D9%8A%D9%84/2552"
      },
      {
        "src": 10,
        "primary": [
          {
            "label": "Ṣaḥīḥ Muslim 2170d",
            "href": "https://sunnah.com/muslim:2170d"
          }
        ],
        "secondary": [],
        "reason": "factcheck T07 src[10]: the quoted text is 2170d; 2170e is “narrated… with the same chain”.",
        "sourceUrl": "https://sunnah.com/muslim:2170d"
      },
      {
        "src": 1,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 33:53",
            "href": "/quran/33/53/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Bukhārī 4790 (same words)",
            "href": "https://sunnah.com/bukhari:4790"
          }
        ],
        "reason": "factcheck T07 src[1]: the same words of ʿUmar are in Bukhārī 4790; also removes the nested-anchor reference format.",
        "sourceUrl": "https://sunnah.com/bukhari:4790"
      }
    ],
    "sources": {
      "open": [
        12,
        7,
        8,
        11
      ],
      "nested": {
        "7": {
          "items": [
            10,
            5,
            6,
            9
          ],
          "label": "{n} more reports of the same episode"
        },
        "12": {
          "items": [
            13,
            14
          ],
          "label": "{n} parallel reports of ʿUmar’s words"
        }
      }
    }
  },
  "Theme_08_Aisha_Ifk": {
    "title": "The Accusation Against ʿĀʾishah and Hilāl’s Case: 2 Rules in Sūrat al-Nūr, 24:4 and 24:6–9",
    "hook": "Defenders cite the month without revelation before 24:11–20 cleared ʿĀʾishah (Bukhārī 4750) as proof that verses did not come on request. In the same chapter, when 24:4 required four witnesses and the Companion Hilāl ibn Umayyah, a veteran of Badr, protested that a husband cannot go seek four witnesses, Gabriel came down in that sitting with 24:6–9, four oaths for husbands (Bukhārī 4747).",
    "takeaway": "In Sūrat al-Nūr, revelation waited a month before clearing ʿĀʾishah (24:11–20) and came in the same sitting when Hilāl protested the four-witness rule (24:6–9); timing by itself does not settle the question either way.",
    "about": "When ʿĀʾishah was accused, revelation waited a month while the Prophet consulted ʿAlī and Usāmah, Zayd’s son; then [24:11–20](/quran/24/11/tafsir/tabari) cleared her and faulted the accusers for bringing no four witnesses (24:13; [24:4](/quran/24/4/tafsir/tabari) sets eighty lashes, and [Abū Dāwūd 4474](https://sunnah.com/abudawud:4474), graded *ḥasan*, good, says three were flogged). When Hilāl ibn Umayyah, a veteran of Badr ([Bukhārī 4418](https://sunnah.com/bukhari:4418)), protested that a husband could not bring four witnesses, [24:6–9](/quran/24/6/tafsir/tabari) came at once ([Bukhārī 4747](https://sunnah.com/bukhari:4747)): four oaths, the oath of mutual cursing (*liʿān*).",
    "provenance": {
      "pattern": "scope",
      "verse": "24:4, 24:6–9",
      "occasion": [
        "Ṣaḥīḥ al-Bukhārī",
        "Ṣaḥīḥ Muslim",
        "Sunan Abī Dāwūd",
        "Tafsīr al-Ṭabarī"
      ],
      "extra": null
    },
    "showcase": {
      "archetype": "confrontation",
      "caption": "Two rules side by side",
      "sides": [
        {
          "label": "ʿĀʾishah’s case, and anyone who accuses (24:4)",
          "lines": [
            {
              "src": 2,
              "pre": "Before 24:11–20 (the report of the slander):",
              "excerpt": "Then the Messenger of Allah called 'Ali bin Abi Talib and Usamah bin Zayd to consult them about divorcing his wife, as the divine revelation had been delayed."
            },
            {
              "src": 3,
              "excerpt": "Those who hurl (accusations) against women of reputation, (and) then do not bring four witnesses, flog them eighty lashes"
            },
            {
              "src": 4,
              "pre": "al-Ṭabarī:",
              "excerpt": "it was mentioned that this verse was indeed revealed regarding those who accused 'A'ishah"
            }
          ]
        },
        {
          "label": "Hilāl’s case, and a husband who accuses (24:6–9)",
          "lines": [
            {
              "src": 9,
              "pre": "Qurʾān 24:6:",
              "excerpt": "Those who hurl (accusations) against their wives, and have no witnesses except themselves, the testimony of such a person shall be to bear witness four times ‘by God,’ that he is indeed one of the truthful"
            }
          ]
        }
      ],
      "quote": {
        "label": "Hilāl ibn Umayyah, before 24:6–9 (Bukhārī 4747)",
        "lines": [
          {
            "src": 8,
            "excerpt": "If anyone of us saw a man over his wife, would he go to seek after witnesses?"
          },
          {
            "src": 9,
            "excerpt": "I am telling the truth and Allah will reveal to you what will save my back from legal punishment."
          },
          {
            "src": 9,
            "excerpt": "Then Gabriel came down and revealed to him"
          }
        ]
      },
      "note": "Of ʿĀʾishah’s case, Bukhārī 4750 says the Prophet “had stayed a month without receiving any Divine Inspiration concerning my case”."
    },
    "classical": {
      "text": "Ibn al-Qayyim, in his book on the Prophet’s life and guidance, says “revelation was withheld from the Messenger for a month” in her case so that the trial would be complete: sincere believers would grow in faith, and the hypocrites’ hidden thoughts would come to light ([*Zād al-Maʿād*, vol. 3](https://www.islamweb.net/ar/library/content/127/501/)). Al-Ṭabarī reads 24:4 as protecting chaste women in general ([al-Ṭabarī on 24:4](/quran/24/4/tafsir/tabari)), and jurists require four male eyewitnesses to the act itself. Ibn Kathīr calls the oath of mutual cursing (*liʿān*) “a relief for husbands and an additional way out” ([Ibn Kathīr on 24:6](/quran/24/6/tafsir/ibn_kathir))."
    },
    "comparing": {
      "text": "A common defence takes the month without revelation before ʿĀʾishah was cleared ([Bukhārī 4750](https://sunnah.com/bukhari:4750)) as proof that revelation did not come on request. In the same sūrah, Hilāl’s case — narrated by Ibn ʿAbbās, for whom the Prophet prayed, “O Allah! Bestow on him the knowledge of the Book” ([Bukhārī 75](https://sunnah.com/bukhari:75)) — runs the other way: when the Prophet repeated the four-witness rule, Hilāl protested that a husband cannot go seek four witnesses and predicted that a verse would save his back from the eighty lashes, and Gabriel came down in that sitting with [24:6–9](/quran/24/6/tafsir/tabari) ([Bukhārī 4747](https://sunnah.com/bukhari:4747)).\n\nIbn al-Qayyim’s explanation of the month-long wait — that revelation was held back so the trial would be complete ([*Zād al-Maʿād*, vol. 3](https://www.islamweb.net/ar/library/content/127/501/)) — is a theological reflection rather than a reason stated in any report. Meanwhile, the four-witness rule in [24:4](/quran/24/4/tafsir/tabari) and [24:13](/quran/24/13/tafsir/tabari) was enforced against ʿĀʾishah’s accusers, who were flogged ([Abū Dāwūd 4474](https://sunnah.com/abudawud:4474), graded *ḥasan*, good), whereas a husband who accuses his wife without witnesses was granted the four-oath rule of *liʿān*, which Ibn Kathīr calls “a relief for husbands” ([on 24:6](/quran/24/6/tafsir/ibn_kathir)).\n\nEither the timing of revelation is evidence, in which case the verse that came down in the same sitting for Hilāl counts alongside the verse that waited a month for ʿĀʾishah. Or timing proves nothing either way, and the month-long wait does not show that revelation was independent of the pressures around it. Hilāl: “I am telling the truth and Allah will reveal to you what will save my back from legal punishment.” Then “Gabriel came down and revealed to him” ([Bukhārī 4747](https://sunnah.com/bukhari:4747))."
    },
    "stageLabels": {
      "1. Missing the Caravan & Being Found by Safwan": "The lost necklace, and Ṣafwān bringing her back (the report of the slander)",
      "2. The Rumors Spread Across Medina": "The rumours in Medina",
      "3. A Month of Silence and Political Crisis": "A month without revelation; the Prophet consults",
      "4. The Divine Firewall: The 4-Witness Rule": "Four witnesses for any accuser (24:4)",
      "5. The Revelation of Aisha's Innocence": "The verses clearing ʿĀʾishah (24:11–20)",
      "6. Weaponizing the Rule (The Floggings)": "The accusers flogged (Abū Dāwūd 4474)",
      "7. Forcing Political Unity": "Abū Bakr’s oath about Misṭaḥ, a relative among the accusers, and 24:22",
      "8. The Aftermath: Husbands Trap and Rebel (The Impossible Rule)": "Hilāl’s case: “would he go to seek after witnesses?”",
      "9. The Immediate Divine Patch: The Husband's Loophole": "The verses for husbands: four oaths (24:6–9)"
    },
    "summaries": {},
    "sources": {
      "open": [
        2,
        3,
        4,
        8,
        9
      ],
      "collapsed": [
        0,
        1,
        5,
        6,
        7
      ]
    },
    "crossLinks": [
      {
        "label": "Another oath settled by a verse: 66:1–2 and the Prophet’s oath",
        "target": "Theme_04_Safe_Harbor_Oaths"
      }
    ],
    "quoteFixes": [
      {
        "src": 6,
        "field": "english",
        "find": "\"When my excuse was revealed, the Messenger of Allah, peace and blessings of Allah be upon him, stood on the pulpit and mentioned that, and recited the Quran. When he came down from the pulpit, he commanded regarding two men and a woman (who had slandered me), and they were given the prescribed punishment (of eighty lashes).\"",
        "replace": "\"When my vindication came down, the Prophet (ﷺ) mounted the pulpit and mentioned that, and recited the Qur'an. Then when he came down from the pulpit he ordered regarding the two men and the woman, and they were given the prescribed punishment.\"",
        "reason": "factcheck T08 src[6]: \"(who had slandered me)\" and \"(of eighty lashes)\" are added glosses; replaced with Sunnah.com's English, verbatim.",
        "sourceUrl": "https://sunnah.com/abudawud:4474"
      },
      {
        "src": 9,
        "field": "english",
        "find": "Then Gabriel came down and revealed to him: 'And those who accuse their wives but have no witnesses except themselves, let the testimony of one of them be four testimonies (swearing) by Allah that he is of those who speak the truth...' (Quran 24:6-9).",
        "replace": "Then Gabriel came down and revealed to him:-- 'As for those who accuse their wives...' (24.6-9) The Prophet (ﷺ) recited it till he reached: '... (her accuser) is telling the truth.' {Those who hurl (accusations) against their wives, and have no witnesses except themselves, the testimony of such a person shall be to bear witness four times ‘by God,’ that he is indeed one of the truthful, and the fifth time, that the curse of God (be) upon him if he is one of the liars.}",
        "reason": "factcheck T08 src[9]: Khan's text has only \"'As for those who accuse their wives...' (24.6-9)\"; the full verse wording was supplied inside the quotation. Restored to Sunnah.com's English, then (adv COPY-A-R1 #2) the compound reference's Qurʾān part given separately in braces, Droge 24:6–7 verbatim, so the card still shows the four-oath rule.",
        "sourceUrl": "https://sunnah.com/bukhari:4747"
      },
      {
        "src": 3,
        "field": "english",
        "find": "{And those who accuse chaste women, and then do not produce four witnesses, flog them with eighty stripes, and reject their testimony forever; and these! they are the rebellious.}",
        "replace": "{Those who hurl (accusations) against women of reputation, (and) then do not bring four witnesses, flog them eighty lashes, and do not accept their testimony ever (again). Those – they are the wicked,}",
        "reason": "factcheck T08 src[3]: \"The translation is unattributed (not Droge) … Use Droge.\" Also lets the showcase set 24:4 and 24:6 in the same translation.",
        "sourceUrl": "/quran/24/4/tafsir/tabari"
      }
    ],
    "refFixes": [
      {
        "src": 0,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 24:11 (the Ifk report)",
            "href": "/quran/24/11/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Same report: Ṣaḥīḥ al-Bukhārī 4750",
            "href": "https://sunnah.com/bukhari:4750"
          },
          {
            "label": "Ṣaḥīḥ Muslim 2770a",
            "href": "https://sunnah.com/muslim:2770a"
          }
        ],
        "reason": "factcheck link fixes / adv_ia #7: cite the Ṣaḥīḥayn for the Ifk hadith; keep al-Ṭabarī (whose wording is quoted) as the primary label.",
        "sourceUrl": "https://sunnah.com/bukhari:4750"
      },
      {
        "src": 1,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 24:11 (the Ifk report)",
            "href": "/quran/24/11/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Same report: Ṣaḥīḥ al-Bukhārī 4750",
            "href": "https://sunnah.com/bukhari:4750"
          },
          {
            "label": "Ṣaḥīḥ Muslim 2770a",
            "href": "https://sunnah.com/muslim:2770a"
          }
        ],
        "reason": "factcheck link fixes / adv_ia #7: cite the Ṣaḥīḥayn for the Ifk hadith; keep al-Ṭabarī (whose wording is quoted) as the primary label.",
        "sourceUrl": "https://sunnah.com/bukhari:4750"
      },
      {
        "src": 2,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 24:11 (the Ifk report)",
            "href": "/quran/24/11/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Same report: Ṣaḥīḥ al-Bukhārī 4750",
            "href": "https://sunnah.com/bukhari:4750"
          },
          {
            "label": "Ṣaḥīḥ Muslim 2770a",
            "href": "https://sunnah.com/muslim:2770a"
          }
        ],
        "reason": "factcheck link fixes / adv_ia #7: cite the Ṣaḥīḥayn for the Ifk hadith; keep al-Ṭabarī (whose wording is quoted) as the primary label.",
        "sourceUrl": "https://sunnah.com/bukhari:4750"
      },
      {
        "src": 5,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 24:11 (the Ifk report)",
            "href": "/quran/24/11/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Same report: Ṣaḥīḥ al-Bukhārī 4750",
            "href": "https://sunnah.com/bukhari:4750"
          },
          {
            "label": "Ṣaḥīḥ Muslim 2770a",
            "href": "https://sunnah.com/muslim:2770a"
          }
        ],
        "reason": "factcheck link fixes / adv_ia #7: cite the Ṣaḥīḥayn for the Ifk hadith; keep al-Ṭabarī (whose wording is quoted) as the primary label.",
        "sourceUrl": "https://sunnah.com/bukhari:4750"
      },
      {
        "src": 7,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 24:11 (the Ifk report)",
            "href": "/quran/24/11/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Same report: Ṣaḥīḥ al-Bukhārī 4750",
            "href": "https://sunnah.com/bukhari:4750"
          },
          {
            "label": "Ṣaḥīḥ Muslim 2770a",
            "href": "https://sunnah.com/muslim:2770a"
          }
        ],
        "reason": "factcheck link fixes / adv_ia #7: cite the Ṣaḥīḥayn for the Ifk hadith; keep al-Ṭabarī (whose wording is quoted) as the primary label.",
        "sourceUrl": "https://sunnah.com/bukhari:4750"
      },
      {
        "src": 9,
        "primary": [
          {
            "label": "Ṣaḥīḥ al-Bukhārī 4747",
            "href": "https://sunnah.com/bukhari:4747"
          },
          {
            "label": "Qurʾān 24:6–9",
            "href": "/quran/24/6/tafsir/tabari"
          }
        ],
        "secondary": [],
        "reason": "factcheck link fixes: compound ref; the range displayed as \"24:6\".",
        "sourceUrl": "https://sunnah.com/bukhari:4747"
      },
      {
        "src": 4,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 24:4",
            "href": "/quran/24/4/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Arabic text (KSU)",
            "href": "https://quran.ksu.edu.sa/tafseer/tabary/sura24-aya4.html"
          }
        ],
        "reason": "Machine-translated local English: add the Arabic source.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura24-aya4.html"
      }
    ]
  },
  "Theme_09_Fasting_Relaxations": {
    "title": "2:187 Eased Ramadan Nights for All After One Companion Fainted and Others Broke the Rule",
    "hook": "Included as a control case where the sound reports support the classical answer: critics sometimes cite a weak report in al-Ṭabarī naming ʿUmar, whereas Bukhārī ties 2:187 to a fasting labourer, Qays ibn Ṣirmah, who fainted after a day’s work (1915), easing Ramadan nights for the whole community.",
    "takeaway": "Here Bukhārī and the classical explanation agree: 2:187 eased the fast for the whole community after a labourer fainted (1915), while the report naming ʿUmar has a weak chain.",
    "about": "Under the earlier custom, a fasting Companion who slept before eating could not eat until the next sunset ([Bukhārī 1915](https://sunnah.com/bukhari:1915)); the Companion al-Barāʾ ibn ʿĀzib adds that people kept from their wives the whole month ([Bukhārī 4508](https://sunnah.com/bukhari:4508)). Bukhārī 1915 links the change to Qays ibn Ṣirmah, who fainted after a day’s work; 4508 to men who broke the rule; a weaker report in al-Ṭabarī names ʿUmar. [2:187](/quran/2/187/tafsir/tabari) lifts the rule for everyone.",
    "provenance": {
      "pattern": "scope",
      "verse": "2:187",
      "occasion": [
        "Ṣaḥīḥ al-Bukhārī",
        "Tafsīr al-Ṭabarī"
      ],
      "extra": null
    },
    "showcase": {
      "archetype": "timeline",
      "caption": "What happened, what was revealed",
      "points": [
        {
          "label": "The earlier custom",
          "lines": [
            {
              "src": 0,
              "excerpt": "if any of them was fasting and the food was presented (for breaking his fast), but he slept before eating, he would not eat that night and the following day till sunset"
            }
          ]
        },
        {
          "label": "Qays ibn Ṣirmah faints",
          "lines": [
            {
              "src": 0,
              "excerpt": "He used to do hard work during the day, so he was overwhelmed by sleep and slept."
            },
            {
              "src": 0,
              "excerpt": "he fainted and the Prophet (ﷺ) was informed about the whole matter"
            }
          ]
        },
        {
          "label": "ʿUmar, in a weaker report",
          "lines": [
            {
              "src": 1,
              "excerpt": "Do you find any concession for me, O Messenger of God?"
            },
            {
              "src": 1,
              "excerpt": "You were not worthy of that, O 'Umar."
            }
          ]
        },
        {
          "label": "The verse, to all",
          "lines": [
            {
              "src": 2,
              "excerpt": "God knows that you have been betraying yourselves (in this regard), and has turned to you (in forgiveness) and pardoned you. So now have relations with them"
            }
          ]
        },
        {
          "label": "The reaction",
          "lines": [
            {
              "src": 3,
              "excerpt": "So, they were overjoyed by it."
            }
          ]
        }
      ],
      "note": null
    },
    "classical": {
      "text": "Al-Ṭabarī and Ibn Kathīr explain 2:187 as an earlier rule — no food or relations after sleeping — lifted for everyone as an ease and a mercy ([al-Ṭabarī on 2:187](/quran/2/187/tafsir/tabari), [Ibn Kathīr](/quran/2/187/tafsir/ibn_kathir)). Commentators count it among the rulings revealed in stages: a concession (*rukhṣah*) for the whole community, not a ruling for one person. In al-Ṭabarī’s report about ʿUmar, which comes through a weak chain of narrators, the Prophet answers him, “You were not worthy of that, O ʿUmar.”"
    },
    "comparing": {
      "text": "Here the classical reading and Bukhārī agree: the concession was general, and its trigger in Bukhārī was a labourer. Qays “used to do hard work during the day”, and the next midday “he fainted and the Prophet (ﷺ) was informed about the whole matter” ([Bukhārī 1915](https://sunnah.com/bukhari:1915)). The Companion al-Barāʾ ibn ʿĀzib adds that “some men cheated themselves (by violating that restriction)” ([Bukhārī 4508](https://sunnah.com/bukhari:4508)). The report naming ʿUmar has a weak chain, and in it the Prophet rebukes him; we include this item as a control case where checking the chains and primary texts supports the classical explanation. The verse addresses everyone: “God knows that you have been betraying yourselves (in this regard), and has turned to you (in forgiveness) and pardoned you. So now have relations with them” ([2:187](/quran/2/187/tafsir/tabari))."
    },
    "stageLabels": {
      "1. The Context (The Harsh Original Rule)": "The earlier custom, and Qays ibn Ṣirmah (Bukhārī 1915)",
      "2. The Incident (Companions Breaking the Rule)": "ʿUmar in al-Ṭabarī’s report (weak chain)",
      "3. The Revelation (Rules Relaxed)": "The verse for the whole community (2:187)",
      "4. The Reaction (Joy at the Concession)": "The Companions’ joy (Bukhārī 1915)"
    },
    "summaries": {},
    "sources": {
      "open": [
        0,
        2,
        3
      ],
      "collapsed": [
        1
      ]
    },
    "crossLinks": [],
    "quoteFixes": [
      {
        "src": 0,
        "field": "english",
        "find": "he would not eat that night and the following day till sunset.",
        "replace": "he would not eat that night and the following day till sunset. Qais bin Sirma-al-Ansari was fasting and came to his wife at the time of Iftar (breaking one's fast) and asked her whether she had anything to eat. She replied, \"No, but I would go and bring some for you.\" He used to do hard work during the day, so he was overwhelmed by sleep and slept. When his wife came and saw him, she said, \"Disappointment for you.\" When it was midday on the following day, he fainted and the Prophet (ﷺ) was informed about the whole matter and the following verses were revealed: \"You are permitted To go to your wives (for sexual relation) At the night of fasting.\"",
        "reason": "factcheck T09 src[0] / adv_ia #7: the entry omits who triggered the change in this hadith (Qays b. Ṣirmah); restored verbatim from Sunnah.com's English, up to the sentence that src[3] continues.",
        "sourceUrl": "https://sunnah.com/bukhari:1915"
      },
      {
        "src": 1,
        "field": "english",
        "find": "Do you find any concession for me, O Messenger of God?",
        "replace": "Do you find any concession for me, O Messenger of God? He said: \"You were not worthy of that, O 'Umar.\"",
        "reason": "factcheck T09 src[1]: the Prophet's reply «لم تكن حقيقا بذلك يا عمر» is cut (verified in tafsir_tabari_arabic.json 2:187); restored with the factcheck's translation.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura2-aya187.html"
      }
    ],
    "refFixes": [
      {
        "src": 1,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 2:187 (al-ʿAwfī chain)",
            "href": "/quran/2/187/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Arabic text (KSU)",
            "href": "https://quran.ksu.edu.sa/tafseer/tabary/sura2-aya187.html"
          }
        ],
        "reason": "factcheck T09 src[1]: weak al-ʿAwfī chain; machine-translated local English.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura2-aya187.html"
      },
      {
        "src": 0,
        "primary": [
          {
            "label": "Ṣaḥīḥ al-Bukhārī 1915",
            "href": "https://sunnah.com/bukhari:1915"
          }
        ],
        "secondary": [
          {
            "label": "Ṣaḥīḥ al-Bukhārī 4508",
            "href": "https://sunnah.com/bukhari:4508"
          }
        ],
        "reason": "factcheck T09: cite Bukhārī 4508 (\"some men cheated themselves\").",
        "sourceUrl": "https://sunnah.com/bukhari:4508"
      }
    ]
  },
  "Theme_10_War_Booty_and_Fay": {
    "title": "8:1, 8:41 and 59:6–7: How Much of the Spoils 3 Verses Place With the Messenger",
    "hook": "Included as a second control case where the sound reports support the classical answer: 8:1, 8:41 and 59:6–7 place the administration of spoils and uncontested property (*fayʾ*) with the Messenger, and the reports in Bukhārī and Abū Dāwūd confirm that he distributed Badr’s spoils equally and spent the rest on his family’s yearly upkeep and on arms and horses for the community.",
    "takeaway": "Here the primary reports and the classical answer agree: 8:1, 8:41 and 59:6–7 placed the administration of spoils and *fayʾ* in the Messenger’s hands, and Bukhārī and Abū Dāwūd record that he distributed Badr’s spoils equally and spent the rest on family upkeep, arms and horses.",
    "about": "After Badr the fighters disagreed over the spoils, and 8:1 answered: “The spoils (belong) to God and the messenger.” 8:41 then set aside a fifth “to God and to the messenger, and to family, and the orphans, and the poor, and the traveler”. Property taken without fighting (*fayʾ*), such as that of Banū al-Naḍīr, went to the messenger to administer ([59:6–7](/quran/59/6/tafsir/tabari); [Bukhārī 2904](https://sunnah.com/bukhari:2904)).",
    "provenance": {
      "pattern": "addresses",
      "verse": "8:1, 8:41, 59:6–7",
      "occasion": [
        "Tafsīr al-Ṭabarī",
        "Ṣaḥīḥ al-Bukhārī"
      ],
      "extra": null
    },
    "showcase": {
      "archetype": "number_fan",
      "caption": "Shares of the spoils in 3 verses",
      "unit": "How much of the spoils each text places with the Messenger",
      "values": [
        {
          "value": "All",
          "label": "8:1 (Badr)",
          "pre": "Badr spoils, in the report of the Prophet’s cousin Ibn ʿAbbās:",
          "src": 2,
          "excerpt": "Al-Anfal are the spoils of war that were exclusively for the Messenger of Allah, peace be upon him; no one else had any share of it"
        },
        {
          "value": "⅕",
          "label": "8:41 (the fifth)",
          "pre": "The fifth (khums) of battle spoils:",
          "src": 3,
          "excerpt": "a fifth of it (belongs) to God and to the messenger, and to family, and the orphans, and the poor, and the traveler"
        },
        {
          "value": "All",
          "label": "59:6 (no fighting)",
          "pre": "Property of Banū al-Naḍīr, taken without fighting (fayʾ):",
          "src": 7,
          "excerpt": "The properties therefore, belonged especially to Allah's Messenger (ﷺ)"
        }
      ],
      "note": [
        "59:7 gives the reason for naming who receives such property:",
        {
          "src": 5,
          "excerpt": "so that it does not (just) circulate among the wealthy of you"
        },
        "ʿUmar adds that the Prophet",
        {
          "src": 7,
          "excerpt": "used to give his family their yearly expenditure and spend what remained thereof on arms and horses"
        }
      ]
    },
    "classical": {
      "text": "Al-Ṭabarī reads the spoils (*anfāl*) of 8:1 as the leader’s bonuses and rejects the view that 8:41 abrogated it: “there is no evidence in the verse that its ruling is abrogated” ([al-Ṭabarī on 8:1](/quran/8/1/tafsir/tabari)). Ibn Kathīr cites ʿUbādah ibn al-Ṣāmit, who fought at Badr: the Messenger “divided it among the Muslims equally” ([Ibn Kathīr on 8:1](/quran/8/1/tafsir/ibn_kathir)); Saʿd ibn Abī Waqqāṣ, whom the Prophet told “Let my father and mother be sacrificed for you” ([Bukhārī 4059](https://sunnah.com/bukhari:4059)), was given the sword ([Abū Dāwūd 2740](https://sunnah.com/abudawud:2740)). Defenders cite 59:7, which names who receives such property (*fayʾ*) “so that it does not (just) circulate among the wealthy of you”."
    },
    "comparing": {
      "text": "Included as the second control case alongside 2:187 (Item 6), this item is one where checking the primary reports supports the classical answer. While 8:1, 8:41 and 59:6 place legal discretion over battle spoils and uncontested property (*fayʾ*) in the Messenger’s hands — which al-Ṭabarī glosses on 59:6 as “his specifically; he acts on it as he sees fit” ([al-Ṭabarī on 59:6](/quran/59/6/tafsir/tabari)) — the historical reports agree that the wealth went back out to the community. ʿUbādah ibn al-Ṣāmit says “the Messenger of Allah divided it equally among Muslims” ([Ibn Kathīr on 8:1](/quran/8/1/tafsir/ibn_kathir)), and Saʿd ibn Abī Waqqāṣ, refused the sword at first, was given it after 8:1 came down ([Abū Dāwūd 2740](https://sunnah.com/abudawud:2740), graded *ḥasan ṣaḥīḥ*). For Banū al-Naḍīr, ʿUmar records how the Prophet used the property: a year’s provision for his family, and the rest on arms and horses in God’s cause ([Bukhārī 2904](https://sunnah.com/bukhari:2904); [5357](https://sunnah.com/bukhari:5357)), matching 59:7’s stated purpose “so that it does not (just) circulate among the wealthy of you”.\n\nIn the additional sources drawer below, one report in [al-Ṭabarī on 59:6](/quran/59/6/tafsir/tabari) says that when the Prophet took possession of those lands, “some people said: ‘Will he not divide it?’ So God, Mighty and Majestic, revealed his excuse” ([59:6–7](/quran/59/6/tafsir/tabari)); that report comes through the weak family chain of al-ʿAwfī from Ibn ʿAbbās, and on its own terms the question of how the property was used is settled by the eyewitness record in Bukhārī. ʿUmar administered this property as caliph, and in [Bukhārī 3094](https://sunnah.com/bukhari:3094) he sets out its history before ʿUthmān, ʿAlī, the Prophet’s uncle al-ʿAbbās and three other senior Companions, who confirm it.\n\nHere the classical explanation and the primary texts agree: the verses placed public administration of the spoils and *fayʾ* with the Messenger as head of the community, and the reports in Bukhārī and Abū Dāwūd record that he distributed them rather than enriching himself. ʿUmar: “So this property was especially given to Allah's Messenger (ﷺ), but, by Allah, neither did he take possession of it and leave you, nor did he favor himself with it to your exclusion, but he gave it to all of you and distributed it amongst you till this property remained out of it” ([Bukhārī 3094](https://sunnah.com/bukhari:3094))."
    },
    "stageLabels": {
      "1. The Dispute at Badr": "The dispute over a sword at Badr (a later report)",
      "2. Quran 8:1 Grants It All to Allah & Messenger": "The verse on the spoils (8:1) and the Prophet’s cousin Ibn ʿAbbās",
      "3. The Later Distribution Rule (Quran 8:41)": "The rule of the fifth (8:41) and the early jurist ʿAṭāʾ",
      "4. The Bloodless Conquest and the Fay (Quran 59:6-7)": "Property taken without fighting (59:6–7)",
      "5. Umar Confirms Total Financial Control of the Fay": "ʿUmar on Banū al-Naḍīr’s property"
    },
    "summaries": {},
    "crossLinks": [
      {
        "label": "Captives as spoils in 33:50",
        "target": "Theme_11_Slavery_and_Wealth"
      }
    ],
    "quoteFixes": [],
    "refFixes": [
      {
        "src": 0,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 8:1",
            "href": "/quran/8/1/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Abū Dāwūd 2740 (Saʿd’s own account)",
            "href": "https://sunnah.com/abudawud:2740"
          },
          {
            "label": "Muslim 1748a",
            "href": "https://sunnah.com/muslim:1748a"
          }
        ],
        "reason": "factcheck T10 src[0]: the report is al-Suddī’s (maqṭūʿ); Saʿd’s own account, in which the Prophet then gives him the sword, is Abū Dāwūd 2740 (al-Albānī: ḥasan ṣaḥīḥ) and Muslim 1748.",
        "sourceUrl": "https://sunnah.com/abudawud:2740"
      },
      {
        "src": 5,
        "primary": [
          {
            "label": "Qurʾān 59:6–7",
            "href": "/quran/59/6/tafsir/tabari"
          }
        ],
        "secondary": [],
        "reason": "factcheck link fixes: the old link engine displayed “Quran 59:6”; the text is 59:6–7.",
        "sourceUrl": "/quran/59/6/tafsir/tabari"
      },
      {
        "src": 6,
        "primary": [
          {
            "label": "Tafsīr al-Ṭabarī on 59:6 (al-ʿAwfī chain)",
            "href": "/quran/59/6/tafsir/tabari"
          }
        ],
        "secondary": [
          {
            "label": "Arabic text (KSU)",
            "href": "https://quran.ksu.edu.sa/tafseer/tabary/sura59-aya6.html"
          }
        ],
        "reason": "factcheck T10 src[6]: weak al-ʿAwfī chain from Ibn ʿAbbās; machine-translated local English.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura59-aya6.html"
      }
    ],
    "sources": {
      "open": [
        1,
        2,
        3,
        5,
        7
      ]
    }
  },
  "Theme_11_Slavery_and_Wealth": {
    "title": "33:50’s Third Grant to the Prophet: Captives “From What God Has Given You”",
    "hook": "No separate occasion of revelation is reported for this clause; it sits here because the same verse that grants the Prophet his marital exemptions in Item 2 (33:50) also makes lawful to him women “your right (hand) owns from what God has given you” — which al-Ṭabarī glosses as war captives and Ibn Kathīr applies to four women in the Prophet’s household (Ṣafiyyah and Juwayriyah, freed and married; Rayḥānah and Māriyah, kept as concubines).",
    "takeaway": "No separate occasion is reported for this clause of 33:50; alongside the marital exemptions in Item 2, the verse grants the Prophet captives “from what God has given you” (two freed and married, two kept as concubines, per Ibn Kathīr).",
    "about": "No separate occasion of revelation is recorded for this clause; it is part of the same passage examined in Item 2 ([33:50](/quran/33/50/tafsir/tabari)). Alongside the Prophet’s marital exemptions, 33:50 makes lawful to him women “your right (hand) owns from what God has given you”, which al-Ṭabarī glosses as women taken as war captives. Under this verse [Ibn Kathīr](/quran/33/50/tafsir/ibn_kathir) lists four women in the Prophet’s household: Ṣafiyyah and Juwayriyah, whom he freed and married, and Rayḥānah bint Shamʿūn and Māriyah al-Qibṭiyyah, whom he kept as concubines. (For the broader Islamic sources on slavery and captives — including the three wartime reports in the additional sources drawer below — see the companion study on [Muḥammad and Slavery](/discover/muhammad-and-slavery/).)",
    "provenance": {
      "pattern": "addresses",
      "verse": "33:50",
      "occasionLabel": "Commentaries",
      "occasion": [
        "Tafsīr al-Ṭabarī",
        "Tafsīr Ibn Kathīr"
      ],
      "extra": "No separate occasion reported; 3 wartime reports in drawer"
    },
    "showcase": {
      "archetype": "facts",
      "caption": "The verse (33:50) and its two classical commentaries",
      "findings": [
        {
          "label": "The verse (33:50)",
          "src": 0,
          "excerpt": "what your right (hand) owns from what God has given you"
        },
        {
          "label": "Al-Ṭabarī on 33:50",
          "src": 2,
          "excerpt": "your female slaves whom you have taken as captives, and thus owned them through captivity"
        },
        {
          "label": "Ibn Kathīr on 33:50: 2 freed and married",
          "src": 1,
          "excerpt": "He owned Safiyyah and Juwayriyah, then freed them and married them."
        },
        {
          "label": "Ibn Kathīr on 33:50: 2 kept as concubines",
          "src": 1,
          "excerpt": "He also owned Rayhanah bint Sham'un An-Nadariyyah, and Mariyah Al-Qibtiyyah, the mother of his son Ibrahim, peace be upon him; and they were among the concubines"
        }
      ],
      "note": [
        "Three related reports on wartime captives in Ṣaḥīḥ Muslim and Ibn Isḥāq’s Sīra are in the additional sources drawer below."
      ]
    },
    "classical": {
      "text": "Ibn Kathīr and al-Ṭabarī read 33:50’s “what your right (hand) owns from what God has given you” as permitting the Prophet concubines from war captives, and Ibn Kathīr notes that he freed and married Ṣafiyyah and Juwayriyah ([Ibn Kathīr on 33:50](/quran/33/50/tafsir/ibn_kathir)). Modern writers add that the Qurʾān encouraged freeing slaves ([5:89](/quran/5/89/tafsir/tabari); [90:13](/quran/90/13/tafsir/tabari)) and humane treatment ([Abū Dāwūd 5156](https://sunnah.com/abudawud:5156)). (In the additional sources drawer, al-Nawawī explains the purchase in [Muslim 1602a](https://sunnah.com/muslim:1602a) as helping a slave who had emigrated, and reads [Muslim 1438a](https://sunnah.com/muslim:1438a) on withdrawal, *ʿazl*, with captives.)"
    },
    "comparing": {
      "text": "Unlike the other items in this study, no separate occasion of revelation (*sabab al-nuzūl*) is recorded for this clause; it belongs here because it is the third personal grant inside [33:50](/quran/33/50/tafsir/tabari), the same verse that exempts the Prophet from the four-wife limit and permits marriage without dowry to a woman who offers herself (Item 2). Addressed to the Prophet by office (“Prophet! Surely We have made lawful for you… what your right (hand) owns from what God has given you”), the clause is glossed by al-Ṭabarī as women taken as spoils of war, and Ibn Kathīr’s commentary on 33:50 names the four women in the Prophet’s household under it: Ṣafiyyah and Juwayriyah, whom he freed and married, and “Rayhanah bint Sham'un An-Nadariyyah, and Mariyah Al-Qibtiyyah, the mother of his son Ibrahim, peace be upon him; and they were among the concubines” ([Ibn Kathīr on 33:50](/quran/33/50/tafsir/ibn_kathir)).\n\nWithin this study’s question, that third clause links directly back to the household episodes earlier on the page: Māriyah’s presence in Ḥafṣah’s room is one of the two reported occasions of [66:1–5](/quran/66/1/tafsir/tabari) (Item 4), and Ṣafiyyah and Juwayriyah were among the nine wives exempted from the four-wife cap (Item 2). (The broader legal and moral debate over slavery and concubinage — including [5:89](/quran/5/89/tafsir/tabari), [90:13](/quran/90/13/tafsir/tabari), [Abū Dāwūd 5156](https://sunnah.com/abudawud:5156), and the three wartime reports in the drawer below — is examined in full in the companion article, [Muḥammad and Slavery](/discover/muhammad-and-slavery/).)\n\nEither 33:50’s clause “from what God has given you” is read as a sovereign allocation of war captives to the head of the community alongside his other special rulings (*khaṣāʾiṣ*) in 33:50. Or it is one more place in the same passage where revelation expanded the Prophet’s own household through war captives and concubines, as al-Ṭabarī glosses the verse: “your female slaves whom you have taken as captives, and thus owned them through captivity, and who have become yours due to the conquests God bestowed upon you as spoils of war” ([al-Ṭabarī on 33:50](/quran/33/50/tafsir/tabari))."
    },
    "stageLabels": {
      "1. Captives as Divine Bounty": "The verse and the commentaries (33:50)",
      "2. Arbitraging Human Capital: Trading Two Black Slaves for One": "Related report: a slave who pledged emigration, bought",
      "3. Preserving Market Value: The Practice of 'Azl on Female Captives": "Related report: captives, withdrawal (ʿazl) and “ransom for them”",
      "4. Liquidating Captives to Procure Military Hardware": "Related report: captives exchanged for horses (Ibn Isḥāq’s biography)"
    },
    "summaries": {},
    "crossLinks": [
      {
        "label": "The captives of Awṭās (4:24)",
        "target": "Theme_05_Captives_of_War"
      },
      {
        "label": "Spoils and fayʾ (8:1, 8:41, 59:6–7)",
        "target": "Theme_10_War_Booty_and_Fay"
      }
    ],
    "quoteFixes": [
      {
        "src": 0,
        "field": "english",
        "find": "O Prophet, indeed We have made lawful to you your wives to whom you have given their due compensation and those your right hand possesses from what Allah has returned to you [of captives]...",
        "replace": "Prophet! Surely We have made lawful for you your wives to whom you have granted their marriage gifts, and what your right (hand) owns from what God has given you…",
        "reason": "Use the site's Droge translation of 33:50 consistently across Item 2 and Item 12.",
        "sourceUrl": "/quran/33/50/tafsir/tabari"
      },
      {
        "src": 4,
        "field": "arabic",
        "find": "عَنْ أَبِي سَعِيدٍ، قَالَ نَعَمْ خَرَجْنَا مَعَ رَسُولِ اللَّهِ صلى الله عليه وسلم فِي غَزْوَةِ بَنِي الْمُصْطَلِقِ فَأَصَبْنَا سَبَايَا مِنْ سَبْىِ الْعَرَبِ فَاشْتَهَيْنَا النِّسَاءَ وَاشْتَدَّتْ عَلَيْنَا الْعُزْبَةُ وَأَحْبَبْنَا الْعَزْلَ فَأَرَدْنَا أَنْ نَعْزِلَ وَقُلْنَا نَعْزِلُ وَرَسُولُ اللَّهِ صلى الله عليه وسلم بَيْنَ أَظْهُرِنَا قَبْلَ أَنْ نَسْأَلَهُ ‏.‏ فَسَأَلْنَاهُ عَنْ ذَلِكَ فَقَالَ ‏ \"‏ مَا عَلَيْكُمْ أَنْ لاَ تَفْعَلُوا مَا مِنْ نَسَمَةٍ كَائِنَةٍ إِلَى يَوْمِ الْقِيَامَةِ إِلاَّ وَهِيَ كَائِنَةٌ ‏\"‏ ‏.‏",
        "replace": "يَا أَبَا سَعِيدٍ هَلْ سَمِعْتَ رَسُولَ اللَّهِ صلى الله عليه وسلم يَذْكُرُ الْعَزْلَ فَقَالَ نَعَمْ غَزَوْنَا مَعَ رَسُولِ اللَّهِ صلى الله عليه وسلم غَزْوَةَ بَلْمُصْطَلِقِ فَسَبَيْنَا كَرَائِمَ الْعَرَبِ فَطَالَتْ عَلَيْنَا الْعُزْبَةُ وَرَغِبْنَا فِي الْفِدَاءِ فَأَرَدْنَا أَنْ نَسْتَمْتِعَ وَنَعْزِلَ فَقُلْنَا نَفْعَلُ وَرَسُولُ اللَّهِ صلى الله عليه وسلم بَيْنَ أَظْهُرِنَا لاَ نَسْأَلُهُ ‏.‏ فَسَأَلْنَا رَسُولَ اللَّهِ صلى الله عليه وسلم فَقَالَ ‏ \"‏ لاَ عَلَيْكُمْ أَنْ لاَ تَفْعَلُوا مَا كَتَبَ اللَّهُ خَلْقَ نَسَمَةٍ هِيَ كَائِنَةٌ إِلَى يَوْمِ الْقِيَامَةِ إِلاَّ سَتَكُونُ ‏\"‏ ‏.‏",
        "reason": "factcheck T11 src[4] (misquote, Arabic): the dataset Arabic is Bukhārī 4138’s («وَأَحْبَبْنَا الْعَزْلَ»); Muslim 1438a reads «فَسَبَيْنَا كَرَائِمَ الْعَرَبِ فَطَالَتْ عَلَيْنَا الْعُزْبَةُ وَرَغِبْنَا فِي الْفِدَاءِ» (“…and we wanted ransom”), matching the English. Replacement is the matn of 1438a from Abū Ṣirma’s question onwards.",
        "sourceUrl": "https://sunnah.com/muslim:1438a"
      },
      {
        "src": 5,
        "field": "arabic",
        "find": "أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم بَعَثَ سَعْدَ بْنَ زَيْدٍ الأَنْصَارِيَّ بِسَبَايَا مِنْ بَنِي قُرَيْظَةَ إِلَى نَجْدٍ فَابْتَاعَ بِهِمْ خَيْلاً وَسِلاَحًا ‏.‏",
        "replace": "ثم بعث رسول الله صلى الله عليه وسلم سعد بن زيد الأنصاري أخا بني عبد الأشهل بسبايا من سبايا بني قريظة إلى نجد، فابتاع لهم بها خيلا وسلاحا.",
        "reason": "factcheck top-10 #1 and T11 src[5]: not al-Nasāʾī 3169 (a hadith on ribāṭ). The report is Ibn Isḥāq’s, in Sīrat Ibn Hishām (Banū Qurayẓa, qasm fayʾ Banī Qurayẓa); this is its wording.",
        "sourceUrl": "https://www.islamweb.net/ar/library/content/58/1171/"
      }
    ],
    "refFixes": [
      {
        "src": 5,
        "primary": [
          {
            "label": "Ibn Isḥāq, al-Sīrah (Ibn Hishām), Banū Qurayẓa",
            "href": "https://www.islamweb.net/ar/library/content/58/1171/"
          }
        ],
        "secondary": [],
        "reason": "factcheck top-10 #1: “Sunan an-Nasa’i 3169” is a hadith on ribāṭ; the Najd report is Ibn Isḥāq’s Sīra, with no Prophetic chain. Verified on IslamWeb (al-Sīrah al-Nabawiyyah li-Ibn Hishām 2/244–245).",
        "sourceUrl": "https://www.islamweb.net/ar/library/content/58/1171/"
      },
      {
        "src": 0,
        "primary": [
          {
            "label": "Qurʾān 33:50",
            "href": "/quran/33/50/tafsir/tabari"
          }
        ],
        "secondary": [],
        "reason": "factcheck link fixes: “Quran (33:50)” was not linked because of the parentheses.",
        "sourceUrl": "/quran/33/50/tafsir/tabari"
      }
    ],
    "sources": {
      "open": [
        0,
        1,
        2
      ],
      "collapsed": [
        3,
        4,
        5
      ]
    }
  },
  "Theme_12_Wives_Demanding_Wealth": {
    "title": "33:28–29 and the Wives’ Request for Maintenance: The Choice in Muslim and the Commentaries",
    "hook": "In Ṣaḥīḥ Muslim (1478) the Prophet’s wives ask him for more maintenance, then pledge not to ask for anything he does not possess; after he stays apart from them for a month — which Bukhārī 5191 ties to the secret Ḥafṣah disclosed to ʿĀʾishah — 33:28–29 requires each wife to choose between provision and release (divorce, per Ibn Kathīr) or God and His messenger.",
    "takeaway": "After a month apart — tied in Muslim 1478 to the maintenance dispute (after the wives pledged to drop it) and in Bukhārī 5191 to the disclosed secret — 33:28–29 required each wife to choose between divorce (“release you gracefully”, per Ibn Kathīr) and staying.",
    "about": "In [Muslim 1478](https://sunnah.com/muslim:1478), the Prophet’s wives asked him for more maintenance (*nafaqah*). After Abū Bakr and ʿUmar rebuked their daughters ʿĀʾishah and Ḥafṣah, the wives pledged not to ask for anything he did not possess. The Prophet then stayed apart from his wives for a month — which [Bukhārī 5191](https://sunnah.com/bukhari:5191) ties to the secret Ḥafṣah had disclosed to ʿĀʾishah (Item 4), and [al-Ṭabarī](/quran/33/29/tafsir/tabari) also links to mutual jealousy — and [33:28–29](/quran/33/28/tafsir/tabari) required each wife to choose between this present life, with provision and “a gracious release” (divorce, per [Ibn Kathīr](/quran/33/29/tafsir/ibn_kathir)), or God, His messenger and the Hereafter. All of them chose to stay.",
    "provenance": {
      "pattern": "addresses",
      "verse": "33:28–29",
      "occasion": [
        "Ṣaḥīḥ al-Bukhārī",
        "Ṣaḥīḥ Muslim",
        "Tafsīr al-Ṭabarī",
        "Tafsīr Ibn Kathīr"
      ],
      "extra": null
    },
    "showcase": {
      "archetype": "timeline",
      "caption": "From the request to the choice",
      "points": [
        {
          "label": "The request",
          "lines": [
            {
              "src": 3,
              "excerpt": "They are around me as you see, asking for extra money."
            }
          ]
        },
        {
          "label": "Abū Bakr and ʿUmar",
          "lines": [
            {
              "src": 3,
              "excerpt": "Abu Bakr (Allah be pleased with him) then got up went to 'A'isha (Allah be pleased with her) and slapped her on the neck, and 'Umar stood up before Hafsa and slapped her saying: You ask Allah's Messenger (ﷺ) which he does not possess."
            },
            {
              "src": 3,
              "excerpt": "They said: By Allah, we do not ask Allah's Messenger (ﷺ) for anything he does not possess."
            }
          ]
        },
        {
          "label": "A month apart",
          "lines": [
            {
              "src": 3,
              "excerpt": "Then he withdrew from them for a month or for twenty-nine days."
            }
          ]
        },
        {
          "label": "The verse of the choice",
          "lines": [
            {
              "src": 7,
              "excerpt": "If you desire this present life and its (passing) splendor, come! I shall make provision for you, and release you gracefully. But if you desire God and His messenger and the home of the Hereafter, surely God has prepared a great reward for those of you who do good."
            }
          ]
        },
        {
          "label": "Ibn Kathīr on “release”",
          "lines": [
            {
              "src": 8,
              "excerpt": "this contradicts the apparent meaning of the Ayah"
            },
            {
              "src": 8,
              "excerpt": "meaning: I will give you your rights and let you go."
            }
          ]
        }
      ],
      "note": [
        "ʿĀʾishah, asked first:",
        {
          "src": 3,
          "excerpt": "Nay, I choose Allah, His Messenger, and the Last Abode"
        },
        "; the other wives chose the same ([Bukhārī 5262](https://sunnah.com/bukhari:5262))."
      ]
    },
    "classical": {
      "text": "Ibn Kathīr calls 33:28 the verse of the choice: ʿĀʾishah chose first and the other wives followed ([Ibn Kathīr on 33:28](/quran/33/28/tafsir/ibn_kathir)). Commentators read it as a call to detachment; in [Muslim 1479a](https://sunnah.com/muslim:1479a) ʿUmar weeps at the mat that marked the Prophet’s side and his near-empty store. Al-Ḥasan al-Baṣrī and Qatādah, cited by al-Ṭabarī ([on 33:29](/quran/33/29/tafsir/tabari)), say 33:52 then kept him to these wives as their reward. ʿĀʾishah: “giving us that option was not regarded as divorce” ([Bukhārī 5262](https://sunnah.com/bukhari:5262))."
    },
    "comparing": {
      "text": "Two classical claims seek to soften the ultimatum in 33:28–29: that the choice did not involve divorce, and that 33:52 later rewarded the wives by forbidding the Prophet from marrying others. On the first, ʿĀʾishah’s statement that “giving us that option was not regarded as divorce” ([Bukhārī 5262](https://sunnah.com/bukhari:5262)) is a legal ruling that offering the option did not count as one of a husband’s three divorces once the wives chose to stay; a report from ʿAlī that the verse offered no divorce at all is graded disconnected (*munqaṭiʿ*) by Ibn Kathīr, who writes that it “contradicts the apparent meaning of the Ayah” ([on 33:29](/quran/33/29/tafsir/ibn_kathir)). On the second, both ʿĀʾishah and Umm Salamah report that the marriage cap in 33:52 was lifted before the Prophet died ([al-Nasāʾī 3205](https://sunnah.com/nasai:3205); [Ibn Kathīr on 33:52](/quran/33/52/tafsir/ibn_kathir)).\n\nAcross the primary reports, three different triggers are recorded for the month-long separation that ended with 33:28–29. In [Muslim 1478](https://sunnah.com/muslim:1478), the wives ask for more maintenance, Abū Bakr and ʿUmar rebuke their daughters, and the wives back down and pledge, “By Allah, we do not ask Allah's Messenger (ﷺ) for anything he does not possess,” before he withdraws for a month. In [Bukhārī 5191](https://sunnah.com/bukhari:5191), ʿUmar states that the Prophet “kept away from his wives for twenty-nine days because of the story which Hafsa had disclosed to ʿAisha” ([66:1–3](/quran/66/1/tafsir/tabari), Item 4) — on which account the separation was over the disclosed secret rather than a dropped request for maintenance. And [al-Ṭabarī on 33:29](/quran/33/29/tafsir/tabari) records a third report attributing the month apart to mutual jealousy among the wives. (In [Muslim 1479a](https://sunnah.com/muslim:1479a), where ʿUmar visits the Prophet on the reed mat during that separation and says, “if you have divorced them, verily Allah is with you, His angels, Gabriel, Mika'il, I and Abu Bakr and the believers are with you,” the verses the narrator then recites as what came down matching ʿUmar’s words are [66:5](/quran/66/5/tafsir/tabari) and [66:4](/quran/66/4/tafsir/tabari), examined in Items 4 and 8.)\n\nEither “release you gracefully” in 33:28 meant divorce, as Ibn Kathīr reads the verse. In that case, after a month apart — whether following the maintenance dispute in [Muslim 1478](https://sunnah.com/muslim:1478) (where the wives had already pledged to drop their request) or the disclosed secret in [Bukhārī 5191](https://sunnah.com/bukhari:5191) — revelation gave the wives a divine ultimatum of divorce, and the later marriage cap in 33:52 was lifted during his lifetime ([al-Nasāʾī 3205](https://sunnah.com/nasai:3205)). Or the choice held no offer of divorce, relying on a report Ibn Kathīr grades disconnected (*munqaṭiʿ*) and says “contradicts the apparent meaning of the Ayah, for He said: {then come! I will make a provision for you and set you free in a handsome manner.} meaning: I will give you your rights and let you go” ([Ibn Kathīr on 33:29](/quran/33/29/tafsir/ibn_kathir))."
    },
    "stageLabels": {
      "1. The Context (Wives' Empowerment and Retorting)": "ʿUmar’s account of the Prophet’s household",
      "2. The Complaint (Demanding Material Goods)": "Maintenance or jealousy: the reports in al-Ṭabarī",
      "3. The Incident (Abu Bakr and Umar's Intervention)": "Abū Bakr and ʿUmar rise to strike their daughters",
      "4. The Boycott (Prophet Withdraws from His Wives)": "The month apart, and the mat",
      "5. The Revelation (The Ultimatum of Divorce)": "The verse of the choice (33:28–29) and Ibn Kathīr"
    },
    "summaries": {},
    "crossLinks": [
      {
        "label": "66:1–5 and the dispute among the wives",
        "target": "Theme_04_Safe_Harbor_Oaths"
      },
      {
        "label": "ʿUmar’s words and the verses that followed",
        "target": "Theme_07_Umar_Hijab"
      }
    ],
    "quoteFixes": [
      {
        "src": 2,
        "field": "english",
        "find": "The cause of that was a jealousy",
        "replace": "And it was said: the cause of that was a jealousy",
        "reason": "factcheck T12 src[2] (attribution): al-Ṭabarī introduces this cause with «وقيل» (“and it was said”); the second sentence, after the ellipsis, is Ibn Zayd’s (named in the showcase step label).",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya29.html"
      },
      {
        "src": 2,
        "field": "arabic",
        "find": "كان سبب ذلك غيرة",
        "replace": "وقيل: كان سبب ذلك غيرة",
        "reason": "factcheck T12 src[2]: restore «وقيل» as in al-Ṭabarī.",
        "sourceUrl": "https://quran.ksu.edu.sa/tafseer/tabary/sura33-aya29.html"
      },
      {
        "src": 0,
        "field": "english",
        "find": "Umar discovers that women in Medina (Ansar) have the 'upper hand over their men'. His own wife retorts to him, justifying it by stating that the Prophet's wives retort to him and some 'leave (does not speak to) him throughout the day till the night.' This shocked Umar, leading him to warn Hafsa against imitating Aisha's boldness.",
        "replace": "We, the people of Quraish used to have the upper hand over our wives, but when we came to the Ansar, we found that their women had the upper hand over their men, so our women also started learning the ways of the Ansari women. I shouted at my wife and she retorted against me and I disliked that she should answer me back. She said to me, 'Why are you so surprised at my answering you back? By Allah, the wives of the Prophet answer him back and some of them may leave (does not speak to) him throughout the day till the night.' The (talk) scared me and I said to her, 'Whoever has done so will be ruined!' Then I proceeded after dressing myself, and entered upon Hafsa and said to her, 'Does anyone of you keep the Prophet (ﷺ) angry till night?' She said, 'Yes.' I said, 'You are a ruined losing person! Don't you fear that Allah may get angry for the anger of Allah's Messenger (ﷺ) and thus you will be ruined? So do not ask more from the Prophet (ﷺ) and do not answer him back and do not give up talking to him. Ask me whatever you need and do not be tempted to imitate your neighbor (i.e., `Aisha) in her manners for she is more charming than you and more beloved to the Prophet (ﷺ) … Then the Prophet (ﷺ) kept away from his wives for twenty-nine days because of the story which Hafsa had disclosed to `Aisha. The Prophet (ﷺ) had said, 'I will not enter upon them (my wives) for one month,' because of his anger towards them, when Allah had admonished him. So, when twenty nine days had passed, the Prophet (ﷺ) first entered upon `Aisha. `Aisha said to him, 'O Allah's Messenger (ﷺ)! You had sworn that you would not enter upon us for one month, but now only twenty-nine days have passed, for I have been counting them one by one.' The Prophet (ﷺ) said, 'The (present) month is of twenty nine days.' `Aisha added, 'Then Allah revealed the Verses of the option.",
        "reason": "factcheck T12 src[0] (paraphrase-as-quote) + orchestrator decision: replace the summary with a verbatim excerpt of Bukhārī 5191 (Khan) that carries both quoted phrases (“the upper hand over their men”; “leave (does not speak to) him throughout the day till the night”), ʿUmar’s “do not ask more from the Prophet”, and the hadith’s own close (29 days; “Then Allah revealed the Verses of the option”). Two contiguous verbatim passages joined by “…”.",
        "sourceUrl": "https://sunnah.com/bukhari:5191",
        "mirrorUrl": "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari.json"
      },
      {
        "src": 3,
        "field": "english",
        "find": "Abu Bakr and Umar enter and see the Prophet sitting silently and sadly with his wives. The Prophet states: 'They are around me as you see, asking for extra money [يَسْأَلْنَنِي النَّفَقَةَ].' Abu Bakr gets up and strikes Aisha in the neck [يَجَأُ عُنُقَهَا]. Umar gets up and strikes Hafsa in the neck, with both saying, 'You ask Allah's Messenger which he does not possess.' Following this, the Prophet withdrew from them for a month (or 29 days) until Quran 33:28 was revealed.",
        "replace": "Abu Bakr (Allah be pleased with him) came and sought permission to see Allah's Messenger (ﷺ). He found people sitting at his door and none amongst them had been granted permission, but it was granted to Abu Bakr and he went in. Then came 'Umar and he sought permission and it was granted to him, and he found Allah's Apostle (ﷺ) sitting sad and silent with his wives around him. He (Hadrat 'Umar) said: I would say something which would make the Prophet (ﷺ) laugh, so he said: Messenger of Allah, I wish you had seen (the treatment meted out to) the daughter ofKhadija when you asked me some money, and I got up and slapped her on her neck. Allah's Messenger (mav peace be upon him) laughed and said: They are around me as you see, asking for extra money. Abu Bakr (Allah be pleased with him) then got up went to 'A'isha (Allah be pleased with her) and slapped her on the neck, and 'Umar stood up before Hafsa and slapped her saying: You ask Allah's Messenger (ﷺ) which he does not possess. They said: By Allah, we do not ask Allah's Messenger (ﷺ) for anything he does not possess. Then he withdrew from them for a month or for twenty-nine days. Then this verse was revealed to him:\" Prophet: Say to thy wives... for a mighty reward\" (xxxiii. 28). He then went first to 'A'isha (Allah be pleased with her) and said: I want to propound something to you, 'A'isha, but wish no hasty reply before you consult your parents. She said: Messenger of Allah, what is that? He (the Holy Prophet) recited to her the verse, whereupon she said: Is it about you that I should consult my parents, Messenger of Allah? Nay, I choose Allah, His Messenger, and the Last Abode; but I ask you not to tell any of your wives what I have said He replied: Not one of them will ask me without my informing her. God did not send me to be harsh, or cause harm, but He has sent me to teach and make things easy",
        "reason": "factcheck T12 src[3] (paraphrase-as-quote + context cut) + orchestrator decision: replace the summary with the full Sunnah.com English (Siddiqui) of Muslim 1478, including the wives’ pledge, ʿĀʾishah’s choice and the closing “God did not send me to be harsh…”.",
        "sourceUrl": "https://sunnah.com/muslim:1478",
        "mirrorUrl": "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-muslim.json"
      },
      {
        "src": 6,
        "field": "english",
        "find": "Umar visits the Prophet during his separation and finds him lying on a mat that leaves marks on his side, with barely any food. Umar cries, comparing the Prophet's poverty to the wealth of Caesar and Khosrau. Umar explicitly tells the Prophet: 'By Allah, if Allah's Messenger would command me to strike her neck [Hafsa's], I would certainly strike her neck.' He states that 'it was 'A'isha, daughter of Abu Bakr, and Hafsa who had prevailed upon all the wives of Allah's Prophet... for (pressing them for more money).'",
        "replace": "I think that Allah's Messenger (ﷺ) is under the impression that I have come for the sake of Hafsa. By Allah, if Allah's Messenger (ﷺ) would command me to strike her neck, I would certainly strike her neck. I raised my voice and he pointed me to climb up (and get into his apartment). I visited Allah's Messenger (ﷺ), and he was lying on a mat. I sat down and he drew up his lower garment over him and he had nothing (else) over him, and that the mat had left its marks on his sides. I looked with my eyes in the store room of Allah's Messenger (ﷺ). I found only a handful of barley equal to one sa' and an equal quantity of the leaves of Mimosa Flava placed in the nook of the cell, and a semi-tanned leather bag hanging (in one side), and I was moved to tears (on seeing this extremely austere living of the Holy Piophet), and he said: Ibn Khattab, what wakes you weep? I said: Apostle of Allah, why should I not shed tears? This mat has left its marks on your sides and I do not see in your store room (except these few things) that I have seen; Ceasar and Closroes are leading their lives in plenty whereas you are Allah's Messenger. His chosen one, and that is your store! He said: Ibn Khattab, aren't you satisfied that for us (there should be the prosperity) of the Hereafter, and for them (there should be the prosperity of) this world? I said: Yes. And as I had entered I had seen the signs of anger on his face, and I therefore, said: Messenger of Allah, what trouble do you feel from your wives, and if youhave divorced them, verily Allah is with you, His angels, Gabriel, Mika'il, I and Abu Bakr and the believers are with you. And seldom I talked and (which I uttered on that day) I hoped that Allah would testify to my words that I uttered. And so the verse of option (Ayat al-Takhyir) was revealed.",
        "reason": "factcheck T12 src[6] (paraphrase-as-quote, wrong number) + orchestrator decision: replace the summary with one contiguous verbatim passage of Muslim 1479a (Siddiqui), from “I think that Allah’s Messenger…” (the “strike her neck” line in its context: ʿUmar showing he had not come to plead for Ḥafṣah) through the mat, the store room, Caesar and Khosrau, and “…And so the verse of option (Ayat al-Takhyir) was revealed.” The later “prevailed upon… (pressing them for mote money)” line is not included (translator’s gloss; see Dropped claims).",
        "sourceUrl": "https://sunnah.com/muslim:1479a",
        "mirrorUrl": "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-muslim.json"
      }
    ],
    "refFixes": [
      {
        "src": 0,
        "primary": [
          {
            "label": "Ṣaḥīḥ al-Bukhārī 5191",
            "href": "https://sunnah.com/bukhari:5191"
          }
        ],
        "secondary": [
          {
            "label": "Muslim 1479a (parallel)",
            "href": "https://sunnah.com/muslim:1479a"
          }
        ],
        "reason": "src[0] now quotes Bukhārī 5191 verbatim; Muslim 1479a is the parallel account.",
        "sourceUrl": "https://sunnah.com/bukhari:5191"
      },
      {
        "src": 6,
        "primary": [
          {
            "label": "Ṣaḥīḥ Muslim 1479a",
            "href": "https://sunnah.com/muslim:1479a"
          }
        ],
        "secondary": [],
        "reason": "factcheck T12 src[6]: the mat, Caesar and Khosrau and “strike her neck” are Muslim 1479a, not 1478.",
        "sourceUrl": "https://sunnah.com/muslim:1479a"
      },
      {
        "src": 7,
        "primary": [
          {
            "label": "Qurʾān 33:28–29",
            "href": "/quran/33/28/tafsir/tabari"
          }
        ],
        "secondary": [],
        "reason": "factcheck link fixes: the text quoted is 33:28–29.",
        "sourceUrl": "/quran/33/28/tafsir/tabari"
      }
    ],
    "sources": {
      "open": [
        3,
        6,
        7,
        8
      ]
    }
  }
};

/** Droge translation text for every verse cited by a `quran:` showcase line (must equal src/data/quran/english/droge_translation.json; unit-tested). */
export const QURAN_TEXT = {};

/** Dataset reference each refFix replaces (a later data change makes the fix stale and fails the build). */
export const DATASET_REFS = {
  "Theme_01_Marital_Limits:1": "Tafsir Ibn Kathir (Quran 4:3)",
  "Theme_01_Marital_Limits:2": "Quran 33:50",
  "Theme_01_Marital_Limits:3": "Tafsir Ibn Kathir (Quran 33:50)",
  "Theme_02_Marital_Rotation:1": "Tafsir Ibn Kathir (Quran 4:128)",
  "Theme_02_Marital_Rotation:3": "Tafsir al-Tabari (Verse 33:51)",
  "Theme_02_Marital_Rotation:4": "Sahih al-Bukhari 5113",
  "Theme_03_Zaynab_Marriage:1": "Tafsir al-Tabari (Verse 33:37)",
  "Theme_03_Zaynab_Marriage:3": "Sahih Muslim 1428a",
  "Theme_04_Safe_Harbor_Oaths:0": "Tafsir Ibn Kathir (Surah 66:1)",
  "Theme_04_Safe_Harbor_Oaths:1": "Tafsir Ibn Kathir (Surah 66:1)",
  "Theme_04_Safe_Harbor_Oaths:2": "Tafsir al-Tabari (Qatadah) (Surah 66:1)",
  "Theme_04_Safe_Harbor_Oaths:3": "Quran 66:1",
  "Theme_04_Safe_Harbor_Oaths:4": "Tafsir al-Tabari (Ibn Abbas) (Surah 66:1)",
  "Theme_04_Safe_Harbor_Oaths:5": "Sahih Bukhari 6691",
  "Theme_07_Umar_Hijab:1": "Tafsir al-Tabari - Quran 33:53",
  "Theme_07_Umar_Hijab:10": "Sahih Muslim 2170e",
  "Theme_07_Umar_Hijab:15": "Musannaf Ibn Abi Shaybah 6236",
  "Theme_08_Aisha_Ifk:0": "Tafsir al-Tabari (Surah 24:11 - Hadith Al-Ifk)",
  "Theme_08_Aisha_Ifk:1": "Tafsir al-Tabari (Surah 24:11 - Hadith Al-Ifk)",
  "Theme_08_Aisha_Ifk:2": "Tafsir al-Tabari (Surah 24:11 - Hadith Al-Ifk)",
  "Theme_08_Aisha_Ifk:4": "Tafsir al-Tabari (Surah 24:4)",
  "Theme_08_Aisha_Ifk:5": "Tafsir al-Tabari (Surah 24:11 - Hadith Al-Ifk)",
  "Theme_08_Aisha_Ifk:7": "Tafsir al-Tabari (Surah 24:11 - Hadith Al-Ifk)",
  "Theme_08_Aisha_Ifk:9": "Sahih al-Bukhari 4747 / Quran 24:6-9",
  "Theme_09_Fasting_Relaxations:0": "Sahih Bukhari 1915",
  "Theme_09_Fasting_Relaxations:1": "Tafsir al-Tabari (Surah 2:187)",
  "Theme_10_War_Booty_and_Fay:0": "Tafsir al-Tabari (Surah 8:1)",
  "Theme_10_War_Booty_and_Fay:5": "Quran 59:6-7",
  "Theme_10_War_Booty_and_Fay:6": "Tafsir al-Tabari (Surah 59:6)",
  "Theme_11_Slavery_and_Wealth:0": "Quran (33:50)",
  "Theme_11_Slavery_and_Wealth:5": "Sunan an-Nasa'i 3169",
  "Theme_12_Wives_Demanding_Wealth:0": "Sahih al-Bukhari 5191 and Sahih Muslim 1479a",
  "Theme_12_Wives_Demanding_Wealth:6": "Sahih Muslim 1478",
  "Theme_12_Wives_Demanding_Wealth:7": "Quran 33:28"
};
