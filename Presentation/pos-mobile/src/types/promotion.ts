export enum PromotionType {
  Bulk = 1, // Ensure this matches your Backend Enum (usually 0-indexed in C#)
  Bundle = 2,
  Discount = 3,
}

export interface PromoTier {
  quantity: number;
  price: number;
}

export interface Promotion {
  mainProductId: string;
  productName: string;
  name: string;
  type: PromotionType;
  isActive: boolean;
  tiers: PromoTier[];
  originalPrice?: number;
  tieUpProductId?: string | null;
  tieUpProductName?: string | null;
}

export interface CreatePromotionRequest {
  name: string;
  type: PromotionType;
  mainProductId: string;
  tiers: PromoTier[];
  tieUpProductId?: string | null;
}

export interface UpdatePromotionRequest {
  mainProductId: string;
  name: string;
  type: PromotionType;
  tiers: PromoTier[];
  isActive: boolean;
  tieUpProductId?: string | null;
}
