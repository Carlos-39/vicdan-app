"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TextInput from "./components/TextInput";
import PasswordStrengthBar from "./components/PasswordStrengthBar";
import { usePasswordStrength } from "./hooks/usePasswordStrength";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import styles from "./RegisterAdmin.module.css";
import Link from "next/link";

const schema = yup.object({
  name: yup.string().required("El nombre es obligatorio"),
  email: yup
    .string()
    .email("Formato de correo inválido ej: example@example.com")
    .required("El correo es obligatorio"),
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(8, "Debe tener al menos 8 caracteres")
    .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
    .matches(/[a-z]/, "Debe contener al menos una minúscula")
    .matches(/[0-9]/, "Debe contener al menos un número")
    .matches(/[^A-Za-z0-9]/, "Debe contener al menos un símbolo"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
});

type FormData = yup.InferType<typeof schema>;

export default function RegisterAdminPage() {
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [passwordStarted, setPasswordStarted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");
  const email = watch("email", "");
  const name = watch("name", "");

  const { strength, label, color } = usePasswordStrength(password);

  useEffect(() => {
    setPasswordStarted(password.length > 0);
  }, [password]);

  useEffect(() => {
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isReady =
      name.trim() !== "" &&
      validEmail &&
      password.length >= 8 &&
      confirmPassword === password &&
      strength > 0;
    setIsFormValid(isReady);
  }, [name, email, password, confirmPassword, strength]);

  const [error, setError] = useState<string>("");

  const onSubmit = async (data: FormData) => {
    try {
      setError(""); // Limpiar errores previos
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Error al registrar");
        return;
      }

      setSuccess(true);
      // Redirigir al login después de un registro exitoso
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Error:", error);
      alert(error.message || "Error al registrar el administrador");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden py-4">
      {/* Decorative purple blobs */}
      <div 
        className="absolute top-0 left-0 w-96 h-96 opacity-20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" 
        style={{ 
          background: 'var(--primary)',
          animationDuration: '4s'
        }}
      ></div>
      <div 
        className="absolute bottom-0 right-0 w-96 h-96 opacity-20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" 
        style={{ 
          background: 'color-mix(in srgb, var(--primary) 80%, white)',
          animationDelay: '1s',
          animationDuration: '4s'
        }}
      ></div>
      <div 
        className="absolute top-1/2 left-1/2 w-64 h-64 opacity-15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" 
        style={{ 
          background: 'color-mix(in srgb, var(--primary) 70%, black)',
          animationDelay: '0.5s',
          animationDuration: '4s'
        }}
      ></div>

      {/* Header Section */}
      <div className="relative z-10 text-center mb-4 px-4">
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{
          background: 'var(--primary)',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Crea tu cuenta</h1>
        <p className="text-gray-600">Completa el formulario para registrarte</p>
      </div>

      <div className={styles.container}>
        <div className={styles.card}>
          {/* Tab buttons */}
          <div className={styles.tabButtons}>
            <Link href="/login" className={`${styles.tabButton} ${styles.tabInactive}`}>
              Iniciar sesión
            </Link>
            <button type="button" className={`${styles.tabButton} ${styles.tabActive}`}>
              Registrarse
            </button>
          </div>

        {success && (
          <div className={styles.successMessage}>
            ¡Registro exitoso! Redirigiendo al login...
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Nombre</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={20} />
              <input
                type="text"
                className={styles.input}
                placeholder="Tu nombre completo"
                {...register("name")}
              />
            </div>
            {errors.name && <p className={styles.errorText}>{errors.name.message}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Correo electrónico</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={20} />
              <input
                type="email"
                className={styles.input}
                placeholder="tu@email.com"
                {...register("email")}
              />
            </div>
            {errors.email && <p className={styles.errorText}>{errors.email.message}</p>}
          </div>

          {/* Contraseña */}
          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={20} />
              <input
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="........"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className={styles.errorText}>{errors.password.message}</p>}
            <p className={styles.passwordHint}>
              La contraseña debe tener al menos 8 caracteres, incluir una
              mayúscula, una minúscula, un número y un símbolo.
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirmar contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={20} />
              <input
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="........"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className={styles.errorText}>{errors.confirmPassword.message}</p>}
          </div>

          {passwordStarted && (
            <PasswordStrengthBar
              strength={strength}
              label={label}
              color={color}
            />
          )}

          <button
            type="submit"
            disabled={!isFormValid}
            className={`${styles.submitButton} ${
              !isFormValid ? styles.disabled : ""
            }`}
          >
            Registrar
          </button>

          {success && <p className={styles.success}>¡Registro exitoso!</p>}
        </form>
        </div>
      </div>

      {/* Footer */}
      <p className={styles.footer}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className={styles.footerLink}>
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
