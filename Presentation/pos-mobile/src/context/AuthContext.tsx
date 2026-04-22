import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { User } from "../types/user";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  authenticate: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const [token, userJson] = await Promise.all([
          SecureStore.getItemAsync("token"),
          AsyncStorage.getItem("bizflow_user"),
        ]);

        const user = userJson ? (JSON.parse(userJson) as User) : null;
        setState({ token, user, isLoading: false });
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    bootstrapAsync();
  }, []);

  const authenticate = async (token: string, user: User) => {
    try {
      await Promise.all([
        SecureStore.setItemAsync("token", token),
        AsyncStorage.setItem("bizflow_user", JSON.stringify(user)),
      ]);
      setState({ token, user, isLoading: false });
    } catch {
      console.error("[AuthContext] Failed to persist auth session");
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync("token"),
        AsyncStorage.removeItem("bizflow_user"),
      ]);
    } catch {
    } finally {
      setState({ token: null, user: null, isLoading: false });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
