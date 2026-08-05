import asyncHandler from "express-async-handler";
import client from "../database/connectDB.js";
import { hashPassword } from "../utils/HashPassword.js";
import CustomError from "../utils/CustomError.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new CustomError("Email and password are required", 400));
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new CustomError("Invalid email format", 400));
  }

  // Check if user already exists
  const existingUser = await client.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    const user = existingUser.rows[0];

    if (user.is_google_user) {
      return next(
        new CustomError(
          "This email is already associated with a Google account.",
          409
        )
      );
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Insert new user
  const newUser = await client.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
    [email, hashedPassword]
  );

  // Remove password before sending response
  const { password: _, ...safeUser } = newUser.rows[0];

  res.status(201).json({
    message: "User registered successfully",
    user: safeUser,
  });
});

export default registerUser;
