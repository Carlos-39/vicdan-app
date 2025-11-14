import { z } from 'zod';

export const disenoSchema = z.object({
  // Colores
  primaryColor: z.string().trim().optional(),
  secondaryColor: z.string().trim().optional(),
  backgroundColor: z.string().trim().optional(),
  textColor: z.string().trim().optional(),

  // Disposición
  layout: z.string().trim().optional(), 

  // Tipografía
  font: z.string().trim().optional(), 
  fontBase: z.string().trim().optional(), 
  fontHeading: z.string().trim().optional(), 
  fontSubheading: z.string().trim().optional(), 

  // Espaciado
  padding: z.string().trim().optional(), 
  margin: z.string().trim().optional(), 
  gap: z.string().trim().optional(), 
});

export type DisenoInput = z.infer<typeof disenoSchema>;