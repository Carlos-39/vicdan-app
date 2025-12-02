"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import HeaderOption from "./header-option";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function DashboardHeader() {
  const { data } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine if we should show the back button
  const showBackButton = 
    pathname?.includes("/create-profile") ||
    pathname?.includes("/perfiles") ||
    pathname?.includes("/perfil");

  const handleBack = () => {
    router.back();
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="hover:bg-gray-100 active:scale-95 animate-in fade-in slide-in-from-left-2 duration-300 group"
              aria-label="Volver atrás"
            >
              <ArrowLeft className="h-8 w-8 group-hover:scale-110 group-active:scale-95 transition-transform duration-75" />
            </Button>
          )}  
          <Avatar 
            className="h-12 w-12 border-2 transition-all duration-300"
            style={{
              borderColor: "#877af7",
            }}
          >
            <AvatarFallback 
              className="font-semibold text-base"
              style={{
                backgroundColor: "#877af7",
                color: "#ffffff",
              }}
            >
              {getInitials(data?.user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block transition-all duration-300">
            {data?.user?.name ? (
              <div>
                <h1 className="text-foreground font-semibold text-base leading-tight">
                  {data.user.name}
                </h1>
                <p className="text-muted-foreground text-sm">
                  Panel de Control
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="h-4 w-[120px] bg-gray-200 rounded block animate-pulse" />
                <span className="h-3 w-[100px] bg-gray-200 rounded block animate-pulse" />
              </div>
            )}
          </div>
        </div>
        <HeaderOption />
      </div>
    </header>
  );
}
