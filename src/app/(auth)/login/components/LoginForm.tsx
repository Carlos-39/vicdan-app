"use client";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import styles from "./LoginForm.module.css";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError(undefined);
    startTransition(async () => {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
    });
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {/* Logo decorativo */}
      <div className="bg-primary" style={{ 
        width: '56px', 
        height: '56px', 
        margin: '0 auto 1rem',
        borderRadius: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 16px color-mix(in srgb, var(--primary) 25%, transparent)',
        animation: 'bounce 2s ease-in-out infinite'
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h2 className={styles.title}>Inicio de Sesión</h2>
      <p style={{ 
        textAlign: 'center', 
        color: '#6b7280', 
        fontSize: '0.9375rem', 
        marginTop: '-0.5rem',
        marginBottom: '0.5rem'
      }}>
        Ingresa tus credenciales para continuar
      </p>

      <div className={styles.field}>
        <label className={styles.label}>Correo electrónico</label>
        <input
          type="email"
          className={styles.input}
          placeholder="ejemplo@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Contraseña</label>
        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            className={styles.input}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-gray-500 hover:text-purple-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`${styles.button} ${
            !isFormValid || loading ? styles.disabled : ""
          }`}
        >
          {loading ? (
            <div className={styles.spinnerContainer}>
              <span className={styles.spinner}></span>
              Ingresando...
            </div>
          ) : (
            "Iniciar sesión"
          )}
        </button>

        <Link href="/register-admin" className={`${styles.button} ${styles.registerAdmin}`}>
          Registrar Administrador
        </Link>

        <button
          type="button"
          className={styles.forgot}
          onClick={() => alert("Funcionalidad no implementada aún.")}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </form>
  );
}
