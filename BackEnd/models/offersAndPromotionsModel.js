import mongoose from "mongoose";
const Schema = mongoose.Schema;

const offersAndPromotionsSchema = new mongoose.Schema(
    {
    promotion_id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,   
        required: true
    },
    description: {
        type: String,   
        required: true
    },
    discount_type: {
        type: String,   
        required: true
    },
    discount_value: {
        type: Number,   
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: true
    },
    updated_at: {
        type: Date,
        default: Date.now,
        required: true
    },
    promotion_category: {
        type: String,
        enum: ['Food Promotions', 'Safari Package Promotions', 'Room Reservation Promotions'],
        required: true
    }
});

/// Update `updated_at` before save
offersAndPromotionsSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const OffersAndPromotions = mongoose.model("OffersAndPromotions", offersAndPromotionsSchema);
export default OffersAndPromotions;
