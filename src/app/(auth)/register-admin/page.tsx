"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TextInput from "./components/TextInput";
import PasswordStrengthBar from "./components/PasswordStrengthBar";
import { usePasswordStrength } from "./hooks/usePasswordStrength";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./RegisterAdmin.module.css";

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
        throw new Error(result.error || "Error al registrar");
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
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 opacity-30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ background: 'var(--primary)' }}></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 opacity-30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ background: 'var(--primary)', animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 opacity-20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ background: 'var(--primary)', animationDelay: '0.5s' }}></div>

      <div className={styles.container}>
        <div className={styles.card}>
          {/* Logo decorativo */}
          <div className="bg-primary mx-auto mb-4" style={{ 
            width: '56px', 
            height: '56px',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px color-mix(in srgb, var(--primary) 25%, transparent)',
            animation: 'bounce 2s ease-in-out infinite'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
          
          <h1 className={styles.title}>Registro de Administrador</h1>
          <p style={{ 
            textAlign: 'center', 
            color: '#6b7280', 
            fontSize: '0.9375rem', 
            marginBottom: '1.5rem'
          }}>
            Completa el formulario para crear tu cuenta
          </p>

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <TextInput
            label="Nombre"
            type="text"
            {...register("name")}
            error={errors.name?.message}
          />

          <TextInput
            label="Correo electrónico"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />

          {/* Contraseña */}
          <div className="relative">
            <TextInput
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              error={errors.password?.message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-500 hover:text-purple-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              La contraseña debe tener al menos 8 caracteres, incluir una
              mayúscula, una minúscula, un número y un símbolo.
            </p>
          </div>

          <div className="relative">
            <TextInput
              label="Confirmar contraseña"
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-500 hover:text-purple-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
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
            className={`${styles.button} ${
              isFormValid ? styles.buttonEnabled : styles.buttonDisabled
            }`}
          >
            Registrar
          </button>

          {success && <p className={styles.success}>¡Registro exitoso!</p>}
        </form>
        
        {/* Back to Login */}
        <p style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          ¿Ya tienes cuenta?{' '}
          <a 
            href="/login" 
            style={{ 
              color: 'var(--primary)', 
              fontWeight: 600,
              textDecoration: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
    </div>
  );
}
