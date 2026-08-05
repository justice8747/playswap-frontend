import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
dotenv.config();

// Ensure this route is protected with middleware so req.user exists!
export const spotifyAuthProtected = asyncHandler(async (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URL2;
  const scope =
    "playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-read-email";

  // --- 1. PACK THE BACKPACK ---
  // We grab the ID from the current session (req.user)
  // We wrap it in JSON and encode it to Base64 so it travels safely in the URL
  const statePayload = JSON.stringify({
    userId: req.user.id, // <--- The Critical Data
    mode: "LINK", // Optional: Explicit intent
  });

  const encodedState = Buffer.from(statePayload).toString("base64");

  // --- 2. ADD TO URL ---
  // Notice we added "&state=${encodedState}" to the end
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${encodeURIComponent(
    scope
  )}&state=${encodedState}`;

  // Redirect the user to Spotify WITH the backpack
  res.redirect(authUrl);
});
