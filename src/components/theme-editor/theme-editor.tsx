"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Save,
  Eye,
  Palette,
  Layout,
  Type,
  Settings,
  ArrowLeft,
  Link,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LayoutSelector } from "./layout-selector";
import { ColorPicker } from "./color-picker";
import { FontSelector } from "./font-selector";
import { SpacingControls } from "./spacing-controls";
import { ThemePreview } from "./theme-preview";
import { LinksManager, LinkItem } from "../ui/links-manager";
import { Toast, ToastType } from "@/components/ui/toast";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    card: string;
    cardText: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      heading: string;
      cardText: string;
    };
  };
  spacing: {
    padding: string;
    margin: string;
    gap: string;
  };
  layout: {
    type:
      | "centered"
      | "left-aligned"
      | "right-aligned"
      | "justified"
      | "card"
      | "minimal";
    showAvatar: boolean;
    showSocialLinks: boolean;
    textAlignment?: "left" | "center" | "right" | "justify";
  };
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
  },
};

interface ThemeEditorProps {
  profileId: string;
  initialTheme?: Partial<ThemeConfig>;
  onSave?: (theme: ThemeConfig) => void;
  profileData?: {
    nombre: string;
    correo?: string;
    logo_url?: string;
    descripcion?: string;
    links?: LinkItem[];
  } | null;
  onProfileUpdate?: (data: any) => void;
}

// ✅ Función debounce para optimizar el auto-guardado
function useDebounce(callback: Function, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

export function ThemeEditor({
  profileId,
  initialTheme,
  onSave,
  profileData,
  onProfileUpdate,
}: ThemeEditorProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [theme, setTheme] = useState<ThemeConfig>({
    ...defaultTheme,
    ...initialTheme,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Estado para las notificaciones Toast
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: ToastType;
  }>({
    isVisible: false,
    message: "",
    type: "success",
  });

  // Usar useRef para los datos actuales (evita dependencias en useCallback)
  const themeRef = useRef(theme);
  const localProfileDataRef = useRef(profileData);

  // Estado local para manejar los datos del perfil
  const defaultProfileData = {
    nombre: "Vicdan App",
    correo: "vicdanapp@gmail.com",
    logo_url: "",
    descripcion: "",
    links: [],
  };

  const [localProfileData, setLocalProfileData] = useState(() => ({
    ...defaultProfileData,
    ...profileData,
  }));

  // ✅ ACTUALIZAR las refs cuando cambien los estados
  useEffect(() => {
    themeRef.current = theme;
    localProfileDataRef.current = localProfileData;
  }, [theme, localProfileData]);

  // ✅ FUNCIÓN para mostrar Toast
  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      setToast({ isVisible: true, message, type });
    },
    []
  );

  // ✅ FUNCIÓN para mostrar diálogo de confirmación con SweetAlert
  const showConfirmationDialog = async (
    title: string,
    text: string,
    confirmButtonText: string,
    cancelButtonText: string
  ): Promise<boolean> => {
    const result = await Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      confirmButtonColor: "#877af7",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      customClass: {
        popup: "sweet-alert-popup",
        confirmButton: "sweet-alert-confirm",
        cancelButton: "sweet-alert-cancel",
      },
    });

    return result.isConfirmed;
  };

  // ✅ FUNCIÓN para mostrar diálogo de restauración con SweetAlert
  const showRestoreDialog = async (): Promise<boolean> => {
    const result = await Swal.fire({
      title: "¿Restaurar cambios?",
      html: `
        <div class="text-left">
          <p class="mb-3">Tienes cambios no guardados de una sesión anterior.</p>
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
            <p class="text-amber-800 font-medium">⚠️ Cambios pendientes:</p>
            <ul class="list-disc list-inside mt-1 text-amber-700">
              <li>Configuración de tema personalizada</li>
              <li>Enlaces y contenido actualizado</li>
            </ul>
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "No, empezar nuevo",
      confirmButtonColor: "#877af7",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      customClass: {
        popup: "sweet-alert-popup",
        confirmButton: "sweet-alert-confirm",
        cancelButton: "sweet-alert-cancel",
      },
    });

    return result.isConfirmed;
  };

  // ✅ FUNCIÓN para guardar el tema en el backend
  const saveThemeToBackend = async (
    themeData: ThemeConfig
  ): Promise<boolean> => {
    try {
      if (!session?.accessToken) {
        throw new Error("No hay sesión activa");
      }

      const response = await fetch(`/api/perfiles/${profileId}/diseno`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(themeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el tema");
      }

      const result = await response.json();
      console.log("✅ Tema guardado en backend:", result);
      return true;
    } catch (error) {
      console.error("❌ Error guardando tema en backend:", error);
      throw error;
    }
  };

  // ✅ FUNCIÓN para guardar los enlaces en el backend
  const saveLinksToBackend = async (links: LinkItem[]): Promise<boolean> => {
    try {
      if (!session?.accessToken) {
        throw new Error("No hay sesión activa");
      }

      // Primero obtener enlaces existentes para saber cuáles eliminar/actualizar
      const existingLinksResponse = await fetch(
        `/api/perfiles/${profileId}/tarjetas`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (existingLinksResponse.ok) {
        const existingLinks = await existingLinksResponse.json();

        // Eliminar enlaces existentes (estrategia simple: eliminar todos y recrear)
        const deletePromises = existingLinks.map((link: any) =>
          fetch(`/api/perfiles/${profileId}/tarjetas/${link.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          })
        );

        await Promise.all(deletePromises);
      }

      // Crear los nuevos enlaces
      const createPromises = links.map((link) =>
        fetch(`/api/perfiles/${profileId}/tarjetas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            nombre_tarjeta: link.name,
            link: link.url,
          }),
        })
      );

      const results = await Promise.all(createPromises);
      const allSuccessful = results.every((response) => response.ok);

      if (!allSuccessful) {
        throw new Error("Error al guardar algunos enlaces");
      }

      console.log("✅ Enlaces guardados en backend");
      return true;
    } catch (error) {
      console.error("❌ Error guardando enlaces en backend:", error);
      throw error;
    }
  };

  // ✅ FUNCIÓN para guardar el perfil en el backend
  const saveProfileToBackend = async (profileData: any): Promise<boolean> => {
    try {
      if (!session?.accessToken) {
        throw new Error("No hay sesión activa");
      }

      const response = await fetch(`/api/perfiles/${profileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          nombre: profileData.nombre,
          correo: profileData.correo,
          logo_url: profileData.logo_url,
          descripcion: profileData.descripcion || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el perfil");
      }

      console.log("✅ Perfil guardado en backend");
      return true;
    } catch (error) {
      console.error("❌ Error guardando perfil en backend:", error);
      throw error;
    }
  };

  // ✅ FUNCIÓN de auto-guardado
  const performAutoSave = useCallback(() => {
    if (!hasUnsavedChanges) return;

    const tempData = {
      theme: themeRef.current,
      profileData: localProfileDataRef.current,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(
      `vicdan-editor-${profileId}`,
      JSON.stringify(tempData)
    );
  }, [hasUnsavedChanges, profileId]);

  // ✅ AUTO-GUARDADO con DEBOUNCE (500ms después del último cambio)
  const debouncedAutoSave = useDebounce(performAutoSave, 500);

  // ✅ Cargar datos temporales al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem(`vicdan-editor-${profileId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        // ✅ NUEVO: Usar SweetAlert en lugar de confirm nativo
        showRestoreDialog().then((shouldRestore) => {
          if (shouldRestore) {
            setTheme(parsed.theme);
            setLocalProfileData(parsed.profileData);
            setHasUnsavedChanges(true);
            showToast("Cambios anteriores restaurados", "success");
          } else {
            localStorage.removeItem(`vicdan-editor-${profileId}`);
            showToast("Comenzando con configuración nueva", "info");
          }
        });
      } catch (error) {
        console.log("No hay datos temporales para restaurar");
      }
    }
  }, [profileId, showToast]);

  // ✅ Confirmación antes de salir sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // ✅ Manejar navegación con OPCIONES de guardar/descartar usando SweetAlert
  const handleBack = async () => {
    if (hasUnsavedChanges) {
      const userChoice = await showConfirmationDialog(
        "¿Guardar cambios?",
        "Tienes cambios sin guardar. ¿Qué quieres hacer antes de salir?",
        "Guardar y salir",
        "Descartar y salir"
      );

      if (userChoice) {
        // Usuario quiere GUARDAR y salir
        await handleSave();
      } else {
        // Usuario quiere DESCARTAR cambios y salir
        clearTempStorage();
        showToast("Cambios descartados", "warning");
      }
    }
    router.back();
  };

  // ✅ Limpiar almacenamiento temporal
  const clearTempStorage = () => {
    localStorage.removeItem(`vicdan-editor-${profileId}`);
  };

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
    // ✅ AUTO-GUARDADO INMEDIATO con debounce
    debouncedAutoSave();
  };

  const handleLinksUpdate = (links: LinkItem[]) => {
    const updatedData = { ...localProfileData, links };
    setLocalProfileData(updatedData);
    setHasUnsavedChanges(true);
    onProfileUpdate?.(updatedData);
    // ✅ AUTO-GUARDADO INMEDIATO con debounce
    debouncedAutoSave();
  };

  // ✅ GUARDADO DEFINITIVO (ACTUALIZADO para usar el backend)
  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Mostrar loading con SweetAlert
      Swal.fire({
        title: "Guardando cambios...",
        text: "Por favor espera mientras guardamos tu configuración",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      console.log("🎯 GUARDANDO EN BACKEND:");
      console.log("📦 Tema completo:", JSON.stringify(theme, null, 2));
      console.log(
        "👤 Perfil completo:",
        JSON.stringify(localProfileData, null, 2)
      );

      // ✅ GUARDAR EN BACKEND - Ejecutar todas las operaciones
      const saveOperations = [];

      // 1. Guardar tema de diseño
      saveOperations.push(saveThemeToBackend(theme));

      // 2. Guardar enlaces si existen
      if (localProfileData.links && localProfileData.links.length > 0) {
        saveOperations.push(saveLinksToBackend(localProfileData.links));
      }

      // 3. Guardar datos del perfil
      saveOperations.push(saveProfileToBackend(localProfileData));

      // Esperar a que todas las operaciones se completen
      await Promise.all(saveOperations);

      // ✅ Limpiar cambios temporales
      setHasUnsavedChanges(false);
      clearTempStorage();

      // Cerrar loading y mostrar éxito
      Swal.close();
      showToast("✅ Cambios guardados exitosamente en el servidor", "success");

      // ✅ Llamar callbacks para actualizar estado local
      onSave?.(theme);
      onProfileUpdate?.(localProfileData);
    } catch (error) {
      console.error("Error al guardar los cambios en el backend:", error);

      // Cerrar loading y mostrar error
      Swal.close();

      // Mostrar diálogo de error con SweetAlert
      await Swal.fire({
        title: "Error al guardar",
        text: "Ha ocurrido un error al intentar guardar los cambios en el servidor. Por favor, intenta nuevamente.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#877af7",
      });

      showToast("❌ Error al guardar los cambios en el servidor", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* ✅ Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        duration={4000}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="hidden sm:flex"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Personalizar Diseño
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Personaliza la apariencia de tu perfil público
              {hasUnsavedChanges && (
                <span className="ml-2 text-amber-600 font-medium">
                  • Tienes cambios sin guardar
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Save className="size-3 sm:size-4" />
            <span className="ml-2">
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </span>
          </Button>
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Palette className="size-4 sm:size-5" />
                Editor de Tema
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-3"
              >
                <TabsList className="flex flex-nowrap gap-1 w-full overflow-hidden py-4 min-h-[60px] items-center border-b">
                  <TabsTrigger
                    value="colors"
                    className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-3 px-3 min-w-0 flex-1 whitespace-nowrap h-auto"
                  >
                    <Palette className="size-4 sm:size-4 shrink-0" />
                    <span>Colores</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="layout"
                    className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-3 px-3 min-w-0 flex-1 whitespace-nowrap h-auto"
                  >
                    <Layout className="size-4 sm:size-4 shrink-0" />
                    <span>Layout</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="typography"
                    className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-3 px-3 min-w-0 flex-1 whitespace-nowrap h-auto"
                  >
                    <Type className="size-4 sm:size-4 shrink-0" />
                    <span className="hidden xs:inline">Tipografía</span>
                    <span className="xs:hidden">Texto</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="spacing"
                    className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-3 px-3 min-w-0 flex-1 whitespace-nowrap h-auto"
                  >
                    <Settings className="size-4 sm:size-4 shrink-0" />
                    <span className="hidden xs:inline">Espaciado</span>
                    <span className="xs:hidden">Espacio</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="links"
                    className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-3 px-3 min-w-0 flex-1 whitespace-nowrap h-auto"
                  >
                    <Link className="size-4 sm:size-4 shrink-0" />
                    <span>Enlaces</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-3 mt-3">
                  <ColorPicker
                    colors={theme.colors}
                    onChange={(colors) => updateTheme({ colors })}
                  />
                </TabsContent>

                <TabsContent value="layout" className="space-y-3 mt-3">
                  <LayoutSelector
                    layout={theme.layout}
                    onChange={(layout) => updateTheme({ layout })}
                  />
                </TabsContent>

                <TabsContent value="typography" className="space-y-3 mt-3">
                  <FontSelector
                    typography={theme.typography}
                    onChange={(typography) => updateTheme({ typography })}
                  />
                </TabsContent>

                <TabsContent value="spacing" className="space-y-3 mt-3">
                  <SpacingControls
                    spacing={theme.spacing}
                    onChange={(spacing) => updateTheme({ spacing })}
                  />
                </TabsContent>

                <TabsContent value="links" className="space-y-3 mt-3">
                  <LinksManager
                    links={localProfileData.links || []}
                    onChange={handleLinksUpdate}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1">
          <Card className="overflow-hidden h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Eye className="size-4 sm:size-5" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-w-full overflow-auto">
                <div className="min-h-[400px] sm:min-h-[500px] flex items-center justify-center p-3 sm:p-4">
                  <ThemePreview theme={theme} profileData={localProfileData} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ✅ Estilos personalizados para SweetAlert */}
      <style jsx global>{`
        .sweet-alert-popup {
          font-family: "Inter", sans-serif;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }
        .sweet-alert-confirm {
          border-radius: 8px;
          font-weight: 600;
          padding: 10px 24px;
        }
        .sweet-alert-cancel {
          border-radius: 8px;
          font-weight: 600;
          padding: 10px 24px;
        }
      `}</style>
    </div>
  );
}
