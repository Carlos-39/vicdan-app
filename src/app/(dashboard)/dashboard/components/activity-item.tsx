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
    className: "text-white font-bold",
    style: {
      backgroundColor: "#877af7",
    },
  },
  pending: {
    label: "INACTIVO",
    className: "text-white font-bold",
    style: {
      backgroundColor: "#9ca3af",
    },
  },
  draft: {
    label: "BORRADOR",
    className: "text-white font-bold",
    style: {
      backgroundColor: "#877af7",
      opacity: 0.7,
    },
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
        "flex items-start gap-3 p-4 rounded-lg transition-all duration-200 border bg-white",
        onClick ? "cursor-pointer hover:bg-gray-50 hover:shadow-sm hover:border-gray-300" : ""
      )}
      style={{
        borderColor: "#e5e7eb",
      }}
      onClick={onClick}
    >
      {/* Avatar o Icono */}
      {logoUrl ? (
        <Avatar 
          className="h-12 w-12 flex-shrink-0 border-2"
          style={{
            borderColor: "#877af7",
          }}
        >
          <AvatarImage src={logoUrl} alt={subtitle} />
          <AvatarFallback 
            className="font-semibold"
            style={{
              backgroundColor: "#877af7",
              color: "#ffffff",
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div 
          className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: "#877af720",
          }}
        >
          <Icon 
            className="h-6 w-6"
            style={{
              color: "#877af7",
            }}
          />
        </div>
      )}
      
      {/* Información del perfil */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">
              Perfil <span style={{ color: "#877af7" }}>{subtitle}</span>
            </p>
            {email && (
              <div className="flex items-center gap-1.5 mt-1">
                <Mail 
                  className="h-3 w-3"
                  style={{
                    color: "#877af7",
                  }}
                />
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium mt-1">{timestamp}</p>
      </div>
      
      {/* Badge de estado */}
      <span 
        className={cn("text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0", statusInfo.className)}
        style={statusInfo.style}
      >
        {statusInfo.label}
      </span>
    </div>
  )
}
