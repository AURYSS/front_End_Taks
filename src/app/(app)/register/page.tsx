"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await register({ name, lastname, username, password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login"); // Redirección automática
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creando cuenta");
    } finally {
      if (!success) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[var(--bg-base)] selection:bg-[var(--bg-hover)] selection:text-[var(--text-main)] py-12">
      
      {/* Botón de tema en la esquina superior derecha */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Subtle Noise / Grid Overlay */}
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
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-[var(--text-main)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--text-main)]/5 mb-6 ring-1 ring-[var(--border-color)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg-base)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 22l-10-5V9l10 5 10-5v10l-10 5z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-main)] mb-1">
            Crea tu cuenta CARH
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Ingresa tus datos para registrarte
          </p>
        </div>

        {/* Formulario Estático */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-2xl">
          {success ? (
            <div className="flex flex-col items-center text-center space-y-3 py-6 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center border border-green-500/30">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--text-main)]">¡Cuenta creada!</h3>
              <p className="text-sm text-[var(--text-muted)]">Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-main)]">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--bg-base)] placeholder-[var(--text-muted)] text-[var(--text-main)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]"
                    placeholder="Ana"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-main)]">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    className="input-field w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--bg-base)] placeholder-[var(--text-muted)] text-[var(--text-main)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]"
                    placeholder="García"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-main)]">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--bg-base)] placeholder-[var(--text-muted)] text-[var(--text-main)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]"
                  placeholder="ana_garcia"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-main)]">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--bg-base)] placeholder-[var(--text-muted)] text-[var(--text-main)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
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
                  "Crear mi cuenta →"
                )}
              </button>
            </form>
          )}
        </div>
        
        <p className="mt-8 text-center text-xs text-[var(--text-muted)] px-8">
          ¿Ya tienes cuenta? <Link href="/login" className="text-[var(--text-main)] font-medium hover:underline">Ingresa aquí</Link>.
        </p>
      </div>
    </div>
  );
}
