import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadToken() {
      const storedToken = await SecureStore.getItemAsync("token");
      setTokenState(storedToken);
      setIsLoading(false);
    }
    loadToken();
  }, []);

  const setToken = async (newToken: string | null) => {
    if (newToken) await SecureStore.setItemAsync("token", newToken);
    else await SecureStore.deleteItemAsync("token");
    setTokenState(newToken);
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
