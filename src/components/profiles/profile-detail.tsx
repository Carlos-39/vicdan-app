// src/components/profiles/profile-detail.tsx
"use client"

import { ProfileWithAdmin } from "@/types/profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Mail, 
  User, 
  Calendar, 
  Edit, 
  ArrowLeft,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  FileText,
  Palette,
  Eye
} from "lucide-react"
import { formatDate, formatDistanceToNow } from "@/lib/date-utils"
import { useRouter } from "next/navigation"

interface ProfileDetailProps {
  profile: ProfileWithAdmin
  onEdit?: () => void
  showBackButton?: boolean
}

export function ProfileDetail({ profile, onEdit, showBackButton = true }: ProfileDetailProps) {
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

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <CheckCircle2 className="size-4" />
      case 'inactivo':
        return <XCircle className="size-4" />
      case 'borrador':
        return <FileEdit className="size-4" />
      default:
        return null
    }
  }

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'Activo'
      case 'inactivo':
        return 'Inactivo'
      case 'borrador':
        return 'Borrador'
      default:
        return estado
    }
  }

  const handlePreviewDesign = () => {
    window.open(`/perfil/${profile.id}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      {/* Header con botones de acción */}
      <div className="flex items-center justify-between">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={handlePreviewDesign}>
            <Eye className="size-4" />
            Vista previa de diseño
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/perfiles/${profile.id}/personalizar`)}
          >
            <Palette className="size-4" />
            Personalizar diseño
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit || (() => router.push(`/dashboard/perfiles/${profile.id}/editar`))}
          >
            <Edit className="size-4" />
            Editar perfil
          </Button>
        </div>
      </div>

      {/* Card Principal - Información del perfil */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              <AvatarImage src={profile.logo_url || undefined} alt={profile.nombre} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {getInitials(profile.nombre)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{profile.nombre}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusVariant(profile.estado)} className="gap-1">
                  {getStatusIcon(profile.estado)}
                  {getStatusLabel(profile.estado)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Información de Contacto
              </h3>
              
              {profile.correo ? (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Correo electrónico</p>
                    <p className="text-sm text-muted-foreground break-all">{profile.correo}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Correo electrónico</p>
                    <p className="text-sm text-muted-foreground">No especificado</p>
                  </div>
                </div>
              )}

              {profile.logo_url && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Building2 className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Logo del perfil</p>
                    <a 
                      href={profile.logo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      Ver logo
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Información del Sistema */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Información del Sistema
              </h3>

              {profile.administrador && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <User className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Creado por</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.administrador.nombre}
                    </p>
                    {profile.administrador.correo && (
                      <p className="text-xs text-muted-foreground break-all">
                        {profile.administrador.correo}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Fecha de creación</p>
                  <p className="text-sm text-muted-foreground">{formatDate(profile.fechas)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Última actualización</p>
                  <p className="text-sm text-muted-foreground">{formatDistanceToNow(profile.fechas)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {profile.descripcion && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium mb-1">Descripción</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {profile.descripcion}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de ID (útil para debugging/admin) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información Técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">ID del Perfil</span>
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {profile.id}
              </code>
            </div>
            {profile.administrador_id && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">ID del Administrador</span>
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {profile.administrador_id}
                </code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}