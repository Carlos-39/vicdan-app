// src/app/dashboard/perfiles/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { ProfileWithAdmin, ProfileFilters } from "@/types/profile"
import { ProfileCard } from "@/components/profiles/profile-card"
import { ProfileFiltersComponent } from "@/components/profiles/profele-filters"
import { DeleteProfileDialog } from "@/components/profiles/delete-profile-dialog"
import { ViewProfileDialog } from "@/components/profiles/view-profile-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { verifyAuthToken } from '@/lib/jwt';

export default function ProfilesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [profiles, setProfiles] = useState<ProfileWithAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProfileFilters>({
    estado: 'todos',
    searchTerm: '',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Dialog states
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithAdmin | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Obtener token JWT de la sesión
  const getAuthToken = useCallback(async () => {
    // El token JWT está en la sesión de NextAuth
    // Necesitarás ajustar esto según cómo guardas el token
    // Opción 1: Si lo guardas en la sesión
    return (session as any)?.accessToken
    
    // Opción 2: Si usas cookies
    // return document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
  }, [session])

  // Fetch profiles
  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = await getAuthToken()
      if (!token) {
        setError('No se pudo obtener el token de autenticación')
        return
      }

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '12',
      })

      if (filters.estado && filters.estado !== 'todos') {
        params.append('estado', filters.estado)
      }

      if (filters.searchTerm) {
        params.append('search', filters.searchTerm)
      }

      const response = await fetch(`/api/profiles?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar los perfiles')
      }

      const data = await response.json()
      setProfiles(data.profiles)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [page, filters, getAuthToken])

  useEffect(() => {
    if (session) {
      fetchProfiles()
    }
  }, [session, fetchProfiles])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [filters])

  // Handlers
  const handleView = (profile: ProfileWithAdmin) => {
    setSelectedProfile(profile)
    setViewDialogOpen(true)
  }

  const handleEdit = (profile: ProfileWithAdmin) => {
    // TODO: Navigate to edit page or open edit modal
    router.push(`/dashboard/perfiles/${profile.id}/editar`)
  }

  const handleDeleteClick = (profile: ProfileWithAdmin) => {
    setSelectedProfile(profile)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProfile) return

    try {
      setIsDeleting(true)
      
      const token = await getAuthToken()
      if (!token) {
        alert('No se pudo obtener el token de autenticación')
        return
      }

      const response = await fetch(`/api/profiles/${selectedProfile.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el perfil')
      }

      // Refresh the list
      await fetchProfiles()
      setDeleteDialogOpen(false)
      setSelectedProfile(null)
    } catch (err) {
      console.error('Error deleting profile:', err)
      alert('Error al eliminar el perfil. Por favor, intenta de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="px-4 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Perfiles</h1>
              <p className="text-sm text-muted-foreground">
                {total} perfil{total !== 1 ? 'es' : ''} en total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push('/dashboard/perfiles/nuevo')}>
                <Plus className="size-4" />
                Nuevo perfil
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                Volver
              </Button>
            </div>
          </div>

          {/* Filters */}
          <ProfileFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-7xl mx-auto">
        {/* Loading State */}
        {loading && page === 1 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Error al cargar perfiles</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button onClick={fetchProfiles} className="mt-4" variant="outline">
                Intentar de nuevo
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && profiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg">No se encontraron perfiles</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filters.searchTerm || (filters.estado && filters.estado !== 'todos')
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza creando tu primer perfil'}
              </p>
              {!filters.searchTerm && (!filters.estado || filters.estado === 'todos') && (
                <Button onClick={() => router.push('/dashboard/perfiles/nuevo')} className="mt-4">
                  <Plus className="size-4" />
                  Crear perfil
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Profiles Grid */}
        {!loading && !error && profiles.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Dialogs */}
      <DeleteProfileDialog
        profile={selectedProfile}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <ViewProfileDialog
        profile={selectedProfile}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </div>
  )
}