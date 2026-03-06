import mongoose from "mongoose";
import { ApiError } from "./apiErrors";

/**
 * Decimal128 helpers for money-like fields.
 * The exercise asks for decimal pricing fields, so values are stored as Decimal128
 * and converted back to numbers only when preparing API responses.
 */
export function toDecimal128(value: number | string): mongoose.Types.Decimal128 {
  const num = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(num)) {
    throw new ApiError(400, "BAD_REQUEST", "Invalid decimal value");
  }

  // Store pricing values with 2 decimal places for stable API output.
  return mongoose.Types.Decimal128.fromString(num.toFixed(2));
}

export function decimal128ToNumber(value: unknown): number {
  if (!value) return 0;

  const s = (value as { toString?: () => string }).toString?.() ?? String(value);
  const n = Number(s);

  return Number.isNaN(n) ? 0 : n;
}