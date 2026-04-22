import { CalendarDays, Filter, RefreshCcw, Search } from "lucide-react-native";
import React, { ReactElement, useMemo, useState } from "react";
import {
  DimensionValue,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReceiptModal } from "@/components/reports/ReceiptModal";
import { TransactionTable } from "@/components/reports/TransactionTable";
import { useReport } from "@/src/hooks/use-report";
import { useTransactionHistory } from "@/src/hooks/use-transaction-history";
import { cn } from "@/src/lib/utils";
import type { ReportPeriod } from "@/src/services/reportService";
import type { TransactionDetails } from "@/src/types/record";

// Interface for Analytics Card Props
interface AnalyticsCardProps {
  label: string;
  value: string;
  accent: string;
  width: DimensionValue;
}

// Interface for Pagination Props
interface PaginationProps {
  page: number;
  setPage: (p: number) => void;
  hasMore: boolean;
}

export default function RecordsScreen(): ReactElement {
  const {
    summary,
    loading: summaryLoading,
    period,
    setPeriod,
  } = useReport("today");

  const {
    transactions,
    loading: historyLoading,
    page,
    setPage,
    pageSize,
    refresh: refreshHistory,
    getTransactionById,
    topProduct,
  } = useTransactionHistory();

  const loading: boolean = summaryLoading || historyLoading;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<"All" | "Cash" | "Credit">(
    "All",
  );
  const [selectedTx, setSelectedTx] = useState<TransactionDetails | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState<boolean>(false);

  const formatPHP = (val: number): string =>
    `₱${val.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleOpenReceipt = async (id: string): Promise<void> => {
    if (isFetchingDetails) return;
    setIsReceiptOpen(true);
    setSelectedTx(null);
    setIsFetchingDetails(true);

    try {
      const data = await getTransactionById(id);
      if (data) setSelectedTx(data);
      else setIsReceiptOpen(false);
    } catch (error: unknown) {
      console.error("Failed to fetch transaction:", error);
      setIsReceiptOpen(false);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.id
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesMethod =
        methodFilter === "All" || tx.paymentType === methodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [transactions, searchQuery, methodFilter]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-6 pt-6 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-black text-slate-950 tracking-tighter">
              Analytics
            </Text>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Business Performance
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => refreshHistory()}
            disabled={loading}
            className="bg-slate-100 p-3 rounded-2xl"
          >
            <RefreshCcw size={18} color={loading ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
        </View>

        {/* Period Filter Switcher */}
        <View className="px-6 py-6">
          <View className="flex-row bg-slate-100 p-1 rounded-2xl">
            {(["today", "weekly", "monthly"] as ReportPeriod[]).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl items-center",
                  period === p ? "bg-white shadow-sm" : "",
                )}
              >
                <Text
                  className={cn(
                    "text-[10px] font-black uppercase",
                    period === p ? "text-slate-900" : "text-slate-400",
                  )}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Analytics Stats Grid */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between mb-4">
            <AnalyticsCard
              label={`${period} Revenue`}
              value={formatPHP(summary?.totalRevenue || 0)}
              accent="bg-emerald-500"
              width="48%"
            />
            <AnalyticsCard
              label="Volume"
              value={(summary?.totalTransactions ?? 0).toString()}
              accent="bg-blue-500"
              width="48%"
            />
          </View>
          <AnalyticsCard
            label="Most Popular Item"
            value={topProduct ? topProduct.name : "No Data"}
            accent="bg-amber-500"
            width="100%"
          />
        </View>

        {/* Filters */}
        <View className="px-6 mb-4">
          <View className="flex-row gap-2">
            <View className="flex-1 flex-row items-center bg-slate-50 rounded-2xl px-4 h-12">
              <Search size={18} color="#94a3b8" />
              <TextInput
                placeholder="Search Reference..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-2 text-sm font-bold text-slate-700"
              />
            </View>
            <TouchableOpacity
              onPress={() =>
                setMethodFilter((prev) =>
                  prev === "All" ? "Cash" : prev === "Cash" ? "Credit" : "All",
                )
              }
              className="bg-slate-900 rounded-2xl px-4 flex-row items-center"
            >
              <Filter size={16} color="white" />
              <Text className="ml-2 text-[10px] font-black text-white uppercase">
                {methodFilter}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History Area */}
        <View className="px-6 mb-24">
          <Text className="text-lg font-black text-slate-900 mb-4">
            Recent Transactions
          </Text>
          <TransactionTable
            data={filteredTransactions}
            loading={loading}
            onViewDetails={handleOpenReceipt}
          />

          <Pagination
            page={page}
            setPage={setPage}
            hasMore={transactions.length >= pageSize}
          />
        </View>
      </ScrollView>

      <ReceiptModal
        data={selectedTx}
        visible={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedTx(null);
        }}
      />
    </SafeAreaView>
  );
}

// --- Strictly Typed Sub-components ---

function AnalyticsCard({
  label,
  value,
  accent,
  width,
}: AnalyticsCardProps): ReactElement {
  return (
    <View
      style={{ width }}
      className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm"
    >
      <View className={cn("w-8 h-1.5 rounded-full mb-4", accent)} />
      <Text className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </Text>
      <Text className="text-lg font-black text-slate-950" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Pagination({ page, setPage, hasMore }: PaginationProps): ReactElement {
  return (
    <View className="flex-row items-center justify-between mt-6">
      <TouchableOpacity
        onPress={() => setPage(page - 1)}
        disabled={page === 1}
        className={cn(
          "px-4 py-2 rounded-xl",
          page === 1 ? "opacity-20" : "bg-slate-100",
        )}
      >
        <Text className="text-[10px] font-black uppercase text-slate-900">
          Prev
        </Text>
      </TouchableOpacity>

      <View className="flex-row items-center">
        <CalendarDays size={12} color="#94a3b8" />
        <Text className="ml-2 text-[10px] font-black text-slate-400 uppercase">
          Page {page}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => setPage(page + 1)}
        disabled={!hasMore}
        className={cn(
          "px-4 py-2 rounded-xl",
          !hasMore ? "opacity-20" : "bg-slate-100",
        )}
      >
        <Text className="text-[10px] font-black uppercase text-slate-900">
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );
}
