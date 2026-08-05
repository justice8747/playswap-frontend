import asyncHandler from "express-async-handler";
import client from "../database/connectDB.js";
import { comparePassword } from "../utils/HashPassword.js";
import { generateAccessToken } from "../utils/TokenGeneration.js";
import CustomError from "../utils/CustomError.js";

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate the input
  if (!email || !password) {
    return next(new CustomError("Email and password are required", 400));
  }

  // Check if the user exists
  const checkUser = await client.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (checkUser.rows.length === 0) {
    return next(new CustomError("Invalid User Credentials", 401));
  }
  //   compare password
  const comparedPassword = await comparePassword(
    req.body.password,
    checkUser.rows[0].password
  );
  delete req.body.password;
  if (!comparedPassword) {
    return next(new CustomError("Invalid User Credentials", 401));
  }

  //   generate token
  const token = generateAccessToken({
    id: checkUser.rows[0].id,
    email: checkUser.rows[0].email,
  });
    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  delete checkUser.rows[0].password;
  delete checkUser.rows[0].created_at;

  res.status(200).json({
    message: "Login successful",
    user: checkUser.rows[0],
    token: token,
  });
});

export default loginUser;
