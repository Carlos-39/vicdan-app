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
          ? "text-white border-transparent hover:shadow-xl hover:scale-[1.02]" 
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-[1.02]",
      )}
      style={variant === "primary" ? {
        backgroundColor: "#877af7",
      } : undefined}
      onClick={onClick}
    >
      <div
        className={cn(
          "h-16 w-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
          variant === "primary" 
            ? "bg-white/20 backdrop-blur-sm shadow-lg" 
            : "shadow-md",
        )}
        style={variant === "secondary" ? {
          backgroundColor: "#877af710",
        } : undefined}
      >
        <Icon 
          className="h-8 w-8"
          style={{
            color: variant === "primary" ? "#ffffff" : "#877af7",
          }}
        />
      </div>
      <div className="flex-1 text-center space-y-1">
        <h3 
          className="font-bold text-lg"
          style={{
            color: variant === "primary" ? "#ffffff" : undefined,
          }}
        >
          {title}
        </h3>
        <p 
          className="text-sm leading-relaxed"
          style={{
            color: variant === "primary" ? "rgba(255, 255, 255, 0.9)" : undefined,
          }}
        >
          {description}
        </p>
      </div>
    </Card>
  )
}
