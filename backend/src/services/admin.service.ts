import { productRepository } from "../repositories/product.repository";
import { ApiError } from "../utils/apiErrors";
import { toDecimal128 } from "../utils/decimal";
import { toAdminProduct } from "./product-presenters";

function assertValueType(valueType: unknown) {
  if (valueType !== "STRING" && valueType !== "IMAGE") {
    throw new ApiError(400, "BAD_REQUEST", "Invalid value_type");
  }
}

export class AdminService {
  async createProduct(payload: Record<string, unknown>) {
    const { name, description, image_url, cost_price, margin_percentage, value_type, value } = payload;

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

    assertValueType(value_type);

    const doc = await productRepository.create({
      name,
      description,
      image_url,
      type: "COUPON",
      cost_price: toDecimal128(cost_price as string | number),
      margin_percentage: toDecimal128(margin_percentage as string | number),
      value_type,
      value
    });

    return {
      id: doc.id,
      name: doc.name,
      description: doc.description,
      type: doc.type,
      image_url: doc.image_url,
      is_sold: doc.is_sold,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    };
  }

  async updateProduct(productId: string, payload: Record<string, unknown>) {
    const doc = await productRepository.findById(productId);
    if (!doc) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    const { name, description, image_url, cost_price, margin_percentage, value_type, value } = payload;

    if (value_type !== undefined) {
      assertValueType(value_type);
      doc.value_type = value_type;
    }

    if (name !== undefined) doc.name = String(name);
    if (description !== undefined) doc.description = String(description);
    if (image_url !== undefined) doc.image_url = String(image_url);
    if (cost_price !== undefined) doc.cost_price = toDecimal128(cost_price as string | number);
    if (margin_percentage !== undefined) doc.margin_percentage = toDecimal128(margin_percentage as string | number);
    if (value !== undefined) doc.value = String(value);

    await doc.save();
    return toAdminProduct(doc);
  }

  async deleteProduct(productId: string) {
    const deleted = await productRepository.deleteById(productId);
    if (!deleted) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }
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