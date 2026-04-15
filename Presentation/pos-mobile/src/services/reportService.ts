import { apiClient } from "@/src/api/client";
import type {
    DailySummary,
    RecentTransaction,
    TransactionDetails,
} from "@/src/types/record";

export const reportService = {
  getSummary: async (): Promise<DailySummary> => {
    const response = await apiClient.get<DailySummary>("/Transactions/summary");
    return response.data;
  },

  getRecentTransactions: async (
    page: number,
    pageSize: number,
  ): Promise<RecentTransaction[]> => {
    const response = await apiClient.get<RecentTransaction[]>(
      `/Transactions/recent?page=${page}&pageSize=${pageSize}`,
    );
    return response.data;
  },

  getTransactionById: async (id: string): Promise<TransactionDetails> => {
    // Explicitly returning the call to ensure the promise is handled
    const response = await apiClient.get<TransactionDetails>(
      `/Transactions/${id}`,
    );
    return response.data;
  },
};
