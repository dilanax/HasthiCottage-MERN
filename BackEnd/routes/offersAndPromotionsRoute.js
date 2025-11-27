import { Router } from "express";
import offersAndPromotionsModel from "../models/offersAndPromotionsModel.js";
import offersAndPromotionsController from "../controller/offersAndPromotionsController.js";

const promotionRouter = Router();

promotionRouter.get("/", offersAndPromotionsController.getPromotions);
promotionRouter.get("/next-id", offersAndPromotionsController.getNextPromotionId);
promotionRouter.get("/:id", offersAndPromotionsController.getPromotionById);
promotionRouter.post("/", offersAndPromotionsController.addPromotions);
promotionRouter.put("/:id", offersAndPromotionsController.updatePromotion);
promotionRouter.delete("/:id", offersAndPromotionsController.deletePromotion);

export default promotionRouter;