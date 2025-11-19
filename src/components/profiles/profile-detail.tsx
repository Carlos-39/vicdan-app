// src/components/profiles/profile-detail.tsx
"use client"

import { useState } from "react"
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
  Eye,
  Upload,
  Share2,
  Loader2
} from "lucide-react"
import { formatDate, formatDistanceToNow } from "@/lib/date-utils"
import { useRouter } from "next/navigation"
import { ProfileCompletenessCheck } from "./profile-completeness-check"
import { ShareProfileModal } from "./share-profile-modal"
import { useSession } from "next-auth/react"

interface ProfileDetailProps {
  profile: ProfileWithAdmin
  onEdit?: () => void
  showBackButton?: boolean
}

export function ProfileDetail({ profile, onEdit, showBackButton = true }: ProfileDetailProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareData, setShareData] = useState<any>(null)

  const isPublished = profile.estado === 'publicado'
  
  const checkIfComplete = () => {
    const requiredFields = [
      profile.nombre,
      profile.logo_url,
      profile.correo,
      profile.descripcion,
      profile.diseno
    ]
    return requiredFields.every(field => {
      if (!field) return false
      if (typeof field === 'string' && field.trim() === '') return false
      if (typeof field === 'object' && Object.keys(field).length === 0) return false
      return true
    })
  }

  const isComplete = checkIfComplete()

  const handlePublish = async () => {
    if (!isComplete) return

    setIsPublishing(true)
    setPublishError(null)

    try {
      const token = (session as any)?.accessToken
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación')
      }

      const response = await fetch(`/api/perfiles/${profile.id}/publicar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al publicar el perfil')
      }

      const data = await response.json()
      
      // Guardar datos para compartir
      setShareData({
        slug: data.slug,
        publicUrl: data.publicUrl,
        qrUrl: data.qrPublicUrl,
        nombre: profile.nombre
      })

      // Abrir modal de compartir
      setShareModalOpen(true)

      // Recargar la página para actualizar el estado
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error publicando perfil:', error)
      setPublishError(error instanceof Error ? error.message : 'Error al publicar el perfil')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleOpenShareModal = () => {
    if (profile.slug && profile.qr_url) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      setShareData({
        slug: profile.slug,
        publicUrl: `${baseUrl}/${profile.slug}`,
        qrUrl: profile.qr_url,
        nombre: profile.nombre
      })
      setShareModalOpen(true)
    }
  }

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
      case 'publicado':
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
      case 'publicado':
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
      case 'publicado':
        return 'Publicado'
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
          {!isPublished ? (
            <>
              <Button variant="outline" size="sm" onClick={handlePreviewDesign}>
                <Eye className="size-4" />
                Vista previa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/perfiles/${profile.id}/personalizar`)}
              >
                <Palette className="size-4" />
                Personalizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={
                  onEdit ||
                  (() => router.push(`/dashboard/perfiles/${profile.id}/editar`))
                }
              >
                <Edit className="size-4" />
                Editar
              </Button>
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={!isComplete || isPublishing}
              >
                {isPublishing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {isPublishing ? 'Publicando...' : 'Publicar'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handlePreviewDesign}>
                <Eye className="size-4" />
                Vista previa
              </Button>
              <Button
                size="sm"
                onClick={handleOpenShareModal}
                className="gap-2"
              >
                <Share2 className="size-4" />
                Compartir
              </Button>
            </>
          )}
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
                {isPublished && profile.fecha_publicacion && (
                  <span className="text-xs text-muted-foreground">
                    Publicado el {formatDate(profile.fecha_publicacion)}
                  </span>
                )}
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

      {/* Mensaje de error al publicar */}
      {publishError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10">
              <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Error al publicar</p>
                <p className="text-sm text-destructive/80">{publishError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist de completitud (solo si no está publicado) */}
      {!isPublished && <ProfileCompletenessCheck profile={profile} />}

      {/* Modal de compartir */}
      {shareData && (
        <ShareProfileModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          profileData={shareData}
        />
      )}

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