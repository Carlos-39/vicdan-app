// src/components/profiles/profile-card-delete-menu-item.tsx
"use client";

import { Trash2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ProfileDeleteAction } from "./profile-delete-action";

interface ProfileCardDeleteMenuItemProps {
  profileId: string;
  profileName: string;
  logoUrl?: string;
}

export function ProfileCardDeleteMenuItem({
  profileId,
  profileName,
  logoUrl,
}: ProfileCardDeleteMenuItemProps) {
  return (
    <ProfileDeleteAction
      profileId={profileId}
      profileName={profileName}
      logoUrl={logoUrl}
    >
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Eliminar
      </DropdownMenuItem>
    </ProfileDeleteAction>
  );
}
