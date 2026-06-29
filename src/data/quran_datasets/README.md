# Bridges Qira'at Data Integration Guide

This directory contains the compiled dataset for the **Bridges' Translation of the Ten Qira'at** designed to be consumed directly by a mobile or web frontend user interface (such as a Catena App integration).

## 1. Directory Contents

*   **`[qari_name].json`** (e.g., `nafi.json`, `asim.json`): 10 sparse JSON databases, one for each canonical Qari.
*   **`surahs_metadata.json`**: Static helper mapping Surah numbers to their Arabic names, English transliterations, translations, and revelation types.
*   **`README.md`**: This guide.

---

## 2. The Data Paradigm: Sparse JSON Databases

To optimize frontend bandwidth and memory usage, the 10 recitations are compiled as **Sparse Databases**. They do **not** contain the full 6,236 verses of the Quran. Instead, they contain **only the verses where that Qari's transmitters deviate from the standard Hafs text**.
- The master exceptions list contains **833 verses** with Qira'at footnotes.
- If a Qari only deviates in 150 verses, their JSON file will only contain 150 entries.

### Frontend UI Integration Logic
The frontend application should load a standard base English translation (e.g., Hafs or Droge) as the baseline. When a user selects a specific Qari (e.g., Nafi'), the UI should loop through the standard verses and attempt to resolve overrides from the Qari's sparse DB:

```javascript
// Example Javascript UI logic
const baseVerseText = base_db[verse_id]; // standard Hafs translation
const qariOverride = nafi_db[verse_id];

let displayText = baseVerseText;
if (qariOverride) {
  // If the user selected a specific transmitter (Rawi), e.g., Warsh
  if (selectedRawi === 'Warsh') {
    displayText = qariOverride.warsh_text;
  } else if (selectedRawi === 'Qalun') {
    displayText = qariOverride.qalun_text;
  }
}
```

---

## 3. Compiled JSON Schema Guide

Each entry in a Qari's JSON file (keyed by the Hafs ID `Surah:Verse`) conforms to the following schema:

### Example: Nafi' exception for verse `1:4`
```json
"1:4": {
  "hafs_id": "1:4",
  "base_text": "Master of the Day of Recompense.",
  "qalun_text": "King of the Day of Recompense.",
  "warsh_text": "King of the Day of Recompense.",
  "warsh_ar_text": "مَلِكِ يَوْمِ اِ۬لدِّينِۖ",
  "qalun_ar_text": "مَلِكِ يَوْمِ اِ۬لدِّينِۖ",
  "warsh_nquran_link": null,
  "qalun_nquran_link": null,
  "qalun_reason_of_change": "VOWEL DIFFERENCES",
  "warsh_reason_of_change": "VOWEL DIFFERENCES",
  "qalun_change_category": "Voice/Tense Shift",
  "warsh_change_category": "Voice/Tense Shift"
}
```

### Property Reference

| Property Name | Type | Description |
| :--- | :--- | :--- |
| `hafs_id` | `string` | The universal Kufan/Hafs numbering key (e.g., `"1:4"` or `"2:10"`). |
| `base_text` | `string` | The baseline Hafs English translation of this verse. |
| `[rawi]_text` | `string` | The English translation override for the specific Rawi (transmitter). If they agree with Hafs, it defaults to the `base_text`. |
| `[rawi]_ar_text` | `string` or `null` | The verified Uthmanic Arabic text for this specific Rawi. Digitized texts are available for 8 major Rawis. For the remaining 12 minor Rawis, this field is `null`. |
| `[rawi]_nquran_link`| `string` or `null` | A fallback link pointing directly to the specific variant verse and Rawi on NQuran.com. This is populated **only if `_ar_text` is `null`** and NQuran supports that Rawi. |
| `[rawi]_reason_of_change` | `string` or `null` | The grammatical root cause of the variation in the Arabic Uthmanic script (see classifications below). |
| `[rawi]_change_category` | `string` or `null` | The resulting semantic shift in the English translation (see classifications below). |

---

## 4. Classifications and Filters

Downstream applications can use these classifications to build pill badges, menus, or filtering criteria in the UI.

### A. The Arabic Root Cause (`reason_of_change`)
Defines exactly how the Uthmanic Arabic text differs from the Hafs baseline:
*   **`DIACRITICAL DIFFERENCES`**: The skeletal text (Rasm) is identical, but the dotting (I'jam) differs (e.g. `ب` vs `ت` vs `ي`). This is the root cause of pronoun shifts.
*   **`GRAPHICAL/BASIC LETTER DIFFERENCES`**: The skeleton (Rasm) differs slightly (e.g., Alif added, Ya omitted).
*   **`VOWEL DIFFERENCES`**: Both the skeleton and dots are identical, but the vowel marks (Harakat) differ (e.g. Fatha `a` vs Kasra `i`).
*   **`EXTRA WORDS`**: An entire word (such as a conjunction like *waw* `و`) is added or omitted.
*   **`UNKNOWN`**: Fallback when classification is not possible.
*   **`null`**: The Rawi does not deviate from Hafs for this verse.

### B. The English Semantic Impact (`change_category`)
Defines how the Arabic change manifests in the English translation:
*   **`Pronoun/Person Shift`**: Changes between perspectives (e.g., "He" vs "We" vs "You").
*   **`Lexical Shift`**: A completely different translated word is required (e.g., "Lie" vs "Disbelieve").
*   **`Voice/Tense Shift`**: Changes from Active to Passive voice, or tense changes.
*   **`Addition/Omission`**: Addition or removal of prepositions/conjunctions.
*   **`Number Shift (Singular/Plural)`**: Changes between singular and plural forms (e.g., "wind" vs "winds").
*   **`null`**: The Rawi does not deviate from Hafs for this verse.

---

## 5. Universal Reference Mapping

There are exactly 10 Qaris, and each has exactly 2 transmitters (Rawis). 

| Qari (Reader) | Rawi 1 | Rawi 2 |
| :--- | :--- | :--- |
| **Nafi'** | Qalun | Warsh |
| **Ibn Kathir** | Bazzi | Qunbul |
| **Abu 'Amr** | Duri | Susi |
| **Ibn Amir** | Hisham | Ibn Dhakwan |
| **'Asim** | Shu'bah | Hafs (Standard) |
| **Hamzah** | Khalaf | Khallad |
| **Al-Kisa'i** | Abu Al-Harith | Duri |
| **Abu Ja'far** | 'Isa (Ibn Wardan) | Ibn Jummaz |
| **Ya'qub** | Ruways | Rawh |
| **Khalaf** | Ishaq | Idris |

*(Note: "Duri" is a Rawi for both Abu 'Amr and Al-Kisa'i. They are tracked distinctly in the datasets as `duri_abu_amr` and `duri_kisai` respectively).*

---

## 6. Surahs Metadata Schema

`surahs_metadata.json` maps each Surah number (as a string key) to its metadata block:
```json
  "2": {
    "surah_number": 2,
    "surah_name_ar": "سُورَةُ البَقَرَةِ",
    "surah_name_en": "Al-Baqara",
    "surah_name_translation": "The Cow",
    "revelation_type": "Medinan"
  }
```
This is useful for localizing Surah menus and displays in the frontend.
