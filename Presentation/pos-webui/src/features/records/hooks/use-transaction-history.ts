import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { RecentTransaction, TransactionDetails } from "../types";

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");


  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {

      const response = await apiClient.get<RecentTransaction[]>(
        `/Transactions/recent?page=${page}&count=${pageSize}`
      );
      setTransactions(response.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);


  const getTransactionById = async (id: string) => {
    try {
      const response = await apiClient.get<TransactionDetails>(`/Transactions/${id}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching transaction details", err);
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