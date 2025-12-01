import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail } from "lucide-react"

interface ActivityItemProps {
  icon: LucideIcon
  iconBgColor: string
  title: string
  subtitle: string
  timestamp: string
  status: "completed" | "pending" | "draft"
  email?: string | null
  logoUrl?: string | null
  onClick?: () => void
}

const statusConfig = {
  completed: {
    label: "ACTIVO",
    className: "bg-gradient-to-r from-[var(--primary)] to-indigo-600 text-white shadow-md shadow-purple-500/20",
  },
  pending: {
    label: "INACTIVO",
    className: "bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-md shadow-purple-500/20",
  },
  draft: {
    label: "BORRADOR",
    className: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20",
  },
}

export function ActivityItem({ 
  icon: Icon, 
  iconBgColor, 
  title, 
  subtitle, 
  timestamp, 
  status, 
  email,
  logoUrl,
  onClick 
}: ActivityItemProps) {
  const statusInfo = statusConfig[status]
  const initials = subtitle
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl transition-all duration-200 border border-purple-100/50",
        onClick ? "cursor-pointer hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/30 hover:shadow-md hover:scale-[1.01] hover:border-purple-200" : ""
      )}
      onClick={onClick}
    >
      {/* Avatar o Icono */}
      {logoUrl ? (
        <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-purple-200">
          <AvatarImage src={logoUrl} alt={subtitle} />
          <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0", iconBgColor)}>
          <Icon className="h-6 w-6" />
        </div>
      )}
      
      {/* Información del perfil */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {title} <span className="text-[var(--primary)] font-medium">{subtitle}</span>
            </p>
            {email && (
              <div className="flex items-center gap-1.5 mt-1">
                <Mail className="h-3 w-3 text-purple-400" />
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium mt-1">{timestamp}</p>
      </div>
      
      {/* Badge de estado */}
      <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0", statusInfo.className)}>
        {statusInfo.label}
      </span>
    </div>
  )
}
