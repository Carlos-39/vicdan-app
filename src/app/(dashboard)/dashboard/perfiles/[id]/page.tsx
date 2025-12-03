// src/app/dashboard/perfiles/[id]/page.tsx
"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ProfileWithAdmin } from "@/types/profile"
import { ProfileDetail } from "@/components/profiles/profile-detail"
import { ProfileDetailSkeleton } from "@/components/profiles/profile-detail-skeleton"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/app/(dashboard)/dashboard/components/dashboard-header"
import { BottomNavigation } from "@/app/(dashboard)/dashboard/components/bottom-navigation"

interface ProfileDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProfileDetailPage({ params }: ProfileDetailPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const resolvedParams = use(params)
  const profileId = resolvedParams.id

  const [profile, setProfile] = useState<ProfileWithAdmin | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Obtener token JWT de la sesión
  const getAuthToken = useCallback(async () => {
    return (session as any)?.accessToken
  }, [session])

  // Fetch profile by ID
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = await getAuthToken()
      if (!token) {
        setError('No se pudo obtener el token de autenticación')
        return
      }

      const response = await fetch(`/api/perfiles/${profileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar el perfil')
      }

      const data = await response.json()
      setProfile(data.perfil)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [profileId, getAuthToken])

  useEffect(() => {
    if (session) {
      fetchProfile()
    }
  }, [session, fetchProfile])

  const handleEdit = () => {
    router.push(`/dashboard/perfiles/${profileId}/editar`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <DashboardHeader />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <ProfileDetailSkeleton />
        </div>
        <BottomNavigation activeTab="profiles" />
      </div>
    )
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center gap-4 max-w-md">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Error al cargar el perfil</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {error || 'No se pudo encontrar el perfil'}
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={fetchProfile} variant="outline">
                Intentar de nuevo
              </Button>
              <Button onClick={() => router.push('/dashboard/perfiles')}>
                Volver al listado
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardHeader />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <ProfileDetail 
          profile={profile} 
          onEdit={handleEdit}
          showBackButton={true}
        />
      </div>
      <BottomNavigation activeTab="profiles" />
    </div>
  )
}