// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { loginSchema } from './login.schema';
import { comparePassword } from '@/lib/crypto';
import { generateAuthToken } from '@/lib/jwt';
import { recordLoginAttempt, isRateLimited } from '@/lib/ratelimit';

type Admin = {
  id: string;
  nombre: string;
  correo: string;
  contraseña_hash: string;
};

function getIpFromRequest(req: Request) {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0]?.trim();
  return req.headers.get('x-real-ip') ?? '0.0.0.0';
}

export async function POST(req: Request) {
  const ip = getIpFromRequest(req);
  const userAgent = req.headers.get('user-agent') ?? '';

  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // ¿Demasiados intentos recientes?
    const limited = await isRateLimited({ correo: email, ip, windowMinutes: 5, maxFailures: 5 });
    if (limited) {
      await recordLoginAttempt({ correo: email, ip, userAgent, success: false, reason: 'rate_limited' });
      return NextResponse.json(
        { error: 'Demasiados intentos. Inténtalo más tarde.' },
        { status: 429, headers: { 'Retry-After': '300' } } // 5 min
      );
    }

    // 1) Busca admin
    const { data: admin, error: findErr } = await supabaseAdmin
      .from('administradores')
      .select('id, nombre, correo, contraseña_hash')
      .eq('correo', email)
      .single<Admin>();

    if (findErr || !admin) {
      await recordLoginAttempt({ correo: email, ip, userAgent, success: false, reason: 'user_not_found' });
      logger.warn(`Login fallido: ${email} (usuario no encontrado)`);
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // 2) Verifica contraseña
    const isPasswordValid = await comparePassword(password, admin.contraseña_hash);
    if (!isPasswordValid) {
      await recordLoginAttempt({ correo: email, ip, userAgent, success: false, reason: 'wrong_password' });
      logger.warn(`Login fallido: ${email} (contraseña incorrecta)`);
      // Si tras este fallo ya supera el umbral, responde 429
      const nowLimited = await isRateLimited({ correo: email, ip, windowMinutes: 5, maxFailures: 5 });
      if (nowLimited) {
        return NextResponse.json(
          { error: 'Demasiados intentos. Inténtalo más tarde.' },
          { status: 429, headers: { 'Retry-After': '300' } }
        );
      }
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // 3) Éxito
    await recordLoginAttempt({ correo: email, ip, userAgent, success: true, reason: 'ok' });

    const token = generateAuthToken({
      id: admin.id,
      nombre: admin.nombre,
      rol: 'admin',
      email: admin.correo,
    });

    logger.info(`Inicio de sesión exitoso para: ${email}`);

    return NextResponse.json(
      {
        message: 'Inicio de sesión exitoso',
        admin: { id: admin.id, nombre: admin.nombre, correo: admin.correo },
        token,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      await recordLoginAttempt({ correo: undefined, ip, userAgent, success: false, reason: 'invalid_payload' });
      return NextResponse.json({ error: 'Datos inválidos', details: (error as { issues: unknown }).issues }, { status: 400 });
    }
    logger.error(error, 'Error inesperado en el endpoint de login');
    await recordLoginAttempt({ correo: undefined, ip, userAgent, success: false, reason: 'server_error' });
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}