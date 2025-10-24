"use client"

import { Home, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavigationProps {
  activeTab?: "dashboard" | "profiles" | "config"
  onTabChange?: (tab: "dashboard" | "profiles" | "config") => void
}

export function BottomNavigation({ activeTab = "dashboard", onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "dashboard" as const, icon: Home, label: "Dashboard" },
    { id: "profiles" as const, icon: Users, label: "Perfiles" },
    { id: "config" as const, icon: Settings, label: "Config" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around px-4 py-3 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
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
