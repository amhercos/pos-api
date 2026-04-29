import { apiClient } from "../api/client";
import {
  CreatePromotionRequest,
  Promotion,
  UpdatePromotionRequest,
} from "../types/promotion";
import { showToast } from "../utils/toast";

export const PromotionService = {
  getAll: async () => {
    const response = await apiClient.get<Promotion[]>("/Promotions");
    return response.data;
  },

  getCalculatedPrice: async (productId: string, quantity: number) => {
    const response = await apiClient.get<number>("/Promotions/calculate", {
      params: { productId, quantity },
    });
    return response.data;
  },

  create: async (command: CreatePromotionRequest) => {
    try {
      const response = await apiClient.post<string>("/Promotions", command);
      showToast.success("Promotion created successfully");
      return response.data;
    } catch {}
  },

  update: async (command: UpdatePromotionRequest) => {
    try {
      const response = await apiClient.put(
        `/Promotions/${command.id}`,
        command,
      );
      showToast.success("Status Updated");
      return response.data;
    } catch {}
  },

  delete: async (id: string) => {
    await apiClient.delete(`/Promotions/${id}`);
  },

  toggle: async (id: string) => {
    try {
      const response = await apiClient.patch<boolean>(
        `/Promotions/${id}/toggle`,
      );
      showToast.success("Status updated successfully");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
