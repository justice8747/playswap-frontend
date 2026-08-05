import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import CustomError from "../utils/CustomError.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return next(new CustomError("Token is missing", 401));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(new CustomError("Invalid token", 403));
    }
    req.user = user;
    next();
  });
});
