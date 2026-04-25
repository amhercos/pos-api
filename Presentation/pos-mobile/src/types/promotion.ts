// src/types/promotion.ts
export enum PromotionType {
  Bulk = 1,
  Bundle = 2,
  Discount = 3,
}

export interface Promotion {
  id: string;
  name: string;
  productName: string;
  promotionType: PromotionType;
  originalPrice: number;
  promoPrice: number;
  promoQuantity?: number;
  tieUpProductId?: string | null;
  tieUpQuantity?: number | null;
  isActive: boolean;
}

export interface CreatePromotionRequest {
  name: string;
  type: PromotionType;
  mainProductId: string;
  // Bulk/Discount
  promoQuantity?: number;
  promoPrice?: number;
  // Tie-up (Bundle)
  tieUpProductId?: string;
  tieUpQuantity?: number;
}

export interface UpdatePromotionRequest {
  id: string;
  name: string;
  promoQuantity?: number;
  promoPrice?: number;
  isActive: boolean;
}
