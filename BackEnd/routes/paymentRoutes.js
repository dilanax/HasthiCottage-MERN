import { Router } from "express";
import {
  createPayment,
  listPayments,
  getPayment,
  updatePayment,
  deletePayment
} from "../controller/paymentController.js";

const paymentRouter = Router();

paymentRouter.post("/", createPayment);
paymentRouter.get("/", listPayments);
paymentRouter.get("/:id", getPayment);
paymentRouter.patch("/:id", updatePayment);
paymentRouter.delete("/:id", deletePayment);

export default paymentRouter;
