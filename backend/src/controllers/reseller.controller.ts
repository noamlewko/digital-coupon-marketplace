import { Request, Response, NextFunction } from "express";
import { CouponModel } from "../models/coupon.model";
import { decimal128ToNumber } from "../utils/decimal";

/**
 * Reseller: Get available products
 * Must return only unsold products and MUST NOT include cost/margin.
 */
export async function resellerGetAvailableProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const docs = await CouponModel.find({ is_sold: false }).sort({ created_at: -1 });

    res.json(
      docs.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        image_url: d.image_url,
        price: decimal128ToNumber(d.minimum_sell_price)
      }))
    );
  } catch (err) {
    next(err);
  }
}