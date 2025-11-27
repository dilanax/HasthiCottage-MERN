// middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // <-- must include ()

export default function verifyJwt(req, res, next) {
  const header = req.header("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Access denied. No token provided." });
  }

  const token = header.slice(7); // remove "Bearer "
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_KEY);
    req.user = decoded;  // attach decoded payload to request
    return next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(401).json({ ok: false, error: "Invalid token." });
  }
}
