"use client"

import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ProcessCardProps {
  title: string
  description: string
  icon: LucideIcon
  variant?: "primary" | "secondary"
  onClick?: () => void
}

export function ProcessCard({ title, description, icon: Icon, variant = "secondary", onClick }: ProcessCardProps) {
  return (
    <Card
      className={cn(
        "p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-0",
        variant === "primary" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "h-16 w-16 rounded-2xl flex items-center justify-center",
          variant === "primary" ? "bg-primary-foreground/20" : "bg-primary/10",
        )}
      >
        <Icon className={cn("h-8 w-8", variant === "primary" ? "text-primary-foreground" : "text-primary")} />
      </div>
      <div>
        <h3 className="font-semibold text-base mb-1">{title}</h3>
        <p className={cn("text-sm", variant === "primary" ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {description}
        </p>
      </div>
    </Card>
  )
}
