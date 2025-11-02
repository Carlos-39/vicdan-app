import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/jwt';
import { perfilSchema } from './perfil.schema';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 401 });

    const claims = verifyAuthToken(token);
    if (!claims) return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });

    const body = await req.json();
    const data = perfilSchema.parse(body);

    return NextResponse.json({ message: 'Endpoint /api/perfiles creado correctamente' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error interno', details: error.message }, { status: 500 });
  }
}
