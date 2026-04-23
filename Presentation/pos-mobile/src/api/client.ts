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

    // RENDER AUTO-WAKE RETRY LOGIC
    const isNetworkError = error.code === "ECONNABORTED" || !error.response;
    const MAX_RETRIES = 3;

    if (isNetworkError && config && (config._retryCount ?? 0) < MAX_RETRIES) {
      config._retryCount = (config._retryCount ?? 0) + 1;

      config.timeout = 60000;

      const delay = (config._retryCount ?? 1) * 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(
        `[API] Retrying request due to timeout (Attempt ${config._retryCount})`,
      );
      return apiClient(config);
    }

    // 401 Handling
    if (status === 401 && !config?.url?.toLowerCase().includes("/auth/")) {
      if (!isRedirecting) {
        isRedirecting = true;
        await Promise.all([
          SecureStore.deleteItemAsync("token"),
          AsyncStorage.removeItem("bizflow_user"),
        ]).catch(() => null);

        setTimeout(() => {
          router.replace("/");
          isRedirecting = false;
        }, 100);
      }
      return new Promise(() => {});
    }

    return Promise.reject(error);
  },
);
