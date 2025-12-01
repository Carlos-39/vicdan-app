"use client"

import { Home, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface BottomNavigationProps {
  activeTab?: "dashboard" | "profiles"
  onTabChange?: (tab: "dashboard" | "profiles") => void
}

export function BottomNavigation({ activeTab = "dashboard", onTabChange }: BottomNavigationProps) {
  const router = useRouter();
  
  const tabs = [
    { id: "dashboard" as const, icon: Home, label: "Dashboard", path: "/dashboard" },
    { id: "profiles" as const, icon: Users, label: "Perfiles", path: "/dashboard/perfiles" },
  ]

  const handleTabClick = (tab: typeof tabs[0]) => {
    onTabChange?.(tab.id);
    router.push(tab.path);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around px-4 py-3 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
