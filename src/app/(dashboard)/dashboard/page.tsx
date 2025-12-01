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
  Users,
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

interface DashboardMetrics {
  totalProfiles: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"dashboard" | "profiles">("dashboard");
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProfiles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const getAuthToken = useCallback(async () => {
    return (session as any)?.accessToken;
  }, [session]);

  const fetchMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      const token = await getAuthToken();
      if (!token) return;

      // Obtener todos los perfiles para contar
      const profilesResponse = await fetch(`/api/perfiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (profilesResponse.ok) {
        const profilesData = await profilesResponse.json();
        const perfiles = profilesData.perfiles || [];

        setMetrics({
          totalProfiles: perfiles.length,
        });
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setMetricsLoading(false);
    }
  }, [getAuthToken]);

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
      fetchMetrics();
    }
  }, [session, fetchRecentProfiles, fetchMetrics]);

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

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Métricas */}
        <section className="grid grid-cols-1 gap-4">
          <Card 
            className="p-5 border-0 shadow-md"
            style={{
              backgroundColor: "#877af7",
              color: "#ffffff",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Perfiles</p>
                <p className="text-3xl font-bold">
                  {metricsLoading ? (
                    <span className="inline-block h-8 w-12 bg-white/20 rounded animate-pulse" />
                  ) : (
                    metrics.totalProfiles
                  )}
                </p>
              </div>
              <div 
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        </section>

        {/* Procesos Principales */}
        <section>
          <h2 className="text-foreground font-semibold text-lg mb-4">
            Procesos Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Actividad Reciente */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground font-semibold text-lg">
              Actividad Reciente
            </h2>
            <Button
              variant="link"
              className="text-primary text-sm font-medium p-0 h-auto"
              style={{
                color: "#877af7",
              }}
              onClick={() => router.push("/dashboard/perfiles")}
            >
              Ver todo
            </Button>
          </div>
          <Card className="p-4 space-y-3 border shadow-sm bg-white">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div 
                  className="animate-spin rounded-full h-6 w-6 border-b-2"
                  style={{
                    borderColor: "#877af7",
                  }}
                />
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
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}