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
import { LinksManager, LinkItem, SocialIcon } from "./links-manager";
import { Toast, ToastType } from "@/components/ui/toast";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { BackgroundSelector } from "./background-selector";

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

          return mergedTheme;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

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

      const deletePromises = linksToDelete.map((linkToDelete) =>
        fetch(`/api/perfiles/${profileId}/tarjetas/${linkToDelete.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
      );

      const createPromises = linksToCreate.map((link) =>
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
          const errorData = await response.json();
          throw new Error(`Error actualizando tarjeta: ${errorData.error}`);
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
      throw new Error("Error al guardar los enlaces");
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

  const handleSocialIconsChange = (socialIcons: SocialIcon[]) => {
    const updatedData = { ...localProfileData, socialIcons };
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
    if (status === "unauthenticated" || !session?.accessToken) {
      Swal.fire({
        title: "Error de autenticación",
        text: "No se pudo verificar tu sesión. Por favor, recarga la página e inicia sesión nuevamente.",
        icon: "error",
        confirmButtonText: "Entendido",
      });
      return;
    }

    setIsSaving(true);

    try {
      Swal.fire({
        title: "Guardando cambios...",
        text: "Por favor espera mientras guardamos tu configuración",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const saveOperations = [];

      saveOperations.push(saveThemeToBackend(theme));
      saveOperations.push(saveProfileToBackend(localProfileData));

      if (localProfileData.links && localProfileData.links.length > 0) {
        saveOperations.push(saveLinksToBackend(localProfileData.links));
      }

      await Promise.all(saveOperations);

      setHasUnsavedChanges(false);
      clearTempStorage();

      Swal.close();
      showToast("Cambios guardados exitosamente", "success");

      onSave?.(theme);
      onProfileUpdate?.(localProfileData);
    } catch (error) {
      Swal.close();

      await Swal.fire({
        title: "Error al guardar",
        text: "Ha ocurrido un error al intentar guardar los cambios en el servidor. Por favor, intenta nuevamente.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#877af7",
      });

      showToast("Error al guardar los cambios", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">
            Cargando configuración existente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        duration={4000}
      />

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
              {status === "unauthenticated" && (
                <span className="ml-2 text-red-600 font-medium">
                  • No autenticado
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <Button
            onClick={handleSave}
            disabled={
              !hasUnsavedChanges || isSaving || status === "unauthenticated"
            }
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Fondo Avanzado</CardTitle>
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
      `}</style>
    </div>
  );
}
