/**
 * Declarative Registry for Classical Islamic Exegesis (Tafseer)
 * Single Source of Truth for source paths, scholarship biographies, and UI metadata.
 */
export const TAFSEER_CONFIG = [
  {
    id: 'tabari',
    name: 'Tafsir Al-Tabari',
    displayTitle: 'Tafsir Al-Tabari (AD 883)',
    scholar: "Abu Ja'far Muhammad ibn Jarir al-Tabari (224–310 AH / 839–923 AD)",
    date: 'AD 883',
    era: 'Classical Sunni Exegesis • AD 883',
    defaultPath: 'src/data/quran/commentary/tafsir_tabari_english.json',
    arabicPath: 'src/data/quran/commentary/tafsir_tabari_arabic.json',
    aiTranslated: true,
    envKey: 'TABARI_PATH',
    authority: {
      lead: "The Foundational Exegesis (Jami' al-Bayan): Abu Ja'far Muhammad ibn Jarir al-Tabari produced the earliest comprehensive Quranic commentary to survive intact. Completed around AD 883, it established the definitive paradigm of Tafsir bil-Ma'thur (interpretation strictly anchored in documented apostolic tradition, Sahaba consensus, and earliest classical Arabic grammar).",
      detail: "Universal Scholarly Precedent: All subsequent classical Sunni scholars—including Ibn Kathir, Al-Baghawi, and Al-Qurtubi—relied directly upon Al-Tabari's recorded transmission chains (isnad) and theological precedents as their primary benchmark."
    }
  },
  {
    id: 'ibn_kathir',
    name: 'Tafsir Ibn Kathir',
    displayTitle: 'Tafsir Ibn Kathir (AD 1373)',
    scholar: 'Hafiz Imad ad-Din Ismail ibn Kathir (701–774 AH / 1301–1373 AD)',
    date: 'AD 1373',
    era: 'Classical Sunni Exegesis • AD 1373',
    defaultPath: 'src/data/quran/commentary/tafsir_ibn_kathir_catena.json',
    arabicPath: 'src/data/quran/commentary/tafsir_ibn_kathir_arabic.json',
    envKey: 'IBN_KATHIR_PATH',
    authority: {
      lead: "Universal Sunni Consensus (Tafsir al-Qur'an al-Azim): Hafiz Ibn Kathir is universally regarded across all major orthodox Sunni schools (traditional, Salafi, Ash'ari) as the most authoritative classical exegesis, praised for strictly interpreting the Quran through the Quran itself and authenticated Hadith.",
      detail: "Standard Edition: Sourced from the standard 10-volume English edition published by Dar-us-Salam Publications (supervised by Shaykh Safiur-Rahman Al-Mubarakpuri), the most widely distributed English Quranic commentary worldwide."
    }
  }
];
