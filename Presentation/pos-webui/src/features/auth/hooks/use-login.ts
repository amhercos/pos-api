import { useState } from "react";
import axios, { AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import { saveAuthToken } from "@/services/db";
import { type LoginRequest, type AuthResponse } from "../types";

interface TauriInternals extends Window {
  __TAURI_INTERNALS__?: Record<string, unknown>;
}

const isRunningInTauri = (): boolean => {
  const win = window as unknown as TauriInternals;
  return typeof window !== "undefined" && win.__TAURI_INTERNALS__ !== undefined;
};

interface ErrorResponse {
  message?: string;
}

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executeLogin = async (command: LoginRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<AuthResponse>("/Auth/login", command);
      const data: AuthResponse = response.data;

      localStorage.setItem("token", data.token);
      
      if (isRunningInTauri()) {
        await saveAuthToken(data.token);
      }

      return data;
    } catch (err: unknown) { 
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ErrorResponse>;
        const errorMessage = axiosError.response?.data?.message || "Invalid username or password";
        setError(errorMessage);
      } else {
        setError("An unexpected error occurred");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { executeLogin, isLoading, error };
};