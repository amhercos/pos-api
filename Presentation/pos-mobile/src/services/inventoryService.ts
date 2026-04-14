import { apiClient } from "../api/client";
import type {
    Category,
    CreateProductRequest,
    PagedResponse,
    Product,
    UpdateProductRequest,
} from "../types/inventory";

export const InventoryService = {
  getProducts: (page: number, pageSize: number) =>
    apiClient.get<PagedResponse<Product>>(
      `/Product?page=${page}&pageSize=${pageSize}`,
    ),

  getCategories: () => apiClient.get<Category[]>("/Categories"),

  createProduct: (data: CreateProductRequest) =>
    apiClient.post("/Product", data),

  updateProduct: (id: string, data: UpdateProductRequest) =>
    apiClient.put(`/Product/${id}`, { ...data, id }),

  deleteProduct: (id: string) => apiClient.delete(`/Product/${id}`),

  createCategory: (name: string) =>
    apiClient.post("/Categories", { CategoryName: name }),

  deleteCategory: (id: string) => apiClient.delete(`/Categories/${id}`),
};
