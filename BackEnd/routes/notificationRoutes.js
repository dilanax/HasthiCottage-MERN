import { Router } from "express";
import notificationModel from "../models/notificationModel.js";
import notificationController from "../controller/notificationController.js";

const NotificationRouter = Router();

NotificationRouter.post("/", notificationController.createNotification);
NotificationRouter.get("/", notificationController.getAllNotifications);
NotificationRouter.get("/next-id", notificationController.getNextNotificationId);
NotificationRouter.get("/:id", notificationController.getNotificationById);
NotificationRouter.put("/:id", notificationController.updateNotification);
NotificationRouter.delete("/:id", notificationController.deleteNotification);

export default NotificationRouter; // <-- default export