import { apiClient } from "@/src/api/client";
import type {
  CreateTransactionCommand,
  TransactionResponse,
} from "../types/sale";
import { showToast } from "../utils/toast";

export const saleService = {
  checkout: async (command: CreateTransactionCommand) => {
    try {
      const { data } = await apiClient.post<TransactionResponse>(
        "/Transactions/checkout",
        command,
      );
      showToast.success("Transaction completed successfully");
      return data;
    } catch {}
  },
};
