// Extiende el tipo de sesión para incluir accessToken
import type { Session } from "next-auth";
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { supabaseAdmin } from "./lib/supabase";
import { comparePassword } from "./lib/crypto";
import { generateAuthToken } from "./lib/jwt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  session: {
    strategy: "jwt",
  },
  // Configuración para permitir mensajes de error personalizados
  debug: process.env.NODE_ENV === "development",
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Ingresa tu email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Ingresa tu contraseña",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials || !credentials.email || !credentials.password) {
            throw new Error("Email y contraseña son obligatorios");
          }
          const { email, password } = credentials;

          const query = supabaseAdmin
            .from("administradores")
            .select("id, nombre, correo, password_hash")
            .eq("correo", email)
            .single();

          const { data, error } = await query;

          if (error || !data) {
            throw new Error("El correo ingresado no está registrado");
          }

          const isValidPassword = await comparePassword(
            password as string,
            data.password_hash
          );

          if (!isValidPassword) {
            throw new Error("La contraseña es incorrecta");
          }

          return { id: data.id, name: data.nombre, email: data.correo };
          // eslint-disable-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          // Re-lanzar el error con el mensaje original para que se muestre en el frontend
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        
        // Generar un JWT real usando la función generateAuthToken
        const jwtToken = generateAuthToken({
          id: user.id as string,
          nombre: user.name as string,
          email: user.email as string,
          rol: 'admin'
        });
        
        token.accessToken = jwtToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        // Exponer el accessToken en la sesión para el frontend
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
});
