import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../services/dashboardService";
import type {
  DailySummary,
  NearExpiryProduct,
  RecentTransaction,
} from "../types/dashboard";

export const useDashboard = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [recent, setRecent] = useState<RecentTransaction[]>([]);
  const [nearExpiry, setNearExpiry] = useState<NearExpiryProduct[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const pageSize = 5;

  const refreshAll = useCallback(async () => {
    if (!token) return;

    setIsLoadingSummary(true);
    try {
      const [s, r, e] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRecentTransactions(1, pageSize),
        dashboardService.getNearExpiry(),
      ]);
      setSummary(s);
      setRecent(r);
      setNearExpiry(e);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status !== 401) {
        console.error("Dashboard Sync Failed", err.message);
      }
    } finally {
      setIsLoadingSummary(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshAll();
    }
  }, [token, refreshAll]);

  return { summary, recent, nearExpiry, isLoadingSummary, refresh: refreshAll };
};
