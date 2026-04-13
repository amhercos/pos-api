import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Dashboard() {
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(
    null,
  );

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("bizflow_user");
      if (userData) setUser(JSON.parse(userData));
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    await AsyncStorage.removeItem("bizflow_user");
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-slate-50 p-6 justify-center items-center">
      <Text className="text-slate-500 uppercase tracking-widest font-bold">
        Welcome Back
      </Text>
      <Text className="text-3xl font-black text-slate-900 mb-2">
        {user?.fullName || "Merchant"}
      </Text>
      <View className="bg-slate-200 px-4 py-1 rounded-full mb-8">
        <Text className="text-slate-700 font-bold text-xs">{user?.role}</Text>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-rose-100 p-4 rounded-2xl w-full"
      >
        <Text className="text-rose-600 text-center font-bold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
