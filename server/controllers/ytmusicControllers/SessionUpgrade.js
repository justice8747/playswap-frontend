import redis from "../../config/redis.js";
import jwt from "jsonwebtoken";

export const sessionUpgrade = async (req, res, next) => {
  const { code } = req.body;
  if (!code) {
    return next({ error: "Login code is required", status: 400 });
  }

  try {
    const userId = await redis.get(code);

    if (!userId) {
      return next({ error: "Invalid or expired login code", status: 400 });
    }

    await redis.del(code);

    const sessionToken = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: "30d",
    });

    // 4. Set the Cookie
    res.cookie("auth_token", sessionToken, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "Lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Session established" });
  } catch (e) {
    return next({ error: "Server error during handshake", status: 400 });
  }
};
