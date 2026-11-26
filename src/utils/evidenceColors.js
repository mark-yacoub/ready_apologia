// src/utils/evidenceColors.js
// Editorial manuscript pigment palette — every ink color passes WCAG AA (>= 5.6:1)
// on warm paper (#fbf9f5) and white (#ffffff), with soft cotton-paper tints.

export const TOPIC_PIGMENTS = [
  { name: 'Slate Indigo', hex: '#3b4b75', bgHex: '#eef0f6', borderHex: '#cfd5e6' },
  { name: 'Deep Cypress', hex: '#33593a', bgHex: '#edf3ee', borderHex: '#c2d6c6' },
  { name: 'Oxblood',      hex: '#7a3530', bgHex: '#f6eeec', borderHex: '#dfc5c2' },
  { name: 'Slate Navy',   hex: '#2c4a6b', bgHex: '#edf2f7', borderHex: '#cbd7e4' },
  { name: 'Archive Teal', hex: '#0e5e6f', bgHex: '#e8f2f3', borderHex: '#bdd8dc' },
  { name: 'Plum Umber',   hex: '#643f5c', bgHex: '#f4eef2', borderHex: '#dbcad7' },
  { name: 'Antique Bronze', hex: '#855b26', bgHex: '#f7f1e6', borderHex: '#e3d3b6' },
  { name: 'Sienna Umber', hex: '#7c4a2d', bgHex: '#f6efe9', borderHex: '#dfc9ba' },
];

const explicitEvidenceIndices = {
  'divinity_of_christ': 3,          // Slate Navy
  'divinity_of_the_holy_spirit': 4, // Archive Teal
  'trinity': 0,                     // Slate Indigo
  'prophecies': 6,                  // Antique Bronze
  'nt_authors': 5,                  // Plum Umber
};

export function getEvidenceColor(evidenceId) {
  if (!evidenceId) return TOPIC_PIGMENTS[3]; // default Slate Navy
  if (explicitEvidenceIndices[evidenceId] !== undefined) {
    return TOPIC_PIGMENTS[explicitEvidenceIndices[evidenceId]];
  }
  // deterministic hash fallback
  let hash = 2166136261;
  for (let i = 0; i < evidenceId.length; i++) {
    hash ^= evidenceId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const index = Math.abs(hash) % TOPIC_PIGMENTS.length;
  return TOPIC_PIGMENTS[index];
}
