import express from 'express';
import {
  getAllNearbyPlaces,
  getPlacesByCategory,
  searchPlaces,
  getPlaceDetails,
  getFeaturedPlaces,
  getPlacesByDistance,
  handleChatbotQuery,
  addNewPlace,
  updatePlace,
  deletePlace
} from '../controller/chatbotController.js';
import verifyJwt from '../middleware/auth.js';
import verifyAdmin from '../middleware/admin.js';

const router = express.Router();

// Public routes
router.get('/places', getAllNearbyPlaces);
router.get('/places/featured', getFeaturedPlaces);
router.get('/places/category/:category', getPlacesByCategory);
router.get('/places/search', searchPlaces);
router.get('/places/distance', getPlacesByDistance);
router.get('/places/:id', getPlaceDetails);
router.post('/query', handleChatbotQuery);

// Admin routes (protected)
router.post('/places', verifyJwt, verifyAdmin, addNewPlace);
router.put('/places/:id', verifyJwt, verifyAdmin, updatePlace);
router.delete('/places/:id', verifyJwt, verifyAdmin, deletePlace);

export default router;
