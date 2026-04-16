import { authService } from "@/src/services/authService";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../src/context/AuthContext";

export default function LoginScreen() {
  const { setToken } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login({ username, password });

      await setToken(result.token);

      // Navigates to app/(tabs)/dashboard.tsx
      router.replace("/(tabs)/dashboard");
    } catch (err) {
      const error = err as Error;
      Alert.alert("Login Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-slate-900">BizFlow</Text>
        <Text className="text-slate-500 mt-2">
          Enter credentials to access your store
        </Text>
      </View>

      <View className="gap-y-4">
        <TextInput
          className="border border-slate-200 p-4 rounded-xl text-slate-900 bg-slate-50"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          className="border border-slate-200 p-4 rounded-xl text-slate-900 bg-slate-50"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          className={`bg-slate-900 p-4 rounded-xl mt-4 ${isLoading ? "opacity-70" : ""}`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Login
            </Text>
          )}
        </TouchableOpacity>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-slate-500">New store? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text className="text-slate-900 font-bold underline">
                Register
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
