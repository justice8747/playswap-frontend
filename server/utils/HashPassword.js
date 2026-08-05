import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";

export const hashPassword = asyncHandler(async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
});
export const comparePassword = asyncHandler(
  async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
);
