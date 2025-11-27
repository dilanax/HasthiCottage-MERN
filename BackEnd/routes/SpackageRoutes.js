import express from "express";
import multer from "multer";
import path from "path";
import { createPackage, getPackages, updatePackage, deletePackage } from "../controller/PackageControllers.js";

const router = express.Router();

// Multer config - use memory storage for Azure upload
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Routes
router.post("/", upload.single("image"), createPackage);
router.get("/", getPackages);
router.put("/:id", upload.single("image"), updatePackage); // Added upload for update
router.delete("/:id", deletePackage);

export default router;