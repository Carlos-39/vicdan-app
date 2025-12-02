import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';
import { verifyAuthToken } from '@/lib/jwt';

const ADMINS_AUTORIZADOS = [
    // Administradores
  "lauraserna090@gmail.com",
  "danielramirezzapata10@gmail.com",
  // Equipo de trabajo
  "corrales.carlos@correounivalle.edu.co",
  "brayansl0523@gmail.com",
  "kmilollanos@gmail.com",
  "brayanss2018@gmail.com"
];

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const token = auth.replace("Bearer ", "");
    const user = verifyAuthToken(token);

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Validar que el que genera el código sea uno de los dos administradores autorizados
    if (!ADMINS_AUTORIZADOS.includes(user.email)) {
      return NextResponse.json({ error: "No tienes permisos para generar códigos" }, { status: 403 });
    }

    const codigo = crypto.randomBytes(16).toString("hex");

    const { error } = await supabaseAdmin
      .from("codigos_registro")
      .insert({
        codigo,
        creado_por: user.email,
      });

    if (error) {
      return NextResponse.json({ error: "No se pudo generar código" }, { status: 500 });
    }

    return NextResponse.json({ codigo }, { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}