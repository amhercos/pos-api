import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const getBaseUrl = (): string => {
  if (__DEV__) {
    // local ipconfig
    return "http://192.168.254.109:5130/api";
  }
  // cloud api
  return "https://cloud-api.com/api";
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const token = await SecureStore.getItemAsync("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError): Promise<never> => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized: Clearing session...");

      await SecureStore.deleteItemAsync("token");
      await AsyncStorage.removeItem("bizflow_user");

      router.replace("/login");
    }

    return Promise.reject(error);
  },
);
