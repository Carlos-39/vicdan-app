export function usePasswordStrength(password: string) {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  let label = "Débil";
  let color = "bg-red-500";

  if (strength >= 3) {
    label = "Media";
    color = "bg-yellow-400";
  }
  if (strength >= 4) {
    label = "Fuerte";
    color = "bg-green-500";
  }

  return { strength: Math.min(strength, 5), label, color };
}
