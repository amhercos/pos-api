import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { creditService } from "../services/creditService";
import type {
    ApiErrorResponse,
    CreditStats,
    CustomerCredit,
    CustomerCreditSummary,
    UpdateCustomerCreditCommand,
} from "../types/credit";

export function useCredits() {
  const [credits, setCredits] = useState<CustomerCredit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchCredits = useCallback(
    async (
      search?: string,
      includeSettled: boolean = false,
      isRefresh: boolean = false,
    ) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await creditService.getCredits(search, includeSettled);
        setCredits(data);
      } catch (error) {
        console.error("[useCredits] fetchCredits Failed:", error);
        if (!isRefresh) {
          Alert.alert(
            "Data Error",
            "Could not synchronize records with the server.",
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  const getSummary = useCallback(
    async (id: string): Promise<CustomerCreditSummary | null> => {
      try {
        return await creditService.getSummary(id);
      } catch {
        Alert.alert("Access Error", "Failed to retrieve the account summary.");
        return null;
      }
    },
    [],
  );

  const getCreditStats = useCallback(
    async (period: string): Promise<CreditStats | null> => {
      try {
        return await creditService.getCreditStats(period);
      } catch {
        Alert.alert("Stats Error", "Unable to load credit statistics.");
        return null;
      }
    },
    [],
  );

  const recordPayment = async (
    creditId: string,
    amount: number,
  ): Promise<void> => {
    try {
      await creditService.recordPayment({
        customerCreditId: creditId,
        amountPaid: amount,
      });
      await fetchCredits(undefined, false, true);
    } catch (error: unknown) {
      let message = "The server rejected the payment record.";

      if (isAxiosError<ApiErrorResponse>(error)) {
        // Matches your backend's new { Error = ex.Message }
        message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          message;
      }

      Alert.alert("Payment Failed", message);
      throw error;
    }
  };

  const updateCredit = async (
    command: UpdateCustomerCreditCommand,
  ): Promise<void> => {
    try {
      await creditService.updateCredit(command);
      await fetchCredits(undefined, false, true);
    } catch (error: unknown) {
      let message = "Failed to save customer changes.";

      if (isAxiosError<ApiErrorResponse>(error)) {
        message = error.response?.data?.error || message;
      }

      Alert.alert("Update Error", message);
      throw error;
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    refreshing,
    fetchCredits,
    getSummary,
    getCreditStats,
    recordPayment,
    updateCredit,
  } as const;
}
