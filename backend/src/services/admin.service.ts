import { productRepository } from "../repositories/product.repository";
import { ApiError } from "../utils/apiErrors";
import { toDecimal128 } from "../utils/decimal";
import {
  optionalNonEmptyString,
  optionalNonNegativeNumber,
  optionalUrl,
  optionalValueType,
  requireNonEmptyString,
  requireNonNegativeNumber,
  requireUrl,
  requireValueType
} from "../utils/validation";
import { toAdminProduct } from "./product-presenters";

/**
 * Admin service owns internal product management rules.
 * This is the only flow allowed to set cost, margin and coupon value directly.
 */
export class AdminService {
  async createProduct(payload: Record<string, unknown>) {
    const name = requireNonEmptyString("name", payload.name);
    const description = requireNonEmptyString("description", payload.description);
    const imageUrl = requireUrl("image_url", payload.image_url);
    const costPrice = requireNonNegativeNumber("cost_price", payload.cost_price);
    const marginPercentage = requireNonNegativeNumber(
      "margin_percentage",
      payload.margin_percentage
    );
    const valueType = requireValueType(payload.value_type);
    const value = requireNonEmptyString("value", payload.value);

    const doc = await productRepository.create({
      name,
      description,
      image_url: imageUrl,
      type: "COUPON",
      cost_price: toDecimal128(costPrice),
      margin_percentage: toDecimal128(marginPercentage),
      value_type: valueType,
      value
    });

    return toAdminProduct(doc);
  }

  async updateProduct(productId: string, payload: Record<string, unknown>) {
    const doc = await productRepository.findById(productId);
    if (!doc) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    // Sold products are intentionally immutable after purchase.
    if (doc.is_sold) {
      throw new ApiError(409, "PRODUCT_ALREADY_SOLD", "Sold products cannot be updated");
    }

    const name = optionalNonEmptyString("name", payload.name);
    const description = optionalNonEmptyString("description", payload.description);
    const imageUrl = optionalUrl("image_url", payload.image_url);
    const costPrice = optionalNonNegativeNumber("cost_price", payload.cost_price);
    const marginPercentage = optionalNonNegativeNumber(
      "margin_percentage",
      payload.margin_percentage
    );
    const valueType = optionalValueType(payload.value_type);
    const value = optionalNonEmptyString("value", payload.value);

    if (name !== undefined) doc.name = name;
    if (description !== undefined) doc.description = description;
    if (imageUrl !== undefined) doc.image_url = imageUrl;
    if (costPrice !== undefined) doc.cost_price = toDecimal128(costPrice);
    if (marginPercentage !== undefined) doc.margin_percentage = toDecimal128(marginPercentage);
    if (valueType !== undefined) doc.value_type = valueType;
    if (value !== undefined) doc.value = value;

    await doc.save();
    return toAdminProduct(doc);
  }

  async deleteProduct(productId: string) {
    const existing = await productRepository.findById(productId);
    if (!existing) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    // Prevent deleting already-purchased assets from admin records.
    if (existing.is_sold) {
      throw new ApiError(409, "PRODUCT_ALREADY_SOLD", "Sold products cannot be deleted");
    }

    await productRepository.deleteById(productId);
  }

  async listProducts() {
    const docs = await productRepository.listAll();
    return docs.map((doc) => toAdminProduct(doc));
  }

  async getProductById(productId: string) {
    const doc = await productRepository.findById(productId);
    if (!doc) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    return toAdminProduct(doc);
  }
}

export const adminService = new AdminService();