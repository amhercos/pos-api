import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import type { RecentTransaction, TransactionDetails } from "../types";

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

 const fetchHistory = useCallback(async (): Promise<void> => {
  setLoading(true);
  try {
    const response = await apiClient.get<RecentTransaction[]>(
      `/Transactions/recent?page=${page}&pageSize=${pageSize}` 
    );
    setTransactions(response.data);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Failed to fetch history:", err.response?.data || err.message);
    }
  } finally {
    setLoading(false);
  }
}, [page, pageSize]);

  const getTransactionById = async (id: string): Promise<TransactionDetails | null> => {
    try {
      const response = await apiClient.get<TransactionDetails>(`/Transactions/${id}`);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Error fetching transaction details:", err.message);
      }
      return null;
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    transactions,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    refresh: fetchHistory,
    getTransactionById 
  };
};