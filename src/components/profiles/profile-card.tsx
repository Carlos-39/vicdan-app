// src/components/profiles/profile-card.tsx
"use client"

import { ProfileWithAdmin } from "@/types/profile"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Eye, MoreVertical, Trash2, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "@/lib/date-utils"
import { useRouter } from "next/navigation"

interface ProfileCardProps {
  profile: ProfileWithAdmin
  onView: (profile: ProfileWithAdmin) => void
  onEdit: (profile: ProfileWithAdmin) => void
  onDelete: (profile: ProfileWithAdmin) => void
}

export function ProfileCard({ profile, onView, onEdit, onDelete }: ProfileCardProps) {
  const router = useRouter()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusVariant = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'success'
      case 'inactivo':
        return 'secondary'
      case 'borrador':
        return 'draft'
      default:
        return 'secondary'
    }
  }

  const handlePreview = () => {
    router.push(`/dashboard/perfiles/${profile.id}`)
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="size-12 shrink-0">
          <AvatarImage src={profile.logo_url || undefined} alt={profile.nombre} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(profile.nombre)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{profile.nombre}</h3>
              {profile.correo && (
                <p className="text-xs text-muted-foreground truncate">{profile.correo}</p>
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
                <DropdownMenuItem onClick={handlePreview}>
                  <ExternalLink className="size-4" />
                  Vista completa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onView(profile)}>
                  <Eye className="size-4" />
                  Vista rápida
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(profile)}>
                  <Edit className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(profile)}
                >
                  <Trash2 className="size-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status and Date */}
          <div className="flex items-center gap-2 mt-2">
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
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7"
              onClick={handlePreview}
            >
              <ExternalLink className="size-3" />
              Ver detalles completos
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}