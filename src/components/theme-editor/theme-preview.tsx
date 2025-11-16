"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeConfig } from "./theme-editor";
import { ExternalLink, Eye } from "lucide-react";

interface ThemePreviewProps {
  theme: ThemeConfig;
  profileData?: {
    nombre: string;
    correo?: string;
    logo_url?: string;
    descripcion?: string;
    links?: LinkItem[];
  } | null;
  profileId?: string;
}

interface LinkItem {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
}

// ✅ Tipo explícito para los datos del perfil
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

export function ThemePreview({ theme, profileData, profileId }: ThemePreviewProps) {
  // ✅ Combinar datos de forma segura
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
    const baseStyles = {
      centered: "max-w-md mx-auto text-center",
      "left-aligned": "max-w-2xl mx-auto text-left",
      "right-aligned": "max-w-2xl mx-auto text-right",
      justified: "max-w-2xl mx-auto text-justify",
      card: "max-w-md mx-auto bg-card rounded-xl shadow-lg border",
      minimal: "max-w-sm mx-auto",
    };

    return baseStyles[theme.layout.type] || baseStyles.centered;
  };

  const getTextAlignment = () => {
    // ✅ Usar la alineación específica si está definida, sino la del layout
    return (
      theme.layout.textAlignment ||
      (theme.layout.type === "centered"
        ? "center"
        : theme.layout.type === "right-aligned"
        ? "right"
        : theme.layout.type === "justified"
        ? "justify"
        : "left")
    );
  };

  const textAlignment = getTextAlignment();

  // ✅ Función para abrir en pestaña nueva
  const handleOpenPreview = () => {
    const previewUrl = profileId ? `/preview/${profileId}` : '/preview/demo';
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-full px-2 sm:px-0 transition-all duration-200">
      {/* Header con título y botón */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Vista Previa</h3>
        <Button
          onClick={handleOpenPreview}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          Ver en pestaña nueva
        </Button>
      </div>

      {/* Vista previa del perfil - SIN estilos de desarrollo */}
      <div
        className={`rounded-lg transition-all duration-200 ${getLayoutStyles()}`}
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.secondary,
          fontFamily: theme.typography.fontFamily,
          padding: theme.spacing.padding,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.gap,
          // ✅ ESTILOS COMO EN PUBLICACIÓN:
          width: '100%',
          minHeight: 'auto',
          margin: '0 auto', // Solo el margin del layout
          transform: 'none', // Sin scale
          overflow: 'visible', // Sin overflow-hidden
        }}
      >
        {/* Avatar - Siempre mostrar si hay logo_url */}
        {displayData.logo_url && (
          <div className="flex justify-center">
            <Avatar
              className="size-20 border-2"
              style={{
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.secondary,
              }}
            >
              <AvatarImage
                src={displayData.logo_url}
                alt={`Avatar de ${displayData.nombre}`}
                className="object-cover"
                onError={(e) => {
                  console.error(
                    "❌ Error cargando avatar:",
                    displayData.logo_url
                  );
                  e.currentTarget.style.display = "none";
                }}
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
        <div 
          className="transition-all duration-200"
          style={{ 
            textAlign: textAlignment as any,
            display: 'flex',
            flexDirection: 'column',
            // ✅ GAP: Espacio entre nombre y descripción
            gap: theme.spacing.gap
          }}
        >
          <h1
            className="font-bold transition-all duration-200"
            style={{
              fontSize: theme.typography.fontSize.heading,
              color: theme.colors.secondary,
              margin: 0
            }}
          >
            {displayData.nombre}
          </h1>

          {/* ✅ DESCRIPCIÓN - Usar MARGIN para espacio entre líneas */}
          {displayData.descripcion !== undefined &&
            displayData.descripcion !== null && (
              <p
                className="opacity-80 transition-all duration-200"
                style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text,
                  margin: 0,
                  // ✅ MARGIN: Espacio entre líneas de texto
                  lineHeight: theme.spacing.margin
                }}
              >
                {displayData.descripcion || " "}
              </p>
            )}
        </div>

        {/* Enlaces con alineación de texto */}
        <div 
          className="transition-all duration-200"
          style={{
            display: 'flex',
            flexDirection: 'column',
            // ✅ GAP: Espacio entre botones
            gap: theme.spacing.gap
          }}
        >
          {displayData.links
            ?.filter((link) => link.isActive)
            .map((link) => (
              <Button
                key={link.id}
                className={`transition-all hover:scale-105 duration-200 ${
                  textAlignment === "center"
                    ? "justify-center"
                    : textAlignment === "right"
                    ? "justify-end"
                    : "justify-start"
                }`}
                style={{
                  backgroundColor: theme.colors.card,
                  color: theme.colors.cardText,
                  border: "none",
                  fontSize: theme.typography.fontSize.cardText,
                  padding: `calc(${theme.spacing.padding} * 0.6) calc(${theme.spacing.padding} * 0.8)`,
                  // ✅ GAP: Espacio interno entre texto e icono del botón
                  gap: `calc(${theme.spacing.gap} * 0.5)`
                }}
                asChild
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <span
                    className={`font-medium ${
                      textAlignment === "center"
                        ? "text-center flex-1"
                        : textAlignment === "right"
                        ? "text-right flex-1"
                        : "text-left flex-1"
                    }`}
                  >
                    {link.name}
                  </span>
                  <ExternalLink className="size-4 shrink-0" />
                </a>
              </Button>
            ))}
        </div>
      </div>

      {/* Debug info */}
      <div 
        className="text-xs text-muted-foreground text-center transition-all duration-200 mt-4"
        style={{
          padding: `calc(${theme.spacing.padding} * 0.5)`,
          display: 'flex',
          flexDirection: 'column',
          // ✅ GAP: Espacio entre líneas de debug
          gap: `calc(${theme.spacing.gap} * 0.5)`
        }}
      >
        <div>Layout: {theme.layout.type}</div>
        <div>Alineación: {textAlignment}</div>
        <div>Fuente: {theme.typography.fontFamily.split(",")[0]}</div>
        <div>
          Color principal:{" "}
          <span className="font-mono">{theme.colors.primary}</span>
        </div>
        <div>Descripción: "{displayData.descripcion || "No disponible"}"</div>
        {displayData.logo_url ? (
          <div className="text-green-600 text-xs">✅ Avatar disponible</div>
        ) : (
          <div className="text-amber-600 text-xs">⚠️ No hay avatar</div>
        )}
        {/* Debug de espaciado */}
        <div className="border-t pt-2 mt-2">
          <div className="font-mono text-xs">
            Gap (entre elementos): {theme.spacing.gap} | Margin (entre líneas): {theme.spacing.margin} | Padding (interno): {theme.spacing.padding}
          </div>
        </div>

        {/* Enlace público para copiar */}
        {profileId && (
          <div className="border-t pt-2 mt-2">
            <div className="text-xs mb-1">Enlace público:</div>
            <code className="text-xs bg-muted p-1 rounded block break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/preview/${profileId}` : `/preview/${profileId}`}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}