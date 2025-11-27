import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/** POST /api/user/register */
export async function saveUser(req, res) {
  try {
    const { email, firstName, lastName, password, phone, role } = req.body || {};

    // --- Determine if requester is an authenticated admin (from Authorization header) ---
    let requesterIsAdmin = false;
    try {
      const auth = req.headers?.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (token) {
        const secret = process.env.JWT_SECRET || process.env.JWT_KEY;
        if (!secret) {
          console.warn("JWT secret not configured; treating as public registration");
        } else {
          const decoded = jwt.verify(token, secret); // throws if invalid/expired
          requesterIsAdmin = decoded?.role === "admin";
        }
      }
    } catch (e) {
      // Invalid token -> treat as public registration
      requesterIsAdmin = false;
    }

    // Basic validation
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({
        message: "Validation failed",
        errors: {
          email: !email ? "Email is required" : undefined,
          firstName: !firstName ? "First name is required" : undefined,
          lastName: !lastName ? "Last name is required" : undefined,
          password: !password ? "Password is required" : undefined,
        },
      });
    }

    const normEmail = String(email).toLowerCase().trim();

    // Uniqueness checks
    const emailExists = await User.findOne({ email: normEmail });
    if (emailExists) return res.status(409).json({ message: "Email already in use" });

    // Check phone uniqueness if phone is provided
    if (phone) {
      const normPhone = String(phone).trim();
      const phoneExists = await User.findOne({ phone: normPhone });
      if (phoneExists) {
        return res.status(409).json({ 
          message: "Phone number already in use",
          errors: { phone: "This phone number is already registered" }
        });
      }
    }

    // Role logic:
    // - If requester is ADMIN, allow requested role (whitelisted)
    // - Else, force "user"
    const allowedRoles = new Set(["user", "admin", "teacher", "student"]);
    const finalRole = requesterIsAdmin && allowedRoles.has(role) ? role : "user";

    // Hash password
    const hashed = bcrypt.hashSync(password, 10);

    // Create
    const user = await User.create({
      email: normEmail,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      password: hashed,
      role: finalRole,
      ...(phone ? { phone: String(phone).trim() } : {}),
    });

    return res.status(201).json({
      message: "Account created",
      user: {
        id: user._id.toString(),
        employeeId: user.employeeId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    console.error("REGISTER /api/user/register error:", e);

    if (e?.code === 11000) {
      // Handle duplicate key errors (unique constraint violations)
      const duplicateField = Object.keys(e.keyPattern)[0];
      if (duplicateField === 'phone') {
        return res.status(409).json({ 
          message: "Phone number already in use",
          errors: { phone: "This phone number is already registered" }
        });
      } else if (duplicateField === 'email') {
        return res.status(409).json({ message: "Email already in use" });
      } else {
        return res.status(409).json({ message: "Duplicate entry found" });
      }
    }
    if (e?.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", details: e.errors });
    }
    return res
      .status(500)
      .json({ message: "Server error during registration", detail: String(e?.message || e) });
  }
}
/** GET /api/user/all */
export async function getAllUsersPublic(_req, res) {
  try {
    const users = await User.find().select(
      "employeeId email firstName lastName role isEmailVerified isDisabled phone createdAt"
    );
    return res.json(users);
  } catch (e) {
    console.error("GET /api/user/all error:", e);
    return res.status(500).json({ message: "Server error" });
  }
}

/** POST /api/user/login */
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normEmail });
    const invalidMsg = "Invalid email or password";
    if (!user) return res.status(401).json({ message: invalidMsg });

    let ok = false;
    if (typeof user.password === "string" && user.password.startsWith("$2")) {
      ok = await bcrypt.compare(password, user.password);
    }
    if (!ok) return res.status(401).json({ message: invalidMsg });

    const secret = process.env.JWT_SECRET || process.env.JWT_KEY;
    if (!secret) return res.status(500).json({ message: "JWT secret not configured" });

    const payload = { sub: user._id.toString(), role: user.role, email: user.email };
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    return res.json({
      message: "Login success",
      token,
      user: {
        id: user._id.toString(),
        employeeId: user.employeeId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isDisabled: user.isDisabled,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ message: "Server error" });
  }
}

/** PUT /api/user/:id */
export async function updateUser(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Please login first" });

    const { id } = req.params;
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: "User not found" });

    const isAdmin = req.user.role === "admin";
    const isSelf = req.user.email === target.email;
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "You are not allowed to update this user" });
    }

    const updates = {};
    ["firstName", "lastName", "phone"].forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });
    if (req.body.password) updates.password = bcrypt.hashSync(req.body.password, 10);
    if (isAdmin) {
      ["role", "isDisabled", "isEmailVerified"].forEach((k) => {
        if (req.body[k] !== undefined) updates[k] = req.body[k];
      });
    }
    delete updates.employeeId; // immutable

    const updated = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      select: "employeeId email firstName lastName role isEmailVerified isDisabled phone",
    });

    return res.json({ message: "User updated", user: updated });
  } catch (e) {
    if (e?.name === "CastError") return res.status(400).json({ message: "Invalid user id" });
    console.error("Update error:", e);
    return res.status(500).json({ message: "Server error" });
  }
}

/** GET /api/user/me */
export async function getMe(req, res) {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findOne({ email: req.user.email }).select(
      "employeeId email firstName lastName role isEmailVerified isDisabled phone createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "User info retrieved",
      user: {
        id: user._id.toString(),
        employeeId: user.employeeId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isDisabled: user.isDisabled,
        isEmailVerified: user.isEmailVerified,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    console.error("Get me error:", e);
    return res.status(500).json({ message: "Server error" });
  }
}

/** DELETE /api/user/:id */
export async function deleteUser(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Please login first" });

    const { id } = req.params;
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: "User not found" });

    const isAdmin = req.user.role === "admin";
    const isSelf = req.user.email === target.email;
    if (!isAdmin && !isSelf) return res.status(403).json({ message: "You are not allowed to delete this user" });

    if (target.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) return res.status(400).json({ message: "Cannot delete the last remaining admin" });
    }

    await User.findByIdAndDelete(id);
    return res.json({ message: "User deleted" });
  } catch (e) {
    if (e?.name === "CastError") return res.status(400).json({ message: "Invalid user id" });
    console.error("Delete error:", e);
    return res.status(500).json({ message: "Server error" });
  }
}

/** GET /api/user/profile - Get current user's profile */
export async function getCurrentUserProfile(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Please login first" });

    const user = await User.findById(req.user.sub).select(
      "employeeId email firstName lastName role phone createdAt updatedAt"
    );
    
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      success: true,
      user: {
        id: user._id.toString(),
        employeeId: user.employeeId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        phone: user.phone === "not given" ? "" : user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (e) {
    console.error("Get profile error:", e);
    return res.status(500).json({ message: "Server error" });
  }
}

/** PUT /api/user/profile - Update current user's profile */
export async function updateCurrentUserProfile(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Please login first" });

    const { firstName, lastName, phone } = req.body || {};

    // Validation
    if (!firstName || !lastName) {
      return res.status(400).json({
        message: "First name and last name are required",
        errors: {
          firstName: !firstName ? "First name is required" : undefined,
          lastName: !lastName ? "Last name is required" : undefined,
        }
      });
    }

    // Check phone uniqueness if phone is being updated
    if (phone) {
      const normPhone = String(phone).trim();
      const phoneExists = await User.findOne({ 
        phone: normPhone, 
        _id: { $ne: req.user.sub } // Exclude current user
      });
      if (phoneExists) {
        return res.status(409).json({ 
          message: "Phone number already in use",
          errors: { phone: "This phone number is already registered" }
        });
      }
    }

    const updates = {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      phone: phone ? String(phone).trim() : "not given"
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.sub, 
      updates, 
      { 
        new: true, 
        runValidators: true,
        select: "employeeId email firstName lastName role phone createdAt updatedAt"
      }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id.toString(),
        employeeId: updatedUser.employeeId,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
        role: updatedUser.role,
        phone: updatedUser.phone === "not given" ? "" : updatedUser.phone,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (e) {
    console.error("Update profile error:", e);
    if (e?.code === 11000) {
      // Handle duplicate key errors (unique constraint violations)
      const duplicateField = Object.keys(e.keyPattern)[0];
      if (duplicateField === 'phone') {
        return res.status(409).json({ 
          message: "Phone number already in use",
          errors: { phone: "This phone number is already registered" }
        });
      }
    }
    if (e?.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", details: e.errors });
    }
    return res.status(500).json({ message: "Server error" });
  }
}