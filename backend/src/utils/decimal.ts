import mongoose from "mongoose";

/**
 * Helper functions for MongoDB Decimal128 <-> number/string conversions.
 * We store money fields as Decimal128 to match the "decimal" requirement.
 */

export function toDecimal128(value: number | string): mongoose.Types.Decimal128 {
  // Always store with 2 decimal places for currency-like values.
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) {
    throw new Error("Invalid decimal value");
  }
  return mongoose.Types.Decimal128.fromString(num.toFixed(2));
}

export function decimal128ToNumber(value: any): number {
  // value is typically Decimal128; we normalize to JS number for responses.
  if (!value) return 0;
  const s = value.toString?.() ?? String(value);
  const n = Number(s);
  return Number.isNaN(n) ? 0 : n;
}