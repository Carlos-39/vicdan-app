"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export interface LinkItem {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
}

interface LinksManagerProps {
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
}

export function LinksManager({ links, onChange }: LinksManagerProps) {
  const [newLink, setNewLink] = useState({ name: "", url: "" });

  const addLink = () => {
    if (newLink.name && newLink.url) {
      let finalUrl = newLink.url.trim();
      
      // ✅ Agregar https:// automáticamente si no lo tiene
      if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      
      const updatedLinks = [
        ...links,
        {
          id: Date.now().toString(),
          name: newLink.name,
          url: finalUrl,
          isActive: true,
        },
      ];
      onChange(updatedLinks);
      setNewLink({ name: "", url: "" });
    }
  };

  const updateLink = (id: string, updates: Partial<LinkItem>) => {
    const updatedLinks = links.map(link =>
      link.id === id ? { ...link, ...updates } : link
    );
    onChange(updatedLinks);
  };

  const deleteLink = (id: string) => {
    const updatedLinks = links.filter(link => link.id !== id);
    onChange(updatedLinks);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onChange(items);
  };

  return (
    <div className="space-y-4">
      {/* Formulario para agregar nuevo enlace */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <Input
          placeholder="Nombre (ej: Instagram)"
          value={newLink.name}
          onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
          className="flex-1"
        />
        <Input
          placeholder="instagram.com/tu-usuario"
          value={newLink.url}
          onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
          className="flex-1"
          onBlur={(e) => {
            // ✅ Agregar https:// automáticamente al perder foco
            let url = e.target.value.trim();
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
              setNewLink({ ...newLink, url: 'https://' + url });
            }
          }}
        />
        <Button onClick={addLink} className="sm:w-auto">
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Lista de enlaces con Drag & Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="links">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {links.map((link, index) => (
                <Draggable key={link.id} draggableId={link.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-white"
                    >
                      {/* Handle para arrastrar */}
                      <div {...provided.dragHandleProps} className="cursor-grab">
                        <GripVertical className="size-4 text-gray-400" />
                      </div>
                      
                      {/* Contenido del enlace */}
                      <div className="flex-1 space-y-1">
                        <Input
                          value={link.name}
                          onChange={(e) => updateLink(link.id, { name: e.target.value })}
                          className="border-none p-0 h-6 font-medium"
                        />
                        <Input
                          value={link.url}
                          onChange={(e) => updateLink(link.id, { url: e.target.value })}
                          className="border-none p-0 h-6 text-sm text-gray-500"
                          onBlur={(e) => {
                            let url = e.target.value.trim();
                            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                              updateLink(link.id, { url: 'https://' + url });
                            }
                          }}
                        />
                      </div>
                      
                      {/* Switch activo/desactivo */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Activo</span>
                        <Switch
                          checked={link.isActive}
                          onCheckedChange={(checked) => updateLink(link.id, { isActive: checked })}
                        />
                      </div>
                      
                      {/* Botón eliminar */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLink(link.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {links.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay enlaces agregados</p>
          <p className="text-sm">Agrega tu primer enlace usando el formulario de arriba</p>
        </div>
      )}
    </div>
  );
}