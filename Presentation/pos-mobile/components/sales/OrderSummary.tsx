import { formatPHP } from "@/src/lib/math";
import { cn } from "@/src/lib/utils";
import { type BasketItem } from "@/src/types/sale";
import { Minus, Plus, ShoppingBag } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface OrderSummaryProps {
  basket: BasketItem[];
  updateQuantity: (id: string, q: number) => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  basket,
  updateQuantity,
}) => (
  <View className="flex-1 px-5 pt-4">
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-slate-900 font-black text-xs uppercase tracking-widest">
        Order Items ({basket.length})
      </Text>
      {basket.length > 0 && (
        <Text className="text-[10px] font-bold text-slate-400 uppercase">
          Swipe to remove
        </Text>
      )}
    </View>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {basket.map((item) => (
        <View
          key={item.productId}
          className="flex-row items-center bg-white border border-slate-100 p-4 rounded-3xl mb-3 shadow-sm"
        >
          {/* Item Info */}
          <View className="flex-1 mr-3">
            <Text
              numberOfLines={1}
              className="font-bold text-slate-800 text-[13px] uppercase leading-tight"
            >
              {item.name}
            </Text>
            <Text className="text-[11px] font-medium text-slate-400 mt-0.5">
              {formatPHP(item.unitPrice)} / unit
            </Text>
          </View>

          {/* Quantity Controls */}
          <View className="flex-row items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
            <TouchableOpacity
              onPress={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                "w-8 h-8 items-center justify-center rounded-xl bg-white shadow-sm",
                item.quantity <= 1 && "opacity-30",
              )}
            >
              <Minus size={14} color="#1e293b" strokeWidth={3} />
            </TouchableOpacity>

            <View className="w-10 items-center">
              <Text className="font-black text-slate-900 text-sm">
                {item.quantity}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-8 h-8 items-center justify-center rounded-xl bg-white shadow-sm"
            >
              <Plus size={14} color="#1e293b" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* Line Total */}
          <View className="ml-4 items-end min-w-[80px]">
            <Text className="font-black text-slate-900 text-[13px]">
              {formatPHP(item.unitPrice * item.quantity)}
            </Text>
          </View>
        </View>
      ))}

      {basket.length === 0 && (
        <View className="flex-1 items-center justify-center py-20 opacity-40">
          <View className="bg-slate-100 p-6 rounded-full mb-4">
            <ShoppingBag size={40} color="#94a3b8" />
          </View>
          <Text className="text-slate-400 font-black text-xs uppercase tracking-widest">
            Basket is empty
          </Text>
        </View>
      )}
    </ScrollView>
  </View>
);
