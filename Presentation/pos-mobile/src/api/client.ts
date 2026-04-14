import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const getBaseUrl = (): string => {
  if (__DEV__) {
    // Your local machine IP
    return "http://192.168.1.35:5130/api";
  }
  return "https://cloud-api.com/api";
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const token = await SecureStore.getItemAsync("token");

    if (__DEV__) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      );
      console.log(token ? "✅ Token: Attached" : "⚠️ Token: MISSING");
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Response Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError): Promise<never> => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("🚨 Unauthorized (401): Session expired or invalid.");

      await Promise.all([
        SecureStore.deleteItemAsync("token"),
        AsyncStorage.removeItem("bizflow_user"),
      ]);

      try {
        router.replace("/login");
      } catch (navError) {
        console.error("Navigation to login failed:", navError);
      }
    }

    if (__DEV__) {
      console.error(
        ` [API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.data || error.message,
      );
    }

    return Promise.reject(error);
  },
);
