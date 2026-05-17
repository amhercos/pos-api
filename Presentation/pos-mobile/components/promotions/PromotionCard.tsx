import { cn } from "@/src/lib/utils";
import { Edit3, Layers, Trash2 } from "lucide-react-native";
import React from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { formatPHP } from "../../src/lib/math";
import { Promotion, PromotionType } from "../../src/types/promotion";
import TypeBadge from "./TypeBadge";

interface PromotionCardProps {
  promotion: Promotion;
  onToggle: (mainProductId: string) => void;
  onDelete: (mainProductId: string) => void;
  onEdit: (promotion: Promotion) => void;
}

export default function PromotionCard({
  promotion,
  onToggle,
  onDelete,
  onEdit,
}: PromotionCardProps) {
  // Safe string & enum hybrid comparison to prevent TypeScript compiler crashes
  const isBundle =
    promotion.type === PromotionType.Bundle || promotion.type === "Bundle";
  const isDiscount =
    promotion.type === PromotionType.Discount || promotion.type === "Discount";

  const flatPrice = promotion.tiers[0]?.price ?? 0;
  const basePrice = promotion.originalPrice ?? 0;

  return (
    <View
      className={cn(
        "rounded-2xl p-4 mb-3 border shadow-sm",
        promotion.isActive
          ? "bg-white border-slate-100"
          : "bg-slate-50/70 border-slate-200/60",
      )}
    >
      {/* --- HEADER --- */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-1 pr-2">
          <TypeBadge type={promotion.type} />
          <Text
            className="text-[11px] font-medium text-slate-400 mt-1"
            numberOfLines={1}
          >
            {promotion.name}
          </Text>
        </View>

        {/* Minimalized Toggle Layout */}
        <View className="flex-row items-center gap-x-1">
          <Text
            className={cn(
              "text-[9px] font-black uppercase tracking-tight",
              promotion.isActive ? "text-blue-600" : "text-slate-400",
            )}
          >
            {promotion.isActive ? "Live" : "Paused"}
          </Text>
          <Switch
            value={promotion.isActive}
            onValueChange={() => onToggle(promotion.mainProductId)}
            trackColor={{ false: "#cbd5e1", true: "#bfdbfe" }}
            thumbColor={promotion.isActive ? "#2563eb" : "#64748b"}
            style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
          />
        </View>
      </View>

      {/* --- CORE ITEM INFORMATION --- */}
      <View className="mb-2.5">
        <Text
          className={cn(
            "text-xl font-black tracking-tight",
            promotion.isActive ? "text-slate-900" : "text-slate-400 font-bold",
          )}
          numberOfLines={1}
        >
          {promotion.productName ?? "Unknown Product"}
        </Text>

        {/* Combo Subtitle Rule */}
        {isBundle && promotion.tieUpProductName && (
          <View className="flex-row items-center mt-0.5">
            <Layers
              size={10}
              color={promotion.isActive ? "#64748b" : "#94a3b8"}
            />
            <Text
              className={cn(
                "font-medium text-xs ml-1",
                promotion.isActive ? "text-slate-500" : "text-slate-400",
              )}
              numberOfLines={1}
            >
              Pairs with:{" "}
              <Text
                className={
                  promotion.isActive
                    ? "font-bold text-slate-800"
                    : "font-medium text-slate-500"
                }
              >
                {promotion.tieUpProductName}
              </Text>
            </Text>
          </View>
        )}

        <Text className="text-slate-400 font-bold text-[11px] mt-1">
          Standard Retail: {formatPHP(basePrice)}
        </Text>
      </View>

      {/* --- PRICING DISPLAY (Ghost Dividers Pattern) --- */}
      {isDiscount ? (
        <View className="border-t border-b border-slate-100 py-2.5 mb-3 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">
              Promo Retail Price
            </Text>
            <Text
              className={cn(
                "text-2xl font-black mt-0.5",
                promotion.isActive ? "text-blue-600" : "text-slate-400",
              )}
            >
              {formatPHP(flatPrice)}
            </Text>
          </View>
          <Text
            className={cn(
              "font-black text-xs uppercase",
              promotion.isActive ? "text-emerald-600" : "text-slate-400",
            )}
          >
            Save {formatPHP(basePrice - flatPrice)} each
          </Text>
        </View>
      ) : (
        <View className="border-t border-slate-100 pt-2 mb-3">
          {promotion.tiers.map((tier, index) => {
            const wholesaleImpact = basePrice * tier.quantity - tier.price;
            return (
              <View
                key={tier.id ?? index}
                className="flex-row justify-between items-center py-1.5 border-b border-slate-100/60 last:border-b-0"
              >
                <Text
                  className={cn(
                    "font-medium text-xs",
                    promotion.isActive ? "text-slate-700" : "text-slate-400",
                  )}
                >
                  {tier.quantity} units for{" "}
                  <Text
                    className={cn(
                      "font-black",
                      promotion.isActive ? "text-blue-600" : "text-slate-500",
                    )}
                  >
                    {formatPHP(tier.price)}
                  </Text>
                </Text>

                {wholesaleImpact > 0 && (
                  <Text
                    className={cn(
                      "text-[10px] font-bold uppercase",
                      promotion.isActive
                        ? "text-emerald-600"
                        : "text-slate-400",
                    )}
                  >
                    Save {formatPHP(wholesaleImpact)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* --- ACTIONS BAR --- */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => onEdit(promotion)}
          activeOpacity={0.7}
          className="flex-1 flex-row items-center justify-center bg-slate-50 py-2 rounded-lg border border-slate-100"
        >
          <Edit3 size={12} color="#475569" />
          <Text className="ml-1.5 text-slate-600 font-bold text-xs uppercase tracking-tight">
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(promotion.mainProductId)}
          activeOpacity={0.7}
          className="flex-1 flex-row items-center justify-center bg-rose-50/20 py-2 rounded-lg border border-rose-100/60"
        >
          <Trash2 size={12} color="#e11d48" />
          <Text className="ml-1.5 text-rose-600 font-bold text-xs uppercase tracking-tight">
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
