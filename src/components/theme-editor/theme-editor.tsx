"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Eye, Palette, Layout, Type, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LayoutSelector } from "./layout-selector";
import { ColorPicker } from "./color-picker";
import { FontSelector } from "./font-selector";
import { SpacingControls } from "./spacing-controls";
import { ThemePreview } from "./theme-preview";

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      heading: string;
      subheading: string;
    };
  };
  spacing: {
    padding: string;
    margin: string;
    gap: string;
  };
  layout: {
    type: "centered" | "left-aligned" | "card" | "minimal";
    showAvatar: boolean;
    showSocialLinks: boolean;
  };
}

const defaultTheme: ThemeConfig = {
  colors: {
    primary: "#877af7",
    secondary: "#f4f4f5",
    background: "#ffffff",
    text: "#1f2937",
    accent: "#877af7",
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    fontSize: {
      base: "16px",
      heading: "24px",
      subheading: "18px",
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
  } | null;
  onProfileUpdate?: (data: any) => void;
}

export function ThemeEditor({
  profileId,
  initialTheme,
  onSave,
  profileData,
  onProfileUpdate,
}: ThemeEditorProps) {
  const [theme, setTheme] = useState<ThemeConfig>({
    ...defaultTheme,
    ...initialTheme,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onSave?.(theme);
    setHasUnsavedChanges(false);
  };

  // Datos por defecto para la vista previa
  const defaultProfileData = {
    nombre: "Wilson Zuñiga",
    correo: "testzuniga@gmail.com",
    logo_url: "",
    descripcion: "",
  };

  // Usar profileData o los datos por defecto si es null/undefined
  const previewData = profileData || defaultProfileData;

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header - Mejorado para mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Personalizar Diseño
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Personaliza la apariencia de tu perfil público
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          {hasUnsavedChanges && (
            <span className="text-xs sm:text-sm text-amber-600 text-center sm:text-left">
              Cambios sin guardar
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Save className="size-3 sm:size-4" />
            <span className="ml-2">Guardar</span>
          </Button>
        </div>
      </div>

      {/* Layout principal - Mejorado para mobile y tablet */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Panel de controles - Ocupa todo en mobile, 2/3 en desktop */}
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
                {/* Tabs responsive - Grid de 2 columnas en mobile, 4 en desktop */}
                 <TabsList className="flex flex-nowrap gap-1 w-full overflow-x-auto py-1">
        <TabsTrigger
          value="colors"
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 min-w-0 flex-1 whitespace-nowrap"
        >
          <Palette className="size-3 sm:size-4 shrink-0" />
          <span>Colores</span>
        </TabsTrigger>
        <TabsTrigger
          value="layout"
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 min-w-0 flex-1 whitespace-nowrap"
        >
          <Layout className="size-3 sm:size-4 shrink-0" />
          <span>Layout</span>
        </TabsTrigger>
        <TabsTrigger
          value="typography"
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 min-w-0 flex-1 whitespace-nowrap"
        >
          <Type className="size-3 sm:size-4 shrink-0" />
          <span className="hidden xs:inline">Tipografía</span>
          <span className="xs:hidden">Texto</span>
        </TabsTrigger>
        <TabsTrigger
          value="spacing"
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 min-w-0 flex-1 whitespace-nowrap"
        >
          <Settings className="size-3 sm:size-4 shrink-0" />
          <span className="hidden xs:inline">Espaciado</span>
          <span className="xs:hidden">Espacio</span>
        </TabsTrigger>
      </TabsList>

      {/* Contenido de los tabs */}
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
    </Tabs>
  </CardContent>
</Card>
        </div>

        {/* Vista previa - Ocupa todo en mobile, 1/3 en desktop */}
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
                  <ThemePreview theme={theme} profileData={previewData} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
