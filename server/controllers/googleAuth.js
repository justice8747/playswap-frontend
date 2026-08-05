import asyncHandler from "express-async-handler";
import passport from "passport";
import client from "../database/connectDB.js";
import { generateAccessToken } from "../utils/TokenGeneration.js"; // assuming you have this
import CustomError from "../utils/CustomError.js";

export const googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "http://localhost:5173/login", session: false },
    asyncHandler(async (err, user, info) => {
      if (err) {
        return next(new CustomError("Internal server error", 500));
      }
      if (!user) {
        return next(new CustomError("Authentication failed", 401));
      }

      const email = user.email;

      // Check if user already exists
      const checkUser = await client.query(
        "SELECT * FROM users WHERE email = $1 AND is_google_user = $2",
        [email, true]
      );

      let dbUser;

      if (checkUser.rows.length === 0) {
        // User doesn't exist, create new one
        const insertUser = await client.query(
          "INSERT INTO users (email, is_google_user) VALUES ($1, $2) RETURNING *",
          [email, true]
        );
        dbUser = insertUser.rows[0];
      } else {
        dbUser = checkUser.rows[0];
      }

      // Generate token and respond
      const token = generateAccessToken({
        id: dbUser.id,
        email: dbUser.email,
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development", // Use secure cookies in production
        sameSite: "strict", // Prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.redirect("http://localhost:5173/"); // Redirect to your frontend
    })
  )(req, res, next);
};
