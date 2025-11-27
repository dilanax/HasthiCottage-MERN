import express from 'express';
import {
  createRoomType,
  getAllRoomTypes,
  getAllRoomTypesAdmin,
  getRoomTypeById,
  updateRoomType,
  deleteRoomType,
  hardDeleteRoomType,
} from '../controller/roomTypeController.js';
import verifyJwt from '../middleware/auth.js';
import verifyAdmin from '../middleware/admin.js';

const router = express.Router();

// Public routes (for fetching room types for booking)
router.get('/', getAllRoomTypes);
router.get('/:id', getRoomTypeById);

// Admin-only routes for CRUD operations
router.post('/', verifyJwt, verifyAdmin, createRoomType);
router.get('/admin/all', verifyJwt, verifyAdmin, getAllRoomTypesAdmin);
router.put('/:id', verifyJwt, verifyAdmin, updateRoomType);
router.delete('/:id', verifyJwt, verifyAdmin, deleteRoomType);
router.delete('/:id/hard', verifyJwt, verifyAdmin, hardDeleteRoomType);

export default router;
