import client from "../../database/connectDB.js";
import { google } from "googleapis";
import CustomError from "../../utils/CustomError.js";

export async function getNewYTMusicAccessToken(
  refreshToken,
  clientId,
  clientSecret,
  userId,
) {
  if (!refreshToken || !clientId || !clientSecret || !userId) {
    throw new CustomError(
      "Missing required parameters: refreshToken, clientId, clientSecret, userId",
      400,
    );
  }

  // 1. Define these OUTSIDE the try block so we can return them later
  let newAccessToken = null;
  let newExpiryDate = null;

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

    // 2. Set the Refresh Token
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    // 3. Force a Refresh
    const { credentials } = await oauth2Client.refreshAccessToken();

    newAccessToken = credentials.access_token;
    newExpiryDate = credentials.expiry_date;
    const expiresAt = new Date(newExpiryDate);

    // 4. Update Database
    await client.query(
      "UPDATE access_tokens SET access_token = $1, expires_at = $2 WHERE user_id = $3 AND provider = $4",
      [newAccessToken, expiresAt, userId, "youtube"],
    );
  } catch (err) {
    const errorMessage =
      err.response?.data?.error_description ||
      err.message ||
      "Failed to refresh YouTube access token";

    // Log the actual error for debugging
    console.error("Refresh Error Detail:", err);

    throw new CustomError(errorMessage, err.response?.status || 500);
  }

  // 5. Return the new token
  return {
    access_token: newAccessToken,
  };
}
