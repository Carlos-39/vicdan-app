import { NextResponse } from 'next/server';
import { registerSchema } from './register.schema';
import { hashPassword } from '@/lib/crypto';
import { supabaseAdmin } from '@/lib/supabase';

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
      // Error de consulta
      return NextResponse.json({ error: 'Error consultando el usuario' }, { status: 500 });
    }
    if (existing) {
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
      .select('id, nombre, correo, fechas')
      .single();

    if (insertErr) {
      return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Administrador creado', admin: inserted },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.issues) {
      // errores de zod
      return NextResponse.json({ error: 'Payload inválido', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 });
  }
}