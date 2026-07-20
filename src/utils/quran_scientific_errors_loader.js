import scientificErrors from '../data/quran/scientific_errors/scientific_errors.json' with { type: 'json' };

export function loadScientificErrors() {
  return scientificErrors || {};
}

export function parseExplanationString(explanationString = "") {
  return explanationString.split(' | ').map(part => {
    let label = "Scientific Error";
    let text = part.trim();

    const firstPeriodIdx = part.indexOf('. ');

    if (firstPeriodIdx !== -1) {
      label = part.substring(0, firstPeriodIdx).trim();
      text = part.substring(firstPeriodIdx + 2).trim();
    } else if (!part.includes('.')) {
      label = part.trim();
      text = "";
    }

    return { label, text };
  });
}
