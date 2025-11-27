// Routes/MenuItemRoutes.js
import express from "express";
import {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from "../controller/MenuItemController.js";
import { upload } from "../lib/azureUpload.js";

const router = express.Router();

// Routes
router.post("/", upload.single("image"), createMenuItem);
router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);
router.put("/:id", upload.single("image"), updateMenuItem);
router.delete("/:id", deleteMenuItem);

export default router;
