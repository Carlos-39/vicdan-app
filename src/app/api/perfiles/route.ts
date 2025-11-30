import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";
import { uploadLogo } from "@/lib/storage";
import { perfilSchema } from "./perfil.schema";
import { verifyAuthToken } from '@/lib/jwt';
import { z } from 'zod';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const ADMIN_WHITELIST = [
  "lauraserna090@gmail.com",
  "danielramirezzapata10@gmail.com",
  "brayansl0523@gmail.com"
];

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    const claims = verifyAuthToken(token);
    if (!claims) return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });

    const adminId = claims.id;
    const adminEmail = claims.email;

    const url = new URL(req.url);
    const estado = url.searchParams.get('estado');
    const busqueda = url.searchParams.get('busqueda');
    const orden = url.searchParams.get('orden'); // 'recientes' | 'antiguos'
    const ascending = orden === 'antiguos';

    let query = supabaseAdmin
      .from('perfiles')
      .select('id, administrador_id, nombre, logo_url, correo, descripcion, estado, fechas');
    
    // Permitir a los administradores ver todos los perfiles
    if (!ADMIN_WHITELIST.includes(adminEmail)) {
      query = query.eq('administrador_id', adminId);
    }

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
    console.log("[api/perfiles] POST called");
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const adminId = session.user.id;

    const ctype = req.headers.get("content-type") || "";
    const isMultipart = ctype.includes("multipart/form-data");

    let nombre: string;
    let correo: string;
    let descripcion: string;
    let logoFile: File | null = null;

    if (isMultipart) {
      const form = await req.formData();
      nombre = String(form.get("nombre") ?? "");
      correo = String(form.get("correo") ?? "");
      descripcion = String(form.get("descripcion") ?? "");
      const maybeFile = form.get("logo");

      if (maybeFile instanceof File && maybeFile.size > 0) {
        logoFile = maybeFile;
      }
    } else {
      const body = await req.json();
      nombre = String(body?.nombre ?? "");
      correo = String(body?.correo ?? "");
      descripcion = String(body?.descripcion ?? "");
    }

    const data = perfilSchema.parse({ nombre, correo });

    let logoUrl: string | null = null;
    if (logoFile) {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/webp",
      ];
      if (!validTypes.includes(logoFile.type)) {
        return NextResponse.json(
          { error: "Tipo de archivo no permitido (use jpg, png, webp o svg)" },
          { status: 400 }
        );
      }

      try {
        logoUrl = await uploadLogo(logoFile, adminId);
      } catch (uploadErr) {
        console.error("[api/perfiles] uploadLogo error:", uploadErr);
        return NextResponse.json(
          { error: "Error subiendo el logo", details: String(uploadErr) },
          { status: 500 }
        );
      }
    }

    const estado = "borrador";

    let perfil: any = null;
    try {
      const insertRes = await supabaseAdmin
        .from("perfiles")
        .insert({
          administrador_id: adminId,
          nombre: data.nombre,
          logo_url: logoUrl,
          correo: data.correo,
          descripcion: descripcion || null,
          estado,
        })
        .select("id")
        .single();

      if (insertRes.error) {
        console.error("[api/perfiles] insert error:", insertRes.error);
        return NextResponse.json(
          {
            error: "No se pudo crear el perfil",
            details: String(insertRes.error.message ?? insertRes.error),
          },
          { status: 500 }
        );
      }

      perfil = insertRes.data;
    } catch (dbErr) {
      console.error("[api/perfiles] DB insert exception:", dbErr);
      return NextResponse.json(
        { error: "Error en la base de datos", details: String(dbErr) },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { id: perfil.id, message: "Perfil creado exitosamente" },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error interno", details: String(error?.message ?? error) },
      { status: 500 }
    );
  }
}
