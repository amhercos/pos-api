export enum PromotionType {
  Discount = 3,
  Bulk = 1,
  Bundle = 2,
}

export interface PromotionTier {
  id?: string;
  quantity: number;
  price: number;
  promotionId?: string;
}

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType | string;
  mainProductId: string;
  productName?: string;
  originalPrice?: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  tiers: PromotionTier[];
  tieUpProductId?: string | null;
  tieUpProductName?: string | null;
  tieUpQuantity?: number | null;
}

export interface BasketItem {
  productId: string;
  quantity: number;
}

export interface CreatePromotionRequest {
  name: string;
  type: string;
  mainProductId: string;
  isActive: boolean;
  tiers: Omit<PromotionTier, "id" | "promotionId">[];
  tieUpProductId?: string | null;
  tieUpQuantity?: number | null;
}

export interface UpdatePromotionRequest {
  id: string;
  name: string;
  isActive: boolean;
  tiers: Omit<PromotionTier, "id" | "promotionId">[];
}

export interface PromotionCalculationRequest {
  productId: string;
  quantity: number;
  basket: BasketItem[];
}

export interface PromotionCalculationResponse {
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  appliedPromotionName: string | null;
}
