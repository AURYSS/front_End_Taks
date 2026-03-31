const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  priority: boolean;
  userId: number;
  user?: { id: number; name: string };
}

export interface CreateTask {
  name: string;
  description: string;
  priority: boolean;
  userId: number;
}

// ─── Auth ────────────────────────────────────────────────
export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Credenciales incorrectas");
  }
  return res.json();
}

export async function register(data: any): Promise<any> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Error al registrar el usuario");
  }
  return res.json();
}

export async function logout(token: string) {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMe(token: string) {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No autorizado");
  return res.json();
}

// ─── Tasks ────────────────────────────────────────────────
export async function getTasks(token: string): Promise<Task[]> {
  const res = await fetch(`${API_URL}/api/task`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener tareas");
  return res.json();
}

export async function getTaskById(token: string, id: number): Promise<Task> {
  const res = await fetch(`${API_URL}/api/task/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Tarea no encontrada");
  return res.json();
}

export async function createTask(token: string, task: CreateTask): Promise<Task> {
  const res = await fetch(`${API_URL}/api/task`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Error al crear tarea");
  }
  return res.json();
}

export async function updateTask(token: string, id: number, task: Partial<CreateTask>): Promise<Task> {
  const res = await fetch(`${API_URL}/api/task/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Error al actualizar tarea");
  return res.json();
}

export async function deleteTask(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/task/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al eliminar tarea");
}
