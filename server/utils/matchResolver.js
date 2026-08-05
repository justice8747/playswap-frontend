const sanitizeTitle = (text) => {
  let clean = text.toLowerCase();
  clean = clean.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "");
  const noiseWords = [
    "official video",
    "official audio",
    "lyrics",
    "visualizer",
    "music video",
    "hd",
    "4k",
    "hq",
    "remastered",
    "feat",
    "ft",
  ];

  noiseWords.forEach((word) => {
    clean = clean.replace(new RegExp(`\\b${word}\\b`, "g"), "");
  });

  return clean;
};

const normalizeText = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Collapse spaces
    .trim();

const titleSimilarity = (a, b) => {
  const aWords = new Set(normalizeText(sanitizeTitle(a)).split(" "));
  const bWords = new Set(normalizeText(sanitizeTitle(b)).split(" "));

  const intersection = [...aWords].filter((w) => bWords.has(w));
  return intersection.length / Math.max(aWords.size, bWords.size);
};

const artistMatchScore = (artists, ytTitle, ytChannel) => {
  const text = normalizeText(`${ytTitle} ${ytChannel}`);
  return artists.some((a) => text.includes(normalizeText(a))) ? 1 : 0;
};

const durationScore = (spotifyMs, youtubeMs) => {
  const diff = Math.abs(spotifyMs - youtubeMs);

  if (diff < 2000) return 1; // perfect
  if (diff < 5000) return 0.7; // acceptable
  if (diff < 10000) return 0.3; // weak
  return 0;
};

export const matchScore = (spotifyTrack, youtubeTrack) => {
  let score = 0;

  // 1️⃣ Title similarity (40%)
  score += titleSimilarity(spotifyTrack.title, youtubeTrack.title) * 60;

  // 2️⃣ Artist presence (30%)
  score += artistMatchScore(spotifyTrack.artists, youtubeTrack.artist) * 40;

  return Math.round(score);
};

export const findBestMatch = (spotifyTrack, youtubeTracks) => {
  let best = null;
  let highestScore = 0;
  for (const yt of youtubeTracks) {
    const score = matchScore(spotifyTrack, yt);

    if (score > highestScore) {
      highestScore = score;
      best = { ...yt, score };
    }
  }
  return highestScore >= 70 ? best : null; // confidence threshold
};

export const FAILURE_REASONS = {
  NO_RESULTS: "NO_RESULTS",
  LOW_CONFIDENCE: "LOW_CONFIDENCE",
  API_ERROR: "API_ERROR",
  SKIPPED: "SKIPPED",
};
