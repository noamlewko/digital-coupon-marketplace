import { Request, Response, NextFunction } from "express";
import { resellerService } from "../services/reseller.service";

export async function resellerGetAvailableProducts(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const products = await resellerService.listAvailableProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function resellerGetProductById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const product = await resellerService.getAvailableProductById(String(req.params.productId));
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function resellerPurchaseProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await resellerService.purchaseProduct(
      String(req.params.productId),
      req.body?.reseller_price
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}