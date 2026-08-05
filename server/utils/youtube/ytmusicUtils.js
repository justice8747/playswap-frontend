import { google } from "googleapis";
import fetch from "node-fetch";
import client from "../../database/connectDB.js";
import CustomError from "../CustomError.js";

// 1. Get Tokens (Accepts dynamic redirectUri)
export const getGoogleTokens = async (code, redirectUri) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token, // might be undefined if not first time
      expiry_date: tokens.expiry_date,
    };
  } catch (error) {
    throw new CustomError(
      error.response?.data?.error_description ||
        "Failed to fetch Google tokens",
      error.response?.status || 500
    );
  }
};

// 2. Get Profile
export const getGoogleProfile = async (accessToken) => {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new CustomError(
      errorData.error?.message || "Failed to fetch Google profile",
      response.status
    );
  }
  return await response.json();
};

// 3. Save Tokens (Preserves existing refresh_token if new one is missing)
export const saveGoogleTokens = async (
  userId,
  access_token,
  refresh_token,
  expiry_date
) => {
  const expiresAt = new Date(expiry_date);

  const query = `
    INSERT INTO access_tokens (user_id, access_token, refresh_token, provider, expires_at)
    VALUES ($1, $2, $3, 'youtube', $4)
    ON CONFLICT (user_id, provider) 
    DO UPDATE SET 
      access_token = EXCLUDED.access_token,
      -- Only overwrite refresh_token if Google sent a new one
      refresh_token = COALESCE(EXCLUDED.refresh_token, access_tokens.refresh_token),
      expires_at = EXCLUDED.expires_at,
      created_at = CURRENT_TIMESTAMP
  `;

  await client.query(query, [userId, access_token, refresh_token, expiresAt]);
};
