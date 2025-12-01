"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { createProfileSchema, type CreateProfileInput } from "@/lib/profile";

export function NewProfileForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateProfileInput>({
    resolver: zodResolver(createProfileSchema),
    mode: "onChange",
  });

  const fotoPerfilFile = watch("fotoPerfil");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar antes de mostrar preview
      if (file.size > 5 * 1024 * 1024) {
        setImagePreview(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue("fotoPerfil", file);
    }
  };

  const onSubmit = async (data: CreateProfileInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append("nombre", data.nombre.trim());
      formData.append("correo", data.email);
      formData.append("descripcion", data.descripcion || "");
      if (data.fotoPerfil instanceof File) {
        formData.append("logo", data.fotoPerfil);
      }

      // Llamar API para crear perfil
      const response = await fetch("/api/perfiles", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear el perfil");
      }

      setSubmitSuccess(true);
      setImagePreview(null);
      reset();

      // Mostrar mensaje de éxito temporalmente
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error al crear perfil:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Error al crear el perfil"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-lg rounded-2xl p-6 md:p-8 space-y-6 border border-[var(--primary)]/20"
      >
        {/* Título */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">
            Crear Nuevo Perfil
          </h1>
          <p className="text-muted-foreground mt-2">
            Ingresa los datos básicos para crear tu perfil
          </p>
        </div>

        {/* Mensajes de validación global */}
        {submitError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-success">
            Perfil creado exitosamente
          </div>
        )}

        {/* Sección: Información Básica */}
        <div className="bg-muted/30 p-6 rounded-lg border border-[var(--primary)]/15">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-destructive">*</span> Información Básica
          </h2>

          <div className="space-y-4">
            {/* Nombre del Emprendimiento */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nombre del Emprendimiento
              </label>
              <input
                {...register("nombre")}
                type="text"
                placeholder="Mi Emprendimiento"
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  errors.nombre
                    ? "border-destructive bg-destructive/10"
                    : "border-input bg-background"
                } focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]`}
              />
              {errors.nombre && (
                <p className="text-destructive text-sm mt-1">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Correo Electrónico
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="juan@ejemplo.com"
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  errors.email
                    ? "border-destructive bg-destructive/10"
                    : "border-input bg-background"
                } focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]`}
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Foto de Perfil */}
        <div className="bg-muted/30 p-6 rounded-lg border border-[var(--primary)]/15">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Foto de Perfil
          </h2>

          <div className="space-y-4">
            {/* Preview de imagen */}
            {imagePreview && (
              <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-[var(--primary)]">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview perfil"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Upload de imagen */}
            <div className="flex items-center justify-center">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--primary)]/40 rounded-lg cursor-pointer hover:bg-[var(--primary)]/5 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 text-[var(--primary)] mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG o WebP (Máx 5MB)
                  </p>
                </div>
                <input
                  {...register("fotoPerfil")}
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
                {"Por favor selecciona una imagen válida"}
              </p>
            )}
          </div>
        </div>

        {/* Sección: Descripción (Opcional) */}
        <div className="bg-muted/30 p-6 rounded-lg border border-[var(--primary)]/15">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Información Adicional
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Descripción (Opcional)
            </label>
            <textarea
              {...register("descripcion")}
              placeholder="Cuéntanos más sobre este perfil..."
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                errors.descripcion
                  ? "border-destructive bg-destructive/10"
                  : "border-input bg-background"
              } focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] resize-none`}
            />
            {errors.descripcion && (
              <p className="text-destructive text-sm mt-1">
                {errors.descripcion.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Máximo 500 caracteres
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full md:flex-1 px-6 py-3 border border-input rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:flex-1 px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-indigo-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:shadow-purple-500/20"
          >
            {isSubmitting ? "Guardando..." : "Guardar Perfil"}
          </button>
        </div>
      </form>
    </div>
  );
}