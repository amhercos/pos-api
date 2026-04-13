export interface StoreSettings {
  storeName: string;
  location: string;
  lowStockThreshold: number;
  nearExpiryAlertDays: number;
}

export interface UserProfileResponseDto {
  fullName: string;
  userName: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  userName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export type UserProfile = UserProfileResponseDto;
