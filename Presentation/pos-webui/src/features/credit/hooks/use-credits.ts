import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type { 
  CustomerCredit, 
  RecordCreditPaymentCommand, 
  CreditApiError,
  CustomerCreditSummary 
} from "../types/credit";

export function useCredits() {
  const [credits, setCredits] = useState<CustomerCredit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCredits = useCallback(async (search?: string, includeSettled: boolean = false): Promise<void> => {
    setLoading(true);
    try {
      const url = search 
        ? `/CustomerCredits/search?name=${encodeURIComponent(search)}` 
        : `/CustomerCredits?includeSettled=${includeSettled}`;
      
      const res = await apiClient.get<CustomerCredit[]>(url);
      setCredits(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = err as CreditApiError;
        toast.error(error.response?.data?.error || "Failed to load credits");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getSummary = useCallback(async (id: string): Promise<CustomerCreditSummary | null> => {
    try {
      const res = await apiClient.get<CustomerCreditSummary>(`/CustomerCredits/${id}/summary`);
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = err as CreditApiError;
        toast.error(error.response?.data?.error || "Failed to load summary");
      }
      return null;
    }
  }, []);

  const recordPayment = async (creditId: string, amount: number): Promise<void> => {
    try {
      const command: RecordCreditPaymentCommand = {
        customerCreditId: creditId,
        amountPaid: Number(amount) 
      };

      await apiClient.post("/CustomerCredits/pay", command);
      toast.success("Payment recorded successfully");
      await fetchCredits(); 
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = err as CreditApiError;
        const serverMessage = error.response?.data?.error || "Payment failed";
        toast.error(serverMessage);
        throw new Error(serverMessage);
      }
      throw err;
    }
  };

  const updateCredit = async (id: string, customerName: string, contactInfo: string): Promise<void> => {
    try {
      const payload = { id, customerName, contactInfo };
      await apiClient.put(`/CustomerCredits/${id}`, payload);
      toast.success("Customer updated successfully");
      await fetchCredits();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = err as CreditApiError;
        toast.error(error.response?.data?.error || "Update failed");
        throw error;
      }
      throw err;
    }
  };

  useEffect(() => { 
    fetchCredits(); 
  }, [fetchCredits]);

  return { credits, loading, fetchCredits, recordPayment, getSummary, updateCredit };
}