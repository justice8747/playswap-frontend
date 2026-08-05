// --- HELPER: String Normalizer ---
const normalize = (str) => {
  return str
    ? str
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
    : "";
};

// --- HELPER: Similarity Score (0 to 1) ---
const getSimilarity = (s1, s2) => {
  const a = normalize(s1);
  const b = normalize(s2);
  if (a === b) return 1.0;
  if (!a || !b) return 0.0;

  // Simple "includes" check for partial matches (e.g. "feat. X")
  if (a.includes(b) || b.includes(a)) return 0.9;

  // Basic Levenshtein implementation for this example
  const len = Math.max(a.length, b.length);
  const dist = levenshteinDistance(a, b); // See implementation below
  return 1 - dist / len;
};

// --- MAIN MAPPING FUNCTION ---
export const findBestMatch = (spotifyTrack, candidates) => {
  let bestMatch = null;
  let highestScore = -1;

  for (const candidate of candidates) {
    let score = 0;

    // A. TYPE CHECK (Priority: SONG > VIDEO)
    // Songs are official audio tracks on YT Music. Videos are often uploads.
    // if (candidate.type === "SONG") score += 30;

    // B. ARTIST MATCH (Critical)
    // Spotify: "Jessie Mueller" vs Candidate: "Jessie Mueller"
    const artistName =
      typeof candidate.artist === "object"
        ? candidate.artist.name
        : candidate.artist;
    const artistScore = getSimilarity(spotifyTrack.primaryArtist, artistName);

    // If artist is completely wrong, punish heavily
    if (artistScore < 0.5) score -= 100;
    score += artistScore * 50; // Max 40 points

    // C. TITLE MATCH
    const titleScore = getSimilarity(spotifyTrack.title, candidate.title);

    score += titleScore * 50; // Max 30 points

    // Update Winner
    if (score > highestScore) {
      highestScore = score;
      bestMatch = { ...candidate, score };
    }
  }

  // Threshold: If the best score is garbage, return null
  return highestScore > 80 ? bestMatch : null;
};

// --- Minimal Levenshtein Implementation ---
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1))
        matrix[i][j] = matrix[i - 1][j - 1];
      else
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1),
        );
    }
  }
  return matrix[b.length][a.length];
}

export const FAILURE_REASONS = {
  NO_RESULTS: "NO_RESULTS",
  LOW_CONFIDENCE: "LOW_CONFIDENCE",
  API_ERROR: "API_ERROR",
  SKIPPED: "SKIPPED",
};
