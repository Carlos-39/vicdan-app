// src/components/theme-editor/theme-preview.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeConfig } from "./theme-editor";
import { Mail, Globe, Phone, MapPin } from "lucide-react";

// ✅ AGREGAR profileData a las props
interface ThemePreviewProps {
  theme: ThemeConfig;
  profileData?: {
    nombre: string;
    correo?: string;
    logo_url?: string;
    descripcion?: string;
  };
}

// Datos de ejemplo como fallback
const defaultProfileData = {
  nombre: "Juan Pérez",
  correo: "juan@ejemplo.com",
  descripcion: "Apasionado por crear experiencias digitales excepcionales.",
};

export function ThemePreview({ theme, profileData }: ThemePreviewProps) {
  // ✅ Usar datos del perfil o los de ejemplo
  const displayData = profileData || defaultProfileData;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getLayoutStyles = () => {
    switch (theme.layout.type) {
      case "centered":
        return "max-w-md mx-auto text-center";
      case "left-aligned":
        return "max-w-2xl mx-auto text-left";
      case "card":
        return "max-w-md mx-auto bg-card rounded-xl shadow-lg border";
      case "minimal":
        return "max-w-sm mx-auto";
      default:
        return "max-w-md mx-auto text-center";
    }
  };

  return (
    <div className="space-y-4 w-full max-w-full px-2 sm:px-0">
      {/* Vista previa del perfil */}
      <div
        className={`rounded-lg transition-all w-full overflow-hidden scale-90 sm:scale-95 md:scale-100 ${getLayoutStyles()}`}
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          fontFamily: theme.typography.fontFamily,
          padding: `calc(${theme.spacing.padding} * 0.8)`,
          gap: theme.spacing.gap,
          margin: "0 auto",
        }}
      >
        {/* Avatar */}
        {theme.layout.showAvatar && (
          <div className="flex justify-center mb-4">
            <Avatar
              className="size-20 border-2"
              style={{
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.secondary,
              }}
            >
              <AvatarImage
                src={"/placeholder-avatar.jpg"}
                alt={displayData.nombre}
              />
              <AvatarFallback
                className="text-lg font-semibold"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.background,
                }}
              >
                {getInitials(displayData.nombre)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Información principal */}
        <div className="space-y-3">
          <h1
            className="font-bold"
            style={{
              fontSize: theme.typography.fontSize.heading,
              color: theme.colors.text,
            }}
          >
            {displayData.nombre}
          </h1>

          {/* Descripción - solo si existe */}
          {displayData.descripcion && (
            <p
              className="leading-relaxed opacity-80"
              style={{ fontSize: theme.typography.fontSize.base }}
            >
              {displayData.descripcion}
            </p>
          )}
        </div>

        {/* Información de contacto */}
        <div
          className="space-y-2 mt-4 p-4 rounded-lg"
          style={{
            backgroundColor: theme.colors.secondary,
            margin: theme.spacing.margin,
          }}
        >
          {/* Email - solo si existe */}
          {displayData.correo && (
            <div className="flex items-center gap-3">
              <Mail className="size-4" style={{ color: theme.colors.accent }} />
              <span style={{ fontSize: theme.typography.fontSize.base }}>
                {displayData.correo}
              </span>
            </div>
          )}

          {/* Teléfono - ejemplo simple (puedes agregar este campo después) */}
          <div className="flex items-center gap-3">
            <Phone className="size-4" style={{ color: theme.colors.accent }} />
            <span style={{ fontSize: theme.typography.fontSize.base }}>
              +57 1234 567 890
            </span>
          </div>
        </div>

        {/* Enlaces sociales */}
        {theme.layout.showSocialLinks && (
          <div className="flex justify-center gap-3 mt-4">
            {["GitHub", "LinkedIn", "Twitter"].map((social) => (
              <Button
                key={social}
                variant="outline"
                size="sm"
                className="text-xs"
                style={{
                  borderColor: theme.colors.primary,
                  color: theme.colors.primary,
                  backgroundColor: "transparent",
                }}
              >
                {social}
              </Button>
            ))}
          </div>
        )}

        {/* Botón de acción principal */}
        <div className="mt-4">
          <Button
            className="w-full"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.background,
            }}
          >
            Contactar
          </Button>
        </div>
      </div>

      {/* Indicador de tema aplicado */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div>Tema: {theme.layout.type}</div>
        <div>Fuente: {theme.typography.fontFamily.split(",")[0]}</div>
        <div>
          Color principal:{" "}
          <span className="font-mono">{theme.colors.primary}</span>
        </div>
      </div>
    </div>
  );
}
