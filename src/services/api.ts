/**
 * Capa de servicios API: Concentra todas las peticiones fetch al backend.
 * Integrado con Cookies HTTP-Only para máxima seguridad.
 */
import { sanitizeObject } from "@/lib/sanitize";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("Advertencia: NEXT_PUBLIC_API_URL no está definida en el entorno.");
}

export class UnauthorizedError extends Error {
  constructor(message = "Sesión expirada") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function refreshToken(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    if (typeof window !== "undefined" && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      window.location.href = "/login";
    }
    throw new UnauthorizedError("Sesión invalidada");
  }
  
  // Opcional: Notificar actualización a pestañas
  if (typeof window !== "undefined") window.dispatchEvent(new Event("storage_sync"));
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
  } as Record<string, string>;

  let res = await fetch(url, { ...options, headers, credentials: "include" });

  // Si recibimos 401 (Por manipulación maliciosa de cookie o expiración pura)
  if (res.status === 401) {
    if (typeof window !== "undefined" && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      window.location.href = "/login";
    }
    throw new UnauthorizedError("Sesión invalidada por el servidor");
  }

  // Leemos el cuerpo como texto para evitar errores de doble lectura
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    // No es JSON
  }

  if (!res.ok) {
    let errorMessage = "Error en la petición";
    if (data && data.message) {
      errorMessage = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    } else {
      switch (res.status) {
        case 401: errorMessage = "No autorizado: Credenciales incorrectas o sesión expirada"; break;
        case 403: errorMessage = "Prohibido: No tienes permisos para esta acción"; break;
        case 404: errorMessage = "No encontrado: El recurso no existe"; break;
        default: errorMessage = `Error ${res.status}: ${res.statusText || "Error desconocido"}`;
      }
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) return null;
  return data;
}

async function handleResponse(res: Response) {
  // Leemos el cuerpo como texto primero para poder usarlo varias veces si hace falta
  const text = await res.text();
  let data = null;
  
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    // No es JSON
  }

  if (!res.ok) {
    let errorMessage = "Ocurrió un error inesperado";
    
    if (data && data.message) {
      errorMessage = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    } else {
      switch (res.status) {
        case 401: errorMessage = "Usuario o contraseña incorrectos"; break;
        case 403: errorMessage = "No tienes permiso para acceder"; break;
        case 404: errorMessage = "Servicio no encontrado"; break;
        case 409: errorMessage = "El nombre de usuario ya está en uso"; break;
        case 500: errorMessage = "Error interno del servidor. Inténtalo más tarde"; break;
        default: errorMessage = `Error ${res.status}: ${res.statusText || "Error desconocido"}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  return data;
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

export async function login(username: string, password: string): Promise<any> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  return handleResponse(res);
}

export async function register(data: any): Promise<any> {
  const sanitizedData = sanitizeObject(data);
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sanitizedData),
    credentials: "include",
  });
  return handleResponse(res);
}

export async function logout() {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {}
}

export async function getMe() {
  return fetchWithAuth(`${API_URL}/auth/me`);
}

export async function getTasks(): Promise<Task[]> {
  return fetchWithAuth(`${API_URL}/task`, { cache: "no-store" });
}

export async function getTaskById(id: number): Promise<Task> {
  return fetchWithAuth(`${API_URL}/task/${id}`);
}

export async function createTask(task: CreateTask): Promise<Task> {
  const sanitizedTask = sanitizeObject(task);
  return fetchWithAuth(`${API_URL}/task`, {
    method: "POST",
    body: JSON.stringify(sanitizedTask),
  });
}

export async function updateTask(id: number, task: Partial<CreateTask>): Promise<Task> {
  const sanitizedTask = sanitizeObject(task);
  return fetchWithAuth(`${API_URL}/task/${id}`, {
    method: "PUT",
    body: JSON.stringify(sanitizedTask),
  });
}

export async function deleteTask(id: number): Promise<void> {
  return fetchWithAuth(`${API_URL}/task/${id}`, {
    method: "DELETE",
  });
}

export async function getLogs(): Promise<any[]> {
  return fetchWithAuth(`${API_URL}/logs`);
}

export async function getMyLogs(): Promise<any[]> {
  return fetchWithAuth(`${API_URL}/logs/me`);
}

export async function getUsers(): Promise<any[]> {
  return fetchWithAuth(`${API_URL}/user`);
}

export async function deleteUser(id: number): Promise<void> {
  return fetchWithAuth(`${API_URL}/user/${id}`, {
    method: "DELETE",
  });
}

export async function createUser(data: any): Promise<any> {
  return fetchWithAuth(`${API_URL}/user`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: number, data: any): Promise<any> {
  return fetchWithAuth(`${API_URL}/user/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
