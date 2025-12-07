"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface User {
  id: Id<"users">;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const loginAction = useAction(api.auth.login);
  const registerAction = useAction(api.auth.register);
  const logoutAction = useAction(api.auth.logout);
  const validateSession = useAction(api.auth.validateSession);

  const checkSession = useCallback(async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("beam_session");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const result = await validateSession({ token });
      if (result.valid && result.user) {
        setUser(result.user as User);
      } else {
        localStorage.removeItem("beam_session");
        setUser(null);
      }
    } catch {
      localStorage.removeItem("beam_session");
      setUser(null);
    }
    setIsLoading(false);
  }, [validateSession]);

  // Initialize session check only once on mount using a scheduled callback
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      // Use requestIdleCallback or setTimeout to defer the async operation
      const timeoutId = setTimeout(() => {
        checkSession();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [checkSession]);

  const login = async (email: string, password: string) => {
    try {
      const result = await loginAction({ email, password });
      if (result.success) {
        localStorage.setItem("beam_session", result.token);
        await checkSession();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch {
      return { success: false, error: "An error occurred" };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const result = await registerAction({ email, password, name });
      if (result.success) {
        localStorage.setItem("beam_session", result.token);
        await checkSession();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch {
      return { success: false, error: "An error occurred" };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("beam_session");
    if (token) {
      try {
        await logoutAction({ token });
      } catch {
        // Ignore errors
      }
    }
    localStorage.removeItem("beam_session");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshSession: checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
