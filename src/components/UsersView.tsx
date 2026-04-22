"use client";

import { useEffect, useState } from "react";
import { getUsers, deleteUser, createUser, updateUser } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";
import { UserModal } from "@/components/UserModal";

export function UsersView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para Crear/Editar
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      addToast(err.message || "Error al cargar usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (id: number) => {
    setUserToDelete(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (userToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete);
      addToast("Usuario eliminado con éxito", "success");
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
      setIsConfirmOpen(false);
    } catch (err: any) {
      addToast(err.message || "No se pudo eliminar al usuario", "error");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleOpenCreate = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (userData: any, id?: number) => {
    try {
      if (id) {
        const updated = await updateUser(id, userData);
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
        addToast("Usuario actualizado", "success");
      } else {
        const created = await createUser(userData);
        setUsers(prev => [created, ...prev]);
        addToast("Usuario creado", "success");
      }
    } catch (err: any) {
      throw err; // El modal maneja el error internamente para mostrarlo en el form
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-[var(--bg-panel-hover)] border border-[var(--border-color)] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">Gestión de Usuarios</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Administra las cuentas y roles del sistema.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 btn-primary rounded-lg text-xs font-semibold flex items-center gap-2 transition-transform hover:scale-[1.02]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-panel-hover)]/50 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          <div className="col-span-5">Usuario</div>
          <div className="col-span-3">Rol</div>
          <div className="col-span-2">Tareas</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        <div className="divide-y divide-[var(--border-color)]">
          {users.map((user) => (
            <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[var(--bg-hover)]/20 transition-colors">
              <div className="col-span-5">
                <p className="text-sm font-medium text-[var(--text-main)]">{user.name} {user.lastname}</p>
                <p className="text-xs text-[var(--text-muted)]">@{user.username}</p>
              </div>
              <div className="col-span-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                  {user.role}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-[var(--text-main)] font-medium">
                  {user.task_count || 0}
                </span>
              </div>
              <div className="col-span-2 text-right flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(user)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  title="Editar usuario"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteRequest(user.id)}
                  disabled={user.task_count > 0 || user.role === 'admin'}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title={user.task_count > 0 ? "No se puede eliminar: tiene tareas" : (user.role === 'admin' ? "No puedes eliminar a un Admin" : "Eliminar usuario")}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="¿Eliminar usuario?"
        message="Esta acción eliminará permanentemente la cuenta del usuario. No se puede deshacer."
        onConfirm={executeDelete}
        onCancel={() => setIsConfirmOpen(false)}
        loading={isDeleting}
      />

      {isUserModalOpen && (
        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onSave={handleSaveUser}
          userToEdit={userToEdit}
        />
      )}
    </div>
  );
}
