import { z } from 'zod';

// Esquemas más flexibles
export const colorsSchema = z.object({
  primary: z.string().trim().min(1).default('#877af7'),
  secondary: z.string().trim().min(1).default('#000000'),
  background: z.string().trim().min(1).default('#ffffff'),
  text: z.string().trim().min(1).default('#1f2937'),
  card: z.string().trim().min(1).default('#877af7'),
  cardText: z.string().trim().min(1).default('#ffffff'),
}).catchall(z.string().optional()); // ✅ Permite campos adicionales

export const typographySchema = z.object({
  fontFamily: z.string().trim().min(1).default('Inter, sans-serif'),
  fontSize: z.object({
    heading: z.string().trim().min(1).default('20px'),
    base: z.string().trim().min(1).default('16px'),
    cardText: z.string().trim().min(1).default('14px'),
  }).default({}),
  lineHeight: z.object({
    heading: z.string().optional().default('1.2'),
    base: z.string().optional().default('1.5'),
  }).optional().default({}),
}).catchall(z.any()); // ✅ Permite campos adicionales

export const spacingSchema = z.object({
  padding: z.string().trim().min(1).default('24px'),
  margin: z.string().trim().min(1).default('16px'),
  gap: z.string().trim().min(1).default('16px'),
}).catchall(z.string().optional()); // ✅ Permite campos adicionales

export const layoutSchema = z.object({
  type: z.enum(['centered', 'left-aligned', 'right-aligned', 'justified', 'card', 'minimal']).default('centered'),
  textAlignment: z.enum(['left', 'center', 'right', 'justify']).optional().default('center'),
  showAvatar: z.boolean().optional().default(true),
  showSocialLinks: z.boolean().optional().default(true),
}).catchall(z.any()); // ✅ Permite campos adicionales

// Esquema principal MUY flexible
export const disenoSchema = z.object({
  colors: colorsSchema.default({}),
  typography: typographySchema.default({}),
  spacing: spacingSchema.default({}),
  layout: layoutSchema.default({}),
}).catchall(z.any()); // ✅ Permite cualquier campo adicional

export type DisenoInput = z.infer<typeof disenoSchema>;