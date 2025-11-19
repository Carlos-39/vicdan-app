import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/login", "/register-admin", "/"];
  // Allow paths starting with /p_ (public profiles)
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) || pathname.startsWith("/p_");
  
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verificar si el usuario está autenticado
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};