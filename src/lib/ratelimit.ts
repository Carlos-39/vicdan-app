import { supabaseAdmin } from '@/lib/supabase';

export type Attempt = {
  correo?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  success: boolean;
  reason?: string | null;
};

export async function recordLoginAttempt(a: Attempt) {
  await supabaseAdmin.from('login_attempts').insert({
    correo: a.correo ?? null,
    ip: a.ip ?? null,
    user_agent: a.userAgent ?? null,
    success: a.success,
    reason: a.reason ?? null,
  });
}

/**
 * Devuelve true si el usuario o la IP superan el umbral de fallos
 * en una ventana temporal (p. ej. 5 fallos en 15 min).
 */
export async function isRateLimited(opts: {
  correo?: string | null;
  ip?: string | null;
  windowMinutes?: number;
  maxFailures?: number;
}) {
  const windowMinutes = opts.windowMinutes ?? 15;
  const maxFailures = opts.maxFailures ?? 5;

  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  const [byEmail] = await Promise.all([
    opts.correo
      ? supabaseAdmin
          .from('login_attempts')
          .select('id', { count: 'exact', head: true })
          .eq('success', false)
          .eq('correo', opts.correo)
          .gte('created_at', since)
      : Promise.resolve({ count: 0 } as { count: number | null }),
    // Consulta de IP comentada hasta que se necesite
    // opts.ip
    //   ? supabaseAdmin
    //       .from('login_attempts')
    //       .select('id', { count: 'exact', head: true })
    //       .eq('success', false)
    //       .eq('ip', opts.ip)
    //       .gte('created_at', since)
    //   : Promise.resolve({ count: 0 } as { count: number | null }),
  ]);

  const emailFails = byEmail.count ?? 0;

  // Descomentar cuando se quiera limitar también por IP, en producción
  return emailFails >= maxFailures; //|| ipFails >= maxFailures;  
}