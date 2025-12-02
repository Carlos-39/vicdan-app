import { z } from "zod"

// Formatos de imagen permitidos
const ALLOWED_IMAGE_FORMATS = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const createProfileSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre del emprendimiento debe tener al menos 2 caracteres")
    .max(50, "El nombre del emprendimiento no puede exceder 50 caracteres")
    .trim(),

  apellido: z
    .string()
    .max(50, "El apellido no puede exceder 50 caracteres")
    .trim()
    .optional(),

  email: z.string().email("Por favor ingresa un correo electrónico válido").toLowerCase().trim(),

  fotoPerfil: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "La imagen no puede ser mayor a 5MB")
    .refine((file) => ALLOWED_IMAGE_FORMATS.includes(file.type), "Solo se permiten formatos JPG, PNG y WebP")
    .optional()
    .or(z.literal("")),

  descripcion: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),
})

export type CreateProfileInput = z.infer<typeof createProfileSchema>
