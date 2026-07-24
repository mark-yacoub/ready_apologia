import { decodeUnicodeEscapes } from './sanitizeData.js';

export const coordinatesMap = {
  "Frankfurt, Germany": [50.1109, 8.6821],
  "Capernaum, Israel": [32.8811, 35.5750],
  "Rome, Italy": [41.9028, 12.4964],
  "Megiddo, Israel": [32.5833, 35.1833],
  "Dura-Europos, Syria": [34.7470, 40.7300],
  "Aphroditopolis, Egypt": [29.418, 31.258],
  "Autun, France": [46.95, 4.3],
  "Constan\u021ba, Romania": [44.173, 28.638],
  "Coptos, Egypt": [25.998, 32.812],
  "Deir Ali, Syria": [33.279, 36.315],
  "Dishna, Egypt": [26.126, 32.476],
  "Egypt": [26.82, 30.80],
  "Egypt or Syria": [30.0, 33.0],
  "El Minya, Egypt": [28.11, 30.75],
  "Fayum, Egypt": [29.3, 30.84],
  "Jabal Abu Mana, Egypt": [26.3, 32.5],
  "Oxyrhynchus, Egypt": [28.53, 30.65],
  "Pabau, Egypt": [26.07, 32.32],
  "Phrygia, Turkey": [39.0, 30.5],
  "Qarara, Egypt": [28.6, 30.8],
  "Sackler Library (Bodleian Libraries), Oxford": [51.75, -1.26],
  "Thebes, Egypt": [25.72, 32.61],
};

export function getCountry(locRaw) {
  if (!locRaw || locRaw === "Unknown") return "Unknown";
  if (locRaw.includes("Oxford")) return "United Kingdom";
  if (locRaw === "Egypt or Syria") return "Egypt/Syria";
  const parts = locRaw.split(", ");
  return parts[parts.length - 1];
}

export function getTimelineViewData(rawDivinityTimeline) {
  const divinityTimeline = decodeUnicodeEscapes(rawDivinityTimeline);
  const sortedEvents = [...divinityTimeline].sort((a, b) => a.date_int - b.date_int);
  
  return sortedEvents.map(e => {
    const dateInt = e.date_int || 0;
    const cent = Math.floor(dateInt / 100) + 1;
    const centuryLabel = cent === 1 ? "1st Century" : cent === 2 ? "2nd Century" : cent === 3 ? "3rd Century" : cent + "th Century";
    const locRaw = (e['location found']) || "Unknown";
    const countryCode = getCountry(locRaw);
  
    return {
      id: e.id,
      category: e.category || "Unknown",
      title: e.Title,
      displayDate: e['date string'],
      sortDate: e.date_int,
      centuryLabel: centuryLabel,
      shortSummary: e['short summary'] || null,
      location: locRaw,
      country: countryCode, 
      description: e.Description || null,
      photos: e.photos || [],
      videos: e.videos || [],
      links: e.links || [],
      quotes: e.quotes || [],
      coords: coordinatesMap[locRaw] || [31.76, 35.21]
    };
  });
}
