import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 opacity-30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ background: 'var(--primary)' }}></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 opacity-30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ background: 'var(--primary)', animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 opacity-20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ background: 'var(--primary)', animationDelay: '0.5s' }}></div>
      
      {/* Content */}
      <div className="relative z-10 w-full px-4">
        <LoginForm />
      </div>
    </div>
  );
}
