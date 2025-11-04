// src/app/api/perfiles/[id]/route.ts
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