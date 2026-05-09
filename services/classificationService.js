export const classifyEmergency = (description) => {
  const desc = description.toLowerCase().trim();

  const fireKeywords = ['fire', 'smoke', 'burn', 'blaze', 'explosion', 'flames'];
  const ambulanceKeywords = [
    'heart', 'breath', 'bleed', 'unconscious', 'injury', 'accident', 'pain', 'sick', 'medical'
  ];
  const policeKeywords = [
    'robbery', 'gun', 'knife', 'assault', 'fight', 'break in', 'stolen', 'murder', 'intruder'
  ];

  const matchesKeyword = (text, keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(text);
  };

  let scores = { ambulance: 0, fire: 0, police: 0 };

  fireKeywords.forEach(kw => {
    if (matchesKeyword(desc, kw)) scores.fire++;
  });

  ambulanceKeywords.forEach(kw => {
    if (matchesKeyword(desc, kw)) scores.ambulance++;
  });

  policeKeywords.forEach(kw => {
    if (matchesKeyword(desc, kw)) scores.police++;
  });

  const totalMatches = scores.fire + scores.ambulance + scores.police;

  if (totalMatches === 0) {
    return { type: 'ambulance', confidence: 0 };
  }

  const maxScore = Math.max(scores.ambulance, scores.fire, scores.police);

  const topMatches = Object.entries(scores).filter(
    ([, value]) => value === maxScore
  );

  let type;

  if (topMatches.length > 1) {
    type = 'ambulance';
  } else {
    type = topMatches[0][0];
  }

  const confidence = maxScore / totalMatches;

  if (confidence < 0.3) {
    type = 'ambulance';
  }

  return { type, confidence };
};