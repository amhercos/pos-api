import { createContext, useContext } from "react";
import { type User } from "@/types/user";

export interface AuthContextType {
  user: User | null;
  login: (user: User, token : string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// We export the Context object and the Hook here
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};