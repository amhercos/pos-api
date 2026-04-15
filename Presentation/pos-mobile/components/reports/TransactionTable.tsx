import { cn } from "@/src/lib/utils";
import type { RecentTransaction } from "@/src/types/record";
import * as Clipboard from "expo-clipboard"; // Restored for the copy action
import { Copy, Eye, ReceiptText } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface TransactionTableProps {
  data: RecentTransaction[];
  loading: boolean;
  onViewDetails: (id: string) => void;
}

export function TransactionTable({
  data,
  loading,
  onViewDetails,
}: TransactionTableProps) {
  const formatPHP = (val: number) =>
    `₱${val.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const copyToClipboard = async (id: string) => {
    await Clipboard.setStringAsync(id);
    Alert.alert("Copied", "Reference ID copied to clipboard");
  };

  if (loading) {
    return (
      <View className="bg-white rounded-[32px] border border-slate-100 p-24 items-center justify-center">
        <ActivityIndicator color="#2563eb" />
        <Text className="text-[10px] font-black uppercase text-slate-400 mt-2">
          Loading Records...
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
      {/* --- Table Header --- */}
      <View className="flex-row items-center px-6 py-4 bg-slate-50/50 border-b border-slate-100">
        <Text className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Date & Time
        </Text>

        {/* Ref ID Header: Visible on MD screens and up */}
        <Text className="hidden md:flex w-32 lg:w-48 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Ref ID
        </Text>

        <Text className="w-20 md:w-28 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Method
        </Text>

        <Text className="w-24 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
          Amount
        </Text>

        <View className="w-10 ml-2" />
      </View>

      {/* --- Table Body --- */}
      {data.length === 0 ? (
        <View className="py-24 items-center justify-center">
          <ReceiptText size={32} color="#f1f5f9" />
          <Text className="text-xs font-bold uppercase text-slate-300 mt-2">
            No transactions found
          </Text>
        </View>
      ) : (
        data.map((tx) => (
          <View
            key={tx.id}
            className="flex-row items-center px-6 py-5 border-b border-slate-50 last:border-0"
          >
            {/* Date & Time Column */}
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-700">
                {new Date(tx.transactionDate).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              <Text className="text-[10px] font-medium text-slate-400 uppercase">
                {new Date(tx.transactionDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>

            {/* Reference ID Column (Desktop/Tablet) */}
            <TouchableOpacity
              className="hidden md:flex w-32 lg:w-48"
              onPress={() => copyToClipboard(tx.id)}
            >
              <View className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg flex-row items-center self-start">
                <Text className="font-mono text-[9px] font-bold text-slate-500 mr-2 uppercase">
                  {tx.id.length > 12 ? `${tx.id.slice(0, 8)}...` : tx.id}
                </Text>
                <Copy size={10} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            {/* Method Column + Mobile Ref ID */}
            <View className="w-20 md:w-28">
              <View
                className={cn(
                  "px-2 py-0.5 rounded-md self-start border",
                  tx.paymentType === "Cash"
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-orange-50 border-orange-100",
                )}
              >
                <Text
                  className={cn(
                    "text-[8px] font-black uppercase",
                    tx.paymentType === "Cash"
                      ? "text-emerald-600"
                      : "text-orange-600",
                  )}
                >
                  {tx.paymentType}
                </Text>
              </View>

              {/* Mobile Short ID Toggle */}
              <TouchableOpacity
                onPress={() => copyToClipboard(tx.id)}
                className="md:hidden mt-1 flex-row items-center"
              >
                <Text className="font-mono text-[9px] font-bold text-slate-300 uppercase mr-1">
                  #{tx.id.slice(-6)}
                </Text>
                <Copy size={8} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            {/* Amount Column */}
            <View className="w-24">
              <Text className="text-sm font-black text-slate-950 text-right">
                {formatPHP(tx.totalAmount)}
              </Text>
            </View>

            {/* View Details Action */}
            <TouchableOpacity
              onPress={() => onViewDetails(tx.id)}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              activeOpacity={0.6}
              className="ml-2"
            >
              <View
                pointerEvents="none"
                className="h-9 w-9 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
              >
                <Eye size={16} color="#64748b" />
              </View>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}
