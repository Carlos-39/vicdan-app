import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuthToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";
import { tarjetaSchema } from "./tarjetas.schema";

export const runtime = "nodejs";

/**
 * OBTIENE todas las tarjetas de un perfil específico (perfil_id).
 */
export async function GET(
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

    const { id: perfilId } = await context.params;
    const adminId = claims.id;

    if (!perfilId) {
      return NextResponse.json(
        { error: "ID de perfil requerido" },
        { status: 400 }
      );
    }

    // 2. Obtener las tarjetas
    const { data: tarjetas, error: fetchError } = await supabaseAdmin
      .from("tarjetas")
      .select("*")
      .eq("perfil_id", perfilId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      logger.error(
        fetchError,
        `Error al obtener tarjetas para el perfil: ${perfilId}`
      );
      return NextResponse.json(
        { error: "No se pudieron obtener las tarjetas" },
        { status: 500 }
      );
    }

    return NextResponse.json(tarjetas, { status: 200 });
  } catch (error: any) {
    logger.error(error, "Error inesperado en GET .../[id]/tarjetas");
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * CREA una nueva tarjeta para un perfil específico (perfil_id).
 */
export async function POST(
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

    const adminId = claims.id;
    const { id: perfilId } = await context.params;

    if (!perfilId) {
      return NextResponse.json(
        { error: "ID de perfil requerido" },
        { status: 400 }
      );
    }

    // 2. Validar que el perfil exista
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from("perfiles")
      .select("id")
      .eq("id", perfilId)
      .maybeSingle();

    if (perfilError || !perfil) {
      logger.warn(
        { perfilError, perfilId },
        `POST tarjetas: Perfil no encontrado`
      );
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // 3. Validar los datos de entrada
    const body = await req.json();
    const data = tarjetaSchema.parse(body);

    // 4. Crear la tarjeta
    const { data: nuevaTarjeta, error: insertError } = await supabaseAdmin
      .from("tarjetas")
      .insert({
        perfil_id: perfilId,
        nombre_tarjeta: data.nombre_tarjeta,
        link: data.link,
      })
      .select("*")
      .single();

    if (insertError) {
      logger.error(insertError, "Error al crear la tarjeta en Supabase");
      return NextResponse.json(
        { error: "No se pudo crear la tarjeta" },
        { status: 500 }
      );
    }

    return NextResponse.json(nuevaTarjeta, { status: 201 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    logger.error(error, "Error inesperado en POST .../[id]/tarjetas");
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

