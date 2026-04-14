import { cn } from "@/src/lib/utils";
import type { TransactionDetails, TransactionItem } from "@/src/types/record";
import { format } from "date-fns";
import {
    Calendar,
    CreditCard,
    ReceiptText,
    User,
    X,
} from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ReceiptModalProps {
  data: TransactionDetails | null;
  visible: boolean;
  onClose: () => void;
}

interface MetaRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
  isBadge?: boolean;
}

export function ReceiptModal({ data, visible, onClose }: ReceiptModalProps) {
  const formatPHP = (val: number) =>
    `₱${val.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <SafeAreaView
          className="bg-white rounded-t-[40px] h-[90%] shadow-2xl"
          edges={["bottom"]}
        >
          {/* Top Indicator */}
          <View className="items-center py-4">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row justify-between items-center px-8 mb-6">
            <Text className="text-2xl font-black text-slate-950 tracking-tighter">
              Receipt
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-slate-100 p-2 rounded-full"
            >
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {!data ? (
            <View className="flex-1 items-center justify-center pb-20">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                Loading Receipt...
              </Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1 px-8"
              showsVerticalScrollIndicator={false}
            >
              <View className="items-center mb-8">
                <View className="bg-blue-50 p-4 rounded-full mb-3">
                  <ReceiptText size={32} color="#2563eb" />
                </View>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Reference ID
                </Text>
                <Text className="text-sm font-bold text-slate-700 font-mono uppercase">
                  {data.id.slice(-12)}
                </Text>
              </View>

              <View className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 mb-6">
                <MetaRow
                  icon={<Calendar size={14} color="#94a3b8" />}
                  label="Date"
                  value={format(
                    new Date(data.transactionDate),
                    "MMM dd, yyyy • hh:mm aa",
                  )}
                />
                <MetaRow
                  icon={<User size={14} color="#94a3b8" />}
                  label="Cashier"
                  value={data.userName}
                />
                <MetaRow
                  icon={<CreditCard size={14} color="#94a3b8" />}
                  label="Method"
                  value={data.paymentType}
                  isBadge
                />
              </View>

              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 ml-2">
                Items Breakdown
              </Text>
              <View className="border border-slate-100 rounded-[32px] overflow-hidden mb-6">
                {data.items.map((item: TransactionItem, index: number) => (
                  <View
                    key={index}
                    className="flex-row justify-between p-5 border-b border-slate-50 bg-white"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-900">
                        {item.productName}
                      </Text>
                      <Text className="text-[10px] font-bold text-slate-400">
                        {item.quantity} x {formatPHP(item.unitPrice)}
                      </Text>
                    </View>
                    <Text className="text-sm font-black text-slate-950">
                      {formatPHP(item.subTotal)}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="bg-slate-950 rounded-[32px] p-8 mb-10 shadow-lg">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    Total Amount
                  </Text>
                  <Text className="text-white text-2xl font-black">
                    {formatPHP(data.totalAmount)}
                  </Text>
                </View>
                {/* REPLACED DIV WITH VIEW */}
                <View className="h-px bg-slate-800 w-full mb-4" />
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-slate-500 text-[10px] font-bold">
                    Cash Received
                  </Text>
                  <Text className="text-slate-300 text-xs font-bold">
                    {formatPHP(data.cashReceived)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-blue-400 text-[10px] font-black uppercase tracking-widest">
                    Change
                  </Text>
                  <Text className="text-blue-400 text-2xl font-black">
                    {formatPHP(data.changeAmount)}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function MetaRow({ icon, label, value, isBadge }: MetaRowProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center">
        {icon}
        <Text className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
          {label}
        </Text>
      </View>
      {isBadge ? (
        <View
          className={cn(
            "px-2 py-0.5 rounded-lg",
            value === "Cash" ? "bg-emerald-100" : "bg-blue-100",
          )}
        >
          <Text
            className={cn(
              "text-[9px] font-black uppercase",
              value === "Cash" ? "text-emerald-700" : "text-blue-700",
            )}
          >
            {value}
          </Text>
        </View>
      ) : (
        <Text className="text-xs font-bold text-slate-700">
          {value ?? "N/A"}
        </Text>
      )}
    </View>
  );
}
