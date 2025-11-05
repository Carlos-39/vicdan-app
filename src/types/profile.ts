// src/types/profile.ts

export type ProfileStatus = 'activo' | 'inactivo';

export interface Profile {
  id: string;
  administrador_id: string | null;
  nombre: string;
  logo_url: string | null;
  correo: string | null;
  estado: ProfileStatus;
  fechas: string;
}

export interface ProfileWithAdmin extends Profile {
  administrador?: {
    id: string;
    nombre: string;
    correo: string | null;
  };
}

export interface ProfileFilters {
  estado?: ProfileStatus | 'todos';
  searchTerm?: string;
}

export interface ProfilesResponse {
  profiles: ProfileWithAdmin[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateProfileInput {
  nombre: string;
  correo?: string;
  logo_url?: string;
  estado?: ProfileStatus;
}

export interface UpdateProfileInput extends Partial<CreateProfileInput> {
  id: string;
}