# Quran Hafs Data

This directory contains the Quran text in Arabic (Hafs standard, Uthmani script) formatted for easy consumption in JS/Astro applications, with English metadata for Surah names (transliteration) and types.

## Directory Structure

*   `meta.json`: Contains metadata for all 114 Surahs (chapters). Useful for navigation and listings.
*   `surahs/`: Directory containing individual JSON files for each Surah (named `1.json` through `114.json`).

## Data Schemas

### `meta.json`
An array of Surah metadata objects:
```json
[
  {
    "id": 1,
    "name": "الفاتحة",
    "transliteration": "Al-Fatihah",
    "type": "meccan",
    "total_verses": 7
  },
  {
    "id": 2,
    "name": "البقرة",
    "transliteration": "Al-Baqarah",
    "type": "medinan",
    "total_verses": 286
  },
  ...
]
```

### `surahs/{id}.json` (e.g., `surahs/1.json`)
Each Surah file contains metadata and a `verses` object which maps verse numbers (as strings) to their text.
```json
{
  "id": 1,
  "name": "الفاتحة",
  "transliteration": "Al-Fatihah",
  "type": "meccan",
  "total_verses": 7,
  "verses": {
    "1": "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
    "2": "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ",
    ...
    "7": "صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيۡهِمۡ..."
  }
}
```
