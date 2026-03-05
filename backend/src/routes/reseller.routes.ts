import { Router } from "express";
import { resellerGetAvailableProducts,resellerGetProductById,resellerPurchaseProduct } from "../controllers/reseller.controller";

const router = Router();

// Spec: GET /api/v1/products
router.get("/products", resellerGetAvailableProducts);
router.get("/products/:productId",resellerGetProductById);
router.post("/products/:productId/purchase",resellerPurchaseProduct);
export default router;