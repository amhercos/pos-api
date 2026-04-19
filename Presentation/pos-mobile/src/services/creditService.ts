import { apiClient } from "../api/client";
import {
    CustomerCredit,
    CustomerCreditSummary,
    RecordCreditPaymentCommand,
    UpdateCustomerCreditCommand,
} from "../types/credit";

export const creditService = {
  getCredits: async (search?: string, includeSettled: boolean = false) => {
    const url = search
      ? `/CustomerCredits/search?name=${encodeURIComponent(search)}`
      : `/CustomerCredits?includeSettled=${includeSettled}`;

    const response = await apiClient.get<CustomerCredit[]>(url);
    return response.data;
  },

  getSummary: async (id: string) => {
    const response = await apiClient.get<CustomerCreditSummary>(
      `/CustomerCredits/${id}/summary`,
    );
    return response.data;
  },

  recordPayment: async (command: RecordCreditPaymentCommand) => {
    return await apiClient.post("/CustomerCredits/pay", command);
  },

  updateCredit: async (command: UpdateCustomerCreditCommand) => {
    return await apiClient.put(`/CustomerCredits/${command.id}`, command);
  },
};
