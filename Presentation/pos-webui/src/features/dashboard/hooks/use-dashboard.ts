import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import type { DailySummary, RecentTransaction, NearExpiryProduct } from "../types";

export const useDashboard = () => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [recent, setRecent] = useState<RecentTransaction[]>([]);
  const [nearExpiry, setNearExpiry] = useState<NearExpiryProduct[]>([]);
  
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState<boolean>(false);
  const [isLoadingExpiry, setIsLoadingExpiry] = useState<boolean>(false);
  
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const refreshAll = useCallback(async (): Promise<void> => {
    setIsLoadingSummary(true);
    setIsLoadingRecent(true);
    setIsLoadingExpiry(true);
    
    try {
      const [summaryRes, recentRes, expiryRes] = await Promise.all([
        apiClient.get<DailySummary>("/Transactions/summary"),
        apiClient.get<RecentTransaction[]>(`/Transactions/recent?page=1&count=${pageSize}`),
        apiClient.get<NearExpiryProduct[]>("/Product/near-expiry")
      ]);
      
      setSummary(summaryRes.data);
      setRecent(recentRes.data);
      setNearExpiry(expiryRes.data);
      setPage(1);
    } catch (err: unknown) {
      // Internal logging for dashboard failures
      if (axios.isAxiosError(err)) {
        console.error("Dashboard fetch failed:", err.response?.data || err.message);
      } else {
        console.error("An unexpected error occurred in Dashboard", err);
      }
    } finally {
      setIsLoadingSummary(false);
      setIsLoadingRecent(false);
      setIsLoadingExpiry(false);
    }
  }, [pageSize]);

  const fetchRecentPage = async (targetPage: number, newSize?: number): Promise<void> => {
    const sizeToUse = newSize ?? pageSize;
    setIsLoadingRecent(true);
    try {
      const response = await apiClient.get<RecentTransaction[]>(
        `/Transactions/recent?page=${targetPage}&count=${sizeToUse}`
      );
      
      setRecent(response.data);
      setPage(targetPage);
      if (newSize) setPageSize(newSize);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Recent transactions fetch failed:", err.message);
      }
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
    fetchPage: fetchRecentPage,
    refresh: refreshAll 
  };
};