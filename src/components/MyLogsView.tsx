"use client";

import { useEffect, useState } from "react";
import { getMyLogs } from "@/services/api";

interface LogEntry {
  id: number;
  statusCode: number;
  timestamp: string;
  path: string;
  error: string;
  errorCode: string;
  session_id: number | null;
}

export default function MyLogsView() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dateFilter, severityFilter, eventFilter, logs]);

  const loadLogs = async () => {
    try {
      const data = await getMyLogs();
      setLogs(data);
      setFilteredLogs(data);
    } catch (error) {
      console.error("Error loading my logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...logs];

    // Filtro por fecha
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

    // Filtro por evento
    if (eventFilter !== "all") {
      result = result.filter(log => log.errorCode === eventFilter);
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

  // Obtener eventos únicos para el filtro
  const uniqueEvents = Array.from(new Set(logs.map(log => log.errorCode))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--text-main)]/20 border-t-[var(--text-main)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-main)]">Mi Actividad de Seguridad</h2>
        <p className="text-sm text-[var(--text-muted)]">Registro personal de eventos y seguridad</p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border-color)]">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--text-muted)] ml-1">Fecha</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--text-main)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--text-muted)] ml-1">Severidad</label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--text-main)]"
          >
            <option value="all">Todas</option>
            <option value="CRÍTICO">Crítico</option>
            <option value="ALERTA">Alerta</option>
            <option value="INFO">Informativo</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--text-muted)] ml-1">Evento</label>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-4 py-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--text-main)]"
          >
            <option value="all">Todos los eventos</option>
            <option value="LOGIN_FAILED">Logins Fallidos</option>
            <option value="ROLE_CHANGED">Cambios de Rol</option>
            <option value="TASK_DELETED">Tareas Eliminadas</option>
            <option value="TASK_CREATED">Tareas Creadas</option>
          </select>
        </div>
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
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)]" title={log.error}>
                    {log.error}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-muted)] italic">
                    No se encontraron registros
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
