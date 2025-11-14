import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/jwt';
import { logger } from '@/lib/logger';
import { tarjetaSchema } from './tarjetas.schema';

export const runtime = 'nodejs';

/**
 * OBTIENE todas las tarjetas de un perfil específico (perfil_id).
 */
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
    
    const perfilId = context.params.id; // Este es el perfil_id de la URL

    // 2. Obtener las tarjetas (Sin validar propiedad, como pediste)
    const { data: tarjetas, error: fetchError } = await supabaseAdmin
      .from('tarjetas')
      .select('*') // Trae todas las tarjetas
      .eq('perfil_id', perfilId) // ¡Aquí filtra por perfil_id!
      .order('created_at', { ascending: true }); // Ordena por fecha de creación

    if (fetchError) {
      logger.error(fetchError, `Error al obtener tarjetas para el perfil: ${perfilId}`);
      return NextResponse.json({ error: 'No se pudieron obtener las tarjetas' }, { status: 500 });
    }

    // Devuelve la lista de tarjetas (puede ser una lista vacía [])
    return NextResponse.json(tarjetas, { status: 200 });

  } catch (error: any) {
    logger.error(error, 'Error inesperado en GET .../[id]/tarjetas');
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * CREA una nueva tarjeta para un perfil específico (perfil_id).
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
    
    const adminId = claims.id;
    const perfilId = context.params.id; // perfil_id de la URL

    // 2. Validar que el perfil exista (Sin validar propiedad, como pediste)
    //    Esto previene crear tarjetas "huérfanas" para un perfil que no existe.
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('perfiles')
      .select('id')
      .eq('id', perfilId)
      .maybeSingle();

    if (perfilError || !perfil) {
      logger.warn(perfilError, `POST tarjetas: Perfil no encontrado. PerfilID: ${perfilId}`);
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    // 3. Validar los datos de entrada (Body)
    const body = await req.json();
    const data = tarjetaSchema.parse(body); // Valida nombre_tarjeta y link

    // 4. Crear la tarjeta en la base de datos
    const { data: nuevaTarjeta, error: insertError } = await supabaseAdmin
      .from('tarjetas')
      .insert({
        perfil_id: perfilId, // Asigna la tarjeta a este perfil
        nombre_tarjeta: data.nombre_tarjeta,
        link: data.link,
      })
      .select('*')
      .single();

    if (insertError) {
      logger.error(insertError, 'Error al crear la tarjeta en Supabase');
      return NextResponse.json({ error: 'No se pudo crear la tarjeta' }, { status: 500 });
    }

    // Devuelve la tarjeta recién creada
    return NextResponse.json(nuevaTarjeta, { status: 201 });

  } catch (error: any) {
    // Maneja errores de validación de Zod
    if (error?.issues) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    logger.error(error, 'Error inesperado en POST .../[id]/tarjetas');
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}