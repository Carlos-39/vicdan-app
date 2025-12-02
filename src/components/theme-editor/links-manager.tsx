"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  GripVertical,
  Trash2,
  Plus,
  Instagram,
  MessageCircle,
  Music,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Share2,
  Link2,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export interface LinkItem {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  icon?: string;
}

export interface SocialIcon {
  id: string;
  platform: string;
  url: string;
  isActive: boolean;
}

interface LinksManagerProps {
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
  theme?: any;
  onThemeUpdate?: (theme: any) => void;
  socialIcons?: SocialIcon[];
  onSocialIconsChange?: (socialIcons: SocialIcon[]) => void;
}

// Plataformas de redes sociales para iconos
const SOCIAL_PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    placeholder: "instagram.com/tu-usuario",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    placeholder: "wa.me/tunumero",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Music,
    placeholder: "tiktok.com/@usuario",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    placeholder: "facebook.com/tu-pagina",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    placeholder: "x.com/tu-usuario",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    placeholder: "youtube.com/@canal",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    placeholder: "linkedin.com/in/tu-perfil",
  },
  { id: "email", name: "Email", icon: Mail, placeholder: "tu@email.com" },
  { id: "phone", name: "Teléfono", icon: Phone, placeholder: "+1234567890" },
  { id: "website", name: "Sitio Web", icon: Globe, placeholder: "tusitio.com" },
];

export function LinksManager({
  links,
  onChange,
  theme,
  onThemeUpdate,
  socialIcons = [],
  onSocialIconsChange,
}: LinksManagerProps) {
  const [newLink, setNewLink] = useState({ name: "", url: "" });
  const [activeSection, setActiveSection] = useState<"links" | "social">(
    "links"
  );
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");

  const addLink = () => {
    if (newLink.name && newLink.url) {
      let finalUrl = newLink.url.trim();

      if (
        finalUrl &&
        !finalUrl.startsWith("http://") &&
        !finalUrl.startsWith("https://")
      ) {
        finalUrl = "https://" + finalUrl;
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

  const addSocialIcon = () => {
    const platformConfig = SOCIAL_PLATFORMS.find(
      (p) => p.id === selectedPlatform
    );
    if (!platformConfig) return;

    const newIcon: SocialIcon = {
      id: `social-${Date.now()}`,
      platform: selectedPlatform,
      url: "",
      isActive: true,
    };

    onSocialIconsChange?.([...socialIcons, newIcon]);
  };

  const updateLink = (id: string, updates: Partial<LinkItem>) => {
    const updatedLinks = links.map((link) =>
      link.id === id ? { ...link, ...updates } : link
    );
    onChange(updatedLinks);
  };

  const updateSocialIcon = (id: string, updates: Partial<SocialIcon>) => {
    const updatedIcons = socialIcons.map((icon) =>
      icon.id === id ? { ...icon, ...updates } : icon
    );
    onSocialIconsChange?.(updatedIcons);
  };

  const deleteLink = (id: string) => {
    const updatedLinks = links.filter((link) => link.id !== id);
    onChange(updatedLinks);
  };

  const deleteSocialIcon = (id: string) => {
    const updatedIcons = socialIcons.filter((icon) => icon.id !== id);
    onSocialIconsChange?.(updatedIcons);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const getPlatformConfig = (platformId: string) => {
    return (
      SOCIAL_PLATFORMS.find((p) => p.id === platformId) || SOCIAL_PLATFORMS[0]
    );
  };

  const updateSocialIconsPosition = (
    position: "above-links" | "below-links" | "both"
  ) => {
    onThemeUpdate?.({
      ...theme,
      layout: {
        ...theme.layout,
        socialIconsPosition: position,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Selector de sección */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeSection === "links"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveSection("links")}
        >
          <Link2 className="size-4 inline mr-2" />
          Enlaces Principales
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeSection === "social"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveSection("social")}
        >
          <Share2 className="size-4 inline mr-2" />
          Iconos Sociales
        </button>
      </div>

      {/* SECCIÓN: Enlaces Principales */}
      {activeSection === "links" && (
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
                let url = e.target.value.trim();
                if (
                  url &&
                  !url.startsWith("http://") &&
                  !url.startsWith("https://")
                ) {
                  setNewLink({ ...newLink, url: "https://" + url });
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
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {links.map((link, index) => (
                    <Draggable
                      key={link.id}
                      draggableId={link.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-3 p-3 border rounded-lg bg-white"
                        >
                          {/* Handle para arrastrar */}
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab"
                          >
                            <GripVertical className="size-4 text-gray-400" />
                          </div>

                          {/* Contenido del enlace */}
                          <div className="flex-1 space-y-3">
                            <Input
                              value={link.name}
                              placeholder="Nombre"

                              onBlur={(e) => {
                                updateLink(link.id, { name: e.target.value });
                              }}
                              onChange={(e) =>
                                updateLink(link.id, { name: e.target.value })
                              }
                              
                              className="border-none p-4 h-6 font-medium"
                            />
                            <Input
                              value={link.url}
                              onChange={(e) =>
                                updateLink(link.id, { url: e.target.value })
                              }
                              className="border-none p-4 h-6 text-sm  "
                              onBlur={(e) => {
                                let url = e.target.value.trim();
                                if (
                                  url &&
                                  !url.startsWith("http://") &&
                                  !url.startsWith("https://")
                                ) {
                                  updateLink(link.id, {
                                    url: "https://" + url,
                                  });
                                }
                              }}
                            />
                          </div>

                          {/* Switch activo/desactivo */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs  ">
                              Activo
                            </span>
                            <Switch
                              checked={link.isActive}
                              onCheckedChange={(checked) =>
                                updateLink(link.id, { isActive: checked })
                              }
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
              <p className="text-sm">
                Agrega tu primer enlace usando el formulario de arriba
              </p>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN: Iconos Sociales */}
      {activeSection === "social" && (
        <div className="space-y-4">
          {/* Configuración de posición */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Posición de los Iconos
            </Label>
            <div className="grid grid-cols-3 gap-2 ">
              <Card
                className={`cursor-pointer transition-all ${
                  theme?.layout?.socialIconsPosition === "above-links"
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted"
                }`}
                onClick={() => updateSocialIconsPosition("above-links")}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-medium">Encima</div>
                  <div className="text-md text-muted-foreground mt-1">
                    Arriba de enlaces
                  </div>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all ${
                  theme?.layout?.socialIconsPosition === "below-links"
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted"
                }`}
                onClick={() => updateSocialIconsPosition("below-links")}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-medium">Debajo</div>
                  <div className="text-md text-muted-foreground mt-1">
                    Abajo de enlaces
                  </div>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all ${
                  theme?.layout?.socialIconsPosition === "both"
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted"
                }`}
                onClick={() => updateSocialIconsPosition("both")}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-medium">Ambos</div>
                  <div className="text-md text-muted-foreground mt-1">
                    Arriba y abajo
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Formulario para agregar icono social */}
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="flex gap-2 flex-1">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {SOCIAL_PLATFORMS.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={addSocialIcon} className="sm:w-auto">
              <Plus className="size-4" />
              Agregar Icono
            </Button>
          </div>

          {/* Lista de iconos sociales */}
          <div className="space-y-3">
            {socialIcons.map((socialIcon) => {
              const platformConfig = getPlatformConfig(socialIcon.platform);
              const IconComponent = platformConfig.icon;

              return (
                <div
                  key={socialIcon.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-white"
                >
                  {/* Icono de la plataforma */}
                  <div className="flex items-center justify-center w-10">
                    <IconComponent className="size-12 text-gray-600" />
                  </div>

                  {/* Información de la plataforma */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 mb-2">
                      {platformConfig.name}
                    </div>
                    <Input
                      value={socialIcon.url}
                      onChange={(e) =>
                        updateSocialIcon(socialIcon.id, { url: e.target.value })
                      }
                      className="border-none p-4 h-6 text-sm  "
                      placeholder={platformConfig.placeholder}
                      onBlur={(e) => {
                        let url = e.target.value.trim();
                        if (
                          url &&
                          !url.startsWith("http://") &&
                          !url.startsWith("https://")
                        ) {
                          if (socialIcon.platform === "email") {
                            updateSocialIcon(socialIcon.id, {
                              url: "mailto:" + url,
                            });
                          } else if (socialIcon.platform === "phone") {
                            updateSocialIcon(socialIcon.id, {
                              url: "tel:" + url,
                            });
                          } else {
                            updateSocialIcon(socialIcon.id, {
                              url: "https://" + url,
                            });
                          }
                        }
                      }}
                    />
                  </div>

                  

                  {/* Switch activo/desactivo */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      Activo
                    </span>
                    <Switch
                      checked={socialIcon.isActive}
                      onCheckedChange={(checked) =>
                        updateSocialIcon(socialIcon.id, { isActive: checked })
                      }
                    />
                  </div>

                  {/* Botón eliminar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSocialIcon(socialIcon.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          {socialIcons.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No hay iconos de redes sociales agregados</p>
              <p className="text-sm">
                Agrega tus redes sociales usando el formulario de arriba
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
