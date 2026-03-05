import { Request, Response, NextFunction } from "express";
import { CouponModel } from "../models/coupon.model";
import { decimal128ToNumber } from "../utils/decimal";
import { ApiError } from "../utils/apiErrors";

/**
 * Reseller: Get available products
 * Must return only unsold products and MUST NOT include cost/margin.
 */
export async function resellerGetAvailableProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const docs = await CouponModel.find({ is_sold: false }).sort({ created_at: -1 });

    res.json(
      docs.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        image_url: d.image_url,
        price: decimal128ToNumber(d.minimum_sell_price)
      }))
    );
  } catch (err) {
    next(err);
  }
}
/**
 * Reseller: Get product by ID
 * Returns a single unsold product in the same public format.
 */
export async function resellerGetProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId }=req.params;
    const doc = await CouponModel.findOne({id:productId,is_sold:false});
    if(!doc){
      throw new ApiError(404,"PRODUCT_NOT_FOUND", "Product not found");
    }
    res.json({
      id:doc.id,
      name:doc.name,
      description:doc.description,
      image_url:doc.image_url,
      price:decimal128ToNumber(doc.minimum_sell_price)
    });
  }catch(err){
      next(err);
    }
  
}
export async function resellerPurchaseProduct(req:Request,res:Response,next: NextFunction){
  try{
    const { productId }=req.params;
    const reseller_price=Number(req.body.reseller_price);
    if (!Number.isFinite(reseller_price)){
      throw new ApiError(400,"BAD_REQUEST","invalid reseller price");
    }
    const doc = await CouponModel.findOne({id:productId});
    if(!doc){
      throw new ApiError(404,"PRODUCT_NOT_FOUND", "Product not found");
    }
    if(doc.is_sold){
      throw new ApiError(409,"PRODUCT_ALREADY_SOLD", "Product already sold");
    }
    if(reseller_price<decimal128ToNumber(doc.minimum_sell_price)){
      throw new ApiError(400,"RESELLER_PRICE_TOO_LOW","reseller price too low");
    

    }
    const updated=await CouponModel.findOneAndUpdate({id:productId,is_sold:false},
      {$set:{is_sold:true}},
      {new:true}
    );
    if(!updated){
      throw new ApiError(409,"PRODUCT_ALREADY_SOLD", "Product already sold");
    }
    res.json({
      product_id:updated.id,
      final_price:reseller_price,
      value_type:updated.value_type,
      value:updated.value,
    });

  }catch(err){
    next(err);
  }
}