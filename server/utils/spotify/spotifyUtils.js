import fetch from "node-fetch";
import client from "../../database/connectDB.js";
import CustomError from "../CustomError.js";

// 1. Get Tokens
export const fetchSpotifyTokens = async (code, redirectUri) => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new CustomError(
      errorData.error_description || "Failed to fetch Spotify tokens",
      response.status
    );
  }
  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
};

// 2. Get Profile
export const fetchSpotifyProfile = async (accessToken) => {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new CustomError(
      errorData.error?.message || "Failed to fetch Spotify profile",
      response.status
    );
  }
  return await response.json();
};

// 3. Save Tokens (Upsert)
export const saveTokens = async (
  userId,
  accessToken,
  refreshToken,
  expiresAt
) => {
  await client.query(
    `
    INSERT INTO access_tokens (user_id, access_token, refresh_token, provider, expires_at)
    VALUES ($1, $2, $3, 'spotify', $4)
    ON CONFLICT (user_id, provider) 
    DO UPDATE SET 
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      expires_at = EXCLUDED.expires_at,
      created_at = CURRENT_TIMESTAMP
  `,
    [userId, accessToken, refreshToken, expiresAt]
  );
};
