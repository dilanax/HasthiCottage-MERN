import { Router } from "express";
import {
  getAvailableRoomPackages,
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomIds,
  seedSampleRoom
} from "../controller/roomController.js";
import verifyJwt from "../middleware/auth.js";
import verifyAdmin from "../middleware/admin.js";
import { upload } from "../lib/azureUpload.js";

const roomRoutes = Router();

// Public
roomRoutes.get("/available", getAvailableRoomPackages);
roomRoutes.get("/ids", getRoomIds);

// Auth protected CRUD
roomRoutes.get("/all", verifyJwt, getAllRooms);
roomRoutes.get("/:id", verifyJwt, getRoomById);
roomRoutes.post("/", verifyJwt, upload.array("imageUrl", 8), createRoom);
roomRoutes.put("/:id", verifyJwt, upload.array("imageUrl", 8), updateRoom);
roomRoutes.delete("/:id", verifyJwt, verifyAdmin, deleteRoom);


// Seed
roomRoutes.post("/seed", verifyJwt,  seedSampleRoom);

export default roomRoutes;
