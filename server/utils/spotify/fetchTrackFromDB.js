import client from "../../database/connectDB.js";
export const fetchTrackFromDB = async (trackId) => {
  const MAX_CACHE_AGE_DAYS = 180; // 6 months
  // 1. QUERY DATABASE
  const result = await client.query(
    "SELECT * FROM song_mappings WHERE source_track_id = $1 AND source_platform = 'spotify'",
    [trackId],
  );

  const cachedMatch = result.rows[0];

  // 2. CHECK CACHE VALIDITY
  if (!cachedMatch) {
    return null;
  }

  const lastUsed = new Date(cachedMatch.last_used_at);
  const now = new Date();
  const diffInDays = (now - lastUsed) / (1000 * 60 * 60 * 24);

  if (diffInDays > MAX_CACHE_AGE_DAYS) {
    return null;
  }

  // 3. RETURN CACHED DATA

  return {
    youtubeVideoId: cachedMatch.destination_track_id,
    spotifyTrackId: cachedMatch.source_track_id,
    title: cachedMatch.title,
    artist: cachedMatch.artist,
    matched: true,
    confidence: cachedMatch.confidence_score,
  };
};
