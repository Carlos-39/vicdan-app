import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";
import { uploadLogo } from "@/lib/storage";
import { perfilSchema } from "./perfil.schema";

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
    let logoFile: File | null = null;

    if (isMultipart) {
      const form = await req.formData();
      nombre = String(form.get("nombre") ?? "");
      correo = String(form.get("correo") ?? "");
      const maybeFile = form.get("logo");

      if (maybeFile instanceof File && maybeFile.size > 0) {
        logoFile = maybeFile;
      }
    } else {
      const body = await req.json();
      nombre = String(body?.nombre ?? "");
      correo = String(body?.correo ?? "");
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

    let perfil: any = null; //eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      const insertRes = await supabaseAdmin
        .from("perfiles")
        .insert({
          administrador_id: adminId,
          nombre: data.nombre,
          logo_url: logoUrl,
          correo: data.correo,
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
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
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
