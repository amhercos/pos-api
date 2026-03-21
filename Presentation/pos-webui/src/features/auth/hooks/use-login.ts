import { useState } from "react";
import axios from "axios"; // 💡 Import axios for type checking
import { apiClient } from "@/lib/api-client";
import { type LoginRequest, type AuthResponse } from "../types";

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
      return data;
      
    } catch (err: unknown) { 
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || "Invalid username or password";
        setError(errorMessage);
      } else {
        setError("An unexpected error occurred");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    executeLogin, 
    isLoading, 
    error 
  };
};