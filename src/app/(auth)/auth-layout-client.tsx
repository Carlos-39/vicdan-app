"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Session } from "next-auth";

interface AuthLayoutClientProps {
  children: ReactNode;
  session: Session | null;
}

export function AuthLayoutClient({ children, session }: AuthLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir desde /login si hay sesión activa
    // Permitir acceso a /register-admin incluso con sesión activa (para que admins puedan registrar otros usuarios)
    // NO interferir con navegaciones desde /register-admin
    if (session?.user && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [session, pathname, router]);

  return <>{children}</>;
}

