import { Request, Response, NextFunction } from "express";
import { CouponModel } from "../models/coupon.model";
import { ApiError } from "../utils/apiErrors";
import { decimal128ToNumber } from "../utils/decimal";

/**
 * customer.controller.ts
 * Customer-facing API used by the minimal frontend (list & purchase coupons).
 */

/** List unsold coupons for customers (public fields only, price = minimum_sell_price). */
export async function customerGetAvailableProducts(
  _req: Request,
  res: Response,
  next: NextFunction
) {
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

/** Purchase a coupon for a customer (atomic sell, returns coupon value only after success). */
export async function customerPurchaseProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId } = req.params;

    const doc = await CouponModel.findOne({ id: productId });
    if (!doc) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    if (doc.is_sold) throw new ApiError(409, "PRODUCT_ALREADY_SOLD", "Product already sold");

    const updated = await CouponModel.findOneAndUpdate(
      { id: productId, is_sold: false },
      { $set: { is_sold: true } },
      { new: true }
    );

    if (!updated) throw new ApiError(409, "PRODUCT_ALREADY_SOLD", "Product already sold");

    res.json({
      product_id: updated.id,
      final_price: decimal128ToNumber(updated.minimum_sell_price),
      value_type: updated.value_type,
      value: updated.value
    });
  } catch (err) {
    next(err);
  }
}