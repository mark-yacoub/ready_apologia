# Non-Uthmanic Quranic Variants Database

This directory contains a strictly curated dataset of Quranic textual variants, lost verses, and differing codices that are preserved in the two most authentic Sunni Hadith collections: Sahih al-Bukhari and Sahih Muslim.

This dataset is designed to be ingested by a UI or frontend application to visualize how the Quran was recited differently by major companions of Prophet Muhammad, and to highlight passages that are missing from the modern Uthmanic standard without a clear prophetic correction.

## File Structure

- `master_variants.json`: The primary database file. It groups all found variants sequentially by Surah and Ayah.
- `codices/`: A directory containing individual JSON files for each companion (e.g., `Ibn_Masud.json`, `Aisha.json`, `Umar_bin_Al-Khattab.json`). These files contain only the variants recited or claimed by that specific companion, allowing for the visualization of their personal "Codex".

## Data Schema & Definitions

The JSON structure in `master_variants.json` is a list of objects grouped by Surah and Ayah:

```json
[
  {
    "surah": 92,
    "ayah": 3,
    "variants": [
      {
        "companion_codex": "Abdullah bin Masud",
        "variant_arabic": "وَالذَّكَرِ وَالأُنْثَى",
        "variant_english": "By the male and the female.",
        "source_reference": "Sahih al-Bukhari 4944",
        "hadith_arabic": "...",
        "hadith_english": "...",
        "sunnah_url": "https://sunnah.com/bukhari/65/465",
        "is_abrogated_in_recitation": false
      }
    ]
  }
]
```

### Key Fields and How to Interpret Them:

1.  **`surah` (Integer / String):** The Quranic Surah (chapter) number. 
    *   **"unknown"**: If the `surah` is the string `"unknown"`, it means the variant represents a lost verse or passage where the hadith does not explicitly state which Surah it originally belonged to (e.g., the Verse of Stoning, or the martyrs of Bir Ma'una).
    *   **String ranges (e.g., "113-114")**: Used for variants that span multiple Surahs, such as Ibn Mas'ud's exclusion of Surahs 113 and 114 from his codex.

2.  **`ayah` (Integer):** The Ayah (verse) number.
    *   **`0` (or null)**: Means the hadith specifies the Surah but does not specify the exact verse, or the variant is an entire lost Surah/passage.

3.  **`companion_codex` (String):** The name of the companion who recited or swore by this variant (e.g., "Aisha", "Umar bin Al-Khattab", "Abdullah bin Masud"). This is used to map the variant to a specific personal codex.

4.  **`variant_arabic` & `variant_english` (String):** The explicit wording of the changed or missing verse.
    *   *Rule applied*: Every entry must explicitly provide the wording. The only exception is for undeniable, universally recognized lost verses (like the "Verse of Stoning" / `آيَةُ الرَّجْمِ`) where the hadith explicitly names the lost verse even if it doesn't quote it entirely.

5.  **`source_reference` (String):** The primary reference number (e.g., "Sahih Muslim 1691a"). All references strictly point to either Sahih Bukhari or Sahih Muslim.

6.  **`hadith_arabic` & `hadith_english` (String):** The full text of the hadith for context.
    *   **Omissions Fixed:** In many cases, modern English translators of hadiths dishonestly omitted the variant wording and copy-pasted the standard Uthmanic translation. Whenever our AI detected this, the `hadith_english` field was patched with: `[omitted from the english translation: <actual translation of variant>]` at the bottom of the text. The UI should highlight these bracketed patches.

7.  **`is_abrogated_in_recitation` (Boolean):** 
    *   `true`: The hadith explicitly uses terminology like "till it was abrogated" or "later cancelled". 
    *   `false`: The hadith does not claim the verse was abrogated, meaning it disappeared without explicit divine cancellation in the text of the hadith.

## Strict Methodology & Filtering Criteria

To ensure this dataset is bulletproof, the following strict rules were applied during data collection:

1.  **Strictly Bukhari and Muslim:** No weak hadiths, histories, or secondary collections were used. Only the two most authentic Sunni sources.
2.  **Explicit Wording Only:** Vague hadiths stating "he recited it differently" without providing the actual words were purged. The data must explicitly show *what* the words were.
3.  **No Assumed Mappings:** If a hadith claims a verse was lost but doesn't say where it belonged, it was mapped to `surah: "unknown", ayah: 0`. We refused to make logical assumptions (e.g., placing the Stoning Verse in Surah 33) to maintain total factual accuracy.
4.  **No "Prophetic Corrections":** Hadiths where a companion recites a variant but the Prophet Muhammad explicitly corrects them to the standard Uthmanic reading (e.g., the *Fahal-min-Muddakir* hadith) were **purged**. The dataset only contains variants where the companion insisted it was taught by the Prophet and was never corrected, or where the Prophet himself affirmed the variant.
5.  **No Dua / Supplications:** Hadiths describing variant wordings for personal prayers (e.g., Tahajjud dua) were purged. Only strict Quranic recitations are included.
