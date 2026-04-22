import type {
  DailySummary,
  RecentTransaction,
  TopProduct,
  TransactionDetails,
} from "@/src/types/record";
import { useCallback, useEffect, useState } from "react";
import { reportService } from "../services/reportService";

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [topProduct, setTopProduct] = useState<TopProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [historyData, summaryData, topSellingData] = await Promise.all([
        reportService.getRecentTransactions(page, pageSize),
        reportService.getSummary(),
        reportService.getTopSelling(1),
      ]);
      setTransactions(historyData);
      setSummary(summaryData);
      setTopProduct(topSellingData[0] || null);
    } catch (err) {
      console.error("Fetch History Error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const getTransactionById = useCallback(
    async (id: string): Promise<TransactionDetails | null> => {
      try {
        return await reportService.getTransactionById(id);
      } catch (err) {
        console.error("Get Transaction Details Error:", err);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    transactions,
    summary,
    topProduct,
    loading,
    page,
    setPage,
    pageSize,
    refresh: fetchData,
    getTransactionById,
  };
};
