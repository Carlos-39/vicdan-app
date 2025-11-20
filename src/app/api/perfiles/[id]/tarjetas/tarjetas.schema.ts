import { z } from 'zod';

export const tarjetaSchema = z.object({
  nombre_tarjeta: z
    .string()
    .trim()
    .min(1, 'El nombre de la tarjeta es requerido'),
  link: z
    .string()
    .trim()
    .url('El link debe ser una URL válida (ej: https://ejemplo.com)'),
});

export type TarjetaInput = z.infer<typeof tarjetaSchema>;