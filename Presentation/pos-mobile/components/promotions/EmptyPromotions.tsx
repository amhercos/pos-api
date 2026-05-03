import { ZapOff } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

const EmptyPromotions = () => (
  <View className="flex-1 items-center justify-center py-20">
    <View className="bg-slate-100 p-6 rounded-full mb-4">
      <ZapOff size={40} color="#94a3b8" />
    </View>
    <Text className="text-slate-900 text-lg font-bold">
      No Active Promotions
    </Text>
    <Text className="text-slate-500 text-center px-10 mt-2">
      Tap the + button to create your first bulk deal or product bundle.
    </Text>
  </View>
);

export default EmptyPromotions;
