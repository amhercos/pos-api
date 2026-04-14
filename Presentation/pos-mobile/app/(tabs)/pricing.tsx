import { Text, View } from "react-native";

export default function PricingScreen() {
  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-2xl font-black text-slate-900 tracking-tight">
        Special Pricing
      </Text>
      <Text className="text-slate-400 mt-2">
        Configure discounts and bulk pricing rules.
      </Text>
    </View>
  );
}
