import { z } from "zod";

export const UserRegistrationSchema = z.object({
  email: z.string().email({ message: "El correo electrónico debe ser válido." }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export const BusinessRegistrationSchema = z.object({
  name: z.string().min(3, { message: "El nombre del negocio debe tener al menos 3 caracteres." }),
  description: z.string().optional(),
  category_id: z.string().min(1, { message: "Debes seleccionar una categoría." }),
  phone: z.string().min(10, { message: "Ingresa un número de teléfono de al menos 10 dígitos." }).optional().or(z.literal("")),
  address: z.string()
    .min(5, { message: "Proporciona una dirección de al menos 5 caracteres." })
    .max(100, { message: "La dirección no puede exceder los 100 caracteres." })
    .optional().or(z.literal("")),
  google_maps_url: z.string().url({ message: "El link debe ser una URL válida (ej. https://maps.app.goo.gl/...)" }).optional().or(z.literal("")),
});

export const ProductRegistrationSchema = z.object({
  name: z.string().min(2, { message: "El nombre del producto es demasiado corto." }),
  description: z.string().optional(),
  price: z.string().min(1, { message: "El precio es requerido." })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Debe ser un número mayor a 0." }),
  is_available: z.boolean(),
});

export const FlashOfferRegistrationSchema = z.object({
  title: z.string().min(5, { message: "El título debe tener al menos 5 caracteres." }).max(255),
  description: z.string().optional(),
  discount_pct: z.string().min(1, "El descuento es requerido.")
    .refine(val => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 100, { message: "Debe ser entre 1 y 100" }),
  starts_at: z.string().min(1, "Define la fecha de inicio"),
  expires_at: z.string().min(1, "Define la fecha de término")
}).refine(data => {
  if (!data.starts_at || !data.expires_at) return true;
  return new Date(data.expires_at) > new Date(data.starts_at);
}, { message: "La fecha de fin debe ser posterior a la de inicio.", path: ["expires_at"]});

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "El correo electrónico debe ser válido." }),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, { message: "El código debe tener exactamente 6 dígitos." }).regex(/^\d+$/, "Solo números."),
  newPassword: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "El correo electrónico debe ser válido." }),
  password: z.string().min(1, { message: "Ingresa tu contraseña." })
});

export const ConfirmCodeSchema = z.object({
  email: z.string().email({ message: "El correo electrónico debe tener un formato válido." }),
  code: z.string().length(6, { message: "El código debe tener exactamente 6 dígitos." }).regex(/^\d+$/, "Solo números.")
});

export const ScheduleDaySchema = z.object({
  day_of_week: z.number().min(0).max(6), // 0: Sunday, 6: Saturday
  opens_at: z.string().optional(),
  closes_at: z.string().optional(),
  is_closed: z.boolean()
});

export const SchedulesSchema = z.object({
  schedules: z.array(ScheduleDaySchema)
});

export type UserRegistrationFormValues = z.infer<typeof UserRegistrationSchema>;
export type BusinessRegistrationFormValues = z.infer<typeof BusinessRegistrationSchema>;
export type ProductRegistrationFormValues = z.infer<typeof ProductRegistrationSchema>;
export type FlashOfferRegistrationFormValues = z.infer<typeof FlashOfferRegistrationSchema>;
export type LoginFormValues = z.infer<typeof LoginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;
export type ConfirmCodeFormValues = z.infer<typeof ConfirmCodeSchema>;
export type SchedulesFormValues = z.infer<typeof SchedulesSchema>;
