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
    <div className="space-y-4 sm:space-y-6">
      {/* Presets rápidos */}
      <div>
        <Label className="text-base sm:text-lg md:text-xl font-semibold mb-3 block">
          Plantillas de color
        </Label>
        <div className="flex gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
          {Object.entries(colorPresets).map(([name, presetColors]) => (
            <button
              key={name}
              onClick={() => applyPreset(name as keyof typeof colorPresets)}
              className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <div
                className="size-10 sm:size-12 md:size-14 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm group-hover:shadow-md transition-all"
                style={{
                  background: `linear-gradient(135deg, ${presetColors.primary} 50%, ${presetColors.background} 50%)`,
                }}
              />
              <span className="text-[10px] xs:text-xs sm:text-sm capitalize text-muted-foreground font-medium">
                {name === "violet" ? "Violet" : name === "blue" ? "Blue" : name === "emerald" ? "Emerald" : name === "red" ? "Red" : "Slate"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selectores individuales */}
      <div>
        <Label className="text-base sm:text-lg md:text-xl font-semibold mb-3 block">
          Color principal
        </Label>
        <div className="mb-4 sm:mb-6">
          <ColorField
            label=""
            value={colors.primary}
            onChange={(value) => updateColor("primary", value)}
            description="Botones, elementos destacados y fondo de tarjetas"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
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
          description="Color del texto dentro de las tarjetas y botones de redes sociales"
        />
      </div>

     
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
      {label && <Label className="text-sm sm:text-base font-medium">{label}</Label>}
      <div className="flex gap-2 sm:gap-3 items-start">
        <div className="relative shrink-0">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="size-10 sm:size-12 rounded-md sm:rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary transition-colors"
          />
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="#000000"
          />
          {description && (
            <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
