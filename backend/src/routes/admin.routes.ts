import { Router } from "express";
import {
  adminCreateProduct,
  adminListProducts,
  adminGetProductById,
  adminUpdateProduct,
  adminDeleteProduct
} from "../controllers/admin.controller";

const router = Router();

router.get("/products", adminListProducts);
router.get("/products/:productId", adminGetProductById);
router.post("/products", adminCreateProduct);
router.patch("/products/:productId", adminUpdateProduct);
router.delete("/products/:productId", adminDeleteProduct);

export default router;