import redis from "../../config/redis.js";
import jwt from "jsonwebtoken";
import CustomError from "../../utils/CustomError.js";
import asyncHandler from "express-async-handler";

export const sessionUpgrade = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    return next(new CustomError("Handshake code is required", 400));
  }

  const userId = await redis.get(code);
  if (!userId) {
    return next(new CustomError("Invalid or expired login code", 401));
  }

  await redis.del(code);

  const sessionToken = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });

  // 4. Set the Cookie
  res.cookie("auth_token", sessionToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ success: true, message: "Session established" });
});
