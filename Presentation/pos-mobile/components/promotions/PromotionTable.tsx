import { Promotion, PromotionType } from "@/src/types/promotion";
import { Edit3, Info, Layers, Package, Tag, Trash2 } from "lucide-react-native";
import React from "react";
import {
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface PromotionTableProps {
  promotions: Promotion[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (promo: Promotion) => void;
  onDelete: (promo: Promotion) => void;
}

export function PromotionTable({
  promotions,
  loading,
  onRefresh,
  onEdit,
  onDelete,
}: PromotionTableProps) {
  const getPromoTheme = (type: PromotionType, isActive: boolean) => {
    if (!isActive)
      return {
        icon: null,
        label: "Inactive",
        color: "text-slate-400",
        bg: "bg-slate-100",
      };

    switch (type) {
      case PromotionType.Bulk:
        return {
          icon: <Layers size={12} color="#6366f1" />,
          label: "Bulk Tier",
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        };
      case PromotionType.Bundle:
        return {
          icon: <Package size={12} color="#f59e0b" />,
          label: "Bundle",
          color: "text-amber-600",
          bg: "bg-amber-50",
        };
      case PromotionType.Discount:
        return {
          icon: <Tag size={12} color="#10b981" />,
          label: "Discount",
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        };
      default:
        return {
          icon: null,
          label: "Promo",
          color: "text-slate-600",
          bg: "bg-slate-50",
        };
    }
  };

  const renderItem = ({ item }: { item: Promotion }) => {
    const theme = getPromoTheme(item.type, item.isActive);

    // Accessing the specific tier price
    const promoPrice = item.tiers?.[0]?.price ?? 0;

    // FIX: Ensure 'originalPrice' is passed from your API/Product data.
    // If your Promotion type doesn't have it, you must join it from the Product list.
    const originalPrice = item.originalPrice || promoPrice / 0.8;

    const savings = originalPrice - promoPrice;
    const discountPercent =
      originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

    return (
      <View
        className={`mb-3 rounded-3xl border overflow-hidden ${
          item.isActive
            ? "bg-white border-slate-100 shadow-sm"
            : "bg-slate-50 border-slate-200 opacity-80"
        }`}
      >
        <TouchableOpacity
          onPress={() => onEdit(item)}
          activeOpacity={0.8}
          className="p-4"
        >
          {/* Header: Type & ID */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-x-2">
              <View
                className={`px-2 py-1 rounded-lg flex-row items-center gap-x-1 ${theme.bg}`}
              >
                {theme.icon}
                <Text
                  className={`text-[9px] font-bold uppercase tracking-tight ${theme.color}`}
                >
                  {theme.label}
                </Text>
              </View>
              {!item.isActive && (
                <Text className="text-slate-400 text-[9px] font-bold uppercase italic">
                  Paused
                </Text>
              )}
            </View>
            <Text className="text-slate-300 font-medium text-[10px]">
              #{item.mainProductId.slice(-4).toUpperCase()}
            </Text>
          </View>

          {/* Main Info Row */}
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text
                className={`text-base font-bold leading-tight ${item.isActive ? "text-slate-900" : "text-slate-500"}`}
                numberOfLines={1}
              >
                {item.name || "Untitled Promotion"}
              </Text>
              <Text className="text-slate-400 text-[11px] font-medium mt-0.5">
                Product: {item.productName}
              </Text>
            </View>

            {/* Price Area */}
            <View className="items-end">
              <View className="flex-row items-center">
                <Text className="text-slate-400 text-[11px] line-through mr-2">
                  ₱{originalPrice.toFixed(2)}
                </Text>
                <View
                  className={`${item.isActive ? "bg-emerald-100" : "bg-slate-200"} px-1.5 py-0.5 rounded-md`}
                >
                  <Text
                    className={`${item.isActive ? "text-emerald-700" : "text-slate-500"} text-[9px] font-black`}
                  >
                    -{discountPercent}%
                  </Text>
                </View>
              </View>
              <Text
                className={`text-lg font-black ${item.isActive ? "text-blue-600" : "text-slate-500"}`}
              >
                ₱{promoPrice.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Footer Info */}
          <View className="mt-3 pt-3 border-t border-slate-50 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Info size={10} color={item.isActive ? "#94a3b8" : "#cbd5e1"} />
              <Text className="text-slate-400 text-[10px] ml-1.5">
                {item.type === PromotionType.Bulk
                  ? `${item.tiers?.[0]?.quantity}+ units required`
                  : `Bundle deal available`}
              </Text>
            </View>

            {item.tiers?.length > 1 && (
              <View className="bg-slate-100 px-2 py-0.5 rounded-md">
                <Text className="text-slate-500 text-[9px] font-bold uppercase">
                  {item.tiers.length} Price Tiers
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Minimized Action Bar */}
        <View className="flex-row bg-slate-50/50 border-t border-slate-100 px-3 py-2 justify-end gap-x-4">
          <TouchableOpacity
            onPress={() => onEdit(item)}
            className="flex-row items-center"
          >
            <Edit3 size={14} color="#64748b" />
            <Text className="text-slate-500 font-bold text-[11px] ml-1.5">
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(item)}
            className="flex-row items-center"
          >
            <Trash2 size={14} color="#ef4444" />
            <Text className="text-red-500 font-bold text-[11px] ml-1.5">
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={promotions}
      keyExtractor={(item) => item.mainProductId}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 140,
        paddingTop: 10,
        paddingHorizontal: 16,
      }}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          tintColor="#2563eb"
        />
      }
    />
  );
}
