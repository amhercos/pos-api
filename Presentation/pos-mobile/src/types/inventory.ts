import { Promotion } from "./sale";
export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  categoryName: string | null;
  categoryId: string | null;
  expiryDate: string | null;
  promotions?: Promotion[];
}

export interface CreateProductRequest {
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  expiryDate: string | null;
  categoryId: string | null;
}

export interface UpdateProductRequest {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  lowStockThreshold: number;
  categoryId: string | null;
  expiryDate: string | null;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
}

export interface BaseErrorResponse {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
}
