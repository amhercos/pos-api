import { reportService, type ReportPeriod } from "@/src/services/reportService";
import type { DailySummary, RecentTransaction } from "@/src/types/record";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export const useReport = (initialPeriod: ReportPeriod = "today") => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransaction[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [period, setPeriod] = useState<ReportPeriod>(initialPeriod);

  const fetchReportData = useCallback(async (targetPeriod: ReportPeriod) => {
    setLoading(true);
    try {
      const [summaryData, transactionsData] = await Promise.all([
        reportService.getSummary(targetPeriod),
        reportService.getRecentTransactions(1, 10, targetPeriod),
      ]);

      setSummary(summaryData);
      setRecentTransactions(transactionsData);
    } catch (error) {
      console.error("[useReport] Error fetching analytics:", error);
      Alert.alert(
        "Error",
        "Failed to load report data. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData(period);
  }, [period, fetchReportData]);

  return {
    summary,
    recentTransactions,
    loading,
    period,
    setPeriod,
    refresh: () => fetchReportData(period),
  };
};
