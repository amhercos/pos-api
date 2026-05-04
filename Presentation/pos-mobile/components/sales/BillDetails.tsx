import { formatPHP } from "@/src/lib/math";
import { PromotionCalculationResponse } from "@/src/types/promotion";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface BillDetailsProps {
  calcResult: PromotionCalculationResponse;
  isCalculating: boolean;
}

export const BillDetails: React.FC<BillDetailsProps> = ({
  calcResult,
  isCalculating,
}) => (
  <View className="p-5 bg-white">
    <View className="flex-row justify-between mb-2">
      <Text className="text-slate-500 font-bold text-xs uppercase tracking-tight">
        Subtotal
      </Text>
      <Text className="text-slate-700 font-bold">
        {formatPHP(calcResult.originalTotal)}
      </Text>
    </View>

    {calcResult.savings > 0 && (
      <View className="flex-row justify-between mb-2">
        <Text className="text-emerald-600 font-bold text-xs uppercase tracking-tight">
          Promo: {calcResult.appliedPromotionName || "Applied"}
        </Text>
        <Text className="text-emerald-600 font-bold">
          - {formatPHP(calcResult.savings)}
        </Text>
      </View>
    )}

    <View className="h-[1px] bg-slate-100 my-3" />

    <View className="flex-row justify-between items-center">
      <Text className="text-slate-900 font-black text-sm uppercase">
        Grand Total
      </Text>
      {isCalculating ? (
        <ActivityIndicator size="small" color="#10b981" />
      ) : (
        <Text className="text-2xl font-black text-emerald-600">
          {formatPHP(calcResult.discountedTotal)}
        </Text>
      )}
    </View>
  </View>
);
