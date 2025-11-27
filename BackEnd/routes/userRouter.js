// routes/userRouter.js
import express from "express";
import {
  saveUser,
  loginUser,
  getAllUsersPublic,
  updateUser,
  deleteUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getMe,
} from "../controller/userController.js";
import verifyJwt from "../middleware/auth.js";

const userRouter = express.Router();

// Public
userRouter.post("/register", saveUser);
userRouter.post("/login", loginUser);
userRouter.get("/all", getAllUsersPublic);

// Protected
userRouter.get("/profile", verifyJwt, getCurrentUserProfile);
userRouter.put("/profile", verifyJwt, updateCurrentUserProfile);
userRouter.get("/me", verifyJwt, getMe);
userRouter.put("/:id", verifyJwt, updateUser);
userRouter.delete("/:id", verifyJwt, deleteUser);

export default userRouter;
