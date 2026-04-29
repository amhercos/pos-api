import { apiClient } from "../api/client";
import {
    ChangePasswordDto,
    StoreSettingsResponseDto,
    UpdateProfileDto,
    UpdateStoreSettingsDto,
    UserProfileResponseDto,
} from "../types/settings";

export const settingsService = {
  async getProfile(): Promise<UserProfileResponseDto> {
    const response =
      await apiClient.get<UserProfileResponseDto>("/settings/profile");
    return response.data;
  },

  async getStoreSettings(): Promise<StoreSettingsResponseDto> {
    const response =
      await apiClient.get<StoreSettingsResponseDto>("/settings/store");
    return response.data;
  },

  async updateProfile(data: UpdateProfileDto): Promise<void> {
    await apiClient.put("/settings/profile", data);
  },

  async updateStoreSettings(data: UpdateStoreSettingsDto): Promise<void> {
    await apiClient.put("/settings/store", data);
  },

  async changePassword(data: ChangePasswordDto): Promise<void> {
    await apiClient.put("/settings/change-password", data);
  },
};
