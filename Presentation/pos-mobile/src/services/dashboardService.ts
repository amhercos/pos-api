import { apiClient } from "../api/client";
import {
    DailySummary,
    NearExpiryProduct,
    RecentTransaction,
} from "../types/dashboard";

export const dashboardService = {
  getSummary: async () => {
    const response = await apiClient.get<DailySummary>("/Transactions/summary");
    return response.data;
  },

  getRecentTransactions: async (page: number, count: number) => {
    const response = await apiClient.get<RecentTransaction[]>(
      `/Transactions/recent?page=${page}&count=${count}`,
    );
    return response.data;
  },

  getNearExpiry: async () => {
    const response = await apiClient.get<NearExpiryProduct[]>(
      "/Product/near-expiry",
    );
    return response.data;
  },
};
