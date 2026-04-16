import { authService } from "@/src/services/authService";
import { Link } from "expo-router";
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login({ username, password });
      await setToken(result.token);
    } catch (err) {
      Alert.alert(
        "Login Failed",
        err instanceof Error ? err.message : "Unknown error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-slate-900">BizFlow Login</Text>
        <Text className="text-slate-500 mt-2">
          Enter your credentials to access your store
        </Text>
      </View>

      <View className="gap-y-4">
        <View>
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Username
          </Text>
          <TextInput
            className="border border-slate-200 p-4 rounded-xl text-slate-900 bg-slate-50"
            placeholder="Enter Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        <View>
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Password
          </Text>
          <TextInput
            className="border border-slate-200 p-4 rounded-xl text-slate-900 bg-slate-50"
            placeholder="Enter Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
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
          <Text className="text-slate-500">Don't have a store yet? </Text>
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
