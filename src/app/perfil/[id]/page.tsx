// src/app/perfil/[id]/page.tsx
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { ThemePreview } from "@/components/theme-editor/theme-preview";
import { ThemeConfig } from "@/components/theme-editor/theme-editor";
import { ProfileDeleteAction } from "@/components/profiles/profile-delete-action";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface LinkItem {
  id: string;
  nombre_tarjeta: string;
  link: string;
}

interface ProfileData {
  id: string;
  nombre: string;
  correo?: string;
  logo_url?: string;
  descripcion?: string;
  diseno?: ThemeConfig;
  estado: string;
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

async function getProfileData(profileId: string) {
  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("perfiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return null;
    }

    const { data: links, error: linksError } = await supabaseAdmin
      .from("tarjetas")
      .select("*")
      .eq("perfil_id", profile.id)
      .order("created_at", { ascending: true });

    return {
      profile,
      links: links || [],
    };
  } catch (error) {
    return null;
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params;

  const data = await getProfileData(id);

  if (!data) {
    notFound();
  }

  const { profile, links } = data;

  // Parsear el diseño
  let theme = defaultTheme;
  if (profile.diseno) {
    try {
      theme =
        typeof profile.diseno === "string"
          ? JSON.parse(profile.diseno)
          : profile.diseno;
    } catch (error) {
      // Usar default theme si hay error
    }
  }

  const profileData = {
    nombre: profile.nombre,
    correo: profile.correo,
    logo_url: profile.logo_url,
    descripcion: profile.descripcion,
    links: links.map((link) => ({
      id: link.id,
      name: link.nombre_tarjeta,
      url: link.link,
      isActive: true,
    })),
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <ThemePreview theme={theme} profileData={profileData} />
      
    </div>
  );
}
