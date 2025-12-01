// src/components/profiles/profile-delete-action.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteProfileDialog } from "./delete-profile-dialog";

interface ProfileDeleteActionProps {
  profileId: string;
  profileName: string;
  logoUrl?: string;
  children?: React.ReactNode;
}

async function deleteProfile(profileId: string): Promise<void> {
  const response = await fetch(`/api/perfiles/${profileId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    throw new Error("Perfil no encontrado o ya eliminado.");
  }

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Error desconocido del servidor." }));
    throw new Error(
      errorData.message ||
        `Error ${response.status}: Fallo al eliminar el perfil.`
    );
  }
}

export function ProfileDeleteAction({
  profileId,
  profileName,
  logoUrl,
  children,
}: ProfileDeleteActionProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const router = useRouter();

  if (!profileId || !profileName) {
    return null;
  }

  const profileData = { id: profileId, nombre: profileName, logo_url: logoUrl };

  const handleConfirmDeletion = async (id: string) => {
    try {
      await deleteProfile(id);

      toast.success(`✅ El perfil "${profileName}" ha sido eliminado.`, {
        duration: 3000,
      });

      router.push("/dashboard/perfiles");
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Ocurrió un error inesperado.";
      toast.error(`❌ ${errorMessage}`, { duration: 5000 });
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsModalOpen(true)} className="w-full">
        {children}
      </div>

      <DeleteProfileDialog
        profile={profileData}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDeletion}
      />
    </>
  );
}
