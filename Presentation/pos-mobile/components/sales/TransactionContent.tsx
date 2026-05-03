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
import { cn } from "@/src/lib/utils";
import { PaymentType, type BasketItem } from "@/src/types/sale";
import { calculateBestPromo } from "@/src/utils/promotion-engine";

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
  /**
   * ✅ Evaluate Promotions
   * Recalculates whenever the basket contents change.
   */
  const evaluated = useMemo(() => {
    return basket.map((item) => ({
      ...item,
      promo: calculateBestPromo(item, basket),
    }));
  }, [basket]);

  /**
   * ✅ Total Calculation
   * Checks payment type: Credit bypasses promos, Cash applies them.
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
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-50">
        <View>
          <Text className="font-black text-xl text-slate-900">
            Current Sale
          </Text>
          <Text className="text-slate-400 font-bold text-xs">
            {basket.length} items in basket
          </Text>
        </View>

        {!isTablet && (
          <TouchableOpacity
            onPress={onClose}
            className="bg-slate-100 p-2 rounded-full"
          >
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* ITEMS LIST */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {evaluated.map((item) => {
          const hasPromo =
            activePayment !== PaymentType.Credit && item.promo.appliedPromoId;

          return (
            <View
              key={item.productId}
              className="border-b border-slate-100 py-5"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-4">
                  <Text className="font-bold text-slate-800 text-base leading-tight">
                    {item.name}
                  </Text>

                  {/* Unit Price Context */}
                  <Text className="text-slate-400 text-[10px] font-bold mt-1">
                    Base: {formatPHP(item.unitPrice)}/unit
                  </Text>
                </View>

                <View className="items-end">
                  <Text
                    className={cn(
                      "font-black text-base",
                      hasPromo ? "text-blue-600" : "text-slate-900",
                    )}
                  >
                    {activePayment === PaymentType.Credit
                      ? formatPHP(item.unitPrice * item.quantity)
                      : formatPHP(item.promo.total)}
                  </Text>

                  {/* Discount Callout */}
                  {hasPromo && item.promo.savings > 0 && (
                    <Text className="text-[10px] text-emerald-500 font-bold">
                      Saved {formatPHP(item.promo.savings)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Promo Description */}
              {hasPromo && (
                <View className="mt-2 bg-blue-50 self-start px-2 py-1 rounded-md">
                  <Text className="text-[10px] text-blue-600 font-black uppercase">
                    {item.promo.description}
                  </Text>
                </View>
              )}

              {/* CONTROLS */}
              <View className="flex-row items-center mt-4">
                <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-2">
                  <TouchableOpacity
                    onPress={() =>
                      item.quantity > 1
                        ? updateQuantity(item.productId, item.quantity - 1)
                        : removeItem(item.productId)
                    }
                    className="p-3"
                  >
                    {item.quantity > 1 ? (
                      <Minus size={16} color="#475569" />
                    ) : (
                      <Trash2 size={16} color="#ef4444" />
                    )}
                  </TouchableOpacity>

                  <Text className="mx-4 font-black text-slate-900 text-base">
                    {item.quantity}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="p-3"
                  >
                    <Plus size={16} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* FOOTER */}
      <View className="p-6 border-t border-slate-100 bg-slate-50/30">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="font-bold text-slate-500 uppercase tracking-widest text-xs">
            Total Due
          </Text>
          <Text className="text-3xl font-black text-slate-900">
            {formatPHP(total)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleCheckout}
          disabled={isSubmitting || basket.length === 0}
          className={cn(
            "h-16 rounded-2xl items-center justify-center shadow-lg",
            basket.length === 0
              ? "bg-slate-200"
              : "bg-blue-600 shadow-blue-100",
          )}
        >
          <Text className="text-white font-black text-lg">
            {isSubmitting ? "Generating Receipt..." : "Complete Checkout"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
