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

  const onSubmit = (data: FormData) => {
    console.log("Datos enviados:", data);
    setSuccess(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Registro de Administrador</h1>

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
      </div>
    </div>
  );
}
