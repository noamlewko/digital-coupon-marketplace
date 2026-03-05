import { Request, Response, NextFunction } from "express";
import { CouponModel } from "../models/coupon.model";
import { ApiError } from "../utils/apiErrors";
import { toDecimal128, decimal128ToNumber } from "../utils/decimal";

/**
 * admin.controller.ts
 * Admin API for managing products (currently only type=COUPON in this exercise).
 */

/** Create a new product (COUPON) with internal pricing fields set by admin only. */
export async function adminCreateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, image_url, cost_price, margin_percentage, value_type, value } = req.body ?? {};

    // Basic validation for required fields
    if (
      !name ||
      !description ||
      !image_url ||
      cost_price === undefined ||
      margin_percentage === undefined ||
      !value_type ||
      !value
    ) {
      throw new ApiError(400, "BAD_REQUEST", "Missing required fields");
    }

    // Validate value_type enum
    if (value_type !== "STRING" && value_type !== "IMAGE") {
      throw new ApiError(400, "BAD_REQUEST", "Invalid value_type");
    }

    // IMPORTANT: minimum_sell_price is derived server-side (model hook).
    const doc = await CouponModel.create({
      name,
      description,
      image_url,
      type: "COUPON",
      cost_price: toDecimal128(cost_price),
      margin_percentage: toDecimal128(margin_percentage),
      value_type,
      value
    });

    // Return a minimal admin response (can be expanded if needed)
    res.status(201).json({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      type: doc.type,
      image_url: doc.image_url,
      is_sold: doc.is_sold,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    });
  } catch (err) {
    next(err);
  }
}

/** Update an existing product (PATCH). Only updates provided fields. */
export async function adminUpdateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    const {
      name,
      description,
      image_url,
      cost_price,
      margin_percentage,
      value_type,
      value
    } = req.body ?? {};

    const doc = await CouponModel.findOne({ id: productId });
    if (!doc) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");

    // Validate enum if provided
    if (value_type !== undefined && value_type !== "STRING" && value_type !== "IMAGE") {
      throw new ApiError(400, "BAD_REQUEST", "Invalid value_type");
    }

    // PATCH behavior: update only fields that were sent
    if (name !== undefined) doc.name = name;
    if (description !== undefined) doc.description = description;
    if (image_url !== undefined) doc.image_url = image_url;

    if (cost_price !== undefined) doc.cost_price = toDecimal128(cost_price);
    if (margin_percentage !== undefined) doc.margin_percentage = toDecimal128(margin_percentage);

    if (value_type !== undefined) doc.value_type = value_type;
    if (value !== undefined) doc.value = value;

    // IMPORTANT: minimum_sell_price is derived server-side (model hook).
    // Using save() ensures the hook runs and minimum_sell_price is recomputed.
    await doc.save();

    res.json({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      type: doc.type,
      image_url: doc.image_url,
      is_sold: doc.is_sold,

      cost_price: decimal128ToNumber(doc.cost_price),
      margin_percentage: decimal128ToNumber(doc.margin_percentage),
      minimum_sell_price: decimal128ToNumber(doc.minimum_sell_price),

      value_type: doc.value_type,

      created_at: doc.created_at,
      updated_at: doc.updated_at
    });
  } catch (err) {
    next(err);
  }
}

/** Delete a product by id. Returns 204 on success. */
export async function adminDeleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;

    const deleted = await CouponModel.findOneAndDelete({ id: productId });
    if (!deleted) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
/** List all products for admin (includes internal pricing fields). */
export async function adminListProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const docs = await CouponModel.find({}).sort({ created_at: -1 });

    res.json(
      docs.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        type: d.type,
        image_url: d.image_url,
        is_sold: d.is_sold,

        cost_price: decimal128ToNumber(d.cost_price),
        margin_percentage: decimal128ToNumber(d.margin_percentage),
        minimum_sell_price: decimal128ToNumber(d.minimum_sell_price),

        value_type: d.value_type,

        created_at: d.created_at,
        updated_at: d.updated_at
      }))
    );
  } catch (err) {
    next(err);
  }
}