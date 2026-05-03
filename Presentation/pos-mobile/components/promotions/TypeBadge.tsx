import React from "react";
import { Text, View } from "react-native";
import { PromotionType } from "../../src/types/promotion";

interface TypeBadgeProps {
  type: PromotionType | string;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const isBulk = type === PromotionType.Bulk || type === "Bulk";
  const isBundle = type === PromotionType.Bundle || type === "Bundle";
  const isDiscount = type === PromotionType.Discount || type === "Discount";

  let label = "Promotion";
  let bgColor = "bg-slate-50";
  let textColor = "text-slate-600";

  if (isBulk) {
    label = "Bulk Pricing";
    bgColor = "bg-amber-50";
    textColor = "text-amber-600";
  } else if (isBundle) {
    label = "Product Bundle";
    bgColor = "bg-purple-50";
    textColor = "text-purple-600";
  } else if (isDiscount) {
    label = "Standard Discount";
    bgColor = "bg-emerald-50";
    textColor = "text-emerald-600";
  }

  return (
    <View className={`${bgColor} self-start px-3 py-1 rounded-full`}>
      <Text
        className={`${textColor} text-[10px] font-black uppercase tracking-widest`}
      >
        {label}
      </Text>
    </View>
  );
};

export default TypeBadge;
