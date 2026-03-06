import { productRepository } from "../repositories/product.repository";
import { ApiError } from "../utils/apiErrors";
import { decimal128ToNumber } from "../utils/decimal";
import { toPublicProduct } from "./product-presenters";

export class CustomerService {
  async listAvailableProducts() {
    const docs = await productRepository.listAvailable();
    return docs.map((doc) => toPublicProduct(doc));
  }

  async purchaseProduct(productId: string) {
    const updated = await productRepository.markSoldIfAvailable(productId);

    if (updated) {
      return {
        product_id: updated.id,
        final_price: decimal128ToNumber(updated.minimum_sell_price),
        value_type: updated.value_type,
        value: updated.value
      };
    }

    const current = await productRepository.findById(productId);

    if (!current) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    throw new ApiError(409, "PRODUCT_ALREADY_SOLD", "Product already sold");
  }
}

export const customerService = new CustomerService();