import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/jwt';
import { logger } from '@/lib/logger';
import { disenoSchema } from './diseno.schema';

export const runtime = 'nodejs';


export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    // 1. Autenticación
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }
    const claims = verifyAuthToken(token);
    if (!claims) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }
    
    const perfilId = context.params.id;

    // 2. Obtener el diseño actual
    const { data: perfil, error: fetchError } = await supabaseAdmin
      .from('perfiles')
      .select('diseno')
      .eq('id', perfilId)
      .single();

    if (fetchError || !perfil) {
      logger.warn(fetchError, `GET /diseno: Perfil no encontrado. PerfilID: ${perfilId}`);
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    return NextResponse.json(perfil.diseno || {}, { status: 200 });

  } catch (error: any) {
    logger.error(error, 'Error inesperado en GET /api/perfiles/[id]/diseno');
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * AGREGA (Crea) un nuevo diseño para un perfil.
 */
export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    // 1. Autenticación
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }
    const claims = verifyAuthToken(token);
    if (!claims) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }
    
    const perfilId = context.params.id;

    // 2. Validar los datos de entrada
    const body = await req.json();
    const disenoData = disenoSchema.parse(body);

    // 3. Actualizar (o crear) el diseño en la BD
    const { data: perfilActualizado, error: updateError } = await supabaseAdmin
      .from('perfiles')
      .update({ diseno: disenoData }) 
      .eq('id', perfilId)
      .select('id, diseno')
      .single();

    if (updateError) {
      logger.error(updateError, 'Error al AGREGAR el diseño del perfil');
      if (updateError.code === 'PGRST116') { 
        return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ error: 'No se pudo agregar el diseño' }, { status: 500 });
    }

    return NextResponse.json(perfilActualizado.diseno, { status: 201 });

  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: 'Datos de diseño inválidos', details: error.issues }, { status: 400 });
    }
    logger.error(error, 'Error inesperado en POST /api/perfiles/[id]/diseno');
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * EDITA (Reemplaza) el diseño de un perfil.
 */
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    // 1. Autenticación
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }
    const claims = verifyAuthToken(token);
    if (!claims) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }
    
    const perfilId = context.params.id;

    // 2. Validar los datos de entrada
    const body = await req.json();
    const disenoData = disenoSchema.parse(body);

    // 3. Actualizar (o reemplazar) el diseño en la BD
    const { data: perfilActualizado, error: updateError } = await supabaseAdmin
      .from('perfiles')
      .update({ diseno: disenoData })
      .eq('id', perfilId)
      .select('id, diseno')
      .single();

    if (updateError) {
      logger.error(updateError, 'Error al EDITAR el diseño del perfil');
      if (updateError.code === 'PGRST116') { 
        return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ error: 'No se pudo editar el diseño' }, { status: 500 });
    }

    return NextResponse.json(perfilActualizado.diseno, { status: 200 });

  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: 'Datos de diseño inválidos', details: error.issues }, { status: 400 });
    }
    logger.error(error, 'Error inesperado en PUT /api/perfiles/[id]/diseno');
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}