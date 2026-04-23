import { StatCard } from "@/components/StatCard";
import { dashboardService } from "@/src/services/dashboardService";
import {
  DailySummary,
  NearExpiryProduct,
  RecentTransaction,
} from "@/src/types/dashboard";
import { router } from "expo-router";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Receipt,
  TrendingUp,
} from "lucide-react-native";
import { Skeleton } from "moti/skeleton"; // Added for skeletons
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [recent, setRecent] = useState<RecentTransaction[]>([]);
  const [nearExpiry, setNearExpiry] = useState<NearExpiryProduct[]>([]);

  const formatPHP = (amount: number) =>
    `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, e] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRecentTransactions(1, 5),
        dashboardService.getNearExpiry(),
      ]);
      setSummary(s);
      setRecent(r);
      setNearExpiry(e);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={loadData}
          tintColor="#2563eb"
        />
      }
    >
      {/* Premium Header Section */}
      <View className="mb-8 pt-6">
        <Text className="text-3xl font-black text-slate-900 tracking-tight">
          Dashboard
        </Text>
        <View className="mt-1 h-4 justify-center">
          {loading ? (
            <Skeleton colorMode="light" width={140} height={12} />
          ) : (
            <Text className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              {summary?.date
                ? new Date(summary.date).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}
            </Text>
          )}
        </View>
      </View>

      <Skeleton.Group show={loading}>
        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <Skeleton colorMode="light" width="100%" height={100} radius={24}>
              {summary && (
                <StatCard
                  title="Revenue"
                  value={formatPHP(summary?.totalRevenue ?? 0)}
                  icon={<TrendingUp size={16} color="#3b82f6" />}
                />
              )}
            </Skeleton>
          </View>
          <View className="flex-1">
            <Skeleton colorMode="light" width="100%" height={100} radius={24}>
              {summary && (
                <StatCard
                  title="Orders"
                  value={summary?.totalTransactions ?? 0}
                  icon={<Receipt size={16} color="#94a3b8" />}
                />
              )}
            </Skeleton>
          </View>
        </View>

        {/* Expiry & Stock Skeletons */}
        {loading ? (
          <View className="gap-y-4 mb-8">
            <Skeleton colorMode="light" width="100%" height={120} radius={28} />
            <Skeleton colorMode="light" width="100%" height={70} radius={28} />
          </View>
        ) : (
          <>
            {/* Expiry Warning Card */}
            <View
              className={`p-5 rounded-3xl mb-6 border ${
                nearExpiry.length > 0
                  ? "bg-rose-50 border-rose-100"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <View className="flex-row items-center gap-3 mb-4">
                <View
                  className={`p-2 rounded-xl ${nearExpiry.length > 0 ? "bg-rose-100" : "bg-white"}`}
                >
                  <CalendarDays
                    size={20}
                    color={nearExpiry.length > 0 ? "#e11d48" : "#94a3b8"}
                  />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900">
                    {nearExpiry.length > 0
                      ? "Expiry Warning"
                      : "Inventory Shelf Life"}
                  </Text>
                  <Text className="text-[11px] text-slate-500">
                    {nearExpiry.length > 0
                      ? `${nearExpiry.length} items expiring soon`
                      : "All items are fresh"}
                  </Text>
                </View>
              </View>

              {nearExpiry.slice(0, 2).map((item) => (
                <View
                  key={item.id}
                  className="flex-row justify-between items-center bg-white/80 p-3 rounded-2xl mb-2 border border-rose-100/50"
                >
                  <Text className="text-xs font-bold text-slate-700">
                    {item.name}
                  </Text>
                  <Text className="text-[10px] font-black text-rose-600 uppercase">
                    {item.daysUntilExpiry} days left
                  </Text>
                </View>
              ))}
            </View>

            {/* Low Stock Alert */}
            <View
              className={`p-4 rounded-3xl mb-8 border ${
                (summary?.lowStockCount ?? 0) > 0
                  ? "bg-orange-50 border-orange-100"
                  : "bg-emerald-50 border-emerald-100"
              }`}
            >
              <View className="flex-row items-center gap-3">
                {(summary?.lowStockCount ?? 0) > 0 ? (
                  <AlertCircle color="#ea580c" size={20} />
                ) : (
                  <CheckCircle2 color="#059669" size={20} />
                )}
                <View>
                  <Text className="text-sm font-bold text-slate-900">
                    {(summary?.lowStockCount ?? 0) > 0
                      ? "Stock Alert"
                      : "Inventory Healthy"}
                  </Text>
                  <Text className="text-[11px] text-slate-500">
                    {summary?.lowStockCount} items running low
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Recent Sales Section */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="text-lg font-bold text-slate-900">
              Recent Sales
            </Text>
            {!loading && (
              <TouchableOpacity onPress={() => router.push("/reports")}>
                <Text className="text-xs font-bold text-blue-600">See All</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            {loading
              ? [1, 2, 3].map((i) => (
                  <View
                    key={i}
                    className="flex-row items-center justify-between p-5 border-b border-slate-50"
                  >
                    <View className="flex-row items-center gap-4">
                      <Skeleton
                        colorMode="light"
                        width={6}
                        height={32}
                        radius={4}
                      />
                      <View className="gap-y-1">
                        <Skeleton colorMode="light" width={80} height={14} />
                        <Skeleton colorMode="light" width={60} height={10} />
                      </View>
                    </View>
                    <Skeleton colorMode="light" width={70} height={16} />
                  </View>
                ))
              : recent.map((tx, index) => (
                  <TouchableOpacity
                    key={tx.id}
                    className={`flex-row items-center justify-between p-5 ${
                      index !== recent.length - 1
                        ? "border-b border-slate-50"
                        : ""
                    }`}
                  >
                    <View className="flex-row items-center gap-4">
                      <View
                        className={`w-1.5 h-8 rounded-full ${
                          tx.paymentType === "Cash"
                            ? "bg-emerald-400"
                            : "bg-blue-400"
                        }`}
                      />
                      <View>
                        <Text className="text-sm font-bold text-slate-900">
                          {tx.itemCount} {tx.itemCount === 1 ? "Item" : "Items"}
                        </Text>
                        <Text className="text-[10px] text-slate-400 uppercase font-bold">
                          ID: {tx.id.slice(-6)}
                        </Text>
                      </View>
                    </View>
                    <Text className="font-extrabold text-slate-900">
                      {formatPHP(tx.totalAmount)}
                    </Text>
                  </TouchableOpacity>
                ))}
          </View>
        </View>
      </Skeleton.Group>
    </ScrollView>
  );
}
