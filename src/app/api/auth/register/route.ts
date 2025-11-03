// src/app/api/auth/register-admin/route.ts

import { NextResponse } from 'next/server';
import { registerSchema } from './register.schema';
import { hashPassword } from '@/lib/crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { generateAuthToken } from '@/lib/jwt'; // <-- 1. Importar función para JWT
import { logger } from '@/lib/logger'; // <-- 2. Importar tu logger

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    // 1) ¿Existe el correo?
    const { data: existing, error: findErr } = await supabaseAdmin
      .from('administradores')
      .select('id')
      .eq('correo', email)
      .maybeSingle();

    if (findErr) {
      // --- TAREA 2: LOGGING (Error de base de datos) ---
      logger.error(findErr, 'Error al consultar administrador en Supabase:');
      return NextResponse.json({ error: 'Error consultando el usuario' }, { status: 500 });
    }

    if (existing) {
      // --- TAREA 2: LOGGING (Correo ya existente - Escenario 2) ---
      logger.warn(`Intento de registro fallido: el correo ${email} ya está en uso.`);
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 409 });
    }

    // 2) Hash
    const password_hash = await hashPassword(password);

    // 3) Insertar administrador
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('administradores')
      .insert({
        nombre: name,
        correo: email,
        ['contraseña_hash']: password_hash,
      })
      .select('id, nombre, correo') // Simplificado para el token
      .single();

    if (insertErr) {
      // --- TAREA 2: LOGGING (Error de inserción) ---
      logger.error(insertErr,'Error al insertar administrador en Supabase:');
      return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 500 });
    }

    // --- TAREA 1: GENERAR TOKEN JWT (Tras registro exitoso) ---
    const token = generateAuthToken({
      id: inserted.id,
      nombre: inserted.nombre,
      rol: 'admin', // Asignar el rol explícitamente
      email: inserted.correo,
    });

    // --- TAREA 2: LOGGING (Registro exitoso - Escenario 1) ---
    logger.info(`Nuevo administrador registrado con éxito: ${email} (ID: ${inserted.id})`);

    // Devolver respuesta con el token
    return NextResponse.json(
      { message: 'Administrador creado', admin: inserted, token: token }, // <-- Se añade el token a la respuesta
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.issues) {
      // --- TAREA 2: LOGGING (Error de validación - Escenario 3) ---
      // Zod maneja el error de contraseña inválida
      const validationErrors = err.issues.map((issue: any) => issue.message).join(', ');
      logger.info(`Intento de registro fallido por datos inválidos: ${validationErrors}`);
      return NextResponse.json({ error: 'Payload inválido', details: err.issues }, { status: 400 });
    }

    // --- TAREA 2: LOGGING (Error inesperado) ---
    logger.error('Error inesperado en el endpoint de registro:', err);
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 });
  }
}