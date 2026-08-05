import asyncHandler from "express-async-handler";
import client from "../../database/connectDB.js";
import redis from "../../config/redis.js";
import crypto from "crypto";
import {
  fetchSpotifyTokens,
  fetchSpotifyProfile,
  saveTokens,
} from "../../utils/spotify/spotifyUtils.js";
import CustomError from "../../utils/CustomError.js";

export const getAccessToken = asyncHandler(async (req, res, next) => {
  const { code } = req.query;
  const callbackUrl = process.env.SPOTIFY_REDIRECT_URL;
  const frontendUrl = process.env.DEVELOPMENT_CLIENT_URL;

  if (!code) {
    return next(new CustomError("Missing authorization code", 400));
  }

  // 1. Get Data (Using Helpers)
  const { access_token, refresh_token, expiresAt } = await fetchSpotifyTokens(
    code,
    callbackUrl
  );
  const profile = await fetchSpotifyProfile(access_token);
  const spotifyUserId = profile.id;

  // 2. Find or Create User (INSERT logic)
  let userId;
  const existingUser = await client.query(
    "SELECT id FROM users WHERE spotify_id = $1",
    [spotifyUserId]
  );

  if (existingUser.rows.length === 0) {
    // Create New Guest
    const newUser = await client.query(
      "INSERT INTO users (spotify_id, is_guest) VALUES ($1, TRUE) RETURNING id",
      [spotifyUserId]
    );
    userId = newUser.rows[0].id;
  } else {
    // Login Existing
    userId = existingUser.rows[0].id;
  }

  // 3. Save Tokens
  await saveTokens(userId, access_token, refresh_token, expiresAt);

  // 4. Create Session (Redis) & Redirect
  const authCode = crypto.randomUUID();
  await redis.set(authCode, userId.toString(), "EX", 30);

  res.redirect(`${frontendUrl}/connectionDashboard?code=${authCode}`);
});
