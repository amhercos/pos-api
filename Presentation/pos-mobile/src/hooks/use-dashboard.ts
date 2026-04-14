import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";
import type {
  DailySummary,
  NearExpiryProduct,
  RecentTransaction,
} from "../types/dashboard";

export const useDashboard = () => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [recent, setRecent] = useState<RecentTransaction[]>([]);
  const [nearExpiry, setNearExpiry] = useState<NearExpiryProduct[]>([]);

  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [isLoadingExpiry, setIsLoadingExpiry] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  const refreshAll = useCallback(async () => {
    setIsLoadingSummary(true);
    setIsLoadingRecent(true);
    setIsLoadingExpiry(true);
    try {
      const [s, r, e] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRecentTransactions(1, pageSize),
        dashboardService.getNearExpiry(),
      ]);
      setSummary(s);
      setRecent(r);
      setNearExpiry(e);
      setPage(1);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status !== 401) {
        console.error("Dashboard Sync Failed", err.message);
      }
    } finally {
      setIsLoadingSummary(false);
      setIsLoadingRecent(false);
      setIsLoadingExpiry(false);
    }
  }, [pageSize]);

  const fetchPage = async (targetPage: number) => {
    setIsLoadingRecent(true);
    try {
      const data = await dashboardService.getRecentTransactions(
        targetPage,
        pageSize,
      );
      setRecent(data);
      setPage(targetPage);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    summary,
    recent,
    nearExpiry,
    isLoadingSummary,
    isLoadingRecent,
    isLoadingExpiry,
    page,
    pageSize,
    fetchPage,
    refresh: refreshAll,
  };
};
