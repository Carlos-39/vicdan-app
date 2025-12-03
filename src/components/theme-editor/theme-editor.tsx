"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeEditorSkeleton } from "./theme-editor-skeleton";
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
import { LinksManager, LinkItem, SocialIcon } from "./links-manager";
import { Toast, ToastType } from "@/components/ui/toast";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { BackgroundSelector } from "./background-selector";
import { DashboardHeader } from "@/app/(dashboard)/dashboard/components/dashboard-header";
import { BottomNavigation } from "@/app/(dashboard)/dashboard/components/bottom-navigation";

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    card: string;
    cardText: string;
  };
  background: {
    type: "color" | "gradient" | "pattern" | "image";
    gradient?: {
      colors: string[];
      direction: string;
      type: "linear" | "radial";
    };
    pattern?: {
      type: string;
      color: string;
      size: number;
      opacity: number;
    };
    image?: {
      url: string;
      position: string;
      size: "cover" | "contain" | "auto";
      repeat: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
      opacity: number;
      blur: number;
    };
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
    socialIconsPosition: "above-links" | "below-links" | "both";
  };
  socialIcons?: SocialIcon[];
}

const defaultTheme: ThemeConfig = {
  colors: {
    primary: "#877af7",
    secondary: "#000000",
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
    socialIconsPosition: "above-links", // VALOR POR DEFECTO
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
    socialIcons?: SocialIcon[];
  } | null;
  onProfileUpdate?: (data: any) => void;
}

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
  const { data: session, status } = useSession();
  const [theme, setTheme] = useState<ThemeConfig>({
    ...defaultTheme,
    ...initialTheme,
  });
  const [socialIcons, setSocialIcons] = useState<SocialIcon[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: ToastType;
  }>({
    isVisible: false,
    message: "",
    type: "success",
  });

  const themeRef = useRef(theme);
  const localProfileDataRef = useRef(profileData);

  const defaultProfileData = {
    nombre: "Vicdan App",
    correo: "vicdanapp@gmail.com",
    logo_url: "",
    descripcion: "",
    links: [],
    socialIcons: [],
  };

  const [localProfileData, setLocalProfileData] = useState(() => ({
    ...defaultProfileData,
    ...profileData,
    socialIcons: profileData?.socialIcons || [],
  }));

  const loadExistingTheme = async (): Promise<ThemeConfig | null> => {
    try {
      if (!session?.accessToken) {
        return null;
      }

      const response = await fetch(`/api/perfiles/${profileId}/diseno`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (response.ok) {
        const themeData = await response.json();

        if (themeData.diseno) {
          let existingTheme = themeData.diseno;

          if (typeof existingTheme === "string") {
            try {
              existingTheme = JSON.parse(existingTheme);
            } catch (parseError) {
              return null;
            }
          }

          const mergedTheme: ThemeConfig = {
            colors: { ...defaultTheme.colors, ...existingTheme.colors },
            background: { ...defaultTheme.background, ...existingTheme.background },
            typography: {
              ...defaultTheme.typography,
              ...existingTheme.typography,
            },
            spacing: { ...defaultTheme.spacing, ...existingTheme.spacing },
            layout: { ...defaultTheme.layout, ...existingTheme.layout },
          };

          // Cargar socialIcons si existen
          if (existingTheme.socialIcons) {
            setSocialIcons(existingTheme.socialIcons);
            setLocalProfileData((prev) => ({
              ...prev,
              socialIcons: existingTheme.socialIcons,
            }));
          }

          return mergedTheme;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme as ThemeConfig);
      // Cargar socialIcons si existen en el diseño guardado
      if ((initialTheme as any).socialIcons) {
        setSocialIcons((initialTheme as any).socialIcons);
      }
    }
  }, [initialTheme]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (status === "authenticated" && session?.accessToken) {
        setIsLoading(true);

        const existingTheme = await loadExistingTheme();
        if (existingTheme) {
          setTheme(existingTheme);
        }

        try {
          const profileResponse = await fetch(`/api/perfiles/${profileId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setLocalProfileData((prev) => ({
              ...prev,
              nombre: profileData.perfil?.nombre || prev.nombre,
              correo: profileData.perfil?.correo || prev.correo,
              logo_url: profileData.perfil?.logo_url || prev.logo_url,
              descripcion: profileData.perfil?.descripcion || prev.descripcion,
            }));
          }
        } catch (error) {
          // Error silencioso al cargar datos del perfil
        }

        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [status, session?.accessToken, profileId]);

  useEffect(() => {
    const loadExistingLinks = async () => {
      try {
        if (status === "loading") return;

        if (status === "unauthenticated" || !session?.accessToken) {
          return;
        }

        const response = await fetch(`/api/perfiles/${profileId}/tarjetas`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (response.ok) {
          const existingLinks = await response.json();
          const formattedLinks: LinkItem[] = existingLinks.map((link: any) => ({
            id: link.id,
            name: link.nombre_tarjeta,
            url: link.link,
            isActive: true,
          }));

          setLocalProfileData((prev) => ({
            ...prev,
            links: formattedLinks,
          }));
        }
      } catch (error) {
        // Error silencioso al cargar enlaces
      }
    };

    loadExistingLinks();
  }, [profileId, session?.accessToken, status]);

  useEffect(() => {
    themeRef.current = theme;
    localProfileDataRef.current = localProfileData;
  }, [theme, localProfileData]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      setToast({ isVisible: true, message, type });
    },
    []
  );

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

  const saveThemeToBackend = async (
    themeData: ThemeConfig
  ): Promise<boolean> => {
    try {
      console.log("Guardando tema...", themeData);
      if (status === "loading") {
        throw new Error("Sesión aún cargando...");
      }

      if (status === "unauthenticated" || !session) {
        throw new Error("No hay sesión activa - Por favor inicia sesión");
      }

      if (!session.accessToken) {
        throw new Error("Token de acceso no disponible en la sesión");
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
        const errorData = await response
          .json()
          .catch(() => ({ error: "Error desconocido" }));
        throw new Error(
          errorData.error || `Error ${response.status} al guardar el tema`
        );
      }

      await response.json();
      return true;
    } catch (error: any) {
      if (error.details) {
        // Error de validación Zod
      }
      throw new Error(error.message || "Error al guardar el tema");
    }
  };

  const saveLinksToBackend = async (links: LinkItem[]): Promise<boolean> => {
    try {
      if (status === "loading") {
        throw new Error("Sesión aún cargando...");
      }

      if (status === "unauthenticated" || !session) {
        throw new Error("No hay sesión activa");
      }

      if (!session.accessToken) {
        throw new Error("Token de acceso no disponible");
      }

      const existingLinksResponse = await fetch(
        `/api/perfiles/${profileId}/tarjetas`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      let existingLinks: any[] = [];
      if (existingLinksResponse.ok) {
        existingLinks = await existingLinksResponse.json();
      }

      const linksToDelete = existingLinks.filter(
        (existingLink) =>
          !links.some((newLink) => newLink.id === existingLink.id)
      );

      const linksToCreate = links.filter(
        (link) =>
          !link.id ||
          link.id.startsWith("temp-") ||
          !existingLinks.some((existingLink) => existingLink.id === link.id)
      );

      const linksToUpdate = links.filter(
        (link) =>
          link.id &&
          !link.id.startsWith("temp-") &&
          existingLinks.some((existingLink) => existingLink.id === link.id)
      );

      const deletePromises = linksToDelete.map(async (linkToDelete) => {
        const response = await fetch(
          `/api/perfiles/${profileId}/tarjetas/${linkToDelete.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
          throw new Error(`Error eliminando tarjeta: ${errorData.error || response.statusText}`);
        }

        return response;
      });

      const createPromises = linksToCreate.map(async (link) => {
        const response = await fetch(`/api/perfiles/${profileId}/tarjetas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            nombre_tarjeta: link.name,
            link: link.url,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
          throw new Error(`Error creando tarjeta: ${errorData.error || response.statusText}`);
        }

        return response;
      });

      const updatePromises = linksToUpdate.map(async (link) => {
        const response = await fetch(
          `/api/perfiles/${profileId}/tarjetas/${link.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({
              nombre_tarjeta: link.name,
              link: link.url,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
          throw new Error(`Error actualizando tarjeta: ${errorData.error || response.statusText}`);
        }

        return response;
      });

      await Promise.all([
        ...deletePromises,
        ...createPromises,
        ...updatePromises,
      ]);

      return true;
    } catch (error) {
      console.error("Error detallado al guardar enlaces:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al guardar los enlaces";
      throw new Error(errorMessage);
    }
  };

  const saveProfileToBackend = async (profileData: any): Promise<boolean> => {
    try {
      if (status === "loading") {
        throw new Error("Sesión aún cargando...");
      }

      if (status === "unauthenticated" || !session) {
        throw new Error("No hay sesión activa");
      }

      if (!session.accessToken) {
        throw new Error("Token de acceso no disponible");
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

      return true;
    } catch (error) {
      throw error;
    }
  };

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

  const debouncedAutoSave = useDebounce(performAutoSave, 500);

  useEffect(() => {
    const savedData = localStorage.getItem(`vicdan-editor-${profileId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        showRestoreDialog().then((shouldRestore) => {
          if (shouldRestore) {
            setTheme(parsed.theme);
            setLocalProfileData((prev) => ({
              ...prev,
              ...parsed.profileData,
              links: parsed.profileData?.links || prev.links,
            }));
            setHasUnsavedChanges(true);
            showToast("Cambios anteriores restaurados", "success");
          } else {
            localStorage.removeItem(`vicdan-editor-${profileId}`);
            showToast("Comenzando con configuración nueva", "info");
          }
        });
      } catch (error) {
        // No hay datos temporales para restaurar
      }
    }
  }, [profileId, showToast]);

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

  // FUNCIÓN handleBack FALTANTE - LA AGREGAMOS
  const handleBack = async () => {
    if (hasUnsavedChanges) {
      const userChoice = await showConfirmationDialog(
        "¿Guardar cambios?",
        "Tienes cambios sin guardar. ¿Qué quieres hacer antes de salir?",
        "Guardar y salir",
        "Descartar y salir"
      );

      if (userChoice) {
        await handleSave();
      } else {
        clearTempStorage();
        showToast("Cambios descartados", "warning");
      }
    }
    router.back();
  };

  const handleSocialIconsChange = (updatedSocialIcons: SocialIcon[]) => {
    setSocialIcons(updatedSocialIcons);
    const updatedData = { ...localProfileData, socialIcons: updatedSocialIcons };
    setLocalProfileData(updatedData);
    setHasUnsavedChanges(true);
    onProfileUpdate?.(updatedData);
    debouncedAutoSave();
  };

  // FUNCIÓN clearTempStorage FALTANTE - LA AGREGAMOS
  const clearTempStorage = () => {
    localStorage.removeItem(`vicdan-editor-${profileId}`);
  };

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
    debouncedAutoSave();
  };

  const handleLinksUpdate = (links: LinkItem[]) => {
    const updatedData = { ...localProfileData, links };
    setLocalProfileData(updatedData);
    setHasUnsavedChanges(true);
    onProfileUpdate?.(updatedData);
    debouncedAutoSave();
  };

  // FUNCIÓN handleSave FALTANTE - LA AGREGAMOS
  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaving(true);
    setError(null);

    try {
      if (status === "unauthenticated" || !session?.accessToken) {
        throw new Error("No hay sesión activa - Por favor inicia sesión");
      }

      // 1. Guardar el tema con socialIcons incluidos
      const themeToSave = {
        ...theme,
        socialIcons: socialIcons,
      };

      const themeSuccess = await saveThemeToBackend(themeToSave as ThemeConfig);
      if (!themeSuccess) {
        throw new Error("Error al guardar el tema");
      }

      // 2. Guardar los enlaces
      const linksSuccess = await saveLinksToBackend(localProfileData.links || []);
      if (!linksSuccess) {
        throw new Error("Error al guardar los enlaces");
      }

      // 3. Guardar datos del perfil
      const profileSuccess = await saveProfileToBackend(localProfileData);
      if (!profileSuccess) {
        throw new Error("Error al guardar el perfil");
      }

      // Éxito total
      clearTempStorage();
      setHasUnsavedChanges(false);
      showToast("✅ Todos los cambios guardados correctamente", "success");

      if (onSave) {
        onSave(themeToSave as ThemeConfig);
      }

      setSuccessMessage("Diseño guardado correctamente");

      // Redirigir a la página anterior después de un breve delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error("Error completo al guardar:", error);
      setError(error.message || "Error al guardar los cambios");
      showToast(`❌ ${error.message || "Error al guardar"}`, "error");
    } finally {
      setIsSaving(false);
      setSaving(false);
    }
  };

  if (isLoading) {
    return <ThemeEditorSkeleton />;
  }

  return (
    <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        duration={4000}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Personalizar Diseño
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
              Personaliza la apariencia de tu perfil público
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-xs sm:text-sm text-amber-600 font-medium">
                  • Tienes cambios sin guardar
                </span>
              )}
              {status === "unauthenticated" && (
                <span className="text-xs sm:text-sm text-red-600 font-medium">
                  • No autenticado
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={handleSave}
            disabled={
              !hasUnsavedChanges || isSaving || status === "unauthenticated"
            }
            size="sm"
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Save className="size-4 shrink-0" />
            <span className="whitespace-nowrap">
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="overflow-hidden gap-1">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <Palette className="size-4 sm:size-5 shrink-0" />
                Editor de Tema
              </CardTitle>
            </CardHeader>

            <CardContent className="p-3 sm:p-4 md:p-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-3"
              >
                <TabsList className="mb-4 flex flex-nowrap gap-0 sm:gap-1 w-full overflow-x-auto py-0 sm:py-1 min-h-[56px] sm:min-h-[60px] items-center border-b bg-transparent rounded-none scrollbar-hide">
                  <TabsTrigger
                    value="colors"
                    className="flex items-center justify-center gap-0 sm:gap-2 py-3 sm:py-2 px-0 sm:px-3 min-w-0 sm:min-w-0 flex-1 sm:flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    title="Colores"
                  >
                    <Palette className="size-6 sm:size-4 shrink-0" />
                    <span className="hidden sm:inline text-xs sm:text-sm ml-0 sm:ml-1.5">Colores</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="layout"
                    className="flex items-center justify-center gap-0 sm:gap-2 py-3 sm:py-2 px-0 sm:px-3 min-w-0 sm:min-w-0 flex-1 sm:flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    title="Layout"
                  >
                    <Layout className="size-6 sm:size-4 shrink-0" />
                    <span className="hidden sm:inline text-xs sm:text-sm ml-0 sm:ml-1.5">Layout</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="typography"
                    className="flex items-center justify-center gap-0 sm:gap-2 py-3 sm:py-2 px-0 sm:px-3 min-w-0 sm:min-w-0 flex-1 sm:flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    title="Tipografía"
                  >
                    <Type className="size-6 sm:size-4 shrink-0" />
                    <span className="hidden sm:inline text-xs sm:text-sm ml-0 sm:ml-1.5">Tipografía</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="spacing"
                    className="flex items-center justify-center gap-0 sm:gap-2 py-3 sm:py-2 px-0 sm:px-3 min-w-0 sm:min-w-0 flex-1 sm:flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    title="Espaciado"
                  >
                    <Settings className="size-6 sm:size-4 shrink-0" />
                    <span className="hidden sm:inline text-xs sm:text-sm ml-0 sm:ml-1.5">Espaciado</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="links"
                    className="flex items-center justify-center gap-0 sm:gap-2 py-3 sm:py-2 px-0 sm:px-3 min-w-0 sm:min-w-0 flex-1 sm:flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    title="Enlaces"
                  >
                    <Link className="size-6 sm:size-4 shrink-0" />
                    <span className="hidden sm:inline text-xs sm:text-sm ml-0 sm:ml-1.5">Enlaces</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-3 mt-3">
                  <ColorPicker
                    colors={theme.colors}
                    onChange={(colors) => updateTheme({ colors })}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Fondo Avanzado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BackgroundSelector
                        background={theme.background}
                        onChange={(background) => updateTheme({ background })}
                      />
                    </CardContent>
                  </Card>
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
                    theme={theme}
                    onThemeUpdate={updateTheme}
                    socialIcons={localProfileData.socialIcons || []}
                    onSocialIconsChange={handleSocialIconsChange}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="overflow-hidden h-full">
            <CardHeader className="pb-3 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <Eye className="size-4 sm:size-5 shrink-0" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-w-full overflow-auto">
                <div className="min-h-[300px] sm:min-h-[400px] md:min-h-[500px] flex items-center justify-center p-3 sm:p-4 md:p-6">
                  <ThemePreview
                    theme={theme}
                    profileData={{
                      ...localProfileData,
                      socialIcons: localProfileData.socialIcons || [],
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

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
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
