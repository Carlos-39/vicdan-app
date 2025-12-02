"use client";

import * as React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Profile {
  id: string;
  nombre: string;
  correo?: string;
  logo_url?: string;
}

interface DeleteProfileDialogProps {
  profile: Profile | null;
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onConfirm: (profileId: string) => Promise<void>;
  isDeleting?: boolean;
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
  open,
  onClose,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteProfileDialogProps) {
  // Compatibilidad con ambas formas de uso
  const dialogOpen = open !== undefined ? open : isOpen ?? false;
  const handleClose = (open: boolean) => {
    // No permitir cerrar mientras se está eliminando
    if (loading && !open) {
      return;
    }
    
    if (onOpenChange) {
      onOpenChange(open);
    } else if (onClose && !open) {
      onClose();
    }
  };

  // 1. TODOS LOS HOOKS DEBEN IR AQUÍ ARRIBA
  const [isLoading, setIsLoading] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // CORRECCIÓN DE HOOKS: Aseguramos que el estado se resetee al abrir.
  React.useEffect(() => {
    if (dialogOpen) {
      setImageLoaded(false);
      setIsLoading(false);
    }
  }, [dialogOpen]);

  // Usar isDeleting del prop si está disponible, sino usar el estado local
  const loading = isDeleting !== undefined ? isDeleting : isLoading;

  // 2. LA LÓGICA DE RETORNO CONDICIONAL VA DESPUÉS DE LOS HOOKS
  if (!profile) {
    return null;
  }

  const handleConfirm = async () => {
    if (loading) return; // Prevenir múltiples clics
    
    if (isDeleting === undefined) {
      setIsLoading(true);
    }
    
    try {
      if (profile.id) {
        await onConfirm(profile.id);
      }
    } catch (error) {
      console.error("Error en handleConfirm:", error);
      // El error ya se maneja en onConfirm
    } finally {
      if (isDeleting === undefined) {
        setIsLoading(false);
      }
    }
  };

  const profileName = profile.nombre || "Perfil Desconocido";
  const showImage = profile.logo_url && imageLoaded;

  return (
    <AlertDialog open={dialogOpen} onOpenChange={handleClose} modal={true}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-lg">
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
              <Trash2 className="size-5 text-primary" />
            </div>
            <span className="text-foreground">Eliminar Perfil</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground pt-2">
            Esta acción eliminará permanentemente el perfil y todos sus datos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Información del perfil */}
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
          <Avatar
            key={isOpen ? "avatar-open" : "avatar-closed"}
            className="size-14 shrink-0 border-2"
            style={{
              borderColor: "#877af7",
            }}
          >
            {profile.logo_url && (
              <AvatarImage
                src={profile.logo_url}
                alt={profileName}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
                className="object-cover"
              />
            )}
            <AvatarFallback 
              className="bg-primary/10 text-primary text-lg font-semibold"
              style={{
                backgroundColor: "#877af720",
                color: "#877af7",
              }}
            >
              {getInitials(profileName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-base text-foreground truncate">
              {profileName}
            </p>
            {profile.correo && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {profile.correo}
              </p>
            )}
          </div>
        </div>

        {/* Advertencia */}
        <div className="rounded-lg p-4 border bg-amber-50/50 dark:bg-amber-950/20" style={{
          borderColor: "#877af730",
        }}>
          <div className="flex items-start gap-3">
            <AlertTriangle 
              className="size-5 shrink-0 mt-0.5" 
              style={{ color: "#877af7" }}
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Acción irreversible
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Se eliminarán todos los datos, enlaces, configuraciones y contenido asociado a este perfil. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel 
            disabled={loading}
            className="mt-2 sm:mt-0"
            onClick={(e) => {
              if (loading) {
                e.preventDefault();
              }
            }}
          >
            Cancelar
          </AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white"
            style={{
              backgroundColor: "#877af7",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Confirmar Eliminación
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
