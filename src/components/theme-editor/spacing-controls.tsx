"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SpacingControlsProps {
  spacing: {
    padding: string;
    margin: string;
    gap: string;
  };
  onChange: (spacing: any) => void;
}

export function SpacingControls({ spacing, onChange }: SpacingControlsProps) {
  const updateSpacing = (key: keyof typeof spacing, value: string) => {
    onChange({
      ...spacing,
      [key]: value,
    });
  };

  const parseSpacingValue = (value: string) => {
    return parseInt(value.replace("px", "")) || 16;
  };

  const spacingToSliderValue = (value: string) => {
    const num = parseSpacingValue(value);
    // Convertir de px a valor de slider (0-40px -> 0-40)
    return Math.min(Math.max(num, 0), 40);
  };

  const sliderValueToSpacing = (value: number[]) => {
    return `${value[0]}px`;
  };

  return (
    <div className="space-y-6">
      {/* Control de Padding */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="padding-slider" className="text-sm font-medium">
            <span className="hidden sm:inline">Espaciado interno</span>
            <span className="sm:hidden md">Padding</span>
          </Label>
          <span className="text-sm text-muted-foreground font-mono">
            {spacing.padding}
          </span>
        </div>
        <div className="relative w-full">
          <Slider
            id="padding-slider"
            value={[parseSpacingValue(spacing.padding)]}
            onValueChange={(value) =>
              updateSpacing("padding", sliderValueToSpacing(value))
            }
            max={40}
            step={4}
            className="w-full"
          />

          {/* Marcas cada 4 unidades */}
          <div className="flex justify-between mt-2 px-2">
            {[0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40].map((value) => (
              <div key={value} className="flex flex-col items-center">
                <div className="w-px h-2 bg-gray-300" />
                <span className="text-xs text-gray-500 mt-1">{value}px</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Controla el espacio interno entre el contenido y los bordes
        </p>
      </div>

      {/* Control de Margin */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="margin-slider" className="text-sm font-medium">
            Espaciado externo (Margin)
          </Label>
          <span className="text-sm text-muted-foreground font-mono">
            {spacing.margin}
          </span>
        </div>
        <div className="relative w-full">
          <Slider
            id="margin-slider"
            value={[parseSpacingValue(spacing.margin)]}
            onValueChange={(value) =>
              updateSpacing("margin", sliderValueToSpacing(value))
            }
            max={40}
            step={4}
            className="w-full"
          />

          {/* Marcas cada 4 unidades */}
          <div className="flex justify-between mt-2 px-2">
            {[0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40].map((value) => (
              <div key={value} className="flex flex-col items-center">
                <div className="w-px h-2 bg-gray-300" />
                <span className="text-xs text-gray-500 mt-1">{value}px</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Controla el espacio externo entre elementos
        </p>
      </div>

      {/* Control de Gap */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="gap-slider" className="text-sm font-medium">
            Espacio entre elementos (Gap)
          </Label>
          <span className="text-sm text-muted-foreground font-mono">
            {spacing.gap}
          </span>
        </div>
        <div className="relative w-full">
          <Slider
            id="gap-slider"
            value={[parseSpacingValue(spacing.gap)]}
            onValueChange={(value) =>
              updateSpacing("gap", sliderValueToSpacing(value))
            }
            max={40}
            step={4}
            className="w-full"
          />

          {/* Marcas cada 4 unidades */}
          <div className="flex justify-between mt-2 px-2">
            {[0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40].map((value) => (
              <div key={value} className="flex flex-col items-center">
                <div className="w-px h-2 bg-gray-300" />
                <span className="text-xs text-gray-500 mt-1">{value}px</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Controla el espacio entre elementos dentro de contenedores
        </p>
      </div>
    </div>
  );
}
