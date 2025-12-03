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
  Key,
  Copy,
  Check,
} from "lucide-react";
import { DashboardHeader } from "./components/dashboard-header";
import { ProcessCard } from "./components/process-card";
import { ActivityItem } from "./components/activity-item";
import { ActivityItemSkeleton } from "./components/activity-item-skeleton";
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
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

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
      default:
        return Clock;
    }
  };

  const getActivityStatus = (estado: string): "completed" | "pending" => {
    switch (estado) {
      case "activo":
        return "completed";
      case "inactivo":
        return "pending";
      default:
        return "pending";
    }
  };
  

  const getIconBgColor = (estado: string) => {
    // Usar el color morado de la aplicación para todos los estados
    switch (estado) {
      case "activo":
        return "bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white shadow-lg shadow-purple-500/30";
      case "inactivo":
        return "bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg shadow-purple-500/30";
      default:
        return "bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg shadow-purple-500/30";
    }
  };

  const handleGenerateCode = useCallback(async () => {
    try {
      setIsGenerating(true);
      setCodeError(null);
      const token = await getAuthToken();
      if (!token) {
        setCodeError("No estás autenticado");
        return;
      }

      const response = await fetch("/api/auth/codigo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        setCodeError(result.error || "Error al generar el código");
        return;
      }

      setGeneratedCode(result.codigo);
      setIsCopied(false);
    } catch (error) {
      console.error("Error generating code:", error);
      setCodeError("Error inesperado al generar el código");
    } finally {
      setIsGenerating(false);
    }
  }, [getAuthToken]);

  const handleCopyCode = useCallback(async () => {
    if (!generatedCode) return;

    try {
      await navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      setCodeError("No se pudo copiar al portapapeles");
    }
  }, [generatedCode]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardHeader />

      <main className="px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto space-y-4 sm:space-y-6">
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
          <h2 className="text-foreground font-semibold text-base sm:text-lg mb-3 sm:mb-4">
            Procesos Principales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-foreground font-semibold text-base sm:text-lg">
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
              <div className="space-y-11">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ActivityItemSkeleton key={i} />
                ))}
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

         {/* Generar Código de Registro */}
         <section>
          <h2 className="text-foreground font-semibold text-base sm:text-lg mb-4">
            Códigos de Registro
          </h2>
          <Card className="p-4 sm:p-5 border shadow-sm bg-white">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
                <div 
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{
                    backgroundColor: "rgba(135, 122, 247, 0.1)",
                  }}
                >
                  <Key className="h-5 w-5" style={{ color: "#877af7" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground font-medium text-sm sm:text-base">Generar código de registro</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Crea un código para permitir el registro de nuevos usuarios
                  </p>
                </div>
              </div>

              {codeError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm">{codeError}</p>
                </div>
              )}

              {generatedCode && (
                <div className="p-3 sm:p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Código generado:</p>
                      <p className="font-mono text-xs sm:text-sm font-semibold text-foreground break-all">
                        {generatedCode}
                      </p>
                    </div>
                    <Button
                      onClick={handleCopyCode}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 w-full sm:w-auto"
                      style={{
                        borderColor: "#877af7",
                        color: "#877af7",
                      }}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateCode}
                disabled={isGenerating}
                className="w-full text-sm sm:text-base"
                style={{
                  backgroundColor: "#877af7",
                  color: "#ffffff",
                }}
              >
                {isGenerating ? (
                  <>
                    <div 
                      className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"
                    />
                    <span className="hidden sm:inline">Generando...</span>
                    <span className="sm:hidden">Generando</span>
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Generar nuevo código</span>
                    <span className="sm:hidden">Generar código</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </section>
        
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}