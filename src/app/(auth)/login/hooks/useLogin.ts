"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError("");

    try {
      
      if (email === "admin@vicdan.com" && password === "123456") {
        const fakeToken = "fake-jwt-token";
        const userData = { name: "Administrador", email };

        localStorage.setItem("token", fakeToken);
        localStorage.setItem("user", JSON.stringify(userData));

        router.push("/dashboard");
      } else {
        setError("Credenciales inválidas. Verifica tu correo o contraseña.");
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
};
