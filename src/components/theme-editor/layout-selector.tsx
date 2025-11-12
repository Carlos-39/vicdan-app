"use client";

import { Card, CardContent } from "@/components/ui/card";

import { Check } from "lucide-react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface LayoutSelectorProps {
  layout: {
    type: "centered" | "left-aligned" | "card" | "minimal";
    showAvatar: boolean;
    showSocialLinks: boolean;
  };
  onChange: (layout: any) => void;
}

const layoutTypes = [
  {
    id: "centered",
    name: "Centrado",
    description: "Contenido centrado con diseño balanceado",
    preview: "centered",
  },
  {
    id: "left-aligned",
    name: "Alineado a la izquierda",
    description: "Contenido alineado al lado izquierdo",
    preview: "left",
  },
  {
    id: "card",
    name: "Tarjeta",
    description: "Diseño tipo tarjeta con bordes redondeados",
    preview: "card",
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Diseño limpio y minimalista",
    preview: "minimal",
  },
];

export function LayoutSelector({ layout, onChange }: LayoutSelectorProps) {
  const updateLayout = (key: keyof typeof layout, value: any) => {
    onChange({
      ...layout,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Tipo de layout */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Plantilla de layout
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          {layoutTypes.map((layoutType) => (
            <Card
              key={layoutType.id}
              className={`cursor-pointer transition-all hover:border-primary ${
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

                {/* Preview visual simplificado */}
                <div className="mt-3">
                  <div
                    className={`flex gap-1 ${
                      layoutType.preview === "centered"
                        ? "justify-center"
                        : layoutType.preview === "left"
                        ? "justify-start"
                        : "justify-between"
                    }`}
                  >
                    <div
                      className={`bg-primary rounded ${
                        layoutType.preview === "minimal" ? "size-2" : "size-3"
                      }`}
                    />
                    <div
                      className={`bg-muted-foreground/30 rounded ${
                        layoutType.preview === "minimal" ? "size-2" : "size-3"
                      }`}
                    />
                    <div
                      className={`bg-muted-foreground/30 rounded ${
                        layoutType.preview === "minimal" ? "size-2" : "size-3"
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Opciones adicionales */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Elementos a mostrar</Label>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-avatar" className="text-sm font-medium">
              Mostrar avatar
            </Label>
            <div className="text-xs text-muted-foreground">
              Mostrar la foto de perfil en la vista pública
            </div>
          </div>
          <Switch
            id="show-avatar"
            checked={layout.showAvatar}
            onCheckedChange={(checked) => updateLayout("showAvatar", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-social" className="text-sm font-medium">
              Mostrar enlaces sociales
            </Label>
            <div className="text-xs text-muted-foreground">
              Mostrar sección de redes sociales
            </div>
          </div>
          <Switch
            id="show-social"
            checked={layout.showSocialLinks}
            onCheckedChange={(checked) =>
              updateLayout("showSocialLinks", checked)
            }
          />
        </div>
      </div>
    </div>
  );
}
