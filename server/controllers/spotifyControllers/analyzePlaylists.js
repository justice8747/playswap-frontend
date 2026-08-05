import asyncHandler from "express-async-handler";
import client from "../../database/connectDB.js"; // Ensure client is imported
import { getAccessTokenFromDB } from "../../utils/getAccessTokenFromDB.js";
import CustomError from "../../utils/CustomError.js";
import { analyzeSpotifyTracks } from "../../utils/spotify/analyzeSpotifyTracks.js";
import { normalizeSpotifyTrack } from "../../utils/spotify/filterSpotifyTrack.js";
import { buildStats } from "../../utils/buildStats.js";

// --- HELPER: Handle Pagination ---
const fetchAllSpotifyTracks = async (playlistId, accessToken) => {
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
  let allItems = [];

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new CustomError("Failed to fetch playlist tracks", response.status);
    }

    const data = await response.json();
    allItems = [...allItems, ...data.items];

    // Spotify gives us the exact URL for the next page (or null if done)
    url = data.next;
  }

  return allItems;
};

export const analyzePlaylists = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const playlists = req.body;

  const accessToken = await getAccessTokenFromDB(userId, "spotify");

  // 1. Create the Transfer Session (The Job)
  const sessionResult = await client.query(
    `INSERT INTO transfer_sessions (user_id, source_platform, target_platform, status) 
     VALUES ($1, $2, $3, 'analyzing') RETURNING id`,
    [userId, "spotify", "youtube"],
  );
  const sessionId = sessionResult.rows[0].id;

  const results = [];
  const stagingData = [];
  const cachePromises = [];

  // 2. Loop through Playlists
  for (const playlist of playlists) {
    const playlistId = playlist.id;

    //  Create a Job entry for this specific playlist ---
    const jobRes = await client.query(
      `INSERT INTO transfer_jobs (session_id, source_playlist_id, source_playlist_name, status)
       VALUES ($1, $2, $3, 'analyzing') RETURNING id`,
      [sessionId, playlistId, playlist.name],
    );
    const jobId = jobRes.rows[0].id;

    // Fetch tracks from Spotify
    const data = await fetchAllSpotifyTracks(playlistId, accessToken);

    const tracks = data
      .filter((item) => item.track)
      .map((item) => normalizeSpotifyTrack(item.track));

    const analysisResults = [];

    // 3. Loop through Tracks (The Heavy Lifting)
    for (const track of tracks) {
      const analysis = await analyzeSpotifyTracks(track, userId);

      analysisResults.push(analysis);

      const targetId = analysis.youtubeVideoId || null;
      const status = analysis.matched ? "matched" : "failed";
      const score = Math.round(analysis.confidence) || 0;

      stagingData.push([jobId, track.trackId, targetId, status, score]);

      if (status === "matched" && targetId) {
        const queryPromise = client.query(
          `INSERT INTO song_mappings 
           ( source_platform, source_track_id, destination_platform, destination_track_id, title, artist, confidence_score)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (source_platform, source_track_id, destination_platform) 
           DO UPDATE SET 
             destination_track_id = EXCLUDED.destination_track_id,
             confidence_score = EXCLUDED.confidence_score,
             last_used_at = CURRENT_TIMESTAMP`,
          [
            "spotify",
            track.trackId,
            "youtube",
            targetId,
            track.title,
            track.artists,
            score,
          ],
        );

        cachePromises.push(queryPromise);
      }
    }

    // Add stats for this playlist to the response
    results.push({
      playlistId,
      ...buildStats(analysisResults),
    });
  }

  if (stagingData.length > 0) {
    const placeholders = stagingData
      .map(
        (_, i) =>
          `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`,
      )
      .join(",");

    const flatValues = stagingData.flat();

    await client.query(
      `INSERT INTO transfer_items 
       (job_id, source_track_id, target_track_id, status, confidence_score)
       VALUES ${placeholders}`,
      flatValues,
    );
  }

  // This fires all the collected "Upsert" queries at once
  await Promise.all(cachePromises);

  // 4. Mark Session as Ready
  await client.query(
    "UPDATE transfer_sessions SET status = 'ready' WHERE id = $1",
    [sessionId],
  );

  res.status(200).json({
    message: "Playlists analyzed successfully",
    sessionId: sessionId,
    analysis: results,
  });
});
