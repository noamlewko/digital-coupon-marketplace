import { decimal128ToNumber } from "../utils/decimal";

export function toPublicProduct(doc: any) {
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description,
    image_url: doc.image_url,
    price: decimal128ToNumber(doc.minimum_sell_price)
  };
}

export function toAdminProduct(doc: any) {
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description,
    type: doc.type,
    image_url: doc.image_url,
    is_sold: doc.is_sold,
    cost_price: decimal128ToNumber(doc.cost_price),
    margin_percentage: decimal128ToNumber(doc.margin_percentage),
    minimum_sell_price: decimal128ToNumber(doc.minimum_sell_price),
    value_type: doc.value_type,
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}