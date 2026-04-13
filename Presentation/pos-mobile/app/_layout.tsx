import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        // Optional: Auto-redirect if token exists
        // router.replace("/(tabs)");
      }
    } catch (e) {
      console.error("Auth check failed", e);
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen
        name="register"
        options={{
          presentation: "modal", // Nice slide-up effect on iOS
          headerShown: true,
          title: "Register Store",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
