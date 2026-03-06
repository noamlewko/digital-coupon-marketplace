import { CouponModel } from "../models/coupon.model";

export class ProductRepository {
  async create(data: Record<string, unknown>) {
    return CouponModel.create(data);
  }

  async listAll() {
    return CouponModel.find({}).sort({ created_at: -1 });
  }

  async listAvailable() {
    return CouponModel.find({ is_sold: false }).sort({ created_at: -1 });
  }

  async findById(productId: string) {
    return CouponModel.findOne({ id: productId });
  }

  async findAvailableById(productId: string) {
    return CouponModel.findOne({ id: productId, is_sold: false });
  }

  async deleteById(productId: string) {
    return CouponModel.findOneAndDelete({ id: productId });
  }

  async markSoldIfAvailable(productId: string) {
    return CouponModel.findOneAndUpdate(
      { id: productId, is_sold: false },
      { $set: { is_sold: true } },
      { new: true }
    );
  }
}

export const productRepository = new ProductRepository();