import { z } from 'zod';

export const perfilSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  correo: z.string().trim().toLowerCase().email('Correo inválido'),
  logo: z.string().optional(),
});
export type PerfilInput = z.infer<typeof perfilSchema>;