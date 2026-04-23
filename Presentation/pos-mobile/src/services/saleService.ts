import { apiClient } from "@/src/api/client";
import type {
    CreateTransactionCommand,
    TransactionResponse,
} from "../types/sale";

export const saleService = {
  checkout: async (command: CreateTransactionCommand) => {
    const { data } = await apiClient.post<TransactionResponse>(
      "/Transactions/checkout",
      command,
    );
    return data;
  },
};
