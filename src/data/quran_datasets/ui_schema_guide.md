# Non-Uthmanic Codices Dataset: Schema & Organization Guide

This document is intended for an LLM agent that will be tasked with designing and building a UI to present the "Non-Uthmanic Quranic Codices" dataset. It provides a precise explanation of the directory structure, file schemas, and data edge cases so the agent can properly ingest and display the information.

## 1. Directory Structure

The dataset files will all be located together in a single directory (the UI app sources directory) and will consist of:
- `master_variants.json`: A master compilation of all variants grouped by Surah and Ayah.
- Individual companion codex files (e.g., `Aisha.json`, `Abdullah_bin_Masud.json`): Each containing the specific variants and virtues for that companion.

## 2. File Schemas

### A. `master_variants.json`
This file groups all textual variants by their location in the Quran (`surah` and `ayah`). This is useful for building a UI view where a user explores the Quran sequentially and sees all known variants for a given verse.

**Schema:** Array of Objects
```json
[
  {
    "surah": "24",
    "ayah": 15,
    "variants": [
      {
        "companion_codex": "Aisha",
        "variant_arabic": "إِذْ تَلِقُونَهُ بِأَلْسِنَتِكُمْ",
        "variant_english": "Ida taliqunahu bi-alsinatikum (As you tell lie with your tongues.)",
        "source_reference": "Sahih al-Bukhari 4144",
        "hadith_arabic": "حَدَّثَنِي يَحْيَى ...",
        "hadith_english": "Narrated Ibn Abi Mulaika:`Aisha used to recite this Verse:...",
        "sunnah_url": "https://sunnah.com/bukhari/64/188"
      }
    ]
  }
]
```
**Key Fields:**
- `surah` (String): The chapter number (e.g., `"24"`). Note that this can also be `"unknown"` (see edge cases).
- `ayah` (Integer): The verse number (e.g., `15`). Note that this can also be `0` (see edge cases).
- `variants` (Array of Objects): A list of all reading variants for this specific verse across all companions.
- `companion_codex` (String): The name of the companion who recited this variant.
- `variant_arabic` / `variant_english` (String): The specific textual variant extracted from the hadith, explicitly expanded into the **full context of the verse**. The UI should present this as a complete recitation block (e.g. "Read like this: ..."). In some cases, `variant_english` may contain explanatory notes in parentheses (e.g., `(plural of joy)`) to clarify subtle differences.
- `hadith_arabic` / `hadith_english` (String): The full context of the hadith mentioning the variant. Note that `hadith_english` may sometimes contain brackets like `[omitted from the original translation: ...]` at the very end, indicating where an LLM has patched missing text that was omitted by the original source translators.
- `source_reference` (String): The traditional citation (e.g., "Sahih al-Bukhari 4144").
- `sunnah_url` (String): A direct link to the hadith on Sunnah.com.

### B. Individual Codex Files (e.g., `<Companion_Name>.json`)
These files group the variants by the specific companion (e.g., `Aisha.json`). This is useful for building a UI view where a user explores a specific historical figure's personal copy (codex) of the Quran.

**Schema:** Single Object
```json
{
  "person": "Aisha",
  "virtues": [
    {
      "hadith_arabic": "عَنْ أَبِي مُوسَى الأَشْعَرِيِّ ...",
      "hadith_english": "Narrated Abu Musa Al-Ash'ari: The Prophet (ﷺ) said, '...the superiority of 'Aisha to other women...'",
      "source_reference": "Sahih al-Bukhari 3768",
      "sunnah_url": "https://sunnah.com/bukhari:3768"
    }
  ],
  "variants": [
    {
      "surah": "unknown",
      "ayah": 0,
      "variant_arabic": "عَشْرُ رَضَعَاتٍ مَعْلُومَاتٍ يُحَرِّمْنَ ... خَمْسٍ مَعْلُومَاتٍ",
      "variant_english": "ten clear sucklings make the marriage unlawful, then it was abrogated (and substituted) by five sucklings",
      "source_reference": "Sahih Muslim 3597",
      "hadith_arabic": "حَدَّثَنَا يَحْيَى بْنُ يَحْيَى ...",
      "hadith_english": "A'isha (Allah be pleased with her) reported that it had been revealed in the Holy Qur'an...",
      "sunnah_url": "https://sunnah.com/muslim/17/30"
    }
  ]
}
```
**Key Fields:**
- `person` (String): The normalized name of the companion.
- `virtues` (Array of Objects): A list of authentic hadiths praising this specific companion and establishing their credibility/trustworthiness. This is highly relevant for a UI profile page for the companion.
- `variants` (Array of Objects): All the Quranic reading variants attributed to this companion. The fields inside each variant object are identical to those found in `master_variants.json`, except `companion_codex` is omitted since it is implied by the `person` field.

## 3. Important Edge Cases for UI Design

When designing the UI, the agent must account for the following edge cases in the data:

1. **"Unknown" Surahs:**
   Not all variants map cleanly to the standard Uthmanic compilation. Some verses existed but are entirely missing from the current Quran (e.g., the verse regarding adult suckling). 
   - In these cases, the data explicitly uses `"surah": "unknown"`.
   - The UI should have a dedicated way to display these "lost" or unplaced verses, rather than failing to parse an integer.

2. **Ayah `0`:**
   Whenever a verse is completely missing or its exact placement is ambiguous, it is assigned `"ayah": 0`. The UI should not display "Verse 0" literally, but rather treat it as a special flag indicating an unnumbered or unplaced verse within that Surah (or within an "unknown" Surah).

3. **"Unknown" Codex:**
   There is a file named `Unknown.json`. This is used for reading variants that are found in the authentic hadith corpus but lack a direct attribution to a specific, named companion. The UI should treat this as a generic bucket for anonymous variants rather than a literal person.

## 4. Suggested UI Views

Based on this schema, a UI should ideally support at least two primary navigation paths:
- **By Verse (Quran-centric):** A user browses standard Surahs and Ayahs. If a verse has variants, the UI shows a badge or indicator. Clicking it reveals the variations from different companions. (Driven by `master_variants.json`).
- **By Companion (Codex-centric):** A user selects a companion (e.g., Ibn Masud). They can read about the companion's `virtues` (to establish authority) and then browse all the unique readings that belonged exclusively to their historical codex. (Driven by the individual companion JSON files).
