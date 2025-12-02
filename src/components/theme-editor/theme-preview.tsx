"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeConfig } from "./theme-editor";
import { usePathname } from "next/navigation";
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
  const displayData = {
    ...defaultProfileData,
    ...profileData,
    links: profileData?.links || defaultProfileData.links,
    socialIcons: profileData?.socialIcons || defaultProfileData.socialIcons,
  };

  const pathname = usePathname();
    
    // Determine if we should show the back button
    const isPersonalizar = 
      pathname?.includes("/personalizar")
  
    console.log(pathname, isPersonalizar);

  // Función para convertir color hex a RGB
  function hexToRgb(hex: string) {
    // Eliminar el # si está presente
    hex = hex.replace(/^#/, '');
    
    // Parsear los componentes
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    
    return { r, g, b };
  }

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
      const opacity = background.image?.opacity || 1;
      const bgColor = theme.colors.background || "#ffffff";
      
      // Si la opacidad es menor a 1, crear un gradiente superpuesto
      if (opacity < 1 && background.image?.url) {
        return {
          backgroundImage: `
            linear-gradient(
              rgba(${hexToRgb(bgColor).r}, ${hexToRgb(bgColor).g}, ${hexToRgb(bgColor).b}, ${1 - opacity}),
              rgba(${hexToRgb(bgColor).r}, ${hexToRgb(bgColor).g}, ${hexToRgb(bgColor).b}, ${1 - opacity})
            ),
            url('${background.image.url}')
          `,
          backgroundSize: background.image?.size || "cover",
          backgroundPosition: background.image?.position || "center",
          backgroundRepeat: background.image?.repeat || "no-repeat",
          backgroundColor: bgColor,
        };
      }
      
      return {
        backgroundImage: background.image?.url ? `url('${background.image.url}')` : 'none',
        backgroundSize: background.image?.size || "cover",
        backgroundPosition: background.image?.position || "center",
        backgroundRepeat: background.image?.repeat || "no-repeat",
        backgroundColor: bgColor,
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
        className="flex justify-center gap-4 flex-wrap"
        style={{
          gap: theme.spacing.gap,
        }}
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
              className="transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
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
              <IconComponent className="size-8 xl:size-8" />
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <div className={isPersonalizar ? "w-full h-auto rounded-lg" 
                                   : "w-full xl:w-1/3 xl:rounded-lg max-w-full h-screen xl:h-auto"}
    style={{
      ...getBackgroundStyle(),
    }}>
      {/* Vista previa del perfil */}
      <div
        className={`rounded-lg transition-all w-full overflow-hidden scale-90 sm:scale-95 md:scale-100 ${getLayoutStyles()}`}
        style={{
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
          className=""
          style={{
            textAlign: getTextAlignment() as any,
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.gap
          }}
        >
          {displayData.links
            ?.filter((link) => link.isActive)
            .map((link) => (
              <Button
                key={link.id}
                className="transition-all hover:scale-105 py-8"
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