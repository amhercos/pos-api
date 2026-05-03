import { Minus, Plus, Trash2, X } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { formatPHP, roundTo } from "@/src/lib/math";
import { calculateBestPromo } from "@/src/lib/promo-engine";
import { cn } from "@/src/lib/utils";
import { PaymentType, type BasketItem } from "@/src/types/sale";

interface Props {
  isTablet: boolean;
  onClose: () => void;

  basket: BasketItem[];

  activePayment: PaymentType;
  setActivePayment: (p: PaymentType) => void;

  updateQuantity: (id: string, q: number) => void;
  removeItem: (id: string) => void;

  handleCheckout: () => void;
  isSubmitting: boolean;
}

export const TransactionContent: React.FC<Props> = ({
  isTablet,
  onClose,
  basket,
  activePayment,
  setActivePayment,
  updateQuantity,
  removeItem,
  handleCheckout,
  isSubmitting,
}) => {
  const evaluated = useMemo(() => {
    return basket.map((item) => ({
      ...item,
      promo: calculateBestPromo(item, basket),
    }));
  }, [basket]);

  /**
   * ✅ Total
   */
  const total = useMemo(() => {
    return roundTo(
      evaluated.reduce((sum, item) => {
        if (activePayment === PaymentType.Credit) {
          return sum + item.unitPrice * item.quantity;
        }
        return sum + item.promo.total;
      }, 0),
    );
  }, [evaluated, activePayment]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-5 py-4">
        <Text className="font-black text-lg">{basket.length} Items</Text>

        {!isTablet && (
          <TouchableOpacity onPress={onClose}>
            <X size={20} />
          </TouchableOpacity>
        )}
      </View>

      {/* ITEMS */}
      <ScrollView className="flex-1 px-5">
        {evaluated.map((item) => (
          <View key={item.productId} className="border-b border-slate-100 py-4">
            {/* NAME */}
            <Text className="font-bold text-slate-800">{item.name}</Text>

            {/* PRICE */}
            <Text className="text-emerald-600 font-black text-xs mt-1">
              {activePayment === PaymentType.Credit
                ? formatPHP(item.unitPrice * item.quantity)
                : formatPHP(item.promo.total)}
            </Text>

            {/* PROMO */}
            {activePayment !== PaymentType.Credit &&
              item.promo.appliedPromoId && (
                <Text className="text-[10px] text-blue-500 font-bold">
                  {item.promo.description}
                </Text>
              )}

            {/* SAVINGS */}
            {item.promo.savings > 0 && (
              <Text className="text-[10px] text-emerald-500">
                Saved {formatPHP(item.promo.savings)}
              </Text>
            )}

            {/* CONTROLS */}
            <View className="flex-row items-center mt-2">
              <TouchableOpacity
                onPress={() =>
                  item.quantity > 1
                    ? updateQuantity(item.productId, -1)
                    : removeItem(item.productId)
                }
                className="p-1"
              >
                {item.quantity > 1 ? <Minus size={14} /> : <Trash2 size={14} />}
              </TouchableOpacity>

              <Text className="mx-3 font-bold">{item.quantity}</Text>

              <TouchableOpacity
                onPress={() => updateQuantity(item.productId, 1)}
                className="p-1"
              >
                <Plus size={14} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FOOTER */}
      <View className="p-5 border-t border-slate-100">
        <Text className="text-2xl font-black text-slate-900">
          {formatPHP(total)}
        </Text>

        <TouchableOpacity
          onPress={handleCheckout}
          disabled={isSubmitting || basket.length === 0}
          className={cn(
            "mt-4 h-14 rounded-xl items-center justify-center",
            basket.length === 0 ? "bg-slate-200" : "bg-slate-900",
          )}
        >
          <Text className="text-white font-black">
            {isSubmitting ? "Processing..." : "Complete Sale"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
