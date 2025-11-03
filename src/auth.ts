import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { supabaseAdmin } from "./lib/supabase";
import { comparePassword } from "./lib/crypto";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  session: {
    strategy: "jwt",
  },
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
          const { email, password } = credentials;
          if (!email || !password) {
            throw new Error("Email y contraseña son obligatorios", {
              cause: { type: "CUSTOM" },
            });
          }

          const query = supabaseAdmin
            .from("administradores")
            .select("id, nombre, correo, password_hash")
            .eq("correo", email)
            .single();

          const { data, error } = await query;

          if (error || !data) {
            throw new Error("El correo ingresado no está registrado", {
              cause: { ...error, type: "CUSTOM" },
            });
          }

          const isValidPassword = await comparePassword(
            password as string,
            data.password_hash
          );

          if (!isValidPassword) {
            throw new Error("La contraseña es incorrecta", {
              cause: { type: "CUSTOM" },
            });
          }

          return { id: data.id, name: data.nombre, email: data.correo };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          throw error.cause.type === "CUSTOM"
            ? error.cause
            : new Error("Error durante la autenticación");
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
