import { useState } from "react";
import axios, { type AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import { type LoginRequest, type AuthResponse, type ApiError } from "../types";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executeLogin = async (command: LoginRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<AuthResponse>("/Auth/login", command);
      const data = response.data;

      localStorage.setItem("token", data.token);

      const userSession = {
        fullName: data.fullName,
        userName: data.userName,
        role: data.role
      };
      
      localStorage.setItem("bizflow_user", JSON.stringify(userSession));

      return data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;
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