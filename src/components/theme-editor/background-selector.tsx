// src/components/theme-editor/background-selector.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";

interface BackgroundSelectorProps {
  background: any;
  onChange: (background: any) => void;
}

const patternOptions = [
  { id: 'dots', name: 'Puntos', css: 'radial-gradient(circle, currentColor 1px, transparent 1px)' },
  { id: 'lines', name: 'Líneas', css: 'repeating-linear-gradient(0deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)' },
  { id: 'grid', name: 'Cuadrícula', css: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)' },
  { id: 'zigzag', name: 'Zigzag', css: 'linear-gradient(135deg, currentColor 25%, transparent 25%), linear-gradient(225deg, currentColor 25%, transparent 25%), linear-gradient(45deg, currentColor 25%, transparent 25%), linear-gradient(315deg, currentColor 25%, transparent 25%)' },
  { id: 'stripes', name: 'Rayas', css: 'repeating-linear-gradient(45deg, currentColor, currentColor 5px, transparent 5px, transparent 10px)' },
  { id: 'checker', name: 'Tablero', css: 'conic-gradient(currentColor 0% 25%, transparent 0% 50%, currentColor 0% 75%, transparent 0%)' }
];

const gradientDirections = [
  { value: 'to right', label: 'Horizontal →' },
  { value: 'to bottom', label: 'Vertical ↓' },
  { value: '135deg', label: 'Diagonal ↘' },
  { value: 'to right bottom', label: 'Esquina inferior derecha' },
  { value: 'circle', label: 'Circular' }
];

export function BackgroundSelector({ background, onChange }: BackgroundSelectorProps) {
  const [activeTab, setActiveTab] = useState(background.type || 'color');

  const updateBackground = (updates: any) => {
    onChange({
      ...background,
      ...updates
    });
  };

  const handleTypeChange = (type: 'color' | 'gradient' | 'pattern' | 'image') => {
    setActiveTab(type);
    
    // Inicializar valores por defecto según el tipo
    const defaultValues = {
      type,
      gradient: type === 'gradient' ? {
        colors: ['#877af7', '#3b82f6'],
        direction: 'to right',
        type: 'linear'
      } : background.gradient,
      pattern: type === 'pattern' ? {
        type: 'dots',
        color: '#877af7',
        size: 50,
        opacity: 0.1
      } : background.pattern,
      image: type === 'image' ? {
        url: '',
        size: 'cover',
        position: 'center',
        repeat: 'no-repeat',
        opacity: 1
      } : background.image
    };

    onChange(defaultValues);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => handleTypeChange(value as any)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="color">Color</TabsTrigger>
          <TabsTrigger value="gradient">Degradado</TabsTrigger>
          <TabsTrigger value="pattern">Patrón</TabsTrigger>
          <TabsTrigger value="image">Imagen</TabsTrigger>
        </TabsList>

        {/* Pestaña de Color Sólido */}
        <TabsContent value="color" className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Usa el selector de colores principal para cambiar el color de fondo.
          </div>
        </TabsContent>

        {/* Pestaña de Degradados */}
        <TabsContent value="gradient" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color 1</Label>
              <input
                type="color"
                value={background.gradient?.colors?.[0] || '#877af7'}
                onChange={(e) => updateBackground({
                  gradient: {
                    ...background.gradient,
                    colors: [e.target.value, background.gradient?.colors?.[1] || '#3b82f6']
                  }
                })}
                className="w-full h-10 rounded border cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label>Color 2</Label>
              <input
                type="color"
                value={background.gradient?.colors?.[1] || '#3b82f6'}
                onChange={(e) => updateBackground({
                  gradient: {
                    ...background.gradient,
                    colors: [background.gradient?.colors?.[0] || '#877af7', e.target.value]
                  }
                })}
                className="w-full h-10 rounded border cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dirección</Label>
            <select
              value={background.gradient?.direction || 'to right'}
              onChange={(e) => updateBackground({
                gradient: {
                  ...background.gradient,
                  direction: e.target.value
                }
              })}
              className="w-full p-2 border rounded"
            >
              {gradientDirections.map(dir => (
                <option key={dir.value} value={dir.value}>{dir.label}</option>
              ))}
            </select>
          </div>

          {/* Vista previa del degradado */}
          <div className="p-4 border rounded-lg">
            <Label className="text-sm font-medium mb-2 block">Vista previa</Label>
            <div 
              className="h-20 rounded border"
              style={{
                background: background.gradient?.direction === 'circle' 
                  ? `radial-gradient(circle, ${background.gradient?.colors?.[0] || '#877af7'}, ${background.gradient?.colors?.[1] || '#3b82f6'})`
                  : `linear-gradient(${background.gradient?.direction || 'to right'}, ${background.gradient?.colors?.[0] || '#877af7'}, ${background.gradient?.colors?.[1] || '#3b82f6'})`
              }}
            />
          </div>
        </TabsContent>

        {/* Pestaña de Patrones */}
        <TabsContent value="pattern" className="space-y-4">
          <div className="space-y-2">
            <Label>Selecciona un patrón</Label>
            <div className="grid grid-cols-3 gap-2">
              {patternOptions.map(pattern => (
                <button
                  key={pattern.id}
                  onClick={() => updateBackground({
                    pattern: {
                      ...background.pattern,
                      type: pattern.id
                    }
                  })}
                  className={`aspect-square rounded border-2 p-1 transition-all ${
                    background.pattern?.type === pattern.id 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-muted'
                  }`}
                >
                  <div
                    className="w-full h-full rounded"
                    style={{
                      background: pattern.css.replace(/currentColor/g, background.pattern?.color || '#877af7'),
                      backgroundSize: '20px 20px',
                      backgroundColor: 'transparent'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color del patrón</Label>
            <input
              type="color"
              value={background.pattern?.color || '#877af7'}
              onChange={(e) => updateBackground({
                pattern: {
                  ...background.pattern,
                  color: e.target.value
                }
              })}
              className="w-full h-10 rounded border cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label>Tamaño del patrón: {background.pattern?.size || 50}%</Label>
            <input
              type="range"
              min="10"
              max="100"
              value={background.pattern?.size || 50}
              onChange={(e) => updateBackground({
                pattern: {
                  ...background.pattern,
                  size: parseInt(e.target.value)
                }
              })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Opacidad: {((background.pattern?.opacity || 0.1) * 100).toFixed(0)}%</Label>
            <input
              type="range"
              min="1"
              max="100"
              value={(background.pattern?.opacity || 0.1) * 100}
              onChange={(e) => updateBackground({
                pattern: {
                  ...background.pattern,
                  opacity: parseInt(e.target.value) / 100
                }
              })}
              className="w-full"
            />
          </div>
        </TabsContent>

        {/* Pestaña de Imágenes */}
        <TabsContent value="image" className="space-y-4">
          <div className="space-y-2">
            <Label>Subir imagen</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      updateBackground({
                        image: {
                          ...background.image,
                          url: event.target?.result as string
                        }
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="background-image-upload"
              />
              <label
                htmlFor="background-image-upload"
                className="cursor-pointer block"
              >
                <div className="text-muted-foreground mb-2">
                  Haz clic para seleccionar una imagen
                </div>
                <div className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP hasta 5MB
                </div>
              </label>
            </div>
          </div>

          {background.image?.url && (
            <div className="space-y-2">
              <Label>Vista previa</Label>
              <div className="border rounded-lg p-2">
                <img
                  src={background.image.url}
                  alt="Vista previa del fondo"
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tamaño</Label>
              <select
                value={background.image?.size || 'cover'}
                onChange={(e) => updateBackground({
                  image: {
                    ...background.image,
                    size: e.target.value
                  }
                })}
                className="w-full p-2 border rounded"
              >
                <option value="cover">Cubrir</option>
                <option value="contain">Contener</option>
                <option value="auto">Automático</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Posición</Label>
              <select
                value={background.image?.position || 'center'}
                onChange={(e) => updateBackground({
                  image: {
                    ...background.image,
                    position: e.target.value
                  }
                })}
                className="w-full p-2 border rounded"
              >
                <option value="center">Centro</option>
                <option value="top">Superior</option>
                <option value="bottom">Inferior</option>
                <option value="left">Izquierda</option>
                <option value="right">Derecha</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Repetición</Label>
            <select
              value={background.image?.repeat || 'no-repeat'}
              onChange={(e) => updateBackground({
                image: {
                  ...background.image,
                  repeat: e.target.value
                }
              })}
              className="w-full p-2 border rounded"
            >
              <option value="no-repeat">No repetir</option>
              <option value="repeat">Repetir</option>
              <option value="repeat-x">Repetir horizontal</option>
              <option value="repeat-y">Repetir vertical</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Opacidad: {((background.image?.opacity || 1) * 100).toFixed(0)}%</Label>
            <input
              type="range"
              min="1"
              max="100"
              value={(background.image?.opacity || 1) * 100}
              onChange={(e) => updateBackground({
                image: {
                  ...background.image,
                  opacity: parseInt(e.target.value) / 100
                }
              })}
              className="w-full"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}