// src/app/api/perfiles/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/jwt';
import { logger } from "@/lib/logger";

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
    const adminEmail = claims.email;

    let query = supabaseAdmin
      .from('perfiles')
      .select('id, administrador_id, nombre, logo_url, correo, descripcion, estado, diseno, slug, fecha_publicacion, qr_url, fechas')
      .eq('eliminado', false)
      .eq('id', perfilId);
    
    // Todos los administradores pueden ver todos los perfiles
    
    const { data, error } = await query.maybeSingle();

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
    const adminEmail = claims.email;

    // Verificar que el perfil existe
    let perfilQuery = supabaseAdmin
      .from('perfiles')
      .select('administrador_id, logo_url')
      .eq('eliminado', false)
      .eq('id', perfilId);

    // Todos los administradores pueden editar todos los perfiles

    const { data: currentProfile, error: fetchError } = await perfilQuery.maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: 'Error al verificar el perfil' }, { status: 500 });
    }

    if (!currentProfile) {
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
      const descripcion = formData.get('descripcion') as string | null;
      const estado = formData.get('estado') as string | null;
      const logo = formData.get('logo') as File | null;
      const logo_url = formData.get('logo_url') as string | null;

      if (nombre) updates.nombre = nombre;
      if (correo !== undefined) updates.correo = correo || null;
      if (descripcion !== undefined) updates.descripcion = descripcion || null;
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
      const { nombre, correo, descripcion, estado } = body;

      if (nombre !== undefined) updates.nombre = nombre;
      if (correo !== undefined) updates.correo = correo || null;
      if (descripcion !== undefined) updates.descripcion = descripcion || null;
      if (estado !== undefined) updates.estado = estado;
    }

    // Actualizar fechas
    updates.fechas = new Date().toISOString();
    // Actualizar en la base de datos
    let updateQuery = supabaseAdmin
      .from('perfiles')
      .update(updates)
      .eq('eliminado', false)
      .eq('id', perfilId);

    const { data: updatedProfile, error: updateError } = await updateQuery
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

export async function DELETE(
  req: Request,
  // CAMBIO CLAVE: params es una Promise
  context: { params: Promise<{ id: string }> }
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

    // CAMBIO CLAVE: Esperamos la promesa para obtener el ID real
    const { id: perfilId } = await context.params;
    
    // Log para depuración (ahora perfilId tendrá el valor correcto)
    console.log(`Intentando eliminar perfil ID: ${perfilId} por Admin ID: ${claims.id}`);
    // 2. Eliminación
    const { error: deleteError } = await supabaseAdmin
      .from('perfiles') 
      .delete()
      .eq('eliminado', false)
      .eq('id', perfilId);

    if (deleteError) {
      console.error("Error de Supabase al borrar:", deleteError);
      logger.error(deleteError, `Error al eliminar el perfil con ID: ${perfilId}`);
      
      if (deleteError.code === '23503') { 
          return NextResponse.json({ error: 'No se puede eliminar porque tiene datos asociados. Configura CASCADE DELETE.' }, { status: 409 });
      }

      return NextResponse.json({ error: 'No se pudo eliminar el perfil', details: deleteError.message }, { status: 500 });
    }

    logger.info(`Perfil eliminado exitosamente. ID: ${perfilId}`);
    
    return NextResponse.json(
      { message: 'Perfil eliminado correctamente' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("EXCEPCIÓN NO CONTROLADA EN DELETE:", error);
    logger.error(error, 'Error inesperado en DELETE /api/perfiles/[id]');
    return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
  }
}