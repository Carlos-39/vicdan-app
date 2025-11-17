import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuthToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";
import { disenoSchema } from "./diseno.schema";

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
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

    // 2. Obtener parámetros
    const { id: perfilId } = await context.params;

    if (!perfilId) {
      return NextResponse.json(
        { error: "ID de perfil requerido" },
        { status: 400 }
      );
    }

    // 3. Validar los datos de entrada
    const body = await req.json();
    const disenoData = disenoSchema.parse(body);

    // 4. Actualizar diseño en la BD
    const { data: perfilActualizado, error: updateError } = await supabaseAdmin
      .from("perfiles")
      .update({ diseno: disenoData })
      .eq("id", perfilId)
      .select("id, diseno")
      .single();

    if (updateError) {
      logger.error(updateError, "Error al EDITAR el diseño del perfil");

      if (updateError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Perfil no encontrado" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: "No se pudo editar el diseño" },
        { status: 500 }
      );
    }

    return NextResponse.json(perfilActualizado.diseno, { status: 200 });
    
  } catch (error: any) {
    // Manejar errores de validación Zod
    if (error?.issues) {
      return NextResponse.json(
        {
          error: "Datos de diseño inválidos",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    logger.error(error, "Error inesperado en PUT /api/perfiles/[id]/diseno");
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}