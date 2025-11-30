// src/app/api/perfiles/[id]/tarjetas/[tarjetaId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuthToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";
import { tarjetaSchema } from "../tarjetas.schema";
import { ADMIN_WHITELIST } from "@/lib/admins";

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string; tarjetaId: string }> }
) {
  try {
    // 1. Autenticación
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }
    const claims = verifyAuthToken(token);
    if (!claims) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    const adminEmail = claims.email;

    const { id: perfilId, tarjetaId } = await context.params;

    if (!perfilId || !tarjetaId) {
      return NextResponse.json(
        { error: "ID de perfil y tarjeta requeridos" },
        { status: 400 }
      );
    }

    // 2. Validar datos de entrada
    const body = await req.json();
    const data = tarjetaSchema.parse(body);

    // 3. Verificar que el perfil existe y pertenece al usuario
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from("perfiles")
      .select("administrador_id")
      .eq("id", perfilId)
      .single();

    if (perfilError || !perfil) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Verificar propiedad solo si no son los Super Administradores 
    if (!ADMIN_WHITELIST.includes(adminEmail)) {
      if (perfil.administrador_id !== claims.id) {
        return NextResponse.json(
          { error: "No autorizado para editar tarjetas de este perfil" },
          { status: 403 }
        );
      }
    }

    // 4. Verificar que la tarjeta existe
    const { data: tarjetaExistente, error: tarjetaError } = await supabaseAdmin
      .from("tarjetas")
      .select("id, perfil_id")
      .eq("id", tarjetaId)
      .single();

    if (tarjetaError || !tarjetaExistente) {
      return NextResponse.json(
        { error: "Tarjeta no encontrada" },
        { status: 404 }
      );
    }

    if (tarjetaExistente.perfil_id !== perfilId) {
      return NextResponse.json(
        { error: "La tarjeta no pertenece a este perfil" },
        { status: 403 }
      );
    }

    // 5. Actualizar la tarjeta
    const { data: tarjetaActualizada, error: updateError } = await supabaseAdmin
      .from("tarjetas")
      .update({
        nombre_tarjeta: data.nombre_tarjeta,
        link: data.link,
      })
      .eq("id", tarjetaId)
      .eq("perfil_id", perfilId)
      .select("*")
      .single();

    if (updateError) {
      logger.error(updateError, "Error al actualizar la tarjeta en Supabase");

      if (updateError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Tarjeta no encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "No se pudo actualizar la tarjeta" },
        { status: 500 }
      );
    }

    return NextResponse.json(tarjetaActualizada, { status: 200 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    logger.error(
      error,
      "Error inesperado en PUT .../[id]/tarjetas/[tarjetaId]"
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; tarjetaId: string }> }
) {
  try {
    // 1. Autenticación
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }
    const claims = verifyAuthToken(token);
    if (!claims) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    const { id: perfilId, tarjetaId } = await context.params;

    if (!perfilId || !tarjetaId) {
      return NextResponse.json(
        { error: "ID de perfil y tarjeta requeridos" },
        { status: 400 }
      );
    }

    // 2. Verificar que el perfil existe y pertenece al usuario
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from("perfiles")
      .select("administrador_id")
      .eq("id", perfilId)
      .single();

    if (perfilError || !perfil) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    if (perfil.administrador_id !== claims.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar tarjetas de este perfil" },
        { status: 403 }
      );
    }

    // 3. Eliminar tarjeta
    const { error: deleteError } = await supabaseAdmin
      .from("tarjetas")
      .delete()
      .eq("id", tarjetaId)
      .eq("perfil_id", perfilId);

    if (deleteError) {
      logger.error(deleteError, "Error al eliminar la tarjeta en Supabase");
      return NextResponse.json(
        { error: "No se pudo eliminar la tarjeta" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Tarjeta eliminada exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error(
      error,
      "Error inesperado en DELETE .../[id]/tarjetas/[tarjetaId]"
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}