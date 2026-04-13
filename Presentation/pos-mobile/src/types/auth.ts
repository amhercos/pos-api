import type { UserRole } from "./user";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  fullName: string;
  userName: string;
  role: UserRole;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  businessName: string;
  location: string;
}
