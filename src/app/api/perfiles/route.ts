import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/jwt';
import { uploadLogo } from '@/lib/storage';
import { perfilSchema } from './perfil.schema';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    const claims = verifyAuthToken(token);
    if (!claims) return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });

    const adminId = claims.id;

    const url = new URL(req.url);
    const estado = url.searchParams.get('estado');
    const busqueda = url.searchParams.get('busqueda');
    const orden = url.searchParams.get('orden'); // 'recientes' | 'antiguos'
    const ascending = orden === 'antiguos';

    let query = supabaseAdmin
      .from('perfiles')
      .select('id, administrador_id, nombre, logo_url, correo, estado, fechas')
      .eq('administrador_id', adminId);

    if (estado && estado.trim()) {
      query = query.eq('estado', estado.trim());
    }
    if (busqueda && busqueda.trim()) {
      const term = `%${busqueda.trim()}%`;
      query = query.or(`nombre.ilike.${term},correo.ilike.${term}`);
    }

    const { data, error } = await query.order('fechas', { ascending });

    if (error) {
      return NextResponse.json({ error: 'No se pudo obtener el listado' }, { status: 500 });
    }
    return NextResponse.json({ perfiles: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error interno', details: String(e?.message ?? e) }, { status: 500 });
  }
}


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