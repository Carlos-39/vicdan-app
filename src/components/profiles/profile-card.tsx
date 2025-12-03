"use client";

import { ProfileWithAdmin } from "@/types/profile";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreVertical, Trash2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";
import { useRouter } from "next/navigation";
import { ProfileCardDeleteMenuItem } from "./profile-card-delete-menu-item";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";

interface ProfileCardProps {
  profile: ProfileWithAdmin;
  onView: (profile: ProfileWithAdmin) => void;
  onEdit: (profile: ProfileWithAdmin) => void;
}

export function ProfileCard({ profile, onView, onEdit }: ProfileCardProps) {
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusVariant = (estado: string) => {
    switch (estado) {
      case "activo":
        return "success";
      case "inactivo":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const handlePreview = () => {
    router.push(`/dashboard/perfiles/${profile.id}`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/perfiles/${profile.id}/editar`);
  };

  return (
    <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow group">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Avatar */}
        <Avatar className="size-16 sm:size-20 shrink-0 items-center justify-center bg-primary/10 mx-auto sm:mx-0 my-auto">
          <AvatarImage
            src={profile.logo_url || undefined}
            alt={profile.nombre}
          />
          <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg">
            {getInitials(profile.nombre)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base truncate">
                {profile.nombre}
              </h3>
              {profile.correo && (
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {profile.correo}
                </p>
              )}
            </div>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="shrink-0">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePreview} className="cursor-pointer">
                  <ExternalLink className="size-4" />
                  Vista completa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onView(profile)} className="cursor-pointer">
                  <Eye className="size-4" />
                  Vista rápida
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(profile)} className="cursor-pointer">
                  <Edit className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <ProfileCardDeleteMenuItem
                  profileId={profile.id}
                  profileName={profile.nombre}
                  logoUrl={profile.logo_url ?? undefined}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status and Date */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant={getStatusVariant(profile.estado)}
              className="text-xs"
            >
              {profile.estado}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(profile.fechas)}
            </span>
          </div>

          {/* Quick Preview Button - Visible al hacer hover */}
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7 sm:h-8"
              onClick={handlePreview}
            >
              <ExternalLink className="size-3" />
              Ver detalles completos
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
