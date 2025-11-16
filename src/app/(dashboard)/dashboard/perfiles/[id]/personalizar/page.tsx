// app/dashboard/perfiles/[id]/personalizar/page.tsx
"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ThemeEditor,
  type ThemeConfig,
} from "@/components/theme-editor/theme-editor";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PersonalizarPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PersonalizarPage({ params }: PersonalizarPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const resolvedParams = use(params);
  const profileId = resolvedParams.id;

  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener token JWT de la sesión
  const getAuthToken = useCallback(async () => {
    return (session as any)?.accessToken;
  }, [session]);

  const [profileData, setProfileData] = useState<{
    nombre: string;
    correo?: string;
    logo_url?: string;
    descripcion?: string;
  } | null>(null);

  // Fetch profile theme by ID
  const fetchProfileTheme = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        setError("No se pudo obtener el token de autenticación");
        return;
      }

      const response = await fetch(`/api/perfiles/${profileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar el perfil");
      }

      const data = await response.json();

      setProfileData({
        nombre: data.perfil.nombre,
        correo: data.perfil.correo,
        logo_url: data.perfil.logo_url,
        descripcion: data.perfil.descripcion,
      });

      // Si el perfil tiene theme_config, lo parseamos
      if (data.perfil.theme_config) {
        try {
          const theme = JSON.parse(data.perfil.theme_config);
          setCurrentTheme(theme);
        } catch (parseError) {
          console.error("Error parsing theme config:", parseError);
        }
      }
    } catch (err) {
      console.error("Error fetching profile theme:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [profileId, getAuthToken]);

  // Función para guardar el tema
  const handleSaveTheme = async (theme: ThemeConfig) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No se pudo obtener el token de autenticación");
      }

      console.log("Guardando tema:", theme);
      console.log("Profile ID:", profileId);

      // Simular guardado hasta que el backend esté listo
      alert("Tema guardado exitosamente (simulado - backend pendiente)");
    } catch (err) {
      console.error("Error saving theme:", err);
      alert(
        "Error al guardar el tema: " +
          (err instanceof Error ? err.message : "Error desconocido")
      );
      throw err;
    }
  };

  useEffect(() => {
    if (session) {
      fetchProfileTheme();
    }
  }, [session, fetchProfileTheme]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Cargando configuración...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center gap-4 max-w-md">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Error al cargar el perfil</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={fetchProfileTheme} variant="outline">
                Intentar de nuevo
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/perfiles/${profileId}`)}
              >
                Volver al perfil
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-background">
      <ThemeEditor
        profileId={profileId}
        initialTheme={currentTheme}
        onSave={handleSaveTheme}
        profileData={profileData}
      />
    </div>
  );
}
