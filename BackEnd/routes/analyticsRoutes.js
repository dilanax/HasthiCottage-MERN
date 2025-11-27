import express from 'express';
import { getReservationAnalytics, getPeriodAnalytics } from '../controller/analyticsController.js';
import verifyJwt from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';

const analyticsRouter = express.Router();

// Get comprehensive analytics
analyticsRouter.get('/reservations/admin/analytics', verifyJwt, adminMiddleware, getReservationAnalytics);

// Get analytics for specific period
analyticsRouter.get('/reservations/admin/analytics/:period', verifyJwt, adminMiddleware, getPeriodAnalytics);

export default analyticsRouter;