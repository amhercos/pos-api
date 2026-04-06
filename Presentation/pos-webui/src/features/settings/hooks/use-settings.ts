import { useState, useCallback } from "react";
import axios, { type AxiosError } from "axios";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { 
  StoreSettings, 
  ChangePasswordRequest, 
  ApiError,
  UserProfileResponseDto, 
  UpdateProfileRequest
} from "../types/settings";

export function useSettings() {
  const [loading, setLoading] = useState<boolean>(false);

  const getStoreSettings = useCallback(async (): Promise<StoreSettings | null> => {
    setLoading(true);
    try {
      const response = await apiClient.get<StoreSettings>("/settings/store");
      return response.data;
    } catch { 
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProfile = useCallback(async (): Promise<UserProfileResponseDto | null> => {
    setLoading(true);
    try {
      const response = await apiClient.get<UserProfileResponseDto>("/settings/profile");
      return response.data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStore = async (data: StoreSettings): Promise<boolean> => {
    setLoading(true);
    try {
      await apiClient.put("/settings/store", data);
      toast.success("Store settings updated");
      return true;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;
        // Path corrected: your ApiError interface has response.data.message
        const message = axiosError.response?.data?.response?.data?.message || "Failed to update store settings";
        toast.error(message);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await apiClient.put("/settings/profile", data);
      toast.success("Profile updated successfully");
      return true;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;
        const message = axiosError.response?.data?.response?.data?.message || "Failed to update profile";
        toast.error(message);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await apiClient.put("/settings/change-password", data);
      toast.success("Password changed successfully");
      return true;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;
        const errorMessage = axiosError.response?.data?.response?.data?.message || "Failed to update password";
        toast.error(errorMessage);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    getStoreSettings, 
    getProfile, 
    updateStore, 
    updateProfile, 
    changePassword 
  };
}