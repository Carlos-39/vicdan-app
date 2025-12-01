"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  UserPlus,
  ClipboardList,
  CheckCircle,
  FileEdit,
  Clock,
} from "lucide-react";
import { DashboardHeader } from "./components/dashboard-header";
import { ProcessCard } from "./components/process-card";
import { ActivityItem } from "./components/activity-item";
import { BottomNavigation } from "./components/bottom-navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RecentProfile {
  id: string;
  nombre: string;
  correo: string | null;
  logo_url: string | null;
  estado: string;
  fechas: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"dashboard" | "profiles">("dashboard");
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthToken = useCallback(async () => {
    return (session as any)?.accessToken;
  }, [session]);

  const fetchRecentProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`/api/perfiles?orden=recientes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      const perfiles = data.perfiles || [];
      // Tomar solo los 4 más recientes
      setRecentProfiles(perfiles.slice(0, 4));
    } catch (error) {
      console.error("Error fetching recent profiles:", error);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    if (session) {
      fetchRecentProfiles();
    }
  }, [session, fetchRecentProfiles]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const getActivityIcon = (estado: string) => {
    switch (estado) {
      case "activo":
        return CheckCircle;
      case "inactivo":
        return Clock;
      case "borrador":
        return FileEdit;
      default:
        return FileEdit;
    }
  };

  const getActivityStatus = (estado: string): "completed" | "pending" | "draft" => {
    switch (estado) {
      case "activo":
        return "completed";
      case "inactivo":
        return "pending";
      case "borrador":
        return "draft";
      default:
        return "draft";
    }
  };

  const getIconBgColor = (estado: string) => {
    // Usar el color morado de la aplicación para todos los estados
    switch (estado) {
      case "activo":
        return "bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white shadow-lg shadow-purple-500/30";
      case "inactivo":
        return "bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg shadow-purple-500/30";
      case "borrador":
        return "bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg shadow-purple-500/30";
      default:
        return "bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg shadow-purple-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardHeader />

      <main className="px-4 py-6 max-w-4xl mx-auto flex items-center justify-center min-h-[calc(100vh-180px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-center">
          {/* Main Processes Section */}
          <section className="flex flex-col items-center">
            
            <div className="flex flex-col gap-4 w-full">
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
          <section className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground font-semibold text-lg">
                Actividad Reciente
              </h2>
              <Button
                variant="link"
                className="text-primary text-sm font-medium p-0 h-auto"
                onClick={() => router.push("/dashboard/perfiles")}
              >
                Ver todo
              </Button>
            </div>
            <Card className="p-4 space-y-3 border border-purple-200/50 shadow-lg bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/10">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : recentProfiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No hay actividad reciente
                </div>
              ) : (
                recentProfiles.map((profile) => {
                  const Icon = getActivityIcon(profile.estado);
                  return (
                    <ActivityItem
                      key={profile.id}
                      icon={Icon}
                      iconBgColor={getIconBgColor(profile.estado)}
                      title="Perfil"
                      subtitle={profile.nombre}
                      timestamp={formatTimeAgo(profile.fechas)}
                      status={getActivityStatus(profile.estado)}
                      email={profile.correo}
                      logoUrl={profile.logo_url}
                      onClick={() => router.push(`/dashboard/perfiles/${profile.id}`)}
                    />
                  );
                })
              )}
            </Card>
          </section>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}