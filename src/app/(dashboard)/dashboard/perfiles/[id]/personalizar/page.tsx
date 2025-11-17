// app/dashboard/perfiles/[id]/personalizar/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  ThemeEditor,
  type ThemeConfig,
} from "@/components/theme-editor/theme-editor";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PersonalizarPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const params = useParams();
  const profileId = params.id as string;

  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [profileData, setProfileData] = useState<{
    nombre: string;
    correo?: string;
    logo_url?: string;
    descripcion?: string;
  } | null>(null);

  // ✅ CORREGIDO: Fetch profile theme by ID - solo una vez
  const fetchProfileTheme = useCallback(async () => {
    // Evitar múltiples llamadas
    if (hasLoaded) return;

    try {
      setLoading(true);
      setError(null);

      if (!session?.accessToken) {
        setError("No se pudo obtener el token de autenticación");
        return;
      }

      console.log("🔍 Fetching profile data for ID:", profileId);

      const response = await fetch(`/api/perfiles/${profileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar el perfil");
      }

      const data = await response.json();
      console.log("📦 Profile data received:", data);

      setProfileData({
        nombre: data.perfil.nombre,
        correo: data.perfil.correo,
        logo_url: data.perfil.logo_url,
        descripcion: data.perfil.descripcion,
      });

      // ✅ CORREGIDO: Buscar en el campo correcto 'diseno'
      if (data.perfil.diseno) {
        try {
          console.log("🎨 Found design data:", data.perfil.diseno);

          const theme =
            typeof data.perfil.diseno === "string"
              ? JSON.parse(data.perfil.diseno)
              : data.perfil.diseno;

          console.log("🎨 Parsed theme:", theme);
          setCurrentTheme(theme);
        } catch (parseError) {
          console.error("❌ Error parsing design config:", parseError);
          setCurrentTheme(undefined);
        }
      } else {
        console.log("ℹ️ No design data found, using default theme");
        setCurrentTheme(undefined);
      }

      setHasLoaded(true);
    } catch (err) {
      console.error("❌ Error fetching profile theme:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [profileId, session?.accessToken, hasLoaded]);

  // ✅ CORREGIDO: Función para guardar el tema
  const handleSaveTheme = async (theme: ThemeConfig) => {
    try {
      console.log("💾 Theme saved callback:", theme);
      setCurrentTheme(theme);
    } catch (err) {
      console.error("❌ Error in handleSaveTheme:", err);
      throw err;
    }
  };

  // ✅ CORREGIDO: Manejo de actualización del perfil
  const handleProfileUpdate = useCallback((updatedData: any) => {
    console.log("👤 Profile updated:", updatedData);
    setProfileData((prev) => ({
      ...prev,
      ...updatedData,
    }));
  }, []);

  // ✅ CORREGIDO: useEffect simplificado - solo cargar una vez
  useEffect(() => {
    if (session?.accessToken && profileId && !hasLoaded) {
      fetchProfileTheme();
    }
  }, [session?.accessToken, profileId, hasLoaded, fetchProfileTheme]);

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
              <Button
                onClick={() => {
                  setHasLoaded(false);
                  setError(null);
                  fetchProfileTheme();
                }}
                variant="outline"
              >
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
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}