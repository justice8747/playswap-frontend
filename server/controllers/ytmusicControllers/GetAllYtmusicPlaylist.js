import { tokenExpired } from "../../utils/CheckIfTokenExpired.js";
import asyncHandler from "express-async-handler";
import { getNewYTMusicAccessToken } from "./getNewYTMusicAccessToken.js";
import client from "../../database/connectDB.js";
import dotenv from "dotenv";
import CustomError from "../../utils/CustomError.js";
dotenv.config();

export const getAllYtmusicPlaylists = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  let refreshToken;
  let accessToken;
  let expiresAt;
  const tokenRecode = await client.query(
    "SELECT * FROM access_tokens WHERE user_id = $1 AND provider = 'youtube'",
    [userId],
  );

  if (tokenRecode.rows.length === 0) {
    return next(new CustomError("No access token found for this user", 404));
  } else {
    refreshToken = tokenRecode.rows[0].refresh_token;
    accessToken = tokenRecode.rows[0].access_token;
    expiresAt = tokenRecode.rows[0].expires_at;
  }

  if (tokenExpired(expiresAt)) {
    const newAccessToken = await getNewYTMusicAccessToken(
      refreshToken,
      clientId,
      clientSecret,
      userId,
    );
    accessToken = newAccessToken.access_token;
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    return next(
      new CustomError(
        errorData.error?.message || "YouTube API Error",
        response.status,
      ),
    );
  }

  const data = await response.json();

  const settledPromises = await Promise.allSettled(
    data.items.map(async (playlist) => {
      try {
        // Fetch playlist items (tracks)
        const tracksRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?` +
            new URLSearchParams({
              part: "contentDetails",
              playlistId: playlist.id,
              maxResults: 50,
            }),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!tracksRes.ok) {
          console.error(
            `Failed to fetch tracks for playlist ${playlist.id}: ${tracksRes.statusText}`,
          );
          return {
            id: playlist.id,
            name: playlist.snippet.title,
            image: playlist.snippet.thumbnails?.medium?.url || null,
            tracks: 0,
            error: "Failed to fetch tracks",
          };
        }

        const tracksData = await tracksRes.json();

        return {
          id: playlist.id,
          name: playlist.snippet.title,
          image: playlist.snippet.thumbnails?.medium?.url || null,
          tracks: tracksData.items?.length || 0,
        };
      } catch (error) {
        console.error(
          `Error processing playlist ${playlist.id}:`,
          error.message,
        );
        return {
          id: playlist.id,
          name: "Error processing playlist",
          image: null,
          tracks: 0,
          error: error.message,
        };
      }
    }),
  );

  const result = settledPromises
    .filter((promise) => promise.status === "fulfilled")
    .map((promise) => promise.value);

  res.status(200).json({
    message: "Playlists fetched successfully",
    playlists: result,
  });
});
