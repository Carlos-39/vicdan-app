import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, BookOpen } from "lucide-react";
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
            className="h-9 w-9 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4">
          <DropdownMenuItem onClick={() => setShowManual(true)}>
            <BookOpen className="mr-2 h-4 w-4" />
            Manual de Usuario
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            Cerrar Sesión
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showManual} onOpenChange={setShowManual}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manual de Usuario - VicDan Technology</DialogTitle>
            <DialogDescription>
              Guía completa de uso de la aplicación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <section>
              <h3 className="font-semibold text-lg mb-2">¿Qué es VicDan Technology?</h3>
              <p className="text-sm text-muted-foreground">
                VicDan Technology es una aplicación web diseñada para crear y gestionar perfiles tipo Linktree. 
                Permite a los administradores crear perfiles personalizados con enlaces, información de contacto 
                y personalización visual para compartir con sus clientes o audiencia.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">Procesos Principales</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Registro Cliente</h4>
                  <p className="text-sm text-muted-foreground">
                    Permite crear un nuevo perfil desde cero. Al hacer clic, serás redirigido a un formulario 
                    donde podrás ingresar la información del cliente, agregar enlaces sociales, personalizar 
                    colores y diseño del perfil.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Gestión Perfiles</h4>
                  <p className="text-sm text-muted-foreground">
                    Accede a la lista completa de perfiles creados. Desde aquí puedes ver todos los perfiles, 
                    editarlos, eliminarlos o crear nuevos. También puedes ver el estado de cada perfil y acceder 
                    a su vista previa.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">Navegación</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Dashboard</h4>
                  <p className="text-sm text-muted-foreground">
                    La página principal donde puedes acceder rápidamente a los procesos principales. 
                    Desde aquí puedes crear nuevos perfiles o gestionar los existentes.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Perfiles</h4>
                  <p className="text-sm text-muted-foreground">
                    Vista completa de todos los perfiles creados. Puedes buscar, filtrar, editar o eliminar 
                    perfiles desde esta sección.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">Funcionalidades</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Crear perfiles personalizados con información del cliente</li>
                <li>Agregar múltiples enlaces sociales y de contacto</li>
                <li>Personalizar colores y diseño de cada perfil</li>
                <li>Editar y actualizar perfiles existentes</li>
                <li>Eliminar perfiles que ya no necesites</li>
                <li>Ver vista previa de cómo se verá el perfil para el cliente</li>
                <li>Generar enlaces únicos para compartir cada perfil</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">Menú de Opciones</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Manual de Usuario</h4>
                  <p className="text-sm text-muted-foreground">
                    Accede a esta guía en cualquier momento desde el menú de tres puntos en la esquina superior derecha.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Cerrar Sesión</h4>
                  <p className="text-sm text-muted-foreground">
                    Cierra tu sesión de forma segura. También puedes usar el atajo de teclado Shift + Cmd/Ctrl + Q.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">Consejos</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Mantén la información de los perfiles actualizada</li>
                <li>Usa imágenes de perfil de buena calidad para mejor presentación</li>
                <li>Organiza los enlaces en orden de importancia</li>
                <li>Revisa la vista previa antes de compartir el perfil con el cliente</li>
              </ul>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
