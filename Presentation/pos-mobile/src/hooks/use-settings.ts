import { useCallback, useEffect, useState } from "react";
import { Vibration } from "react-native";
import Toast from "react-native-toast-message";
import { settingsService } from "../services/settingsService";
import {
    ChangePasswordDto,
    StoreSettingsResponseDto,
    UpdateProfileDto,
    UpdateStoreSettingsDto,
    UserProfileResponseDto,
} from "../types/settings";

interface SettingsState {
  profile: UserProfileResponseDto | null;
  storeSettings: StoreSettingsResponseDto | null;
  isLoading: boolean;
  error: string | null;
}

interface UseSettingsReturn extends SettingsState {
  editableProfile: UserProfileResponseDto | null;
  setEditableProfile: React.Dispatch<
    React.SetStateAction<UserProfileResponseDto | null>
  >;
  editableStoreSettings: StoreSettingsResponseDto | null;
  setEditableStoreSettings: React.Dispatch<
    React.SetStateAction<StoreSettingsResponseDto | null>
  >;
  updateProfile: (data: UpdateProfileDto) => Promise<void>;
  updateStoreSettings: (data: UpdateStoreSettingsDto) => Promise<void>;
  changePassword: (data: ChangePasswordDto) => Promise<void>;
  isProfileDirty: boolean;
  isStoreDirty: boolean;
  isDirty: boolean;
  refetch: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [state, setState] = useState<SettingsState>({
    profile: null,
    storeSettings: null,
    isLoading: true,
    error: null,
  });

  const [editableProfile, setEditableProfile] =
    useState<UserProfileResponseDto | null>(null);
  const [editableStoreSettings, setEditableStoreSettings] =
    useState<StoreSettingsResponseDto | null>(null);

  const fetchSettings = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const [profile, storeSettings] = await Promise.all([
        settingsService.getProfile(),
        settingsService.getStoreSettings(),
      ]);
      setState({ profile, storeSettings, isLoading: false, error: null });
      setEditableProfile(profile);
      setEditableStoreSettings(storeSettings);
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load settings",
      }));
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load settings",
      });
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const updateProfile = useCallback(
    async (data: UpdateProfileDto): Promise<void> => {
      try {
        await settingsService.updateProfile(data);
        setState((prev) =>
          prev.profile
            ? { ...prev, profile: { ...prev.profile, ...data } }
            : prev,
        );
        Vibration.vibrate(100);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Profile updated",
        });
      } catch {
        Toast.show({ type: "error", text1: "Error", text2: "Update failed" });
      }
    },
    [],
  );

  const updateStoreSettings = useCallback(
    async (data: UpdateStoreSettingsDto): Promise<void> => {
      try {
        const numericData: UpdateStoreSettingsDto = {
          ...data,
          lowStockThreshold: Number(data.lowStockThreshold),
          nearExpiryAlertDays: Number(data.nearExpiryAlertDays),
        };
        await settingsService.updateStoreSettings(numericData);
        setState((prev) =>
          prev.storeSettings
            ? {
                ...prev,
                storeSettings: { ...prev.storeSettings, ...numericData },
              }
            : prev,
        );
        setEditableStoreSettings((prev) =>
          prev ? { ...prev, ...numericData } : null,
        );
        Vibration.vibrate(100);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Store settings saved",
        });
      } catch {
        Toast.show({ type: "error", text1: "Error", text2: "Save failed" });
      }
    },
    [],
  );

  const changePassword = useCallback(
    async (data: ChangePasswordDto): Promise<void> => {
      try {
        await settingsService.changePassword(data);
        Vibration.vibrate(100);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Password updated",
        });
      } catch {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Password change failed",
        });
        throw new Error("Password update failed");
      }
    },
    [],
  );

  const isProfileDirty: boolean = !!(
    editableProfile &&
    state.profile &&
    (editableProfile.fullName !== state.profile.fullName ||
      editableProfile.userName !== state.profile.userName)
  );

  const isStoreDirty: boolean = !!(
    editableStoreSettings &&
    state.storeSettings &&
    (editableStoreSettings.storeName !== state.storeSettings.storeName ||
      editableStoreSettings.location !== state.storeSettings.location ||
      Number(editableStoreSettings.lowStockThreshold) !==
        state.storeSettings.lowStockThreshold ||
      Number(editableStoreSettings.nearExpiryAlertDays) !==
        state.storeSettings.nearExpiryAlertDays)
  );

  return {
    ...state,
    editableProfile,
    setEditableProfile,
    editableStoreSettings,
    setEditableStoreSettings,
    updateProfile,
    updateStoreSettings,
    changePassword,
    isProfileDirty,
    isStoreDirty,
    isDirty: isProfileDirty || isStoreDirty,
    refetch: fetchSettings,
  };
};
