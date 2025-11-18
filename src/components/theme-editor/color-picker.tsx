"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "../ui/label";

interface ColorPickerProps {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    card: string;
    cardText: string;
  };
  onChange: (colors: any) => void;
}

const colorPresets = {
  violet: {
    primary: "#877af7", // Color principal (botones, elementos destacados)
    secondary: "#1f2937", // Color de texto principal
    background: "#ffffff", // Fondo principal
    text: "#6b7280", // Color de descripción
    card: "#877af7", // Fondo de tarjetas
    cardText: "#ffffff", // Texto de tarjetas
  },
  blue: {
    primary: "#3b82f6",
    secondary: "#1e293b",
    background: "#ffffff",
    text: "#64748b",
    card: "#3b82f6",
    cardText: "#ffffff",
  },
  emerald: {
    primary: "#10b981",
    secondary: "#064e3b",
    background: "#ffffff",
    text: "#6b7280",
    card: "#10b981",
    cardText: "#ffffff",
  },
  red: {
    primary: "#f43f5e",
    secondary: "#881337",
    background: "#ffffff",
    text: "#6b7280",
    card: "#f43f5e",
    cardText: "#ffffff",
  },
  slate: {
    primary: "#64748b",
    secondary: "#334155",
    background: "#ffffff",
    text: "#6b7280",
    card: "#64748b",
    cardText: "#ffffff",
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
                  background: `linear-gradient(135deg, ${presetColors.primary} 50%, ${presetColors.background} 50%)`,
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
          label="Color principal"
          value={colors.primary}
          onChange={(value) => updateColor("primary", value)}
          description="Botones, elementos destacados y fondo de tarjetas"
        />
        <ColorField
          label="Color de texto"
          value={colors.secondary}
          onChange={(value) => updateColor("secondary", value)}
          description="Texto principal, títulos y encabezados"
        />
        <ColorField
          label="Color de fondo"
          value={colors.background}
          onChange={(value) => updateColor("background", value)}
          description="Fondo principal del perfil"
        />
        <ColorField
          label="Color de descripción"
          value={colors.text}
          onChange={(value) => updateColor("text", value)}
          description="Texto secundario, descripciones y detalles"
        />

        {/* Campo unificado para tarjetas (ya que es igual al primario) */}
        <ColorField
          label="Fondo de tarjetas"
          value={colors.card}
          onChange={(value) => updateColor("card", value)}
          description="Color de fondo de los botones de redes sociales"
        />
        <ColorField
          label="Texto de tarjetas"
          value={colors.cardText}
          onChange={(value) => updateColor("cardText", value)}
          description="Color del texto dentro de las tarjetas"
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
              title="Color principal"
            />
            <div
              className="size-8 rounded border flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: colors.secondary,
                color: colors.background,
              }}
              title="Color de texto"
            >
              T
            </div>
            <div
              className="size-8 rounded border"
              style={{ backgroundColor: colors.background }}
              title="Color de fondo"
            />
            <div
              className="size-8 rounded border flex items-center justify-center text-xs"
              style={{
                backgroundColor: colors.text,
                color: colors.background,
              }}
              title="Color de descripción"
            >
              D
            </div>
            {/* Preview de colores de tarjetas */}
            <div
              className="size-8 rounded border"
              style={{ backgroundColor: colors.card }}
              title="Fondo de tarjetas"
            />
            <div
              className="size-8 rounded border flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: colors.cardText,
                color: colors.card,
              }}
              title="Texto de tarjetas"
            >
              Aa
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Principal • Texto • Fondo • Descripción • Tarjeta • Texto Tarjeta
          </div>

          {/* Preview específico de tarjeta */}
          <div className="pt-3 border-t">
            <Label className="text-sm font-medium mb-2 block">
              Vista previa de tarjeta
            </Label>
            <div
              className="p-4 rounded-lg text-center transition-all"
              style={{
                backgroundColor: colors.card,
                color: colors.cardText,
              }}
            >
              <span className="font-medium">Instagram</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Así se verán tus enlaces de redes sociales
            </p>
          </div>

          {/* Preview de texto y descripción */}
          <div className="pt-3 border-t">
            <Label className="text-sm font-medium mb-2 block">
              Vista previa de texto
            </Label>
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: colors.background,
                color: colors.secondary,
              }}
            >
              <h3 className="font-bold text-lg mb-2">Título Principal</h3>
              <p style={{ color: colors.text }}>
                Esta es una descripción de ejemplo que muestra cómo se verá el
                texto secundario.
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Título (color de texto) • Descripción (color de descripción)
            </p>
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
