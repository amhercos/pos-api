import type { UserRole } from "@/types/user";

export interface LoginRequest {
    username : string;
    password : string;
}

export interface AuthResponse {
    token : string;
    fullName : string;
    userName : string;
    role : UserRole;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}