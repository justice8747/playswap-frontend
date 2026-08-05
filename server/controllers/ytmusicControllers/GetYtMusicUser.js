import asyncHandler from "express-async-handler";
import client from "../../database/connectDB.js";
import { tokenExpired } from "../../utils/CheckIfTokenExpired.js";
import { getNewYTMusicAccessToken } from "./getNewYTMusicAccessToken.js";
import dotenv from "dotenv";
import CustomError from "../../utils/CustomError.js";
dotenv.config();

export const getUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  let refreshToken;
  let accessToken;
  let expiresAt;

  const tokenRecode = await client.query(
    "SELECT * FROM access_tokens WHERE user_id = $1 AND provider = 'youtube'",
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
    const newAccessToken = await getNewYTMusicAccessToken(
      refreshToken,
      clientId,
      clientSecret,
      userId
    );
    accessToken = newAccessToken.access_token;
  }
  // 4. Call Google API
  const youtubeResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!youtubeResponse.ok) {
    const errorData = await youtubeResponse.json();
    console.error("Google API Error:", errorData);
    return next(
      new CustomError(
        "Failed to fetch profile from Google",
        youtubeResponse.status
      )
    );
  }

  const profileData = await youtubeResponse.json();

  // 5. Return the data to your frontend
  res.json({
    success: true,
    ytMusicName: profileData.name,
    ytMusicId: profileData.id,
  });
});
