// middleware/admin.js
import User from '../models/user.js';

export default async function verifyAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ ok: false, error: "Authentication required" });
    }

    // Find the user in the database to get the current role
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(401).json({ ok: false, error: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ ok: false, error: "Admin access required" });
    }

    // Attach user info to request for use in controllers
    req.userInfo = user;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
