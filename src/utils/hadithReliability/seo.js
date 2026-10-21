/**
 * SEO copy for the Hadith Reliability article — agreed with the adversarial SEO review
 * (final spec: brain/<conversation>/scratch/seo/final_seo_spec.md). Keyed by dataset case id.
 *
 * Rules (do not "fix" later):
 *  - Plain ASCII in <title> and slugs; diacritics stay in the H1 and body.
 *  - Layout.astro appends " | Ready Apologia"; the brand truncating on mobile is accepted.
 *  - No meta keywords, no FAQPage, no ClaimReview. Article + BreadcrumbList (+ ItemList on lists).
 *  - Slugs are public URLs: never change one without adding a redirect (pre-launch renames, Oct 2026, needed none).
 *  - Tone: objective invitation to look; no gotcha words (contradictions, admit, errors, why, only, yet...).
 */
export const SEO_HUB = {
  "slug": "hadith-reliability",
  "title": "How Reliable Are the Hadith? Primary Sources Examined",
  "description": "A primary-source look at reports in Sahih al-Bukhari and Sahih Muslim and what classical Sunni scholars wrote about them, with links to every source."
};
export const SEO_GLANCE = {
  "slug": "at-a-glance",
  "title": "Hadith Reliability: All Cases at a Glance",
  "description": "Every case at a glance: dates, parallel accounts and chains in Sahih al-Bukhari and Sahih Muslim, with classical responses and links to each source."
};
/** People-Also-Ask phrasings surfaced in "About this question" (from SERP research). */
export const PAA = {
  "meccan_stay_three_timelines": "How old was the Prophet when he died?",
  "asymmetric_companion_distribution_abu_hurayrah_ibn_abbas": "Who narrated the most hadiths?",
  "solar_eclipse_prayer_ibrahim_death": "How many rakats in the eclipse prayer?",
  "hafs_ibn_sulayman_rijal_condemnation": "Was Hafs ibn Sulayman weak in hadith?",
  "early_prohibitions_burning_umayyad_coercion": "What did the Prophet and Umar say about writing hadiths?"
};
export const SEO_CASES = {
  "meccan_stay_three_timelines": {
    "slug": "prophet-muhammad-age-at-death",
    "title": "Did Prophet Muhammad Die at Age 60, 63, or 65?",
    "description": "Chains from Ibn Abbas in Bukhari and Muslim give 10, 13 or 15 years in Mecca and an age at death of 60, 63 or 65, with commentary by Ibn Hajar and al-Nawawi."
  },
  "first_and_last_quranic_revelations": {
    "slug": "first-quran-revelation-hadith",
    "title": "Which Quran Verse Was Revealed First and Last?",
    "description": "Reports in Sahih al-Bukhari and Sahih Muslim name Surah 96 or Surah 74 as the first revelation and different verses as the last, with classical commentary."
  },
  "solar_eclipse_prayer_ibrahim_death": {
    "slug": "eclipse-prayer-hadith-rukus",
    "title": "How Many Bowings Were in the Eclipse Prayer?",
    "description": "Reports in Sahih al-Bukhari and Sahih Muslim give 4, 6 or 8 bowings for the eclipse prayer on the day Ibrahim died, with the views of Ibn Taymiyyah and others."
  },
  "farewell_pilgrimage_modes_and_kabah_chamber": {
    "slug": "farewell-pilgrimage-hajj-mode",
    "title": "Which Hajj Mode Did the Prophet Perform?",
    "description": "Companions on the Farewell Pilgrimage report three Hajj modes in Sahih al-Bukhari and Sahih Muslim and differ on whether he prayed inside the Kabah."
  },
  "temporary_marriage_mutah_four_way_contradiction": {
    "slug": "when-was-mutah-banned",
    "title": "When Was Temporary Marriage (Mut'ah) Prohibited?",
    "description": "In one chapter of Sahih Muslim, reports place the prohibition of temporary marriage at Khaybar, Mecca or Awtas, or in the caliphate of Umar."
  },
  "farewell_sermon_bequest_three_versions": {
    "slug": "farewell-sermon-versions",
    "title": "What Did the Prophet Bequeath in the Farewell Sermon?",
    "description": "Sahih Muslim records 'the Book of God' and 'the Book of God and my household'; 'and my Sunnah' appears in Malik's Muwatta without a chain."
  },
  "early_prohibitions_burning_umayyad_coercion": {
    "slug": "bans-on-writing-hadith",
    "title": "What Early Sources Record About Writing Down Hadith",
    "description": "Sahih Muslim 3004 records an instruction not to write anything but the Quran, and al-Zuhri said scholars disliked writing hadith until rulers required it."
  },
  "quranic_epistemology_vs_ilm_al_rijal_and_zann": {
    "slug": "ilm-al-rijal-vs-quran",
    "title": "Certainty or Probability? Classical Views on Hadith",
    "description": "Al-Shafi'i, al-Ghazali and Ibn al-Salah said single-chain reports yield probable belief (zann), read here beside Quran 9:101 and 10:36."
  },
  "unfulfilled_eschatological_horizon_800ce_cutoff": {
    "slug": "hour-before-boy-grows-old",
    "title": "The Hour and the Boy: Bukhari 6167 and Muslim 2953",
    "description": "Asked when the Hour would come, the Prophet points to a boy in Bukhari 6167 and Muslim 2953; a variant reads 'your hour.' The case compares the wordings."
  },
  "second_fitnah_eschatology_ibn_al_zubayr": {
    "slug": "army-swallowed-by-desert",
    "title": "The Army Swallowed by the Desert (Muslim 2882-2884)",
    "description": "In Sahih Muslim 2882-2884, people in Ibn al-Zubayr's Mecca apply the report of an army swallowed by the desert to their day; Bukhari 2118 omits that setting."
  },
  "constantinople_and_basra_banu_qantura_traditions": {
    "slug": "basra-constantinople-prophecies",
    "title": "Constantinople and Basra in Hadith Prophecy Reports",
    "description": "Reports on Constantinople and Basra, some carrying 8th-century details such as Maslamah's 717 AD siege, set beside classical commentary."
  },
  "asymmetric_companion_distribution_abu_hurayrah_ibn_abbas": {
    "slug": "abu-hurayrah-number-of-hadith",
    "title": "How Many Hadiths Did Each Companion Narrate?",
    "description": "Classical tallies credit 5,374 hadiths to Abu Hurayrah and 1,660 to Ibn Abbas, compared with 1,361 for the first four caliphs combined."
  },
  "abu_hurayrah_internal_sahih_transmission_errors": {
    "slug": "seven-day-creation-hadith",
    "title": "Whose Words? Classical Critics on Muslim 2789",
    "description": "Al-Bukhari and Ibn Taymiyyah attributed Sahih Muslim 2789 to Ka'b al-Ahbar, and Ibn Hajar noted Abu Hurayrah's own commentary in Bukhari 136."
  },
  "bukhari_corpus_metrics_and_exclusion_ratio": {
    "slug": "bukhari-600000-hadith",
    "title": "How al-Bukhari Selected His Sahih from 600,000 Reports",
    "description": "Classical biographies report that al-Bukhari chose about 2,602 unique texts from 600,000 circulating reports and said he knew 200,000 non-authentic ones."
  },
  "hisham_ibn_urwah_ikhtilat_and_kufan_muammarun": {
    "slug": "hisham-ibn-urwah-memory",
    "title": "Hisham ibn Urwah's Iraqi Reports and Long-Lived Narrators",
    "description": "Classical critics on Hisham ibn Urwah's memory in old age and his reports in Iraq, and on Kufan narrators recorded as living past 120 years."
  },
  "sahifat_ali_divergent_scrolls_and_mount_thawr": {
    "slug": "mount-thawr-in-medina",
    "title": "Ali's Scroll and Mount Thawr in Sahih Muslim 1370a",
    "description": "Five chains give different contents for the scroll in Ali's scabbard; Muslim 1370a names Mount Thawr, while Bukhari 1870 reads 'such-and-such.'"
  },
  "editorial_redaction_cave_hira_and_ten_promised_paradise": {
    "slug": "cave-hira-story-hadith",
    "title": "The Cave Hira Account in Bukhari 3 and Bukhari 6982",
    "description": "Sahih al-Bukhari 6982 includes al-Zuhri's phrase 'according to what reached us' in the Cave Hira account, a phrase not present in Bukhari 3."
  },
  "empirical_proof_of_retrojection_raf_across_compilations": {
    "slug": "scholar-quotes-become-hadith",
    "title": "Sayings in Early Collections and Later Prophetic Chains",
    "description": "The early Musannaf of Abd al-Razzaq records some sayings as al-Zuhri's or a Companion's; later collections such as Bukhari 7118 attribute them to the Prophet."
  },
  "green_arabia_hadith_classical_raf_doubt_and_translation_shift": {
    "slug": "green-arabia-hadith",
    "title": "How Classical Scholars Read the 'Green Arabia' Hadith",
    "description": "Sufyan al-Thawri was unsure Suhayl attributed Sahih Muslim 157c to the Prophet, and classical commentators read its verb ta'ud as 'becomes.'"
  },
  "hafs_ibn_sulayman_rijal_condemnation": {
    "slug": "hafs-ibn-sulayman",
    "title": "How Hadith Critics Graded Hafs ibn Sulayman",
    "description": "Most printed Qurans follow Hafs ibn Sulayman's transmission; in hadith, Ahmad is reported calling him 'abandoned' and Ibn Ma'in calling him a liar."
  },
  "systemic_defects_canonical_qurra_and_tabari": {
    "slug": "hadith-critics-quran-reciters",
    "title": "How Hadith Critics and al-Tabari Assessed Quran Reciters",
    "description": "Classical biographical notices on canonical Quran transmitters such as Hisham ibn Ammar and Qalun, alongside al-Tabari's comments on some readings."
  },
  "tadlis_common_links_and_circular_exemption": {
    "slug": "tadlis-in-bukhari-and-muslim",
    "title": "How Scholars Treated 'From' Chains in Bukhari and Muslim",
    "description": "Ibn al-Salah presumed that 'from' (an) links by mudallis narrators in Bukhari and Muslim were heard; al-Mizzi and Ibn Daqiq al-Id called it an assumption."
  },
  "muslim_rejection_of_liqa_and_broken_chains": {
    "slug": "imam-muslim-narrators-meeting",
    "title": "Imam Muslim on Whether Narrators Had to Meet",
    "description": "In the Introduction to his Sahih, Imam Muslim argues that a valid chain needs narrators who were contemporaries, not proof that they met in person."
  },
  "pragmatic_retention_and_solitary_reports": {
    "slug": "disputed-hadith-narrators",
    "title": "How Classical Scholars Handled Disputed Narrators",
    "description": "Al-Dhahabi, Ibn Hibban and Judge Umar ibn Habib explain the practical reasons hadith scholars retained some disputed narrators and solitary chains."
  },
  "pious_falsehood_and_late_isnad_emergence": {
    "slug": "muslim-introduction-pious-narrators",
    "title": "Imam Muslim's Introduction on Pious Narrators and Chains",
    "description": "In the Introduction to Sahih Muslim, Yahya al-Qattan notes unintended falsehood by pious narrators, and Ibn Sirin dates when chains were first requested."
  }
};
/** Wikidata entities for Article.about (verified against the Wikidata API). */
export const WIKIDATA_ABOUT = [
  { '@type': 'Thing', name: 'Hadith', sameAs: 'https://www.wikidata.org/wiki/Q234343' },
  { '@type': 'Book', name: 'Sahih al-Bukhari', sameAs: 'https://www.wikidata.org/wiki/Q1023470' },
  { '@type': 'Book', name: 'Sahih Muslim', sameAs: 'https://www.wikidata.org/wiki/Q886659' },
];
