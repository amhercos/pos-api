import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const getBaseUrl = (): string => {
  if (__DEV__) {
    return "http://192.168.254.110:5130/api";
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

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (__DEV__) {
      console.log(` [${config.method?.toUpperCase()}] ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError): Promise<never> => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Unauthorized");

      await Promise.all([
        SecureStore.deleteItemAsync("token"),
        AsyncStorage.removeItem("bizflow_user"),
      ]);

      if (router.canGoBack()) router.dismissAll();
      router.replace("/");
    }

    if (__DEV__) {
      console.error(
        `[API Error] ${error.config?.url}:`,
        error.response?.data || error.message,
      );
    }

    return Promise.reject(error);
  },
);
