"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeConfig } from "./theme-editor";
import { ExternalLink } from "lucide-react";

interface ThemePreviewProps {
  theme: ThemeConfig;
  profileData?: {
    nombre: string;
    correo?: string;
    logo_url?: string;
    descripcion?: string;
    links?: LinkItem[];
  } | null;
}

interface LinkItem {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
}

// ✅ Definir un tipo explícito para los datos del perfil
type ProfileData = {
  nombre: string;
  correo?: string;
  logo_url?: string;
  descripcion?: string;
  links?: LinkItem[];
};

const defaultProfileData: ProfileData = {
  nombre: "Juan Pérez",
  correo: "juan@ejemplo.com",
  descripcion: "Apasionado por crear experiencias digitales excepcionales.",
  links: [],
};

export function ThemePreview({ theme, profileData }: ThemePreviewProps) {
  // ✅ Combinar datos de forma segura con tipo explícito
  const displayData: ProfileData = {
    ...defaultProfileData,
    ...profileData,
    links: profileData?.links || defaultProfileData.links,
  };

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
              {displayData.logo_url && (
                <AvatarImage
                  src={displayData.logo_url}
                  alt={`Avatar de ${displayData.nombre}`}
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
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

          {displayData.descripcion && (
            <p
              className="leading-relaxed opacity-80"
              style={{ fontSize: theme.typography.fontSize.base }}
            >
              {displayData.descripcion}
            </p>
          )}
        </div>

        {/* Enlaces */}
        <div className="space-y-3 mt-4">
          {displayData.links
            ?.filter((link) => link.isActive)
            .map((link) => (
              <Button
                key={link.id}
                className="w-full justify-start gap-3 py-4 px-4 transition-all hover:scale-105"
                style={{
                  backgroundColor: theme.colors.card,
                  color: theme.colors.cardText,
                  border: "none",
                }}
                asChild
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <span className="flex-1 text-left font-medium">
                    {link.name}
                  </span>
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ))}
        </div>
      </div>

      {/* Debug info */}
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
