import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es muy corto').max(80, 'El nombre es muy largo'),
  email: z.string().trim().toLowerCase().email('Correo inválido'),
  password: z.string()
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/, 
         'Debe tener 8+ chars, minúscula, mayúscula, dígito y símbolo'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
