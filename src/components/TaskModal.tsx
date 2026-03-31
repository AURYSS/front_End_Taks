import { useState, useEffect } from "react";
import { CreateTask, Task } from "@/lib/api";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: CreateTask, id?: number) => Promise<void>;
  taskToEdit?: Task | null;
  userId: number;
}

export function TaskModal({ isOpen, onClose, onSave, taskToEdit, userId }: TaskModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setName(taskToEdit.name);
      setDescription(taskToEdit.description || "");
      setPriority(taskToEdit.priority || false);
    } else {
      setName("");
      setDescription("");
      setPriority(false);
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSave({ name, description, priority, userId }, taskToEdit?.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar la tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl shadow-2xl animate-slide-down flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-panel-hover)]/40">
          <h2 className="text-base font-semibold text-[var(--text-main)]">
            {taskToEdit ? "Editar Tarea" : "Crear Tarea"}
          </h2>
          <button 
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Content */}
          <div className="p-6 overflow-y-auto w-[440px] max-w-full flex-shrink">
            {error && (
              <div className="mb-4 text-xs font-medium text-[var(--danger-text)] bg-[var(--danger-bg)] p-3 rounded-lg border border-[var(--danger-border)] flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-main)]">Título del problema</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-base)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]"
                  placeholder="Ej. Revisar error de navegación"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-main)]">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-base)] text-[var(--text-main)] placeholder-[var(--text-muted)] min-h-[100px] resize-y focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]"
                  placeholder="Añade más detalles..."
                  required
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`relative flex items-center justify-center w-5 h-5 rounded border ${priority ? 'bg-red-500 border-red-600' : 'bg-[var(--bg-base)] border-[var(--border-color)] group-hover:border-[var(--border-focus)]'} transition-colors`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={priority}
                      onChange={(e) => setPriority(e.target.checked)}
                    />
                    {priority && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[var(--text-main)]">Alta Prioridad</span>
                    <span className="text-xs text-[var(--text-muted)]">Marca esta tarea como urgente y súbela en la cola.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-panel-hover)]/40 flex justify-end gap-3 rounded-b-xl">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || !description.trim()}
                className="px-4 py-2 text-sm font-medium btn-primary rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <div className="w-3.5 h-3.5 border-2 border-[var(--accent-primary-text)]/20 border-t-[var(--accent-primary-text)] rounded-full animate-spin" />}
                {taskToEdit ? "Guardar Cambios" : "Crear Tarea"}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}
