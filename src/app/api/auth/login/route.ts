// src/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { loginSchema } from './login.schema';
import { comparePassword } from '@/lib/crypto';
import { generateAuthToken } from '@/lib/jwt';

type Admin = {
  id: string;
  nombre: string;
  correo: string;
  contraseña_hash: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

   
    const { data: admin, error: findErr } = await supabaseAdmin
      .from('administradores')
      .select('id, nombre, correo, contraseña_hash')
      .eq('correo', email)
      .single<Admin>(); 

    if (findErr || !admin) {
      logger.warn(`Intento de inicio de sesión fallido para el correo: ${email} (usuario no encontrado)`);
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const isPasswordValid = await comparePassword(password, admin.contraseña_hash);

    if (!isPasswordValid) {
      logger.warn(`Intento de inicio de sesión fallido para el correo: ${email} (contraseña incorrecta)`);
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

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
        admin: {
          id: admin.id,
          nombre: admin.nombre,
          correo: admin.correo,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    
    if (error?.issues) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    logger.error(error, 'Error inesperado en el endpoint de login');
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}