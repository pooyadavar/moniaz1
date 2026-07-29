import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ApiUser, AuthResponse } from "../services/api";
import { apiRequest, postJson } from "../services/api";

const TOKEN_KEY = "moniaz_operator_token";
const USER_KEY = "moniaz_operator_user";

interface AuthContextValue {
  token: string | null;
  user: ApiUser | null;
  isReady: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (fullName: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<ApiUser | null>(() => readStoredUser());
  const [isReady, setIsReady] = useState(false);

  const persistAuth = useCallback((nextToken: string, nextUser: ApiUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      if (!token) {
        setIsReady(true);
        return;
      }

      try {
        const result = await apiRequest<{ success: boolean; user: ApiUser }>(
          "/api/auth/me",
          {},
          token,
        );
        if (!cancelled) {
          setUser(result.user);
          localStorage.setItem(USER_KEY, JSON.stringify(result.user));
        }
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [logout, token]);

  const login = useCallback(
    async (phone: string, password: string) => {
      const result = await postJson<AuthResponse>("/api/auth/login", { phone, password });
      persistAuth(result.token, result.user);
    },
    [persistAuth],
  );

  const register = useCallback(
    async (fullName: string, phone: string, password: string) => {
      const result = await postJson<AuthResponse>("/api/auth/register", {
        fullName,
        phone,
        password,
      });
      persistAuth(result.token, result.user);
    },
    [persistAuth],
  );

  const value = useMemo(
    () => ({ token, user, isReady, login, register, logout }),
    [isReady, login, logout, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
};
