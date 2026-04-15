/**
 * Utilidad básica para sanitizar entradas de texto y prevenir inyecciones HTML simples.
 */
export function sanitize(text: string): string {
  if (typeof text !== "string") return text;
  
  return text
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitiza recursivamente un objeto (útil para payloads de formularios).
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return typeof obj === "string" ? (sanitize(obj) as unknown as T) : obj;
  }

  const result: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as any)[key];
      result[key] = typeof value === "object" ? sanitizeObject(value) : (typeof value === "string" ? sanitize(value) : value);
    }
  }

  return result as T;
}
