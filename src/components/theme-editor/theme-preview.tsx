"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeConfig } from "./theme-editor";
import {
  ExternalLink,
  Instagram,
  MessageCircle,
  Music,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  Globe,
} from "lucide-react";

interface ThemePreviewProps {
  theme: ThemeConfig;
  profileData?: {
    nombre: string;
    correo?: string;
    logo_url?: string;
    descripcion?: string;
    links?: LinkItem[];
    socialIcons?: SocialIcon[];
  } | null;
}

interface LinkItem {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
}

interface SocialIcon {
  id: string;
  platform: string;
  url: string;
  isActive: boolean;
}

// Mapeo de iconos para redes sociales
const SOCIAL_ICONS: { [key: string]: React.ComponentType<any> } = {
  instagram: Instagram,
  whatsapp: MessageCircle,
  tiktok: Music,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  email: Mail,
  phone: Phone,
  website: Globe,
  default: ExternalLink,
};

const defaultProfileData = {
  nombre: "Juan Pérez",
  correo: "juan@ejemplo.com",
  descripcion: "Apasionado por crear experiencias digitales excepcionales.",
  links: [],
  socialIcons: [],
};

export function ThemePreview({ theme, profileData }: ThemePreviewProps) {
  const displayData = {
    ...defaultProfileData,
    ...profileData,
    links: profileData?.links || defaultProfileData.links,
    socialIcons: profileData?.socialIcons || defaultProfileData.socialIcons,
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

  const getTextAlignment = () => {
    return theme.layout.textAlignment || "center";
  };

  const getFlexJustification = () => {
    const alignment = getTextAlignment();
    return alignment === "center"
      ? "center"
      : alignment === "right"
      ? "flex-end"
      : "flex-start";
  };

  // Función para obtener iconos sociales activos con URL válida
  const getActiveSocialIcons = () => {
    return displayData.socialIcons?.filter((icon) => {
      const hasValidUrl = icon.url && 
                          icon.url.trim() !== '' && 
                          icon.url !== 'https://' &&
                          icon.url !== 'mailto:' &&
                          icon.url !== 'tel:';
      
      return icon.isActive && hasValidUrl;
    }) || [];
  };

  // Componente para renderizar iconos sociales
  const SocialIconsSection = ({ position }: { position: "above" | "below" }) => {
    const activeIcons = getActiveSocialIcons();

    if (activeIcons.length === 0) return null;

    return (
      <div
        className={`flex justify-center gap-4 flex-wrap ${
          position === "above" ? "mb-4" : "mt-4"
        }`}
      >
        {activeIcons.map((socialIcon) => {
          const IconComponent = SOCIAL_ICONS[socialIcon.platform] || ExternalLink;
          const platformName = socialIcon.platform.charAt(0).toUpperCase() + socialIcon.platform.slice(1);

          return (
            <a
              key={socialIcon.id}
              href={socialIcon.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full transition-all hover:scale-110 hover:shadow-lg active:scale-95"
              style={{
                backgroundColor: theme.colors.primary, // Mismo color que las tarjetas
                color: theme.colors.cardText, // Mismo color del texto de las tarjetas
              }}
              title={`Visitar ${platformName}`}
              onClick={(e) => {
                if (!socialIcon.url || socialIcon.url.trim() === '' || 
                    socialIcon.url === 'https://' || 
                    socialIcon.url === 'mailto:' || 
                    socialIcon.url === 'tel:') {
                  e.preventDefault();
                }
              }}
            >
              <IconComponent className="size-6" />
            </a>
          );
        })}
      </div>
    );
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
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Avatar */}
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

        {/* Información principal */}
        <div
          className="space-y-3"
          style={{
            textAlign: getTextAlignment() as any,
            lineHeight: theme.spacing.margin,
          }}
        >
          <h1
            className="font-bold"
            style={{
              fontSize: theme.typography.fontSize.heading,
              color: theme.colors.secondary,
              marginBottom: `calc(${theme.spacing.margin} / 2)`,
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
                lineHeight: theme.spacing.margin,
                margin: 0,
              }}
            >
              {displayData.descripcion}
            </p>
          )}
        </div>

        {/* Iconos sociales - ARRIBA de los enlaces */}
        {(theme.layout.socialIconsPosition === "above-links" || theme.layout.socialIconsPosition === "both") && (
          <SocialIconsSection position="above" />
        )}

        {/* Enlaces principales */}
        <div
          className="mt-4"
          style={{
            textAlign: getTextAlignment() as any,
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.gap,
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

        {/* Iconos sociales - DEBAJO de los enlaces */}
        {(theme.layout.socialIconsPosition === "below-links" || theme.layout.socialIconsPosition === "both") && (
          <SocialIconsSection position="below" />
        )}
      </div>
    </div>
  );
}