import { Router } from "express";
import { resellerGetAvailableProducts } from "../controllers/reseller.controller";

const router = Router();

// Spec: GET /api/v1/products
router.get("/products", resellerGetAvailableProducts);

export default router;