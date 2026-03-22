import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { type DailySummary, type RecentTransaction } from "../types";

export const useDashboard = () => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [recent, setRecent] = useState<RecentTransaction[]>([]);
  
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const refreshAll = useCallback(async () => {
    setIsLoadingSummary(true);
    setIsLoadingRecent(true);
    try {
      const [summaryRes, recentRes] = await Promise.all([
        apiClient.get<DailySummary>("/Transactions/summary"),
        apiClient.get<RecentTransaction[]>(`/Transactions/recent?page=1&count=${pageSize}`)
      ]);
      
      setSummary(summaryRes.data);
      setRecent(recentRes.data);
      setPage(1);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setIsLoadingSummary(false);
      setIsLoadingRecent(false);
    }
  }, [pageSize]);

  const fetchRecentPage = async (targetPage: number, newSize?: number) => {
    const sizeToUse = newSize ?? pageSize;
    setIsLoadingRecent(true);
    try {
      const response = await apiClient.get<RecentTransaction[]>(
        `/Transactions/recent?page=${targetPage}&count=${sizeToUse}`
      );
      
      setRecent(response.data);
      setPage(targetPage);
      if (newSize) setPageSize(newSize);
    } catch (err) {
      console.error("Failed to fetch page", err);
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
    isLoadingSummary, 
    isLoadingRecent, 
    page, 
    pageSize,
    fetchPage: fetchRecentPage,
    refresh: refreshAll 
  };
};