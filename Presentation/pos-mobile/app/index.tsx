import { authService } from "@/src/services/authService";
import { AxiosError, isAxiosError } from "axios"; // Clean named exports
import { Link } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../src/context/AuthContext";

interface LoginErrorResponse {
  message?: string;
}

export default function LoginScreen(): React.JSX.Element {
  const { authenticate } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = useCallback(async (): Promise<void> => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Input Required", "Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login({ username, password });

      await authenticate(result.token, {
        userName: result.userName,
        fullName: result.fullName,
        role: result.role,
      });
    } catch (err: unknown) {
      setIsLoading(false);

      if (isAxiosError(err)) {
        const axiosError = err as AxiosError<LoginErrorResponse>;

        const isTimeout =
          axiosError.code === "ECONNABORTED" || !axiosError.response;

        if (isTimeout) {
          Alert.alert(
            "Server Wake-up",
            "BizFlow server is warming up. This takes about 40 seconds on the first load. Please try again.",
            [{ text: "Retry", style: "default" }],
          );
        } else {
          const message =
            axiosError.response?.data?.message ?? "Invalid credentials.";
          Alert.alert("Login Failed", message);
        }
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
        console.error("Non-Axios Login Error:", err);
      }
    }
  }, [username, password, authenticate]);

  return (
    <View className="flex-1 justify-center p-8 bg-white">
      <View className="mb-10">
        <Text className="text-4xl font-black text-slate-900 tracking-tight">
          BizFlow
        </Text>
        <Text className="text-slate-500 mt-2 text-lg">
          Point of Sale & Inventory Management
        </Text>
      </View>

      <View className="gap-y-4">
        <TextInput
          className="border border-slate-200 p-5 rounded-2xl text-slate-900 bg-slate-50 font-medium"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TextInput
          className="border border-slate-200 p-5 rounded-2xl text-slate-900 bg-slate-50 font-medium"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />

        <TouchableOpacity
          onPress={() => void handleLogin()}
          disabled={isLoading}
          className={`bg-blue-600 p-5 rounded-2xl mt-4 shadow-sm shadow-blue-200 ${
            isLoading ? "opacity-60" : "active:bg-blue-700"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-extrabold text-lg uppercase tracking-wider">
              Login
            </Text>
          )}
        </TouchableOpacity>

        <View className="mt-8 flex-row justify-center items-center">
          <Text className="text-slate-400 font-medium">New store? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 font-bold">Create Account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
