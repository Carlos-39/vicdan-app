import { ReactNode } from "react";
import { auth } from "@/auth";
import { AuthLayoutClient } from "./auth-layout-client";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();

  // Solo redirigir desde /login si hay sesión activa
  // Permitir acceso a /register-admin incluso con sesión activa (para que admins puedan registrar otros usuarios)
  return <AuthLayoutClient session={session}>{children}</AuthLayoutClient>;
}
