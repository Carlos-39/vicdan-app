// src/app/api/perfiles/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/jwt';

export const runtime = 'nodejs';

// GET - Sin cambios
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 401 });

    const claims = verifyAuthToken(token);
    if (!claims) return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });

    const { id: perfilId } = await ctx.params;
    const adminId = claims.id;

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

// PUT - Actualizado para manejar FormData
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
    const adminId = claims.id;

    // Verificar ownership
    const { data: currentProfile, error: fetchError } = await supabaseAdmin
      .from('perfiles')
      .select('administrador_id, logo_url')
      .eq('id', perfilId)
      .eq('administrador_id', adminId)
      .maybeSingle();

    if (fetchError || !currentProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    // Obtener contenido del request
    const contentType = req.headers.get('content-type') || '';
    let updates: any = {};

    if (contentType.includes('multipart/form-data')) {
      // Manejar FormData (con imagen)
      const formData = await req.formData();
      
      const nombre = formData.get('nombre') as string | null;
      const correo = formData.get('correo') as string | null;
      const estado = formData.get('estado') as string | null;
      const logo = formData.get('logo') as File | null;
      const logo_url = formData.get('logo_url') as string | null;

      if (nombre) updates.nombre = nombre;
      if (correo !== undefined) updates.correo = correo || null;
      if (estado) updates.estado = estado;

      // Manejar la imagen
      if (logo_url === '') {
        // Eliminar imagen actual
        if (currentProfile.logo_url) {
          // Extraer el path del storage de la URL
          const urlPath = new URL(currentProfile.logo_url).pathname;
          const storagePath = urlPath.split('/storage/v1/object/public/perfiles-logos/')[1];
          
          if (storagePath) {
            await supabaseAdmin.storage
              .from('perfiles-logos')
              .remove([storagePath]);
          }
        }
        updates.logo_url = null;
      } else if (logo && logo instanceof File) {
        // Subir nueva imagen
        // Eliminar imagen anterior si existe
        if (currentProfile.logo_url) {
          const urlPath = new URL(currentProfile.logo_url).pathname;
          const storagePath = urlPath.split('/storage/v1/object/public/perfiles-logos/')[1];
          
          if (storagePath) {
            await supabaseAdmin.storage
              .from('perfiles-logos')
              .remove([storagePath]);
          }
        }

        // Subir nueva imagen
        const fileExt = logo.name.split('.').pop();
        const fileName = `logos/${perfilId}-${Date.now()}.${fileExt}`;
        const fileBuffer = await logo.arrayBuffer();

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('perfiles-logos')
          .upload(fileName, fileBuffer, {
            contentType: logo.type,
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Error al subir la imagen: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('perfiles-logos')
          .getPublicUrl(fileName);

        updates.logo_url = publicUrl;
      }
    } else {
      // Manejar JSON (sin imagen)
      const body = await req.json();
      const { nombre, correo, estado } = body;

      if (nombre !== undefined) updates.nombre = nombre;
      if (correo !== undefined) updates.correo = correo || null;
      if (estado !== undefined) updates.estado = estado;
    }

    // Actualizar fechas
    updates.fechas = new Date().toISOString();

    // Actualizar en la base de datos
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('perfiles')
      .update(updates)
      .eq('id', perfilId)
      .eq('administrador_id', adminId)
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
    console.error('Error en PUT /api/perfiles/[id]:', e);
    return NextResponse.json(
      { error: 'Error interno', details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}