import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { creditService } from "../services/creditService";
import { CustomerCredit, CustomerCreditSummary } from "../types/credit";

export function useCredits() {
  const [credits, setCredits] = useState<CustomerCredit[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCredits = useCallback(
    async (search?: string, includeSettled: boolean = false) => {
      setLoading(true);
      try {
        const data = await creditService.getCredits(search, includeSettled);
        setCredits(data);
      } catch (error) {
        console.error("Fetch Credits Error:", error);
        Alert.alert("Error", "Could not load credits. Check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getSummary = async (
    id: string,
  ): Promise<CustomerCreditSummary | null> => {
    try {
      return await creditService.getSummary(id);
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve account summary.");
      return null;
    }
  };

  const recordPayment = async (creditId: string, amount: number) => {
    try {
      await creditService.recordPayment({
        customerCreditId: creditId,
        amountPaid: amount,
      });
      // Refresh list after payment
      await fetchCredits();
    } catch (error) {
      Alert.alert("Payment Failed", "The server rejected the payment record.");
      throw error;
    }
  };

  const updateCredit = async (id: string, name: string, contact: string) => {
    try {
      await creditService.updateCredit({
        id,
        customerName: name,
        contactInfo: contact,
      });
      await fetchCredits();
    } catch (error) {
      Alert.alert("Update Failed", "Could not update customer information.");
      throw error;
    }
  };

  // Initial load
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    fetchCredits,
    getSummary,
    recordPayment,
    updateCredit,
  };
}
