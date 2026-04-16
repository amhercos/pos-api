import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { type AxiosError } from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const getBaseUrl = (): string => {
  return "https://bizflow-api-otoh.onrender.com/api";
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    const urlPath = originalRequest?.url?.toLowerCase() || "";
    const isAuthEndpoint =
      urlPath.includes("/auth/login") || urlPath.includes("/auth/register");

    if (status === 401 && !isAuthEndpoint) {
      await Promise.all([
        SecureStore.deleteItemAsync("token"),
        AsyncStorage.removeItem("bizflow_user"),
      ]);

      if (router.canDismiss()) router.dismissAll();
      router.replace("/");
    }

    return Promise.reject(error);
  },
);
