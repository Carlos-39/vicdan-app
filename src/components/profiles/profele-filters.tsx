// src/components/profiles/profile-filters.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { ProfileFilters } from "@/types/profile"

interface ProfileFiltersProps {
  filters: ProfileFilters
  onFiltersChange: (filters: ProfileFilters) => void
}

export function ProfileFiltersComponent({ filters, onFiltersChange }: ProfileFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchTerm: e.target.value })
  }

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      estado: e.target.value as ProfileFilters['estado'],
    })
  }

  const handleClearSearch = () => {
    onFiltersChange({ ...filters, searchTerm: '' })
  }

  const hasActiveFilters = filters.searchTerm || (filters.estado && filters.estado !== 'todos')

  const handleClearAll = () => {
    onFiltersChange({ estado: 'todos', searchTerm: '' })
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre..."
          value={filters.searchTerm || ''}
          onChange={handleSearchChange}
          className="pl-9 pr-9"
        />
        {filters.searchTerm && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={handleClearSearch}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-2">
        <Select
          value={filters.estado || 'todos'}
          onChange={handleEstadoChange}
          className="flex-1"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="borrador">Borrador</option>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="shrink-0"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}