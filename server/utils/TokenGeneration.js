import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export const generateAccessToken = (user) => {
  
  return jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
};
