import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/jwt';
import { z } from 'zod';
import { uploadLogo } from '@/lib/storage';
import { perfilSchema } from './perfil.schema';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 401 });

    const claims = verifyAuthToken(token);
    if (!claims) return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    const adminId = claims.id;

    const ctype = req.headers.get('content-type') || '';
    const isMultipart = ctype.includes('multipart/form-data');

    let nombre: string;
    let correo: string;
    let logoFile: File | null = null;

    if (isMultipart) {
      const form = await req.formData();
      nombre = String(form.get('nombre') ?? '');
      correo = String(form.get('correo') ?? '');
      const maybeFile = form.get('logo');

      if (maybeFile instanceof File && maybeFile.size > 0) {
        logoFile = maybeFile;
      }
    } else {
      const body = await req.json();
      nombre = String(body?.nombre ?? '');
      correo = String(body?.correo ?? '');
    }

    const data = perfilSchema.parse({ nombre, correo });

    let logoUrl: string | null = null;
    if (logoFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
      if (!validTypes.includes(logoFile.type)) {
        return NextResponse.json(
          { error: 'Tipo de archivo no permitido (use jpg, png o svg)' },
          { status: 400 }
        );
      }

      logoUrl = await uploadLogo(logoFile, adminId);
    }

    const estado = 'borrador';

    const { data: perfil, error: insertErr } = await supabaseAdmin
      .from('perfiles')
      .insert({
        administrador_id: adminId,
        nombre: data.nombre,
        logo_url: logoUrl,
        correo: data.correo,
        estado, 
        // fechas: default now() en DB
      }).select('id')
        .single();

    if (insertErr) {
      console.error('insert perfil error:', insertErr);
      return NextResponse.json({ error: 'No se pudo crear el perfil' }, { status: 500 });
    }

    return NextResponse.json({ id: perfil.id, message: 'Perfil creado exitosamente' }, { status: 201 });
        } catch (error: any) {
            if (error?.issues) {
                return NextResponse.json(
                    { error: 'Datos inválidos', details: error.issues },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: 'Error interno', details: String(error?.message ?? error) },
                { status: 500 }
            );
        }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const perfilId = params.id; // Obtenemos el ID desde la URL

    // 1. Buscamos el perfil en la base de datos filtrando por el ID
    const { data: perfil, error: fetchError } = await supabaseAdmin
      .from('perfiles')
      .select('*') // Traemos todas las columnas del perfil
      .eq('id', perfilId) // Filtramos por el ID
      .single(); // .single() espera 1 solo resultado. Si no encuentra 0 o más de 1, devuelve un error.

    // 2. Manejar error 404 si no existe
    // Si .single() falla porque no encontró el registro (error.code P0002),
    // devolvemos 404.
    if (fetchError) {
      logger.warn(fetchError, `Perfil no encontrado con id: ${perfilId}`);
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // 3. Si todo sale bien, devolvemos el perfil
    return NextResponse.json(perfil, { status: 200 });

  } catch (error: any) {
    // Captura cualquier otro error inesperado (ej. fallo de conexión con la DB)
    logger.error(error, 'Error inesperado al obtener el perfil');
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}