import { apiClient } from "@/src/api/client";
import type {
  DailySummary,
  RecentTransaction,
  TopProduct,
  TransactionDetails,
} from "@/src/types/record";
export type ReportPeriod = "today" | "weekly" | "monthly";

export const reportService = {
  getSummary: async (period: ReportPeriod = "today"): Promise<DailySummary> => {
    const response = await apiClient.get<DailySummary>(
      `/Transactions/summary`,
      {
        params: { period },
      },
    );
    return response.data;
  },

  getRecentTransactions: async (
    page: number,
    pageSize: number,
  ): Promise<RecentTransaction[]> => {
    const response = await apiClient.get<RecentTransaction[]>(
      "/Transactions/recent",
      {
        params: { page, pageSize },
      },
    );
    return response.data;
  },

  getTransactionById: async (id: string): Promise<TransactionDetails> => {
    const response = await apiClient.get<TransactionDetails>(
      `/Transactions/${id}`,
    );
    return response.data;
  },

  getTopSelling: async (count: number = 1): Promise<TopProduct[]> => {
    const response = await apiClient.get<TopProduct[]>(
      "/Dashboard/top-selling",
      {
        params: { count },
      },
    );
    return response.data;
  },
};
