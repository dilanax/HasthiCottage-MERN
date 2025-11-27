import Notification from "../models/notificationModel.js";

// Function to generate next sequential notification ID
async function generateNextNotificationId() {
    try {
        // Get all notifications and find the highest ID
        const notifications = await Notification.find({}, { notification_id: 1 }).sort({ notification_id: -1 });
        
        let nextId = 1;
        
        if (notifications.length > 0) {
            // Extract numeric parts from existing IDs that start with 'N'
            const existingIds = notifications
                .map(n => n.notification_id)
                .filter(id => {
                    return typeof id === 'string' && id.startsWith('N');
                })
                .map(id => {
                    const match = id.match(/^N(\d+)$/);
                    return match ? parseInt(match[1]) : 0;
                })
                .filter(num => !isNaN(num) && num > 0);
            
            // Find the highest number and add 1
            if (existingIds.length > 0) {
                nextId = Math.max(...existingIds) + 1;
            }
        }
        
        // Format as N001, N002, etc.
        return `N${String(nextId).padStart(3, '0')}`;
    } catch (error) {
        console.error('Error generating notification ID:', error);
        // Fallback to timestamp-based ID
        const timestampId = Math.floor(Date.now() / 1000) % 10000;
        return `N${String(timestampId).padStart(3, '0')}`;
    }
}

// Create Notification
export async function createNotification(req, res) {
    try {
        // Generate sequential ID if not provided
        if (!req.body.notification_id) {
            req.body.notification_id = await generateNextNotificationId();
        }
        
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get All Notifications
export async function getAllNotifications(req, res) {
    try {
        const notifications = await Notification.find().sort({ created_at: -1 });
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Notification by ID
export async function getNotificationById(req, res) {
    try {
        const notification = await Notification.findOne({ notification_id: req.params.id });
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Notification
export async function updateNotification(req, res) {
    try {
        const notification = await Notification.findOneAndUpdate(
            { notification_id: req.params.id },
            req.body,
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete Notification
export async function deleteNotification(req, res) {
    try {
        const notification = await Notification.findOneAndDelete({ notification_id: req.params.id });
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        res.status(200).json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Next Notification ID
export async function getNextNotificationId(req, res) {
    try {
        const nextId = await generateNextNotificationId();
        res.status(200).json({ success: true, data: { notification_id: nextId } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export default {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNextNotificationId,
};

