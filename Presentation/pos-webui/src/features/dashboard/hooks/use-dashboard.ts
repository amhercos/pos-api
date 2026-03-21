import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { type DailySummary, type RecentTransaction } from "../types";

export const useDashboard = () => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [recent, setRecent] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [summaryRes, recentRes] = await Promise.all([
        apiClient.get<DailySummary>("/Transactions/summary"),
        apiClient.get<RecentTransaction[]>("/Transactions/recent?count=5")
      ]);
      setSummary(summaryRes.data);
      setRecent(recentRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return { summary, recent, isLoading, refresh: fetchDashboardData };
};