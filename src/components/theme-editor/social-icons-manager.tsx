"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
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
  Trash2
} from "lucide-react";

export interface SocialIcon {
  id: string;
  platform: string;
  url: string;
  isActive: boolean;
}

interface SocialIconsManagerProps {
  socialIcons: SocialIcon[];
  onChange: (socialIcons: SocialIcon[]) => void;
}

// Plataformas de redes sociales disponibles
const SOCIAL_PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, placeholder: "instagram.com/tu-usuario" },
  { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, placeholder: "wa.me/tunumero" },
  { id: "tiktok", name: "TikTok", icon: Music, placeholder: "tiktok.com/@usuario" },
  { id: "facebook", name: "Facebook", icon: Facebook, placeholder: "facebook.com/tu-pagina" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, placeholder: "x.com/tu-usuario" },
  { id: "youtube", name: "YouTube", icon: Youtube, placeholder: "youtube.com/@canal" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, placeholder: "linkedin.com/in/tu-perfil" },
  { id: "email", name: "Email", icon: Mail, placeholder: "tu@email.com" },
  { id: "phone", name: "Teléfono", icon: Phone, placeholder: "+1234567890" },
  { id: "website", name: "Sitio Web", icon: Globe, placeholder: "tusitio.com" },
];

export function SocialIconsManager({ socialIcons, onChange }: SocialIconsManagerProps) {
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");

  const addSocialIcon = () => {
    const platformConfig = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform);
    if (!platformConfig) return;

    const newIcon: SocialIcon = {
      id: Date.now().toString(),
      platform: selectedPlatform,
      url: "",
      isActive: true,
    };

    onChange([...socialIcons, newIcon]);
  };

  const updateSocialIcon = (id: string, updates: Partial<SocialIcon>) => {
    const updatedIcons = socialIcons.map(icon =>
      icon.id === id ? { ...icon, ...updates } : icon
    );
    onChange(updatedIcons);
  };

  const deleteSocialIcon = (id: string) => {
    const updatedIcons = socialIcons.filter(icon => icon.id !== id);
    onChange(updatedIcons);
  };

  const getPlatformConfig = (platformId: string) => {
    return SOCIAL_PLATFORMS.find(p => p.id === platformId) || SOCIAL_PLATFORMS[0];
  };

  return (
    <div className="space-y-4">
      {/* Formulario para agregar nuevo icono */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="flex gap-2 flex-1">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {SOCIAL_PLATFORMS.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <option key={platform.id} value={platform.id}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="size-4" />
                    {platform.name}
                  </div>
                </option>
              );
            })}
          </select>
        </div>
        <Button onClick={addSocialIcon} className="sm:w-auto">
          <Plus className="size-4" />
          Agregar Icono
        </Button>
      </div>

      {/* Lista de iconos de redes sociales */}
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
                <IconComponent className="size-6 text-gray-600" />
              </div>
              
              {/* Información de la plataforma */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900">
                  {platformConfig.name}
                </div>
                <Input
                  value={socialIcon.url}
                  onChange={(e) => updateSocialIcon(socialIcon.id, { url: e.target.value })}
                  className="border-none p-0 h-6 text-sm text-gray-500 bg-transparent"
                  placeholder={platformConfig.placeholder}
                  onBlur={(e) => {
                    let url = e.target.value.trim();
                    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                      // Agregar protocolo según la plataforma
                      if (socialIcon.platform === 'email') {
                        updateSocialIcon(socialIcon.id, { url: 'mailto:' + url });
                      } else if (socialIcon.platform === 'phone') {
                        updateSocialIcon(socialIcon.id, { url: 'tel:' + url });
                      } else {
                        updateSocialIcon(socialIcon.id, { url: 'https://' + url });
                      }
                    }
                  }}
                />
              </div>
              
              {/* Switch activo/desactivo */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:inline">Activo</span>
                <Switch
                  checked={socialIcon.isActive}
                  onCheckedChange={(checked) => updateSocialIcon(socialIcon.id, { isActive: checked })}
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
          <p className="text-sm">Agrega tus redes sociales usando el formulario de arriba</p>
        </div>
      )}
    </div>
  );
}