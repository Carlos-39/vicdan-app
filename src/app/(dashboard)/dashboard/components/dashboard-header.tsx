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
    <header className="bg-primary px-4 py-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            {data?.user?.name ? (
              <h1 className="text-primary-foreground font-semibold text-sm leading-tight animate-fade-up">
                {data.user.name}
              </h1>
            ) : (
              <span className="h-4 w-[120px] bg-neutral-50/25 rounded block animate-pulse" />
            )}
          </div>
          <Avatar className="h-10 w-10 bg-primary-foreground/20 border-2 border-primary-foreground/30">
            <AvatarFallback className="bg-transparent text-primary-foreground font-semibold text-sm">
              {getInitials(data?.user?.name)}
            </AvatarFallback>
          </Avatar>
          <HeaderOption />
        </div>
      </div>
    </header>
  );
}
