import jwt from "jsonwebtoken";
import CustomError from "../utils/CustomError.js";

export const requireAuth = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return next(new CustomError("Not authenticated", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new CustomError("Invalid token", 401));
  }
};
