import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";


const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
const isProduction = import.meta.env.PROD;


const getBaseUrl = (): string => {
  if (isProduction || isTauri) {
    return "http://localhost:5130/api";
  }
  return import.meta.env.VITE_API_BASE_URL || "/api";
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. REQUEST INTERCEPTOR: Attach JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR: Handle Auth Failures
apiClient.interceptors.response.use(
  (response) => response, 
  (error: AxiosError): Promise<never> => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized: Clearing session...");
      
      localStorage.removeItem("token");
      localStorage.removeItem("bizflow_user");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);