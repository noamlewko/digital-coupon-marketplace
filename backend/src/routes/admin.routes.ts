import { Router } from "express";
import { adminCreateCoupon } from "../controllers/admin.controller";

const router = Router();

// Minimal Admin API for the exercise
router.post("/coupons", adminCreateCoupon);

export default router;