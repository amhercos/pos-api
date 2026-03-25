import { useState } from "react";
import { type RegisterRequest, type ApiError } from "../types";
import { apiClient } from "@/lib/api-client"; // Adjust this path to where your axios instance lives
import { AxiosError } from "axios";

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeRegister = async (command: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/Auth/register-storeowner", command);

      return response.status === 200;
      
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      
      const errorMessage = axiosError.response?.data?.message 
        || "Registration failed. Please check your connection.";
      
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { executeRegister, isLoading, error };
}