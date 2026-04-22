"use client";

import { useEffect, useState } from "react";
import { getLogs } from "@/services/api";

interface LogEntry {
  id: number;
  statusCode: number;
  timestamp: string;
  path: string;
  error: string;
  errorCode: string;
  session_id: number | null;
  user?: {
    username: string;
    name: string;
  };
}

export default function LogsView() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, typeFilter, dateFilter, severityFilter, logs]);

  const loadLogs = async () => {
    try {
      const data = await getLogs();
      setLogs(data);
      setFilteredLogs(data);
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...logs];

    // Búsqueda por texto
    if (filter) {
      result = result.filter(log => 
        log.user?.username.toLowerCase().includes(filter.toLowerCase()) ||
        log.error.toLowerCase().includes(filter.toLowerCase()) ||
        log.errorCode.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Filtro por tipo de evento (errorCode)
    if (typeFilter !== "all") {
      result = result.filter(log => log.errorCode === typeFilter);
    }

    // Filtro por fecha (usando zona horaria local para coincidir con el input)
    if (dateFilter) {
      result = result.filter(log => {
        const date = new Date(log.timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const localLogDate = `${year}-${month}-${day}`;
        return localLogDate === dateFilter;
      });
    }

    // Filtro por severidad
    if (severityFilter !== "all") {
      result = result.filter(log => getSeverityLabel(log.statusCode) === severityFilter);
    }

    setFilteredLogs(result);
  };

  const getSeverityColor = (code: number) => {
    if (code >= 400) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (code >= 300) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  };

  const getSeverityLabel = (code: number) => {
    if (code >= 400) return "CRÍTICO";
    if (code >= 300) return "ALERTA";
    return "INFO";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--text-main)]/20 border-t-[var(--text-main)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)]">Auditoría de Seguridad</h2>
          <p className="text-sm text-[var(--text-muted)]">Registro histórico de eventos críticos del sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border-color)]">
        <div className="relative col-span-1 md:col-span-2">
          <input
            type="text"
            placeholder="Buscar por usuario o descripción..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg text-sm focus:ring-1 focus:ring-[var(--text-main)] outline-none"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="relative">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--text-main)] appearance-none"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--text-main)]"
        >
          <option value="all">Todas las severidades</option>
          <option value="CRÍTICO">Crítico (Errores)</option>
          <option value="ALERTA">Alerta (Advertencias)</option>
          <option value="INFO">Info (Informativo)</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--text-main)] md:col-span-1"
        >
          <option value="all">Todos los eventos</option>
          <option value="LOGIN_FAILED">Logins Fallidos</option>
          <option value="ROLE_CHANGED">Cambios de Rol</option>
          <option value="TASK_DELETED">Tareas Eliminadas</option>
          <option value="TASK_CREATED">Tareas Creadas</option>
        </select>
      </div>

      {/* Tabla de Logs */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-base)]/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Fecha y Hora</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Severidad</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Evento</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Usuario</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg-base)]/30 transition-colors">
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-[var(--text-main)]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${getSeverityColor(log.statusCode)}`}>
                      {getSeverityLabel(log.statusCode)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[var(--text-main)]">
                    <code>{log.errorCode}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-main)]">
                    {log.user ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{log.user.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">@{log.user.username}</span>
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)] italic text-xs">Sistema / Invitado</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)] max-w-xs truncate" title={log.error}>
                    {log.error}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)] italic">
                    No se encontraron registros de auditoría
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
