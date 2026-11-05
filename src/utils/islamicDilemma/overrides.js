/**
 * Replacements for markdown-derived text on /discover/islamic-dilemma.
 *
 * `islamic_dilemma.md` is read-only (src/data). Parts of it are rendered: the §2 verse table, the
 * §6 objections and the §7 reference table (parsed by the unchanged `parseDilemmaMarkdown()`).
 * Some of their columns are written in our voice ("Apologetic Significance", "The Refutation",
 * category names, link labels such as "Ibn Kathir: behavioral disobedience…"). Those fields are
 * replaced here, keyed by a normalised reference. Quotations and references are never overridden:
 * they pass through from the md verbatim.
 *
 * Keys: Qurʾān rows → "S:A" (several verses joined with "/", e.g. "6:115/18:27"); hadith rows →
 * "abudawud:4449"; other rows → a slug of the reference text ("codex-sinaiticus"); objections →
 * "obj-1".."obj-3". `model.test.mjs` fails on a key that matches no md row, and on an md row that
 * needs an override and has none.
 *
 * STATUS: FINAL COPY (phase2_copy.md r3, §1.6, §1.10, §1.11).
 */

export const TABLE_ROWS = {
  /**
   * md §2 "Key Quranic Verses…" table. `label` and `bodyMd` replace the "Apologetic Significance"
   * column: they are the §1 card label and body. The translations pass through verbatim.
   */
  affirm: {
    '5:47': {
      label: 'Qurʾān 5:47 · The People of the Gospel',
      bodyMd: 'Sūrat al-Māʾida tells the People of the Gospel to judge by what God sent down in it.',
    },
    '5:68': {
      label: 'Qurʾān 5:68 · “Say: People of the Book!”',
      bodyMd: 'The Prophet is told to say to the People of the Book that they stand on nothing until they observe the Torah and the Gospel.',
    },
    '5:43': {
      label: 'Qurʾān 5:43 · “When they have the Torah”',
      bodyMd: 'The verse asks how the Jews who came to the Prophet for judgment could make him their judge “when they have the Torah, containing the judgment of God”.',
    },
    '10:94': {
      label: 'Qurʾān 10:94 · “Ask those who have been reciting the Book”',
      bodyMd: 'The verse tells the Prophet to ask readers of the earlier Book.',
    },
    '3:3': {
      label: 'Qurʾān 3:3 · “Confirming what was before it”',
      bodyMd: 'The Qurʾān describes itself as confirming the Books before it, and names the Torah and the Gospel.',
    },
    '29:46': {
      label: 'Qurʾān 29:46 · “What has been sent down to you”',
      bodyMd: 'Muslims are told to say to the People of the Book: “We believe in what has been sent down to us, and what has been sent down to you.”',
    },
  },

  /**
   * md §7 "Primary Reference Summary Table".
   *  category → replaces the Category column
   *  tafsir   → replaces every `[label](tafseer/S/A)` link in the statement (label and target)
   *  leadMd   → replaces our-voice text before the quotation ("Muhammad honors the physical Torah:")
   *  statementMd → replaces a statement that has no quotation, or follows the quotation
   *  refLabel → replaces an unlinked Reference cell ("Codex Sinaiticus (c. 350 AD)")
   */
  reference: {
    '5:47': {
      category: 'Qurʾān on the Torah and Gospel',
      tafsir: [{ scholar: 'tabari', verse: '5:47', label: 'al-Ṭabarī: “We commanded its people to judge by what We have sent down in it”' }],
    },
    '5:68': {
      category: 'Qurʾān on the Torah and Gospel',
      tafsir: [{ scholar: 'ibn_kathir', verse: '5:68', label: 'Ibn Kathīr: “until you believe in all the Books that you have”; he adds, “These Books command following Muhammad”' }],
    },
    '5:43': {
      category: 'Qurʾān on the Torah and Gospel',
      tafsir: [{ scholar: 'tabari', verse: '5:43', label: 'al-Ṭabarī: the Torah “which they acknowledge to be true, and that it is My Book”' }],
    },
    '10:94': {
      category: 'Qurʾān on the Torah and Gospel',
      tafsir: [{ scholar: 'ibn_kathir', verse: '10:94', label: 'Ibn Kathīr and al-Ṭabarī record: “I do not doubt, and I do not ask”' }],
    },
    '6:115/18:27': {
      category: 'No one can change His words',
      tafsir: [{ scholar: 'ibn_kathir', verse: '18:27', label: 'Ibn Kathīr on 18:27, about the Qurʾān: “no one can alter them, distort them or misinterpret them”' }],
    },
    '4:157': { category: 'Qurʾān on Jesus\' death' },
    '5:72/9:30': { category: 'Qurʾān on who Jesus is' },
    'abudawud:4449': {
      category: 'Hadith',
      leadRefs: [{ label: 'Ṣaḥīḥ al-Bukhārī 3635', target: 'https://sunnah.com/bukhari:3635' }],
      leadMd: 'In Ṣaḥīḥ al-Bukhārī 3635, when a reader placed his hand over the stoning verse in the Torah brought before the Prophet, ʿAbdullāh ibn Salām told him to lift his hand and the stoning verse stood on the page. In Sunan Abī Dāwūd 4449 (graded good, *ḥasan*, by al-Albānī, with Hishām ibn Saʿd in its chain questioned by some hadith critics), the Prophet places the Torah on a cushion:',
      statementMd: '(both reports are cited by Ibn Kathīr on 5:41)',
      tafsir: [{ scholar: 'ibn_kathir', verse: '5:41', label: 'Ibn Kathīr on 5:41' }],
    },
    'codex-sinaiticus': {
      category: 'Manuscript',
      refLabel: 'Codex Sinaiticus (c. 330–360)',
      statementMd: 'Oldest complete Greek New Testament, about 250–280 years before Islam. Contains the crucifixion accounts and John 1:1.',
    },
  },
};

/**
 * md §6 objections. `heading` replaces the objection title (stated fairly, in the defender's own
 * terms); `bodyMd` replaces "The Refutation" (classical support first, the texts last).
 */
export const ANSWERS = {
  'obj-1': {
    heading: 'The Injīl was the book given to Jesus, not the four Gospels.',
    bodyMd: "This answer is most often stated this way: the *Injīl* was what God gave to Jesus (*ʿĪsā*) to preach, whereas Matthew, Mark, Luke and John are biographies of Jesus written by men decades later—so the four Gospels were never the *Injīl*, though some of Jesus' words may remain inside them. That God gave Jesus the Gospel has a text: 5:46 says He gave him “the Gospel, containing guidance and light” ([Surah 5:46](quran/5/46)). Neither the Qurʾān nor the commentaries of al-Ṭabarī and Ibn Kathīr on 5:46–47 say that this book was lost or replaced by later biographies; both commentators speak of its people as commanded to act by it ([al-Ṭabarī on 5:47](tabari://5/47)), and neither speaks of picking passages out of the four Gospels—Ibn Kathīr reads the command as “Let them believe in all that is in it” ([Ibn Kathīr on 5:47](ibnkathir://5/47)).\n\nThe Qurʾān speaks of the Gospel as a written book that Christians had in the 7th century. 5:47 calls them “the People of the Gospel”, 5:68 tells them to “observe the Torah and the Gospel”, and 7:157 speaks of the Prophet “whom they find written in their Torah and Gospel” ([Surah 7:157](quran/7/157)). On 10:94, Ibn ʿAbbās says: “Ask them if you are in doubt that you are written with them” ([al-Ṭabarī on 10:94](tabari://10/94)). Historically, the Gospels the churches read in the 7th century were Matthew, Mark, Luke and John; copies of all four older than Islam are in [section 2](#gospel-copies), and in Codex Sinaiticus each of the four narrates the crucifixion.\n\nEither the Gospel that 7th-century Christians held—Matthew, Mark, Luke and John—is what the Qurʾān calls the *Injīl* in their hands. Or the original *Injīl* was lost and replaced by those four biographies centuries before Islam, in which case 5:47 and 5:68 told Christians to judge by and observe a book they did not have (or unmarked parts inside those four biographies, with no word on how to separate them from the crucifixion and resurrection accounts in all four). [Surah 5:47](quran/5/47) reads: “So let the People of the Gospel judge by what God has sent down in it.”",
  },
  'obj-2': {
    heading: 'The Qurʾān confirms the original revelation, not the later copies.',
    bodyMd: "This answer needs a line between the revelation God sent and the copies people held, with the Qurʾān confirming the first. Classical scholars draw that line; the verses do not. Ibn Kathīr separates “the books that are currently in the hands of the People of the Book” from “the Books of Allah that He has with Him” ([Ibn Kathīr on 3:78](ibnkathir://3/78)), and the Meccan scholar Ibn Jurayj (d. 767), quoted by Ibn Kathīr on 5:48, says “whatever in these previous Books conforms to it is true, and whatever disagrees with it is false” ([Ibn Kathīr on 5:48](ibnkathir://5/48)). Neither 3:3 nor 5:48 names a part of the Torah or the Gospel as excepted.\n\nAl-Ṭabarī explains “confirming what was before it” (3:3; in Arabic *muṣaddiqan li-mā bayna yadayhi*, literally “between its hands”) as “what preceded it of the Books of Allah” ([al-Ṭabarī on 3:3](tabari://3/3)). The same chapter (Sūrat al-Māʾida) that calls the Qurʾān a guardian over the earlier Book (5:48) says of the Jews who came to the Prophet that “they have the Torah” (5:43), and tells the People of the Book to “observe the Torah and the Gospel” (5:68).\n\nIbn Jurayj's rule makes the Qurʾān the test of the earlier Books, and a test needs the books at hand. (Nor does the reply from [4:157](ibnkathir://4/157)—that the crucifixion “seemed like (that) to them”—settle which book 5:47 and 5:68 meant, or account for calling Jesus the Word who “was God” and “the Son of God” in the same pre-610 copies; see [section 3](#on-jesus).) Either the Books the Qurʾān confirms are the ones the People of the Book held—and in the 7th century the Gospel Christians held was the four Gospels, each narrating the cross and resurrection. Or they are the Books “that He has with Him”, in which case 5:68 told the People of the Book to observe books no one on earth held. [Surah 3:3](quran/3/3) reads: “confirming what was before it, and He sent down the Torah and the Gospel”.",
  },
  'obj-3': {
    heading: 'Paul, or the Council of Nicaea, changed the Gospel before Islam.',
    bodyMd: "This answer needs the Gospel's wording to have changed between Jesus and Islam, through the apostle Paul, whose letters date from the 50s, or at the council of bishops at Nicaea in 325. The Qurʾān names neither. The copies give dates to test it against.\n\nPapyrus 46, with Paul's letters and 1 Corinthians 15:3–4, is dated 175–225 (Chester Beatty Library, Dublin, and the University of Michigan). Papyri 66 and 75, with John 1:1, are dated to the 2nd–3rd century (Bodmer Library, Cologny; Vatican Library). All three are older than Nicaea and carry the passages shown in [section 2](#gospel-copies). Codex Sinaiticus, copied about 250–280 years before Islam, contains Paul's letters and the four Gospels together.\n\nIf the change came through Paul or Nicaea, it happened centuries before 5:68 was recited (about 300 years after Nicaea and more than 550 years after Paul's letters). Either the Gospel and letters the churches read, Paul's among them, were what the verse told them to observe. Or the verse told them to observe a book that had already been changed centuries earlier, without naming Paul, Nicaea, or any part to set aside. [Surah 5:68](quran/5/68) reads: “You are (standing) on nothing until you observe the Torah and the Gospel”.",
  },
};
