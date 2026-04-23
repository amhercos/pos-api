import { authService } from "@/src/services/authService";
import { isAxiosError } from "axios";
import { Link } from "expo-router";
import { Eye, EyeOff, Lock, LucideIcon, Mail } from "lucide-react-native";
import React, { useCallback, useState, type ReactElement } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  LinearTransition,
} from "react-native-reanimated";
import { useAuth } from "../src/context/AuthContext";

interface ModernInputProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly placeholder: string;
  readonly icon: LucideIcon;
  readonly secure?: boolean;
  readonly showToggle?: boolean;
  readonly onToggle?: () => void;
}

const ModernInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon: Icon,
  secure = false,
  showToggle = false,
  onToggle,
}: ModernInputProps): ReactElement => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(200)}
      className="mb-6"
    >
      <Text className="text-[12px] text-slate-800 font-black uppercase tracking-widest mb-3 ml-1">
        {label}
      </Text>
      <View
        className={`flex-row items-center h-18 px-6 rounded-3xl border-2 bg-slate-50 ${
          isFocused ? "border-blue-600 bg-white" : "border-transparent"
        }`}
      >
        <Icon
          size={22}
          color={isFocused ? "#2563eb" : "#94a3b8"}
          strokeWidth={2.5}
        />
        <TextInput
          className="flex-1 ml-4 text-slate-900 text-lg font-bold"
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          secureTextEntry={secure}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {showToggle && (
          <TouchableOpacity onPress={onToggle} className="p-2">
            {secure ? (
              <EyeOff size={22} color="#64748b" />
            ) : (
              <Eye size={22} color="#64748b" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default function LoginScreen(): ReactElement {
  const { authenticate } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = useCallback(async (): Promise<void> => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Required", "Please provide your sign-in details.");
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
    } catch (error: unknown) {
      setIsLoading(false);
      const message = isAxiosError(error)
        ? "Invalid credentials."
        : "A system error occurred.";
      Alert.alert("Access Denied", message);
    }
  }, [username, password, authenticate]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="px-8"
        >
          <Animated.View
            layout={LinearTransition.springify().damping(15)}
            className="flex-1 justify-center py-12"
          >
            {/* Super Modern Branding */}
            <View className="mb-14">
              <Text className="text-7xl text-slate-950 font-black tracking-tighter leading-[0.9]">
                BizFlow<Text className="text-blue-600">.</Text>
              </Text>
              <View className="w-24 h-3 bg-blue-600 rounded-full mt-6" />
              <Text className="text-slate-800 mt-8 text-2xl font-bold tracking-tight">
                POS & Inventory Management System.
              </Text>
            </View>

            {/* Form Section */}
            <View>
              <ModernInput
                label="Merchant Email"
                value={username}
                onChangeText={setUsername}
                placeholder="Enter Email Address"
                icon={Mail}
              />
              <ModernInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secure={!showPassword}
                icon={Lock}
                showToggle
                onToggle={() => setShowPassword(!showPassword)}
              />

              <TouchableOpacity
                onPress={() => {
                  void handleLogin();
                }}
                disabled={isLoading}
                activeOpacity={0.85}
                className="bg-slate-950 h-16 rounded-[24px] justify-center items-center mt-6 shadow-2xl shadow-blue-200"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-black text-xl tracking-tight">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* High Contrast Footer */}
            <View className="flex-row justify-center items-center mt-14">
              <Text className="text-slate-500 font-bold text-lg">
                New here?{" "}
              </Text>
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-black text-lg">
                    Create Account
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
