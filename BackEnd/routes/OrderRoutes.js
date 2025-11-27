import express from "express";
import { createOrder, listOrders, getOrder, updateOrder, removeOrder, exportOrdersPdf } from "../controller/OrderController.js";
const router = express.Router();

router.post("/", createOrder);
router.get("/", listOrders);
router.get("/export/pdf", exportOrdersPdf); // keep before :id
router.get("/:id", getOrder);
router.put("/:id", updateOrder);
router.delete("/:id", removeOrder);

export default router;
