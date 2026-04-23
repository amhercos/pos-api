import { authService } from "@/src/services/authService";
import { RegisterRequest } from "@/src/types/auth";
import { router } from "expo-router";
import {
  Briefcase,
  ChevronLeft,
  Lock,
  LucideIcon,
  Mail,
  MapPin,
  User,
} from "lucide-react-native";
import React, { useCallback, useState, type ReactElement } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

interface RegisterInputProps {
  readonly icon: LucideIcon;
  readonly placeholder: string;
  readonly value: string;
  readonly onChange: (text: string) => void;
  readonly secure?: boolean;
}

const RegisterInput = ({
  icon: Icon,
  placeholder,
  value,
  onChange,
  secure = false,
}: RegisterInputProps): ReactElement => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <View className="mb-4">
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
          onChangeText={onChange}
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </View>
  );
};

export default function RegisterScreen(): ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    password: "",
    fullName: "",
    businessName: "",
    location: "",
  });

  const handleInputChange = useCallback(
    (key: keyof RegisterRequest, value: string): void => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }, []);

  const handleRegister = async (): Promise<void> => {
    if (Object.values(formData).some((val) => !val.trim())) {
      Alert.alert("Incomplete", "Please provide all merchant profile details.");
      return;
    }
    setIsLoading(true);
    try {
      await authService.register(formData);
      Alert.alert("Success", "Merchant account established.", [
        { text: "Login", onPress: () => router.replace("/") },
      ]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Registration failed.";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1 px-8"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            layout={LinearTransition.springify().damping(15)}
            className="flex-1 py-14"
          >
            <TouchableOpacity
              onPress={handleBack}
              className="mb-10 w-14 h-14 bg-slate-50 rounded-[22px] items-center justify-center"
            >
              <ChevronLeft size={28} color="#0f172a" strokeWidth={3} />
            </TouchableOpacity>

            <View className="mb-10">
              <Text className="text-6xl font-black text-slate-950 tracking-tighter">
                Join.
              </Text>
              <Text className="text-slate-800 mt-2 text-2xl font-bold tracking-tight">
                Create your merchant identity.
              </Text>
            </View>

            <View>
              <RegisterInput
                icon={User}
                placeholder="Enter Full Name"
                value={formData.fullName}
                onChange={(t) => handleInputChange("fullName", t)}
              />
              <RegisterInput
                icon={Mail}
                placeholder="Account Email Address"
                value={formData.email}
                onChange={(t) => handleInputChange("email", t)}
              />
              <RegisterInput
                icon={Lock}
                placeholder="Secure Password"
                secure
                value={formData.password}
                onChange={(t) => handleInputChange("password", t)}
              />
              <RegisterInput
                icon={Briefcase}
                placeholder="Registered Business Name"
                value={formData.businessName}
                onChange={(t) => handleInputChange("businessName", t)}
              />
              <RegisterInput
                icon={MapPin}
                placeholder="Primary Store Location"
                value={formData.location}
                onChange={(t) => handleInputChange("location", t)}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                void handleRegister();
              }}
              disabled={isLoading}
              activeOpacity={0.85}
              className="bg-slate-950 h-16 rounded-[24px] justify-center items-center mt-6 shadow-2xl shadow-blue-200"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-xl">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
