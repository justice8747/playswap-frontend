import client from "../database/connectDB.js";
import { tokenExpired } from "./CheckIfTokenExpired.js";
import { getNewSpotifyAccessToken } from "../controllers/spotifyControllers/getNewSpotifyAccessToken.js";
import { getNewYTMusicAccessToken } from "../controllers/ytmusicControllers/getNewYTMusicAccessToken.js";
import dotenv from "dotenv";
import CustomError from "./CustomError.js";
dotenv.config();
export const getAccessTokenFromDB = async (userId, provider) => {
  let access_token, refresh_token, expires_at;

  if (provider === "spotify") {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const record = await client.query(
      `SELECT access_token, refresh_token, expires_at
     FROM access_tokens
     WHERE user_id = $1 AND provider = $2`,
      [userId, provider],
    );

    if (record.rows.length === 0) {
      throw new CustomError("No access token found for this user", 404);
    } else {
      access_token = record.rows[0].access_token;
      refresh_token = record.rows[0].refresh_token;
      expires_at = record.rows[0].expires_at;
    }

    if (tokenExpired(expires_at)) {
      access_token = await getNewSpotifyAccessToken(
        refresh_token,
        clientId,
        clientSecret,
        userId,
      );
    }
  } else if (provider === "youtube") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const record = await client.query(
      `SELECT access_token, refresh_token, expires_at
     FROM access_tokens
     WHERE user_id = $1 AND provider = $2`,
      [userId, provider],
    );

    if (record.rows.length === 0) {
      throw new CustomError("No access token found for this user", 404);
    } else {
      access_token = record.rows[0].access_token;
      refresh_token = record.rows[0].refresh_token;
      expires_at = record.rows[0].expires_at;
    }
    if (tokenExpired(expires_at)) {
      access_token = await getNewYTMusicAccessToken(
        refresh_token,
        clientId,
        clientSecret,
        userId,
      );
    }
  }
  return access_token;
};
