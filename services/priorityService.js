// services/priorityService.js

// 🛠️ Utility to safely build regex matchers once
const buildMatchers = (keywords) => {
  return keywords.map((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i');
  });
};

// 🔥 Keyword definitions
const highKeywords = [
  'critical', 'unconscious', 'bleeding', 'explosion', 'gun', 'murder',
  'spreading', 'heart attack', 'not breathing', 'trapped',
  'severe', 'life-threatening'
];

const mediumKeywords = [
  'accident', 'injury', 'smoke', 'robbery', 'fight', 'pain', 'broken',
  'fracture', 'collision'
];

// ⚡ Precompile regex (performance optimization)
const highMatchers = buildMatchers(highKeywords);
const mediumMatchers = buildMatchers(mediumKeywords);

// 🚨 Main function
export const determinePriority = (description) => {
  // 🛡️ Defensive check
  if (!description || typeof description !== 'string') {
    return 'LOW';
  }

  const desc = description.toLowerCase().trim();

  // 🔥 Check HIGH priority first
  for (const re of highMatchers) {
    if (re.test(desc)) return 'HIGH';
  }

  // ⚡ Then MEDIUM
  for (const re of mediumMatchers) {
    if (re.test(desc)) return 'MEDIUM';
  }

  // 🟢 Default
  return 'LOW';
};