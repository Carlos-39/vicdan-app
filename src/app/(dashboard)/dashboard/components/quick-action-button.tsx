"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickActionButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
}

export function QuickActionButton({ icon: Icon, label, onClick }: QuickActionButtonProps) {
  return (
    <Button
      variant="ghost"
      className="justify-start gap-2 h-auto py-3 px-4 text-sm font-medium hover:bg-accent"
      onClick={onClick}
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </Button>
  )
}
