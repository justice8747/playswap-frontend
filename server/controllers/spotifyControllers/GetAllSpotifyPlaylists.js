import asyncHandler from "express-async-handler";
import { tokenExpired } from "../../utils/CheckIfTokenExpired.js";
import { getNewSpotifyAccessToken } from "./getNewSpotifyAccessToken.js";
import client from "../../database/connectDB.js";
import dotenv from "dotenv";
import CustomError from "../../utils/CustomError.js";
dotenv.config();

export const getAllSpotyPlaylists = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  let refreshToken;
  let accessToken;
  let expiresAt;
  const tokenRecode = await client.query(
    "SELECT * FROM access_tokens WHERE user_id = $1 AND provider = 'spotify'",
    [userId]
  );

  if (tokenRecode.rows.length === 0) {
    return next(new CustomError("No access token found for this user", 404));
  } else {
    refreshToken = tokenRecode.rows[0].refresh_token;
    accessToken = tokenRecode.rows[0].access_token;
    expiresAt = tokenRecode.rows[0].expires_at;
  }

  if (tokenExpired(expiresAt)) {
    accessToken = await getNewSpotifyAccessToken(
      refreshToken,
      clientId,
      clientSecret,
      userId
    );
  }

  const token = await client.query(
    "SELECT * FROM access_tokens WHERE user_id = $1 AND provider = 'spotify'",
    [userId]
  );

  if (token.rows.length === 0) {
    return next(new CustomError("No access token found for this user", 404));
  } else {
    accessToken = token.rows[0].access_token;

    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return next(new CustomError("Failed to fetch playlists", response.status));
    }

    const data = await response.json();
    const result = data.items.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      image: playlist.images[0]?.url || null,
      tracks: playlist.tracks.total,
    }));

    res.status(200).json({
      message: "Playlists fetched successfully",
      playlists: result,
    });
  }
});
