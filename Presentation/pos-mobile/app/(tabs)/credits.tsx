import {
  ArrowUpDown,
  CheckCircle2,
  History,
  ReceiptText,
  Search,
  TrendingUp,
  UserCog,
  Wallet,
} from "lucide-react-native";
import { Skeleton } from "moti/skeleton";
import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCredits } from "@/src/hooks/use-credits";
import { cn } from "@/src/lib/utils";
import type { CustomerCredit, CustomerCreditSummary } from "@/src/types/credit";

import { CreditSummarySheet } from "@/components/credits/credit-summary-sheet";
import { EditCreditModal } from "@/components/credits/edit-credit-modal";
import { PayCreditModal } from "@/components/credits/pay-credit-modal";

export default function CreditsPage() {
  const {
    credits,
    refreshing,
    fetchCredits,
    recordPayment,
    updateCredit,
    getSummary,
    getCreditStats,
  } = useCredits();

  const [search, setSearch] = useState("");
  const [showSettled, setShowSettled] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");

  const PERIODS = React.useMemo(
    () => [
      { label: "Today", value: "today" },
      { label: "Week", value: "week" },
      { label: "Month", value: "month" },
      { label: "Year", value: "year" },
    ],
    [],
  );
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [creditStats, setCreditStats] = useState<
    import("@/src/types/credit").CreditStats | null
  >(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [selectedCredit, setSelectedCredit] = useState<CustomerCredit | null>(
    null,
  );
  const [editingCredit, setEditingCredit] = useState<CustomerCredit | null>(
    null,
  );
  const [summaryData, setSummaryData] = useState<CustomerCreditSummary | null>(
    null,
  );
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCredits(search, showSettled);
    }, 300);
    return () => clearTimeout(handler);
  }, [search, showSettled, fetchCredits]);

  useEffect(() => {
    let active = true;
    setStatsLoading(true);
    getCreditStats(selectedPeriod).then((stats) => {
      if (active) setCreditStats(stats);
      setStatsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [selectedPeriod, getCreditStats]);

  const handlePeriodChange = (period: string) => {
    requestAnimationFrame(() => {
      setSelectedPeriod(period);
    });
  };

  const MemoizedPeriodPills = useMemo(
    () => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row gap-2 mt-2 mb-2"
      >
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.value}
            onPress={() => handlePeriodChange(p.value)}
            className={cn(
              "px-4 h-9 rounded-full justify-center items-center",
              selectedPeriod === p.value ? "bg-slate-900" : "bg-slate-100",
            )}
            activeOpacity={0.85}
          >
            <Text
              className={cn(
                "text-xs font-bold",
                selectedPeriod === p.value ? "text-white" : "text-slate-900",
              )}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    ),
    [selectedPeriod, PERIODS],
  );

  const handleOpenSummary = async (id: string) => {
    setIsSummaryOpen(true);
    setIsSummaryLoading(true);
    const summary = await getSummary(id);
    if (summary) setSummaryData(summary);
    setIsSummaryLoading(false);
  };

  const processedCredits = useMemo(() => {
    const result = [...credits];
    if (sortOrder) {
      result.sort((a, b) =>
        sortOrder === "asc"
          ? a.creditAmount - b.creditAmount
          : b.creditAmount - a.creditAmount,
      );
    }
    return result;
  }, [credits, sortOrder]);

  const formatPHP = (val: number) =>
    `₱${val.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  return (
    // edges={[]} prevents double safe-area layout padding with parent header navigators
    <SafeAreaView className="flex-1 bg-white" edges={[]}>
      {/* Stats Section Wrapper Area */}
      <View className="px-4 pt-2">
        {MemoizedPeriodPills}
        <View className="flex-row gap-3 mt-2">
          {/* Collected Card */}
          <View className="flex-1 bg-white border border-slate-100 rounded-3xl p-4 flex-row items-center min-h-[90px]">
            <View className="bg-emerald-50 rounded-full p-3 mr-3">
              <TrendingUp size={22} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-slate-400 font-bold tracking-tight">
                Collected
              </Text>
              {statsLoading ? (
                <View className="mt-1">
                  <Skeleton
                    colorMode="light"
                    width={80}
                    height={20}
                    radius={8}
                  />
                </View>
              ) : (
                Boolean(creditStats) && (
                  <Text className="text-xl font-black tracking-tighter text-slate-900 mt-1">
                    {formatPHP(creditStats?.totalCollected ?? 0)}
                  </Text>
                )
              )}
            </View>
          </View>

          {/* Debt Left Card */}
          <View className="flex-1 bg-white border border-slate-100 rounded-3xl p-4 flex-row items-center min-h-[90px]">
            <View className="bg-slate-50 rounded-full p-3 mr-3">
              <Wallet size={22} color="#334155" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-slate-400 font-bold tracking-tight">
                Debt Left
              </Text>
              {statsLoading ? (
                <View className="mt-1">
                  <Skeleton
                    colorMode="light"
                    width={80}
                    height={20}
                    radius={8}
                  />
                </View>
              ) : (
                Boolean(creditStats) && (
                  <Text className="text-xl font-black tracking-tighter text-slate-900 mt-1">
                    {formatPHP(creditStats?.totalActiveDebts ?? 0)}
                  </Text>
                )
              )}
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 mt-2"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchCredits(search, showSettled, true)}
          />
        }
      >
        <View className="flex-row gap-2 mt-4">
          <View className="flex-1 flex-row items-center bg-slate-100 rounded-2xl px-4 h-12">
            <Search size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search customer..."
              className="flex-1 ml-2 text-slate-900 font-bold h-full"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowSettled(!showSettled)}
            className={cn(
              "h-12 w-12 rounded-2xl justify-center items-center border",
              showSettled
                ? "bg-slate-900 border-slate-900"
                : "bg-white border-slate-200",
            )}
          >
            <History size={18} color={showSettled ? "#fff" : "#64748b"} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between mt-6 mb-2">
          <Text className="text-[11px] font-bold uppercase text-slate-400 tracking-wider px-1">
            Customer List
          </Text>
          <TouchableOpacity
            onPress={() =>
              setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
            }
            className="flex-row items-center"
          >
            <Text className="text-[11px] font-bold text-slate-400 mr-1">
              Sort by Balance
            </Text>
            <ArrowUpDown size={12} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Customer Rows Renderer */}
        {refreshing && credits.length === 0 ? (
          <View className="gap-y-3 mt-2">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                colorMode="light"
                width="100%"
                height={130}
                radius={24}
              />
            ))}
          </View>
        ) : (
          processedCredits.map((c) => (
            <View
              key={c.id}
              className="bg-white border border-slate-100 rounded-3xl p-4 mb-3 shadow-sm"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="font-bold text-slate-800 text-base uppercase">
                      {c.customerName}
                    </Text>
                    {c.creditAmount === 0 && (
                      <CheckCircle2
                        size={15}
                        color="#10b981"
                        style={{ marginLeft: 6 }}
                      />
                    )}
                  </View>
                  <Text className="text-slate-400 text-xs font-semibold mt-1">
                    {c.contactInfo || "No contact number added"}
                  </Text>
                </View>
                <Text
                  className={cn(
                    "font-black text-base",
                    c.creditAmount > 0 ? "text-rose-600" : "text-emerald-600",
                  )}
                >
                  {c.creditAmount === 0 ? "Settled" : formatPHP(c.creditAmount)}
                </Text>
              </View>

              <View className="flex-row mt-4 pt-3 border-t border-slate-50 gap-2">
                <TouchableOpacity
                  onPress={() => setEditingCredit(c)}
                  className="bg-slate-50 border border-slate-100 h-10 px-4 rounded-xl justify-center"
                >
                  <UserCog size={16} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleOpenSummary(c.id)}
                  className="flex-1 bg-slate-50 border border-slate-100 h-10 px-4 rounded-xl flex-row items-center justify-center"
                >
                  <ReceiptText size={15} color="#64748b" />
                  <Text className="ml-2 font-bold text-slate-600 text-xs uppercase">
                    Summary
                  </Text>
                </TouchableOpacity>
                {c.creditAmount > 0 && (
                  <TouchableOpacity
                    onPress={() => setSelectedCredit(c)}
                    className="flex-1 bg-emerald-500 h-10 px-4 rounded-xl justify-center items-center"
                  >
                    <Text className="font-black text-white text-xs uppercase tracking-wider">
                      Pay Debt
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Sheet Management Controllers */}
      <CreditSummarySheet
        summary={summaryData}
        isOpen={isSummaryOpen}
        isLoading={isSummaryLoading}
        onClose={() => setIsSummaryOpen(false)}
      />

      <EditCreditModal
        credit={editingCredit}
        isOpen={!!editingCredit}
        onClose={() => setEditingCredit(null)}
        onConfirm={async (name, contact) => {
          if (editingCredit) {
            await updateCredit({
              id: editingCredit.id,
              customerName: name,
              contactInfo: contact,
            });
            setEditingCredit(null);
          }
        }}
      />

      <PayCreditModal
        credit={selectedCredit}
        isOpen={!!selectedCredit}
        onClose={() => setSelectedCredit(null)}
        onConfirm={async (amount) => {
          if (selectedCredit) {
            await recordPayment(selectedCredit.id, amount);
            setSelectedCredit(null);
          }
        }}
      />
    </SafeAreaView>
  );
}
