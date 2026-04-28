import { apiClient } from "../api/client";
import type {
  Category,
  CreateProductRequest,
  PagedResponse,
  Product,
  UpdateProductRequest,
} from "../types/inventory";
import { showToast } from "../utils/toast";

export const InventoryService = {
  getProducts: (page: number, pageSize: number) =>
    apiClient.get<PagedResponse<Product>>(
      `/Product?page=${page}&pageSize=${pageSize}`,
    ),

  getCategories: () => apiClient.get<Category[]>("/Categories"),

  createProduct: async (data: CreateProductRequest) => {
    try {
      await apiClient.post("/Product", data);
      showToast.success("Product added successfully");
    } catch {}
  },

  updateProduct: async (id: string, data: UpdateProductRequest) => {
    try {
      await apiClient.put(`/Product/${id}`, { ...data, id });
      showToast.success("Product updated successfully");
    } catch {}
  },

  deleteProduct: async (id: string) => {
    try {
      await apiClient.delete(`/Product/${id}`);
      showToast.success("Product deleted successfully");
    } catch {}
  },

  updateCategoryName: async (id: string, name: string) => {
    try {
      await apiClient.put(`/Categories/${id}/name`, {
        newCategoryName: name,
      });
      showToast.success(
        "Category Updated",
        "The name has been changed successfully.",
      );
    } catch {}
  },

  createCategory: (name: string) =>
    apiClient.post("/Categories", { CategoryName: name }),

  deleteCategory: (id: string) => apiClient.delete(`/Categories/${id}`),
};
