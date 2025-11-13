// src/app/p/[slug]/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

type ParamsCtx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: ParamsCtx) {
  try {
    const { slug } = await ctx.params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug requerido' }, { status: 400 });
    }

    const { data: perfil, error } = await supabaseAdmin
      .from('perfiles')
      .select(
        [
          'id',
          'administrador_id',
          'nombre',
          'logo_url',
          'correo',
          'estado',
          'slug',
          'fecha_publicacion',
          'qr_url',
          'fechas'
        ].join(',')
      )
      .eq('slug', slug)
      .eq('estado', 'publicado')
      .maybeSingle();

    if (error) {
      console.error('Error consultando perfil por slug:', error);
      return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }

    if (!perfil) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    const headers = {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
    };

    return NextResponse.json({ perfil }, { status: 200, headers });
  } catch (err: any) {
    console.error('GET /p/[slug] error:', err);
    return NextResponse.json({ error: 'Error interno', details: String(err?.message ?? err) }, { status: 500 });
  }
}
