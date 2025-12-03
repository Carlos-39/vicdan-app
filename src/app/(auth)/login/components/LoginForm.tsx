"use client";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
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
      try {
        // Primero, iniciar sesión con NextAuth (evita otra llamada bloqueante en producción)
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          // Mapear errores técnicos de NextAuth a mensajes amigables
          let errorMessage = 'Error de autenticación';
          
          switch (result.error) {
            case 'CredentialsSignin':
              errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
              break;
            case 'Configuration':
              errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
              break;
            case 'AccessDenied':
              errorMessage = 'Acceso denegado. Verifica tus credenciales.';
              break;
            case 'Verification':
              errorMessage = 'Error de verificación. Intenta nuevamente.';
              break;
            default:
              errorMessage = result.error.includes('Credenciales') 
                ? 'Credenciales incorrectas. Verifica tu email y contraseña.'
                : 'Error de conexión. Por favor, intenta nuevamente.';
          }
          
          setError(errorMessage);
          // Reportar intento fallido al endpoint (no bloqueante)
          void fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          }).catch((e) => console.warn('Reporte de intento de login fallido:', e));
          return;
        }

        // Reportar intento exitoso en background (no bloqueante)
        void fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }).catch((e) => console.warn('Reporte de intento de login (background) falló:', e));

        router.push("/dashboard");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (error) {
        console.error('Error en login:', error);
        setError('Error de conexión. Por favor, intenta nuevamente.');
      }
    });
  };

  return (
    <>
      <form className={styles.form} onSubmit={onSubmit}>
        {/* Tab buttons */}
        <div className={styles.tabButtons}>
          <button type="button" className={`${styles.tabButton} ${styles.tabActive}`}>
            Iniciar sesión
          </button>
          <Link href="/register-admin" className={`${styles.tabButton} ${styles.tabInactive}`}>
            Registrarse
          </Link>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Correo electrónico</label>
          <div className={styles.inputWrapper}>
            <Mail className={styles.inputIcon} size={20} />
            <input
              type="email"
              className={styles.input}
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Contraseña</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              type={showPassword ? "text" : "password"}
              className={styles.input}
              placeholder="........"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.eyeButton}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/*<div className={styles.forgotPassword}>
          <button
            type="button"
            className={styles.forgot}
            onClick={() => alert("Funcionalidad no implementada aún.")}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>*/}

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`${styles.submitButton} ${
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
      </form>

      {/* Footer */}
      <p className={styles.footer}>
        ¿No tienes una cuenta?{' '}
        <Link href="/register-admin" className={styles.footerLink}>
          Regístrate gratis
        </Link>
      </p>
    </>
  );
}
