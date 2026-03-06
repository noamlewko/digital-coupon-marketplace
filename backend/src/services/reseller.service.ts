import { productRepository } from "../repositories/product.repository";
import { ApiError } from "../utils/apiErrors";
import { decimal128ToNumber } from "../utils/decimal";
import { requireNonNegativeNumber } from "../utils/validation";
import { toPublicProduct } from "./product-presenters";

export class ResellerService {
  async listAvailableProducts() {
    const docs = await productRepository.listAvailable();
    return docs.map((doc) => toPublicProduct(doc));
  }

  async getAvailableProductById(productId: string) {
    const doc = await productRepository.findAvailableById(productId);
    if (!doc) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    return toPublicProduct(doc);
  }

  async purchaseProduct(productId: string, resellerPriceInput: unknown) {
    const resellerPrice = requireNonNegativeNumber("reseller_price", resellerPriceInput);

    const updated = await productRepository.purchaseForResellerIfAllowed(
      productId,
      resellerPrice
    );

    if (updated) {
      return {
        product_id: updated.id,
        final_price: resellerPrice,
        value_type: updated.value_type,
        value: updated.value
      };
    }

    const current = await productRepository.findById(productId);

    if (!current) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    if (current.is_sold) {
      throw new ApiError(409, "PRODUCT_ALREADY_SOLD", "Product already sold");
    }

    const minimumSellPrice = decimal128ToNumber(current.minimum_sell_price);

    if (resellerPrice < minimumSellPrice) {
      throw new ApiError(
        400,
        "RESELLER_PRICE_TOO_LOW",
        "Reseller price must be greater than or equal to the minimum sell price"
      );
    }

    throw new ApiError(409, "PRODUCT_ALREADY_SOLD", "Product could not be purchased");
  }
}

export const resellerService = new ResellerService();