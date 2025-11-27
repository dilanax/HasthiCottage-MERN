import express from "express";
import {
  createReview,
  getReviewById,
  getAllReviews,
  getReviewByUser,
  updateReview,
  deleteReview
} from "../controller/reviewController.js";
import Review from "../models/review.js";

const reviewRouter = express.Router();

reviewRouter.post('/create', createReview);
reviewRouter.get('/all', getAllReviews);
reviewRouter.get("/get/:reviewId", getReviewById);
reviewRouter.get("/user/:userName", getReviewByUser);
reviewRouter.put("/update/:reviewId", updateReview);
reviewRouter.delete("/delete/:reviewId", deleteReview);
reviewRouter.get('/review', async (req, res) => {
  try {
    // Only select required fields
    const review = await Review.find({}, 'reviewId userEmail firstName lastName rating comment createdAt').sort({ createdAt: -1 });
    res.json({ review });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default reviewRouter;
