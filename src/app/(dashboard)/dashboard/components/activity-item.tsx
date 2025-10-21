import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityItemProps {
  icon: LucideIcon
  iconBgColor: string
  title: string
  subtitle: string
  timestamp: string
  status: "completed" | "pending" | "draft"
}

const statusConfig = {
  completed: {
    label: "COMPLETADO",
    className: "bg-success/20 text-success-foreground",
  },
  pending: {
    label: "PENDIENTE",
    className: "bg-pending text-pending-foreground",
  },
  draft: {
    label: "BORRADOR",
    className: "bg-draft text-draft-foreground",
  },
}

export function ActivityItem({ icon: Icon, iconBgColor, title, subtitle, timestamp, status }: ActivityItemProps) {
  const statusInfo = statusConfig[status]

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", iconBgColor)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight mb-1">
          {title} <span className="text-muted-foreground font-normal">{subtitle}</span>
        </p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-md whitespace-nowrap", statusInfo.className)}>
        {statusInfo.label}
      </span>
    </div>
  )
}
