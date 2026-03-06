import { Router } from "express";
import {
  resellerGetAvailableProducts,
  resellerGetProductById,
  resellerPurchaseProduct
} from "../controllers/reseller.controller";

const router = Router();

router.get("/products", resellerGetAvailableProducts);
router.get("/products/:productId", resellerGetProductById);
router.post("/products/:productId/purchase", resellerPurchaseProduct);

export default router;