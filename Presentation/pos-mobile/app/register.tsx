import { authService } from "@/src/services/authService";
import { RegisterRequest } from "@/src/types/auth";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function RegisterScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    password: "",
    fullName: "",
    businessName: "",
    location: "",
  });

  const handleRegister = async (): Promise<void> => {
    const isFormInvalid = Object.values(formData).some((val) => !val.trim());

    if (isFormInvalid) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      await authService.register(formData);
      Alert.alert("Success", "Store registered! You can now login.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (err: unknown) {
      // Strict Error Handling
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 24 }}
    >
      <View className="mb-6">
        <Text className="text-2xl font-bold text-slate-900">
          Register Store
        </Text>
        <Text className="text-slate-500">
          Join BizFlow and start managing your business
        </Text>
      </View>

      <View>
        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Full Name
          </Text>
          <TextInput
            className="border border-slate-200 p-4 rounded-xl bg-slate-50"
            placeholder="Amher Timpahan"
            value={formData.fullName}
            onChangeText={(text: string) =>
              setFormData((p) => ({ ...p, fullName: text }))
            }
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Email Address
          </Text>
          <TextInput
            className="border border-slate-200 p-4 rounded-xl bg-slate-50"
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text: string) =>
              setFormData((p) => ({ ...p, email: text }))
            }
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Password
          </Text>
          <TextInput
            className="border border-slate-200 p-4 rounded-xl bg-slate-50"
            placeholder="••••••••"
            secureTextEntry
            value={formData.password}
            onChangeText={(text: string) =>
              setFormData((p) => ({ ...p, password: text }))
            }
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Business Name
          </Text>
          <TextInput
            className="border border-slate-200 p-4 rounded-xl bg-slate-50"
            placeholder="BizFlow Solutions"
            value={formData.businessName}
            onChangeText={(text: string) =>
              setFormData((p) => ({ ...p, businessName: text }))
            }
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Location
          </Text>
          <TextInput
            className="border border-slate-200 p-4 rounded-xl bg-slate-50"
            placeholder="Taguig, Philippines"
            value={formData.location}
            onChangeText={(text: string) =>
              setFormData((p) => ({ ...p, location: text }))
            }
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            void handleRegister();
          }}
          disabled={isLoading}
          className={`bg-slate-900 p-4 rounded-xl ${isLoading ? "opacity-70" : ""}`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Register Merchant
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6 mb-10">
          <Text className="text-slate-500">Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text className="text-slate-900 font-bold underline">Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
