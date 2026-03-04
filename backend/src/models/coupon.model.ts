import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { decimal128ToNumber } from "../utils/decimal";
import { computeMinimumSellPrice } from "../utils/pricing";

/**
 * Coupon document (single collection approach).
 * We still model the "Product base entity" fields and the "Coupon type" fields
 * exactly as defined in the assignment:
 *
 * Product:
 * - id (UUID)
 * - name, description, type, image_url
 * - created_at, updated_at
 *
 * Coupon:
 * - cost_price (decimal)
 * - margin_percentage (decimal)
 * - minimum_sell_price (decimal, derived server-side)
 * - is_sold
 * - value_type, value
 */
const CouponSchema = new Schema(
  {
    // Product base fields
    id: { type: String, required: true, unique: true, default: uuidv4 }, // UUID
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["COUPON"], default: "COUPON" },
    image_url: { type: String, required: true, trim: true },

    // Pricing (decimals)
    cost_price: { type: Schema.Types.Decimal128, required: true, min: 0 },
    margin_percentage: { type: Schema.Types.Decimal128, required: true, min: 0 },
    minimum_sell_price: { type: Schema.Types.Decimal128, required: true }, // derived
    is_sold: { type: Boolean, default: false },

    // Secret value (returned only after purchase)
    value_type: { type: String, required: true, enum: ["STRING", "IMAGE"] },
    value: { type: String, required: true }
  },
  {
    // Match assignment field names
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

/**
 * Enforce pricing rules server-side:
 * - cost_price >= 0
 * - margin_percentage >= 0
 * - minimum_sell_price is always computed by server
 *
 * This runs on create and on updates that call `.save()`.
 */
CouponSchema.pre("validate", function () {
  const doc: any = this;

  const cost = decimal128ToNumber(doc.cost_price);
  const margin = decimal128ToNumber(doc.margin_percentage);

  if (cost < 0) {
    throw new Error("cost_price must be >= 0");
  }
  if (margin < 0) {
    throw new Error("margin_percentage must be >= 0");
  }

  doc.minimum_sell_price = computeMinimumSellPrice(cost, margin);
});

// Helpful index for "available products" queries
CouponSchema.index({ is_sold: 1, created_at: -1 });

export const CouponModel =
  mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);