import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { User } from "../types/user";

interface AuthState {
  readonly token: string | null;
  readonly user: User | null;
  readonly isLoading: boolean;
}

interface AuthContextType extends AuthState {
  authenticate: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const wakeUpServer = async (): Promise<void> => {
  const HEALTH_URL = "https://bizflow-ohsr.onrender.com/health";
  try {
    const response = await fetch(HEALTH_URL, { method: "GET" });
    if (!response.ok) {
      console.warn(
        `[Render] Server health check returned status: ${response.status}`,
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(`[Render] Wake-up ping initiated: ${message}`);
  }
};

export function AuthProvider({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const bootstrapAsync = async (): Promise<void> => {
      void wakeUpServer();

      try {
        const [token, userJson] = await Promise.all([
          SecureStore.getItemAsync("token"),
          AsyncStorage.getItem("bizflow_user"),
        ]);

        const user = userJson ? (JSON.parse(userJson) as User) : null;
        setState({ token, user, isLoading: false });
      } catch (error: unknown) {
        console.error("[AuthContext] Bootstrap failed", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    void bootstrapAsync();
  }, []);

  const authenticate = async (token: string, user: User): Promise<void> => {
    try {
      await Promise.all([
        SecureStore.setItemAsync("token", token),
        AsyncStorage.setItem("bizflow_user", JSON.stringify(user)),
      ]);
      setState({ token, user, isLoading: false });
    } catch (error: unknown) {
      throw new Error(
        `Auth persistence failed: ${error instanceof Error ? error.message : "Unknown"}`,
      );
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync("token"),
        AsyncStorage.removeItem("bizflow_user"),
      ]);
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
