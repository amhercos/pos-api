import { cn } from "@/src/lib/utils";
import {
  ArrowDownCircle,
  Layers,
  Package,
  Tag,
  Trash2,
} from "lucide-react-native";
import React from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { formatPHP } from "../../src/lib/math";
import { Promotion, PromotionType } from "../../src/types/promotion";
import TypeBadge from "./TypeBadge";

interface PromotionCardProps {
  promotion: Promotion;
  onToggle: (mainProductId: string) => void; // Updated type signature
  onDelete: (mainProductId: string) => void; // Updated type signature
}

const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  onToggle,
  onDelete,
}) => {
  const isBulk =
    promotion.type === PromotionType.Bulk || promotion.type === "Bulk";
  const isBundle =
    promotion.type === PromotionType.Bundle || promotion.type === "Bundle";
  const isDiscount =
    promotion.type === PromotionType.Discount || promotion.type === "Discount";

  const flatPrice = promotion.tiers[0]?.price ?? 0;

  return (
    <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100">
      {/* --- TOP SECTION --- */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-4">
          <TypeBadge type={promotion.type} />
          <Text
            className="text-xl font-black text-slate-900 mt-2 tracking-tight"
            numberOfLines={1}
          >
            {promotion.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Package size={12} color="#64748b" />
            <Text className="text-slate-500 font-bold text-xs ml-1">
              {promotion.productName ?? "Unknown Product"}
            </Text>
            <Text className="text-slate-300 mx-2">•</Text>
            <Text className="text-slate-400 font-medium text-xs line-through">
              {formatPHP(promotion.originalPrice ?? 0)}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Switch
            value={promotion.isActive}
            // Backend expects the MainProductId for the toggle command
            onValueChange={() => onToggle(promotion.mainProductId)}
            trackColor={{ false: "#e2e8f0", true: "#dbeafe" }}
            thumbColor={promotion.isActive ? "#2563eb" : "#94a3b8"}
          />
          <Text
            className={cn(
              "text-[9px] font-black uppercase mt-1",
              promotion.isActive ? "text-blue-600" : "text-slate-400",
            )}
          >
            {promotion.isActive ? "Active" : "Paused"}
          </Text>
        </View>
      </View>

      {/* --- MIDDLE SECTION: DYNAMIC LOGIC --- */}
      <View
        className={cn(
          "rounded-2xl p-4 mb-4 border",
          isDiscount
            ? "bg-blue-50 border-blue-100"
            : "bg-slate-50/80 border-slate-100",
        )}
      >
        <View className="flex-row items-center mb-3">
          {isDiscount ? (
            <ArrowDownCircle size={14} color="#2563eb" />
          ) : (
            <Tag size={14} color="#334155" />
          )}
          <Text
            className={cn(
              "font-black text-[10px] uppercase ml-2 tracking-widest",
              isDiscount ? "text-blue-700" : "text-slate-700",
            )}
          >
            {isDiscount ? "Flat Discount Applied" : "Pricing Strategy"}
          </Text>
        </View>

        {isDiscount ? (
          <View className="flex-row justify-between items-center py-1">
            <View>
              <Text className="text-slate-500 font-bold text-xs">
                New Unit Price
              </Text>
              <Text className="text-2xl font-black text-blue-700">
                {formatPHP(flatPrice)}
              </Text>
            </View>
            <View className="bg-blue-600 px-3 py-1 rounded-lg">
              <Text className="text-white font-black text-[10px] uppercase">
                Save {formatPHP((promotion.originalPrice ?? 0) - flatPrice)}
              </Text>
            </View>
          </View>
        ) : (
          promotion.tiers.map((tier, index) => (
            <View
              key={tier.id ?? index}
              className="flex-row justify-between items-center py-2 border-b border-slate-200/50 last:border-b-0"
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-white w-8 h-8 rounded-lg items-center justify-center border border-slate-200">
                  <Text className="text-slate-900 font-black text-xs">
                    {tier.quantity}
                  </Text>
                </View>
                <Text className="text-slate-600 font-bold text-sm ml-3">
                  {isBulk ? "Items for" : "paired with bundle"}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-blue-700 font-black text-base">
                  {formatPHP(tier.price)}
                </Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase">
                  {isBulk ? "Total Promo Price" : "Discounted Each"}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Bundle Requirement */}
        {promotion.tieUpProductName && (
          <View
            className={cn(
              "mt-3 pt-3 border-t border-slate-200 flex-row items-center",
              isBundle ? "opacity-100" : "opacity-70",
            )}
          >
            <View
              className={cn(
                "p-2 rounded-xl",
                isBundle ? "bg-blue-100" : "bg-slate-200",
              )}
            >
              <Layers size={14} color={isBundle ? "#2563eb" : "#64748b"} />
            </View>
            <View className="ml-3 flex-1">
              <Text
                className={cn(
                  "text-[9px] uppercase font-black tracking-tighter",
                  isBundle ? "text-blue-600" : "text-slate-500",
                )}
              >
                Bundle Requirement
              </Text>
              <Text
                className="text-slate-700 font-bold text-xs"
                numberOfLines={1}
              >
                Must buy {promotion.tieUpQuantity ?? 1}x{" "}
                {promotion.tieUpProductName}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* --- BOTTOM SECTION: ACTIONS --- */}
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            Target Product ID
          </Text>
          <Text className="text-slate-900 font-mono text-[9px]">
            {promotion.mainProductId.split("-")[0]}...
            {promotion.mainProductId.slice(-4)}
          </Text>
        </View>

        <TouchableOpacity
          // Backend expects the MainProductId for the delete command
          onPress={() => onDelete(promotion.mainProductId)}
          activeOpacity={0.6}
          className="flex-row items-center bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100"
        >
          <Trash2 size={14} color="#e11d48" />
          <Text className="ml-2 text-rose-600 font-black text-[11px] uppercase">
            Remove
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PromotionCard;
