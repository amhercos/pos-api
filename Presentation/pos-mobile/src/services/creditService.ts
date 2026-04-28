import { apiClient } from "../api/client";
import type {
  CreditStats,
  CustomerCredit,
  CustomerCreditSummary,
  RecordCreditPaymentCommand,
  UpdateCustomerCreditCommand,
} from "../types/credit";
import { showToast } from "../utils/toast";

export const creditService = {
  getCredits: async (
    search?: string,
    includeSettled: boolean = false,
  ): Promise<CustomerCredit[]> => {
    const url = search
      ? `CustomerCredits/search?name=${encodeURIComponent(search)}`
      : `CustomerCredits?includeSettled=${includeSettled}`;

    const response = await apiClient.get<CustomerCredit[]>(url);
    return response.data;
  },

  getSummary: async (id: string): Promise<CustomerCreditSummary> => {
    const response = await apiClient.get<CustomerCreditSummary>(
      `CustomerCredits/${id}/summary`,
    );
    return response.data;
  },

  recordPayment: async (command: RecordCreditPaymentCommand): Promise<void> => {
    try {
      await apiClient.post("CustomerCredits/pay", command);
      showToast.success("Payment Applied");
    } catch {}
  },

  updateCredit: async (command: UpdateCustomerCreditCommand): Promise<void> => {
    try {
      await apiClient.put(`CustomerCredits/${command.id}`, command);
      showToast.success("Credit Limit Updated");
    } catch {}
  },

  getCreditStats: async (period: string): Promise<CreditStats> => {
    const response = await apiClient.get<CreditStats>(
      `CustomerCredits/stats?period=${encodeURIComponent(period)}`,
    );
    return response.data;
  },
} as const;
