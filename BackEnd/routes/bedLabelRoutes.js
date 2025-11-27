import express from 'express';
import {
  createBedLabel,
  getAllBedLabels,
  getAllBedLabelsAdmin,
  getBedLabelById,
  updateBedLabel,
  deleteBedLabel,
  hardDeleteBedLabel,
} from '../controller/bedLabelController.js';
import verifyJwt from '../middleware/auth.js';
import verifyAdmin from '../middleware/admin.js';

const router = express.Router();

// Public routes (for fetching bed labels for booking)
router.get('/', getAllBedLabels);
router.get('/:id', getBedLabelById);

// Admin-only routes for CRUD operations
router.post('/', verifyJwt, verifyAdmin, createBedLabel);
router.get('/admin/all', verifyJwt, verifyAdmin, getAllBedLabelsAdmin);
router.put('/:id', verifyJwt, verifyAdmin, updateBedLabel);
router.delete('/:id', verifyJwt, verifyAdmin, deleteBedLabel);
router.delete('/:id/hard', verifyJwt, verifyAdmin, hardDeleteBedLabel);

export default router;









