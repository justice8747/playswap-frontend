import asyncHandler from "express-async-handler";
import client from "../../database/connectDB.js";

export const getTransferHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Join Sessions and Jobs to get a full history view
  const history = await client.query(
    `
    SELECT 
      s.id as session_id,
      s.source_platform,
      s.target_platform,
      s.created_at,
      j.source_playlist_name,
      j.target_playlist_id,
      j.status
    FROM transfer_sessions s
    JOIN transfer_jobs j ON s.id = j.session_id
    WHERE s.user_id = $1
    ORDER BY s.created_at DESC
  `,
    [userId],
  );

  res.json(history.rows);
});
