import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white relative overflow-hidden py-4">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Bienvenido de nuevo</h1>
        <p className="text-gray-600">Inicia sesión en tu panel de control</p>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full px-4">
        <LoginForm />
      </div>
    </div>
  );
}
