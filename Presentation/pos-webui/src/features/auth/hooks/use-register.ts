import { useState } from "react";
import axios, { type AxiosError } from "axios";
import { type RegisterRequest, type ApiError } from "../types";
import { apiClient } from "@/lib/api-client";

export function useRegister() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executeRegister = async (command: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/Auth/register-storeowner", command);

      return response.status >= 200 && response.status < 300;
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;
        
        const errorMessage = axiosError.response?.data?.message 
          || "Registration failed. Please check your connection.";
        
        setError(errorMessage);
      } else {
        setError("An unexpected error occurred during registration.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { executeRegister, isLoading, error };
}