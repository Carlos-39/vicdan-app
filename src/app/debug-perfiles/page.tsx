// src/app/debug-perfiles/page.tsx
import { supabaseAdmin } from '@/lib/supabase';

export default async function DebugPage() {
  const { data: perfiles, error } = await supabaseAdmin
    .from('perfiles')
    .select('id, nombre, estado, slug, fechas') // Usamos fechas en lugar de created_at
    .order('fechas', { ascending: false }) // Ordenamos por fechas
    .limit(10);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Perfiles en la BD</h1>
      <div className="space-y-2">
        {perfiles?.map((perfil) => (
          <div key={perfil.id} className="p-4 border rounded">
            <p><strong>ID:</strong> {perfil.id}</p>
            <p><strong>Nombre:</strong> {perfil.nombre}</p>
            <p><strong>Estado:</strong> {perfil.estado}</p>
            <p><strong>Fecha:</strong> {perfil.fechas}</p>
            <p><strong>Slug:</strong> {perfil.slug || 'No tiene'}</p>
            <div className="mt-2 space-x-2">
              <a 
                href={`/perfil/${perfil.id}`} 
                className="text-blue-500 underline"
                target="_blank"
              >
                Ver perfil público
              </a>
              <span className="text-gray-400">|</span>
              <a 
                href={`/dashboard/perfiles/${perfil.id}`} 
                className="text-green-500 underline"
                target="_blank"
              >
                Editar en dashboard
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}