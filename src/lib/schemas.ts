import { z } from "zod";

// Validadores base reutilizables preventivos
const secureString = z.string().trim().regex(/^[^<>]*$/, "Por seguridad, no se permiten los caracteres '<' y '>'");
const usernameRegex = /^[a-zA-Z0-9_.]+$/;

export const loginSchema = z.object({
  username: secureString
    .min(4, "Tu usuario debe tener al menos 4 caracteres")
    .max(20, "Tu usuario no puede tener más de 20 caracteres")
    .regex(usernameRegex, "El usuario solo puede contener letras, números, puntos y guiones bajos (_)"),
  password: z.string()
    .min(1, "Por favor ingresa tu contraseña")
    .max(100, "La contraseña excede el límite permitido"),
});

export const registerSchema = z.object({
  name: secureString
    .min(2, "Por favor ingresa un nombre válido (mínimo 2 letras)")
    .max(50, "El nombre es demasiado largo")
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Tu nombre solo debe contener letras"),
  lastname: secureString
    .min(2, "Por favor ingresa un apellido válido (mínimo 2 letras)")
    .max(50, "Los apellidos son demasiado largos")
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Tus apellidos solo deben contener letras"),
  username: secureString
    .min(4, "Elige un usuario más largo (mínimo 4 caracteres)")
    .max(20, "El usuario no puede tener más de 20 caracteres")
    .regex(usernameRegex, "El usuario solo puede contener letras, números, puntos y guiones bajos (_)"),
  password: z.string()
    .min(8, "Tu contraseña es muy corta (mínimo 8 caracteres)")
    .max(100, "La contraseña es demasiado larga")
    .regex(/[A-Z]/, "Tu contraseña debe incluir al menos una letra MAYÚSCULA")
    .regex(/[a-z]/, "Tu contraseña debe incluir al menos una letra minúscula")
    .regex(/[0-9]/, "Tu contraseña debe incluir al menos un número")
    .regex(/[^A-Za-z0-9]/, "Tu contraseña debe incluir al menos un símbolo especial (ej: !@#$)"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no son iguales, por favor revisa",
  path: ["confirmPassword"],
});

export const taskSchema = z.object({
  name: secureString
    .min(3, "El título es muy corto, escribe al menos 3 caracteres")
    .max(50, "El título no puede exceder los 50 caracteres")
    .refine(val => !/(.)\1{4,}/.test(val), "El título tiene caracteres sospechosamente repetitivos (spam)")
    .refine(val => !/\S{16,}/.test(val), "El título contiene palabras irreales (usa espacios entre palabras)"),
  description: secureString
    .min(10, "Por favor explica un poco más la tarea (mínimo 10 caracteres)")
    .max(300, "Has excedido el límite de 300 caracteres para la descripción")
    .refine(val => !/(.)\1{5,}/.test(val), "La descripción tiene demasiados caracteres repetidos (spam)")
    .refine(val => !/\S{30,}/.test(val), "Hay texto continuo sin espacios muy largo. Por favor escribe con normalidad."),
  priority: z.boolean(),
});

export const userAdminSchema = z.object({
  name: secureString
    .min(2, "Mínimo 2 letras")
    .max(50, "Nombre demasiado largo"),
  lastname: secureString
    .min(2, "Mínimo 2 letras")
    .max(50, "Apellido demasiado largo"),
  username: secureString
    .min(4, "Mínimo 4 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(usernameRegex, "Solo letras, números, puntos y guiones bajos"),
  password: z.string()
    .min(8, "Mínimo 8 caracteres")
    .max(100, "Demasiado larga")
    .or(z.literal("")), // Permite contraseña vacía para edición (no cambiarla)
  role: z.enum(["user", "admin"]),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type TaskFormValues = z.infer<typeof taskSchema>;
export type UserAdminFormValues = z.infer<typeof userAdminSchema>;
