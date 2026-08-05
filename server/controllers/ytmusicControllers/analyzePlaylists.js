import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import { getAccessTokenFromDB } from "../../utils/getAccessTokenFromDB.js";
import CustomError from "../../utils/CustomError.js";
import { normalizeYtmusicTrack } from "../../utils/youtube/filterYtmusicTrack.js";
import { analyzeYtmusicTracks } from "../../utils/youtube/analyzeYtmusicTracks.js";
import { buildStats } from "../../utils/buildStats.js";
import client from "../../database/connectDB.js"; // Ensure client is imported
dotenv.config();
export const analyzePlaylists = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const playlists = req.body;

  const accessToken = await getAccessTokenFromDB(userId, "youtube");

  const sessionResult = await client.query(
    `INSERT INTO transfer_sessions (user_id, source_platform, target_platform, status) 
       VALUES ($1, $2, $3, 'analyzing') RETURNING id`,
    [userId, "youtube", "spotify"],
  );
  const sessionId = sessionResult.rows[0].id;

  const results = [];
  const stagingData = [];
  const cachePromises = [];

  const fetchYouTubePlaylistTracks = async ({ playlistId, accessToken }) => {
    try {
      let nextPageToken = null;
      let videoIds = [];
      const YT_API_BASE = "https://www.googleapis.com/youtube/v3";
      const MAX_RESULTS = 50;

      do {
        const url = new URL(`${YT_API_BASE}/playlistItems`);
        url.searchParams.set("part", "contentDetails");
        url.searchParams.set("playlistId", playlistId);
        url.searchParams.set("maxResults", MAX_RESULTS);
        if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new CustomError("Failed to fetch playlist items");

        const data = await res.json();
        videoIds.push(...data.items.map((i) => i.contentDetails.videoId));
        nextPageToken = data.nextPageToken;
      } while (nextPageToken);

      const tracks = [];
      for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50);

        const url = new URL(`${YT_API_BASE}/videos`);
        url.searchParams.set("part", "snippet,contentDetails");
        url.searchParams.set("id", batch.join(","));

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new CustomError("Failed to fetch video details");

        const data = await res.json();

        tracks.push(
          ...data.items.map((v) => ({
            videoId: v.id,
            title: v.snippet.title,
            channel: v.snippet.channelTitle,
            duration: v.contentDetails.duration,
          })),
        );
      }

      return tracks;
    } catch (error) {
      throw new CustomError("Failed to fetch YouTube playlist tracks", error);
    }
  };

  for (const playlist of playlists) {
    const playlistId = playlist.id;
    //Create a Job entry for this specific playlist ---
    const jobRes = await client.query(
      `INSERT INTO transfer_jobs (session_id, source_playlist_id, source_playlist_name, status)
       VALUES ($1, $2, $3, 'analyzing') RETURNING id`,
      [sessionId, playlistId, playlist.name],
    );
    const jobId = jobRes.rows[0].id;

    const data = await fetchYouTubePlaylistTracks({ playlistId, accessToken });

    const tracks = data.map((track) => normalizeYtmusicTrack(track));

    const analysisResults = [];

    for (const track of tracks) {
      const analysis = await analyzeYtmusicTracks(track, userId);
      analysisResults.push(analysis);

      const targetId = analysis.spotifyTrackId || null;
      const status = analysis.matched ? "matched" : "failed";
      const score = analysis.confidence || 0;

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
            "youtube",
            track.trackId,
            "spotify",
            targetId,
            track.title,
            track.artists,
            score,
          ],
        );

        cachePromises.push(queryPromise);
      }
    }

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
    analysis: results,
    sessionId: sessionId,
  });
});
