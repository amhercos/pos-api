import { useState, useEffect, type ReactNode } from "react";
import { type User } from "@/types/user";
import { AuthContext } from "./auth-context-types";
import { apiClient } from "@/lib/api-client";
import { type AxiosError } from "axios";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogoutCleanup = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("bizflow_user");
    setUser(null);
  };

  useEffect(() => {
    const rehydrateAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get("/auth/me");

        if (response.status === 200) {
          setUser({ ...response.data, token });
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error("Failed to re-authenticate:", axiosError);
        
        if (axiosError.response?.status === 401 || axiosError.response?.status === 404) {
          handleLogoutCleanup();
        }
      } finally {
        setIsLoading(false);
      }
    };

    rehydrateAuth();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("bizflow_user", JSON.stringify(userData));
    setUser({ ...userData, token });
  };

  const logout = () => {
    handleLogoutCleanup();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated: !!user, 
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}