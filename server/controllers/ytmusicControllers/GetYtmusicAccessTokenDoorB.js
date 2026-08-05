import asyncHandler from "express-async-handler";
import client from "../../database/connectDB.js";
import {
  getGoogleTokens,
  getGoogleProfile,
  saveGoogleTokens,
} from "../../utils/youtube/ytmusicUtils.js";
import CustomError from "../../utils/CustomError.js";

export const getYoutubeMusicAccessTokenDoorB = asyncHandler(
  async (req, res, next) => {
    const { code, state } = req.query;
    const callbackUrl2 = process.env.YOUTUBE_REDIRECT_URI2;
    const frontendUrl = process.env.DEVELOPMENT_CLIENT_URL;

    if (!code) {
      return next(new CustomError("Missing authorization code", 400));
    }

    try {
      // 1. UNPACK BACKPACK (Get User ID from URL)
      let userIdToLink;
      try {
        const decoded = JSON.parse(Buffer.from(state, "base64").toString());
        userIdToLink = decoded.userId;
      } catch (e) {
        return next(new CustomError("Invalid state parameter", 400));
      }

      // 2. Get Tokens & Profile
      const { access_token, refresh_token, expiry_date } =
        await getGoogleTokens(code, callbackUrl2);
      const profile = await getGoogleProfile(access_token);

      // 3. LINK ACCOUNT (Update Only)

      // Check Conflict
      const conflict = await client.query(
        "SELECT id FROM users WHERE youtube_id = $1",
        [profile.id]
      );
      if (conflict.rows.length > 0 && conflict.rows[0].id !== userIdToLink) {
        return next(
          new CustomError(
            "This YouTube account is already linked to another user",
            409
          )
        );
      }

      // Update User
      await client.query("UPDATE users SET youtube_id = $1 WHERE id = $2", [
        profile.id,
        userIdToLink,
      ]);

      // 4. Save Tokens
      await saveGoogleTokens(
        userIdToLink,
        access_token,
        refresh_token,
        expiry_date
      );

      res.redirect(`${frontendUrl}/connectionDashboard?success=true`);
    } catch (error) {
      console.error("Youtube Link Error:", error);
      return next(new CustomError("Link failed", 500));
    }
  }
);
