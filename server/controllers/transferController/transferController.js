import asyncHandler from "express-async-handler";
import { createSpotifyPlaylist } from "../../services/createSpotifyPlaylist.js";
import { createYtmusicPlaylist } from "../../services/createYtmusicPlaylist.js";
import CustomError from "../../utils/CustomError.js";
import client from "../../database/connectDB.js";

const executeTransfer = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const { sessionId, sourcekey } = req.body;

  const targetPlatform = sourcekey === "spotify" ? "youtube" : "spotify";

  const jobsResult = await client.query(
    "SELECT * FROM transfer_jobs WHERE session_id = $1",
    [sessionId],
  );
  const jobs = jobsResult.rows;

  if (jobs.length === 0)
    throw new CustomError("No playlists found in this session", 404);

  const completedPlaylists = [];

  // 2. Fetch "Ready" Items from Staging
  for (const job of jobs) {
    let result = null;
    const itemsResult = await client.query(
      `SELECT target_track_id FROM transfer_items 
       WHERE job_id = $1 AND (status = 'matched' OR status = 'auto_match')`,
      [job.id],
    );
    const trackIds = itemsResult.rows.map((row) => row.target_track_id);

    if (trackIds.length === 0) continue; // Skip empty playlists

    const playlistName = job.source_playlist_name;

    try {
      // 5. Execute Write Logic
      if (targetPlatform === "spotify") {
        // Spotify needs URIs: "spotify:track:ID"
        const trackUris = trackIds.map((id) => `spotify:track:${id}`);
        result = await createSpotifyPlaylist(userId, playlistName, trackUris);
      } else if (targetPlatform === "youtube") {
        // YouTube needs raw Video IDs
        result = await createYtmusicPlaylist(userId, playlistName, trackIds);
        console.log(result);
      } else {
        throw new CustomError("Unsupported destination platform", 400);
      }

      // D. Update Job Record with new Playlist ID
      await client.query(
        "UPDATE transfer_jobs SET target_playlist_id = $1, status = 'completed' WHERE id = $2",
        [result.playlistId, job.id],
      );

      completedPlaylists.push({
        name: playlistName,
        url: result.url,
        count: trackIds.length,
      });
    } catch (error) {
      // 7. Handle Failure (e.g. Quota Exceeded)
      console.error("Transfer Execution Failed:", error);

      await client.query(
        "UPDATE transfer_jobs SET status = 'failed' WHERE id = $1",
        [sessionId],
      );
      throw new CustomError(`Transfer failed: ${error.message}`, 500);
    }
  }
  console.log(completedPlaylists);
  res.status(200).json({
    message: "tranfer successfully",
    data: completedPlaylists,
  });
});

export default executeTransfer;
