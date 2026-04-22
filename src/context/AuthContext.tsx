"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, logout as apiLogout, getMe } from "@/services/api";

interface AuthContextType {
  token: string | null;
  userId: number | null;
  username: string | null;
  role: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Función para cargar datos validando contra la API
  const loadStoredAuth = async () => {
    if (typeof window !== "undefined" && (window.location.pathname === "/register" || window.location.pathname === "/login")) {
      setIsLoading(false);
      return;
    }
    try {
      const userPayload = await getMe();
      if (userPayload && userPayload.id) {
        setToken("secure-cookie-session");
        setUserId(userPayload.id);
        setUsername(userPayload.username);
        setRole(userPayload.role || "user");
      }
    } catch {
       // Si getMe falla (401), limpia la sesión
       setToken(null);
       setUserId(null);
       setUsername(null);
       setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStoredAuth();

    const syncAuth = () => loadStoredAuth();
    window.addEventListener("storage_sync", syncAuth);

    return () => {
      window.removeEventListener("storage_sync", syncAuth);
    };
  }, []);

  const login = async (user: string, password: string) => {
    await apiLogin(user, password);
    // Tras hacer login exitoso, la cookie fue seteada. Llamamos a loadStoredAuth para obtener el perfil.
    await loadStoredAuth();
    router.push("/dashboard");
  };

  const logout = async () => {
    await apiLogout();
    setToken(null);
    setUserId(null);
    setUsername(null);
    setRole(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, userId, username, role, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
