import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://bizflow-ohsr.onrender.com/api";

// Flag to prevent multiple redirect attempts during a 401 cascade
let isRedirecting = false;

interface BizFlowRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
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
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError): Promise<AxiosResponse | Promise<never>> => {
    const config = error.config as BizFlowRequestConfig;
    const status = error.response?.status;

    // 1. RENDER AUTO-WAKE RETRY LOGIC
    const isNetworkError = error.code === "ECONNABORTED" || !error.response;
    const isServerError = !!(status && status >= 500);
    const MAX_RETRIES = 2;

    if (
      (isNetworkError || isServerError) &&
      config &&
      (config._retryCount ?? 0) < MAX_RETRIES
    ) {
      config._retryCount = (config._retryCount ?? 0) + 1;

      const delay = config._retryCount * 1500;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiClient(config);
    }

    // 2. SESSION GUARD (401 Handling)
    const urlPath = config?.url?.toLowerCase() ?? "";
    const isAuthEndpoint = urlPath.toLowerCase().includes("/auth/");

    if (status === 401 && !isAuthEndpoint) {
      if (!isRedirecting) {
        isRedirecting = true;

        await Promise.all([
          SecureStore.deleteItemAsync("token"),
          AsyncStorage.removeItem("bizflow_user"),
        ]).catch(() => null);

        setTimeout(() => {
          try {
            if (router.canGoBack()) {
              router.dismissAll();
            }
          } catch {
          } finally {
            router.replace("/");
            setTimeout(() => {
              isRedirecting = false;
            }, 1000);
          }
        }, 50);
      }

      // Return a non-resolving promise to stop the component-level catch block from firing
      return new Promise(() => {});
    }

    return Promise.reject(error);
  },
);
