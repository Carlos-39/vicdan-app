// src/app/dashboard/perfiles/page.tsx
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { ProfileWithAdmin, ProfileFilters } from "@/types/profile"
import { ProfileCard } from "@/components/profiles/profile-card"
import { ProfileFiltersComponent } from "@/components/profiles/profele-filters"
import { DeleteProfileDialog } from "@/components/profiles/delete-profile-dialog"
import { ViewProfileDialog } from "@/components/profiles/view-profile-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/app/(dashboard)/dashboard/components/dashboard-header"
import { BottomNavigation } from "../components/bottom-navigation"

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
  
  // Alert states
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null)
  const successAlertRef = useRef<HTMLDivElement>(null)
  const errorAlertRef = useRef<HTMLDivElement>(null)

  // Obtener token JWT de la sesión
  const getAuthToken = useCallback(async () => {
    return (session as any)?.accessToken
  }, [session])

  // Fetch profiles usando GET con el endpoint /api/perfiles
  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = await getAuthToken()
      if (!token) {
        setError('No se pudo obtener el token de autenticación')
        return
      }

      // Construir parámetros según lo que espera el backend
      const params = new URLSearchParams()

      // Filtro por estado (solo si no es 'todos')
      if (filters.estado && filters.estado !== 'todos') {
        params.append('estado', filters.estado)
      }

      // Término de búsqueda
      if (filters.searchTerm) {
        params.append('busqueda', filters.searchTerm)
      }

      // Orden por defecto: recientes
      params.append('orden', 'recientes')

      const response = await fetch(`/api/perfiles?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar los perfiles')
      }

      const data = await response.json()
      
      // El backend devuelve { perfiles: [...] }
      const perfilesList = data.perfiles || []
      
      // Paginación local (el backend no pagina)
      const pageSize = 12
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedProfiles = perfilesList.slice(startIndex, endIndex)

      setProfiles(paginatedProfiles)
      setTotal(perfilesList.length)
      setTotalPages(Math.ceil(perfilesList.length / pageSize))
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

  // Verificar mensajes de eliminación en sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const successData = sessionStorage.getItem('profileDeleteSuccess')
      const errorData = sessionStorage.getItem('profileDeleteError')
      
      if (successData) {
        try {
          const data = JSON.parse(successData)
          // Solo mostrar si el mensaje es reciente (menos de 5 segundos)
          if (Date.now() - data.timestamp < 5000) {
            setDeleteSuccessMessage(data.message)
            // Scroll automático al mensaje
            setTimeout(() => {
              successAlertRef.current?.scrollIntoView({ 
                behavior: "smooth", 
                block: "start" 
              })
            }, 100)
            // Limpiar después de 5 segundos
            setTimeout(() => {
              setDeleteSuccessMessage(null)
              sessionStorage.removeItem('profileDeleteSuccess')
            }, 5000)
          } else {
            sessionStorage.removeItem('profileDeleteSuccess')
          }
        } catch (e) {
          sessionStorage.removeItem('profileDeleteSuccess')
        }
      }
      
      if (errorData) {
        try {
          const data = JSON.parse(errorData)
          if (Date.now() - data.timestamp < 5000) {
            setDeleteErrorMessage(data.message)
            // Scroll automático al mensaje
            setTimeout(() => {
              errorAlertRef.current?.scrollIntoView({ 
                behavior: "smooth", 
                block: "start" 
              })
            }, 100)
            setTimeout(() => {
              setDeleteErrorMessage(null)
              sessionStorage.removeItem('profileDeleteError')
            }, 5000)
          } else {
            sessionStorage.removeItem('profileDeleteError')
          }
        } catch (e) {
          sessionStorage.removeItem('profileDeleteError')
        }
      }
    }
  }, [])

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

      const response = await fetch(`/api/perfiles/${selectedProfile.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el perfil')
      }

      // Guardar mensaje de éxito
      const successMessage = `El perfil "${selectedProfile.nombre}" ha sido eliminado exitosamente.`
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('profileDeleteSuccess', JSON.stringify({
          message: successMessage,
          timestamp: Date.now()
        }))
      }
      
      // Refresh the list
      await fetchProfiles()
      setDeleteDialogOpen(false)
      setSelectedProfile(null)
      
      // Mostrar mensaje y hacer scroll
      setDeleteSuccessMessage(successMessage)
      setTimeout(() => {
        successAlertRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        })
      }, 100)
      setTimeout(() => {
        setDeleteSuccessMessage(null)
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('profileDeleteSuccess')
        }
      }, 5000)
    } catch (err) {
      console.error('Error deleting profile:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el perfil. Por favor, intenta de nuevo.'
      
      // Guardar mensaje de error
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('profileDeleteError', JSON.stringify({
          message: errorMessage,
          timestamp: Date.now()
        }))
      }
      
      setDeleteErrorMessage(errorMessage)
      setTimeout(() => {
        errorAlertRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        })
      }, 100)
      setTimeout(() => {
        setDeleteErrorMessage(null)
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('profileDeleteError')
        }
      }, 5000)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardHeader />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="px-4 py-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Perfiles</h1>
              <p className="text-sm text-muted-foreground">
                {total} perfil{total !== 1 ? 'es' : ''} en total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push('/create-profile')}>
                <Plus className="size-4" />
                Nuevo perfil
              </Button>
            </div>
          </div>

          {/* Filters */}
          <ProfileFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Alertas de eliminación */}
        {deleteSuccessMessage && (
          <div 
            ref={successAlertRef}
            className="mb-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg 
                  className="w-6 h-6 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-green-800">
                  ¡Perfil eliminado exitosamente!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {deleteSuccessMessage}
                </p>
              </div>
              <button
                onClick={() => {
                  setDeleteSuccessMessage(null)
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('profileDeleteSuccess')
                  }
                }}
                className="flex-shrink-0 text-green-600 hover:text-green-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {deleteErrorMessage && (
          <div 
            ref={errorAlertRef}
            className="mb-4 p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg 
                  className="w-6 h-6 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-red-900">
                  Error al eliminar perfil
                </p>
                <p className="text-sm text-red-800 mt-1">
                  {deleteErrorMessage}
                </p>
              </div>
              <button
                onClick={() => {
                  setDeleteErrorMessage(null)
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('profileDeleteError')
                  }
                }}
                className="flex-shrink-0 text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

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
        profile={selectedProfile ? {
          id: selectedProfile.id,
          nombre: selectedProfile.nombre,
          correo: selectedProfile.correo || undefined,
          logo_url: selectedProfile.logo_url || undefined,
        } : null}
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

      <BottomNavigation activeTab="profiles" />
    </div>
  )
}
