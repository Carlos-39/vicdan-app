"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  FileEdit,
  Plus,
  Clock,
  Download,
  MoreHorizontal,
} from "lucide-react";
import { DashboardHeader } from "./components/dashboard-header";
import { ProcessCard } from "./components/process-card";
import { ActivityItem } from "./components/activity-item";
import { QuickActionButton } from "./components/quick-action-button";
import { BottomNavigation } from "./components/bottom-navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data for activities
const mockActivities = [
  {
    id: 1,
    icon: CheckCircle,
    iconBgColor: "bg-success/20 text-success",
    title: "Perfil",
    subtitle: "Juan Martínez",
    timestamp: "Hace 15 min",
    status: "completed" as const,
  },
  {
    id: 2,
    icon: AlertCircle,
    iconBgColor: "bg-pending/20 text-pending-foreground",
    title: "Enlace único generado para",
    subtitle: "Ana López",
    timestamp: "Hace 32 min",
    status: "pending" as const,
  },
  {
    id: 3,
    icon: FileEdit,
    iconBgColor: "bg-success/20 text-success",
    title: "Personalización",
    subtitle: "Carlos Ruiz",
    timestamp: "Hace 1 hora",
    status: "completed" as const,
  },
  {
    id: 4,
    icon: FileEdit,
    iconBgColor: "bg-draft/20 text-draft-foreground",
    title: "Registro",
    subtitle: "María García",
    timestamp: "Hace 2 horas",
    status: "draft" as const,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "profiles" | "config"
  >("dashboard");


  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardHeader />

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Main Processes Section */}
        <section>
          <h2 className="text-foreground font-semibold text-lg mb-4">
            Procesos Principales
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <ProcessCard
              title="Registro Cliente"
              description="Crear nuevo perfil"
              icon={UserPlus}
              variant="primary"
              onClick={() => router.push("/create-profile")}
            />
            <ProcessCard
              title="Gestión Perfiles"
              description="Crear, editar, eliminar"
              icon={ClipboardList}
              onClick={() => router.push("/dashboard/perfiles")}
            />
          </div>
        </section>

        {/* Recent Activity Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground font-semibold text-lg">
              Actividad Reciente
            </h2>
            <Button
              variant="link"
              className="text-primary text-sm font-medium p-0 h-auto"
            >
              Ver todo
            </Button>
          </div>
          <Card className="p-2 space-y-1 border-0 shadow-sm">
            {mockActivities.map((activity) => (
              <ActivityItem key={activity.id} {...activity} />
            ))}
          </Card>
        </section>

        {/* Quick Actions Section */}
        <section>
          <h2 className="text-foreground font-semibold text-lg mb-4">
            Acciones Rápidas
          </h2>
          <Card className="p-2 space-y-1 border-0 shadow-sm">
            <QuickActionButton
              icon={Plus}
              label="Nuevo perfil"
              onClick={() => router.push("/create-profile")}

            />
            <QuickActionButton
              icon={Clock}
              label="Ver pendientes"
              onClick={() => console.log("View pending items")}
            />
            <QuickActionButton
              icon={Download}
              label="Exportar datos"
              onClick={() => console.log("Export data")}
            />
            <QuickActionButton
              icon={MoreHorizontal}
              label="Operaciones masivas"
              onClick={() => console.log("Bulk operations")}
            />
          </Card>
        </section>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}