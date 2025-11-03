import { Bell, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  return (
    <header className="bg-primary px-4 py-4 rounded-b-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 bg-primary-foreground/20">
            <AvatarFallback className="bg-transparent text-primary-foreground font-semibold text-base">
              AD
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-primary-foreground font-semibold text-base leading-tight">Administrador</h1>
            <p className="text-primary-foreground/80 text-sm">Panel de Control</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
