"use client";
import { useState } from "react";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulación de petición HTTP
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (email === "admin@correo.com" && password === "Admin123!") {
        const token = "fake-jwt-token";
        localStorage.setItem("token", token);
        alert("Inicio de sesión exitoso ✅");
      } else {
        setError("Credenciales inválidas. Verifica tu correo o contraseña.");
      }
    } catch (err) {
      setError("Error al intentar iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
};
