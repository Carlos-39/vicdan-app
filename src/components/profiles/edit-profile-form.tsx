"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { z } from "zod";
import { ProfileWithAdmin } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Schema de validación para edición
const ALLOWED_IMAGE_FORMATS = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const editProfileSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),

  correo: z
    .string()
    .email("Por favor ingresa un correo electrónico válido")
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal("")),

  estado: z.enum(["activo", "inactivo", "borrador"], {
    required_error: "Debes seleccionar un estado",
  }),

  fotoPerfil: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "La imagen no puede ser mayor a 5MB")
    .refine(
      (file) => ALLOWED_IMAGE_FORMATS.includes(file.type),
      "Solo se permiten formatos JPG, PNG y WebP"
    )
    .optional()
    .or(z.literal("")),
});

type EditProfileInput = z.infer<typeof editProfileSchema>;

interface EditProfileFormProps {
  profile: ProfileWithAdmin;
  onSuccess?: () => void;
}

export function EditProfileForm({ profile, onSuccess }: EditProfileFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    profile.logo_url || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    mode: "onChange",
    defaultValues: {
      nombre: profile.nombre,
      correo: profile.correo || "",
      estado: profile.estado,
    },
  });

  const fotoPerfilFile = watch("fotoPerfil");

  // Efecto para resetear el formulario si cambia el perfil
  useEffect(() => {
    reset({
      nombre: profile.nombre,
      correo: profile.correo || "",
      estado: profile.estado,
    });
    setImagePreview(profile.logo_url || null);
    setRemoveCurrentImage(false);
  }, [profile, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar antes de mostrar preview
      if (file.size > MAX_FILE_SIZE) {
        setImagePreview(profile.logo_url || null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setRemoveCurrentImage(false);
      };
      reader.readAsDataURL(file);
      setValue("fotoPerfil", file, { shouldDirty: true });
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setRemoveCurrentImage(true);
    setValue("fotoPerfil", "", { shouldDirty: true });
  };

  const onSubmit = async (data: EditProfileInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Obtener el token de la sesión
      const token = (session as any)?.accessToken;
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación');
      }

      const formData = new FormData();
      formData.append("nombre", data.nombre.trim());
      formData.append("correo", data.correo || "");
      formData.append("estado", data.estado);

      // Manejar la imagen
      if (removeCurrentImage) {
        formData.append("logo_url", ""); // Indicar que se debe eliminar
      } else if (data.fotoPerfil instanceof File) {
        formData.append("logo", data.fotoPerfil);
      }

      // Llamar API para actualizar perfil con el token en el header
      const response = await fetch(`/api/perfiles/${profile.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar el perfil");
      }

      setSubmitSuccess(true);

      // Mostrar mensaje de éxito y redirigir
      setTimeout(() => {
        setSubmitSuccess(false);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/dashboard/perfiles/${profile.id}`);
        }
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Error al actualizar el perfil"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Título */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Editar Perfil</CardTitle>
            <p className="text-sm text-muted-foreground">
              Modifica la información de tu perfil
            </p>
          </CardHeader>
        </Card>

        {/* Mensajes de validación global */}
        {submitError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-success">
            ¡Perfil actualizado exitosamente! Redirigiendo...
          </div>
        )}

        {/* Sección: Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre completo <span className="text-destructive">*</span>
              </label>
              <Input
                {...register("nombre")}
                type="text"
                placeholder="Juan Pérez"
                aria-invalid={!!errors.nombre}
              />
              {errors.nombre && (
                <p className="text-destructive text-sm mt-1">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Correo Electrónico
              </label>
              <Input
                {...register("correo")}
                type="email"
                placeholder="juan@ejemplo.com"
                aria-invalid={!!errors.correo}
              />
              {errors.correo && (
                <p className="text-destructive text-sm mt-1">
                  {errors.correo.message}
                </p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Estado <span className="text-destructive">*</span>
              </label>
              <select
                {...register("estado")}
                className={cn(
                  "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors",
                  "focus-visible:outline-hidden focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  errors.estado && "border-destructive aria-invalid:ring-destructive/20"
                )}
                aria-invalid={!!errors.estado}
              >
                <option value="borrador">Borrador</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              {errors.estado && (
                <p className="text-destructive text-sm mt-1">
                  {errors.estado.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sección: Foto de Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logo del Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview de imagen */}
            {imagePreview && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                  <Image
                    src={imagePreview}
                    alt="Preview perfil"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="gap-2"
                >
                  <X className="size-4" />
                  Eliminar imagen
                </Button>
              </div>
            )}

            {/* Upload de imagen */}
            <div className="flex items-center justify-center">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="size-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {imagePreview ? "Cambiar imagen" : "Seleccionar imagen"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG o WebP (Máx 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Mensajes de error para imagen */}
            {errors.fotoPerfil && (
              <p className="text-destructive text-sm text-center">
                {errors.fotoPerfil.message as string}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="flex-1 gap-2"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>

        {!isDirty && !isSubmitting && (
          <p className="text-sm text-muted-foreground text-center">
            No hay cambios para guardar
          </p>
        )}
      </form>
    </div>
  );
}