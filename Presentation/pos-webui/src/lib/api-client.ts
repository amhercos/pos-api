import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. REQUEST INTERCEPTOR: Attach the token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR: Handle Token Expiration
apiClient.interceptors.response.use(
  (response) => response, 
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("Session expired. Redirecting to login...");
      
      localStorage.removeItem("token");
      localStorage.removeItem("bizflow_user");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);