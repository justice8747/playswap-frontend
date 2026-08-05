import asyncHandler from "express-async-handler";
import client from "../../database/connectDB.js";
import redis from "../../config/redis.js";
import crypto from "crypto";
import {
  getGoogleTokens,
  getGoogleProfile,
  saveGoogleTokens,
} from "../../utils/youtube/ytmusicUtils.js";
import CustomError from "../../utils/CustomError.js";

export const getYoutubeMusicAccessToken = asyncHandler(async (req, res, next) => {
  const { code } = req.query;
  const frontendUrl = process.env.DEVELOPMENT_CLIENT_URL;

  if (!code) {
    return next(new CustomError("Missing authorization code", 400));
  }

  // Door A Specific URI
  const thisDoorUrl = process.env.YOUTUBE_REDIRECT_URI;

  try {
    // 1. Get Tokens & Profile
    const { access_token, refresh_token, expiry_date } = await getGoogleTokens(
      code,
      thisDoorUrl
    );
    const profile = await getGoogleProfile(access_token);
    const youtubeUserId = profile.id;

    // 2. Find or Create User
    let userId;
    const existing = await client.query(
      "SELECT id FROM users WHERE youtube_id = $1",
      [youtubeUserId]
    );

    if (existing.rows.length === 0) {
      // Create New
      const newUser = await client.query(
        "INSERT INTO users (youtube_id, is_guest) VALUES ($1, TRUE) RETURNING id",
        [youtubeUserId]
      );
      userId = newUser.rows[0].id;
    } else {
      // Login Existing
      userId = existing.rows[0].id;
    }

    // 3. Save Tokens
    await saveGoogleTokens(userId, access_token, refresh_token, expiry_date);

    // 4. Create Session
    const authCode = crypto.randomUUID();
    await redis.set(authCode, userId.toString(), "EX", 30);
    res.redirect(`${frontendUrl}/connectionDashboard?code=${authCode}`);
  } catch (error) {
    console.error("Youtube Login Error:", error);
    return next(new CustomError("Authentication failed", 500));
  }
});
