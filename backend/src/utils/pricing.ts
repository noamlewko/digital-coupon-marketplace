import mongoose from "mongoose";
import { toDecimal128 } from "./decimal";

/**
 * Pricing rule (server-side derived):
 * minimum_sell_price = cost_price * (1 + margin_percentage / 100)
 *
 * Note: We compute using JS numbers then store as Decimal128 to 2 decimals.
 */

export function computeMinimumSellPrice(
  costPriceNumber: number,
  marginPercentageNumber: number
): mongoose.Types.Decimal128 {
  const minimum = costPriceNumber * (1 + marginPercentageNumber / 100);
  return toDecimal128(minimum);
}