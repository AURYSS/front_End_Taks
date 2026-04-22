import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userAdminSchema, UserAdminFormValues } from "@/lib/schemas";
import { sanitizeObject } from "@/lib/sanitize";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any, id?: number) => Promise<void>;
  userToEdit?: any | null;
}

export function UserModal({ isOpen, onClose, onSave, userToEdit }: UserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<UserAdminFormValues>({
    resolver: zodResolver(userAdminSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      lastname: "",
      username: "",
      password: "",
      role: "user",
    }
  });

  useEffect(() => {
    if (userToEdit) {
      reset({
        name: userToEdit.name,
        lastname: userToEdit.lastname,
        username: userToEdit.username || "",
        password: "", // No mostramos la contraseña actual
        role: userToEdit.role || "user",
      });
    } else {
      reset({
        name: "",
        lastname: "",
        username: "",
        password: "",
        role: "user",
      });
    }
  }, [userToEdit, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: UserAdminFormValues) => {
    setLoading(true);
    setError("");

    try {
      const cleanData = sanitizeObject(data);
      
      // Creamos una copia de los datos para enviar
      const submitData = { ...cleanData };

      // Si estamos editando y la contraseña está vacía, la omitimos
      if (userToEdit && !submitData.password) {
        delete (submitData as any).password;
      }
      
      await onSave(submitData, userToEdit?.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl shadow-2xl animate-slide-down flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-panel-hover)]/40">
          <h2 className="text-base font-semibold text-[var(--text-main)]">
            {userToEdit ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-md transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 overflow-y-auto flex-shrink">
            {error && (
              <div className="mb-4 text-xs font-medium text-[var(--danger-text)] bg-[var(--danger-bg)] p-3 rounded-lg border border-[var(--danger-border)] flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-main)]">Nombre</label>
                  <input
                    type="text"
                    {...register("name")}
                    className={`input-field w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-base)] text-[var(--text-main)] border-[var(--border-color)] focus:ring-1 transition-colors`}
                  />
                  {errors.name && <p className="text-xs text-[var(--danger-text)] mt-1">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-main)]">Apellido</label>
                  <input
                    type="text"
                    {...register("lastname")}
                    className={`input-field w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-base)] text-[var(--text-main)] border-[var(--border-color)] focus:ring-1 transition-colors`}
                  />
                  {errors.lastname && <p className="text-xs text-[var(--danger-text)] mt-1">{errors.lastname.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-main)]">Usuario</label>
                <input
                  type="text"
                  {...register("username")}
                  className={`input-field w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-base)] text-[var(--text-main)] border-[var(--border-color)] focus:ring-1 transition-colors`}
                />
                {errors.username && <p className="text-xs text-[var(--danger-text)] mt-1">{errors.username.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-main)]">Contraseña {userToEdit && "(dejar vacío para no cambiar)"}</label>
                <input
                  type="password"
                  {...register("password")}
                  className={`input-field w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-base)] text-[var(--text-main)] border-[var(--border-color)] focus:ring-1 transition-colors`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-xs text-[var(--danger-text)] mt-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-main)]">Rol</label>
                <select
                  {...register("role")}
                  className="input-field w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-base)] text-[var(--text-main)] border-[var(--border-color)] focus:ring-1 transition-colors"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-panel-hover)]/40 flex justify-end gap-3 rounded-b-xl">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading || (!isValid && !userToEdit)} className="px-4 py-2 text-sm font-medium btn-primary rounded-lg transition-colors flex items-center gap-2">
              {loading && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              {userToEdit ? "Actualizar" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
