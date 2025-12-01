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

// Definir patternOptions aquí para que esté disponible
const patternOptions = [
  { id: 'dots', name: 'Puntos', css: 'radial-gradient(circle, currentColor 1px, transparent 1px)' },
  { id: 'lines', name: 'Líneas', css: 'repeating-linear-gradient(0deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)' },
  { id: 'grid', name: 'Cuadrícula', css: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)' },
  { id: 'zigzag', name: 'Zigzag', css: 'linear-gradient(135deg, currentColor 25%, transparent 25%), linear-gradient(225deg, currentColor 25%, transparent 25%), linear-gradient(45deg, currentColor 25%, transparent 25%), linear-gradient(315deg, currentColor 25%, transparent 25%)' },
  { id: 'stripes', name: 'Rayas', css: 'repeating-linear-gradient(45deg, currentColor, currentColor 5px, transparent 5px, transparent 10px)' },
  { id: 'checker', name: 'Tablero', css: 'conic-gradient(currentColor 0% 25%, transparent 0% 50%, currentColor 0% 75%, transparent 0%)' }
];

export function ThemePreview({ theme, profileData }: ThemePreviewProps) {
  // ✅ Combinar datos de forma segura con tipo explícito
  const displayData: ProfileData = {
    ...defaultProfileData,
    ...profileData,
    links: profileData?.links || defaultProfileData.links,
  };

  // Mover getBackgroundStyle dentro del componente para que tenga acceso al theme
  const getBackgroundStyle = () => {
    const { background } = theme;

    switch (background?.type) {
      case "gradient":
        if (background.gradient?.direction === "circle") {
          return {
            background: `radial-gradient(circle, ${background.gradient.colors?.[0] || '#877af7'}, ${background.gradient.colors?.[1] || '#3b82f6'})`,
          };
        }
        return {
          background: `linear-gradient(${
            background.gradient?.direction || "to right"
          }, ${background.gradient?.colors?.[0] || "#877af7"}, ${
            background.gradient?.colors?.[1] || "#3b82f6"
          })`,
        };

      case "pattern":
        const pattern =
          patternOptions.find((p) => p.id === background.pattern?.type) ||
          patternOptions[0];
        return {
          background: pattern.css.replace(
            /currentColor/g,
            background.pattern?.color || "#877af7"
          ),
          backgroundSize: `${background.pattern?.size || 50}%`,
          backgroundColor: theme.colors.background,
          opacity: background.pattern?.opacity || 0.1,
        };

      case "image":
        return {
          backgroundImage: background.image?.url ? `url('${background.image.url}')` : 'none',
          backgroundSize: background.image?.size || "cover",
          backgroundPosition: background.image?.position || "center",
          backgroundRepeat: background.image?.repeat || "no-repeat",
          opacity: background.image?.opacity || 1,
        };

      case "color":
      default:
        return {
          backgroundColor: theme.colors.background,
        };
    }
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
      case "right-aligned":
        return "max-w-2xl mx-auto text-right";
      case "justified":
        return "max-w-2xl mx-auto text-justify";
      case "card":
        return "max-w-md mx-auto bg-card rounded-xl shadow-lg border text-center";
      case "minimal":
        return "max-w-sm mx-auto text-left";
      default:
        return "max-w-md mx-auto text-center";
    }
  };

  // ✅ Función para obtener la alineación de texto específica
  const getTextAlignment = () => {
    return theme.layout.textAlignment || "center"; // Valor por defecto
  };

  // ✅ Función para obtener la justificación del flex según la alineación
  const getFlexJustification = () => {
    const alignment = getTextAlignment();
    return alignment === "center"
      ? "center"
      : alignment === "right"
      ? "flex-end"
      : "flex-start";
  };

  return (
    <div className="space-y-4 w-full max-w-full px-2 sm:px-0">
      {/* Vista previa del perfil */}
      <div
        className={`rounded-lg transition-all w-full overflow-hidden scale-90 sm:scale-95 md:scale-100 ${getLayoutStyles()}`}
        style={{
          ...getBackgroundStyle(), // Aplicar el fondo aquí
          color: theme.colors.text,
          fontFamily: theme.typography.fontFamily,
          padding: `calc(${theme.spacing.padding} * 0.8)`,
          gap: theme.spacing.gap,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Avatar - Aplicar alineación del layout */}
        {theme.layout.showAvatar && (
          <div
            className="mb-4"
            style={{
              display: "flex",
              justifyContent: getFlexJustification(),
            }}
          >
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

        {/* Información principal - Aplicar alineación del layout */}
        <div
          className="space-y-3"
          style={{
            textAlign: getTextAlignment() as any,
            // ✅ Aplicar margin como line-height a los elementos de texto
            lineHeight: theme.spacing.margin,
          }}
        >
          <h1
            className="font-bold"
            style={{
              fontSize: theme.typography.fontSize.heading,
              color: theme.colors.secondary,
              marginBottom: `calc(${theme.spacing.margin} / 2)`, // ✅ Espacio después del título
            }}
          >
            {displayData.nombre}
          </h1>

          {displayData.descripcion && (
            <p
              className="opacity-80"
              style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text,
                lineHeight: theme.spacing.margin, // ✅ Margin como line-height
                margin: 0, // Resetear margen por defecto
              }}
            >
              {displayData.descripcion}
            </p>
          )}
        </div>

        {/* Enlaces - ✅ Aplicar gap entre tarjetas */}
        <div
          className="mt-4"
          style={{
            textAlign: getTextAlignment() as any,
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.gap, // ✅ Gap entre tarjetas de enlaces
          }}
        >
          {displayData.links
            ?.filter((link) => link.isActive)
            .map((link) => (
              <Button
                key={link.id}
                className="gap-3 py-4 px-4 transition-all hover:scale-105"
                style={{
                  backgroundColor: theme.colors.card,
                  color: theme.colors.cardText,
                  border: "none",
                  fontSize: theme.typography.fontSize.cardText,
                  // ✅ Aplicar alineación al contenido interno del botón
                  justifyContent: getFlexJustification(),
                  textAlign: getTextAlignment() as any,
                }}
                asChild
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <span
                    className="flex-1 font-medium"
                    style={{
                      textAlign: getTextAlignment() as any,
                    }}
                  >
                    {link.name}
                  </span>
                  <ExternalLink
                    className="shrink-0"
                    style={{
                      width: theme.typography.fontSize.cardText,
                      height: theme.typography.fontSize.cardText,
                    }}
                  />
                </a>
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}