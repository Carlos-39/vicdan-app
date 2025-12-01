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
        "p-5 flex flex-col items-center text-center gap-4 cursor-pointer transition-all duration-200 border-2",
        variant === "primary" 
          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary/30 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02]" 
          : "bg-card hover:bg-gradient-to-br hover:from-accent hover:to-accent/50 border-border/50 hover:border-primary/30 hover:shadow-lg hover:scale-[1.02]",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
          variant === "primary" 
            ? "bg-white/20 backdrop-blur-sm shadow-lg" 
            : "bg-gradient-to-br from-primary/10 to-primary/5 shadow-md",
        )}
      >
        <Icon className={cn("h-8 w-8", variant === "primary" ? "text-white" : "text-primary")} />
      </div>
      <div className="flex-1 text-center space-y-1">
        <h3 className={cn("font-bold text-lg", variant === "primary" ? "text-white" : "text-foreground")}>
          {title}
        </h3>
        <p className={cn("text-sm leading-relaxed", variant === "primary" ? "text-white/90" : "text-muted-foreground")}>
          {description}
        </p>
      </div>
    </Card>
  )
}
