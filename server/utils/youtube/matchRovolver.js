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

const convertedDuration = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);

  return (hours * 3600 + minutes * 60 + seconds) * 1000;
};

const titleSimilarity = (a, b) => {
  const aWords = new Set(normalizeText(sanitizeTitle(a)).split(" "));
  const bWords = new Set(normalizeText(sanitizeTitle(b)).split(" "));

  const intersection = [...aWords].filter((w) => bWords.has(w));
  return intersection.length / Math.max(aWords.size, bWords.size);
};

const artistMatchScore = (artist1, artist2) => {
  const text = normalizeText(artist1);
  return text.includes(normalizeText(artist2)) ? 1 : 0;
};

const durationScore = (spotifyMs, youtubeMs) => {
  const duration = convertedDuration(spotifyMs);
  const diff = Math.abs(duration - youtubeMs);

  if (diff < 2000) return 1; // perfect
  if (diff < 5000) return 0.7; // acceptable
  if (diff < 10000) return 0.3; // weak
  return 0;
};

export const matchScore = (youtubeTrack, spotifyTrack) => {
  let score = 0;

  // 1️⃣ Title similarity (40%)

  score += titleSimilarity(spotifyTrack.title, youtubeTrack.title) * 40;

  // 2️⃣ Artist presence (30%)

  score += artistMatchScore(spotifyTrack.artists, youtubeTrack.artists) * 30;

  // 3️⃣ Duration closeness (30%)

  score += durationScore(spotifyTrack.duration, youtubeTrack.duration) * 30;

  return Math.round(score);
};

export const findBestMatch = (youtubeTracks, spotifyTrack) => {
  let best = null;
  let highestScore = 0;

  for (const yt of spotifyTrack) {
    const score = matchScore(yt, youtubeTracks);

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
