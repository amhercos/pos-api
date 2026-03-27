import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { type DailySummary, type RecentTransaction, type NearExpiryProduct } from "../types";


export const useDashboard = () => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [recent, setRecent] = useState<RecentTransaction[]>([]);
  const [nearExpiry, setNearExpiry] = useState<NearExpiryProduct[]>([]);
  
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [isLoadingExpiry, setIsLoadingExpiry] = useState(false);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const refreshAll = useCallback(async () => {
    setIsLoadingSummary(true);
    setIsLoadingRecent(true);
    setIsLoadingExpiry(true);
    
    try {
      // Fetching summary, recent transactions, and near-expiry products in parallel
      const [summaryRes, recentRes, expiryRes] = await Promise.all([
        apiClient.get<DailySummary>("/Transactions/summary"),
        apiClient.get<RecentTransaction[]>(`/Transactions/recent?page=1&count=${pageSize}`),
        apiClient.get<NearExpiryProduct[]>("/Product/near-expiry")
      ]);
      
      setSummary(summaryRes.data);
      setRecent(recentRes.data);
      setNearExpiry(expiryRes.data);
      setPage(1);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setIsLoadingSummary(false);
      setIsLoadingRecent(false);
      setIsLoadingExpiry(false);
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
    nearExpiry, // New state for the UI
    isLoadingSummary, 
    isLoadingRecent, 
    isLoadingExpiry, // New loading state
    page, 
    pageSize,
    fetchPage: fetchRecentPage,
    refresh: refreshAll 
  };
};