"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Profile {
  id: string;
  nombre: string;
  correo?: string;
  logo_url?: string;
}

interface DeleteProfileDialogProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (profileId: string) => Promise<void>;
}

const getInitials = (name: string) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function DeleteProfileDialog({
  profile,
  isOpen,
  onClose,
  onConfirm,
}: DeleteProfileDialogProps) {
  // 1. TODOS LOS HOOKS DEBEN IR AQUÍ ARRIBA
  const [isLoading, setIsLoading] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // CORRECCIÓN DE HOOKS: Aseguramos que el estado se resetee al abrir.
  React.useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
    }
  }, [isOpen]);

  // 2. LA LÓGICA DE RETORNO CONDICIONAL VA DESPUÉS DE LOS HOOKS
  if (!profile) {
    return null;
  }

  const handleConfirm = async () => {
    setIsLoading(true);
    if (profile.id) {
      await onConfirm(profile.id);
    }
    setIsLoading(false);
  };

  const profileName = profile.nombre || "Perfil Desconocido";
  const showImage = profile.logo_url && imageLoaded;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-6 w-6" />
            Confirmación de Eliminación
          </AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar permanentemente el siguiente perfil:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          {/* Logo/Avatar */}
          <Avatar
            // SOLUCIÓN DE RENDER: Usamos 'isOpen' como key para forzar la recarga del componente al abrir.
            key={isOpen ? "avatar-open" : "avatar-closed"}
            className="size-12 shrink-0 rounded-full overflow-hidden items-center justify-center bg-primary/10"
          >
            {/* GESTIÓN MANUAL CON <img>: Usamos img en lugar de AvatarImage para mayor robustez en modales */}
            {profile.logo_url && (
              <img
                src={profile.logo_url}
                alt={profileName}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
                // Ocultamos hasta que cargue
                style={{ display: imageLoaded ? "block" : "none" }}
                className="h-full w-full object-cover"
              />
            )}

            {/* Fallback (Iniciales) */}
            {!showImage && (
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {getInitials(profileName)}
              </AvatarFallback>
            )}
          </Avatar>

          {/* Detalles */}
          <div className="min-w-0">
            <p className="font-bold text-base truncate">{profileName}</p>
            {profile.correo && (
              <p className="text-sm text-gray-600 truncate">{profile.correo}</p>
            )}
          </div>
        </div>
        {/* FIN PANEL DE INFORMACIÓN */}

        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-red-800">
              **ADVERTENCIA:** Esta acción es **irreversible**. Se eliminarán
              todos los datos, enlaces y configuraciones asociadas al perfil.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirmar Eliminación
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
