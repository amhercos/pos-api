import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://bizflow-ohsr.onrender.com/api";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    const urlPath = originalRequest?.url?.toLowerCase() || "";
    const isAuthEndpoint = urlPath.includes("/auth/");

    if (status === 401 && !isAuthEndpoint) {
      await Promise.all([
        SecureStore.deleteItemAsync("token"),
        AsyncStorage.removeItem("bizflow_user"),
      ]);

      router.dismissAll();
      router.replace("/");
    }

    return Promise.reject(error);
  },
);
