"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Task, CreateTask, getTasks, createTask, updateTask, deleteTask } from "@/lib/api";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardPage() {
  const { token, userId, username, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    } else if (token) {
      loadTasks();
    }
  }, [authLoading, token, router]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      if (token) {
        const data = await getTasks(token);
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskData: CreateTask, id?: number) => {
    if (!token) return;
    if (id) {
      const updated = await updateTask(token, id, taskData);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...taskData } : t)));
    } else {
      const created = await createTask(token, taskData);
      setTasks((prev) => [created, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = async (id: number) => {
    if (!token) return;
    if (!window.confirm("¿Eliminar esta tarea?")) return;

    try {
      await deleteTask(token, id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la tarea.");
    }
  };

  const openNewTaskModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  if (authLoading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-5 h-5 border-[3px] border-[var(--border-focus)]/30 border-t-[var(--accent-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  // Count metrics
  const urgentCount = tasks.filter(t => t.priority).length;

  return (
    <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-main)] font-sans overflow-hidden">
      
      {/* Sidebar Solid */}
      <aside className="w-64 flex-shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-panel)] flex flex-col hidden md:flex">
        <div className="h-14 flex items-center px-6 border-b border-[var(--border-color)]">
          <div className="w-6 h-6 bg-[var(--text-main)] rounded flex items-center justify-center shadow-sm mr-3">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg-base)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 22l-10-5V9l10 5 10-5v10l-10 5z"/>
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight text-[var(--text-main)]">Entorno CARH</span>
        </div>

        <div className="p-4 space-y-1 mt-2 flex-grow">
          <div className="px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Vistas</div>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md bg-[var(--bg-hover)]/50 text-sm text-[var(--text-main)] font-medium">
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Resumen
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--bg-hover)]/30 text-sm text-[var(--text-muted)] font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Tareas
          </a>
        </div>

        <div className="p-4 border-t border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-[var(--bg-hover)] flex items-center justify-center border border-[var(--border-focus)]">
              <span className="text-[var(--text-main)] font-medium text-xs uppercase">{username?.charAt(0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[var(--text-main)]">{username}</span>
            </div>
          </div>
          <button onClick={logout} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger-text)] hover:bg-[var(--bg-hover)]/50 rounded transition-colors" title="Cerrar sesión">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <main className="flex-1 flex flex-col bg-[var(--bg-base)] min-w-0">
        
        {/* Top Header */}
        <header className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-4 sm:px-8 bg-[var(--bg-panel)]">
           <div className="flex items-center text-sm">
             <span className="text-[var(--text-muted)]">CARH</span>
             <svg className="mx-2 w-4 h-4 text-[var(--text-muted)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
             <span className="text-[var(--text-main)] font-medium">Tareas</span>
           </div>
           
           <div className="flex items-center gap-3">
             {/* THEME TOGGLE ADDED HERE EXPLICTLY */}
             <ThemeToggle />
             <button
                onClick={openNewTaskModal}
                className="px-3 py-1.5 btn-primary rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nueva Tarea
              </button>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-5xl mx-auto animate-fade-in">
            
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] mb-1">En cola</h1>
                <p className="text-sm text-[var(--text-muted)]">Ver y administrar todas las tareas activas.</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               <div className="panel p-4 rounded-xl">
                 <p className="text-xs font-medium text-[var(--text-muted)]">Total de Tareas</p>
                 <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{tasks.length}</p>
               </div>
               <div className="panel p-4 rounded-xl">
                 <p className="text-xs font-medium text-[var(--danger-text)] opacity-90">Prioridad Urgente</p>
                 <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{urgentCount}</p>
               </div>
            </div>

            {loading ? (
             <div className="space-y-3">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-16 bg-[var(--bg-panel-hover)] border border-[var(--border-color)] rounded-lg animate-pulse" />
               ))}
             </div>
            ) : tasks.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-panel)]/50">
                <svg className="w-10 h-10 text-[var(--text-muted)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <h3 className="text-sm font-semibold text-[var(--text-main)]">No hay tareas creadas</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">Tienes todo al día.</p>
                <button
                  onClick={openNewTaskModal}
                  className="px-4 py-2 bg-[var(--bg-panel-hover)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] rounded-md text-xs font-medium transition-colors border border-[var(--border-color)] shadow-sm"
                >
                  Crea tu primera tarea
                </button>
              </div>
            ) : (
              <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-panel-hover)]/50 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  <div className="col-span-6 sm:col-span-5">Problema</div>
                  <div className="col-span-2 hidden sm:block">Estado</div>
                  <div className="col-span-3 hidden sm:block">Prioridad</div>
                  <div className="col-span-6 sm:col-span-2 text-right">Acciones</div>
                </div>
                
                {/* List Items */}
                <div className="divide-y divide-[var(--border-color)]">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEditTaskModal}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Reusable */}
      {isModalOpen && userId && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          taskToEdit={taskToEdit}
          userId={userId}
        />
      )}
    </div>
  );
}
