"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, logout as apiLogout } from "@/services/api";

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

  // Función para cargar datos desde localStorage
  const loadStoredAuth = () => {
    const savedToken = localStorage.getItem("access_token");
    const savedUserId = localStorage.getItem("user_id");
    const savedUsername = localStorage.getItem("username");
    const savedRole = localStorage.getItem("user_role");
    if (savedToken) {
      setToken(savedToken);
      setUserId(savedUserId ? Number(savedUserId) : null);
      setUsername(savedUsername);
      setRole(savedRole);
    } else {
      setToken(null);
      setUserId(null);
      setUsername(null);
      setRole(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadStoredAuth();

    // Escuchar el evento personalizado de refresco de token o cambios en el storage
    const syncAuth = () => loadStoredAuth();
    window.addEventListener("storage_sync", syncAuth);
    window.addEventListener("storage", syncAuth); // Útil para múltiples pestañas

    return () => {
      window.removeEventListener("storage_sync", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const login = async (user: string, password: string) => {
    const data = await apiLogin(user, password);
    // Decodificar el JWT para obtener el payload
    const payload = JSON.parse(atob(data.access_token.split(".")[1]));
    
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user_id", String(payload.id));
    localStorage.setItem("username", payload.username);
    localStorage.setItem("user_role", payload.role || "user");
    
    setToken(data.access_token);
    setUserId(payload.id);
    setUsername(payload.username);
    setRole(payload.role || "user");
    
    router.push("/dashboard");
  };

  const logout = async () => {
    if (token) {
      try { await apiLogout(token); } catch {}
    }
    localStorage.clear();
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

