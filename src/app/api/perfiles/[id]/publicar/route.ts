// src/app/api/perfiles/[id]/publicar/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/jwt';
import { generatePublicProfileLink } from '@/lib/publicUrl';
import QRCode from 'qrcode';
import { ADMIN_WHITELIST } from "@/lib/admins";

export const runtime = 'nodejs';
const QR_BUCKET = 'perfiles-qrs';

type ParamsCtx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: ParamsCtx) {
  const requiredFields = [
    'nombre',
    'logo_url',
    'correo',
    'descripcion',
    'diseno'
  ];

  try {
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token)
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });

    const claims = verifyAuthToken(token);
    if (!claims)
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    const adminId = claims.id;
    const adminEmail = claims.email;

    const { id: perfilId } = await ctx.params;

    const { data: existing, error: findErr } = await supabaseAdmin
      .from('perfiles')
      .select('id, administrador_id, estado, slug, nombre, logo_url, correo, descripcion, diseno, qr_url')
      .eq('eliminado', false)
      .eq('id', perfilId)
      .maybeSingle();

    if (findErr) {
      console.error('find perfil error:', findErr);
      return NextResponse.json({ error: 'Error consultando perfil' }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }
    // Verificar propiedad solo si no son los Super Administradores 
    if (!ADMIN_WHITELIST.includes(adminEmail)) {
      if (existing.administrador_id !== adminId) {
        return NextResponse.json(
          { error: 'No autorizado para publicar este perfil' },
          { status: 403 }
        );
      }
    }
    
    // Si ya tiene slug, solo retornar la información existente
    if (existing.slug) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.json(
        {
          message: 'El perfil ya está publicado',
          perfil: existing,
          slug: existing.slug,
          publicUrl: `${baseUrl}/${existing.slug}`,
          qrPublicUrl: existing.qr_url,
        },
        { status: 200 }
      );
    }

    const missingFields = requiredFields.filter(field => {
      const value = existing[field as keyof typeof existing];
      return !value || 
             (typeof value === 'string' && value.trim() === '') ||
             (Array.isArray(value) && value.length === 0) ||
             (typeof value === 'object' && value !== null && Object.keys(value).length === 0);
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'No se puede publicar el perfil porque faltan campos obligatorios',
          missingFields,
          message: `Por favor completa los siguientes campos: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    const { slug, url } = generatePublicProfileLink(existing.nombre);

    const qrBuffer: Buffer = await QRCode.toBuffer(url, { type: 'png', width: 400 });

    const filePath = `qrs/${adminId}-${slug}.png`;
    const upload = await supabaseAdmin.storage
      .from(QR_BUCKET)
      .upload(filePath, qrBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (upload.error) {
      console.error('upload QR error:', upload.error);
      return NextResponse.json(
        { error: 'No se pudo subir la imagen del QR' },
        { status: 500 }
      );
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(QR_BUCKET)
      .getPublicUrl(filePath);
    const qrPublicUrl = publicData?.publicUrl ?? null;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('perfiles')
      .update({
        estado: 'activo',
        slug,
        fecha_publicacion: new Date().toISOString(),
        qr_url: qrPublicUrl,
      })
      .eq('eliminado', false)
      .eq('id', perfilId)
      .eq('administrador_id', adminId)
      .select('id, slug, estado, fecha_publicacion, qr_url')
      .single();

    if (updateErr) {
      console.error('update perfil error:', updateErr);
      return NextResponse.json(
        { error: 'No se pudo actualizar el perfil con la información del QR' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Perfil publicado y QR generado correctamente',
        perfil: updated,
        slug,
        publicUrl: url,
        qrPublicUrl,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('publicar perfil error:', err);
    return NextResponse.json(
      { error: 'Error interno', details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}