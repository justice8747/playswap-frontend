import asyncHandler from "express-async-handler";
import client from "../../database/connectDB.js";
import {
  fetchSpotifyTokens,
  fetchSpotifyProfile,
  saveTokens,
} from "../../utils/spotify/spotifyUtils.js";
import CustomError from "../../utils/CustomError.js";

export const getAccessTokenDoorB = asyncHandler(async (req, res, next) => {
  const { code, state } = req.query;
  const callbackUrl2 = process.env.SPOTIFY_REDIRECT_URL2;
  const frontendUrl = process.env.DEVELOPMENT_CLIENT_URL;

  if (!code) {
    return next(new CustomError("Missing authorization code", 400));
  }

  // 1. UNPACK THE BACKPACK (Get User ID from URL)
  let userIdToLink;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64").toString());
    userIdToLink = decoded.userId; // <--- Extracted safely!
  } catch (e) {
    return next(new CustomError("Invalid state parameter", 400));
  }

  // 2. Get Data
  const { access_token, refresh_token, expiresAt } = await fetchSpotifyTokens(
    code,
    callbackUrl2
  );
  const profile = await fetchSpotifyProfile(access_token);

  // 3. LINK ACCOUNT (Update Only)
  // We do NOT create new users here. We only link.

  // Check for conflict (Is this Spotify ID taken by someone else?)
  const conflict = await client.query(
    "SELECT id FROM users WHERE spotify_id = $1",
    [profile.id]
  );
  if (conflict.rows.length > 0 && conflict.rows[0].id !== userIdToLink) {
    return next(new CustomError("This Spotify account is already linked to another user", 409));
  }

  // The Magic Update
  await client.query("UPDATE users SET spotify_id = $1 WHERE id = $2", [
    profile.id,
    userIdToLink,
  ]);

  // 4. Save Tokens
  await saveTokens(userIdToLink, access_token, refresh_token, expiresAt);

  // 5. Redirect (Success)
  // No Redis code needed. The user is already logged in on the frontend.
  res.redirect(`${frontendUrl}/connectionDashboard?success=true`);
});
