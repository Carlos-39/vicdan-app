// src/app/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { ThemePreview } from '@/components/theme-editor/theme-preview';
import { ThemeConfig } from '@/components/theme-editor/theme-editor';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const defaultTheme: ThemeConfig = {
  colors: {
    primary: "#877af7",
    secondary: "#f4f4f5",
    background: "#ffffff",
    text: "#1f2937",
    card: "#877af7",
    cardText: "#ffffff",
  },
  background: {
    type: "color",
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    fontSize: {
      base: "16px",
      heading: "20px",
      cardText: "14px",
    },
  },
  spacing: {
    padding: "24px",
    margin: "16px",
    gap: "16px",
  },
  layout: {
    type: "centered",
    showAvatar: true,
    showSocialLinks: true,
    socialIconsPosition: "above-links",
  },
};

async function getProfileBySlug(slug: string) {
  try {
    // Buscar perfil por slug
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('perfiles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Verificar que el perfil esté activo (no inactivo ni borrador)
    if (profile.estado !== 'activo') {
      return null;
    }

    // Obtener tarjetas del perfil
    const { data: links, error: linksError } = await supabaseAdmin
      .from('tarjetas')
      .select('*')
      .eq('perfil_id', profile.id)
      .order('created_at', { ascending: true });

    return {
      profile,
      links: links || [],
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export default async function PublicProfilePageBySlug({ params }: PageProps) {
  const { slug } = await params;
  
  // Redirigir si el slug no tiene el formato correcto (p_xxxxxxxxxx)
  if (!slug.startsWith('p_')) {
    // Si no es un perfil, deja que Next.js maneje la ruta normalmente
    // Esto evita conflictos con otras rutas como /dashboard, /login, etc.
    notFound();
  }
  
  const data = await getProfileBySlug(slug);

  if (!data) {
    notFound();
  }

  const { profile, links } = data;

  // Parsear el diseño
  let theme = defaultTheme;
  if (profile.diseno) {
    try {
      theme = typeof profile.diseno === 'string' 
        ? JSON.parse(profile.diseno) 
        : profile.diseno;
    } catch (error) {
      console.error('Error parsing theme:', error);
    }
  }
  
  const profileData = {
    nombre: profile.nombre,
    correo: profile.correo,
    logo_url: profile.logo_url,
    descripcion: profile.descripcion,
    socialIcons: (theme as any).socialIcons || [], // ← Incluir socialIcons del diseño
    links: links.map(link => ({
      id: link.id,
      name: link.nombre_tarjeta,
      url: link.link,
      isActive: true
    }))
  };

  console.log(theme);

  // Función para generar el background de la página
  const getPageBackgroundStyle = () => {
    const { background } = theme;

    switch (background?.type) {
      case "gradient":
        // Si tiene gradiente, usarlo
        if (background.gradient?.direction === "circle") {
          return {
            background: `radial-gradient(circle, ${background.gradient.colors?.[0] || theme.colors.primary}, ${background.gradient.colors?.[1] || theme.colors.card})`,
          };
        }
        return {
          background: `linear-gradient(${background.gradient?.direction || "to right"}, ${background.gradient?.colors?.[0] || theme.colors.primary}, ${background.gradient?.colors?.[1] || theme.colors.card})`,
        };

      case "color":
        // Si es color sólido, generar gradiente basado en ese color
        const baseColor = theme.colors.background;
        return {
          background: `linear-gradient(135deg, ${baseColor}, ${theme.colors.primary}20)`,
        };

      case "image":
        // Si es imagen, usar gradiente del color primario
        return {
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.card})`,
        };

      default:
        // Por defecto, usar color de fondo
        return {
          backgroundColor: theme.colors.background,
        };
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        ...getPageBackgroundStyle(),
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <ThemePreview 
        theme={theme} 
        profileData={profileData}
      />
    </div>
  );
}