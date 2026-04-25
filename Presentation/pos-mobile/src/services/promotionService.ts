import { apiClient } from "../api/client";
import {
    CreatePromotionRequest,
    Promotion,
    UpdatePromotionRequest,
} from "../types/promotion";

export const PromotionService = {
  getAll: async () => {
    const response = await apiClient.get<Promotion[]>("/Promotions");
    return response.data;
  },

  // Matches your [HttpGet("calculate")]
  getCalculatedPrice: async (productId: string, quantity: number) => {
    const response = await apiClient.get<number>("/Promotions/calculate", {
      params: { productId, quantity },
    });
    return response.data;
  },

  create: async (command: CreatePromotionRequest) => {
    const response = await apiClient.post<string>("/Promotions", command);
    return response.data;
  },

  update: async (command: UpdatePromotionRequest) => {
    const response = await apiClient.put(`/Promotions/${command.id}`, command);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/Promotions/${id}`);
  },
};
