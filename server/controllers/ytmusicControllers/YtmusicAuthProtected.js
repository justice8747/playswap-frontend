import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
dotenv.config();

// CRITICAL: This route MUST use the 'protect' middleware so req.user exists!
export const ytmusicAuthProtected = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI2;

  // Added 'email' to scope to ensure we can fetch profile info easily later
  const scope =
    "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

  // --- 1. PACK THE BACKPACK (The State) ---
  // We grab the ID from the current session
  const statePayload = JSON.stringify({
    userId: req.user.id,
    mode: "LINK",
  });

  // Encode to Base64 (URL safe string)
  const encodedState = Buffer.from(statePayload).toString("base64");

  // --- 2. BUILD THE URL ---
  // Notice the addition of `&state=${encodedState}`
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${encodedState}`; // <--- ATTACH BACKPACK HERE

  res.redirect(authUrl);
});
