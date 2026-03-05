import { Router } from "express";
import {
  customerGetAvailableProducts,
  customerPurchaseProduct
} from "../controllers/customer.controller";

const router = Router();

// Customer: list available coupons
// GET /customer/products
router.get("/products", customerGetAvailableProducts);

// Customer: purchase a coupon (no price provided by client)
// POST /customer/products/:productId/purchase
router.post("/products/:productId/purchase", customerPurchaseProduct);

export default router;