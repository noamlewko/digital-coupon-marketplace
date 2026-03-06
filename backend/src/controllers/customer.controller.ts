import { Request, Response, NextFunction } from "express";
import { customerService } from "../services/customer.service";

export async function customerGetAvailableProducts(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const products = await customerService.listAvailableProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function customerPurchaseProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await customerService.purchaseProduct(String(req.params.productId));
    res.json(result);
  } catch (err) {
    next(err);
  }
}