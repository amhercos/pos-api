import { apiClient } from "../api/client";
import type {
    CustomerCredit,
    CustomerCreditSummary,
    RecordCreditPaymentCommand,
    UpdateCustomerCreditCommand,
} from "../types/credit";

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
    await apiClient.post("CustomerCredits/pay", command);
  },

  updateCredit: async (command: UpdateCustomerCreditCommand): Promise<void> => {
    await apiClient.put(`CustomerCredits/${command.id}`, command);
  },
} as const;
