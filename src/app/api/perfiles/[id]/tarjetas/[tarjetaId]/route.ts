// src/app/api/perfiles/[id]/tarjetas/[tarjetaId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuthToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";
import { tarjetaSchema } from "../tarjetas.schema";

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

    const { id: perfilId, tarjetaId } = await context.params;

    console.log("🔧 PUT tarjeta - Iniciando:", {
      perfilId,
      tarjetaId,
      userId: claims.id,
    });

    if (!perfilId || !tarjetaId) {
      return NextResponse.json(
        { error: "ID de perfil y tarjeta requeridos" },
        { status: 400 }
      );
    }

    // 2. Validar datos de entrada
    const body = await req.json();
    console.log("📨 BACKEND PUT - Datos recibidos:", body);

    const data = tarjetaSchema.parse(body);
    console.log("✅ BACKEND PUT - Datos validados:", data);

    // 3. Verificar que el perfil existe y pertenece al usuario
    console.log("🔍 BACKEND PUT - Verificando perfil...");
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from("perfiles")
      .select("administrador_id")
      .eq("id", perfilId)
      .single();

    if (perfilError || !perfil) {
      console.error("❌ BACKEND PUT - Perfil no encontrado:", perfilError);
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    if (perfil.administrador_id !== claims.id) {
      console.error("❌ BACKEND PUT - No autorizado:", {
        perfilAdmin: perfil.administrador_id,
        user: claims.id,
      });
      return NextResponse.json(
        { error: "No autorizado para editar tarjetas de este perfil" },
        { status: 403 }
      );
    }

    // 4. Verificar que la tarjeta existe
    console.log("🔍 BACKEND PUT - Verificando tarjeta existente...");
    const { data: tarjetaExistente, error: tarjetaError } = await supabaseAdmin
      .from("tarjetas")
      .select("id, perfil_id")
      .eq("id", tarjetaId)
      .single();

    if (tarjetaError || !tarjetaExistente) {
      console.error("❌ BACKEND PUT - Tarjeta no encontrada:", tarjetaError);
      return NextResponse.json(
        { error: "Tarjeta no encontrada" },
        { status: 404 }
      );
    }

    if (tarjetaExistente.perfil_id !== perfilId) {
      console.error("❌ BACKEND PUT - Tarjeta no pertenece al perfil:", {
        tarjetaPerfil: tarjetaExistente.perfil_id,
        perfilSolicitado: perfilId,
      });
      return NextResponse.json(
        { error: "La tarjeta no pertenece a este perfil" },
        { status: 403 }
      );
    }

    // 5. Actualizar la tarjeta (SIN updated_at)
    console.log("🔄 BACKEND PUT - Actualizando en Supabase...");
    const { data: tarjetaActualizada, error: updateError } = await supabaseAdmin
      .from("tarjetas")
      .update({
        nombre_tarjeta: data.nombre_tarjeta,
        link: data.link,
        // updated_at removido porque no existe en la tabla
      })
      .eq("id", tarjetaId)
      .eq("perfil_id", perfilId)
      .select("*")
      .single();

    if (updateError) {
      console.error("❌ BACKEND PUT - Error en Supabase:", updateError);
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

    console.log(
      "✅ BACKEND PUT - Tarjeta actualizada exitosamente:",
      tarjetaActualizada
    );
    return NextResponse.json(tarjetaActualizada, { status: 200 });
  } catch (error: any) {
    if (error?.issues) {
      console.error("❌ BACKEND PUT - Error de validación Zod:", error.issues);
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("❌ BACKEND PUT - Error general:", error);
    logger.error(
      error,
      "Error inesperado en PUT .../[id]/tarjetas/[tarjetaId]"
    );
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
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

    console.log("🗑️ BACKEND DELETE - Eliminando tarjeta:", {
      perfilId,
      tarjetaId,
      userId: claims.id,
    });

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
      console.error("❌ BACKEND DELETE - Perfil no encontrado:", perfilError);
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
    console.log("🔄 BACKEND DELETE - Eliminando en Supabase...");
    const { error: deleteError } = await supabaseAdmin
      .from("tarjetas")
      .delete()
      .eq("id", tarjetaId)
      .eq("perfil_id", perfilId);

    if (deleteError) {
      console.error("❌ BACKEND DELETE - Error en Supabase:", deleteError);
      logger.error(deleteError, "Error al eliminar la tarjeta en Supabase");
      return NextResponse.json(
        { error: "No se pudo eliminar la tarjeta: " + deleteError.message },
        { status: 500 }
      );
    }

    console.log("✅ BACKEND DELETE - Tarjeta eliminada exitosamente");
    return NextResponse.json(
      { message: "Tarjeta eliminada exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ BACKEND DELETE - Error general:", error);
    logger.error(
      error,
      "Error inesperado en DELETE .../[id]/tarjetas/[tarjetaId]"
    );
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}