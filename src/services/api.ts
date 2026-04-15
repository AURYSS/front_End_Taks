/**
 * Capa de servicios API: Concentra todas las peticiones fetch al backend.
 * Implementa manejo global de errores, sanitización de datos y refresco automático de tokens.
 */
import { sanitizeObject } from "@/lib/sanitize";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("Advertencia: NEXT_PUBLIC_API_URL no está definida en el entorno.");
}

/**
 * Clase de error personalizada para sesiones expiradas o no autorizadas.
 */
export class UnauthorizedError extends Error {
  constructor(message = "Sesión expirada") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Función para refrescar el token de acceso usando el refresh_token.
 */
export async function refreshToken(): Promise<LoginResponse> {
  const rt = localStorage.getItem("refresh_token");
  if (!rt) throw new UnauthorizedError("No hay refresh token");

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: rt }),
  });

  if (!res.ok) {
    localStorage.clear();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new UnauthorizedError("Sesión invalidada");
  }

  const data: LoginResponse = await res.json();
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);

  // Opcional: Disparar evento para que AuthContext se entere
  window.dispatchEvent(new Event("storage_sync"));

  return data;
}

/**
 * Wrapper de fetch que maneja el token de acceso y el refresco automático.
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem("access_token");

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>;

  let res = await fetch(url, { ...options, headers });

  // Si recibimos 401, intentamos refrescar el token UNA vez
  if (res.status === 401) {
    try {
      const newTokens = await refreshToken();
      // Re-intentar con el nuevo token
      headers.Authorization = `Bearer ${newTokens.access_token}`;
      res = await fetch(url, { ...options, headers });
    } catch (err) {
      // Si el refresco falla, redirigimos al login (ya manejado en refreshToken)
      throw err;
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Error en la petición");
  }

  // Si es un DELETE o similar que devuelve 204 No Content, no intentamos parsear JSON
  if (res.status === 204) return null;

  return res.json();
}

/**
 * Función auxiliar para manejar respuestas genéricas (usada solo en login/register).
 */
async function handleResponse(res: Response) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Ocurrió un error inesperado");
  }
  return res.json();
}

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

/**
 * Autentica al usuario y devuelve los tokens de acceso.
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

/**
 * Registra un nuevo usuario en el sistema. Sanitiza los datos automáticamente.
 */
export async function register(data: any): Promise<any> {
  const sanitizedData = sanitizeObject(data);
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sanitizedData),
  });
  return handleResponse(res);
}

export async function logout(token: string) {
  // Intentamos notificar al backend, pero limpiamos localmente siempre
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch { }
  localStorage.clear();
}

export async function getMe() {
  return fetchWithAuth(`${API_URL}/auth/me`);
}

/**
 * Obtiene el listado de tareas del usuario autenticado.
 */
export async function getTasks(): Promise<Task[]> {
  return fetchWithAuth(`${API_URL}/api/task`, { cache: "no-store" });
}

export async function getTaskById(id: number): Promise<Task> {
  return fetchWithAuth(`${API_URL}/api/task/${id}`);
}

/**
 * Crea una nueva tarea. Aplica sanitización a los campos de texto.
 */
export async function createTask(task: CreateTask): Promise<Task> {
  const sanitizedTask = sanitizeObject(task);
  return fetchWithAuth(`${API_URL}/api/task`, {
    method: "POST",
    body: JSON.stringify(sanitizedTask),
  });
}

/**
 * Actualiza una tarea existente. Permite actualizaciones parciales sanitizadas.
 */
export async function updateTask(id: number, task: Partial<CreateTask>): Promise<Task> {
  const sanitizedTask = sanitizeObject(task);
  return fetchWithAuth(`${API_URL}/api/task/${id}`, {
    method: "PUT",
    body: JSON.stringify(sanitizedTask),
  });
}

export async function deleteTask(id: number): Promise<void> {
  return fetchWithAuth(`${API_URL}/api/task/${id}`, {
    method: "DELETE",
  });
}

/**
 * Obtiene el listado de todos los usuarios (Solo Admin).
 */
export async function getUsers(): Promise<any[]> {
  return fetchWithAuth(`${API_URL}/user`);
}

/**
 * Elimina un usuario (Solo Admin).
 */
export async function deleteUser(id: number): Promise<void> {
  return fetchWithAuth(`${API_URL}/user/${id}`, {
    method: "DELETE",
  });
}


