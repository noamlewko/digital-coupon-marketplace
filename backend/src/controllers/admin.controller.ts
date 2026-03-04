import { Request, Response, NextFunction } from "express";
import { CouponModel } from "../models/coupon.model";
import { ApiError } from "../utils/apiErrors";
import { toDecimal128 } from "../utils/decimal";

/**
 * Admin: Create coupon
 * Admin is allowed to set:
 * - cost_price, margin_percentage, image_url, value_type, value
 *
 * IMPORTANT: minimum_sell_price must NOT be accepted from external input.
 * We ignore it even if provided; it is derived server-side in the model hook.
 */
export async function adminCreateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      description,
      image_url,
      cost_price,
      margin_percentage,
      value_type,
      value
    } = req.body ?? {};

    if (!name || !description || !image_url || cost_price === undefined || margin_percentage === undefined || !value_type || !value) {
      throw new ApiError(400, "BAD_REQUEST", "Missing required fields");
    }

    if (value_type !== "STRING" && value_type !== "IMAGE") {
      throw new ApiError(400, "BAD_REQUEST", "Invalid value_type");
    }

    const doc = await CouponModel.create({
      name,
      description,
      image_url,
      type: "COUPON",
      cost_price: toDecimal128(cost_price),
      margin_percentage: toDecimal128(margin_percentage),
      // minimum_sell_price will be computed server-side
      value_type,
      value
    });

    res.status(201).json({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      image_url: doc.image_url,
      type: doc.type,
      is_sold: doc.is_sold,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    });
  } catch (err) {
    next(err);
  }
}