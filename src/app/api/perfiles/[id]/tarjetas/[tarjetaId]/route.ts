// src/app/api/perfiles/[id]/tarjetas/[tarjetaId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuthToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";
import { tarjetaSchema } from "../tarjetas.schema";

export const runtime = "nodejs";

/**
 * ACTUALIZA una tarjeta específica
 */
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

    console.log("📦 BACKEND - Actualizando tarjeta:", {
      tarjetaId,
      perfil_id: perfilId,
      nombre_tarjeta: data.nombre_tarjeta,
      link: data.link
    });

    // 3. Actualizar la tarjeta
    const { data: tarjetaActualizada, error: updateError } = await supabaseAdmin
      .from("tarjetas")
      .update({
        nombre_tarjeta: data.nombre_tarjeta,
        link: data.link,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tarjetaId)
      .eq("perfil_id", perfilId)
      .select("*")
      .single();

    if (updateError) {
      console.error("❌ BACKEND - Error al actualizar tarjeta:", updateError);
      logger.error(updateError, "Error al actualizar la tarjeta en Supabase");
      
      if (updateError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Tarjeta no encontrada" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: "No se pudo actualizar la tarjeta: " + updateError.message },
        { status: 500 }
      );
    }

    console.log("✅ BACKEND - Tarjeta actualizada exitosamente:", tarjetaActualizada);
    return NextResponse.json(tarjetaActualizada, { status: 200 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("❌ BACKEND - Error general en PUT tarjeta:", error);
    logger.error(error, "Error inesperado en PUT .../[id]/tarjetas/[tarjetaId]");
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * ELIMINA una tarjeta específica
 */
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

    console.log("🗑️ BACKEND - Eliminando tarjeta:", { tarjetaId, perfil_id: perfilId });

    // 2. Eliminar tarjeta
    const { error: deleteError } = await supabaseAdmin
      .from("tarjetas")
      .delete()
      .eq("id", tarjetaId)
      .eq("perfil_id", perfilId);

    if (deleteError) {
      console.error("❌ BACKEND - Error al eliminar tarjeta:", deleteError);
      logger.error(deleteError, "Error al eliminar la tarjeta en Supabase");
      return NextResponse.json(
        { error: "No se pudo eliminar la tarjeta: " + deleteError.message },
        { status: 500 }
      );
    }

    console.log("✅ BACKEND - Tarjeta eliminada exitosamente");
    return NextResponse.json({ message: "Tarjeta eliminada exitosamente" }, { status: 200 });
  } catch (error: any) {
    console.error("❌ BACKEND - Error general en DELETE tarjeta:", error);
    logger.error(error, "Error inesperado en DELETE .../[id]/tarjetas/[tarjetaId]");
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}