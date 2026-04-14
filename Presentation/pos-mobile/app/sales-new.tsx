import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function SalesNew() {
  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <Text className="text-xl font-bold">New Sale Logic</Text>
      <Text className="text-slate-500 mt-2 text-center">
        This will be your POS interface where you add items and checkout.
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-6 bg-slate-900 p-4 rounded-xl"
      >
        <Text className="text-white">Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}
