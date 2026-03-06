import { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.service";

export async function adminCreateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await adminService.createProduct(req.body ?? {});
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await adminService.updateProduct(String(req.params.productId), req.body ?? {});
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.deleteProduct(String(req.params.productId));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function adminListProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const products = await adminService.listProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function adminGetProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await adminService.getProductById(String(req.params.productId));
    res.json(product);
  } catch (err) {
    next(err);
  }
}