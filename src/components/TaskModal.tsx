import { useState, useEffect } from "react";
import { CreateTask, Task } from "@/services/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormValues } from "@/lib/schemas";
import { sanitizeObject } from "@/lib/sanitize";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: CreateTask, id?: number) => Promise<void>;
  taskToEdit?: Task | null;
  userId: number;
}

export function TaskModal({ isOpen, onClose, onSave, taskToEdit, userId }: TaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      priority: false,
    }
  });

  const priorityValue = watch("priority");

  useEffect(() => {
    if (taskToEdit) {
      reset({
        name: taskToEdit.name,
        description: taskToEdit.description || "",
        priority: taskToEdit.priority || false,
      });
    } else {
      reset({
        name: "",
        description: "",
        priority: false,
      });
    }
  }, [taskToEdit, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: TaskFormValues) => {
    setLoading(true);
    setError("");

    try {
      // Sanitizamos el nombre y la descripción antes de guardar
      const cleanData = sanitizeObject(data);
      await onSave({ ...cleanData, userId }, taskToEdit?.id);
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
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
                    {...register("name")}
                    minLength={3}
                    maxLength={30}
                    className={`input-field w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--bg-base)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:ring-1 transition-colors ${errors.name ? 'border-[var(--danger-border)] focus:border-[var(--danger-border)] focus:ring-[var(--danger-border)]' : 'border-[var(--border-color)] focus:border-[var(--border-focus)] focus:ring-[var(--border-focus)]'}`}
                    placeholder="Ej. Revisar error de navegación"
                    autoFocus
                  />
                {errors.name && <p className="text-xs text-[var(--danger-text)] mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-main)]">Descripción</label>
                <textarea
                  {...register("description")}
                  minLength={10}
                  maxLength={300}
                  className={`input-field w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-base)] text-[var(--text-main)] placeholder-[var(--text-muted)] min-h-[100px] resize-y focus:ring-1 transition-colors ${errors.description ? 'border-[var(--danger-border)] focus:border-[var(--danger-border)] focus:ring-[var(--danger-border)]' : 'border-[var(--border-color)] focus:border-[var(--border-focus)] focus:ring-[var(--border-focus)]'}`}
                  placeholder="Añade más detalles..."
                />
                {errors.description && <p className="text-xs text-[var(--danger-text)] mt-1">{errors.description.message}</p>}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`relative flex items-center justify-center w-5 h-5 rounded border ${priorityValue ? 'bg-red-500 border-red-600' : 'bg-[var(--bg-base)] border-[var(--border-color)] group-hover:border-[var(--border-focus)]'} transition-colors`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      {...register("priority")}
                    />
                    {priorityValue && (
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
                disabled={loading || !isValid}
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
