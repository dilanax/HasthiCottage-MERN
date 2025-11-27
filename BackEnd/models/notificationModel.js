import mongoose from "mongoose";
const Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema(
    {
    notification_id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['booking', 'offer', 'promotion', 'announcement', 'reminder'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
        required: true
    },
    scheduled_at: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending',
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
    }
});

// Update `updated_at` before save
notificationSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const Notification = mongoose.model("Notification", notificationSchema);


export default Notification;