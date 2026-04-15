import { ReceiptModal } from "@/components/reports/ReceiptModal";
import { TransactionTable } from "@/components/reports/TransactionTable";
import { useTransactionHistory } from "@/src/hooks/use-transaction-history";
import { cn } from "@/src/lib/utils";
import type { TransactionDetails } from "@/src/types/record";
import { Filter, RefreshCcw, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecordsScreen() {
  const {
    transactions,
    loading,
    page,
    setPage,
    pageSize,
    refresh,
    summary,
    getTransactionById,
  } = useTransactionHistory();

  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<"All" | "Cash" | "Credit">(
    "All",
  );
  const [selectedTx, setSelectedTx] = useState<TransactionDetails | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const formatPHP = (val: number) =>
    `₱${val.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  const handleOpenReceipt = (id: string) => {
    if (isFetchingDetails) return;

    // 1. Instant UI response
    setIsReceiptOpen(true);
    setSelectedTx(null);
    setIsFetchingDetails(true);

    // 2. Fetch in background without blocking the UI thread
    getTransactionById(id)
      .then((data) => {
        if (data) {
          setSelectedTx(data);
        } else {
          setIsReceiptOpen(false);
        }
      })
      .catch(() => setIsReceiptOpen(false))
      .finally(() => setIsFetchingDetails(false));
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
    <SafeAreaView className="flex-1 bg-slate-50/50" edges={["top"]}>
      <ScrollView
        className="flex-1 px-4 md:px-8 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-black text-slate-950 tracking-tighter">
              Records
            </Text>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
              Transaction History
            </Text>
          </View>
          <TouchableOpacity
            onPress={refresh}
            disabled={loading}
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"
          >
            <RefreshCcw size={18} color={loading ? "#cbd5e1" : "#64748b"} />
          </TouchableOpacity>
        </View>

        {/* Analytics Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6 -mx-4 px-4"
        >
          <AnalyticsCard
            label="Total Revenue"
            value={formatPHP(summary?.totalRevenue || 0)}
            accent="bg-emerald-500"
          />
          <AnalyticsCard
            label="Transactions"
            value={(summary?.totalTransactions ?? 0).toString()}
            accent="bg-blue-500"
          />
          <AnalyticsCard
            label="Performance"
            value="Top Seller"
            accent="bg-amber-500"
          />
        </ScrollView>

        {/* Search & Filters */}
        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 flex-row items-center bg-white border border-slate-100 rounded-2xl px-4 h-12 shadow-sm">
            <Search size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search Reference ID..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-sm font-bold text-slate-700"
            />
          </View>
          <TouchableOpacity
            onPress={() =>
              setMethodFilter((p) =>
                p === "All" ? "Cash" : p === "Cash" ? "Credit" : "All",
              )
            }
            className="bg-white border border-slate-100 rounded-2xl px-4 flex-row items-center shadow-sm"
          >
            <Filter size={16} color="#64748b" />
            <Text className="ml-2 text-xs font-black text-slate-600 uppercase">
              {methodFilter}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Table Area */}
        <View className="mb-20">
          <TransactionTable
            data={filteredTransactions}
            loading={loading}
            onViewDetails={handleOpenReceipt}
          />

          {/* Pagination */}
          <View className="flex-row items-center justify-between mt-4 px-2">
            <TouchableOpacity
              onPress={() => setPage(page - 1)}
              disabled={page === 1}
              className={cn(
                "p-2 rounded-xl",
                page === 1 ? "opacity-30" : "bg-white border border-slate-100",
              )}
            >
              <Text className="text-[10px] font-black uppercase text-slate-600">
                Previous
              </Text>
            </TouchableOpacity>

            <Text className="text-[10px] font-black text-slate-400">
              PAGE {page}
            </Text>

            <TouchableOpacity
              onPress={() => setPage(page + 1)}
              disabled={transactions.length < pageSize}
              className={cn(
                "p-2 rounded-xl",
                transactions.length < pageSize
                  ? "opacity-30"
                  : "bg-white border border-slate-100",
              )}
            >
              <Text className="text-[10px] font-black uppercase text-slate-600">
                Next
              </Text>
            </TouchableOpacity>
          </View>
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

function AnalyticsCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View className="bg-white border border-slate-100 p-5 rounded-[28px] mr-3 shadow-sm min-w-[160px]">
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
