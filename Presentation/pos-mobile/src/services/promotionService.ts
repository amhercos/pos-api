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
    } catch (error) {
      throw error;
    }
  },

  update: async (mainProductId: string, command: UpdatePromotionRequest) => {
    try {
      const response = await apiClient.put(
        `/Promotions/${mainProductId}`,
        command,
      );
      showToast.success("Promotion updated successfully");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (mainProductId: string) => {
    try {
      await apiClient.delete(`/Promotions/${mainProductId}`);
      showToast.success("Promotion deleted");
    } catch (error) {
      throw error;
    }
  },

  toggle: async (mainProductId: string) => {
    try {
      const response = await apiClient.patch<boolean>(
        `/Promotions/${mainProductId}/toggle`,
      );
      showToast.success("Status updated successfully");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
