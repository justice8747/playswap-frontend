import axios from "axios";
import client from "../../database/connectDB.js";
import CustomError from "../../utils/CustomError.js";

export async function getNewSpotifyAccessToken(
  refreshToken,
  clientId,
  clientSecret,
  userId
) {
  if (!refreshToken || !clientId || !clientSecret || !userId) {
    throw new CustomError(
      "Missing required parameters: refreshToken, clientId, clientSecret, userId",
      400
    );
  }

  const tokenUrl = "https://accounts.spotify.com/api/token";
  const authHeader =
    "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  }).toString();

  let res;
  try {
    res = await axios.post(tokenUrl, body, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      timeout: 10000,
    });
  } catch (err) {
    const axiosResp = err.response;
    const fallbackStatus = axiosResp?.status || 500;
    const errorMessage =
      axiosResp?.data?.error_description ||
      axiosResp?.data?.error ||
      err.message ||
      "Spotify token request failed";
    throw new CustomError(errorMessage, fallbackStatus);
  }

  const data = res.data ?? {};

  if (!data || typeof data !== "object" || !data.access_token) {
    const errorMessage =
      data?.error_description ||
      data?.error ||
      "Spotify token endpoint returned an invalid response";
    throw new CustomError(errorMessage, res.status ?? 500);
  }

  // Normalize/augment returned payload
  data.token_type = data.token_type || "Bearer";
  data.scope =
    typeof data.scope === "string"
      ? data.scope
      : data.scope
      ? String(data.scope)
      : "";
  data.expires_in = Number.isFinite(data.expires_in)
    ? data.expires_in
    : parseInt(data.expires_in, 10) || 0;
  if (data.expires_in) {
    data.expires_at = Date.now() + data.expires_in * 1000;
  }

  const { access_token, refresh_token, expires_in } = data;
  const expiresAt = new Date(Date.now() + expires_in * 1000);
  await client.query(
    "UPDATE access_tokens SET access_token = $1, refresh_token = $2, expires_at = $3 WHERE user_id = $4 AND provider = $5",
    [access_token, refresh_token || refreshToken, expiresAt, userId, "spotify"]
  );

  return {
    access_token,
  };
}

