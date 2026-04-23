import {
  ArrowUpDown,
  CheckCircle2,
  History,
  ReceiptText,
  RefreshCcw,
  Search,
  UserCog,
  Wallet,
} from "lucide-react-native";
import { Skeleton } from "moti/skeleton"; // Added Skeleton import
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
  } = useCredits();

  const [search, setSearch] = useState("");
  const [showSettled, setShowSettled] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");

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

  const totalOutstanding = useMemo(
    () => credits.reduce((acc, curr) => acc + curr.creditAmount, 0),
    [credits],
  );

  const formatPHP = (val: number) =>
    `₱${val.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-6 pb-4 border-b border-slate-100 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-slate-900">
            Customer Credit
          </Text>
          <Text className="text-xs text-slate-400 font-medium">
            Manage debt and history
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => fetchCredits(search, showSettled, true)}
          className="p-2 rounded-full bg-slate-50"
        >
          <RefreshCcw
            size={18}
            color="#64748b"
            className={refreshing ? "animate-spin" : ""}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchCredits(search, showSettled, true)}
          />
        }
      >
        {/* Total Outstanding Card Skeleton */}
        {refreshing && credits.length === 0 ? (
          <View className="mt-4">
            <Skeleton colorMode="light" width="100%" height={120} radius={24} />
          </View>
        ) : (
          <View className="mt-4 rounded-3xl bg-slate-900 p-6 flex-row items-center justify-between shadow-lg">
            <View>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Total Outstanding
              </Text>
              <Text className="text-3xl font-bold text-white mt-1">
                {formatPHP(totalOutstanding)}
              </Text>
            </View>
            <View className="bg-rose-500/20 p-3 rounded-2xl">
              <Wallet size={24} color="#fb7185" />
            </View>
          </View>
        )}

        <View className="flex-row gap-2 mt-6">
          <View className="flex-1 flex-row items-center bg-slate-100 rounded-2xl px-4 h-12">
            <Search size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search customer..."
              className="flex-1 ml-2 text-slate-900 h-full"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowSettled(!showSettled)}
            className={cn(
              "h-12 px-4 rounded-2xl justify-center border",
              showSettled
                ? "bg-slate-900 border-slate-900"
                : "bg-white border-slate-200",
            )}
          >
            <History size={18} color={showSettled ? "#fff" : "#64748b"} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between mt-6 mb-2">
          <Text className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
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

        {/* Customer List Skeletons */}
        {refreshing && credits.length === 0 ? (
          <View className="gap-y-3 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                colorMode="light"
                width="100%"
                height={140}
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
                    <Text className="font-bold text-slate-900 text-lg">
                      {c.customerName}
                    </Text>
                    {c.creditAmount === 0 && (
                      <CheckCircle2
                        size={16}
                        color="#10b981"
                        style={{ marginLeft: 6 }}
                      />
                    )}
                  </View>
                  <Text className="text-slate-400 text-xs mt-1">
                    {c.contactInfo || "No contact info"}
                  </Text>
                </View>
                <Text
                  className={cn(
                    "font-black text-lg",
                    c.creditAmount > 0 ? "text-rose-600" : "text-emerald-600",
                  )}
                >
                  {c.creditAmount === 0 ? "Settled" : formatPHP(c.creditAmount)}
                </Text>
              </View>

              <View className="flex-row mt-4 pt-4 border-t border-slate-50 gap-2">
                <TouchableOpacity
                  onPress={() => setEditingCredit(c)}
                  className="bg-slate-100 h-10 px-4 rounded-xl justify-center"
                >
                  <UserCog size={18} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleOpenSummary(c.id)}
                  className="flex-1 bg-slate-100 h-10 px-4 rounded-xl flex-row items-center justify-center"
                >
                  <ReceiptText size={16} color="#64748b" />
                  <Text className="ml-2 font-bold text-slate-600 text-xs">
                    Summary
                  </Text>
                </TouchableOpacity>
                {c.creditAmount > 0 && (
                  <TouchableOpacity
                    onPress={() => setSelectedCredit(c)}
                    className="flex-1 bg-emerald-600 h-10 px-4 rounded-xl justify-center items-center"
                  >
                    <Text className="font-bold text-white text-xs">
                      Pay Now
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Sheets and Modals remain unchanged */}
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
