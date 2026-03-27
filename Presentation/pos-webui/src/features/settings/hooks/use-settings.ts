import { useState, useCallback } from "react";
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

  // --- GETTERS ---
  const getStoreSettings = useCallback(async (): Promise<StoreSettings | null> => {
    try {
      const response = await apiClient.get<StoreSettings>("/settings/store");
      return response.data;
    } catch { 
      return null;
    }
  }, []);

  const getProfile = useCallback(async (): Promise<UserProfileResponseDto | null> => {
    try {
      const response = await apiClient.get<UserProfileResponseDto>("/settings/profile");
      return response.data;
    } catch {
      return null;
    }
  }, []);

  // --- UPDATERS ---
  const updateStore = async (data: StoreSettings): Promise<boolean> => {
    setLoading(true);
    try {
      await apiClient.put("/settings/store", data);
      toast.success("Store settings updated");
      return true;
    } catch {
      toast.error("Failed to update store settings");
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
    } catch {
      toast.error("Failed to update profile");
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
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorMessage = err.response?.data?.message || "Failed to update password";
      toast.error(errorMessage);
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