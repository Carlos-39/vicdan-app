import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/jwt';

export const runtime = 'nodejs';

// Nota: params es Promise<{ id: string }>
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    // 0) Auth
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 401 });

    const claims = verifyAuthToken(token);
    if (!claims) return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });

    // 1) Espera params antes de usarlo
    const { id: perfilId } = await ctx.params;
    const adminId = claims.id;

    // 2) Consulta con ownership
    const { data, error } = await supabaseAdmin
      .from('perfiles')
      .select('id, administrador_id, nombre, logo_url, correo, estado, fechas')
      .eq('id', perfilId)
      .eq('administrador_id', adminId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'No se pudo obtener el perfil' }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ perfil: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Error interno', details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 401 });

    const claims = verifyAuthToken(token);
    if (!claims) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });

    const { id: perfilId } = await ctx.params;
    const body = await req.json();

    const { data: currentProfile, error: fetchError } = await supabaseAdmin
      .from('perfiles')
      .select('fechas') 
      .eq('id', perfilId)
      .maybeSingle();

    if (fetchError || !currentProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    const { nombre, logo_url, correo, estado } = body;
    const updates: any = {};

    if (nombre !== undefined) updates.nombre = nombre;
    if (correo !== undefined) updates.correo = correo;
    if (estado !== undefined) updates.estado = estado;

    if (logo_url !== undefined) {
      updates.logo_url = logo_url;
    }

    const currentFechas = currentProfile.fechas || {};
    updates.fechas = new Date().toISOString()

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('perfiles')
      .update(updates)
      .eq('id', perfilId) 
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ 
      message: 'Perfil actualizado correctamente', 
      perfil: updatedProfile 
    }, { status: 200 });

  } catch (e: any) {
    return NextResponse.json(
      { error: 'Error interno', details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}