import { Trash2 } from "lucide-react-native";
import React from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { Promotion } from "../../src/types/promotion";
import TypeBadge from "./TypeBadge";

interface PromotionCardProps {
  promotion: Promotion;
  onToggle: () => void;
  onDelete: () => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  onToggle,
  onDelete,
}) => {
  return (
    <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-50">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-4">
          <TypeBadge type={promotion.type} />
          <Text
            className="text-xl font-bold text-slate-900 mt-2"
            numberOfLines={1}
          >
            {promotion.name}
          </Text>
          <Text className="text-slate-500 font-semibold text-sm">
            Applied to: {promotion.productName}
          </Text>
        </View>
        <Switch
          value={promotion.isActive}
          onValueChange={onToggle}
          trackColor={{ false: "#e2e8f0", true: "#dbeafe" }}
          thumbColor={promotion.isActive ? "#2563eb" : "#94a3b8"}
        />
      </View>

      <View className="bg-slate-50 rounded-2xl p-4 mb-4">
        {promotion.tiers.map(
          (tier: { quantity: number; price: number }, index: number) => (
            <View
              key={index}
              className="flex-row justify-between items-center py-1"
            >
              <Text className="text-slate-600 font-medium">
                Qty {tier.quantity}+
              </Text>
              <Text className="text-blue-700 font-bold">
                ₱{tier.price.toFixed(2)} / unit
              </Text>
            </View>
          ),
        )}
        {promotion.tieUpProductName && (
          <View className="mt-2 pt-2 border-t border-slate-200">
            <Text className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              Bundle with
            </Text>
            <Text className="text-slate-700 font-bold">
              {promotion.tieUpProductName}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row justify-end items-center">
        <TouchableOpacity
          onPress={onDelete}
          className="flex-row items-center bg-rose-50 px-4 py-2 rounded-xl"
        >
          <Trash2 size={16} color="#e11d48" />
          <Text className="ml-2 text-rose-600 font-bold text-xs">Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PromotionCard;
