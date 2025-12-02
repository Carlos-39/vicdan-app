// src/components/profiles/profile-card-delete-menu-item.tsx
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DeleteProfileDialog } from "./delete-profile-dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProfileCardDeleteMenuItemProps {
  profileId: string;
  profileName: string;
  logoUrl?: string;
}

async function deleteProfile(profileId: string, accessToken: string): Promise<void> {
  console.log("Iniciando eliminación del perfil:", profileId);
  
  const response = await fetch(`/api/perfiles/${profileId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log("Respuesta del servidor:", response.status, response.statusText);

  if (response.status === 404) {
    throw new Error("Perfil no encontrado o ya eliminado.");
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `Error ${response.status}: ${response.statusText}` };
    }
    
    console.error("Error al eliminar perfil:", errorData);
    throw new Error(
      errorData.error || errorData.message || `Error ${response.status}: Fallo al eliminar el perfil.`
    );
  }

  const result = await response.json().catch(() => ({}));
  console.log("Perfil eliminado exitosamente:", result);
}

export function ProfileCardDeleteMenuItem({
  profileId,
  profileName,
  logoUrl,
}: ProfileCardDeleteMenuItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleClick = (e: Event) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDeletion = async (id: string) => {
    console.log("handleConfirmDeletion llamado con ID:", id);
    
    if (!session?.accessToken) {
      toast.error("❌ No se pudo verificar tu sesión. Por favor, inicia sesión nuevamente.", {
        duration: 5000,
      });
      setIsModalOpen(false);
      return;
    }

    setIsDeleting(true);

    try {
      console.log("Iniciando proceso de eliminación...");
      await deleteProfile(id, session.accessToken);
      console.log("Eliminación completada exitosamente");

      // Guardar mensaje de éxito en sessionStorage para mostrarlo después de recargar
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('profileDeleteSuccess', JSON.stringify({
          message: `El perfil "${profileName}" ha sido eliminado exitosamente.`,
          timestamp: Date.now()
        }));
      }

      toast.success(`✅ El perfil "${profileName}" ha sido eliminado exitosamente.`, {
        duration: 3000,
      });

      // Cerrar el modal después de mostrar el mensaje
      setTimeout(() => {
        setIsModalOpen(false);
        setIsDeleting(false);
        
        // Refrescar la página
        if (typeof window !== 'undefined') {
          window.location.reload();
        } else {
          router.refresh();
        }
      }, 1500);
      
    } catch (e) {
      console.error("Error completo al eliminar perfil:", e);
      const errorMessage =
        e instanceof Error ? e.message : "Ocurrió un error inesperado.";
      
      // Guardar mensaje de error en sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('profileDeleteError', JSON.stringify({
          message: errorMessage,
          timestamp: Date.now()
        }));
      }
      
      toast.error(`❌ ${errorMessage}`, { duration: 5000 });
      setIsDeleting(false);
      // No cerrar el modal si hay error para que el usuario pueda intentar de nuevo
    }
  };

  const profileData = { id: profileId, nombre: profileName, logo_url: logoUrl };

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          setIsModalOpen(true);
        }}
        className="text-primary hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
        style={{
          color: "#877af7",
        }}
      >
        <div className="flex items-center gap-2 cursor-pointer text-red-400">
          <Trash2 className="mr-2 h-4 w-4 text-red-400" />
          Eliminar
        </div>
      </DropdownMenuItem>

      <DeleteProfileDialog
        profile={profileData}
        isOpen={isModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsModalOpen(false);
          }
        }}
        onConfirm={handleConfirmDeletion}
        isDeleting={isDeleting}
      />
    </>
  );
}
