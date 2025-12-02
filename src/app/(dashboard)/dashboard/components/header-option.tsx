import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, BookOpen, Users, Link2, Palette, Edit, Trash2, Eye, Search, Filter, Settings, LogOut, CheckCircle2, Lightbulb, Zap, Share2, Image as ImageIcon, Layout, Type } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

export default function HeaderOption() {
  const router = useRouter();
  const [showManual, setShowManual] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/login" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Q" &&
        event.shiftKey &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        handleLogout();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleLogout]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-700 hover:bg-gray-100"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4">
          <DropdownMenuItem onClick={() => setShowManual(true)}>
            <BookOpen className="mr-2 h-4 w-4" />
            Manual de Usuario
          </DropdownMenuItem>
          <DropdownMenuItem  onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> 
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showManual} onOpenChange={setShowManual}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#877af7", color: "#ffffff" }}>
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Manual de Usuario</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  Guía completa para aprovechar al máximo VicDan Technology
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            {/* Introducción */}
            <Card className="border-2" style={{ borderColor: "#877af7" }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#877af7] to-indigo-600 text-white">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">¿Qué es VicDan Technology?</h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      VicDan Technology es una plataforma web profesional diseñada para crear y gestionar perfiles tipo Linktree. 
                      Permite a los administradores crear perfiles personalizados con enlaces, información de contacto, 
                      iconos sociales y personalización visual completa para compartir con sus clientes o audiencia.
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      <strong>Ideal para:</strong> Emprendedores, negocios, influencers y profesionales que necesitan 
                      un punto centralizado para compartir todos sus enlaces importantes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Procesos Principales */}
            <section>
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Users className="h-6 w-6" style={{ color: "#877af7" }} />
                Procesos Principales
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-lg">Registro Cliente</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Crea un nuevo perfil desde cero con información completa del cliente.
                    </p>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Información básica del emprendimiento</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Foto de perfil personalizada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Descripción opcional del negocio</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <Settings className="h-5 w-5" style={{ color: "#877af7" }} />
                      </div>
                      <h4 className="font-semibold text-lg">Gestión Perfiles</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Administra todos tus perfiles desde un solo lugar.
                    </p>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Ver, editar y eliminar perfiles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Filtrar por estado (activo, inactivo)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Búsqueda rápida de perfiles</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Navegación */}
            <section>
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Layout className="h-6 w-6" style={{ color: "#877af7" }} />
                Navegación y Secciones
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#877af7] to-indigo-600 text-white">
                        <Zap className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold">Dashboard</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      Tu página principal con acceso rápido a todas las funciones. Aquí encontrarás:
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-gray-600 list-disc list-inside">
                      <li>Métricas de tus perfiles</li>
                      <li>Accesos rápidos a procesos principales</li>
                      <li>Actividad reciente</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#877af7] to-indigo-600 text-white">
                        <Users className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold">Perfiles</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      Gestión completa de todos tus perfiles con herramientas avanzadas:
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-gray-600 list-disc list-inside">
                      <li>Búsqueda por nombre o correo</li>
                      <li>Filtros por estado</li>
                      <li>Vista previa antes de compartir</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Funcionalidades Detalladas */}
            <section>
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6" style={{ color: "#877af7" }} />
                Funcionalidades Principales
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-5 w-5" style={{ color: "#877af7" }} />
                      <h4 className="font-semibold">Crear Perfiles</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      Crea perfiles personalizados con toda la información necesaria:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                      <li>Nombre del emprendimiento</li>
                      <li>Correo electrónico único</li>
                      <li>Foto de perfil (JPG, PNG, WebP - máx. 5MB)</li>
                      <li>Descripción opcional</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Link2 className="h-5 w-5" style={{ color: "#877af7" }} />
                      <h4 className="font-semibold">Gestionar Enlaces</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      Agrega y organiza múltiples enlaces:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                      <li>Enlaces principales (tarjetas)</li>
                      <li>Iconos sociales (Instagram, Facebook, etc.)</li>
                      <li>Orden personalizable</li>
                      <li>Activar/desactivar enlaces</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Palette className="h-5 w-5" style={{ color: "#877af7" }} />
                      <h4 className="font-semibold">Personalizar Diseño</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      Personaliza completamente la apariencia:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                      <li>Colores primarios y secundarios</li>
                      <li>Tipografías y tamaños</li>
                      <li>Espaciado y layout</li>
                      <li>Posición de iconos sociales</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Edit className="h-5 w-5" style={{ color: "#877af7" }} />
                      <h4 className="font-semibold">Editar Perfiles</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      Modifica cualquier información del perfil:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                      <li>Actualizar información básica</li>
                      <li>Cambiar foto de perfil</li>
                      <li>Modificar estado (activo/inactivo)</li>
                      <li>Guardar cambios en tiempo real</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Eye className="h-5 w-5" style={{ color: "#877af7" }} />
                      <h4 className="font-semibold">Vista Previa</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      Visualiza cómo se verá el perfil:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                      <li>Vista previa en tiempo real</li>
                      <li>Compartir enlace único</li>
                      <li>Acceso público al perfil</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Trash2 className="h-5 w-5" style={{ color: "#877af7" }} />
                      <h4 className="font-semibold">Eliminar Perfiles</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      Elimina perfiles que ya no necesites:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                      <li>Confirmación antes de eliminar</li>
                      <li>Eliminación permanente</li>
                      <li>Notificación de éxito</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Personalización Avanzada */}
            <Card className="border-2" style={{ borderColor: "#877af7" }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#877af7] to-indigo-600 text-white">
                    <Palette className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-3">Personalización de Diseño</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Accede a la sección "Personalizar Diseño" desde cualquier perfil para personalizar completamente su apariencia:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Type className="h-4 w-4" style={{ color: "#877af7" }} />
                          Tipografía
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                          <li>Selecciona la fuente del perfil</li>
                          <li>Ajusta tamaños de texto</li>
                          <li>Personaliza espaciado</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Palette className="h-4 w-4" style={{ color: "#877af7" }} />
                          Colores
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                          <li>Color primario y secundario</li>
                          <li>Selector de color visual</li>
                          <li>Vista previa en tiempo real</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Layout className="h-4 w-4" style={{ color: "#877af7" }} />
                          Layout
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                          <li>Mostrar/ocultar avatar</li>
                          <li>Posición de iconos sociales</li>
                          <li>Espaciado entre elementos</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Link2 className="h-4 w-4" style={{ color: "#877af7" }} />
                          Enlaces
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                          <li>Agregar tarjetas de enlace</li>
                          <li>Gestionar iconos sociales</li>
                          <li>Reordenar elementos</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consejos y Mejores Prácticas */}
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-amber-500 text-white">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-3 text-amber-900">Consejos y Mejores Prácticas</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-amber-800">Organización</h4>
                        <ul className="text-sm text-amber-900 space-y-1 list-disc list-inside">
                          <li>Mantén la información de los perfiles actualizada</li>
                          <li>Organiza los enlaces en orden de importancia</li>
                          <li>Usa nombres descriptivos para tus perfiles</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-amber-800">Presentación</h4>
                        <ul className="text-sm text-amber-900 space-y-1 list-disc list-inside">
                          <li>Usa imágenes de perfil de buena calidad (mín. 500x500px)</li>
                          <li>Revisa la vista previa antes de compartir</li>
                          <li>Prueba el perfil en diferentes dispositivos</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-amber-800">Diseño</h4>
                        <ul className="text-sm text-amber-900 space-y-1 list-disc list-inside">
                          <li>Elige colores que representen tu marca</li>
                          <li>Mantén la consistencia visual</li>
                          <li>Usa tipografías legibles</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-amber-800">Enlaces</h4>
                        <ul className="text-sm text-amber-900 space-y-1 list-disc list-inside">
                          <li>Verifica que todos los enlaces funcionen</li>
                          <li>Actualiza enlaces obsoletos regularmente</li>
                          <li>Agrega descripciones claras a cada enlace</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menú de Opciones */}
            <section>
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Settings className="h-6 w-6" style={{ color: "#877af7" }} />
                Menú de Opciones
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="h-5 w-5" style={{ color: "#877af7" }} />
                      <h4 className="font-semibold">Manual de Usuario</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      Accede a esta guía completa en cualquier momento desde el menú de tres puntos 
                      (<MoreVertical className="h-4 w-4 inline" />) en la esquina superior derecha del header.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <LogOut className="h-5 w-5" style={{ color: "#877af7" }} />
                      <h4 className="font-semibold">Cerrar Sesión</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      Cierra tu sesión de forma segura desde el menú de opciones.
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Atajo de teclado:</strong> Shift + Cmd/Ctrl + Q
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                ¿Necesitas ayuda adicional? Contacta al equipo de soporte.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                VicDan Technology v1.0
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
