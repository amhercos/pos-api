import { Text, View } from "react-native";

export default function CreditsScreen() {
  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-2xl font-black text-slate-900 tracking-tight">
        Credit & Debt
      </Text>
      <Text className="text-slate-400 mt-2">
        Manage customer balances and store debts.
      </Text>
    </View>
  );
}
