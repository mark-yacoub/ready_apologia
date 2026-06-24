// src/utils/topicColors.js

export const appleColors = [
  { name: 'Indigo', hex: '#5856D6', bgHex: '#EAEAF7' },
  { name: 'Forest', hex: '#34C759', bgHex: '#EAF8ED' },
  { name: 'Crimson', hex: '#FF3B30', bgHex: '#FFEDEC' },
  { name: 'Slate Blue', hex: '#007AFF', bgHex: '#E5F1FF' },
  { name: 'Teal', hex: '#5AC8FA', bgHex: '#EEF9FF' },
  { name: 'Plum', hex: '#AF52DE', bgHex: '#F6ECFA' },
  { name: 'Orange', hex: '#FF9500', bgHex: '#FFF4E5' },
  { name: 'Rose', hex: '#FF2D55', bgHex: '#FFE9ED' },
];

const explicitTopicIndices = {
  'divinity_of_christ': 3,          // Slate Blue
  'divinity_of_the_holy_spirit': 4, // Teal
  'trinity': 0,                     // Indigo
  'prophecies': 6,                  // Orange
};

export function getTopicColor(topicId) {
  if (!topicId) return appleColors[3]; // default Slate Blue
  if (explicitTopicIndices[topicId] !== undefined) {
    return appleColors[explicitTopicIndices[topicId]];
  }
  // deterministic hash fallback
  let hash = 2166136261;
  for (let i = 0; i < topicId.length; i++) {
    hash ^= topicId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const index = Math.abs(hash) % appleColors.length;
  return appleColors[index];
}
