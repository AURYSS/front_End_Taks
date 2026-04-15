import { Task } from "@/services/api";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleComplete?: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="group grid grid-cols-12 gap-4 px-6 py-4 items-center bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-hover)]/80 transition-colors">
      
      {/* Title & Desc */}
      <div className="col-span-8 sm:col-span-5 flex items-center min-w-0 pr-4">
        <div className={`w-1.5 h-1.5 rounded-full mr-3 shrink-0 ${task.priority ? 'bg-red-500' : 'bg-zinc-600'}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-main)] truncate">{task.name}</p>
          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{task.description}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="col-span-2 hidden sm:flex items-center">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border-focus)]">
          En cola
        </span>
      </div>

      {/* Priority Badge */}
      <div className="col-span-3 hidden sm:flex items-center">
        {task.priority ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--danger-bg)] text-[var(--danger-text)] border border-[var(--danger-border)]">
            <svg className="w-3 h-3 text-[var(--danger-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Alta
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium text-[var(--text-muted)]">
            <svg className="w-3 h-3 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Normal
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] rounded-md transition-colors"
          title="Editar tarea"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger-text)] hover:bg-[var(--danger-bg)] rounded-md transition-colors"
          title="Eliminar tarea"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
