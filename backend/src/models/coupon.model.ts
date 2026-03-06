import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { decimal128ToNumber } from "../utils/decimal";
import { computeMinimumSellPrice } from "../utils/pricing";

/**
 * Single-collection coupon model.
 * The assignment currently requires only COUPON, but the explicit "type" field
 * keeps the model aligned with a future multi-product design.
 */
const CouponSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, default: uuidv4 },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["COUPON"], default: "COUPON" },
    image_url: { type: String, required: true, trim: true },

    cost_price: { type: Schema.Types.Decimal128, required: true, min: 0 },
    margin_percentage: { type: Schema.Types.Decimal128, required: true, min: 0 },
    minimum_sell_price: { type: Schema.Types.Decimal128, required: true },
    is_sold: { type: Boolean, default: false },

    value_type: { type: String, required: true, enum: ["STRING", "IMAGE"] },
    value: { type: String, required: true }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

/**
 * Enforce the pricing formula on the server side only.
 * Clients never send minimum_sell_price directly.
 */
CouponSchema.pre("validate", function () {
  const doc: {
    cost_price: unknown;
    margin_percentage: unknown;
    minimum_sell_price: unknown;
  } = this as unknown as {
    cost_price: unknown;
    margin_percentage: unknown;
    minimum_sell_price: unknown;
  };

  const cost = decimal128ToNumber(doc.cost_price);
  const margin = decimal128ToNumber(doc.margin_percentage);

  doc.minimum_sell_price = computeMinimumSellPrice(cost, margin);
});

// Useful for "available products" queries.
CouponSchema.index({ is_sold: 1, created_at: -1 });

export const CouponModel =
  mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);