import Review from "../models/review.js";

import mongoose from "mongoose";

export async function createReview(req, res){
  

    try{
        

        const lastReviews = await Review.find().sort({ createdAt: -1 }).limit(1);
        let newReviewId = "";
        if(lastReviews.length === 0){
            newReviewId = "REV0001";
        } else {
            const lastNumber = (lastReviews[0].reviewId || "REV0000").replace("REV", "");
            const newInt = (parseInt(lastNumber) || 0) + 1;
            newReviewId = "REV" + newInt.toString().padStart(4, "0");
        }

        const review = new Review({
            reviewId  : newReviewId,
           /* userEmail : req.body.userEmail,*/
            firstName : req.body.firstName,
            lastName  : req.body.lastName,
            rating    : req.body.rating,
            comment   : req.body.comment
        });

        await review.save();
        res.json({ message : "Review created successfully" });
    } catch(err){
        res.status(500).json({ message : "Review not created" });
    }
}

export async function getReviewById(req, res){
    try {
        const reviewId = req.params.reviewId;
        const review = await Review.findOne({ reviewId });

        if(review == null){
            res.status(404).json({
                message : "Review not found"
            })
            return;
        }
        res.json({
            review : review
        })
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch review" });
    }
}


export async function getAllReviews(req, res){
  try {
    // return as an array
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews); // <-- send array directly
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
}

export async function getReviewByUser(req, res){
    try {
        const userName = req.params.userName;
        
        // Search by first name or last name (case insensitive)
        const review = await Review.find({
            $or: [
                { firstName: { $regex: userName, $options: 'i' } },
                { lastName: { $regex: userName, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });
        
        res.json(review); // Changed to send array directly like getAllReviews
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch user reviews" });
    }
}

export async function updateReview(req, res){
   

    try {
        const updated = await Review.findOneAndUpdate(
            { reviewId: req.params.reviewId },
            req.body
        );
        if (!updated) {
            res.status(404).json({ message: "Review not found" });
            return;
        }
        res.json({
            message: "Review updated successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Review not updated"
        });
    }
}

export async function deleteReview(req, res){
    

    try {
        const deleted = await Review.findOneAndDelete({
            reviewId : req.params.reviewId
        });
        if (!deleted) {
            res.status(404).json({ message: "Review not found" });
            return;
        }
        res.json({
            message : "Review deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Review not deleted"
        });
    }
}
