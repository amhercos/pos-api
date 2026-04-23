import type { RecentTransaction } from "@/src/types/record";
import * as Clipboard from "expo-clipboard";
import { Copy, Eye, ReceiptText } from "lucide-react-native";
import { Skeleton } from "moti/skeleton"; // Added for skeletons
import React, { memo, useCallback } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

interface TransactionTableProps {
  data: RecentTransaction[];
  loading: boolean;
  onViewDetails: (id: string) => void;
}

const TransactionRow = memo(
  ({
    tx,
    onViewDetails,
    onCopy,
    formatPHP,
  }: {
    tx: RecentTransaction;
    onViewDetails: (id: string) => void;
    onCopy: (id: string) => void;
    formatPHP: (val: number) => string;
  }) => {
    const date = new Date(tx.transactionDate);
    const isCash = tx.paymentType === "Cash";

    return (
      <View className="flex-row items-center px-6 py-5 border-b border-slate-50">
        <View className="flex-1">
          <Text className="text-xs font-bold text-slate-700">
            {date.toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          <Text className="text-[10px] font-medium text-slate-400 uppercase">
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        <View className="w-20">
          <View
            className={`px-2 py-0.5 rounded-md self-start border ${isCash ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"}`}
          >
            <Text
              className={`text-[8px] font-black uppercase ${isCash ? "text-emerald-600" : "text-orange-600"}`}
            >
              {tx.paymentType}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onCopy(tx.id)}
            className="mt-1 flex-row items-center"
          >
            <Text className="font-mono text-[9px] font-bold text-slate-300 uppercase mr-1">
              #{tx.id.slice(-6)}
            </Text>
            <Copy size={8} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <View className="w-24">
          <Text className="text-sm font-black text-slate-950 text-right">
            {formatPHP(tx.totalAmount)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onViewDetails(tx.id)}
          className="ml-4 h-9 w-9 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
        >
          <Eye size={16} color="#64748b" />
        </TouchableOpacity>
      </View>
    );
  },
);

export const TransactionTable = memo(
  ({ data, loading, onViewDetails }: TransactionTableProps) => {
    const formatPHP = useCallback(
      (val: number) =>
        `₱${val.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      [],
    );

    const copyToClipboard = useCallback(async (id: string) => {
      await Clipboard.setStringAsync(id);
      Alert.alert("Copied", "Reference ID copied to clipboard");
    }, []);

    // Skeleton Loader state
    if (loading) {
      return (
        <View className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
          {/* Header remains visible for structure */}
          <View className="flex-row items-center px-6 py-4 bg-slate-50/50 border-b border-slate-100">
            <Text className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Date & Time
            </Text>
            <Text className="w-20 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Method
            </Text>
            <Text className="w-24 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
              Amount
            </Text>
            <View className="w-10 ml-4" />
          </View>

          {/* Loop of 5 Skeleton Rows */}
          <Skeleton.Group show={true}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                className="flex-row items-center px-6 py-5 border-b border-slate-50"
              >
                <View className="flex-1 gap-y-1">
                  <Skeleton colorMode="light" width={80} height={12} />
                  <Skeleton colorMode="light" width={50} height={10} />
                </View>
                <View className="w-20 gap-y-1">
                  <Skeleton
                    colorMode="light"
                    width={40}
                    height={14}
                    radius={4}
                  />
                  <Skeleton colorMode="light" width={60} height={10} />
                </View>
                <View className="w-24 items-end">
                  <Skeleton colorMode="light" width={70} height={16} />
                </View>
                <View className="ml-4">
                  <Skeleton
                    colorMode="light"
                    radius="round"
                    height={36}
                    width={36}
                  />
                </View>
              </View>
            ))}
          </Skeleton.Group>
        </View>
      );
    }

    return (
      <View className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
        <View className="flex-row items-center px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <Text className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Date & Time
          </Text>
          <Text className="w-20 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Method
          </Text>
          <Text className="w-24 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
            Amount
          </Text>
          <View className="w-10 ml-4" />
        </View>

        {data.length === 0 ? (
          <View className="py-24 items-center justify-center">
            <ReceiptText size={24} color="#cbd5e1" />
            <Text className="text-[10px] font-black uppercase text-slate-300 mt-2">
              No records
            </Text>
          </View>
        ) : (
          data.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              onViewDetails={onViewDetails}
              onCopy={copyToClipboard}
              formatPHP={formatPHP}
            />
          ))
        )}
      </View>
    );
  },
);

TransactionRow.displayName = "TransactionRow";
TransactionTable.displayName = "TransactionTable";
