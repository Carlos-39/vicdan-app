export function usePasswordStrength(password: string) {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  
  let label = "Débil";
  let color = "#ef4444"; // red-500

  if (strength >= 4) {
    label = "Fuerte";
    color = "#10b981"; // green-500
  } else if (strength >= 3) {
    label = "Media";
    color = "#f59e0b"; // yellow-400
  }

  return { strength: Math.min(strength, 5), label, color };
}
