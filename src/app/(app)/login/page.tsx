"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/schemas";
import { sanitizeObject } from "@/lib/sanitize";

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    setLoading(true);
    try {
      const cleanData = sanitizeObject(data);
      await login(cleanData.username, cleanData.password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error validando credenciales");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[var(--bg-base)] selection:bg-[var(--bg-hover)] selection:text-[var(--text-main)]">
      
      {/* Botón de tema en la esquina superior derecha */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Subtle Noise / Grid Overlay to replace neon orbs */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, var(--border-color) 1px, transparent 1px), linear-gradient(to bottom, var(--border-color) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-6 animate-slide-down">
        {/* Logo Monocromático */}
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-[var(--text-main)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--text-main)]/5 mb-6 ring-1 ring-[var(--border-color)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg-base)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 22l-10-5V9l10 5 10-5v10l-10 5z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-main)] mb-1">
            Iniciar Sesión en CARH
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Ingresa tus datos para continuar
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-main)]">
                Usuario
              </label>
              <input
                type="text"
                {...register("username")}
                className={`input-field w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--bg-base)] placeholder-[var(--text-muted)] text-[var(--text-main)] focus:ring-1 transition-colors ${errors.username ? 'border-[var(--danger-border)] focus:border-[var(--danger-border)] focus:ring-[var(--danger-border)]' : 'border-[var(--border-color)] focus:border-[var(--border-focus)] focus:ring-[var(--border-focus)]'}`}
                placeholder="admin"
                autoComplete="username"
              />
              {errors.username && <p className="text-xs text-[var(--danger-text)] mt-1">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--text-main)]">
                  Contraseña
                </label>
                <a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">¿Olvidaste tu contraseña?</a>
              </div>
              <input
                type="password"
                {...register("password")}
                className={`input-field w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--bg-base)] placeholder-[var(--text-muted)] text-[var(--text-main)] focus:ring-1 transition-colors ${errors.password ? 'border-[var(--danger-border)] focus:border-[var(--danger-border)] focus:ring-[var(--danger-border)]' : 'border-[var(--border-color)] focus:border-[var(--border-focus)] focus:ring-[var(--border-focus)]'}`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="text-xs text-[var(--danger-text)] mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-[var(--danger-bg)] border border-[var(--danger-border)] p-3 rounded-lg mt-2">
                <svg className="w-4 h-4 text-[var(--danger-text)] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-[var(--danger-text)]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full btn-primary py-2.5 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[var(--accent-primary-text)]/20 border-t-[var(--accent-primary-text)] rounded-full animate-spin" />
              ) : (
                "Entrar →"
              )}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-xs text-[var(--text-muted)] px-8">
          ¿No tienes cuenta? <Link href="/register" className="text-[var(--text-main)] font-medium hover:underline">Regístrate aquí</Link>.
        </p>
      </div>
    </div>
  );
}
