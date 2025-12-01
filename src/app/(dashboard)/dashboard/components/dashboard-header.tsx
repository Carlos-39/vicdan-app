"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import HeaderOption from "./header-option";
import { useSession } from "next-auth/react";

export function DashboardHeader() {
  const { data } = useSession();
  
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
          <Avatar 
            className="h-12 w-12 border-2"
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
          <div className="hidden sm:block">
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
