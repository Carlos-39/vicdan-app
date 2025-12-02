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
          background: `linear-gradient(${background.gradient?.direction || "to right"
            }, ${background.gradient?.colors?.[0] || "#877af7"}, ${background.gradient?.colors?.[1] || "#3b82f6"
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



      case "image": {
        const opacity = background.image?.opacity ?? 1;
        const blur = background.image?.blur ?? 0;
        const bgColor = theme.colors.background ?? "#ffffff";

        // Si hay blur > 0, devolvemos solo backgroundColor (la capa borrosa será un DIV absoluto)
        if (blur > 0 && background.image?.url) {
          // Si además quieres una versión no borrosa por detrás, podrías hacer algo distinto.
          return {
            backgroundColor: bgColor,
          };
        }

        // Si no hay blur, manejamos los demás casos (opacidad o normal)
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

        // Caso por defecto sin blur
        return {
          backgroundImage: background.image?.url ? `url('${background.image.url}')` : "none",
          backgroundSize: background.image?.size || "cover",
          backgroundPosition: background.image?.position || "center",
          backgroundRepeat: background.image?.repeat || "no-repeat",
          backgroundColor: bgColor,
        };
      }

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

  // Función para determinar si un color es oscuro o claro
  const isDarkColor = (color: string): boolean => {
    // Si es un color hex
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // Calcular luminosidad relativa
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5; // Si la luminosidad es menor a 0.5, es oscuro
    }

    // Si es rgb/rgba
    if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0]);
        const g = parseInt(matches[1]);
        const b = parseInt(matches[2]);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5;
      }
    }

    // Por defecto, asumir que no es oscuro
    return false;
  };

  // Función para obtener el color de fondo dominante
  const getBackgroundColor = (): string => {
    const { background } = theme;

    switch (background?.type) {
      case "color":
        return theme.colors.background || "#ffffff";
      case "gradient":
        // Usar el primer color del gradiente
        return background.gradient?.colors?.[0] || theme.colors.background || "#ffffff";
      case "pattern":
        return theme.colors.background || "#ffffff";
      case "image":
        return theme.colors.background || "#ffffff";
      default:
        return theme.colors.background || "#ffffff";
    }
  };

  const getLayoutStyles = () => {
    switch (theme.layout.type) {
      case "centered":
        return " text-center";

      case "left-aligned":
        return " text-left";

      case "right-aligned":
        return " text-right";

      case "justified":
        return " text-justify";

      case "card":
        return " bg-card rounded-xl shadow-lg border text-center";

      case "minimal":
        return " text-left";

      default:
        return " text-center";
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

  function darkenColor(hex: string, amount: number): string {
    let color = hex.replace("#", "");
    let num = parseInt(color, 16);

    let r = (num >> 16) - amount;
    let g = ((num >> 8) & 0x00ff) - amount;
    let b = (num & 0x0000ff) - amount;

    r = r < 0 ? 0 : r;
    g = g < 0 ? 0 : g;
    b = b < 0 ? 0 : b;

    return (
      "#" +
      (r << 16 | g << 8 | b)
        .toString(16)
        .padStart(6, "0")
    );
  }


  return (
    <div className={isPersonalizar ?
      "w-full h-auto rounded-lg"
      :
      "w-full sm:min-h-screen xl:min-h-0 xl:h-auto xl:w-1/3 xl:rounded-lg overflow-hidden xl:max-w-4xl"
    }
      style={{
        position: "relative", // importante para los absolute children
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily,
        padding: `calc(${theme.spacing.padding} * 0.8)`,
        gap: theme.spacing.gap,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        ...getBackgroundStyle()
      }}>
      {/* CAPA BORROSA (solo si hay imagen y blur>0) */}
      {theme.background?.type === "image" && theme.background.image?.url && (theme.background.image?.blur ?? 0) > 0 && (() => {
        const blur = theme.background.image.blur; // 0..1
        const maxBlurPx = 24; // ajuste: 24px cuando blur === 1. Cámbialo si quieres más/menos
        const blurPx = Math.round(blur * maxBlurPx * 100) / 100;
        const scale = 1 + Math.min(0.12, blur * 0.12); // escala para ocultar bordes (hasta 1.12)

        // manejar opacidad si la imagen tiene opacity < 1
        const opacity = theme.background.image.opacity ?? 1;
        const bgColor = theme.colors.background ?? "#ffffff";
        const overlayGradient = opacity < 1
          ? `linear-gradient(rgba(${hexToRgb(bgColor).r}, ${hexToRgb(bgColor).g}, ${hexToRgb(bgColor).b}, ${1 - opacity}), rgba(${hexToRgb(bgColor).r}, ${hexToRgb(bgColor).g}, ${hexToRgb(bgColor).b}, ${1 - opacity})), `
          : "";

        return (
          <div
            aria-hidden
            style={{
              borderRadius: "1rem",
              position: "absolute",
              inset: 0,
              zIndex: 0,
              pointerEvents: "none",
              backgroundImage: `${overlayGradient} url('${theme.background.image.url}')`,
              backgroundSize: theme.background.image.size || "cover",
              backgroundPosition: theme.background.image.position || "center",
              backgroundRepeat: theme.background.image.repeat || "no-repeat",
              filter: `blur(${blurPx}px)`,
              transform: `scale(${scale})`,
              // smoothing/performance hints
              willChange: "filter, transform",
            }}
          />
        );
      })()}


      {/* Vista previa del perfil */}
      <div className={`rounded-lg transition-all w-full ${getLayoutStyles()}`}
        style={{
          position: "relative", zIndex: 1, width: "100%",
          color: theme.colors.text,
          fontFamily: theme.typography.fontFamily,
          padding: `calc(${theme.spacing.padding} * 0.8)`,
          gap: theme.spacing.gap,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}>

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
            .map((link) => {
              const hoverColor = darkenColor(theme.colors.card, 20);
              const hoverTextColor = darkenColor(theme.colors.cardText, 20);
              return (
                <Button
                  key={link.id}
                  className="transition-all py-8"
                  style={{
                    backgroundColor: theme.colors.card,
                    color: theme.colors.cardText,
                    border: "none",
                    fontSize: theme.typography.fontSize.cardText,
                    justifyContent: getFlexJustification(),
                    textAlign: getTextAlignment() as any,
                  }}
                  asChild
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = hoverColor;
                    e.currentTarget.style.color = hoverTextColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.card;
                    e.currentTarget.style.color = theme.colors.cardText;
                  }}
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
              )
            })}
        </div>

        {/* Iconos sociales - DEBAJO de los enlaces */}
        {(theme.layout.socialIconsPosition === "below-links" || theme.layout.socialIconsPosition === "both") && (
          <SocialIconsSection position="below" />
        )}

        {/* Marca de agua "Powered by VicDan" - Solo en vista pública */}
        {!isPersonalizar && (() => {
          const bgColor = getBackgroundColor();
          const isDark = isDarkColor(bgColor);
          const textColor = isDark ? "#ffffff" : "#000000";

          return (
            <div
              className="mt-8 pt-6"
              style={{
                textAlign: "center",
              }}
            >
              <p
                className="text-base sm:text-lg font-bold"
                style={{
                  color: textColor,
                  fontSize: "12px",
                  letterSpacing: "1px",
                  opacity: 1,
                  textShadow: isDark ? `0 1px 2px rgba(0,0,0,0.3)` : `0 1px 2px rgba(255,255,255,0.5)`,
                }}
              >
                Powered by <span style={{ color: textColor, fontWeight: 800 }}>VicDan</span>
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}