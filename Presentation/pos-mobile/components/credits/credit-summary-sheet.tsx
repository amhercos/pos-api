import type { CustomerCreditSummary } from "@/src/types/credit";
import {
    ArrowDownLeft,
    Calendar,
    ShoppingBag,
    User,
    X,
} from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface CreditSummarySheetProps {
  summary: CustomerCreditSummary | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export function CreditSummarySheet({
  summary,
  isOpen,
  onClose,
  isLoading,
}: CreditSummarySheetProps) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatPHP = (val: number) =>
    `₱${val.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Fake Sheet Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100">
          <Text className="text-lg font-bold text-slate-900">
            Account Summary
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 bg-slate-50 rounded-full"
          >
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : summary ? (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Customer Profile Header */}
            <View className="p-6 bg-slate-50/50">
              <View className="flex-row items-center gap-3 mb-1">
                <User size={20} color="#3b82f6" />
                <Text className="text-xl font-bold text-slate-900">
                  {summary.customerName}
                </Text>
              </View>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Contact: {summary.contactInfo || "N/A"}
              </Text>

              {/* Debt Card */}
              <View className="mt-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Current Outstanding Balance
                </Text>
                <Text className="text-3xl font-black text-rose-600">
                  {formatPHP(summary.totalDebt)}
                </Text>
              </View>
            </View>

            <View className="p-6 space-y-8">
              {/* Purchase History */}
              <View>
                <View className="flex-row items-center gap-2 mb-4">
                  <ShoppingBag size={18} color="#0f172a" />
                  <Text className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                    Purchase History
                  </Text>
                </View>

                <View className="gap-y-3">
                  {summary.creditPurchases.map((p) => (
                    <View
                      key={p.id}
                      className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50"
                    >
                      <View className="flex-row justify-between items-start mb-1">
                        <Text className="text-sm font-bold text-slate-800">
                          {formatPHP(p.totalAmount)}
                        </Text>
                        <View className="bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                          <Text className="text-[10px] font-bold text-slate-500">
                            {p.itemCount} items
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <Calendar size={12} color="#94a3b8" />
                        <Text className="text-[11px] text-slate-400">
                          {formatDate(p.transactionDate)}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {summary.creditPurchases.length === 0 && (
                    <Text className="text-slate-400 text-xs italic">
                      No purchases recorded.
                    </Text>
                  )}
                </View>
              </View>

              {/* Payment Trail */}
              <View>
                <View className="flex-row items-center gap-2 mb-4">
                  <ArrowDownLeft size={18} color="#10b981" />
                  <Text className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                    Payment Trail
                  </Text>
                </View>

                <View className="gap-y-3 pb-10">
                  {summary.paymentHistory.map((pmt) => (
                    <View
                      key={pmt.id}
                      className="flex-row items-center justify-between p-4 rounded-2xl border border-emerald-50 bg-emerald-50/30"
                    >
                      <View>
                        <Text className="text-[10px] text-slate-400 mb-1">
                          {formatDate(pmt.paymentDate)}
                        </Text>
                        <Text className="text-sm font-bold text-slate-800">
                          Payment Received
                        </Text>
                      </View>
                      <Text className="text-sm font-bold text-emerald-600">
                        {formatPHP(pmt.amount)}
                      </Text>
                    </View>
                  ))}
                  {summary.paymentHistory.length === 0 && (
                    <Text className="text-slate-400 text-xs italic">
                      No payments recorded yet.
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}
