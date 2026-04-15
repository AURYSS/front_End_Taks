import { z } from "zod";
        
export const loginSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "El nombre solo debe contener letras"),
  lastname: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres").regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Los apellidos solo deben contener letras"),
  username: z.string().min(4, "El usuario debe tener al menos 4 caracteres"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"], // Este error se asociará al confirmPassword
});

export const taskSchema = z.object({
  name: z.string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(50, "El título no puede exceder los 50 caracteres"),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(300, "La descripción no puede exceder los 300 caracteres"),
  priority: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type TaskFormValues = z.infer<typeof taskSchema>;
