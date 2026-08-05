import asyncHandler from "express-async-handler";
import client from "../../database/connectDB.js";
import { tokenExpired } from "../../utils/CheckIfTokenExpired.js";
import { getNewSpotifyAccessToken } from "./getNewSpotifyAccessToken.js";
import dotenv from "dotenv";
import CustomError from "../../utils/CustomError.js";
dotenv.config();

export const getUser = asyncHandler(async (req, res, next) => {
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

  // 4. Call Spotify API
  const spotifyResponse = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!spotifyResponse.ok) {
    return next(
      new CustomError(
        "Failed to fetch profile from Spotify",
        spotifyResponse.status
      )
    );
  }

  const profileData = await spotifyResponse.json();

  // 5. Return the data to your frontend
  res.json({
    spotifyName: profileData.display_name,
    email: profileData.email,
    product: profileData.product,
  });
});
