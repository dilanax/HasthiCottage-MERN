import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    reviewId: {
        type: String,
        unique: true,
        required: true
    },
    /*userEmail: {
        type: String,
        required: true
    },*/
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default:""
    },
}, {
    timestamps: true
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;