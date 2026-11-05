/**
 * Hadith reference maps for /discover/muhammad-and-slavery. HAND-MAINTAINED data (no generator), from the
 * fact-checkers' resolution against the fawazahmed0 mirror of Sunnah.com. The dataset labels Muslim
 * reports by Sunnah.com's in-book numbering ("Sahih Muslim 17:41"); readers and scholars cite the
 * canonical number ("Muslim 1456a").
 *
 *   REF_MAP   in-book dataset label → canonical Sunnah.com number (every Muslim reference must be here,
 *             or the build fails).
 *   COMBINED  Bukhārī numbers that Sunnah.com files as one entry with the preceding number (identical
 *             text). The later number keeps its own chip but links to the kept page.
 *
 * Guards: the build fails on a missing or unused REF_MAP entry; scripts/verify_muhammad_slavery_quotes.mjs
 * checks each mapped text against the mirror under its canonical number.
 */

export const REF_MAP = {
  "Sahih Muslim 1:134": "68",
  "Sahih Muslim 1:135": "69",
  "Sahih Muslim 1:136": "70",
  "Sahih Muslim 1:217": "115",
  "Sahih Muslim 5:39": "537a",
  "Sahih Muslim 12:50": "997a",
  "Sahih Muslim 12:51": "997b",
  "Sahih Muslim 12:54": "999",
  "Sahih Muslim 12:222": "1074a",
  "Sahih Muslim 12:223": "1075a",
  "Sahih Muslim 12:224": "1075b",
  "Sahih Muslim 13:101": "1111a",
  "Sahih Muslim 13:103": "1111c",
  "Sahih Muslim 13:104": "1111d",
  "Sahih Muslim 13:105": "1111e",
  "Sahih Muslim 16:99": "1365c",
  "Sahih Muslim 16:100": "1365d",
  "Sahih Muslim 16:102": "1365e",
  "Sahih Muslim 16:104": "1365f",
  "Sahih Muslim 16:146": "1438a",
  "Sahih Muslim 16:148": "1438c",
  "Sahih Muslim 16:152": "1438g",
  "Sahih Muslim 16:158": "1439a",
  "Sahih Muslim 16:159": "1439b",
  "Sahih Muslim 17:41": "1456a",
  "Sahih Muslim 17:42": "1456b",
  "Sahih Muslim 17:43": "1456d",
  "Sahih Muslim 17:46": "1457a",
  "Sahih Muslim 18:40": "1479a",
  "Sahih Muslim 18:44": "1479e",
  "Sahih Muslim 20:7": "1504a",
  "Sahih Muslim 20:8": "1504b",
  "Sahih Muslim 20:9": "1504c",
  "Sahih Muslim 20:10": "1504d",
  "Sahih Muslim 20:11": "1504e",
  "Sahih Muslim 20:12": "1504f",
  "Sahih Muslim 20:13": "1504g",
  "Sahih Muslim 20:14": "1504h",
  "Sahih Muslim 20:16": "1504j",
  "Sahih Muslim 20:17": "1504k",
  "Sahih Muslim 20:18": "1505",
  "Sahih Muslim 22:81": "1202c",
  "Sahih Muslim 22:152": "1602",
  "Sahih Muslim 27:82": "1668a",
  "Sahih Muslim 27:83": "1668b",
  "Sahih Muslim 27:85": "997c",
  "Sahih Muslim 27:86": "997d",
  "Sahih Muslim 28:48": "1681a",
  "Sahih Muslim 28:49": "1681b",
  "Sahih Muslim 28:50": "1681c",
  "Sahih Muslim 28:52": "1682a",
  "Sahih Muslim 28:53": "1682b",
  "Sahih Muslim 28:56": "1683",
  "Sahih Muslim 29:48": "1703a",
  "Sahih Muslim 29:50": "1703c",
  "Sahih Muslim 29:52": "1704b",
  "Sahih Muslim 29:53": "1705a",
  "Sahih Muslim 32:1": "1730a",
  "Sahih Muslim 32:2": "1730b",
  "Sahih Muslim 32:69": "1763",
  "Sahih Muslim 32:166": "1812a",
  "Sahih Muslim 32:168": "1812c",
  "Sahih Muslim 32:170": "1812e",
  "Sahih Muslim 33:33": "1831a",
  "Sahih Muslim 36:105": "2005a",
  "Sahih Muslim 39:47": "2182b",
  "Sahih Muslim 43:94": "2323a",
  "Sahih Muslim 43:96": "2323c",
  "Sahih Muslim 43:97": "2323d",
  "Sahih Muslim 43:98": "2323e"
};

export const COMBINED = {
  "2556": 2555,
  "2584": 2583,
  "2608": 2607,
  "3132": 3131,
  "4319": 4318,
  "5760": 5759,
  "6634": 6633,
  "6828": 6827,
  "6836": 6835,
  "6838": 6837,
  "6843": 6842,
  "6860": 6859,
  "6906": 6905,
  "6908": 6907,
  "7177": 7176,
  "7194": 7193,
  "7318": 7317
};
