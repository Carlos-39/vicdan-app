// src/components/profiles/view-profile-dialog.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ProfileWithAdmin } from "@/types/profile"
import { formatDate } from "@/lib/date-utils"
import { Mail, User, Calendar } from "lucide-react"

interface ViewProfileDialogProps {
  profile: ProfileWithAdmin | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewProfileDialog({ profile, open, onOpenChange }: ViewProfileDialogProps) {
  if (!profile) return null

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalles del perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={profile.logo_url || undefined} alt={profile.nombre} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(profile.nombre)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{profile.nombre}</h3>
              <Badge
                variant={getStatusVariant(profile.estado)}
                className="mt-1"
              >
                {profile.estado}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {profile.correo && (
              <div className="flex items-start gap-3">
                <Mail className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Correo electrónico</p>
                  <p className="text-sm text-muted-foreground">{profile.correo}</p>
                </div>
              </div>
            )}

            {profile.administrador && (
              <div className="flex items-start gap-3">
                <User className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Creado por</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.administrador.nombre}
                    {profile.administrador.correo && ` (${profile.administrador.correo})`}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Fecha de creación</p>
                <p className="text-sm text-muted-foreground">{formatDate(profile.fechas)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}