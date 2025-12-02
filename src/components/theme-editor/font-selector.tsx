"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Check } from "lucide-react";

interface FontSelectorProps {
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      heading: string;
      cardText: string;
    };
  };
  onChange: (typography: any) => void;
}

const fontFamilies = [
  {
    id: "inter",
    name: "Inter",
    category: "Sans-serif",
    className: "font-sans",
    preview: "Aa",
    description: "Fuente moderna y limpia"
  },
  {
    id: "georgia",
    name: "Georgia",
    category: "Serif",
    className: "font-serif",
    preview: "Aa",
    description: "Fuente elegante y formal"
  },
  {
    id: "mono",
    name: "Monospace",
    category: "Monospace",
    className: "font-mono",
    preview: "Aa",
    description: "Fuente técnica y código"
  },
  {
    id: "system",
    name: "System",
    category: "System UI",
    className: "font-system",
    preview: "Aa",
    description: "Fuente del sistema"
  },
];

const fontSizeOptions = [
  { value: "14px", label: "Pequeño" },
  { value: "16px", label: "Mediano" },
  { value: "18px", label: "Grande" },
  { value: "20px", label: "Extra Grande" },
];

const cardTextSizeOptions = [
  { value: "12px", label: "Muy Pequeño" },
  { value: "14px", label: "Pequeño" },
  { value: "16px", label: "Mediano" },
  { value: "18px", label: "Grande" },
];

export function FontSelector({ typography, onChange }: FontSelectorProps) {
  const updateTypography = (key: string, value: any) => {
    onChange({
      ...typography,
      [key]: value,
    });
  };

  const updateFontSize = (
    type: keyof typeof typography.fontSize,
    value: string
  ) => {
    onChange({
      ...typography,
      fontSize: {
        ...typography.fontSize,
        [type]: value,
      },
    });
  };

  // ✅ Función para verificar si una fuente está seleccionada
  const isFontSelected = (fontName: string) => {
    return typography.fontFamily.toLowerCase().includes(fontName.toLowerCase());
  };

  return (
    <div className="space-y-6">
      {/* Selector de familia de fuentes */}
      <div>
        <Label className="text-xl font-semibold mb-3 block">
          Familia tipográfica
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
          {fontFamilies.map((font) => {
            const selected = isFontSelected(font.name);
            return (
              <Card
                key={font.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted"
                }`}
                onClick={() =>
                  updateTypography("fontFamily", `${font.name}, sans-serif`)
                }
              >
                <CardContent className="py-2">
                  {/* ✅ Misma estructura que el layout selector */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-12 rounded-lg border flex items-center justify-center text-lg font-medium ${
                          font.id === "mono"
                            ? "font-mono"
                            : font.id === "georgia"
                            ? "font-serif"
                            : "font-sans"
                        }`}
                      >
                        {font.preview}
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{font.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {font.description}
                        </div>
                      </div>
                    </div>
                    {/* ✅ Check alineado a la derecha */}
                    {selected && (
                      <Check className="size-4 text-primary shrink-0 mt-1" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tamaños de fuente */}
      <div className="space-y-4">
        <Label className="text-xl font-semibold mb-3 block">Tamaños de texto</Label>

        <div className="flex items-center justify-between">
          <Label htmlFor="heading-font-size" className="text-sm">
            Títulos
          </Label>

          <Select
            value={typography.fontSize.heading}
            onValueChange={(value) => updateFontSize("heading", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontSizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="truncate">
                  {option.label} ({option.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="base-font-size" className="text-sm">
            Texto base
          </Label>
          <Select
            value={typography.fontSize.base}
            onValueChange={(value) => updateFontSize("base", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontSizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="truncate">
                  {option.label} ({option.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="card-text-font-size" className="text-sm">
            Texto de tarjetas
          </Label>
          <Select
            value={typography.fontSize.cardText}
            onValueChange={(value) => updateFontSize("cardText", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cardTextSizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="truncate">
                  {option.label} ({option.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>


    </div>
  );
}