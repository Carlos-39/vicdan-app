"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Label } from "../ui/label";

interface LayoutSelectorProps {
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
  onChange: (layout: any) => void;
}

const layoutTypes = [
  {
    id: "centered",
    name: "Centrado",
    description: "Contenido centrado con diseño balanceado",
    preview: "center",
    textAlignment: "center" as const,
  },
  {
    id: "left-aligned",
    name: "Alineado a la izquierda",
    description: "Contenido alineado al lado izquierdo",
    preview: "left",
    textAlignment: "left" as const,
  },
  {
    id: "right-aligned",
    name: "Alineado a la derecha",
    description: "Contenido alineado al lado derecho",
    preview: "right",
    textAlignment: "right" as const,
  },
  {
    id: "justified",
    name: "Justificado",
    description: "Texto justificado para mejor lectura",
    preview: "justify",
    textAlignment: "justify" as const,
  },
  {
    id: "card",
    name: "Modelo Tarjeta",
    description: "Diseño tipo tarjeta con bordes y sombras",
    preview: "card",
    textAlignment: "center" as const,
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Diseño limpio sin elementos decorativos",
    preview: "minimal",
    textAlignment: "center" as const,
  },
];

export function LayoutSelector({ layout, onChange }: LayoutSelectorProps) {
  const updateLayout = (key: keyof typeof layout, value: any) => {
    const newLayout = {
      ...layout,
      [key]: value,
    };

    // ✅ Ajustar automáticamente la alineación de texto según el layout
    if (key === "type") {
      const selectedLayout = layoutTypes.find((lt) => lt.id === value);
      if (selectedLayout) {
        newLayout.textAlignment = selectedLayout.textAlignment;
      }
    }

    onChange(newLayout);
  };

  return (
    <div className="space-y-6">
      {/* Tipo de layout principal */}
      <div>
        <Label className="text-xl font-semibold mb-3 block">
          Diseño Principal
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {layoutTypes.map((layoutType) => (
            <Card
              key={layoutType.id}
              className={`cursor-pointer py-2 transition-all hover:border-primary ${
                layout.type === layoutType.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-muted"
              }`}
              onClick={() => updateLayout("type", layoutType.id)}
            >
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{layoutType.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {layoutType.description}
                    </div>
                  </div>
                  {layout.type === layoutType.id && (
                    <Check className="size-4 text-primary shrink-0" />
                  )}
                </div>

                {/* Preview visual mejorado */}
                <div className="mt-3">
                  <div
                    className={`flex gap-1 ${
                      layoutType.preview === "center"
                        ? "justify-center"
                        : layoutType.preview === "left"
                        ? "justify-start"
                        : layoutType.preview === "right"
                        ? "justify-end"
                        : layoutType.preview === "justify"
                        ? "justify-between"
                        : "justify-center"
                    }`}
                  >
                    <div
                      className={`${
                        layoutType.id === "card"
                          ? "bg-primary rounded-lg shadow-sm"
                          : layoutType.id === "minimal"
                          ? "bg-transparent border border-primary rounded"
                          : "bg-primary rounded"
                      } ${layoutType.id === "minimal" ? "size-2" : "size-3"}`}
                    />
                    <div
                      className={`${
                        layoutType.id === "card"
                          ? "bg-muted-foreground/30 rounded-lg shadow-sm"
                          : layoutType.id === "minimal"
                          ? "bg-transparent border border-muted-foreground/30 rounded"
                          : "bg-muted-foreground/30 rounded"
                      } ${layoutType.id === "minimal" ? "size-2" : "size-3"}`}
                    />
                    <div
                      className={`${
                        layoutType.id === "card"
                          ? "bg-muted-foreground/30 rounded-lg shadow-sm"
                          : layoutType.id === "minimal"
                          ? "bg-transparent border border-muted-foreground/30 rounded"
                          : "bg-muted-foreground/30 rounded"
                      } ${layoutType.id === "minimal" ? "size-2" : "size-3"}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
