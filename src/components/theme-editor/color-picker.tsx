"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "../ui/label";

interface ColorPickerProps {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  onChange: (colors: any) => void;
}

const colorPresets = {
  violet: {
    primary: "#877af7",
    secondary: "#f4f4f5",
    background: "#ffffff",
    text: "#1f2937",
    accent: "#877af7",
  },
  blue: {
    primary: "#3b82f6",
    secondary: "#f1f5f9",
    background: "#ffffff",
    text: "#1e293b",
    accent: "#3b82f6",
  },
  emerald: {
    primary: "#10b981",
    secondary: "#ecfdf5",
    background: "#ffffff",
    text: "#064e3b",
    accent: "#10b981",
  },
  rose: {
    primary: "#f43f5e",
    secondary: "#fff1f2",
    background: "#ffffff",
    text: "#881337",
    accent: "#f43f5e",
  },
  slate: {
    primary: "#64748b",
    secondary: "#f8fafc",
    background: "#ffffff",
    text: "#334155",
    accent: "#64748b",
  },
};

export function ColorPicker({ colors, onChange }: ColorPickerProps) {
  const updateColor = (key: keyof typeof colors, value: string) => {
    onChange({
      ...colors,
      [key]: value,
    });
  };

  const applyPreset = (preset: keyof typeof colorPresets) => {
    onChange(colorPresets[preset]);
  };

  return (
    <div className="space-y-6">
      {/* Presets rápidos */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Plantillas de color
        </Label>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(colorPresets).map(([name, presetColors]) => (
            <button
              key={name}
              onClick={() => applyPreset(name as keyof typeof colorPresets)}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className="size-8 rounded-md border shadow-sm group-hover:scale-110 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${presetColors.primary} 50%, ${presetColors.secondary} 50%)`,
                }}
              />
              <span className="text-xs capitalize text-muted-foreground">
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selectores individuales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        <ColorField
          label="Color primario"
          value={colors.primary}
          onChange={(value) => updateColor("primary", value)}
          description="Botones, enlaces y elementos principales"
        />
        <ColorField
          label="Color secundario"
          value={colors.secondary}
          onChange={(value) => updateColor("secondary", value)}
          description="Fondos secundarios y hover states"
        />
        <ColorField
          label="Color de fondo"
          value={colors.background}
          onChange={(value) => updateColor("background", value)}
          description="Fondo principal del perfil"
        />
        <ColorField
          label="Color de texto"
          value={colors.text}
          onChange={(value) => updateColor("text", value)}
          description="Color del texto principal"
        />
        <ColorField
          label="Color de acento"
          value={colors.accent}
          onChange={(value) => updateColor("accent", value)}
          description="Elementos destacados y bordes"
        />
      </div>

      {/* Preview de colores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Previsualización de colores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div
              className="size-8 rounded border"
              style={{ backgroundColor: colors.primary }}
            />
            <div
              className="size-8 rounded border"
              style={{ backgroundColor: colors.secondary }}
            />
            <div
              className="size-8 rounded border"
              style={{ backgroundColor: colors.background }}
            />
            <div
              className="size-8 rounded border"
              style={{ backgroundColor: colors.text }}
            />
            <div
              className="size-8 rounded border"
              style={{ backgroundColor: colors.accent }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Primario • Secundario • Fondo • Texto • Acento
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente auxiliar para cada campo de color
function ColorField({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="size-10 rounded border cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20"
            placeholder="#000000"
          />
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
