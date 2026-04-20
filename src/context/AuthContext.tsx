import { useCallback, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/services/auth.service";
import {
  clearAuthStorage,
  getAccessToken,
  getStoredUser,
  setStoredUser,
} from "@/services/authStorage";
import { resolveUserRole } from "@/utils/authRole";
import {
  AuthContext,
  type AuthContextValue,
  type AuthState,
  type User,
} from "./authTypes";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      // Token-first bootstrap: avoid calling refresh on app load to prevent 401 noise
      // when refresh cookies are missing/blocked (common in local dev).
      try {
        const persistedToken = getAccessToken();
        const persistedUser = getStoredUser<User>();

        if (!persistedToken) {
          // No token => treat as logged out (user can login manually).
          if (cancelled) return;
          if (persistedUser && resolveUserRole(persistedUser as unknown as Record<string, unknown>) !== "admin") {
            clearAuthStorage();
          }
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        const user = await authService.getMe();
        if (cancelled) return;
        if (resolveUserRole(user as unknown as Record<string, unknown>) !== "admin") {
          clearAuthStorage();
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        setStoredUser(user);
        setState({
          user,
          token: persistedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        if (cancelled) return;
        clearAuthStorage();
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await authService.login(email, password);
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
    return { user, token };
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const { user, token } = await authService.register(fullName, email, password);
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { user, token };
    },
    []
  );

  const logout = useCallback(() => {
    void authService.logout();
    clearAuthStorage();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((user: User) => {
    setStoredUser(user);
    setState((prev) => ({
      ...prev,
      user,
    }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
