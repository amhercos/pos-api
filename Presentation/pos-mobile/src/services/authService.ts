import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "../api/client";
import {
  ApiError,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/Auth/login",
        credentials,
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || "Login failed.");
    }
  },

  register: async (data: RegisterRequest): Promise<void> => {
    try {
      await apiClient.post("/Auth/register-storeowner", data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(
        axiosError.response?.data?.message || "Registration failed.",
      );
    }
  },

  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync("token");
    await AsyncStorage.removeItem("bizflow_user");
  },
};
