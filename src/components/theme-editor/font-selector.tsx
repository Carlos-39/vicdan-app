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

interface FontSelectorProps {
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      heading: string;
      cardText: string; // ✅ Cambiado de "subheading" a "cardText"
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
  },
  {
    id: "georgia",
    name: "Georgia",
    category: "Serif",
    className: "font-serif",
    preview: "Aa",
  },
  {
    id: "mono",
    name: "Monospace",
    category: "Monospace",
    className: "font-mono",
    preview: "Aa",
  },
  {
    id: "system",
    name: "System",
    category: "System UI",
    className: "font-system",
    preview: "Aa",
  },
];

const fontSizeOptions = [
  { value: "14px", label: "Pequeño" },
  { value: "16px", label: "Mediano" },
  { value: "18px", label: "Grande" },
  { value: "20px", label: "Extra Grande" },
];

// ✅ Opciones específicas para texto de tarjetas (pueden ser diferentes)
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

  return (
    <div className="space-y-6">
      {/* Selector de familia de fuentes */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Familia tipográfica
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
          {fontFamilies.map((font) => (
            <Card
              key={font.id}
              className={`cursor-pointer transition-all hover:border-primary ${
                typography.fontFamily.includes(font.name.toLowerCase())
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-muted"
              }`}
              onClick={() =>
                updateTypography("fontFamily", `${font.name}, sans-serif`)
              }
            >
              <CardContent className="p-3 lg:p-4">
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
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {font.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {font.category}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tamaños de fuente */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Tamaños de texto</Label>

        <div className="flex items-center justify-between">
          <Label htmlFor="heading-font-size" className="text-sm">
            Títulos
          </Label>
          <Select
            value={typography.fontSize.heading}
            onValueChange={(value) => updateFontSize("heading", value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontSizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
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
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontSizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
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
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cardTextSizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} ({option.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vista previa de tipografía */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            Previsualización tipográfica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className="space-y-2 p-4 rounded-lg border"
            style={{
              fontFamily: typography.fontFamily,
              backgroundColor: "var(--background)",
              color: "var(--text)",
            }}
          >
            <h1
              style={{
                fontSize: typography.fontSize.heading,
                fontWeight: "bold",
                margin: 0,
              }}
            >
              Título principal
            </h1>
            <p
              style={{
                fontSize: typography.fontSize.base,
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              Este es un texto de ejemplo que muestra cómo se verá el contenido
              con la tipografía seleccionada.
            </p>

            {/* ✅ NUEVO: Preview de texto de tarjetas */}
            <div
              className="mt-4 p-3 rounded-lg"
              style={{
                backgroundColor: "#877af7",
                color: "#ffffff",
              }}
            >
              <div
                style={{
                  fontSize: typography.fontSize.cardText,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Así se verá el texto en tus tarjetas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
