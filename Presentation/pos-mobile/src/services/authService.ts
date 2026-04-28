import { AxiosError } from "axios";
import { apiClient } from "../api/client";
import {
  ApiError,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";
import { showToast } from "../utils/toast";

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/Auth/login",
        credentials,
      );

      showToast.success("Login successful.");

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<void> => {
    try {
      await apiClient.post("/Auth/register-storeowner", data);
      showToast.success("Account Created");
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(
        axiosError.response?.data?.message || "Registration failed.",
      );
    }
  },
};
